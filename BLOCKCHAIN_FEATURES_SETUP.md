# Blockchain Features Setup Guide

## Overview

This guide explains how to enable and use the blockchain features in ZK-IoTChain, including MetaMask wallet integration, on-chain device registration, and transaction management.

## Prerequisites

1. **Python Environment** (for backend)
   - Python 3.11 or 3.12 (NOT 3.13 due to known issues)
   - All dependencies from `backend/requirements.txt`

2. **Sepolia Testnet ETH**
   - Get free Sepolia ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
   - Minimum 0.1 ETH recommended

3. **RPC Provider**
   - Sign up for free at [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)
   - Create a new app for Sepolia testnet
   - Copy your API key

4. **WalletConnect Project ID**
   - Create free account at [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy your Project ID

## Backend Setup

### 1. Configure Environment

Edit `backend/.env`:

```bash
MONGO_URL="mongodb://localhost:27017"
DB_NAME="zkiotchain"
CORS_ORIGINS="*"

# Blockchain Configuration
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/<YOUR_ALCHEMY_API_KEY>"
PRIVATE_KEY="<YOUR_WALLET_PRIVATE_KEY>"
```

> **⚠️ IMPORTANT**: Never commit your private key to version control!

### 2. Deploy Smart Contracts

```bash
cd backend
npx hardhat run scripts/deploy.js --network sepolia
```

This will:
- Deploy ZKPVerifier, DeviceRegistry, and MerkleAnchor contracts
- Create `deployment.json` with contract addresses
- Verify contracts on Etherscan (if configured)

### 3. Start Backend Server

```bash
python -m uvicorn server:app --reload --port 8001
```

### 4. Verify Blockchain Endpoints

```bash
# Check connection status
curl http://localhost:8001/api/blockchain/status

# Get network info
curl http://localhost:8001/api/blockchain/network

# Estimate gas for device registration
curl -X POST http://localhost:8001/api/blockchain/estimate-gas \
  -H "Content-Type: application/json" \
  -d '{"operation": "register_device", "device_id": "test123", "device_type": "healthcare", "secret": "mysecret"}'
```

## Frontend Setup

### 1. Configure Environment

Edit `frontend/.env`:

```bash
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001

# Blockchain Configuration
EXPO_PUBLIC_CHAIN_ID=11155111
EXPO_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<YOUR_ALCHEMY_API_KEY>
EXPO_PUBLIC_ETHERSCAN_URL=https://sepolia.etherscan.io
EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=<YOUR_WALLETCONNECT_PROJECT_ID>
```

### 2. Install Dependencies

```bash
cd frontend
npm install --legacy-peer-deps
```

### 3. Wrap App with WagmiConfig

Edit `app/_layout.tsx` to add WagmiConfig provider:

```tsx
import { WagmiConfig } from 'wagmi';
import { config } from '../utils/web3';

export default function RootLayout() {
  return (
    <WagmiConfig config={config}>
      {/* Your existing layout */}
    </WagmiConfig>
  );
}
```

### 4. Start Development Server

```bash
npx expo start --web
```

## Using Blockchain Features

### Connect Wallet

1. Open the app
2. Navigate to any screen
3. Click "Connect Wallet" button
4. Choose MetaMask or scan QR with mobile wallet
5. Approve connection in your wallet

### Register Device On-Chain

1. Go to **Devices** tab
2. Fill in device details
3. **Enable "Register On-Chain" option**
4. Click "Register Device"
5. Review gas estimation in modal
6. Click "Confirm Transaction"
7. Approve transaction in MetaMask
8. Wait for confirmation (view on Etherscan)

### Authenticate Device On-Chain

Similar flow to registration - device authentication can be done on-chain to create an immutable audit trail.

### View Blockchain Stats

- **Profile Tab**: View wallet balance, transaction history, Etherscan links
- **Home Tab**: See blockchain connection status, gas prices, on-chain metrics

## Troubleshooting

### "Blockchain client not available"

**Cause**: Smart contracts not deployed

**Solution**: Run deployment script with proper RPC URL and private key

### "Wrong network" warning

**Cause**: Wallet connected to wrong network (e.g., Mainnet instead of Sepolia)

**Solution**: Switch to Sepolia network in MetaMask settings

### "Insufficient funds for gas"

**Cause**: Not enough Sepolia ETH for transaction

**Solution**: Get more Sepolia ETH from faucet

### Gas estimation fails

**Cause**: Backend can't connect to blockchain or invalid inputs

**Solution**: 
- Verify SEPOLIA_RPC_URL is correct
- Check backend logs for errors
- Ensure MongoDB is running

## Gas Costs Reference

Typical gas costs on Sepolia (may vary):

| Operation | Gas Units | Approx Cost (@ 2 Gwei) |
|-----------|-----------|------------------------|
| Device Registration | ~300,000 | ~0.0006 ETH |
| Device Authentication | ~200,000 | ~0.0004 ETH |
| Merkle Root Anchoring | ~150,000 | ~0.0003 ETH |

## Security Best Practices

1. **Never expose private keys** in frontend code
2. **Use environment variables** for all sensitive data
3. **Test on Sepolia** before mainnet deployment
4. **Implement rate limiting** on backend endpoints
5. **Validate all inputs** before blockchain calls
6. **Monitor gas prices** to avoid overpaying

## Network Information

- **Sepolia Chain ID**: 11155111
- **Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepoliafaucet.com
- **RPC**: Use Alchemy or Infura (free tier available)

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/)
- [WalletConnect Docs](https://docs.walletconnect.com/)
- [wagmi Documentation](https://wagmi.sh/)
- [Sepolia Testnet Info](https://sepolia.dev/)
