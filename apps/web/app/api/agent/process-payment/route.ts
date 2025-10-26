import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const paymentData = await request.json()
        console.log('🤖 API: Processing payment through agents:', paymentData)

        // Validate required fields
        const { txHash, fromWallet, amount, token, network, recipient } = paymentData

        if (!txHash || !fromWallet || !amount || !token || !network) {
            return NextResponse.json(
                { error: 'Missing required payment data' },
                { status: 400 }
            )
        }

        // Create deposit event for agent processing
        const depositEvent = {
            txHash,
            fromWallet,
            amount: parseFloat(amount),
            token,
            merchantId: recipient || 'merchant_001',
            timestamp: Date.now()
        }

        // Send to mock API server (which agents poll)
        const mockApiUrl = process.env.MOCK_API_URL || 'http://localhost:3000'
        const response = await fetch(`${mockApiUrl}/api/deposits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(depositEvent)
        })

        if (!response.ok) {
            throw new Error(`Failed to create deposit event: ${response.statusText}`)
        }

        const result = await response.json()
        console.log('✅ API: Deposit event created:', result)

        return NextResponse.json({
            success: true,
            message: 'Payment processed through agent system',
            depositEvent: result.event,
            txHash
        })

    } catch (error) {
        console.error('❌ API: Failed to process payment:', error)
        return NextResponse.json(
            {
                error: 'Failed to process payment through agents',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
