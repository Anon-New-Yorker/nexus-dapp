import { NextResponse } from 'next/server'

// Base Sepolia testnet configuration
const DEFAULT_MERCHANT_ADDRESS = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS || '0x76520dB38f6Dd54a5c8F10a9EB130b8171A1715d'
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' // Base Sepolia USDC
const BLOCKSCOUT_BASE = 'https://base-sepolia.blockscout.com/api'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const address = url.searchParams.get('address') || DEFAULT_MERCHANT_ADDRESS

    const response = await fetch(
      `${BLOCKSCOUT_BASE}?module=account&action=tokentx&address=${address}&contractaddress=${USDC_ADDRESS}&page=1&offset=100&sort=desc`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch from Blockscout')
    }

    const data = await response.json()

    if (data.status !== '1' || !data.result) {
      return NextResponse.json({
        totalValue: 0,
        transactions: [],
      })
    }

    const inboundTransactions = data.result
      .filter((tx: any) => tx.to.toLowerCase() === address.toLowerCase())
      .map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: (parseInt(tx.value) / 1e6).toFixed(2),
        timestamp: parseInt(tx.timeStamp),
        tokenSymbol: tx.tokenSymbol,
      }))

    const totalValue = inboundTransactions.reduce(
      (sum: number, tx: any) => sum + parseFloat(tx.value),
      0
    )

    return NextResponse.json({
      totalValue: totalValue.toFixed(2),
      transactions: inboundTransactions,
    })
  } catch (error) {
    console.warn('Error fetching merchant summary:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Failed to fetch merchant data' },
      { status: 500 }
    )
  }
}
