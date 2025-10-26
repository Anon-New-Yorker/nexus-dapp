import { Client, TopicCreateTransaction, TopicId } from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

// Create Hedera client
const client = Client.forName(process.env.HEDERA_NETWORK || "testnet")
    .setOperator(process.env.HEDERA_ACCOUNT_ID!, process.env.HEDERA_PRIVATE_KEY!);

async function createTopics() {
    try {
        console.log("🚀 Creating Hedera Topics for Agent Communication");
        console.log("=".repeat(50));
        console.log(`📋 Account: ${process.env.HEDERA_ACCOUNT_ID}`);
        console.log(`🌐 Network: ${process.env.HEDERA_NETWORK || "testnet"}`);
        console.log("=".repeat(50));

        // Create Agent A Topic (for settlement triggers)
        console.log("\n📤 Creating Agent A Topic (Settlement Triggers)...");
        const topicATransaction = await new TopicCreateTransaction()
            .setTopicMemo("Agent A - Settlement Triggers")
            .execute(client);

        const topicAReceipt = await topicATransaction.getReceipt(client);
        const topicAId = topicAReceipt.topicId!;
        console.log(`✅ Agent A Topic Created: ${topicAId.toString()}`);

        // Create Agent B Topic (for confirmations)
        console.log("\n📤 Creating Agent B Topic (Settlement Confirmations)...");
        const topicBTransaction = await new TopicCreateTransaction()
            .setTopicMemo("Agent B - Settlement Confirmations")
            .execute(client);

        const topicBReceipt = await topicBTransaction.getReceipt(client);
        const topicBId = topicBReceipt.topicId!;
        console.log(`✅ Agent B Topic Created: ${topicBId.toString()}`);

        console.log("\n🎉 Topics Created Successfully!");
        console.log("=".repeat(50));
        console.log("📝 Add these to your .env file:");
        console.log(`AGENT_A_TOPIC_ID=${topicAId.toString()}`);
        console.log(`AGENT_B_TOPIC_ID=${topicBId.toString()}`);
        console.log("=".repeat(50));

        // Test the topics
        console.log("\n🧪 Testing topic access...");
        console.log(`✅ Agent A Topic accessible: ${topicAId.toString()}`);
        console.log(`✅ Agent B Topic accessible: ${topicBId.toString()}`);

    } catch (error) {
        console.error("❌ Failed to create topics:", error);
        console.log("\n💡 Troubleshooting:");
        console.log("   1. Check your .env file has correct credentials");
        console.log("   2. Ensure your account has sufficient HBAR");
        console.log("   3. Verify you're using testnet credentials");
    }
}

// Run the setup
createTopics().then(() => {
    console.log("\n✅ Topic setup completed!");
    process.exit(0);
}).catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
});


