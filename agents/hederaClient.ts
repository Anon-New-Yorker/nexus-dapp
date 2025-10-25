import { Client, TopicMessageSubmitTransaction, TopicId } from "@hashgraph/sdk";
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

// Note: Account balance checking would require AccountBalanceQuery
// This is a placeholder for future implementation
export async function getAccountBalance(accountId: string): Promise<number> {
    console.log(`📊 Account balance check requested for ${accountId}`);
    return 0; // Placeholder - implement with AccountBalanceQuery if needed
}
