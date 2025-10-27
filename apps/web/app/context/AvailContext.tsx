'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useAccount, useBalance, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { NexusSDK } from '@avail-project/nexus-core'

interface PaymentMethod {
  id: string
  name: string
  symbol: string
  network: string
  balance: string
  address: string
  decimals: number
  logoUrl?: string
}

interface AvailContextType {
  paymentMethods: PaymentMethod[]
  unifiedBalance: string
  isLoading: boolean
  error: string | null
  refreshBalances: () => Promise<void>
  selectedPaymentMethod: PaymentMethod | null
  setSelectedPaymentMethod: (method: PaymentMethod | null) => void
}

const AvailContext = createContext<AvailContextType | undefined>(undefined)

export function AvailProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount()
  const { data: balance, isLoading: isBalanceLoading, refetch: refetchBalance } = useBalance({
    address: address,
  })
  
  // USDC contract address on Base Sepolia
  const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
  
  // Fetch USDC balance
  const { data: usdcBalance, isLoading: isUsdcLoading, refetch: refetchUsdc } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }]
      }
    ],
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [unifiedBalance, setUnifiedBalance] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [nexusSDK, setNexusSDK] = useState<NexusSDK | null>(null)

  // Initialize Nexus SDK
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const nexus = new NexusSDK({
          network: 'testnet', // Use testnet for Base Sepolia
        })
        setNexusSDK(nexus)
        console.log('Nexus SDK initialized successfully')
      } catch (err) {
        console.warn('Failed to initialize Nexus SDK:', err instanceof Error ? err.message : 'Unknown error')
      }
    }
  }, [])

  // Update unified balance from wallet balance - PRIORITY OVER NEXUS SDK
  useEffect(() => {
    console.log('Wallet balance effect triggered:', { balance, usdcBalance, address, isBalanceLoading, isUsdcLoading })
    
    if (address && (balance || usdcBalance !== undefined)) {
      let totalUsdValue = 0
      const paymentMethodsList: PaymentMethod[] = []
      
      // Add ETH balance
      if (balance) {
        const balanceInEth = parseFloat(formatUnits(balance.value, balance.decimals))
        const ethValueInUsd = balanceInEth * 3000 // ETH to USD conversion (Base Sepolia testnet price)
        totalUsdValue += ethValueInUsd
        
        const ethPaymentMethod: PaymentMethod = {
          id: 'wallet-eth',
          name: 'ETH in Wallet',
          symbol: 'ETH',
          network: 'Base Sepolia',
          balance: balanceInEth.toFixed(4),
          address: address,
          decimals: balance.decimals,
          logoUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
        }
        paymentMethodsList.push(ethPaymentMethod)
      }
      
      // Add USDC balance
      if (usdcBalance !== undefined) {
        const usdcBalanceFormatted = parseFloat(formatUnits(usdcBalance, 6)) // USDC has 6 decimals
        totalUsdValue += usdcBalanceFormatted // USDC is already in USD
        
        const usdcPaymentMethod: PaymentMethod = {
          id: 'wallet-usdc',
          name: 'USDC in Wallet',
          symbol: 'USDC',
          network: 'Base Sepolia',
          balance: usdcBalanceFormatted.toFixed(2),
          address: address,
          decimals: 6,
          logoUrl: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png'
        }
        paymentMethodsList.push(usdcPaymentMethod)
      }
      
      console.log('Setting unified balance from wallet:', { totalUsdValue, paymentMethodsList })
      setUnifiedBalance(totalUsdValue.toLocaleString())
      setPaymentMethods(paymentMethodsList)
    } else if (address && !isBalanceLoading && !isUsdcLoading) {
      // If connected but no balance data, set to 0
      console.log('No balance data available, setting to 0')
      setUnifiedBalance('0')
      setPaymentMethods([])
    }
  }, [balance, usdcBalance, address, isBalanceLoading, isUsdcLoading])

  // Force wallet balance update when address changes
  useEffect(() => {
    if (address && balance) {
      console.log('Address changed, forcing wallet balance update')
      const balanceInEth = parseFloat(formatUnits(balance.value, balance.decimals))
      const balanceInUsd = balanceInEth * 3000 // ETH to USD conversion (Base Sepolia testnet price)
      setUnifiedBalance(balanceInUsd.toLocaleString())
      
      const walletPaymentMethod: PaymentMethod = {
        id: 'wallet-eth',
        name: 'ETH in Wallet',
        symbol: 'ETH',
        network: 'Base Sepolia',
        balance: balanceInEth.toFixed(4),
        address: address,
        decimals: balance.decimals,
        logoUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
      }
      
      setPaymentMethods([walletPaymentMethod])
    }
  }, [address, balance])

  const refreshBalances = async () => {
    if (!address) {
      setPaymentMethods([])
      setUnifiedBalance('0')
      return
    }
    
    console.log('Refresh balances called with:', { address, nexusSDK: !!nexusSDK, balance })

    setIsLoading(true)
    setError(null)

    try {
      // Force refetch of both ETH and USDC balances
      console.log('Refetching ETH and USDC balances...')
      
      // Add a small delay to ensure blockchain has updated
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Starting aggressive balance refresh...')
      
      // Try multiple times to ensure we get fresh data
      let freshBalance, freshUsdcBalance
      let attempts = 0
      const maxAttempts = 3
      
      while (attempts < maxAttempts) {
        console.log(`Balance refresh attempt ${attempts + 1}/${maxAttempts}`)
        
        const [ethResult, usdcResult] = await Promise.all([
          refetchBalance(),
          refetchUsdc()
        ])
        
        console.log('Refetch results:', { ethResult, usdcResult })
        
        freshBalance = ethResult.data
        freshUsdcBalance = usdcResult.data
        
        // If we got data, break
        if (freshBalance || freshUsdcBalance !== undefined) {
          console.log('Got fresh balance data, breaking loop')
          break
        }
        
        attempts++
        if (attempts < maxAttempts) {
          console.log(`No data on attempt ${attempts}, waiting 1 second before retry...`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      if (address && (freshBalance || freshUsdcBalance !== undefined)) {
        let totalUsdValue = 0
        const paymentMethodsList: PaymentMethod[] = []
        
        // Add ETH balance
        if (freshBalance) {
          const balanceInEth = parseFloat(formatUnits(freshBalance.value, freshBalance.decimals))
          const ethValueInUsd = balanceInEth * 3000 // ETH to USD conversion (Base Sepolia testnet price)
          totalUsdValue += ethValueInUsd
          
          const ethPaymentMethod: PaymentMethod = {
            id: 'wallet-eth',
            name: 'ETH in Wallet',
            symbol: 'ETH',
            network: 'Base Sepolia',
            balance: balanceInEth.toFixed(4),
            address: address,
            decimals: freshBalance.decimals,
            logoUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
          }
          paymentMethodsList.push(ethPaymentMethod)
        }
        
        // Add USDC balance
        if (freshUsdcBalance !== undefined) {
          const usdcBalanceFormatted = parseFloat(formatUnits(freshUsdcBalance, 6))
          totalUsdValue += usdcBalanceFormatted
          
          const usdcPaymentMethod: PaymentMethod = {
            id: 'wallet-usdc',
            name: 'USDC in Wallet',
            symbol: 'USDC',
            network: 'Base Sepolia',
            balance: usdcBalanceFormatted.toFixed(2),
            address: address,
            decimals: 6,
            logoUrl: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png'
          }
          paymentMethodsList.push(usdcPaymentMethod)
        }
        
        console.log('Using wallet balance for refresh:', { totalUsdValue, paymentMethodsList })
        setUnifiedBalance(totalUsdValue.toLocaleString())
        setPaymentMethods(paymentMethodsList)
        console.log('Wallet balance set successfully')
      } else {
        console.log('No wallet balance available, setting to 0')
        setPaymentMethods([])
        setUnifiedBalance('0')
      }
      
    } catch (err) {
      setError('Failed to fetch balances')
      console.warn('Error fetching wallet balance:', err instanceof Error ? err.message : 'Unknown error')
      
      setPaymentMethods([])
      setUnifiedBalance('0')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (address) {
      console.log('Address changed, refreshing balances:', address)
      refreshBalances()
    } else {
      console.log('No address, clearing balances')
      setPaymentMethods([])
      setUnifiedBalance('0')
      setSelectedPaymentMethod(null)
    }
  }, [address, nexusSDK])

  // Force wallet balance update on component mount
  useEffect(() => {
    console.log('Component mounted, checking wallet balance:', { address, balance, isBalanceLoading })
    if (address && balance) {
      console.log('Forcing wallet balance update on mount')
      const balanceInEth = parseFloat(formatUnits(balance.value, balance.decimals))
      const balanceInUsd = balanceInEth * 3000 // ETH to USD conversion (Base Sepolia testnet price)
      setUnifiedBalance(balanceInUsd.toLocaleString())
      
      const walletPaymentMethod: PaymentMethod = {
        id: 'wallet-eth',
        name: 'ETH in Wallet',
        symbol: 'ETH',
        network: 'Base Sepolia',
        balance: balanceInEth.toFixed(4),
        address: address,
        decimals: balance.decimals,
        logoUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
      }
      
      setPaymentMethods([walletPaymentMethod])
    }
  }, [])

  return (
    <AvailContext.Provider
      value={{
        paymentMethods,
        unifiedBalance,
        isLoading,
        error,
        refreshBalances,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
      }}
    >
      {children}
    </AvailContext.Provider>
  )
}

export function useAvail() {
  const context = useContext(AvailContext)
  if (context === undefined) {
    throw new Error('useAvail must be used within an AvailProvider')
  }
  return context
}
