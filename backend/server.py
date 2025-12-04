from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import time
import json

# Import ZK-IoTChain modules
from zkp_utils import zkp_generator
from merkle_tree import MerkleTree, hash_data, create_batch_merkle_tree
from blockchain_client import blockchain_client


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="ZK-IoTChain API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ============ Data Models ============

class DeviceRegistration(BaseModel):
    device_id: str
    device_name: str
    device_type: str  # healthcare, industrial, smart-city
    secret: str  # Device secret for ZKP


class DeviceAuthentication(BaseModel):
    device_id: str
    secret: str


class IoTDataSubmission(BaseModel):
    device_id: str
    data: Dict[str, Any]
    timestamp: Optional[int] = None


class MerkleAnchorRequest(BaseModel):
    batch_metadata: Optional[str] = ""


class DataVerification(BaseModel):
    data_hash: str
    batch_id: int


# ============ Root Endpoint ============

@api_router.get("/")
async def root():
    return {
        "message": "ZK-IoTChain API - Blockchain-Enabled IoT Security Framework",
        "version": "1.0.0",
        "features": [
            "Zero-Knowledge Proof Authentication",
            "Merkle Tree Data Anchoring",
            "Privacy-Preserving Device Management"
        ]
    }


# ============ Device Registration & Authentication ============

@api_router.post("/devices/register")
async def register_device(device_data: DeviceRegistration):
    """
    Register a new IoT device with ZKP-based identity verification.
    Generates ZK proof and registers device on blockchain.
    """
    try:
        # Check if device already exists
        existing = await db.devices.find_one({"device_id": device_data.device_id})
        if existing:
            raise HTTPException(status_code=400, detail="Device already registered")
        
        # Generate ZK proof for device identity
        timestamp = int(time.time())
        proof_data = zkp_generator.generate_proof(
            device_data.device_id,
            device_data.secret,
            timestamp
        )
        
        # Generate device keypair
        public_key_hash, private_key = zkp_generator.generate_device_keypair(device_data.device_id)
        
        # Register on blockchain
        blockchain_result = None
        if blockchain_client:
            blockchain_result = blockchain_client.register_device_on_chain(
                device_data.device_id,
                public_key_hash,
                device_data.device_type,
                proof_data["proof"],
                proof_data["publicSignals"]
            )
        
        # Store device in database
        device_doc = {
            "device_id": device_data.device_id,
            "device_name": device_data.device_name,
            "device_type": device_data.device_type,
            "public_key_hash": public_key_hash,
            "private_key": private_key,  # In production, store securely
            "registered_at": timestamp,
            "last_authenticated": timestamp,
            "is_active": True,
            "blockchain_tx": blockchain_result.get("tx_hash") if blockchain_result else None,
            "total_data_submitted": 0
        }
        
        await db.devices.insert_one(device_doc)
        
        return {
            "success": True,
            "device_id": device_data.device_id,
            "public_key_hash": public_key_hash,
            "proof": proof_data,
            "blockchain": blockchain_result,
            "message": "Device registered successfully with ZKP verification"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Device registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/devices/authenticate")
async def authenticate_device(auth_data: DeviceAuthentication):
    """
    Authenticate device using Zero-Knowledge Proof.
    Verifies identity without exposing secret.
    """
    try:
        # Get device from database
        device = await db.devices.find_one({"device_id": auth_data.device_id})
        if not device:
            raise HTTPException(status_code=404, detail="Device not registered")
        
        if not device.get("is_active"):
            raise HTTPException(status_code=403, detail="Device is deactivated")
        
        # Generate ZK proof
        timestamp = int(time.time())
        proof_data = zkp_generator.generate_proof(
            auth_data.device_id,
            auth_data.secret,
            timestamp
        )
        
        # Verify proof
        is_valid = zkp_generator.verify_proof(proof_data, auth_data.device_id)
        
        if not is_valid:
            raise HTTPException(status_code=401, detail="Invalid authentication proof")
        
        # Authenticate on blockchain (optional, can be expensive)
        blockchain_result = None
        # Uncomment for on-chain authentication
        # if blockchain_client:
        #     blockchain_result = blockchain_client.authenticate_device_on_chain(
        #         auth_data.device_id,
        #         proof_data["proof"],
        #         proof_data["publicSignals"]
        #     )
        
        # Update last authenticated
        await db.devices.update_one(
            {"device_id": auth_data.device_id},
            {"$set": {"last_authenticated": timestamp}}
        )
        
        # Log authentication
        await db.auth_logs.insert_one({
            "device_id": auth_data.device_id,
            "timestamp": timestamp,
            "proof_hash": proof_data.get("commitment"),
            "success": True
        })
        
        return {
            "success": True,
            "device_id": auth_data.device_id,
            "authenticated_at": timestamp,
            "proof_verified": True,
            "blockchain": blockchain_result,
            "message": "Device authenticated successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Authentication error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/devices")
async def get_all_devices():
    """Get all registered devices"""
    devices = await db.devices.find().to_list(100)
    # Remove sensitive data
    for device in devices:
        device.pop("private_key", None)
        device.pop("_id", None)
    return {"devices": devices, "total": len(devices)}


@api_router.get("/devices/{device_id}")
async def get_device(device_id: str):
    """Get device information"""
    device = await db.devices.find_one({"device_id": device_id})
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    device.pop("private_key", None)
    device.pop("_id", None)
    return device


# ============ IoT Data Management ============

@api_router.post("/devices/data")
async def submit_device_data(data_submission: IoTDataSubmission):
    """
    Submit IoT device data for batching and Merkle tree construction.
    Data is stored off-chain, only Merkle root is anchored on-chain.
    """
    try:
        # Verify device exists
        device = await db.devices.find_one({"device_id": data_submission.device_id})
        if not device:
            raise HTTPException(status_code=404, detail="Device not registered")
        
        timestamp = data_submission.timestamp or int(time.time())
        
        # Hash the data
        data_to_hash = {
            "device_id": data_submission.device_id,
            "data": data_submission.data,
            "timestamp": timestamp
        }
        data_hash = hash_data(data_to_hash)
        
        # Store data off-chain
        data_doc = {
            "device_id": data_submission.device_id,
            "data": data_submission.data,
            "timestamp": timestamp,
            "data_hash": data_hash,
            "anchored": False,
            "batch_id": None
        }
        
        result = await db.iot_data.insert_one(data_doc)
        
        # Update device stats
        await db.devices.update_one(
            {"device_id": data_submission.device_id},
            {"$inc": {"total_data_submitted": 1}}
        )
        
        return {
            "success": True,
            "data_id": str(result.inserted_id),
            "data_hash": data_hash,
            "timestamp": timestamp,
            "message": "Data submitted successfully. Will be included in next Merkle batch."
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Data submission error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/devices/data/pending")
async def get_pending_data():
    """Get data pending Merkle tree anchoring"""
    pending = await db.iot_data.find({"anchored": False}).to_list(1000)
    for item in pending:
        item["_id"] = str(item["_id"])
    return {
        "pending_count": len(pending),
        "data": pending
    }


# ============ Merkle Tree & Data Anchoring ============

@api_router.post("/merkle/anchor")
async def anchor_merkle_root(request: MerkleAnchorRequest):
    """
    Create Merkle tree from pending data and anchor root on blockchain.
    This significantly reduces on-chain storage costs.
    """
    try:
        # Get all pending data
        pending_data = await db.iot_data.find({"anchored": False}).to_list(1000)
        
        if not pending_data:
            raise HTTPException(status_code=400, detail="No pending data to anchor")
        
        # Create Merkle tree
        data_list = []
        data_ids = []
        for item in pending_data:
            data_list.append({
                "device_id": item["device_id"],
                "data": item["data"],
                "timestamp": item["timestamp"]
            })
            data_ids.append(item["_id"])
        
        merkle_tree = create_batch_merkle_tree(data_list)
        merkle_root = merkle_tree.get_root()
        
        # Anchor on blockchain
        blockchain_result = None
        if blockchain_client and merkle_root:
            device_ids = list(set([item["device_id"] for item in pending_data]))
            metadata = f"Devices: {','.join(device_ids[:5])}"  # First 5 devices
            
            blockchain_result = blockchain_client.anchor_merkle_root(
                merkle_root,
                len(data_list),
                metadata
            )
        
        # Store batch info
        batch_doc = {
            "batch_id": blockchain_result.get("batch_id") if blockchain_result else int(time.time()),
            "merkle_root": merkle_root,
            "data_count": len(data_list),
            "timestamp": int(time.time()),
            "blockchain_tx": blockchain_result.get("tx_hash") if blockchain_result else None,
            "gas_used": blockchain_result.get("gas_used") if blockchain_result else None,
            "tree_info": merkle_tree.get_tree_info(),
            "metadata": request.batch_metadata
        }
        
        await db.merkle_batches.insert_one(batch_doc)
        
        # Update data as anchored
        await db.iot_data.update_many(
            {"_id": {"$in": data_ids}},
            {"$set": {
                "anchored": True,
                "batch_id": batch_doc["batch_id"],
                "merkle_root": merkle_root
            }}
        )
        
        return {
            "success": True,
            "batch_id": batch_doc["batch_id"],
            "merkle_root": merkle_root,
            "data_count": len(data_list),
            "blockchain": blockchain_result,
            "storage_efficiency": f"Stored {len(data_list)} entries with single 32-byte hash on-chain",
            "message": "Merkle root anchored successfully on blockchain"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Merkle anchoring error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/merkle/verify")
async def verify_data_integrity(verification: DataVerification):
    """
    Verify data integrity using Merkle proof.
    Checks if data has been tampered with since anchoring.
    """
    try:
        # Get batch info
        batch = await db.merkle_batches.find_one({"batch_id": verification.batch_id})
        if not batch:
            raise HTTPException(status_code=404, detail="Batch not found")
        
        # Get all data in batch
        batch_data = await db.iot_data.find({"batch_id": verification.batch_id}).to_list(1000)
        
        # Find data with matching hash
        data_found = None
        data_index = -1
        for idx, item in enumerate(batch_data):
            if item["data_hash"] == verification.data_hash:
                data_found = item
                data_index = idx
                break
        
        if not data_found:
            raise HTTPException(status_code=404, detail="Data hash not found in batch")
        
        # Reconstruct Merkle tree
        data_list = [{
            "device_id": item["device_id"],
            "data": item["data"],
            "timestamp": item["timestamp"]
        } for item in batch_data]
        
        merkle_tree = create_batch_merkle_tree(data_list)
        
        # Generate proof
        proof = merkle_tree.get_proof(data_index)
        
        # Verify proof
        is_valid = merkle_tree.verify_proof(
            verification.data_hash,
            proof,
            batch["merkle_root"]
        )
        
        return {
            "success": True,
            "is_valid": is_valid,
            "data_hash": verification.data_hash,
            "batch_id": verification.batch_id,
            "merkle_root": batch["merkle_root"],
            "proof": proof,
            "message": "Data is valid and untampered" if is_valid else "Data integrity check failed - possible tampering detected"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Verification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/merkle/batches")
async def get_merkle_batches():
    """Get all Merkle batches"""
    batches = await db.merkle_batches.find().to_list(100)
    for batch in batches:
        batch.pop("_id", None)
    return {"batches": batches, "total": len(batches)}


# ============ Blockchain Integration Endpoints ============

@api_router.get("/blockchain/status")
async def get_blockchain_status():
    """Get blockchain connection status and account info"""
    if not blockchain_client:
        return {
            "connected": False,
            "message": "Blockchain client not initialized. Deploy contracts first."
        }
    
    try:
        network_info = blockchain_client.get_network_info()
        balance = blockchain_client.get_balance()
        
        return {
            "connected": network_info.get("is_connected", False),
            "network": network_info,
            "account": {
                "address": blockchain_client.account.address,
                "balance_eth": balance
            },
            "contracts_deployed": blockchain_client.deployment_info is not None
        }
    except Exception as e:
        logging.error(f"Error getting blockchain status: {e}")
        return {
            "connected": False,
            "error": str(e)
        }


class GasEstimateRequest(BaseModel):
    operation: str  # register_device, authenticate_device, merkle_anchor
    device_id: Optional[str] = None
    device_type: Optional[str] = None
    secret: Optional[str] = None
    merkle_root: Optional[str] = None
    batch_size: Optional[int] = None
    metadata: Optional[str] = ""


@api_router.post("/blockchain/estimate-gas")
async def estimate_gas(request: GasEstimateRequest):
    """Estimate gas cost for blockchain operations"""
    if not blockchain_client:
        raise HTTPException(status_code=503, detail="Blockchain client not available")
    
    try:
        if request.operation == "register_device":
            if not request.device_id or not request.device_type or not request.secret:
                raise HTTPException(status_code=400, detail="Missing required fields")
            
            # Generate ZKP proof
            timestamp = int(time.time())
            proof_data = zkp_generator.generate_proof(
                request.device_id,
                request.secret,
                timestamp
            )
            
            public_key_hash, _ = zkp_generator.generate_device_keypair(request.device_id)
            
            estimate = blockchain_client.estimate_gas_for_registration(
                request.device_id,
                public_key_hash,
                request.device_type,
                proof_data["proof"],
                proof_data["publicSignals"]
            )
            
            return estimate
        
        elif request.operation == "authenticate_device":
            if not request.device_id or not request.secret:
                raise HTTPException(status_code=400, detail="Missing required fields")
            
            timestamp = int(time.time())
            proof_data = zkp_generator.generate_proof(
                request.device_id,
                request.secret,
                timestamp
            )
            
            estimate = blockchain_client.estimate_gas_for_authentication(
                request.device_id,
                proof_data["proof"],
                proof_data["publicSignals"]
            )
            
            return estimate
        
        elif request.operation == "merkle_anchor":
            if not request.merkle_root or not request.batch_size:
                raise HTTPException(status_code=400, detail="Missing required fields")
            
            estimate = blockchain_client.estimate_gas_for_merkle_anchor(
                request.merkle_root,
                request.batch_size,
                request.metadata or ""
            )
            
            return estimate
        
        else:
            raise HTTPException(status_code=400, detail="Invalid operation type")
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Gas estimation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/blockchain/transaction/{tx_hash}")
async def get_transaction(tx_hash: str):
    """Get transaction status and details"""
    if not blockchain_client:
        raise HTTPException(status_code=503, detail="Blockchain client not available")
    
    try:
        result = blockchain_client.get_transaction_status(tx_hash)
        if not result.get("success"):
            raise HTTPException(status_code=404, detail=result.get("error", "Transaction not found"))
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting transaction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/blockchain/network")
async def get_network():
    """Get blockchain network information"""
    if not blockchain_client:
        raise HTTPException(status_code=503, detail="Blockchain client not available")
    
    try:
        network_info = blockchain_client.get_network_info()
        return network_info
    except Exception as e:
        logging.error(f"Error getting network info: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ Performance Metrics ============

@api_router.get("/metrics")
async def get_system_metrics():
    """Get system performance metrics"""
    total_devices = await db.devices.count_documents({})
    active_devices = await db.devices.count_documents({"is_active": True})
    total_data = await db.iot_data.count_documents({})
    anchored_data = await db.iot_data.count_documents({"anchored": True})
    total_batches = await db.merkle_batches.count_documents({})
    total_auths = await db.auth_logs.count_documents({})
    
    # Get recent batches for gas analysis
    recent_batches = await db.merkle_batches.find().sort("timestamp", -1).limit(10).to_list(10)
    
    total_gas = sum([b.get("gas_used", 0) for b in recent_batches])
    avg_gas = total_gas / len(recent_batches) if recent_batches else 0
    
    # Get blockchain balance
    balance = blockchain_client.get_balance() if blockchain_client else 0
    
    return {
        "devices": {
            "total": total_devices,
            "active": active_devices,
            "inactive": total_devices - active_devices
        },
        "data": {
            "total_submitted": total_data,
            "anchored": anchored_data,
            "pending": total_data - anchored_data
        },
        "merkle_batches": total_batches,
        "authentications": total_auths,
        "blockchain": {
            "total_gas_used": total_gas,
            "average_gas_per_batch": avg_gas,
            "account_balance": balance
        },
        "storage_efficiency": {
            "on_chain_storage_mb": (total_batches * 32) / 1024 / 1024,  # 32 bytes per root
            "off_chain_storage_entries": total_data
        }
    }


# ============ Include router ============
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
