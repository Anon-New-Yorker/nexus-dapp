import { submitMessage, config } from "./hederaClient.js";
import axios from "axios";
import type { DepositEvent, SettlementTrigger } from "./types.js";

let processedEvents = new Set<string>();

async function pollDeposits(): Promise<void> {
    try {
        console.log("🔍 Agent A: Polling for new deposit events...");
        const response = await axios.get(`http://localhost:${config.mockApiPort}/api/deposits`);
        const deposits: DepositEvent[] = response.data;

        console.log(`📊 Found ${deposits.length} total deposit events`);

        for (const deposit of deposits) {
            // Skip if we've already processed this event
            if (processedEvents.has(deposit.txHash)) {
                continue;
            }

            const settlementTrigger: SettlementTrigger = {
                type: "SETTLEMENT_TRIGGER",
                merchantId: deposit.merchantId,
                token: deposit.token,
                amount: deposit.amount,
                txHash: deposit.txHash,
                timestamp: Date.now()
            };

            try {
                const messageId = await submitMessage(config.agentATopicId, settlementTrigger);
                processedEvents.add(deposit.txHash);
                console.log("📤 Agent A: Sent settlement trigger:", {
                    messageId,
                    merchantId: settlementTrigger.merchantId,
                    amount: settlementTrigger.amount,
                    token: settlementTrigger.token,
                    txHash: settlementTrigger.txHash
                });
            } catch (error) {
                console.error("❌ Agent A: Failed to send settlement trigger:", error);
            }
        }
    } catch (error) {
        console.error("❌ Agent A: Failed to poll deposits:", error);
    }
}

export function startAgentA(): void {
    console.log("🤖 Starting Agent A (Watcher)...");
    console.log(`📡 Polling API at http://localhost:${config.mockApiPort}/api/deposits`);
    console.log(`📤 Publishing to topic: ${config.agentATopicId}`);

    // Poll immediately, then every 10 seconds
    pollDeposits();
    setInterval(pollDeposits, 10000);
}

// Export for testing
export { pollDeposits };
