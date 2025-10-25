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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cm6cvvtji00yvgj5e7b7jvprd'}
      config={{
        loginMethods: ['email', 'google', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#676FFF',
        },
      }}
    >
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
    </PrivyProvider>
  )
}
