import { startMockApiServer } from "./mockApiServer.js";
import { config } from "./hederaClient.js";

console.log("🧪 Starting Hedera Agent System in TEST MODE");
console.log("=".repeat(50));
console.log("⚠️  This mode runs without real Hedera credentials");
console.log("⚠️  Only the mock API server will be active");
console.log("=".repeat(50));

// Start the mock API server
startMockApiServer();

console.log("\n✅ Test mode running!");
console.log("📡 Mock API server is active");
console.log("🧪 Test the API endpoints:");
console.log(`   GET  http://localhost:${config.mockApiPort}/api/deposits`);
console.log(`   POST http://localhost:${config.mockApiPort}/api/test/deposit`);
console.log(`   GET  http://localhost:${config.mockApiPort}/api/agent/status`);
console.log("\n🛑 Press Ctrl+C to stop");

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log("\n🛑 Shutting down test mode...");
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log("\n🛑 Shutting down test mode...");
    process.exit(0);
});


