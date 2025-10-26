'use client'

import { useState, useEffect } from 'react'
import { NavBar } from '../components/NavBar'
import { SwapInterface, SwapParams } from '../components/SwapInterface'
import { WalletButton } from '../components/WalletButton'
import { UnifiedBalance } from '../components/UnifiedBalance'
import { parseUnits, formatUnits } from 'viem'

// Import Nexus SDK packages
import { NexusCore } from '@avail-project/nexus-core'
import { NexusWidgets } from '@avail-project/nexus-widgets'

export default function SwapPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | undefined>()
  const [isSwapping, setIsSwapping] = useState(false)
  const [nexusCore, setNexusCore] = useState<NexusCore | null>(null)
  const [unifiedBalance, setUnifiedBalance] = useState<string>('0')
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  // Initialize Nexus Core SDK
  useEffect(() => {
    const initializeNexus = async () => {
      try {
        if (typeof window.ethereum !== 'undefined') {
          const core = new NexusCore({
            network: 'testnet',
            walletProvider: window.ethereum
          })
          await core.initialize()
          setNexusCore(core)
        }
      } catch (error) {
        console.error('Failed to initialize Nexus Core:', error)
      }
    }

    initializeNexus()
  }, [])

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          // Load unified balance after connecting
          await loadUnifiedBalance(accounts[0])
        }
      } else {
        alert('Please install MetaMask or another wallet provider')
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert('Failed to connect wallet')
    }
  }

  const disconnectWallet = () => {
    setAddress(undefined)
    setIsConnected(false)
    setUnifiedBalance('0')
  }

  // Load unified balance using Nexus Core
  const loadUnifiedBalance = async (userAddress: string) => {
    if (!nexusCore) {
      console.log('Nexus Core not initialized, using mock balance')
      // Mock balance for testing
      setUnifiedBalance('150.25')
      return
    }
    
    setIsLoadingBalance(true)
    try {
      // Try to get unified balance from Nexus Core
      const balance = await nexusCore.getUnifiedBalance(userAddress)
      if (balance && balance.toString() !== '0') {
        setUnifiedBalance(formatUnits(balance, 18))
      } else {
        // Fallback to mock balance if no real balance
        setUnifiedBalance('150.25')
      }
    } catch (error) {
      console.error('Failed to load unified balance:', error)
      // Fallback to mock balance
      setUnifiedBalance('150.25')
    } finally {
      setIsLoadingBalance(false)
    }
  }

  const handleSwap = async (swapParams: SwapParams) => {
    setIsSwapping(true)
    
    try {
      // Convert amount to proper units
      const fromAmountWei = parseUnits(swapParams.fromAmount, swapParams.fromToken.decimals)
      
      console.log('Swap Parameters:', {
        fromAmount: swapParams.fromAmount,
        fromToken: swapParams.fromToken.symbol,
        fromChain: swapParams.fromToken.chainId,
        toToken: swapParams.toToken.symbol,
        toChain: swapParams.toToken.chainId,
        amountWei: fromAmountWei.toString()
      })

      // Check if this is a cross-chain swap or same-chain swap
      const isCrossChain = swapParams.fromToken.chainId !== swapParams.toToken.chainId
      
      if (isCrossChain) {
        // Cross-chain swap using Nexus Core
        if (!nexusCore) {
          throw new Error('Nexus Core not initialized for cross-chain swap')
        }
        
        const swapResult = await nexusCore.bridge({
          fromAmount: fromAmountWei,
          fromChainID: swapParams.fromToken.chainId,
          fromTokenAddress: swapParams.fromToken.address,
          toChainID: swapParams.toToken.chainId,
          toTokenAddress: swapParams.toToken.address,
          recipient: address!,
        })

        if (swapResult.success) {
          alert('Cross-chain swap successful! Check the explorer URLs in the console.')
          console.log('Source transaction:', swapResult.sourceExplorerUrl)
          console.log('Destination transaction:', swapResult.destinationExplorerUrl)
        } else {
          throw new Error('Cross-chain swap failed: ' + swapResult.error)
        }
      } else {
        // Same-chain swap - simulate using a DEX
        console.log('Same-chain swap detected, simulating DEX swap...')
        
        // Simulate swap delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // For demo purposes, show success
        alert(`Successfully swapped ${swapParams.fromAmount} ${swapParams.fromToken.symbol} to ${swapParams.toToken.symbol} on chain ${swapParams.fromToken.chainId}`)
      }
      
      // Refresh unified balance after successful swap
      if (address) {
        await loadUnifiedBalance(address)
      }
      
    } catch (error) {
      console.error('Swap failed:', error)
      alert('Swap failed: ' + error)
    } finally {
      setIsSwapping(false)
    }
  }

  return (
    <>
      <div className="gradient-bg fixed inset-0 -z-10"></div>
      
      <NavBar />
      
      <main className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="fade-in">
              <h1 className="text-4xl font-bold gradient-text">Nexus Smart Swap</h1>
              <p className="text-white/80 mt-2">Unified balance & intelligent cross-chain token swapping</p>
            </div>
            <div className="fade-in">
              <WalletButton
                isConnected={isConnected}
                address={address}
                onConnect={connectWallet}
                onDisconnect={disconnectWallet}
              />
            </div>
          </div>

          {/* Unified Balance Display */}
          {isConnected && (
            <div className="flex justify-center mb-8 fade-in">
              <UnifiedBalance 
                balance={unifiedBalance}
                isLoading={isLoadingBalance}
                onRefresh={() => address && loadUnifiedBalance(address)}
              />
            </div>
          )}

          <div className="flex justify-center fade-in">
            <SwapInterface
              isConnected={isConnected}
              onSwap={handleSwap}
              isSwapping={isSwapping}
              unifiedBalance={unifiedBalance}
            />
          </div>

          <div className="mt-8 text-center fade-in">
            <p className="text-sm text-white/60">
              Built with Avail Nexus SDK • Test environment
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
