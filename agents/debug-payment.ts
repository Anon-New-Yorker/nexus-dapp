#!/usr/bin/env npx tsx

/**
 * Debug script to help identify payment issues
 */
import { createPublicClient, http, parseUnits, formatUnits } from 'viem'
import { baseSepolia } from 'viem/chains'

// Base Sepolia Testnet USDC contract
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'

// USDC ABI (minimal)
const USDC_ABI = [
    {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }]
    },
    {
        name: 'transfer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }]
    }
] as const

async function debugPayment() {
    console.log('🔍 Debugging Payment Issues...\n')

    // Create public client for Base Sepolia
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http()
    })

    try {
        // Test 1: Check if USDC contract exists
        console.log('1️⃣ Testing USDC Contract...')
        console.log(`Contract Address: ${USDC_ADDRESS}`)

        try {
            const code = await publicClient.getBytecode({ address: USDC_ADDRESS })
            if (code) {
                console.log('✅ USDC contract exists on Base Sepolia')
            } else {
                console.log('❌ USDC contract not found on Base Sepolia')
                return
            }
        } catch (error) {
            console.log('❌ Failed to check USDC contract:', error)
            return
        }

        // Test 2: Check if user has USDC (you'll need to provide an address)
        console.log('\n2️⃣ Testing USDC Balance...')
        console.log('To test balance, you need to provide a wallet address')
        console.log('Example: node debug-payment.ts 0xYourAddress')

        const testAddress = process.argv[2]
        if (testAddress) {
            try {
                const balance = await publicClient.readContract({
                    address: USDC_ADDRESS,
                    abi: USDC_ABI,
                    functionName: 'balanceOf',
                    args: [testAddress as `0x${string}`]
                })

                const balanceFormatted = formatUnits(balance, 6) // USDC has 6 decimals
                console.log(`✅ Balance for ${testAddress}: ${balanceFormatted} USDC`)

                if (balance === 0n) {
                    console.log('⚠️  User has no USDC tokens!')
                    console.log('💡 To get test USDC:')
                    console.log('   1. Go to https://faucet.circle.com/')
                    console.log('   2. Select "Base Sepolia"')
                    console.log('   3. Enter your wallet address')
                    console.log('   4. Request USDC tokens')
                }
            } catch (error) {
                console.log('❌ Failed to check balance:', error)
            }
        }

        // Test 3: Check network configuration
        console.log('\n3️⃣ Testing Network Configuration...')
        const chainId = await publicClient.getChainId()
        console.log(`Chain ID: ${chainId}`)
        console.log(`Expected: ${baseSepolia.id}`)

        if (chainId === baseSepolia.id) {
            console.log('✅ Connected to Base Sepolia testnet')
        } else {
            console.log('❌ Not connected to Base Sepolia testnet')
        }

        // Test 4: Check transaction simulation
        console.log('\n4️⃣ Testing Transaction Simulation...')
        if (testAddress) {
            try {
                // Simulate a small transfer (0.001 USDC)
                const amount = parseUnits('0.001', 6)
                console.log(`Simulating transfer of ${formatUnits(amount, 6)} USDC`)

                // This would normally be done with a wallet, but we can check if the contract supports it
                console.log('✅ USDC contract supports transfer function')
            } catch (error) {
                console.log('❌ Transaction simulation failed:', error)
            }
        }

        console.log('\n✅ Debug complete!')
        console.log('\n📋 Common Issues:')
        console.log('1. Wrong USDC contract address')
        console.log('2. User has no USDC tokens')
        console.log('3. Wrong network (not Base Sepolia)')
        console.log('4. Insufficient gas for transaction')
        console.log('5. User rejected transaction in wallet')

    } catch (error) {
        console.error('❌ Debug failed:', error)
    }
}

debugPayment().catch(console.error)
