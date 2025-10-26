'use client'

import React from 'react'
import { RefreshCw, Wallet, TrendingUp } from 'lucide-react'

interface UnifiedBalanceProps {
  balance: string
  isLoading: boolean
  onRefresh: () => void
}

export const UnifiedBalance: React.FC<UnifiedBalanceProps> = ({
  balance,
  isLoading,
  onRefresh,
}) => {
  return (
    <div className="glass-card rounded-2xl shadow-2xl p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Wallet className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Unified Balance</h3>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <span className="text-sm text-white/80">Total Value Across All Chains</span>
        </div>
        
        <div className="text-3xl font-bold text-white mb-1">
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Loading...</span>
            </div>
          ) : (
            `$${parseFloat(balance).toFixed(2)}`
          )}
        </div>
        
        <p className="text-sm text-white/60">
          Aggregated from Ethereum, Polygon, Arbitrum, Base, and more
        </p>
      </div>
    </div>
  )
}