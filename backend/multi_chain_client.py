"""Multi-chain blockchain client for managing multiple network connections"""
import json
import os
from typing import Dict, List, Optional
from web3 import Web3
from eth_account import Account
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class MultiChainClient:
    """Client for managing connections to multiple blockchain networks"""
    
    def __init__(self):
        # Load chain configuration
        config_path = Path(__file__).parent / 'chain_config.json'
        with open(config_path, 'r') as f:
            self.chain_config = json.load(f)
        
        # Initialize connections for all networks
        self.connections: Dict[str, Web3] = {}
        self.deployment_info: Dict[str, Dict] = {}
        
        # Load private key
        private_key = os.getenv('PRIVATE_KEY')
        if private_key:
            self.account = Account.from_key(private_key)
        else:
            # Use default Hardhat account for testing
            self.account = Account.from_key(
                '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
            )
        
        # Set default network
        self.current_network = self.chain_config.get('defaultNetwork', 'sepolia')
        
        # Initialize all network connections
        self._initialize_connections()
        
        logger.info(f"Multi-chain client initialized. Account: {self.account.address}")
    
    def _initialize_connections(self):
        """Initialize Web3 connections for all supported networks"""
        for network_name in self.chain_config['supportedNetworks']:
            network_info = self.chain_config['networks'][network_name]
            
            # Get RPC URL from environment or config
            env_var = f"{network_name.upper()}_RPC_URL"
            rpc_url = os.getenv(env_var, network_info['rpcUrl'])
            
            try:
                w3 = Web3(Web3.HTTPProvider(rpc_url))
                self.connections[network_name] = w3
                
                # Load deployment info if exists
                deployment_file = Path(__file__).parent / f'deployment-{network_name}.json'
                if deployment_file.exists():
                    with open(deployment_file, 'r') as f:
                        self.deployment_info[network_name] = json.load(f)
                
                logger.info(f"Connected to {network_info['name']} (Chain ID: {network_info['chainId']})")
            except Exception as e:
                logger.warning(f"Failed to connect to {network_name}: {e}")
    
    def switch_network(self, network_name: str) -> Dict:
        """Switch to a different blockchain network"""
        if network_name not in self.chain_config['supportedNetworks']:
            raise ValueError(f"Unsupported network: {network_name}")
        
        if network_name not in self.connections:
            raise Exception(f"Not connected to network: {network_name}")
        
        self.current_network = network_name
        network_info = self.chain_config['networks'][network_name]
        
        logger.info(f"Switched to network: {network_info['name']}")
        
        return {
            'success': True,
            'network': network_name,
            'chainId': network_info['chainId'],
            'name': network_info['name']
        }
    
    def get_current_web3(self) -> Web3:
        """Get Web3 instance for current network"""
        return self.connections[self.current_network]
    
    def get_web3(self, network_name: str) -> Web3:
        """Get Web3 instance for specific network"""
        if network_name not in self.connections:
            raise Exception(f"Not connected to network: {network_name}")
        return self.connections[network_name]
    
    def get_contract(self, contract_name: str, network_name: Optional[str] = None):
        """Get contract instance by name for specified network"""
        network = network_name or self.current_network
        
        if network not in self.deployment_info:
            raise Exception(f"No contracts deployed on {network}. Run deployment script first.")
        
        contract_address = self.deployment_info[network]['contracts'][contract_name]
        
        # Load ABI
        abi_path = Path(__file__).parent / f'artifacts/contracts/{contract_name}.sol/{contract_name}.json'
        with open(abi_path, 'r') as f:
            contract_json = json.load(f)
            abi = contract_json['abi']
        
        w3 = self.get_web3(network)
        return w3.eth.contract(address=contract_address, abi=abi)
    
    def get_network_info(self, network_name: Optional[str] = None) -> Dict:
        """Get information about a blockchain network"""
        network = network_name or self.current_network
        
        if network not in self.connections:
            raise Exception(f"Not connected to network: {network}")
        
        w3 = self.get_web3(network)
        network_config = self.chain_config['networks'][network]
        
        try:
            chain_id = w3.eth.chain_id
            block_number = w3.eth.block_number
            gas_price = w3.eth.gas_price
            
            return {
                'success': True,
                'network': network,
                'name': network_config['name'],
                'chain_id': chain_id,
                'block_number': block_number,
                'gas_price': str(gas_price),
                'gas_price_gwei': float(w3.from_wei(gas_price, 'gwei')),
                'is_connected': w3.is_connected(),
                'is_testnet': network_config.get('testnet', False),
                'explorer': network_config.get('explorer', ''),
                'native_currency': network_config['nativeCurrency']
            }
        except Exception as e:
            logger.error(f"Error getting network info for {network}: {e}")
            return {'success': False, 'error': str(e)}
    
    def list_networks(self) -> List[Dict]:
        """List all available networks with their status"""
        networks = []
        
        for network_name in self.chain_config['supportedNetworks']:
            network_config = self.chain_config['networks'][network_name]
            is_connected = network_name in self.connections
            has_contracts = network_name in self.deployment_info
            
            networks.append({
                'name': network_name,
                'displayName': network_config['name'],
                'chainId': network_config['chainId'],
                'isTestnet': network_config.get('testnet', False),
                'isConnected': is_connected,
                'hasContracts': has_contracts,
                'isCurrent': network_name == self.current_network,
                'nativeCurrency': network_config['nativeCurrency'],
                'explorer': network_config.get('explorer', ''),
                'faucets': network_config.get('faucets', [])
            })
        
        return networks
    
    def get_balance(self, address: Optional[str] = None, network_name: Optional[str] = None) -> float:
        """Get native currency balance for an address"""
        network = network_name or self.current_network
        addr = address or self.account.address
        
        w3 = self.get_web3(network)
        balance_wei = w3.eth.get_balance(addr)
        return float(w3.from_wei(balance_wei, 'ether'))
    
    def get_gas_price(self, network_name: Optional[str] = None) -> int:
        """Get current gas price for network"""
        network = network_name or self.current_network
        w3 = self.get_web3(network)
        return w3.eth.gas_price
    
    def register_device_on_chain(
        self,
        device_id: str,
        public_key_hash: str,
        device_type: str,
        proof: Dict,
        public_signals: List[int],
        network_name: Optional[str] = None
    ) -> Dict:
        """Register device on specified blockchain network"""
        network = network_name or self.current_network
        
        try:
            device_registry = self.get_contract('DeviceRegistry', network)
            w3 = self.get_web3(network)
            
            # Convert to bytes32
            device_id_bytes = w3.keccak(text=device_id)
            public_key_hash_bytes = w3.keccak(text=public_key_hash)
            
            # Format proof
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
                'nonce': w3.eth.get_transaction_count(self.account.address),
                'gas': 500000,
                'gasPrice': w3.eth.gas_price
            })
            
            # Sign and send
            signed_txn = w3.eth.account.sign_transaction(txn, self.account.key)
            tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            
            # Wait for receipt
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                'success': receipt['status'] == 1,
                'tx_hash': tx_hash.hex(),
                'block_number': receipt['blockNumber'],
                'gas_used': receipt['gasUsed'],
                'network': network,
                'explorer_url': f"{self.chain_config['networks'][network].get('explorer', '')}/tx/{tx_hash.hex()}"
            }
        
        except Exception as e:
            logger.error(f"Error registering device on {network}: {e}")
            return {'success': False, 'error': str(e), 'network': network}
    
    def anchor_merkle_root(
        self,
        merkle_root: str,
        batch_size: int,
        metadata: str,
        network_name: Optional[str] = None
    ) -> Dict:
        """Anchor Merkle root on specified blockchain"""
        network = network_name or self.current_network
        
        try:
            merkle_anchor = self.get_contract('MerkleAnchor', network)
            w3 = self.get_web3(network)
            
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
                'nonce': w3.eth.get_transaction_count(self.account.address),
                'gas': 200000,
                'gasPrice': w3.eth.gas_price
            })
            
            signed_txn = w3.eth.account.sign_transaction(txn, self.account.key)
            tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            
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
                'gas_used': receipt['gasUsed'],
                'network': network,
                'explorer_url': f"{self.chain_config['networks'][network].get('explorer', '')}/tx/{tx_hash.hex()}"
            }
        
        except Exception as e:
            logger.error(f"Error anchoring Merkle root on {network}: {e}")
            return {'success': False, 'error': str(e), 'network': network}


# Global multi-chain client
try:
    multi_chain_client = MultiChainClient()
except Exception as e:
    logger.error(f"Failed to initialize multi-chain client: {e}")
    multi_chain_client = None
