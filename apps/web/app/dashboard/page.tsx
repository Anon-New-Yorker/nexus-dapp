'use client'

import { useUser } from '../context/UserContext'
import { useAccount } from 'wagmi'
import { usePrivy } from '@privy-io/react-auth'
import { NavBar } from '../components/NavBar'
import { MerchantDashboard } from './MerchantDashboard'
import { UserDashboard } from './UserDashboard'
import { UnifiedBalance } from '../components/UnifiedBalance'
import { PaymentMethodSelector } from '../components/PaymentMethodSelector'
import { useAvail } from '../context/AvailContext'
import { Wallet } from 'lucide-react'

export default function Dashboard() {
  const { userRole, openLoginModal } = useUser()
  const { isConnected } = useAccount()
  const { unifiedBalance, refreshBalances, isLoading } = useAvail()
  const { authenticated } = usePrivy()

  const isLoggedIn = userRole

  if (!isLoggedIn) {
    return (
      <>
        <div className="gradient-bg fixed inset-0 -z-10"></div>
        <NavBar />

        <div className="min-h-screen px-6 py-8 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-12 text-center fade-in-up">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/10 flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                <Wallet className="w-10 h-10 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold mb-3">
                <span className="gradient-text">Dashboard Access</span>
              </h2>
              <p className="text-xl text-zinc-400 mb-8">
                Please login using the button in the navigation bar to access your dashboard
              </p>
              <div className="text-sm text-zinc-500">
                Use the "Login" button in the top navigation
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!userRole) {
    return (
      <>
        <div className="gradient-bg fixed inset-0 -z-10"></div>
        <NavBar />

        <div className="min-h-screen px-6 py-8 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-12 text-center fade-in-up">
              <h2 className="text-3xl font-bold mb-3">
                <span className="gradient-text">Choose Your Account Type</span>
              </h2>
              <p className="text-xl text-zinc-400 mb-8">
                Please select whether you're a merchant or user to continue
              </p>
              <button
                onClick={openLoginModal}
                className="glow-button px-8 py-4 rounded-xl font-semibold text-lg"
              >
                Select Account Type
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="gradient-bg fixed inset-0 -z-10"></div>
      <NavBar />

      <div className="min-h-screen px-6 py-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Avail Nexus Integration Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <UnifiedBalance
              balance={unifiedBalance}
              isLoading={isLoading}
              onRefresh={refreshBalances}
            />
            <PaymentMethodSelector />
          </div>

          {/* Role-specific Dashboard */}
          {userRole === 'merchant' ? <MerchantDashboard /> : <UserDashboard />}
        </div>
      </div>
    </>
  )
}
