# 🔐 ZK-IoTChain Blockchain Setup Guide

## Overview
This guide will help you set up the blockchain infrastructure for the ZK-IoTChain project, including:
- Getting Sepolia testnet ETH
- Configuring your wallet
- Deploying smart contracts
- Connecting the mobile app

---

## Step 1: Create a Wallet (If you don't have one)

### Option A: Using MetaMask
1. Install MetaMask browser extension: https://metamask.io/
2. Create a new wallet and **save your seed phrase securely**
3. Switch to Sepolia testnet in MetaMask
4. Export your private key:
   - Click on the account icon → Account details → Export Private Key
   - **Keep this EXTREMELY SECURE - never share it publicly**

### Option B: Generate a new wallet programmatically
```bash
cd /app/backend
node -e "const ethers = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private Key:', wallet.privateKey);"
```

---

## Step 2: Get Sepolia Testnet ETH (Free)

You need testnet ETH to deploy contracts and pay for gas fees.

### Sepolia Faucets:
1. **Alchemy Sepolia Faucet** (Recommended)
   - URL: https://sepoliafaucet.com/
   - Requires Alchemy account (free)
   - Provides 0.5 SepoliaETH per request

2. **Infura Sepolia Faucet**
   - URL: https://www.infura.io/faucet/sepolia
   - Requires Infura account (free)

3. **QuickNode Faucet**
   - URL: https://faucet.quicknode.com/ethereum/sepolia
   - Multiple requests allowed

**You'll need at least 0.1 SepoliaETH for deployment and testing**

---

## Step 3: Get a Sepolia RPC URL

You need an RPC endpoint to connect to Sepolia blockchain.

### Option A: Alchemy (Recommended)
1. Sign up at https://www.alchemy.com/
2. Create a new app → Select "Ethereum" → "Sepolia" network
3. Copy your API key
4. Your RPC URL: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

### Option B: Infura
1. Sign up at https://www.infura.io/
2. Create a new project
3. Copy your Project ID
4. Your RPC URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

### Option C: Public RPC (Not recommended for production)
```
https://rpc.sepolia.org
https://ethereum-sepolia-rpc.publicnode.com
```

---

## Step 4: Configure Backend Environment

Update `/app/backend/.env` file:

```bash
# MongoDB (already configured)
MONGO_URL=mongodb://localhost:27017
DB_NAME=zkiotchain

# Blockchain Configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# CORS (for mobile app)
CORS_ORIGINS=*
```

**Security Warning**: In production, NEVER commit private keys to git!

---

## Step 5: Compile Smart Contracts

```bash
cd /app/backend
npx hardhat compile
```

This will:
- Compile DeviceRegistry.sol
- Compile MerkleAnchor.sol
- Compile ZKPVerifier.sol
- Generate ABIs in `/app/backend/artifacts/`

---

## Step 6: Deploy Smart Contracts to Sepolia

```bash
cd /app/backend
npx hardhat run scripts/deploy.js --network sepolia
```

**Expected Output:**
```
Deploying ZK-IoTChain Smart Contracts to Sepolia...
Deploying ZKPVerifier...
ZKPVerifier deployed to: 0x123...
Deploying MerkleAnchor...
MerkleAnchor deployed to: 0x456...
Deploying DeviceRegistry...
DeviceRegistry deployed to: 0x789...
Deployment complete!
```

This creates `/app/backend/deployment.json` with contract addresses.

---

## Step 7: Verify Deployment

Check your deployment on Sepolia Etherscan:
```
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
```

View your transactions:
```
https://sepolia.etherscan.io/address/YOUR_WALLET_ADDRESS
```

---

## Step 8: Test Backend APIs

Start the backend server:
```bash
sudo supervisorctl restart backend
```

Test device registration:
```bash
curl -X POST http://localhost:8001/api/devices/register \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "iot-device-001",
    "device_name": "Smart Thermostat",
    "device_type": "smart-city",
    "secret": "my-secure-secret-123"
  }'
```

---

## Step 9: Configure Mobile App

The mobile app will connect to your backend. Make sure your backend URL is accessible.

If testing locally with Expo:
```bash
# Get your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Update mobile app API base URL in `/app/frontend/utils/api.ts` if needed.

---

## Troubleshooting

### "Insufficient funds" error
- Make sure your wallet has Sepolia ETH
- Check balance: `npx hardhat run scripts/checkBalance.js --network sepolia`

### "Invalid nonce" error
- Clear Hardhat cache: `npx hardhat clean`
- Delete `/app/backend/cache` folder

### "Connection refused" error
- Check your RPC URL is correct
- Try a different RPC provider

### "Gas too high" error
- Sepolia gas prices fluctuate
- Wait a few minutes and try again

---

## Estimated Costs (Sepolia Testnet)

All costs are in testnet ETH (free):
- Deploy ZKPVerifier: ~0.0015 ETH
- Deploy MerkleAnchor: ~0.001 ETH
- Deploy DeviceRegistry: ~0.002 ETH
- Register device: ~0.0005 ETH per device
- Anchor Merkle root: ~0.0003 ETH per batch

**Total deployment: ~0.005 SepoliaETH**

---

## Next Steps

✅ After successful deployment:
1. Note your contract addresses from `deployment.json`
2. Restart backend server
3. Test API endpoints
4. Run mobile app and connect wallet
5. Register your first IoT device!

---

## Production Deployment (Mainnet)

⚠️ **DO NOT deploy to mainnet without**:
1. Full security audit
2. Production ZKP circuits (snarkjs + circom)
3. Hardware security modules for key management
4. Comprehensive testing on testnet
5. Gas optimization

Current implementation is for **educational/research purposes**.

---

## Support

If you encounter issues:
1. Check Hardhat console for error messages
2. Verify your Sepolia ETH balance
3. Confirm RPC URL is accessible
4. Check backend logs: `tail -f /var/log/supervisor/backend.*.log`
