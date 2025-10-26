// Helper script to fix private key format
const ethPrivateKey = "0x8f6297972dfddd3d708cc68f8fe3bf4256c6a1270c7ce27194c214e7887bb752";

console.log("🔧 Private Key Format Fix");
console.log("=".repeat(50));
console.log("❌ Current (Ethereum format):", ethPrivateKey);
console.log("✅ Hedera format (remove 0x):", ethPrivateKey.slice(2));
console.log("=".repeat(50));
console.log("📝 Update your .env file:");
console.log(`HEDERA_PRIVATE_KEY=${ethPrivateKey.slice(2)}`);
console.log("=".repeat(50));
console.log("⚠️  Note: Make sure your account has sufficient HBAR for transactions");


