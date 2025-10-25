import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    // Use Base Sepolia testnet configuration
    const blockscoutBase = 'https://base-sepolia.blockscout.com/api'
    const usdcAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' // Base Sepolia USDC

    const response = await fetch(
      `${blockscoutBase}?module=account&action=tokentx&contractaddress=${usdcAddress}&address=${address}&sort=desc`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch from Blockscout')
    }

    const data = await response.json()

    if (data.status !== '1' || !data.result) {
      return NextResponse.json({
        totalSpent: 0,
        transactions: [],
        count: 0,
      })
    }

    const outgoingTxs = data.result.filter((tx: any) => 
      tx.from.toLowerCase() === address.toLowerCase()
    )

    const totalSpent = outgoingTxs.reduce((sum: number, tx: any) => {
      const value = parseFloat(tx.value) / 1e6
      return sum + value
    }, 0)

    const transactions = outgoingTxs.slice(0, 20).map((tx: any) => ({
      hash: tx.hash,
      to: tx.to,
      from: tx.from,
      value: (parseFloat(tx.value) / 1e6).toFixed(2),
      timestamp: parseInt(tx.timeStamp),
      tokenSymbol: tx.tokenSymbol,
    }))

    return NextResponse.json({
      totalSpent: totalSpent.toFixed(2),
      transactions,
      count: outgoingTxs.length,
    })
  } catch (error) {
    console.error('Error fetching user spending:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spending data' },
      { status: 500 }
    )
  }
}
