'use client'

import React, { useState } from 'react'
import { TokenSelector, Token } from './TokenSelector'
import { ArrowUpDown, Loader2 } from 'lucide-react'

interface SwapInterfaceProps {
  isConnected: boolean
  onSwap: (swapParams: SwapParams) => Promise<void>
  isSwapping: boolean
  unifiedBalance: string
}

export interface SwapParams {
  fromAmount: string
  fromToken: Token
  toToken: Token
}

export const SwapInterface: React.FC<SwapInterfaceProps> = ({
  isConnected,
  onSwap,
  isSwapping,
  unifiedBalance,
}) => {
  const [fromAmount, setFromAmount] = useState('')
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)

  // Enhanced token list with multiple chains and proper testnet addresses
  const sampleTokens: Token[] = [
    // Base Sepolia Testnet - Primary settlement token for merchants
    {
      address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 84532, // Base Sepolia
      logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86a33E6441c8C06Cdd435c38c5c4aBa3E2B/logo.png',
      isMerchantSettlement: true,
    },
    {
      address: '0x4200000000000000000000000000000000000006', // Base Sepolia WETH
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 84532, // Base Sepolia
      logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    },
    // Ethereum Sepolia Testnet
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 11155111, // Ethereum Sepolia
      logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    },
    {
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Ethereum Sepolia USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 11155111, // Ethereum Sepolia
      logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86a33E6441c8C06Cdd435c38c5c4aBa3E2B/logo.png',
    },
    // Polygon Mumbai Testnet
    {
      address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889', // Polygon Mumbai WMATIC
      symbol: 'WMATIC',
      name: 'Wrapped Matic',
      decimals: 18,
      chainId: 80001, // Polygon Mumbai
      logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
    },
    {
      address: '0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e', // Polygon Mumbai USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 80001, // Polygon Mumbai
      logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86a33E6441c8C06Cdd435c38c5c4aBa3E2B/logo.png',
    },
    // Arbitrum Sepolia Testnet
    {
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 421614, // Arbitrum Sepolia
      logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    },
    {
      address: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 421614, // Arbitrum Sepolia
      logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86a33E6441c8C06Cdd435c38c5c4aBa3E2B/logo.png',
    },
    // Optimism Sepolia Testnet
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 11155420, // Optimism Sepolia
      logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    },
    {
      address: '0x5fd84259d66Cd46123540766Be93DFE2D8a6d5C5', // Optimism Sepolia USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 11155420, // Optimism Sepolia
      logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86a33E6441c8C06Cdd435c38c5c4aBa3E2B/logo.png',
    },
  ]

  // Smart swap logic for merchant settlement
  const handleSmartSwap = async () => {
    if (!fromAmount || !fromToken || !toToken) {
      alert('Please fill in all fields')
      return
    }

    // Check if this is a merchant settlement (always settle in Base Sepolia USDC)
    const isMerchantSettlement = toToken.chainId === 84532 && toToken.symbol === 'USDC'
    
    if (isMerchantSettlement) {
      // Show merchant settlement confirmation
      const confirmMessage = `You're about to settle $${fromAmount} in USDC on Base for merchant payment. This will automatically swap from your available tokens if needed. Continue?`
      if (!confirm(confirmMessage)) return
    }

    try {
      await onSwap({
        fromAmount,
        fromToken,
        toToken,
      })
    } catch (error) {
      console.error('Swap failed:', error)
    }
  }

  // Auto-suggest Base Sepolia USDC for merchant settlement
  const suggestMerchantSettlement = () => {
    const baseUSDC = sampleTokens.find(token => 
      token.chainId === 84532 && token.symbol === 'USDC'
    )
    if (baseUSDC) {
      setToToken(baseUSDC)
    }
  }

  const swapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
  }

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-white/80">Please connect your wallet to start swapping</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto glass-card rounded-2xl shadow-2xl p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Smart Swap</h2>
        <p className="text-white/80">Intelligent cross-chain token swapping</p>
        <div className="mt-2 text-sm text-white/60">
          Unified Balance: ${parseFloat(unifiedBalance).toFixed(2)}
        </div>
      </div>

      {/* Merchant Settlement Quick Action */}
      <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Merchant Settlement</h3>
            <p className="text-xs text-white/80">Quick settle in Base USDC</p>
          </div>
          <button
            onClick={suggestMerchantSettlement}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
          >
            Use Base USDC
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            From
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-white/60"
            />
            <TokenSelector
              tokens={sampleTokens}
              selectedToken={fromToken}
              onTokenSelect={setFromToken}
              label=""
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={swapTokens}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowUpDown className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            To
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="0.0"
              disabled
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white/60"
            />
            <TokenSelector
              tokens={sampleTokens}
              selectedToken={toToken}
              onTokenSelect={setToToken}
              label=""
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSmartSwap}
        disabled={!fromAmount || !fromToken || !toToken || isSwapping}
        className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {isSwapping ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Swapping...</span>
          </>
        ) : (
          <span>
            {toToken?.chainId === 84532 && toToken?.symbol === 'USDC' 
              ? 'Settle for Merchant' 
              : 'Smart Swap'
            }
          </span>
        )}
      </button>

      {/* Smart Swap Info */}
      {toToken?.chainId === 84532 && toToken?.symbol === 'USDC' && (
        <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-white/90">Merchant Settlement Mode</span>
          </div>
          <p className="text-xs text-white/70 mt-1">
            This will settle in Base USDC for merchant payment
          </p>
        </div>
      )}
    </div>
  )
}
