# Nexus & Blockscout Integration

A cross-chain payment analytics system powered by Hedera Agent Kit and Base network integration with Blockscout API for comprehensive transaction monitoring.

## 🚀 Features

- **Multi-Wallet Support**: Connect with MetaMask, WalletConnect, Coinbase Wallet, and more
- **Cross-Chain Analytics**: Real-time payment tracking across Base network
- **Hedera Agent Integration**: Automated payment processing with Hedera Agent Kit
- **Dynamic Recipients**: Send payments to any Ethereum address
- **Real-time Dashboard**: Live analytics and transaction monitoring
- **Role-Based Authentication**: Merchant and User account types with Privy integration
- **Blockscout Integration**: Comprehensive blockchain analytics and transaction history

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS 3
- **Authentication**: Privy (role-based auth with email/Google/wallet support)
- **Wallet Integration**: RainbowKit, Wagmi, Viem
- **Blockchain**: Base Network, Hedera
- **Analytics**: Blockscout API

## ✨ Design Features

- **Professional Design**: MAANG-quality UI inspired by Stripe, Vercel, and Linear
- **Clean Dark Theme**: Sophisticated color palette with refined accent colors
- **Purposeful Animations**: Minimal transitions only where they enhance UX (KPI count-up)
- **Interactive Elements**: Subtle hover effects, copy buttons, status indicators
- **System Typography**: Native fonts for optimal performance and familiarity
- **Toast Notifications**: Real-time user feedback with Sonner
- **Responsive Layout**: Professional grid systems and proper breakpoints
- **Form Design**: Clean inputs with proper focus states and validation
- **Data Tables**: Professional tables with clear hierarchy and spacing

## 📦 Project Structure

```
/
├── apps/
│   └── web/               # Next.js frontend application
│       ├── app/           # App router pages and API routes
│       │   ├── api/       # API endpoints
│       │   │   ├── merchant/summary/  # Merchant inbound analytics
│       │   │   ├── user/spending/     # User outbound analytics
│       │   │   └── agent/receipt/     # Agent payment receipts
│       │   ├── components/  # Shared components
│       │   │   ├── LoginModal.tsx   # Role selection modal
│       │   │   └── NavBar.tsx       # Navigation with auth
│       │   ├── context/     # React context providers
│       │   │   └── UserContext.tsx  # User role management
│       │   ├── dashboard/   # Dashboard pages
│       │   │   ├── page.tsx           # Dashboard router
│       │   │   ├── MerchantDashboard.tsx  # Merchant view
│       │   │   └── UserDashboard.tsx      # User view
│       │   ├── pay/         # Payment interface page
│       │   ├── layout.tsx   # Root layout with providers
│       │   ├── page.tsx     # Homepage
│       │   └── providers.tsx # Privy/RainbowKit/Wagmi setup
│       └── package.json   # Frontend dependencies
├── agents/
│   ├── merchant-agent.js  # Hedera agent implementation (JS)
│   └── merchant-agent.ts  # Hedera agent implementation (TS)
└── package.json           # Root package.json
```

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/Anon-New-Yorker/nexus-and-blockscout-integration.git
cd nexus-and-blockscout-integration
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

4. Configure your environment variables in `apps/web/.env.local`:
```
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_BLOCKSCOUT_BASE=https://base.blockscout.com/api
NEXT_PUBLIC_MERCHANT_ADDRESS=your_merchant_address
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

5. Start the development server:
```bash
npm run dev
```

## 🌐 Usage

### Authentication & Roles
- **Login Options**: Email, Google, or wallet connection via Privy
- **Role Selection**: Choose between Merchant or User account types
- **Role Persistence**: Account type saved in localStorage

### Dashboard
Visit `http://localhost:5000/dashboard` to view:

**For Merchants**:
- Total inbound revenue with animated count-up
- Total outbound spending tracking
- Net income calculation
- Inbound/outbound transaction lists
- Live Recharts visualization
- Real-time data updates every 10 seconds

**For Users**:
- Total spending overview
- Average transaction value
- Transaction count tracking
- Spending history chart
- Detailed transaction table with BaseScan links

### Payment Interface
Visit `http://localhost:5000/pay` to:
- Connect your wallet (supports 20+ wallets)
- Enter payment amount
- Specify recipient address
- Process cross-chain payments

## 🔧 API Endpoints

- `GET /api/merchant/summary?address={address}` - Base network analytics for merchants
- `GET /api/user/spending?address={address}` - User spending analytics
- `POST /api/agent/receipt` - Hedera agent payment receipts
- `GET /api/agent/receipt` - Retrieve payment history

## 🤖 Hedera Agent Integration

The system integrates with Hedera Agent Kit for automated payment processing:

```javascript
// Agent payment receipt
{
  "txHash": "0x...",
  "from": "sender_address",
  "to": "recipient_address", 
  "amount": "100.0",
  "token": "USDC",
  "timestamp": "2025-10-24T21:00:00Z"
}
```

## 📊 Analytics Features

- **Real-time Updates**: Live transaction monitoring
- **Cross-chain Data**: Base network integration via Blockscout API
- **Agent Payments**: Hedera agent transaction tracking
- **Revenue Analytics**: Total USDC calculations
- **Transaction History**: Complete payment logs
- **Role-Based Views**: Different analytics for merchants vs users

## 🔗 Supported Networks

- **Base Network**: Primary payment network
- **Ethereum**: Wallet connection support
- **Hedera**: Agent integration
- **Multi-chain**: Extensible architecture

## ⚠️ Important Notes

- **Agent Receipts**: Currently stored in-memory (not persistent). For production use, implement a database backend.
- **Development**: Configured for Replit environment (port 5000, 0.0.0.0 binding)
- **Real Data**: Dashboard pulls actual transaction data from Base network via Blockscout API
- **Form Validation**: Client-side validation for addresses and amounts with user-friendly error messages

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Hedera Agent Kit](https://github.com/hashgraph/hedera-agent-kit) for agent integration
- [RainbowKit](https://www.rainbowkit.com/) for wallet connection
- [Base Network](https://base.org/) for blockchain infrastructure
- [Blockscout](https://blockscout.com/) for blockchain analytics
- [Privy](https://privy.io/) for authentication