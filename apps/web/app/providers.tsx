'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { PrivyProvider } from '@privy-io/react-auth'
import { UserProvider } from './context/UserContext'
import { AvailProvider } from './context/AvailContext'

const config = getDefaultConfig({
  appName: 'Agentic Payments',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '2f05a7f4c39bf2a7c7b5b5b5b5b5b5b5b',
  chains: [baseSepolia],
  ssr: true,
})

const queryClient = new QueryClient()

// Check if Privy App ID is configured
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID

export function Providers({ children }: { children: React.ReactNode }) {
  const content = (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <UserProvider>
            <AvailProvider>
              {children}
            </AvailProvider>
          </UserProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )

  // Only wrap with PrivyProvider if a valid App ID is configured
  if (PRIVY_APP_ID && PRIVY_APP_ID.startsWith('clp')) {
    return (
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          loginMethods: ['email', 'google', 'wallet'],
          appearance: {
            theme: 'dark',
            accentColor: '#676FFF',
          },
        }}
      >
        {content}
      </PrivyProvider>
    )
  }

  // Without Privy, just return the content with RainbowKit
  return content
}
