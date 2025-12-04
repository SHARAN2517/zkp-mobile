# Quick Start Guide for Advanced Features

## Step 2: Configure Networks ✅

The `.env` file has been updated with multi-chain RPC URLs:

```env
# Multi-Chain Support - Polygon Networks
POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGON_RPC_URL=https://polygon-rpc.com

# Multi-Chain Support - BSC Networks
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
BSC_RPC_URL=https://bsc-dataseed1.binance.org
```

**Optional**: Get better RPC URLs from:
- Polygon: https://alchemy.com or https://infura.io
- BSC: https://www.bnbchain.org/en/rpc

---

## Step 3: Deploy Contracts to New Networks

### Deploy to Polygon Mumbai (Testnet)

```bash
cd backend
npx hardhat run scripts/deploy.js --network polygonMumbai
```

**Note**: You'll need:
- MATIC tokens for gas (get from https://faucet.polygon.technology)
- Your PRIVATE_KEY in `.env`

### Deploy to BSC Testnet

```bash
cd backend
npx hardhat run scripts/deploy.js --network bscTestnet
```

**Note**: You'll need:
- BNB tokens for gas (get from https://testnet.binance.org/faucet-smart)
- Your PRIVATE_KEY in `.env`

### Deploy to All Networks (Optional)

```bash
# Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Polygon Mumbai
npx hardhat run scripts/deploy.js --network polygonMumbai

# BSC Testnet
npx hardhat run scripts/deploy.js --network bscTestnet
```

Each deployment will create a `deployment-{network}.json` file with contract addresses.

---

## Step 4: Test the Features

### Option 1: Install New Dependencies First

```bash
cd backend
pip install python-socketio==5.11.0
pip install aiohttp==3.9.5
pip install py_ecc==6.0.0
```

### Option 2: Run Full Test Suite

**For Windows (PowerShell):**
```powershell
cd backend
.\test_advanced_features.ps1
```

**For Linux/Mac:**
```bash
cd backend
chmod +x test_advanced_features.sh
./test_advanced_features.sh
```

### Option 3: Manual Testing (If server is running)

Test each feature individually:

```bash
# 1. Multi-Blockchain
curl http://localhost:8001/api/multichain/networks

# 2. ZKP Schemes
curl http://localhost:8001/api/zkp/schemes

# 3. Real-Time Monitoring
curl -X POST http://localhost:8001/api/realtime/device/test-001/heartbeat
curl http://localhost:8001/api/realtime/devices/status

# 4. Analytics
curl http://localhost:8001/api/analytics/overview

# 5. Multi-Signature
curl http://localhost:8001/api/multisig/proposals

# 6. Cross-Chain
curl http://localhost:8001/api/cross-chain/sync-status
```

---

## Quick Start Commands

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start Backend Server
```bash
cd backend
python server.py
# or if using uvicorn:
uvicorn server:app --reload --port 8001
```

### 3. Run Tests
```powershell
# Windows
.\test_advanced_features.ps1

# Linux/Mac  
./test_advanced_features.sh
```

---

## Expected Test Results

When you run the test script, you should see:

```
🧪 Testing ZK-IoTChain Advanced Features
==========================================

=== 1. Multi-Blockchain Support ===
✓ PASSED - List Networks
✓ PASSED - Get Sepolia Network
✓ PASSED - Switch to Polygon Mumbai

=== 2. Enhanced ZKP Schemes ===
✓ PASSED - List ZKP Schemes

=== 3. Real-Time Monitoring ===
✓ PASSED - Device Heartbeat
✓ PASSED - Get Device Statuses
✓ PASSED - Get Event History

=== 4. Advanced Analytics ===
✓ PASSED - Analytics Overview
✓ PASSED - Proof Analytics
✓ PASSED - Blockchain Analytics

=== 5. Multi-Signature Registration ===
✓ PASSED - List Multi-Sig Proposals
✓ PASSED - List Authorized Signers
✓ PASSED - Create Multi-Sig Proposal

=== 6. Cross-Chain Data Anchoring ===
✓ PASSED - Get Cross-Chain Sync Status
✓ PASSED - List Cross-Chain Anchors

==========================================
Tests Passed: 15
Tests Failed: 0

🎉 All tests passed!
```

---

## Troubleshooting

### Server Not Running
```bash
cd backend
python server.py
```

### Dependencies Missing
```bash
pip install python-socketio aiohttp py_ecc
```

### MongoDB Not Running
```bash
# Start MongoDB service
# Windows: net start MongoDB
# Linux: sudo systemctl start mongod
# Mac: brew services start mongodb-community
```

### Port Already in Use
```bash
# Change port in server startup or kill process on 8001
# Windows: netstat -ano | findstr :8001
# Linux/Mac: lsof -ti:8001 | xargs kill
```

---

## Next: Integrate Advanced Endpoints

The advanced endpoints are in `backend/advanced_endpoints.py`. 

To integrate them into your main server, add this to `backend/server.py`:

```python
# Add to imports section
from analytics import AnalyticsEngine
from realtime_monitor import realtime_monitor
from snark_zkp import enhanced_zkp_generator
from multisig_manager import MultiSigManager
from cross_chain_bridge import CrossChainBridge

# Initialize after db
analytics_engine = AnalyticsEngine(db)
multisig_manager = MultiSigManager(db)
cross_chain_bridge = CrossChainBridge(multi_chain_client, db) if multi_chain_client else None

# Copy all endpoints from advanced_endpoints.py to server.py
# OR import them as a module
```

---

## Summary

✅ **Step 2**: Environment configured with multi-chain RPC URLs
✅ **Step 3**: Deployment commands ready for Polygon and BSC
✅ **Step 4**: Test scripts created (PowerShell and Bash)

**All ready to go!** 🚀
