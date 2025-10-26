import { submitMessage, config } from "./hederaClient.js";
import type { DepositEvent } from "./types.js";

/**
 * Bridge between frontend payments and agent system
 * This creates deposit events that agents can process
 */
export class PaymentBridge {
    private static instance: PaymentBridge;
    private mockApiUrl: string;

    constructor() {
        this.mockApiUrl = `http://localhost:${config.mockApiPort}`;
    }

    static getInstance(): PaymentBridge {
        if (!PaymentBridge.instance) {
            PaymentBridge.instance = new PaymentBridge();
        }
        return PaymentBridge.instance;
    }

    /**
     * Process a successful frontend payment and create a deposit event for agents
     */
    async processFrontendPayment(paymentData: {
        txHash: string;
        fromWallet: string;
        amount: number;
        token: string;
        network: string;
        recipient?: string;
    }): Promise<void> {
        try {
            console.log("🌉 PaymentBridge: Processing frontend payment", paymentData);

            // Create a deposit event that agents can process
            const depositEvent: DepositEvent = {
                txHash: paymentData.txHash,
                fromWallet: paymentData.fromWallet,
                amount: paymentData.amount,
                token: paymentData.token,
                merchantId: paymentData.recipient || "merchant_001", // Default merchant or use recipient
                timestamp: Date.now()
            };

            // Send to mock API server (which agents poll)
            const response = await fetch(`${this.mockApiUrl}/api/deposits`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(depositEvent)
            });

            if (!response.ok) {
                throw new Error(`Failed to create deposit event: ${response.statusText}`);
            }

            console.log("✅ PaymentBridge: Deposit event created for agent processing", depositEvent);
        } catch (error) {
            console.error("❌ PaymentBridge: Failed to process frontend payment:", error);
            throw error;
        }
    }

    /**
     * Check if a payment has been processed by agents
     */
    async checkPaymentStatus(txHash: string): Promise<{
        processed: boolean;
        settlementTxId?: string;
        status?: string;
    }> {
        try {
            // This would typically check agent logs or a database
            // For now, we'll return a mock response
            console.log(`🔍 PaymentBridge: Checking status for tx ${txHash}`);

            // In a real implementation, this would query the agent logs or database
            return {
                processed: false,
                settlementTxId: undefined,
                status: "pending"
            };
        } catch (error) {
            console.error("❌ PaymentBridge: Failed to check payment status:", error);
            return {
                processed: false,
                status: "error"
            };
        }
    }
}

export const paymentBridge = PaymentBridge.getInstance();
