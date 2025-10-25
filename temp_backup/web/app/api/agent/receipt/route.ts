import { NextResponse } from 'next/server'

let agentReceipts: any[] = []

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { txHash, from, to, amount, token, timestamp } = body

    if (!txHash || !from || !to || !amount || !token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const receipt = {
      txHash,
      from,
      to,
      amount,
      token,
      timestamp: timestamp || new Date().toISOString(),
    }

    agentReceipts.push(receipt)

    console.log('✅ Agent receipt saved:', receipt)

    return NextResponse.json({
      success: true,
      receipt,
      message: 'Receipt saved successfully',
    })
  } catch (error) {
    console.error('Error saving agent receipt:', error)
    return NextResponse.json(
      { error: 'Failed to save receipt' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const totalAgentPayments = agentReceipts.reduce(
      (sum, receipt) => sum + parseFloat(receipt.amount),
      0
    )

    return NextResponse.json({
      receipts: agentReceipts,
      totalPayments: totalAgentPayments.toFixed(2),
      count: agentReceipts.length,
    })
  } catch (error) {
    console.error('Error fetching agent receipts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch receipts' },
      { status: 500 }
    )
  }
}
