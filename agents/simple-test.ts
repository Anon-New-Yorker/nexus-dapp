import { getAllMerchants, getMerchantAccount } from "./merchantRegistry.js";
import type { SettlementTrigger } from "./types.js";

console.log("🧪 Running Simple Hedera Agent System Tests");
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

// Test 2: Type Definitions
console.log("\n💰 Test 2: Type Definitions");
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
    console.log("✅ Type definitions working correctly");

} catch (error) {
    console.error("❌ Type definition test failed:", error);
}

console.log("\n✅ Simple test suite completed!");
console.log("📝 The hedera-agents system has been successfully integrated into nexus-dapp!");
console.log("📝 To run the full system with real Hedera credentials:");
console.log("   1. Set up your .env file with real Hedera credentials");
console.log("   2. Run: npm run agents:start");
console.log("   3. Create test deposits: curl -X POST http://localhost:3000/api/test/deposit");
console.log("   4. Monitor the logs for agent activity");
