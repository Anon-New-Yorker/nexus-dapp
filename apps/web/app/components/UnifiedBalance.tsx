'use client'

import { motion } from 'framer-motion'
import { Wallet, RefreshCw, AlertCircle, RotateCcw } from 'lucide-react'
import { useAvail } from '../context/AvailContext'
import { useAccount } from 'wagmi'
import { useState } from 'react'

export function UnifiedBalance() {
  const { unifiedBalance, isLoading, error, refreshBalances } = useAvail()
  const { address } = useAccount()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshBalances()
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Error refreshing balance:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!address) {
    return (
      <div className="glass-card p-6 fade-in-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/10 flex items-center justify-center border border-blue-500/30">
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold">Unified Balance</h3>
            <p className="text-sm text-zinc-400">Connect wallet to view balances</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-zinc-500">Please connect your wallet to view your unified balance across all networks</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="glass-card p-6 fade-in-up"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/10 flex items-center justify-center border border-blue-500/30">
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold">Unified Balance</h3>
            <p className="text-sm text-zinc-400">Across all networks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="px-3 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 transition-colors disabled:opacity-50 text-sm font-semibold"
            title="Force refresh balance from blockchain"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Refresh Balance
              </>
            )}
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center">
            <motion.div 
              className="text-4xl font-bold gradient-text"
              key={unifiedBalance}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              ${unifiedBalance}
            </motion.div>
            <p className="text-sm text-zinc-400 mt-1">Total USDC across all networks</p>
            {lastRefresh && (
              <p className="text-xs text-zinc-500 mt-1">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            )}
            {/* Debug info */}
            <div className="mt-2 p-2 bg-zinc-800/50 rounded text-xs text-zinc-500">
              <div>Debug: Address: {address?.slice(0, 6)}...{address?.slice(-4)}</div>
              <div>Balance: {unifiedBalance}</div>
              <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              <span className="ml-2 text-sm text-zinc-400">Loading balances...</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
