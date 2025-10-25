const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Simulated agent class for demonstration
class MerchantAgent {
  constructor(config) {
    this.name = config.name;
    this.role = config.role;
  }

  async handlePaymentConfirmation(msg) {
    console.log("📩 Received A2A message:", msg);

    if (msg.type === "payment.confirmation") {
      const { txHash, from, to, amount, token } = msg.data;
      console.log("✅ Logging payment to merchant dashboard...");

      try {
        const response = await fetch("http://localhost:3000/api/agent/receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            txHash,
            from,
            to,
            amount,
            token,
            timestamp: new Date().toISOString(),
          }),
        });

        const result = await response.json();
        console.log("📊 Dashboard response:", result);
      } catch (error) {
        console.error("❌ Error posting to dashboard:", error);
      }
    }
  }
}

// Create and run the agent
const agent = new MerchantAgent({
  name: "MerchantAgent",
  role: "merchant",
});

// Simulate receiving a payment confirmation
(async () => {
  const fakeMsg = {
    type: "payment.confirmation",
    data: {
      txHash: "0xHEDERA123",
      from: "0xHederaUser",
      to: "0x76520dB38f6Dd54a5c8F10a9EB130b8171A1715d",
      amount: "25.0",
      token: "USDC",
    },
  };
  
  await agent.handlePaymentConfirmation(fakeMsg);
})();
