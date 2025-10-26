import { startAgentA } from "./agentA.js";
import { startAgentB } from "./agentB.js";
import { startMockApiServer } from "./mockApiServer.js";
import { config } from "./hederaClient.js";

console.log("🚀 Starting Hedera Agent System");
console.log("=".repeat(50));

// Display configuration
console.log("📋 Configuration:");
console.log(`   Network: ${config.hederaNetwork}`);
console.log(`   Account: ${config.hederaAccountId}`);
console.log(`   Agent A Topic: ${config.agentATopicId}`);
console.log(`   Agent B Topic: ${config.agentBTopicId}`);
console.log(`   Mock API Port: ${config.mockApiPort}`);
console.log("=".repeat(50));

// Start the mock API server
startMockApiServer();

// Wait a moment for the server to start
setTimeout(() => {
    console.log("\n🤖 Starting Agents...");

    // Start Agent B first (listener)
    startAgentB();

    // Start Agent A (poller)
    startAgentA();

    console.log("\n✅ All systems running!");
    console.log("📡 Monitor the logs above to see the agents in action");
    console.log("🧪 Use the mock API to create test deposit events:");
    console.log(`   curl -X POST http://localhost:${config.mockApiPort}/api/test/deposit`);
    console.log("\n🛑 Press Ctrl+C to stop all services");

}, 2000);

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log("\n🛑 Shutting down Hedera Agent System...");
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log("\n🛑 Shutting down Hedera Agent System...");
    process.exit(0);
});
