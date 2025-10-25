'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { usePrivy } from '@privy-io/react-auth'
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
  const { authenticated } = usePrivy()
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
          walletProvider: window.ethereum,
          network: 'testnet', // Use testnet for Base Sepolia
        })
        setNexusSDK(nexus)
        console.log('Nexus SDK initialized successfully')
      } catch (err) {
        console.error('Failed to initialize Nexus SDK:', err)
      }
    }
  }, [])

  const refreshBalances = async () => {
    if (!address) {
      setPaymentMethods([])
      setUnifiedBalance('0')
      return
    }
    
    console.log('Refresh balances called with:', { address, authenticated, nexusSDK: !!nexusSDK })

    setIsLoading(true)
    setError(null)

    try {
      console.log('Fetching unified balance from Avail Nexus SDK...')
      
      // Try to use real Avail Nexus SDK if available
      if (nexusSDK) {
        try {
          const balances = await nexusSDK.getUnifiedBalances(address)
          console.log('Unified balances from SDK:', balances)
          
          // Calculate total balance from all assets
          const totalBalance = balances.reduce((sum: number, asset: any) => {
            return sum + parseFloat(asset.balance || '0')
          }, 0)
          
          // Convert balance to formatted string
          const formattedBalance = totalBalance.toLocaleString()
          setUnifiedBalance(formattedBalance)
        } catch (sdkError) {
          console.error('SDK getUnifiedBalances error:', sdkError)
          // Fall through to mock data
        }
      }
      
      // Always show payment methods (using mock data for now)
      // In the future, this could be enhanced to fetch real network-specific balances from SDK
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: 'usdc-base',
          name: 'USDC on Base',
          symbol: 'USDC',
          network: 'Base',
          balance: '1,250.50',
          address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          decimals: 6,
          logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
        },
        {
          id: 'usdc-optimism',
          name: 'USDC on Optimism',
          symbol: 'USDC',
          network: 'Optimism',
          balance: '850.25',
          address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
          decimals: 6,
          logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
        },
        {
          id: 'usdc-arbitrum',
          name: 'USDC on Arbitrum',
          symbol: 'USDC',
          network: 'Arbitrum',
          balance: '2,100.75',
          address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
          decimals: 6,
          logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
        },
        {
          id: 'usdc-polygon',
          name: 'USDC on Polygon',
          symbol: 'USDC',
          network: 'Polygon',
          balance: '3,500.00',
          address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          decimals: 6,
          logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
        }
      ]
      
      setPaymentMethods(mockPaymentMethods)
      
      // Calculate unified balance from mock data if SDK didn't provide it
      if ((!nexusSDK || unifiedBalance === '0') && mockPaymentMethods.length > 0) {
        const totalBalance = mockPaymentMethods.reduce((sum, method) => {
          return sum + parseFloat(method.balance.replace(/,/g, ''))
        }, 0)
        setUnifiedBalance(totalBalance.toLocaleString())
      }
      
    } catch (err) {
      setError('Failed to fetch balances')
      console.error('Error fetching Avail balances:', err)
      
      // Fallback to mock data if everything fails
      const fallbackMethods: PaymentMethod[] = [
        {
          id: 'usdc-base',
          name: 'USDC on Base',
          symbol: 'USDC',
          network: 'Base',
          balance: '1,250.50',
          address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
          decimals: 6,
          logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
        }
      ]
      setPaymentMethods(fallbackMethods)
      setUnifiedBalance('1,250.50')
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
