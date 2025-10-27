'use client'

import React from 'react'

export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  chainId: number
  logoURI?: string
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
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">{label}</label>
      <div className="relative">
        <button
          disabled={disabled}
          className="w-full px-4 py-3 border border-white/30 rounded-lg bg-white/20 text-left focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-white/10 disabled:cursor-not-allowed text-white"
        >
          {selectedToken ? (
            <div className="flex items-center space-x-3">
              {selectedToken.logoURI && (
                <img
                  src={selectedToken.logoURI}
                  alt={selectedToken.symbol}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <div>
                <div className="font-medium">{selectedToken.symbol}</div>
                <div className="text-sm text-white/70">{selectedToken.name}</div>
              </div>
            </div>
          ) : (
            <span className="text-white/60">Select token</span>
          )}
        </button>
        
        {/* Token dropdown would go here - simplified for now */}
        <div className="absolute top-full left-0 right-0 mt-1 glass-card border border-white/30 rounded-lg shadow-lg z-10">
          {tokens.map((token) => (
            <button
              key={`${token.chainId}-${token.address}`}
              onClick={() => onTokenSelect(token)}
              className="w-full px-4 py-3 text-left hover:bg-white/20 flex items-center space-x-3 text-white"
            >
              {token.logoURI && (
                <img
                  src={token.logoURI}
                  alt={token.symbol}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <div>
                <div className="font-medium">{token.symbol}</div>
                <div className="text-sm text-white/70">{token.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
