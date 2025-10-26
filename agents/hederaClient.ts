import { Client, TopicMessageSubmitTransaction, TopicId, AccountBalanceQuery } from "@hashgraph/sdk";
import dotenv from "dotenv";
import type { AgentConfig } from "./types.js";

dotenv.config();

// Configuration with defaults for testing
const config: AgentConfig = {
    hederaNetwork: process.env.HEDERA_NETWORK || "testnet",
    hederaAccountId: process.env.HEDERA_ACCOUNT_ID || "0.0.123456",
    hederaPrivateKey: process.env.HEDERA_PRIVATE_KEY || "302e020100300506032b657004220420...",
    agentATopicId: process.env.AGENT_A_TOPIC_ID || "0.0.789012",
    agentBTopicId: process.env.AGENT_B_TOPIC_ID || "0.0.789013",
    mockApiPort: parseInt(process.env.MOCK_API_PORT || "3000")
};

export { config };

export const client = Client.forName(config.hederaNetwork)
    .setOperator(config.hederaAccountId, config.hederaPrivateKey);

export async function submitMessage(topicId: string, message: any): Promise<string> {
    try {
        const tx = new TopicMessageSubmitTransaction()
            .setTopicId(TopicId.fromString(topicId))
            .setMessage(JSON.stringify(message));

        const response = await tx.execute(client);
        const receipt = await response.getReceipt(client);

        console.log(`📤 Message submitted to topic ${topicId}:`, receipt.status.toString());
        return response.transactionId.toString();
    } catch (error) {
        console.error("❌ Failed to submit message:", error);
        throw error;
    }
}

// Get account balance in HBAR
export async function getAccountBalance(accountId: string): Promise<number> {
    try {
        console.log(`📊 Checking balance for account ${accountId}`);
        const query = new AccountBalanceQuery().setAccountId(accountId);
        const balance = await query.execute(client);
        const hbarBalance = balance.hbars.toTinybars().toNumber() / 100000000; // Convert from tinybars to HBAR
        console.log(`💰 Account ${accountId} balance: ${hbarBalance} HBAR`);
        return hbarBalance;
    } catch (error) {
        console.error(`❌ Failed to get balance for account ${accountId}:`, error);
        return 0;
    }
}

// Check if account has sufficient balance for a transfer
export async function checkSufficientBalance(accountId: string, requiredAmount: number): Promise<boolean> {
    try {
        const balance = await getAccountBalance(accountId);
        const hasEnough = balance >= requiredAmount;
        console.log(`💰 Balance check: ${balance} HBAR available, ${requiredAmount} HBAR required. Sufficient: ${hasEnough}`);
        return hasEnough;
    } catch (error) {
        console.error(`❌ Failed to check balance for account ${accountId}:`, error);
        return false;
    }
}
