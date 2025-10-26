import { pollDeposits } from "./agentA.js";
import { processSettlementTrigger } from "./agentB.js";
import { getMerchantAccount, getAllMerchants } from "./merchantRegistry.js";
import type { SettlementTrigger } from "./types.js";

console.log("🧪 Running Hedera Agent System Tests");
console.log("=".repeat(50));

// Test 1: Merchant Registry
console.log("\n📋 Test 1: Merchant Registry");
try {
    const merchants = getAllMerchants();
    console.log(`✅ Found ${merchants.length} merchants in registry`);

    merchants.forEach(merchant => {
        console.log(`   - ${merchant.name} (${merchant.id}): ${merchant.hederaAccountId} [${merchant.isActive ? 'Active' : 'Inactive'}]`);
    });

    // Test getting merchant account
    const testMerchantId = "merchant_001";
    const accountId = getMerchantAccount(testMerchantId);
    console.log(`✅ Merchant ${testMerchantId} account: ${accountId}`);

} catch (error) {
    console.error("❌ Merchant registry test failed:", error);
}

// Test 2: Settlement Trigger Processing
console.log("\n💰 Test 2: Settlement Trigger Processing");
try {
    const testTrigger: SettlementTrigger = {
        type: "SETTLEMENT_TRIGGER",
        merchantId: "merchant_001",
        token: "USDC",
        amount: 100,
        txHash: "0x1234567890abcdef",
        timestamp: Date.now()
    };

    console.log("📤 Test settlement trigger:", testTrigger);
    console.log("⚠️  Note: This test will fail without real Hedera credentials");
    console.log("   In a real environment, this would execute the transfer");

    // Uncomment to test with real credentials:
    // await processSettlementTrigger(testTrigger);

} catch (error) {
    console.error("❌ Settlement trigger test failed:", error);
}

// Test 3: API Integration
console.log("\n📡 Test 3: API Integration");
try {
    console.log("🔍 Testing deposit polling...");
    console.log("⚠️  Note: This test requires the mock API server to be running");
    console.log("   Start the system with: npm start");
    console.log("   Then run: curl -X POST http://localhost:3000/api/test/deposit");

    // Uncomment to test with running API:
    // await pollDeposits();

} catch (error) {
    console.error("❌ API integration test failed:", error);
}

console.log("\n✅ Test suite completed!");
console.log("📝 To run the full system:");
console.log("   1. Set up your .env file with real Hedera credentials");
console.log("   2. Run: npm start");
console.log("   3. Create test deposits: curl -X POST http://localhost:3000/api/test/deposit");
console.log("   4. Monitor the logs for agent activity");
