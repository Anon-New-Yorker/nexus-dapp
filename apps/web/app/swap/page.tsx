'use client'

import { useState, useEffect } from 'react'
import { NavBar } from '../components/NavBar'
import { SwapInterface, SwapParams } from '../components/SwapInterface'
import { WalletButton } from '../components/WalletButton'
import { parseUnits } from 'viem'

// Import Nexus SDK
import { NexusSDK } from '@avail-project/nexus'

export default function SwapPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | undefined>()
  const [isSwapping, setIsSwapping] = useState(false)
  const [sdk, setSdk] = useState<NexusSDK | null>(null)

  // Initialize Nexus SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Check if we have a wallet provider
        if (typeof window.ethereum !== 'undefined') {
          const nexusSDK = new NexusSDK({ 
            network: 'testnet' // Using testnet for development
          })
          await nexusSDK.initialize(window.ethereum)
          setSdk(nexusSDK)
        }
      } catch (error) {
        console.error('Failed to initialize Nexus SDK:', error)
      }
    }

    initializeSDK()
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
  }

  const handleSwap = async (swapParams: SwapParams) => {
    if (!sdk) {
      alert('SDK not initialized')
      return
    }

    setIsSwapping(true)
    
    try {
      // Convert amount to proper units
      const fromAmountWei = parseUnits(swapParams.fromAmount, swapParams.fromToken.decimals)
      
      const swapResult = await sdk.swap({
        fromAmount: fromAmountWei,
        fromChainID: swapParams.fromToken.chainId,
        fromTokenAddress: swapParams.fromToken.address,
        toChainID: swapParams.toToken.chainId,
        toTokenAddress: swapParams.toToken.address,
      })

      if (swapResult.success) {
        alert('Swap successful! Check the explorer URLs in the console.')
        console.log('Source transaction:', swapResult.sourceExplorerUrl)
        console.log('Destination transaction:', swapResult.destinationExplorerUrl)
      } else {
        alert('Swap failed: ' + swapResult.error)
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
              <h1 className="text-4xl font-bold gradient-text">Nexus Swap Test</h1>
              <p className="text-white/80 mt-2">Test cross-chain token swapping with Avail Nexus SDK</p>
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

          <div className="flex justify-center fade-in">
            <SwapInterface
              isConnected={isConnected}
              onSwap={handleSwap}
              isSwapping={isSwapping}
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
