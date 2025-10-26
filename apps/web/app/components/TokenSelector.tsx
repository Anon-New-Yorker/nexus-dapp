'use client'

import React, { useState, useEffect, useRef } from 'react'

export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  chainId: number
  logoURI?: string
  isMerchantSettlement?: boolean
}

// Helper function to get chain name from chain ID
const getChainName = (chainId: number): string => {
  const chainNames: { [key: number]: string } = {
    1: 'Ethereum',
    11155111: 'Ethereum Sepolia',
    137: 'Polygon',
    80001: 'Polygon Mumbai',
    42161: 'Arbitrum',
    421614: 'Arbitrum Sepolia',
    10: 'Optimism',
    11155420: 'Optimism Sepolia',
    8453: 'Base',
    84532: 'Base Sepolia',
  }
  return chainNames[chainId] || `Chain ${chainId}`
}

interface TokenSelectorProps {
  tokens: Token[]
  selectedToken: Token | null
  onTokenSelect: (token: Token) => void
  label: string
  disabled?: boolean
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  tokens,
  selectedToken,
  onTokenSelect,
  label,
  disabled = false,
}) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleImageError = (tokenKey: string) => {
    setImageErrors(prev => new Set(prev).add(tokenKey))
  }

  const getTokenIcon = (token: Token) => {
    const tokenKey = `${token.chainId}-${token.address}`
    if (imageErrors.has(tokenKey) || !token.logoURI) {
      // Fallback to text-based icon
      return (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
          {token.symbol.slice(0, 2).toUpperCase()}
        </div>
      )
    }
    return (
      <img
        src={token.logoURI}
        alt={token.symbol}
        className="w-6 h-6 rounded-full"
        onError={() => handleImageError(tokenKey)}
      />
    )
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">{label}</label>
      <div className="relative" ref={dropdownRef}>
        <button
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 border border-white/30 rounded-lg bg-white/20 text-left focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-white/10 disabled:cursor-not-allowed text-white flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            {selectedToken ? (
              <>
                {getTokenIcon(selectedToken)}
                <div>
                  <div className="font-medium">{selectedToken.symbol}</div>
                  <div className="text-sm text-white/70">{selectedToken.name}</div>
                </div>
              </>
            ) : (
              <span className="text-white/60">Select token</span>
            )}
          </div>
          <div className="text-white/60">
            {isOpen ? '▲' : '▼'}
          </div>
        </button>
        
        {/* Token dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 glass-card border border-white/30 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {tokens.map((token) => (
            <button
              key={`${token.chainId}-${token.address}`}
              onClick={() => {
                onTokenSelect(token)
                setIsOpen(false)
              }}
              className={`w-full px-4 py-3 text-left hover:bg-white/20 flex items-center space-x-3 text-white ${
                token.isMerchantSettlement ? 'bg-green-500/20 border-l-4 border-green-400' : ''
              }`}
            >
              {getTokenIcon(token)}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{token.symbol}</span>
                  {token.isMerchantSettlement && (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                      Merchant
                    </span>
                  )}
                </div>
                <div className="text-sm text-white/70">
                  {token.name} • {getChainName(token.chainId)}
                </div>
              </div>
            </button>
          ))}
          </div>
        )}
      </div>
    </div>
  )
}
