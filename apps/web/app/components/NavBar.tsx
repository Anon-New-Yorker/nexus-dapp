'use client'

import Link from 'next/link'
import { Zap, User, LogOut } from 'lucide-react'
import { useUser } from '../context/UserContext'
import { useAccount, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'

export function NavBar() {
  const { userRole, openLoginModal, setUserRole } = useUser()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      console.log('Starting logout process...')
      
      // Clear user role first
      setUserRole(null)
      console.log('User role cleared')
      
      // Disconnect Wagmi wallet if connected
      if (isConnected) {
        console.log('Disconnecting wallet...')
        disconnect()
      }
      
      // Force clear localStorage
      localStorage.removeItem('userRole')
      console.log('localStorage cleared')
      
      // Add a small delay to ensure state updates
      setTimeout(() => {
        console.log('Logout completed - refreshing page')
        window.location.reload()
      }, 500)
      
      console.log('Logout successful')
    } catch (error) {
      console.warn('Logout error:', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-lg opacity-50"></div>
            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="font-bold text-xl gradient-text">AgenticPay</span>
        </Link>
        
        <div className="flex items-center gap-8">
          <nav className="flex gap-8 text-sm font-medium">
            <Link href="/" className="text-zinc-400 hover:text-white transition-colors">Home</Link>
            <Link href="/pay" className="text-zinc-400 hover:text-white transition-colors">Pay</Link>
            <Link href="/swap" className="text-zinc-400 hover:text-white transition-colors">Swap</Link>
            <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">Dashboard</Link>
          </nav>

          {userRole ? (
            <div className="flex items-center gap-3">
              {userRole && (
                <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 font-medium">
                  {userRole === 'merchant' ? 'Merchant' : 'User'}
                </span>
              )}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <User className="w-4 h-4" />
                    <span className="font-mono text-xs">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all text-sm font-medium text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
    </div>
  )
}
