import { Client, AccountBalanceQuery, AccountId } from "@hashgraph/sdk";
import { config } from "./hederaClient.js";

/**
 * Script to check and fund Hedera account for testing
 * This helps resolve INSUFFICIENT_PAYER_BALANCE errors
 */
async function checkAndFundAccount() {
    try {
        console.log("💰 Checking Hedera account balance...");
        console.log(`Account ID: ${config.hederaAccountId}`);
        console.log(`Network: ${config.hederaNetwork}`);

        const client = Client.forName(config.hederaNetwork)
            .setOperator(config.hederaAccountId, config.hederaPrivateKey);

        // Check current balance
        const query = new AccountBalanceQuery().setAccountId(config.hederaAccountId);
        const balance = await query.execute(client);
        const hbarBalance = balance.hbars.toTinybars().toNumber() / 100000000;

        console.log(`📊 Current balance: ${hbarBalance} HBAR`);

        if (hbarBalance < 10) {
            console.log("⚠️  Low balance detected!");
            console.log("🔧 To fix this issue:");
            console.log("1. Go to https://portal.hedera.com/");
            console.log("2. Create a testnet account or use an existing one");
            console.log("3. Get test HBAR from the faucet");
            console.log("4. Update your .env file with the new account details");
            console.log("");
            console.log("📝 Required environment variables:");
            console.log(`HEDERA_ACCOUNT_ID=${config.hederaAccountId}`);
            console.log(`HEDERA_PRIVATE_KEY=your_private_key_here`);
            console.log(`HEDERA_NETWORK=${config.hederaNetwork}`);
            console.log("");
            console.log("💡 For testing, you can also use the Hedera testnet faucet:");
            console.log("   https://portal.hedera.com/");
        } else {
            console.log("✅ Account has sufficient balance for testing");
        }

    } catch (error) {
        console.error("❌ Failed to check account balance:", error);
        console.log("");
        console.log("🔧 Troubleshooting steps:");
        console.log("1. Verify your .env file has correct Hedera credentials");
        console.log("2. Make sure you're using testnet credentials");
        console.log("3. Check that your account exists and is active");
        console.log("4. Ensure you have some HBAR in your account");
    }
}

// Run the check
checkAndFundAccount().catch(console.error);
