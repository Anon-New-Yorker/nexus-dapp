import './globals.css'
import { Providers } from './providers'
import { LoginModal } from './components/LoginModal'
import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata: Metadata = {
  title: 'AgenticPay | Cross-Chain Payment Analytics',
  description: 'Cross-chain payment analytics powered by Hedera Agent Kit and Base Network',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <Providers>
          {children}
          <LoginModal />
        </Providers>
      </body>
    </html>
  )
}
