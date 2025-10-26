'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, MessageSquare, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useAvail } from '../context/AvailContext'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { toast } from 'sonner'
import { parseUnits, formatUnits } from 'viem'

interface AgenticPaymentProps {
  onPaymentComplete?: (txHash: string) => void
  onReset?: () => void
}

function AgenticPaymentInner({ onPaymentComplete, onReset }: AgenticPaymentProps) {
  const { address } = useAccount()
  const { unifiedBalance, paymentMethods, selectedPaymentMethod, refreshBalances } = useAvail()
  const [message, setMessage] = useState('0x76520dB38f6Dd54a5c8F10a9EB130b8171A1715d 5 USDC on base')
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'input' | 'processing' | 'success' | 'error'>('input')
  const [transactionStartTime, setTransactionStartTime] = useState<number | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [showTransactionHash, setShowTransactionHash] = useState(false)

  // USDC contract address on Base Sepolia Testnet
  const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'

  const { writeContract, isPending: isWritePending, data: writeData } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: txError } = useWaitForTransactionReceipt({
    hash: writeData,
  })

  const parseMessage = (message: string) => {
    // Parse message like "0x76520dB38f6Dd54a5c8F10a9EB130b8171A1715d 5 USDC on base"
    const regex = /(0x[a-fA-F0-9]{40})\s+(\d+(?:\.\d+)?)\s+(USDC|ETH|USDT)\s+on\s+(base|optimism|arbitrum|polygon)/i
    const match = message.match(regex)

    if (!match) {
      throw new Error('Invalid message format. Use: "0x... 5 USDC on base"')
    }

    return {
      recipient: match[1],
      amount: parseFloat(match[2]),
      token: match[3].toUpperCase(),
      network: match[4].toLowerCase()
    }
  }

  const checkBalance = (requiredAmount: number, token: string, network: string) => {
    // Check if we have the exact token and network
    const exactMethod = paymentMethods.find(method =>
      method.symbol === token && method.network.toLowerCase() === network
    )

    if (exactMethod) {
      const availableBalance = parseFloat(exactMethod.balance.replace(/,/g, ''))
      if (availableBalance >= requiredAmount) {
        return exactMethod
      }
    }

    // If no exact match or insufficient balance, check if we have ETH that can be swapped
    const ethMethod = paymentMethods.find(method =>
      method.symbol === 'ETH'
    )

    if (ethMethod) {
      const ethBalance = parseFloat(ethMethod.balance.replace(/,/g, ''))
      const ethValueInUsd = ethBalance * 3000 // ETH to USD conversion (Base Sepolia testnet price)

      if (ethValueInUsd >= requiredAmount) {
        // Simulate having the required token after swap
        return {
          id: `${token.toLowerCase()}-${network}`,
          name: `${token} on ${network}`,
          symbol: token,
          network: network,
          balance: requiredAmount.toString(),
          address: '0x0000000000000000000000000000000000000000',
          decimals: 6,
          logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
        }
      }
    }

    throw new Error(`Insufficient balance. Required: $${requiredAmount}, Available: $${unifiedBalance}`)
  }

  const findSwapMethod = (requiredAmount: number, targetToken: string, targetNetwork: string) => {
    // Look for ETH that can be swapped to the target token
    const ethMethod = paymentMethods.find(method =>
      method.symbol === 'ETH'
    )

    if (ethMethod) {
      const ethBalance = parseFloat(ethMethod.balance.replace(/,/g, ''))
      const ethValueInUsd = ethBalance * 3000 // ETH to USD conversion (Base Sepolia testnet price)

      if (ethValueInUsd >= requiredAmount) {
        return ethMethod
      }
    }

    // If no ETH available, look for any alternative tokens
    const alternativeMethods = paymentMethods.filter(method =>
      method.symbol !== targetToken
    )

    if (alternativeMethods.length === 0) {
      throw new Error(`No tokens available for swapping to ${targetToken}`)
    }

    // Return the first available alternative token
    return alternativeMethods[0]
  }

  const processPayment = async () => {
    if (!message.trim()) {
      toast.error('Please enter a payment message')
      return
    }

    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    setIsProcessing(true)
    setStep('processing')

    try {
      // Parse the message
      const { recipient, amount, token, network } = parseMessage(message)

      console.log('Processing payment:', { recipient, amount, token, network })

      // Check if user has the required token
      let paymentMethod
      try {
        paymentMethod = checkBalance(amount, token, network)
        console.log('Found payment method:', paymentMethod)

        // Validate that user actually has the required token balance
        if (paymentMethod.symbol !== token) {
          throw new Error(`You don't have ${token} tokens. Please get some ${token} first.`)
        }

        const availableBalance = parseFloat(paymentMethod.balance.replace(/,/g, ''))
        if (availableBalance < amount) {
          throw new Error(`Insufficient ${token} balance. You have ${availableBalance} ${token}, need ${amount} ${token}`)
        }

      } catch (error) {
        console.log('Balance check failed:', error)
        throw new Error(`Cannot process payment: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      // Execute real USDC transfer
      if (token === 'USDC' && network === 'base') {
        toast.info(`Sending ${amount} USDC to ${recipient}...`)

        // Convert amount to wei (USDC has 6 decimals)
        const amountInWei = parseUnits(amount.toString(), 6)

        // Execute the transfer
        try {
          console.log('🚀 Submitting USDC transfer:', {
            to: recipient,
            amount: amountInWei.toString(),
            contract: USDC_ADDRESS,
            userAddress: address
          })

          await writeContract({
            address: USDC_ADDRESS as `0x${string}`,
            abi: [
              {
                name: 'transfer',
                type: 'function',
                stateMutability: 'nonpayable',
                inputs: [
                  { name: 'to', type: 'address' },
                  { name: 'amount', type: 'uint256' }
                ],
                outputs: [{ name: '', type: 'bool' }]
              }
            ],
            functionName: 'transfer',
            args: [recipient as `0x${string}`, amountInWei],
          })

          console.log('✅ Transaction submitted successfully - waiting for hash from useWriteContract')
          setShowTransactionHash(true)

        } catch (writeError) {
          console.error('❌ Failed to submit transaction:', writeError)

          // Provide more specific error messages
          if (writeError instanceof Error) {
            if (writeError.message.includes('insufficient funds')) {
              throw new Error('Insufficient USDC balance for this transaction')
            } else if (writeError.message.includes('user rejected')) {
              throw new Error('Transaction was rejected by user')
            } else if (writeError.message.includes('gas')) {
              throw new Error('Transaction failed due to gas issues')
            } else {
              throw new Error(`Transaction failed: ${writeError.message}`)
            }
          } else {
            throw new Error('Transaction submission failed: Unknown error')
          }
        }

      } else {
        // For non-USDC tokens or other networks, show error
        throw new Error(`Payment method ${token} on ${network} is not supported yet. Please use USDC on Base.`)
      }

    } catch (error) {
      console.error('Payment processing error:', error)
      setStep('error')
      toast.error(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle transaction confirmation
  useEffect(() => {
    console.log('🔄 Transaction confirmation effect:', {
      isConfirmed,
      writeData,
      isConfirming,
      txError,
      isWritePending,
      step
    })

    if (isConfirmed && writeData) {
      console.log('✅ Transaction confirmed! Moving to success state')

      // Transaction confirmed - show success immediately
      setStep('success')
      setIsProcessing(false)
      toast.success(`Payment successful! Transaction: ${writeData}`)

      // Don't update UI directly - let natural refresh cycle handle it
      console.log('Transaction confirmed - UI will update on next natural refresh')

      if (onPaymentComplete) {
        onPaymentComplete(writeData)
      }

    } else if (txError && writeData) {
      console.error('❌ Transaction failed:', txError)

      // Transaction failed - user rejected or error occurred
      setStep('error')
      setIsProcessing(false)
      toast.error(`Transaction failed: ${txError.message}`)
    } else if (writeData && !isConfirming && !isConfirmed && !txError) {
      console.log('⏳ Transaction submitted but not yet confirmed:', writeData)

      // Fallback timeout to prevent endless waiting (5 minutes)
      if (transactionStartTime && Date.now() - transactionStartTime > 300000) {
        console.warn('⚠️ Transaction timeout - taking too long to confirm')
        setStep('error')
        setIsProcessing(false)
        toast.error('Transaction is taking too long to confirm. Please check your wallet and try again.')
      }
    }
  }, [isConfirmed, writeData, isConfirming, txError, isWritePending, step, onPaymentComplete, transactionStartTime, showTransactionHash])

  // Real transaction processing - no fake agent updates

  // No timeout cleanup needed - we wait indefinitely for user consent

  const resetForm = () => {
    console.log('🔄 Resetting form for new payment')
    console.log('Current state before reset:', { step, writeData, showTransactionHash, formKey })

    // Call the parent reset function to completely remount the component
    if (onReset) {
      onReset()
    } else {
      // Fallback to local reset
      setMessage('')
      setStep('input')
      setIsProcessing(false)
      setTransactionStartTime(null)
      setShowTransactionHash(false)
      setFormKey(prev => prev + 1)
    }

    console.log('✅ Form reset complete')
  }

  if (!address) {
    return (
      <div className="glass-card p-6 fade-in-up">
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Agentic Payments</h3>
          <p className="text-zinc-400 mb-4">Connect your wallet to send payments with natural language</p>
          <p className="text-sm text-zinc-500">Example: "0x76520dB38f6Dd54a5c8F10a9EB130b8171A1715d 5 USDC on base"</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      key={formKey}
      className="glass-card p-6 fade-in-up"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center border border-purple-500/30">
          <MessageSquare className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Agentic Payments</h3>
          <p className="text-sm text-zinc-400">Send payments using natural language</p>
        </div>
      </div>

      {step === 'input' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Payment Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="0x76520dB38f6Dd54a5c8F10a9EB130b8171A1715d 5 USDC on base"
              className="w-full p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-colors"
              rows={3}
            />
            <p className="text-xs text-zinc-500 mt-1">
              Format: "recipient_address amount token on network"
            </p>
          </div>

          <div className="bg-zinc-800/30 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2">Available Balance</h4>
            <p className="text-2xl font-bold gradient-text">${unifiedBalance}</p>
            <p className="text-xs text-zinc-400">Unified balance across all networks</p>
          </div>

          <button
            onClick={processPayment}
            disabled={!message.trim() || isProcessing}
            className="w-full glow-button py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Payment
              </>
            )}
          </button>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isWritePending ? 'Submitting Transaction...' : isConfirming ? 'Confirming Transaction...' : 'Processing Payment...'}
          </h3>
          <p className="text-zinc-400">
            {isWritePending ? 'Please confirm the transaction in your wallet' :
              isConfirming ? 'Waiting for blockchain confirmation...' :
                'Processing your payment...'}
          </p>
          {writeData && showTransactionHash && step === 'processing' && (
            <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
              <p className="text-sm text-zinc-400">Transaction Hash:</p>
              <p className="text-xs font-mono text-blue-400 break-all">{writeData}</p>
            </div>
          )}
          <div className="mt-6 space-y-3">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-blue-400">
                🔄 Agent is monitoring your transaction in real-time...
              </p>
              <p className="text-xs text-blue-300 mt-1">
                The agent will automatically detect when your transaction is confirmed or fails.
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-green-400">Payment Successful!</h3>
          <p className="text-zinc-400 mb-4">Your payment has been processed and sent.</p>
          <p className="text-xs text-zinc-500 mb-4">
            Your wallet balance will update automatically on the next refresh.
          </p>
          <button
            onClick={resetForm}
            className="glow-button px-6 py-2 rounded-lg font-semibold"
          >
            Send Another Payment
          </button>
        </div>
      )}

      {step === 'error' && (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-red-400">Payment Failed</h3>
          <p className="text-zinc-400 mb-4">There was an error processing your payment.</p>
          <button
            onClick={resetForm}
            className="glow-button px-6 py-2 rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      )}
    </motion.div>
  )
}

export function AgenticPayment({ onPaymentComplete }: AgenticPaymentProps) {
  const [resetKey, setResetKey] = useState(0)

  const handleReset = () => {
    console.log('🔄 Forcing complete component reset')
    setResetKey(prev => prev + 1)
  }

  return (
    <AgenticPaymentInner
      key={resetKey}
      onPaymentComplete={onPaymentComplete}
      onReset={handleReset}
    />
  )
}
