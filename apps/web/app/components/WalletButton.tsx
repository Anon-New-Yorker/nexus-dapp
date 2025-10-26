'use client'

import React from 'react'

interface WalletButtonProps {
  isConnected: boolean
  address?: string
  onConnect: () => void
  onDisconnect: () => void
}

export const WalletButton: React.FC<WalletButtonProps> = ({
  isConnected,
  address,
  onConnect,
  onDisconnect,
}) => {
  if (isConnected && address) {
    return (
      <button
        onClick={onDisconnect}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Disconnect ({address.slice(0, 6)}...{address.slice(-4)})
      </button>
    )
  }

  return (
    <button
      onClick={onConnect}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      Connect Wallet
    </button>
  )
}
