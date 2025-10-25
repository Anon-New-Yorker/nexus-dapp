'use client'

import { useState, useEffect } from 'react'
import { X, Wallet, Store, User, ArrowRight } from 'lucide-react'
import { useUser } from '../context/UserContext'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, setUserRole } = useUser()
  const { address, isConnected } = useAccount()
  const [isConnecting, setIsConnecting] = useState(false)

  // Handle wallet connection success
  useEffect(() => {
    if (isConnected && address) {
      setIsConnecting(false)
      // Set default role as 'user' for direct connection
      setUserRole('user')
      closeLoginModal()
    }
  }, [isConnected, address, setUserRole, closeLoginModal])

  if (!isLoginModalOpen) return null

  const handleMerchantAuth = () => {
    // Set merchant role and close modal
    setUserRole('merchant')
    closeLoginModal()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={closeLoginModal}
      />
      
      <div className="relative w-full max-w-2xl glass-card p-8 animate-in fade-in-up">
        <button
          onClick={closeLoginModal}
          className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Welcome to AgenticPay</span>
          </h2>
          <p className="text-zinc-400">Connect your wallet to get started</p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          {/* Direct Wallet Connection */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/10 flex items-center justify-center border border-blue-500/30">
                <Wallet className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Connect Wallet</h3>
                <p className="text-sm text-zinc-400">Start with personal account</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-zinc-400 mb-4">
                  Connect your wallet to access cross-chain payments
                </p>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </div>
              
              {isConnected && (
                <div className="text-center">
                  <div className="mb-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-400">✓ Wallet Connected Successfully</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Merchant Authentication Link */}
          <div className="glass-card p-6 border border-orange-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/10 flex items-center justify-center border border-orange-500/30">
                <Store className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold">Merchant Account</h3>
                <p className="text-sm text-zinc-400">Advanced analytics & business features</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="text-sm text-zinc-400 mb-4">
                Access merchant dashboard with advanced payment analytics, business insights, and cross-chain transaction tracking.
              </div>
              
              <button
                onClick={handleMerchantAuth}
                className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold inline-flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4" />
                Authenticate as Merchant
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-blue-400">Personal</span>
              </div>
              <ul className="text-xs text-zinc-400 space-y-1">
                <li>• Cross-chain payments</li>
                <li>• Transaction history</li>
                <li>• Balance tracking</li>
              </ul>
            </div>
            
            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-4 h-4 text-orange-400" />
                <span className="font-semibold text-orange-400">Merchant</span>
              </div>
              <ul className="text-xs text-zinc-400 space-y-1">
                <li>• Business analytics</li>
                <li>• Revenue tracking</li>
                <li>• AI insights</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}