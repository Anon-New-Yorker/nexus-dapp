'use client'

import React, { useState } from 'react'
import { TokenSelector, Token } from './TokenSelector'
import { ArrowUpDown, Loader2 } from 'lucide-react'

interface SwapInterfaceProps {
  isConnected: boolean
  onSwap: (swapParams: SwapParams) => Promise<void>
  isSwapping: boolean
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
}) => {
  const [fromAmount, setFromAmount] = useState('')
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)

  // Sample tokens for testing
  const sampleTokens: Token[] = [
    {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 137, // Polygon
      logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    },
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 1, // Ethereum
      logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    },
    {
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 42161, // Arbitrum
      logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 10, // Optimism
      logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    },
  ]

  const handleSwap = async () => {
    if (!fromAmount || !fromToken || !toToken) {
      alert('Please fill in all fields')
      return
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
        <h2 className="text-2xl font-bold text-white">Nexus Swap</h2>
        <p className="text-white/80">Cross-chain token swapping made simple</p>
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
        onClick={handleSwap}
        disabled={!fromAmount || !fromToken || !toToken || isSwapping}
        className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {isSwapping ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Swapping...</span>
          </>
        ) : (
          <span>Swap</span>
        )}
      </button>
    </div>
  )
}
