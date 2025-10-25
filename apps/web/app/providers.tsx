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
  projectId: '2f05a7f4c39bf2a7c7b5b5b5b5b5b5b5b',
  chains: [baseSepolia],
  ssr: true,
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="clpispdty00ycl80fpueukbhl"
      config={{
        loginMethods: ['wallet', 'email', 'google'],
        appearance: {
          theme: 'dark',
          accentColor: '#0052FF',
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
