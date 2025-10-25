'use client'

import { useEffect, useState } from 'react'
import { Copy, ExternalLink, TrendingUp, DollarSign, Activity, ArrowUp, ArrowDown, Zap } from 'lucide-react'
import Link from 'next/link'
import { Toaster, toast } from 'sonner'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAccount } from 'wagmi'

function KPI({ label, value, suffix = '', icon: Icon, change, isNegative }: { 
  label: string
  value: number
  suffix?: string
  icon?: any
  change?: string
  isNegative?: boolean
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
        <div className={`flex items-center gap-1 text-sm ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
          {isNegative ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
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

export function MerchantDashboard() {
  const { address } = useAccount()
  const [inboundData, setInboundData] = useState<any>(null)
  const [outboundData, setOutboundData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return

    const fetchData = async () => {
      try {
        const merchantAddress = address
        
        const [inboundRes, outboundRes] = await Promise.all([
          fetch(`/api/merchant/summary?address=${merchantAddress}`),
          fetch(`/api/user/spending?address=${merchantAddress}`),
        ])

        const inbound = await inboundRes.json()
        const outbound = await outboundRes.json()

        setInboundData(inbound)
        setOutboundData(outbound)
      } catch (error) {
        console.error('Error fetching merchant data:', error)
        toast.error('Failed to fetch merchant data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [address])

  const totalInbound = parseFloat(inboundData?.totalValue || 0)
  const totalOutbound = parseFloat(outboundData?.totalSpent || 0)
  const netIncome = totalInbound - totalOutbound
  const inboundTxCount = inboundData?.transactions?.length || 0
  const outboundTxCount = outboundData?.count || 0

  const chartData = inboundData?.transactions?.slice(0, 7).reverse().map((tx: any, idx: number) => ({
    name: new Date(tx.timestamp * 1000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    inbound: parseFloat(tx.value),
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
                <span className="gradient-text">Merchant Dashboard</span>
              </h1>
              <p className="text-xl text-zinc-400">Complete business analytics</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 pulse"></div>
                <span className="text-sm text-blue-400 font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-zinc-400">Loading merchant analytics...</div>
            </div>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid md:grid-cols-4 gap-6 mb-8 fade-in-up" style={{ animationDelay: '0.1s' }}>
              <KPI
                label="Total Inbound"
                value={totalInbound}
                suffix="$"
                icon={TrendingUp}
                change="+12.5% from last week"
              />
              <KPI
                label="Total Outbound"
                value={totalOutbound}
                suffix="$"
                icon={ArrowDown}
                change={`${outboundTxCount} transactions`}
                isNegative
              />
              <KPI
                label="Net Income"
                value={netIncome}
                suffix="$"
                icon={DollarSign}
                change={netIncome > 0 ? "Positive flow" : "Negative flow"}
              />
              <KPI
                label="Inbound Txs"
                value={inboundTxCount}
                icon={Activity}
                change="All tracked"
              />
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="glass-card p-8 mb-8 fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Inbound Revenue</h2>
                    <p className="text-sm text-zinc-400">Last 7 inbound transactions</p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
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
                      dataKey="inbound" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorInbound)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Transactions Tables */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Inbound Transactions */}
              <div className="glass-card p-8 fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Inbound</h2>
                    <p className="text-sm text-zinc-400">Payments received</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                    <ArrowUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">{inboundTxCount}</span>
                  </div>
                </div>

                {inboundData?.transactions?.length > 0 ? (
                  <div className="space-y-3">
                    {inboundData.transactions.slice(0, 5).map((tx: any, idx: number) => (
                      <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <ShortHash h={tx.hash} />
                          <span className="font-mono text-sm font-semibold text-green-400">
                            +${parseFloat(tx.value).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <span>From: <ShortHash h={tx.from} /></span>
                          <span>{new Date(tx.timestamp * 1000).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">No inbound transactions</p>
                  </div>
                )}
              </div>

              {/* Outbound Transactions */}
              <div className="glass-card p-8 fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Outbound</h2>
                    <p className="text-sm text-zinc-400">Payments sent</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <ArrowDown className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400 font-medium">{outboundTxCount}</span>
                  </div>
                </div>

                {outboundData?.transactions?.length > 0 ? (
                  <div className="space-y-3">
                    {outboundData.transactions.slice(0, 5).map((tx: any, idx: number) => (
                      <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <ShortHash h={tx.hash} />
                          <span className="font-mono text-sm font-semibold text-red-400">
                            -${parseFloat(tx.value).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <span>To: <ShortHash h={tx.to} /></span>
                          <span>{new Date(tx.timestamp * 1000).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">No outbound transactions</p>
                  </div>
                )}
              </div>
            </div>

          </>
        )}
      </div>
    </>
  )
}
