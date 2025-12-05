"""Blockchain client for interacting with deployed smart contracts"""
import json
import os
from typing import Dict, List, Optional
from web3 import Web3
from eth_account import Account
import logging

logger = logging.getLogger(__name__)


class BlockchainClient:
    """Client for interacting with ZK-IoTChain smart contracts"""
    
    def __init__(self):
        # Load deployment info
        deployment_path = 'deployment.json'
        if not os.path.exists(deployment_path):
            deployment_path = os.path.join(os.path.dirname(__file__), 'deployment.json')
        
        if os.path.exists(deployment_path):
            with open(deployment_path, 'r') as f:
                self.deployment_info = json.load(f)
        else:
            self.deployment_info = None
            logger.warning("No deployment.json found. Smart contracts not deployed yet.")
        
        # Connect to network - prefer localhost for development
        rpc_url = os.getenv('LOCALHOST_RPC_URL') or os.getenv('SEPOLIA_RPC_URL', 'http://127.0.0.1:8545')
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        # Load private key if available
        private_key = os.getenv('PRIVATE_KEY')
        if private_key:
            self.account = Account.from_key(private_key)
        else:
            # Use first hardhat account for local testing
            self.account = Account.from_key(
                '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
            )
        
        logger.info(f"Connected to blockchain. Chain ID: {self.w3.eth.chain_id}")
        logger.info(f"Account address: {self.account.address}")
    
    def get_contract(self, contract_name: str):
        """Get contract instance by name"""
        if not self.deployment_info:
            raise Exception("Contracts not deployed. Run deployment script first.")
        
        contract_address = self.deployment_info['contracts'][contract_name]
        
        # Load ABI
        abi_path = f'artifacts/contracts/{contract_name}.sol/{contract_name}.json'
        if not os.path.exists(abi_path):
            abi_path = os.path.join(os.path.dirname(__file__), f'artifacts/contracts/{contract_name}.sol/{contract_name}.json')
        
        with open(abi_path, 'r') as f:
            contract_json = json.load(f)
            abi = contract_json['abi']
        
        return self.w3.eth.contract(address=contract_address, abi=abi)
    
    def register_device_on_chain(
        self,
        device_id: str,
        public_key_hash: str,
        device_type: str,
        proof: Dict,
        public_signals: List[int]
    ) -> Dict:
        """Register device on blockchain"""
        try:
            device_registry = self.get_contract('DeviceRegistry')
            
            # Convert device_id to bytes32
            device_id_bytes = self.w3.keccak(text=device_id)
            public_key_hash_bytes = self.w3.keccak(text=public_key_hash)
            
            # Format proof for contract
            proof_formatted = (
                proof['a'],
                proof['b'],
                proof['c']
            )
            
            # Build transaction
            txn = device_registry.functions.registerDevice(
                device_id_bytes,
                public_key_hash_bytes,
                device_type,
                proof_formatted,
                public_signals
            ).build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 500000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            # Sign and send
            signed_txn = self.w3.eth.account.sign_transaction(txn, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            
            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                'success': receipt['status'] == 1,
                'tx_hash': tx_hash.hex(),
                'block_number': receipt['blockNumber'],
                'gas_used': receipt['gasUsed']
            }
        
        except Exception as e:
            logger.error(f"Error registering device: {e}")
            return {'success': False, 'error': str(e)}
    
    def authenticate_device_on_chain(
        self,
        device_id: str,
        proof: Dict,
        public_signals: List[int]
    ) -> Dict:
        """Authenticate device on blockchain"""
        try:
            device_registry = self.get_contract('DeviceRegistry')
            
            device_id_bytes = self.w3.keccak(text=device_id)
            
            proof_formatted = (
                proof['a'],
                proof['b'],
                proof['c']
            )
            
            txn = device_registry.functions.authenticateDevice(
                device_id_bytes,
                proof_formatted,
                public_signals
            ).build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 300000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(txn, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                'success': receipt['status'] == 1,
                'tx_hash': tx_hash.hex(),
                'gas_used': receipt['gasUsed']
            }
        
        except Exception as e:
            logger.error(f"Error authenticating device: {e}")
            return {'success': False, 'error': str(e)}
    
    def anchor_merkle_root(
        self,
        merkle_root: str,
        batch_size: int,
        metadata: str
    ) -> Dict:
        """Anchor Merkle root on blockchain"""
        try:
            merkle_anchor = self.get_contract('MerkleAnchor')
            
            # Convert merkle root to bytes32
            if merkle_root.startswith('0x'):
                merkle_root = merkle_root[2:]
            root_bytes = bytes.fromhex(merkle_root)
            
            txn = merkle_anchor.functions.anchorMerkleRoot(
                root_bytes,
                batch_size,
                metadata
            ).build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(txn, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Get batch ID from events
            batch_id = None
            for log in receipt['logs']:
                try:
                    event = merkle_anchor.events.MerkleRootAnchored().process_log(log)
                    batch_id = event['args']['batchId']
                    break
                except:
                    pass
            
            return {
                'success': receipt['status'] == 1,
                'tx_hash': tx_hash.hex(),
                'batch_id': batch_id,
                'gas_used': receipt['gasUsed']
            }
        
        except Exception as e:
            logger.error(f"Error anchoring Merkle root: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_gas_price(self) -> int:
        """Get current gas price"""
        return self.w3.eth.gas_price
    
    def get_balance(self, address: Optional[str] = None) -> float:
        """Get ETH balance"""
        addr = address or self.account.address
        balance_wei = self.w3.eth.get_balance(addr)
        return self.w3.from_wei(balance_wei, 'ether')
    
    def estimate_gas_for_registration(
        self,
        device_id: str,
        public_key_hash: str,
        device_type: str,
        proof: Dict,
        public_signals: List[int]
    ) -> Dict:
        """Estimate gas cost for device registration"""
        try:
            device_registry = self.get_contract('DeviceRegistry')
            
            device_id_bytes = self.w3.keccak(text=device_id)
            public_key_hash_bytes = self.w3.keccak(text=public_key_hash)
            
            proof_formatted = (
                proof['a'],
                proof['b'],
                proof['c']
            )
            
            # Estimate gas
            gas_estimate = device_registry.functions.registerDevice(
                device_id_bytes,
                public_key_hash_bytes,
                device_type,
                proof_formatted,
                public_signals
            ).estimate_gas({'from': self.account.address})
            
            gas_price = self.w3.eth.gas_price
            cost_wei = gas_estimate * gas_price
            cost_eth = self.w3.from_wei(cost_wei, 'ether')
            
            return {
                'gas_estimate': gas_estimate,
                'gas_price_gwei': self.w3.from_wei(gas_price, 'gwei'),
                'cost_wei': cost_wei,
                'cost_eth': float(cost_eth),
                'success': True
            }
        except Exception as e:
            logger.error(f"Error estimating gas for registration: {e}")
            return {'success': False, 'error': str(e)}
    
    def estimate_gas_for_authentication(
        self,
        device_id: str,
        proof: Dict,
        public_signals: List[int]
    ) -> Dict:
        """Estimate gas cost for device authentication"""
        try:
            device_registry = self.get_contract('DeviceRegistry')
            
            device_id_bytes = self.w3.keccak(text=device_id)
            
            proof_formatted = (
                proof['a'],
                proof['b'],
                proof['c']
            )
            
            gas_estimate = device_registry.functions.authenticateDevice(
                device_id_bytes,
                proof_formatted,
                public_signals
            ).estimate_gas({'from': self.account.address})
            
            gas_price = self.w3.eth.gas_price
            cost_wei = gas_estimate * gas_price
            cost_eth = self.w3.from_wei(cost_wei, 'ether')
            
            return {
                'gas_estimate': gas_estimate,
                'gas_price_gwei': self.w3.from_wei(gas_price, 'gwei'),
                'cost_wei': cost_wei,
                'cost_eth': float(cost_eth),
                'success': True
            }
        except Exception as e:
            logger.error(f"Error estimating gas for authentication: {e}")
            return {'success': False, 'error': str(e)}
    
    def estimate_gas_for_merkle_anchor(
        self,
        merkle_root: str,
        batch_size: int,
        metadata: str
    ) -> Dict:
        """Estimate gas cost for Merkle root anchoring"""
        try:
            merkle_anchor = self.get_contract('MerkleAnchor')
            
            if merkle_root.startswith('0x'):
                merkle_root = merkle_root[2:]
            root_bytes = bytes.fromhex(merkle_root)
            
            gas_estimate = merkle_anchor.functions.anchorMerkleRoot(
                root_bytes,
                batch_size,
                metadata
            ).estimate_gas({'from': self.account.address})
            
            gas_price = self.w3.eth.gas_price
            cost_wei = gas_estimate * gas_price
            cost_eth = self.w3.from_wei(cost_wei, 'ether')
            
            return {
                'gas_estimate': gas_estimate,
                'gas_price_gwei': self.w3.from_wei(gas_price, 'gwei'),
                'cost_wei': cost_wei,
                'cost_eth': float(cost_eth),
                'success': True
            }
        except Exception as e:
            logger.error(f"Error estimating gas for merkle anchor: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_transaction_status(self, tx_hash: str) -> Dict:
        """Get transaction status and details"""
        try:
            if not tx_hash.startswith('0x'):
                tx_hash = '0x' + tx_hash
            
            # Get transaction
            tx = self.w3.eth.get_transaction(tx_hash)
            
            # Try to get receipt
            try:
                receipt = self.w3.eth.get_transaction_receipt(tx_hash)
                status = 'confirmed' if receipt['status'] == 1 else 'failed'
                return {
                    'success': True,
                    'status': status,
                    'transaction': {
                        'hash': tx_hash,
                        'from': tx['from'],
                        'to': tx['to'],
                        'value': str(tx['value']),
                        'gas': tx['gas'],
                        'gasPrice': str(tx['gasPrice'])
                    },
                    'receipt': {
                        'blockNumber': receipt['blockNumber'],
                        'gasUsed': receipt['gasUsed'],
                        'status': receipt['status']
                    }
                }
            except Exception:
                # Transaction pending
                return {
                    'success': True,
                    'status': 'pending',
                    'transaction': {
                        'hash': tx_hash,
                        'from': tx['from'],
                        'to': tx['to'],
                        'value': str(tx['value']),
                        'gas': tx['gas'],
                        'gasPrice': str(tx['gasPrice'])
                    }
                }
        except Exception as e:
            logger.error(f"Error getting transaction status: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_network_info(self) -> Dict:
        """Get blockchain network information"""
        try:
            chain_id = self.w3.eth.chain_id
            block_number = self.w3.eth.block_number
            gas_price = self.w3.eth.gas_price
            
            return {
                'success': True,
                'chain_id': chain_id,
                'block_number': block_number,
                'gas_price': str(gas_price),
                'gas_price_gwei': float(self.w3.from_wei(gas_price, 'gwei')),
                'is_connected': self.w3.is_connected()
            }
        except Exception as e:
            logger.error(f"Error getting network info: {e}")
            return {'success': False, 'error': str(e)}


# Global blockchain client
try:
    blockchain_client = BlockchainClient()
except Exception as e:
    logger.error(f"Failed to initialize blockchain client: {e}")
    blockchain_client = None
