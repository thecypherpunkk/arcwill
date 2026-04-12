# ArcWill — Digital Asset Vault

A decentralized digital asset inheritance vault built on **Arc Testnet**. Lock your USDC or EURC in a smart contract — if you don't check in within a set period, your assets are automatically transferred to your chosen beneficiary.

## 🌐 Live Demo

**[https://arcwill.vercel.app](https://arcwill.vercel.app)**

## 🔑 Key Features

- **Create Wills** — Lock USDC or EURC with a beneficiary address and inactivity period
- **Check-in System** — Reset the countdown by checking in periodically
- **Automatic Transfer** — If you don't check in, funds go to your beneficiary
- **Partial Withdraw** — Withdraw part of your locked funds anytime
- **Add Funds** — Top up an existing will
- **Incoming Wills** — Beneficiaries can view and claim wills assigned to them
- **Multi-Token** — Supports both USDC and EURC on Arc Testnet
- **RainbowKit Wallet** — Professional wallet connection (MetaMask, WalletConnect, Coinbase)

## 🏗 Tech Stack

- **Blockchain:** Arc Testnet (Chain ID: 5042002)
- **Smart Contract:** Solidity 0.8.19
- **Frontend:** React (Vite)
- **Wallet:** RainbowKit + wagmi
- **Web3:** ethers.js v6
- **Visual:** Three.js shader background
- **Hosting:** Vercel

## 📋 Smart Contracts

| Contract | Address |
|----------|---------|
| ArcWill (Multi-Token) | `0xe83675f6f3f2C9538171ce07bacb4f790b5Ae871` |
| USDC (Arc Testnet) | `0x3600000000000000000000000000000000000000` |
| EURC (Arc Testnet) | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MetaMask with Arc Testnet configured
- Test USDC/EURC from [Circle Faucet](https://faucet.circle.com)

### Arc Testnet Configuration
| Parameter | Value |
|-----------|-------|
| Network Name | Arc Testnet |
| RPC URL | `https://rpc.testnet.arc.network` |
| Chain ID | 5042002 |
| Currency | USDC |
| Explorer | [testnet.arcscan.app](https://testnet.arcscan.app) |

### Installation

```bash
git clone https://github.com/thecypherpunkk/arcwill.git
cd arcwill
npm install
npm run dev
```

## 📖 How It Works

1. **Connect Wallet** — Connect your MetaMask to Arc Testnet
2. **Create a Will** — Choose USDC or EURC, set amount, beneficiary, and inactivity period
3. **Check-in Periodically** — Reset the countdown to keep your will active
4. **If You Don't Check-in** — After the inactivity period, beneficiary can claim the funds
5. **Manage Anytime** — Add funds, partial withdraw, or cancel your will

## 🔗 Links

- [Arc Network](https://arc.network)
- [Arc Docs](https://docs.arc.network)
- [Circle Faucet](https://faucet.circle.com)
- [ArcScan Explorer](https://testnet.arcscan.app)
- [Contract on ArcScan](https://testnet.arcscan.app/address/0xe83675f6f3f2C9538171ce07bacb4f790b5Ae871)

## 📄 License

MIT