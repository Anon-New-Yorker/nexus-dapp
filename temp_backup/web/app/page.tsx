'use client'

import Link from 'next/link'
import { ArrowRight, Zap, BarChart3, GitBranch, Sparkles, TrendingUp, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavBar } from './components/NavBar'

export default function HomePage() {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }))
    setParticles(newParticles)
  }, [])

  return (
    <>
      <div className="gradient-bg fixed inset-0 -z-10"></div>
      
      <NavBar />
      
      <main className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 py-32">
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute w-1 h-1 bg-blue-500 rounded-full opacity-30"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  animation: `float 8s ease-in-out infinite`,
                  animationDelay: `${p.delay}s`
                }}
              />
            ))}
          </div>

          <style jsx>{`
            @keyframes float {
              0%, 100% { transform: translateY(0) translateX(0); }
              25% { transform: translateY(-20px) translateX(10px); }
              50% { transform: translateY(-10px) translateX(-10px); }
              75% { transform: translateY(-30px) translateX(5px); }
            }
          `}</style>

          <div className="mx-auto max-w-6xl text-center relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 fade-in-up">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium">Powered by Hedera & Base Network</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 fade-in-up" style={{ animationDelay: '0.1s' }}>
              <span className="gradient-text">Cross-Chain</span>
              <br />
              <span className="text-white">Payment Analytics</span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto fade-in-up" style={{ animationDelay: '0.2s' }}>
              Accept USDC payments on Base Network with real-time analytics and AI-powered receipt processing
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link 
                href="/dashboard"
                className="glow-button px-8 py-4 rounded-xl font-semibold text-white inline-flex items-center justify-center gap-2 group"
              >
                View Dashboard
                <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/pay"
                className="glass-card px-8 py-4 rounded-xl font-semibold inline-flex items-center justify-center gap-2 group"
              >
                Make Payment
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div>
                <div className="text-3xl font-bold gradient-text mb-1">20+</div>
                <div className="text-sm text-zinc-400">Supported Wallets</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text mb-1">L2</div>
                <div className="text-sm text-zinc-400">Low-Cost Transactions</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text mb-1">AI</div>
                <div className="text-sm text-zinc-400">Automated Processing</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">Powerful Features</span>
              </h2>
              <p className="text-xl text-zinc-400">Everything you need for cross-chain payment management</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="glass-card p-8 fade-in-up">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl"></div>
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-blue-500/30">
                    <GitBranch className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">Multi-Wallet Support</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Connect with MetaMask, WalletConnect, Coinbase Wallet, and 20+ more wallets through RainbowKit integration.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-card p-8 fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-xl"></div>
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center border border-purple-500/30">
                    <BarChart3 className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">Real-Time Analytics</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Track Base network transactions with comprehensive analytics powered by Blockscout API and live data visualization.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-card p-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-xl"></div>
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center border border-green-500/30">
                    <Zap className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">Agent Integration</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Automated payment receipt processing and management through Hedera Agent Kit for seamless operations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="animated-border p-12 text-center">
              <Shield className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
                Join the future of cross-chain payments with AI-powered automation
              </p>
              <Link 
                href="/pay"
                className="glow-button px-8 py-4 rounded-xl font-semibold text-white inline-flex items-center gap-2"
              >
                Launch App
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
