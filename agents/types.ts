export interface SettlementTrigger {
    type: "SETTLEMENT_TRIGGER";
    merchantId: string;
    token: string;
    amount: number;
    txHash: string;
    timestamp: number;
}

export interface SettlementConfirmed {
    type: "SETTLEMENT_CONFIRMED";
    merchantId: string;
    txHash: string;
    hederaTxId: string;
    status: string;
    timestamp: number;
}

export interface DepositEvent {
    txHash: string;
    fromWallet: string;
    amount: number;
    token: string;
    merchantId: string;
    timestamp: number;
}

export interface Merchant {
    id: string;
    hederaAccountId: string;
    name: string;
    isActive: boolean;
}

export interface AgentConfig {
    hederaNetwork: string;
    hederaAccountId: string;
    hederaPrivateKey: string;
    agentATopicId: string;
    agentBTopicId: string;
    mockApiPort: number;
}
