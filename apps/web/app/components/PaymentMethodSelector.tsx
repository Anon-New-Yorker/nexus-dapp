'use client'

import { motion } from 'framer-motion'
import { Check, ExternalLink, Wallet } from 'lucide-react'
import { useAvail } from '../context/AvailContext'
import { useAccount } from 'wagmi'
import Image from 'next/image'

export function PaymentMethodSelector() {
  const { paymentMethods, selectedPaymentMethod, setSelectedPaymentMethod, isLoading } = useAvail()
  const { address } = useAccount()

  if (!address) {
    return (
      <div className="glass-card p-6 fade-in-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center border border-purple-500/30">
            <Wallet className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold">Payment Methods</h3>
            <p className="text-sm text-zinc-400">Connect wallet to view available methods</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-zinc-500">Please connect your wallet to view available payment methods</p>
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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center border border-purple-500/30">
          <Wallet className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold">Payment Methods</h3>
          <p className="text-sm text-zinc-400">Choose your preferred payment method</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-zinc-800/50 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedPaymentMethod?.id === method.id
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : 'border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600/50 hover:bg-zinc-700/30'
              }`}
              onClick={() => setSelectedPaymentMethod(method)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/10 flex items-center justify-center">
                    {method.logoUrl ? (
                      <Image
                        src={method.logoUrl}
                        alt={method.symbol}
                        width={20}
                        height={20}
                        className="rounded"
                      />
                    ) : (
                      <span className="text-xs font-bold text-blue-400">{method.symbol}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-zinc-400">{method.network}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold">${method.balance}</div>
                    <div className="text-xs text-zinc-400">{method.symbol}</div>
                  </div>
                  
                  {selectedPaymentMethod?.id === method.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
              </div>
              
                  <div className="mt-2 text-xs text-zinc-500 font-mono">
                    {method.address.slice(0, 6)}...{method.address.slice(-4)}
                  </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedPaymentMethod && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
        >
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <Check className="w-4 h-4" />
            <span>Selected: {selectedPaymentMethod.name}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
