# Advanced Features Documentation

This document provides detailed information about the six advanced features added to the ZK-IoTChain mobile application.

---

## 🌐 1. Multi-Blockchain Support

### Overview
The system now supports deployment and interaction across multiple blockchain networks:
- **Ethereum Sepolia** (Testnet)
- **Polygon Mumbai** (Testnet) & **Polygon Mainnet**
- **BSC Testnet** & **BSC Mainnet**

### Implementation Details

#### Configuration
All network configurations are stored in `backend/chain_config.json`:
```json
{
  "networks": {
    "sepolia": { "chainId": 11155111, ... },
    "polygonMumbai": { "chainId": 80001, ... },
    "polygon": { "chainId": 137, ... },
    "bscTestnet": { "chainId": 97, ... },
    "bsc": { "chainId": 56, ... }
  }
}
```

#### MultiChainClient
The `multi_chain_client.py` manages connections to all supported networks:
- Automatic connection initialization
- Network switching capability
-Per-network contract deployment tracking
- Unified interface for all chains

### API Endpoints

| Endpoint | Method | Description |
|----------|---------|-------------|
| `/api/multichain/networks` | GET | List all available networks |
| `/api/multichain/switch-network` | POST | Switch active network |
| `/api/multichain/network/{name}` | GET | Get network details |
| `/api/multichain/devices/register` | POST | Register device on multiple chains |

### Usage Example

```python
# Switch to Polygon Mumbai
POST /api/multichain/switch-network
{
  "network": "polygonMumbai"
}

# Register device on multiple chains
POST /api/multichain/devices/register
{
  "device_id": "device-001",
  "device_name": "Sensor Alpha",
  "device_type": "industrial",
  "secret": "device_secret_key",
  "networks": ["sepolia", "polygonMumbai", "bscTestnet"]
}
```

### Deployment
Deploy contracts to any supported network:
```bash
# Polygon Mumbai
npx hardhat run scripts/deploy.js --network polygonMumbai

# BSC Testnet
npx hardhat run scripts/deploy.js --network bscTestnet
```

---

## 🔐 2. Enhanced ZKP Schemes

### Overview
Foundation for supporting multiple Zero-Knowledge Proof schemes:
- **Simple ZKP** (Current - Active)
- **zk-SNARKs** (Planned - Foundation ready)
- **zk-STARKs** (Planned - Foundation ready)

### Implementation

#### ZKP Scheme Enum
```python
class ZKPScheme(Enum):
    SIMPLE = "simple"
    SNARK = "snark"
    STARK = "stark"
```

#### EnhancedZKPGenerator
Located in `snark_zkp.py`, provides:
- Scheme selection
- Proof generation with specified scheme
- Proof verification
- Scheme capability listing

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/zkp/schemes` | GET | List supported ZKP schemes |

### Current Schemes

#### Simple ZKP (Active)
- **Status**: Production-ready
- **Gas Cost**: Low
- **Security**: Medium
- **Use Case**: Fast device authentication

#### zk-SNARK (Planned)
- **Status**: Foundation ready
-  **Technology**: circom + snarkJS
- **Gas Cost**: Medium
- **Security**: High
- **Use Case**: Privacy-preserving authentication

#### zk-STARK (Planned)
- **Status**: Foundation ready
- **Technology**: StarkWare libraries
- **Gas Cost**: Higher
- **Security**: Very High
- **Use Case**: Transparent, quantum-resistant proofs

### Future Integration

To enable SNARKs, you'll need to:
1. Create circuit files in `backend/circuits/`
2. Generate proving/verification keys
3. Integrate snarkjs
4. Deploy SNARK verifier contracts

---

## 📡 3. Real-Time Device Monitoring

### Overview
WebSocket-based real-time monitoring system for tracking device status and system events.

### Features
- **Device Heartbeats**: Track device online/offline status
- **Event Broadcasting**: Real-time notifications for all system events
- **Connection Management**: Handle multiple WebSocket connections
- **Automatic Timeout Detection**: Mark devices offline after 5 minutes

### Implementation

#### RealtimeMonitor
Located in `realtime_monitor.py`:
- Heartbeat tracking
- Status management (online/offline/idle)
- Event history (last 100 events)
- Connection pool management

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/realtime/device/{id}/heartbeat` | POST | Report device heartbeat |
| `/api/realtime/devices/status` | GET | Get all device statuses |
| `/api/realtime/events` | GET | Get recent events |

### Event Types
- `device_registered` - New device registered
- `device_authenticated` - Device authenticated
- `data_submitted` - Data submitted
- `batch_anchored` - Merkle batch anchored
- `device_status_change` - Device online/offline

### Usage Example

```javascript
// Device heartbeat (called every minute)
POST /api/realtime/device/device-001/heartbeat

// Get all device statuses
GET /api/realtime/devices/status
Response:
{
  "success": true,
  "devices": [
    {
      "device_id": "device-001",
      "status": "online",
      "last_heartbeat": 1701734567
    }
  ],
  "active_connections": 5
}
```

---

## 📊 4. Advanced Analytics Dashboard

### Overview
Comprehensive analytics system for visualizing system metrics, device usage, and blockchain performance.

### Features
- **Overview Statistics**: System-wide metrics
- **Device Analytics**: Per-device usage stats
- **Proof Analytics**: ZKP generation metrics
- **Blockchain Analytics**: Gas and transaction stats
- **Time-Series Data**: Historical data with flexible intervals
- **Data Export**: CSV/JSON export for external analysis

### Implementation

#### AnalyticsEngine
Located in `analytics.py`, provides:
- Statistical calculations
- Time-series aggregation
- Data export functionality
- Multi-dimensional analytics

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/overview` | GET | System overview stats |
| `/api/analytics/devices/{id}` | GET | Device-specific analytics |
| `/api/analytics/proofs` | GET | ZKP metrics |
| `/api/analytics/blockchain` | GET | Blockchain stats |
| `/api/analytics/time-series` | POST | Time-series data |
| `/api/analytics/export/{type}` | GET | Export data |

### Metrics Provided

#### System Overview
- Total/active/inactive devices
- Data submitted (total, anchored, pending)
- Merkle batches created
- Authentication count
- 24-hour activity stats

#### Device Analytics
- Total data submissions
- Authentication history
- Recent activity
- Active status

#### Proof Analytics
- Total proofs generated
- Verification success rate
- Proofs by hour/day
- Performance metrics

#### Blockchain Analytics
- Total gas used
- Average gas per batch
- Gas by network
- Transaction history

### Usage Example

```javascript
// Get time-series data
POST /api/analytics/time-series
{
  "metric": "data_submissions",
  "start_time": 1701648000,
  "end_time": 1701734400,
  "interval": "hour"
}

Response:
{
  "success": true,
  "metric": "data_submissions",
  "data_points": [
    {"timestamp": 1701648000, "value": 15},
    {"timestamp": 1701651600, "value": 23},
    ...
  ]
}
```

---

## ✍️ 5. Multi-Signature Device Registration

### Overview
Multi-signature approval workflow for device registration, requiring multiple authorized signers to approve before registration is finalized.

### Features
- **Proposal System**: Create registration proposals
- **Approval Workflow**: Configurable threshold (e.g., 2-of-3, 3-of-5)
- **Signer Management**: Add/remove authorized signers
- **Proposal Expiry**: Automatic expiry after 7 days
- **On-Chain Execution**: Register device after approval

### Implementation

#### MultiSigManager
Located in `multisig_manager.py`:
- Proposal creation and tracking
- Approval/rejection handling
- Threshold enforcement
- Execution logic

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/multisig/propose-registration` | POST | Create  proposal |
| `/api/multisig/approve` | POST | Approve proposal |
| `/api/multisig/reject` | POST | Reject proposal |
| `/api/multisig/execute/{id}` | POST | Execute approved proposal |
| `/api/multisig/proposals` | GET | List all proposals |
| `/api/multisig/signers` | GET/POST | Manage signers |

### Workflow

1. **Create Proposal**: Propose device registration
2. **Collect Approvals**: Required signers approve
3. **Threshold Met**: Auto-marked as approved
4. **Execute**: Register device on-chain and in database

### Usage Example

```javascript
// 1. Create proposal
POST /api/multisig/propose-registration
{
  "device_id": "device-001",
  "device_name": "Critical Sensor",
  "device_type": "healthcare",
  "secret": "secret_key",
  "required_approvals": 2
}

// 2. Approve (do this 2+ times)
POST /api/multisig/approve
{
  "proposal_id": "abc123...",
  "approver": "signer1",
  "signature": "0x..."
}

// 3. Execute
POST /api/multisig/execute/abc123...
```

---

## 🌉 6. Cross-Chain Data Anchoring

### Overview
Anchor the same Merkle root to multiple blockchains simultaneously for enhanced data availability and redundancy.

### Features
- **Multi-Chain Anchoring**: Single root to multiple chains
- **Cross-Chain Verification**: Verify data across chains
- **Sync Status Tracking**: Monitor anchor status per chain
- **Redundancy**: Data integrity across multiple networks

### Implementation

#### CrossChainBridge
Located in `cross_chain_bridge.py`:
- Coordinate multi-chain anchoring
- Track anchor status per network
- Cross-chain verification
- Sync status management

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cross-chain/anchor` | POST | Anchor to multiple chains |
| `/api/cross-chain/verify` | POST | Verify across chains |
| `/api/cross-chain/status/{root}` | GET | Get anchor status |
| `/api/cross-chain/anchors` | GET | List all anchors |
| `/api/cross-chain/sync-status` | GET | Get sync status |

### Benefits

1. **Data Availability**: Root exists on multiple chains
2. **Redundancy**: If one chain is down, others available
3. **Cost Optimization**: Anchor once, verify everywhere
4. **Trust Distribution**: No single point of failure

### Usage Example

```javascript
// Anchor to multiple chains
POST /api/cross-chain/anchor
{
  "merkle_root": "0xabc123...",
  "batch_size": 50,
  "metadata": "IoT data batch #42",
  "target_chains": ["sepolia", "polygonMumbai", "bscTestnet"]
}

Response:
{
  "success": true,
  "successful_chains": ["sepolia", "polygonMumbai", "bscTestnet"],
  "failed_chains": [],
  "results": {
    "sepolia": {"success": true, "tx_hash": "0x...", ...},
    "polygonMumbai": {"success": true, "tx_hash": "0x...", ...},
    "bscTestnet": {"success": true, "tx_hash": "0x...", ...}
  }
}

// Verify cross-chain
POST /api/cross-chain/verify
{
  "data_hash": "0xdef456...",
  "merkle_root": "0xabc123...",
  "chains": ["sepolia", "polygonMumbai"]
}
```

---

## 🚀 Getting Started

### Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure networks** (edit `backend/.env`):
   ```env
   POLYGON_MUMBAI_RPC_URL=https://your-polygon-rpc
   POLYGON_RPC_URL=https://your-polygon-mainnet-rpc
   BSC_TESTNET_RPC_URL=https://your-bsc-testnet-rpc
   BSC_RPC_URL=https://your-bsc-mainnet-rpc
   ```

3. **Deploy contracts** to desired networks:
   ```bash
   npx hardhat run scripts/deploy.js --network polygonMumbai
   npx hardhat run scripts/deploy.js --network bscTestnet
   ```

### Testing Features

#### 1. Test Multi-Chain
```bash
curl http://localhost:8001/api/multichain/networks
```

#### 2. Test Real-Time Monitoring
```bash
curl -X POST http://localhost:8001/api/realtime/device/test-001/heartbeat
```

#### 3. Test Analytics
```bash
curl http://localhost:8001/api/analytics/overview
```

#### 4. Test Multi-Sig
```bash
curl -X POST http://localhost:8001/api/multisig/propose-registration \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test-001","device_name":"Test","device_type":"industrial","secret":"secret123","required_approvals":2}'
```

---

## 📝 Notes

- **SNARK/STARK Implementation**: Foundation is ready, but full implementation requires circuit development
- **Frontend Integration**: Mobile app UI for these features is planned
- **Production Deployment**: Test thoroughly on testnets before mainnet deployment
- **Gas Costs**: Multi-chain anchoring multiplies gas costs - plan accordingly
- **WebSocket Scaling**: Monitor connection limits for real-time features

---

## 🔮 Future Enhancements

- Complete SNARK circuit implementation
- LayerZero integration for true cross-chain messaging
- Advanced analytics visualizations
- Mobile app integration for all features
- Performance optimizations
- Additional blockchain support (Arbitrum, Optimism, etc.)
