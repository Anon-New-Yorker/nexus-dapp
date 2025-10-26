#!/usr/bin/env npx tsx

/**
 * Test script to verify the agent payment fixes
 */
import { checkSufficientBalance, getAccountBalance } from "./hederaClient.js";
import { config } from "./hederaClient.js";

async function testFixes() {
    console.log("🧪 Testing Agent Payment Fixes...\n");

    // Test 1: Check Hedera account balance
    console.log("1️⃣ Testing Hedera Account Balance");
    try {
        const balance = await getAccountBalance(config.hederaAccountId);
        console.log(`   ✅ Account balance: ${balance} HBAR`);

        if (balance < 1) {
            console.log("   ⚠️  Low balance - may cause INSUFFICIENT_PAYER_BALANCE errors");
            console.log("   💡 Run: npx tsx fund-account.ts for funding instructions");
        } else {
            console.log("   ✅ Sufficient balance for testing");
        }
    } catch (error) {
        console.log(`   ❌ Balance check failed: ${error}`);
    }

    // Test 2: Test balance checking function
    console.log("\n2️⃣ Testing Balance Validation");
    try {
        const hasEnough = await checkSufficientBalance(config.hederaAccountId, 1);
        console.log(`   ✅ Balance validation: ${hasEnough ? 'Sufficient' : 'Insufficient'} for 1 HBAR transfer`);
    } catch (error) {
        console.log(`   ❌ Balance validation failed: ${error}`);
    }

    // Test 3: Check mock API server
    console.log("\n3️⃣ Testing Mock API Server");
    try {
        const response = await fetch(`http://localhost:${config.mockApiPort}/api/deposits`);
        if (response.ok) {
            const deposits = await response.json();
            console.log(`   ✅ Mock API server responding: ${deposits.length} deposit events`);
        } else {
            console.log(`   ❌ Mock API server not responding: ${response.status}`);
        }
    } catch (error) {
        console.log(`   ❌ Mock API server not accessible: ${error}`);
        console.log("   💡 Start the mock API server: npm run start");
    }

    // Test 4: Check agent topics
    console.log("\n4️⃣ Testing Agent Configuration");
    console.log(`   📡 Agent A Topic: ${config.agentATopicId}`);
    console.log(`   📡 Agent B Topic: ${config.agentBTopicId}`);
    console.log(`   🌐 Network: ${config.hederaNetwork}`);
    console.log(`   🏦 Account: ${config.hederaAccountId}`);

    console.log("\n✅ Fix verification complete!");
    console.log("\n📋 Next steps:");
    console.log("1. Start the mock API server: npm run start");
    console.log("2. Start the agents: npm run start:agents");
    console.log("3. Start the web app: cd apps/web && npm run dev");
    console.log("4. Test a payment through the web interface");
}

testFixes().catch(console.error);
