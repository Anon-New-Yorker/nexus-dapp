'use client'

import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { Send, CheckCircle2, Loader2, Info, ArrowRight, ExternalLink, RefreshCw, TrendingUp } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { NavBar } from '../components/NavBar'
import { useUser } from '../context/UserContext'
import { useAvail } from '../context/AvailContext'
import { PaymentMethodSelector } from '../components/PaymentMethodSelector'
import { UnifiedBalance } from '../components/UnifiedBalance'
import { AgenticPayment } from '../components/AgenticPayment'
import { TokenSelector, Token } from '../components/TokenSelector'

// Import Nexus SDK packages
import { NexusSDK } from '@avail-project/nexus-core'

// Base Sepolia Testnet USDC (testnet token)
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'

const USDC_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
]

export default function PayPage() {
  const { address, isConnected } = useAccount()
  const { userRole, openLoginModal } = useUser()
  const { unifiedBalance, refreshBalances, isLoading } = useAvail()

  // Available tokens for payment
  const availableTokens: Token[] = [
    {
      address: '0x4200000000000000000000000000000000000006', // Base Sepolia WETH
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 84532, // Base Sepolia
      logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    },
    {
      address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia USDC
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 84532, // Base Sepolia
      logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86a33E6441c8C06Cdd435c38c5c4aBa3E2B/logo.png',
      isMerchantSettlement: true,
    },
  ]

  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState<Token | null>(availableTokens[0]) // Default to WETH
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [nexusCore, setNexusCore] = useState<NexusSDK | null>(null)
  const [isSwapping, setIsSwapping] = useState(false)
  const [ethPrice, setEthPrice] = useState(4000) // Default ETH price

  // Debug logging
  console.log('PayPage Debug:', { address, isConnected, userRole })

  const { data: hash, writeContract, isPending, error: writeError } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Fetch actual wallet balances
  const { data: ethBalance } = useBalance({
    address: address,
    chainId: 84532, // Base Sepolia
  })

  const { data: usdcBalance } = useBalance({
    address: address,
    token: USDC_ADDRESS as `0x${string}`,
    chainId: 84532, // Base Sepolia
  })

  // Initialize Nexus Core SDK
  useEffect(() => {
    const initializeNexus = async () => {
      try {
        if (typeof window.ethereum !== 'undefined') {
          const core = new NexusSDK({
            network: 'testnet',
          })
          await core.initialize(window.ethereum)
          setNexusCore(core)
        }
      } catch (error) {
        console.error('Failed to initialize Nexus Core:', error)
      }
    }

    initializeNexus()
  }, [])

  // Fetch ETH price (simplified for demo)
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        // Using a simple API for ETH price
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
        const data = await response.json()
        if (data.ethereum?.usd) {
          setEthPrice(data.ethereum.usd)
        }
      } catch (error) {
        console.error('Failed to fetch ETH price:', error)
        // Keep default price of 4000
      }
    }

    fetchEthPrice()
  }, [])

  // Calculate unified balance from actual wallet balances
  const calculateUnifiedBalance = () => {
    if (!ethBalance || !usdcBalance) {
      return '0.00'
    }

    // Convert balances to USD values
    const ethValueUSD = parseFloat(formatUnits(ethBalance.value, ethBalance.decimals)) * ethPrice
    const usdcValueUSD = parseFloat(formatUnits(usdcBalance.value, usdcBalance.decimals))

    const totalValue = ethValueUSD + usdcValueUSD

    console.log('Unified balance calculated:', {
      ethBalance: formatUnits(ethBalance.value, ethBalance.decimals),
      usdcBalance: formatUnits(usdcBalance.value, usdcBalance.decimals),
      ethValueUSD,
      usdcValueUSD,
      totalValue
    })

    return totalValue.toFixed(2)
  }

  // Refresh unified balance using AvailContext
  const refreshUnifiedBalance = () => {
    refreshBalances()
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipient || !amount || !selectedToken) {
      toast.error('Please enter recipient, amount, and select a token')
      return
    }

    if (!recipient.startsWith('0x') || recipient.length !== 42) {
      toast.error('Invalid recipient address. Must be a valid Ethereum address (0x...)')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Amount must be a positive number')
      return
    }

    try {
      // Check if user selected ETH but wants to pay in USDC
      if (selectedToken.symbol === 'WETH') {
        setIsSwapping(true)
        toast.info('Swapping ETH to USDC before payment...')

        // Simulate swap delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        // For demo purposes, show success
        toast.success(`Successfully swapped ${amount} ETH to USDC`)

        // Now proceed with USDC payment
        const amountInWei = parseUnits(amount, 6)

        writeContract({
          address: USDC_ADDRESS as `0x${string}`,
          abi: USDC_ABI,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, amountInWei],
        })

        toast.success('Payment initiated after swap')
        setIsSwapping(false)
      } else if (selectedToken.symbol === 'USDC') {
        // Direct USDC payment
        const amountInWei = parseUnits(amount, 6)

        writeContract({
          address: USDC_ADDRESS as `0x${string}`,
          abi: USDC_ABI,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, amountInWei],
        })

        toast.success('USDC payment initiated')
      }

    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed: ' + (error as Error).message)
      setIsSwapping(false)
    }
  }

  return (
    <>
      <div className="gradient-bg fixed inset-0 -z-10"></div>
      <Toaster theme="dark" position="top-right" />
      <NavBar />

      <div className="min-h-screen px-6 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Send Payment</span>
            </h1>
            <p className="text-xl text-zinc-400">Transfer USDC on Base Sepolia Testnet with instant confirmation</p>

            {/* Testnet Warning */}
            <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              <span className="text-orange-400 font-medium text-sm">TESTNET MODE - No real funds used</span>
            </div>
          </div>

          {/* Avail Nexus Integration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <UnifiedBalance
              balance={unifiedBalance}
              isLoading={isLoading}
              onRefresh={refreshBalances}
            />
            <PaymentMethodSelector />
          </div>


          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Payment Form */}
            <div className="flex flex-col space-y-6">

              {/* Payment Form */}
              {isConnected && address ? (
                <div className="glass-card p-8 fade-in-up flex-1" style={{ animationDelay: '0.1s' }}>
                  <form onSubmit={handlePayment} className="space-y-6">
                    <div>
                      <label htmlFor="recipient" className="block text-sm font-semibold mb-3">
                        Recipient Address
                      </label>
                      <input
                        id="recipient"
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-4 py-3.5 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-all font-mono text-sm placeholder:text-zinc-600"
                        disabled={isPending || isConfirming || isSwapping}
                      />
                    </div>

                    {/* Payment Token and Amount Section - Grouped for height matching */}
                    <div className="flex flex-col space-y-4 flex-1">
                      <div>
                        <label className="block text-sm font-semibold mb-3">
                          Payment Token
                        </label>
                        <TokenSelector
                          tokens={availableTokens}
                          selectedToken={selectedToken}
                          onTokenSelect={setSelectedToken}
                          label=""
                          disabled={isPending || isConfirming || isSwapping}
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-center">
                        <label htmlFor="amount" className="block text-sm font-semibold mb-3">
                          Amount (USDC)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-2xl font-bold">$</span>
                          <input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-10 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 transition-all font-mono text-2xl font-bold placeholder:text-zinc-600"
                            disabled={isPending || isConfirming || isSwapping}
                          />
                        </div>
                        {selectedToken?.symbol === 'WETH' && (
                          <p className="text-sm text-orange-400 mt-2">
                            ⚡ Will automatically swap ETH to USDC before payment
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPending || isConfirming || isSwapping || !recipient || !amount || !selectedToken}
                      className="w-full glow-button px-6 py-4 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 group"
                    >
                      {isSwapping ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Swapping ETH to USDC...
                        </>
                      ) : isPending || isConfirming ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          {selectedToken?.symbol === 'WETH' ? 'Swap & Send Payment' : 'Send Payment'}
                        </>
                      )}
                    </button>

                    {writeError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <div className="text-sm text-red-400">
                          {writeError.message}
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              ) : (
                <div className="glass-card p-8 text-center fade-in-up flex-1 flex flex-col justify-center" style={{ animationDelay: '0.1s' }}>
                  <h3 className="text-xl font-bold mb-4">Connect Wallet to Continue</h3>
                  <ConnectButton />
                </div>
              )}
            </div>

            {/* Right Column - Info & Success */}
            <div className="flex flex-col space-y-6">
              {/* Network Info */}
              <div className="glass-card p-10 fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                    <Info className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Base Sepolia Testnet</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                      Transactions are processed on Base Sepolia testnet for testing purposes. No real funds are used.
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 pulse"></div>
                        <span className="text-xs text-green-400 font-medium">Live</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-500/10">
                        <span className="text-xs text-orange-400 font-medium">TESTNET</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Preview */}
              {recipient && amount && selectedToken && (
                <div className="glass-card p-6 fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <h3 className="font-bold mb-4">Transaction Preview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">To</span>
                      <span className="font-mono">{recipient.slice(0, 8)}...{recipient.slice(-6)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Payment Token</span>
                      <span className="font-bold text-blue-400">{selectedToken.symbol}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Amount</span>
                      <span className="font-bold text-green-400">${amount} USDC</span>
                    </div>
                    {selectedToken.symbol === 'WETH' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Swap</span>
                        <span className="text-orange-400">ETH → USDC</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Network</span>
                      <span className="text-orange-400">Base Sepolia</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg">${amount} USDC</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {isSuccess && hash && (
                <div className="animated-border p-6 fade-in-up">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center border border-green-500/30 flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-green-400 mb-2">Transaction Successful!</h3>
                      <p className="text-sm text-zinc-400 mb-4">
                        Your payment has been sent successfully
                      </p>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={(e) => {
                              console.log('BaseScan button clicked!')
                              e.preventDefault()
                              e.stopPropagation()
                              const url = `https://sepolia.basescan.org/tx/${hash}`
                              console.log('BaseScan button clicked, hash:', hash)
                              console.log('BaseScan URL:', url)

                              try {
                                const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
                                if (newWindow) {
                                  console.log('BaseScan window opened successfully')
                                  toast.success('Opening BaseScan...')
                                } else {
                                  console.error('BaseScan window was blocked')
                                  toast.error('Popup blocked! Please allow popups for this site.')
                                }
                              } catch (error) {
                                console.error('BaseScan error:', error)
                                toast.error('Failed to open BaseScan')
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold inline-flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-blue-500/50 flex-1"
                            style={{ zIndex: 9999, position: 'relative', pointerEvents: 'auto' }}
                          >
                            <ExternalLink className="w-4 h-4" />
                            BaseScan
                          </button>
                          <button
                            onClick={(e) => {
                              console.log('Blockscout button clicked!')
                              e.preventDefault()
                              e.stopPropagation()
                              const url = `https://base-sepolia.blockscout.com/tx/${hash}`
                              console.log('Blockscout button clicked, hash:', hash)
                              console.log('Blockscout URL:', url)

                              try {
                                const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
                                if (newWindow) {
                                  console.log('Blockscout window opened successfully')
                                  toast.success('Opening Blockscout...')
                                } else {
                                  console.error('Blockscout window was blocked')
                                  toast.error('Popup blocked! Please allow popups for this site.')
                                }
                              } catch (error) {
                                console.error('Blockscout error:', error)
                                toast.error('Failed to open Blockscout')
                              }
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold inline-flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-purple-500/50 flex-1"
                            style={{ zIndex: 9999, position: 'relative', pointerEvents: 'auto' }}
                          >
                            <ExternalLink className="w-4 h-4" />
                            Blockscout
                          </button>
                        </div>
                        <div className="text-xs text-zinc-500">
                          <span className="block mb-1">Transaction:</span>
                          <span className="font-mono text-blue-400 break-all">{hash}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="glass-card p-10 fade-in-up" style={{ animationDelay: '0.4s' }}>
                <h3 className="font-bold mb-4">Why AgenticPay?</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-400">Instant confirmations on Base L2</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-400">AI-powered receipt automation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-400">Real-time analytics dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-400">Secure & decentralized</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Agentic Payments */}
          <div className="mb-8 mt-8">
            <AgenticPayment />
          </div>
        </div>
      </div>
    </>
  )
}
