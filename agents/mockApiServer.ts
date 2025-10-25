import express from "express";
import type { DepositEvent } from "./types.js";
import { config } from "./hederaClient.js";

const app = express();
app.use(express.json());

// Mock deposit events storage
let depositEvents: DepositEvent[] = [];
let eventIdCounter = 1;

// Add some initial mock events
const initialEvents: DepositEvent[] = [
    {
        txHash: "0x1234567890abcdef",
        fromWallet: "0xabcdef1234567890",
        amount: 100,
        token: "USDC",
        merchantId: "merchant_001",
        timestamp: Date.now() - 300000 // 5 minutes ago
    },
    {
        txHash: "0x9876543210fedcba",
        fromWallet: "0xfedcba0987654321",
        amount: 250,
        token: "USDC",
        merchantId: "merchant_002",
        timestamp: Date.now() - 120000 // 2 minutes ago
    }
];

depositEvents.push(...initialEvents);

// API Routes
app.get("/api/deposits", (req, res) => {
    console.log(`📡 GET /api/deposits - returning ${depositEvents.length} events`);
    res.json(depositEvents);
});

app.post("/api/deposits", (req, res) => {
    const newEvent: DepositEvent = {
        ...req.body,
        timestamp: Date.now()
    };
    depositEvents.push(newEvent);
    console.log(`📡 POST /api/deposits - added new event:`, newEvent);
    res.json({ success: true, event: newEvent });
});

app.get("/api/agent/status", (req, res) => {
    const status = {
        agentA: {
            status: "running",
            lastPoll: new Date().toISOString(),
            eventsProcessed: depositEvents.length
        },
        agentB: {
            status: "running",
            lastMessage: new Date().toISOString(),
            settlementsCompleted: 0
        }
    };
    res.json(status);
});

// Add a new deposit event (for testing)
app.post("/api/test/deposit", (req, res) => {
    const testEvent: DepositEvent = {
        txHash: `0x${Math.random().toString(16).substr(2, 8)}`,
        fromWallet: `0x${Math.random().toString(16).substr(2, 8)}`,
        amount: Math.floor(Math.random() * 500) + 50,
        token: "USDC",
        merchantId: `merchant_00${Math.floor(Math.random() * 3) + 1}`,
        timestamp: Date.now()
    };

    depositEvents.push(testEvent);
    console.log(`🧪 Test deposit event created:`, testEvent);
    res.json({ success: true, event: testEvent });
});

export function startMockApiServer(): void {
    const port = config.mockApiPort;
    app.listen(port, () => {
        console.log(`🚀 Mock API server running on http://localhost:${port}`);
        console.log(`📡 Available endpoints:`);
        console.log(`   GET  /api/deposits - Get all deposit events`);
        console.log(`   POST /api/deposits - Add new deposit event`);
        console.log(`   GET  /api/agent/status - Get agent status`);
        console.log(`   POST /api/test/deposit - Create test deposit event`);
    });
}

export { app };
