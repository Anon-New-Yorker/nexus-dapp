import axios from "axios";
import { config } from "./hederaClient.js";

console.log("🎬 Hedera Agent System Demo");
console.log("=".repeat(50));

async function runDemo() {
    try {
        console.log("\n📡 Step 1: Checking mock API server...");
        const statusResponse = await axios.get(`http://localhost:${config.mockApiPort}/api/agent/status`);
        console.log("✅ API server is running:", statusResponse.data);

        console.log("\n📊 Step 2: Checking existing deposits...");
        const depositsResponse = await axios.get(`http://localhost:${config.mockApiPort}/api/deposits`);
        console.log(`✅ Found ${depositsResponse.data.length} existing deposits`);

        console.log("\n🧪 Step 3: Creating test deposit event...");
        const testDepositResponse = await axios.post(`http://localhost:${config.mockApiPort}/api/test/deposit`);
        console.log("✅ Test deposit created:", testDepositResponse.data.event);

        console.log("\n⏳ Step 4: Waiting for agents to process...");
        console.log("   (In a real system, Agent A would poll and Agent B would execute)");

        // Wait a moment to simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log("\n📋 Step 5: Final status check...");
        const finalStatusResponse = await axios.get(`http://localhost:${config.mockApiPort}/api/agent/status`);
        console.log("✅ Final status:", finalStatusResponse.data);

        console.log("\n🎉 Demo completed successfully!");
        console.log("\n📝 Next steps:");
        console.log("   1. Set up real Hedera credentials in .env file");
        console.log("   2. Create Hedera topics for agent communication");
        console.log("   3. Run: npm start");
        console.log("   4. Monitor agent logs for real-time processing");

    } catch (error) {
        console.error("❌ Demo failed:", error);
        console.log("\n💡 Make sure to start the system first:");
        console.log("   npm start");
    }
}

// Run the demo
runDemo();
