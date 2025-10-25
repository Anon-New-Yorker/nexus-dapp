import type { Merchant } from "./types.js";

// Mock merchant registry - in production this would be a database
const merchants: Merchant[] = [
    {
        id: "merchant_001",
        hederaAccountId: "0.0.123456",
        name: "Coffee Shop Downtown",
        isActive: true
    },
    {
        id: "merchant_002",
        hederaAccountId: "0.0.123457",
        name: "Tech Store Central",
        isActive: true
    },
    {
        id: "merchant_003",
        hederaAccountId: "0.0.123458",
        name: "Bookstore Corner",
        isActive: false
    }
];

export function getMerchantAccount(merchantId: string): string {
    const merchant = merchants.find(m => m.id === merchantId);
    if (!merchant) {
        throw new Error(`Merchant ${merchantId} not found in registry`);
    }
    if (!merchant.isActive) {
        throw new Error(`Merchant ${merchantId} is not active`);
    }
    return merchant.hederaAccountId;
}

export function getMerchant(merchantId: string): Merchant | null {
    return merchants.find(m => m.id === merchantId) || null;
}

export function getAllMerchants(): Merchant[] {
    return merchants;
}

export function addMerchant(merchant: Omit<Merchant, 'id'>): Merchant {
    const newMerchant: Merchant = {
        ...merchant,
        id: `merchant_${String(merchants.length + 1).padStart(3, '0')}`
    };
    merchants.push(newMerchant);
    return newMerchant;
}
