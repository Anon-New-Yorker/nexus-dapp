import { subscribeToTopicWithErrorHandling } from "./messageBus.js";
import { client, submitMessage, config } from "./hederaClient.js";
import { TransferTransaction, Hbar } from "@hashgraph/sdk";
import { getMerchantAccount, getMerchant } from "./merchantRegistry.js";
import type { SettlementTrigger, SettlementConfirmed } from "./types.js";
import fs from "fs";
import path from "path";

let settlementsCompleted = 0;

async function processSettlementTrigger(msg: SettlementTrigger): Promise<void> {
    try {
        console.log(`🔔 Agent B: Settlement trigger received for merchant ${msg.merchantId}`);

        // Verify merchant exists and is active
        const merchant = getMerchant(msg.merchantId);
        if (!merchant) {
            throw new Error(`Merchant ${msg.merchantId} not found`);
        }

        const merchantAccountId = getMerchantAccount(msg.merchantId);
        console.log(`💰 Processing settlement: ${msg.amount} ${msg.token} to ${merchantAccountId}`);

        // Execute the transfer
        const transfer = await new TransferTransaction()
            .addHbarTransfer(config.hederaAccountId, new Hbar(-msg.amount))
            .addHbarTransfer(merchantAccountId, new Hbar(msg.amount))
            .execute(client);

        const receipt = await transfer.getReceipt(client);
        console.log("✅ Transfer executed:", receipt.status.toString());

        settlementsCompleted++;

        // Create confirmation message
        const confirmation: SettlementConfirmed = {
            type: "SETTLEMENT_CONFIRMED",
            merchantId: msg.merchantId,
            txHash: msg.txHash,
            hederaTxId: transfer.transactionId.toString(),
            status: receipt.status.toString(),
            timestamp: Date.now()
        };

        // Publish confirmation to Agent B topic
        try {
            await submitMessage(config.agentBTopicId, confirmation);
            console.log("📤 Agent B: Published settlement confirmation:", confirmation);
        } catch (error) {
            console.error("❌ Agent B: Failed to publish confirmation:", error);
        }

        // Log to file
        const logEntry = {
            logTimestamp: new Date().toISOString(),
            logType: "SETTLEMENT_COMPLETED",
            ...confirmation
        };

        const logPath = path.join(process.cwd(), "agent_logs.txt");
        fs.appendFileSync(logPath, JSON.stringify(logEntry) + "\n");

        console.log(`📝 Settlement logged to ${logPath}`);

    } catch (error) {
        console.error("❌ Agent B: Failed to process settlement:", error);

        // Log error
        const errorLog = {
            logTimestamp: new Date().toISOString(),
            logType: "SETTLEMENT_ERROR",
            merchantId: msg.merchantId,
            error: error instanceof Error ? error.message : String(error)
        };

        const logPath = path.join(process.cwd(), "agent_logs.txt");
        fs.appendFileSync(logPath, JSON.stringify(errorLog) + "\n");
    }
}

export function startAgentB(): void {
    console.log("🤖 Starting Agent B (Executor)...");
    console.log(`🔔 Subscribing to topic: ${config.agentATopicId}`);
    console.log(`📤 Publishing confirmations to topic: ${config.agentBTopicId}`);

    subscribeToTopicWithErrorHandling(
        config.agentATopicId,
        async (msg) => {
            if (msg.type === "SETTLEMENT_TRIGGER") {
                await processSettlementTrigger(msg as SettlementTrigger);
            }
        },
        (error) => {
            console.error("❌ Agent B: Subscription error:", error);
        }
    );
}

// Export for testing
export { processSettlementTrigger, settlementsCompleted };
