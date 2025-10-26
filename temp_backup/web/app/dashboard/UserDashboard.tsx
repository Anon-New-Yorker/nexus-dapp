'use client'

import { useEffect, useState } from 'react'
import { Copy, ExternalLink, Activity, TrendingDown, DollarSign, ArrowDown, Zap } from 'lucide-react'
import Link from 'next/link'
import { Toaster, toast } from 'sonner'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAccount } from 'wagmi'

function KPI({ label, value, suffix = '', icon: Icon, change }: { 
  label: string
  value: number
  suffix?: string
  icon?: any
  change?: string
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const increment = value / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="glass-card p-6 group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-zinc-400 font-medium">{label}</span>
        {Icon && (
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-lg group-hover:bg-blue-500/30 transition-all"></div>
            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/10 flex items-center justify-center border border-blue-500/30">
              <Icon className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        )}
      </div>
      <div className="text-4xl font-bold mb-2 gradient-text">
        {suffix === '$' && suffix}
        {Math.round(displayValue * 100) / 100}
        {suffix !== '$' && suffix && ` ${suffix}`}
      </div>
      {change && (
        <div className="flex items-center gap-1 text-sm text-zinc-400">
          {change}
        </div>
      )}
    </div>
  )
}

function ShortHash({ h }: { h: string }) {
  return <span className="font-mono text-xs text-zinc-400">{h?.slice(0, 6)}…{h?.slice(-4)}</span>
}

function CopyBtn({ text }: { text: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }
  
  return (
    <button
      onClick={handleCopy}
      className="text-zinc-400 hover:text-blue-400 transition-colors p-1"
      aria-label="Copy"
    >
      <Copy className="w-3.5 h-3.5" />
    </button>
  )
}

export function UserDashboard() {
  const { address } = useAccount()
  const [spendingData, setSpendingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/user/spending?address=${address}`)
        const data = await response.json()
        setSpendingData(data)
      } catch (error) {
        console.error('Error fetching spending data:', error)
        toast.error('Failed to fetch spending data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [address])

  const totalSpent = parseFloat(spendingData?.totalSpent || 0)
  const txCount = spendingData?.count || 0
  const avgTransaction = txCount > 0 ? totalSpent / txCount : 0

  const chartData = spendingData?.transactions?.slice(0, 7).reverse().map((tx: any, idx: number) => ({
    name: new Date(tx.timestamp * 1000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    value: parseFloat(tx.value),
  })) || []

  return (
    <>
      <Toaster theme="dark" position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                <span className="gradient-text">My Spending</span>
              </h1>
              <p className="text-xl text-zinc-400">Track your payment history</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 pulse"></div>
                <span className="text-sm text-green-400 font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-zinc-400">Loading spending analytics...</div>
            </div>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid md:grid-cols-3 gap-6 mb-8 fade-in-up" style={{ animationDelay: '0.1s' }}>
              <KPI
                label="Total Spent"
                value={totalSpent}
                suffix="$"
                icon={DollarSign}
                change={`${txCount} transactions`}
              />
              <KPI
                label="Transactions"
                value={txCount}
                icon={Activity}
                change="All tracked"
              />
              <KPI
                label="Avg Transaction"
                value={avgTransaction}
                suffix="$"
                icon={TrendingDown}
                change="Per payment"
              />
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="glass-card p-8 mb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Spending History</h2>
                    <p className="text-sm text-zinc-400">Last 7 outbound transactions</p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      stroke="#71717A" 
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#71717A" 
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#18181B', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#EF4444" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorSpending)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Transactions */}
            <div className="glass-card p-8 mb-8 fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Recent Transactions</h2>
                  <p className="text-sm text-zinc-400">Your payment history</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <ArrowDown className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400 font-medium">Outbound</span>
                </div>
              </div>

              {spendingData?.transactions?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left pb-4 text-sm font-medium text-zinc-400">Hash</th>
                        <th className="text-left pb-4 text-sm font-medium text-zinc-400">To</th>
                        <th className="text-left pb-4 text-sm font-medium text-zinc-400">Amount</th>
                        <th className="text-left pb-4 text-sm font-medium text-zinc-400">Date</th>
                        <th className="text-right pb-4 text-sm font-medium text-zinc-400">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spendingData.transactions.slice(0, 10).map((tx: any, idx: number) => (
                        <tr key={idx} className="group border-t border-white/5">
                          <td className="py-4 flex items-center gap-2">
                            <ShortHash h={tx.hash} />
                            <CopyBtn text={tx.hash} />
                          </td>
                          <td className="py-4">
                            <ShortHash h={tx.to} />
                          </td>
                          <td className="py-4">
                            <span className="font-mono text-sm font-semibold text-red-400">
                              -${parseFloat(tx.value).toFixed(2)}
                            </span>
                          </td>
                          <td className="py-4 text-sm text-zinc-400">
                            {new Date(tx.timestamp * 1000).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-right">
                            <a
                              href={`https://sepolia.basescan.org/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors group-hover:underline"
                            >
                              View
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400">No transactions found</p>
                  <p className="text-sm text-zinc-500 mt-2">Make your first payment to see it here</p>
                </div>
              )}
            </div>

          </>
        )}
      </div>
    </>
  )
}
