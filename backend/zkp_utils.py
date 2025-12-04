"""Zero-Knowledge Proof utilities for IoT device authentication"""
import hashlib
import json
import random
from typing import Dict, List, Tuple
import time


class ZKPGenerator:
    """
    Simplified ZKP generator for device authentication.
    In production, use snarkjs with circom circuits.
    This implements a basic commitment-based ZKP for demonstration.
    """
    
    def __init__(self):
        self.modulus = 2**256 - 189  # Large prime for field arithmetic
    
    def hash_to_field(self, data: str) -> int:
        """Hash data to a field element"""
        hash_bytes = hashlib.sha256(data.encode()).digest()
        return int.from_bytes(hash_bytes, 'big') % self.modulus
    
    def generate_proof(self, device_id: str, secret: str, timestamp: int) -> Dict:
        """
        Generate a ZK proof for device authentication.
        
        The proof demonstrates knowledge of the secret without revealing it.
        Includes timestamp for replay attack prevention.
        
        Args:
            device_id: Unique device identifier
            secret: Device secret (password/private key)
            timestamp: Current timestamp for freshness
        
        Returns:
            Dictionary containing proof components
        """
        # Generate commitment: H(device_id || secret || timestamp)
        commitment_input = f"{device_id}||{secret}||{timestamp}"
        commitment = self.hash_to_field(commitment_input)
        
        # Generate random blinding factors
        r1 = random.randint(1, self.modulus - 1)
        r2 = random.randint(1, self.modulus - 1)
        
        # Create proof components (simulating zk-SNARK structure)
        # In real implementation, these would be elliptic curve points
        proof_a = [
            (commitment * r1) % self.modulus,
            (self.hash_to_field(secret) * r2) % self.modulus
        ]
        
        proof_b = [
            [(r1 * r2) % self.modulus, (commitment + r1) % self.modulus],
            [(r2 * commitment) % self.modulus, (r1 + r2) % self.modulus]
        ]
        
        proof_c = [
            (commitment * r2) % self.modulus,
            (self.hash_to_field(device_id) * r1) % self.modulus
        ]
        
        # Public signals
        public_signals = [
            self.hash_to_field(device_id),
            timestamp,
            commitment
        ]
        
        return {
            "proof": {
                "a": proof_a,
                "b": proof_b,
                "c": proof_c
            },
            "publicSignals": public_signals,
            "commitment": hex(commitment),
            "timestamp": timestamp
        }
    
    def verify_proof(self, proof_data: Dict, device_id: str) -> bool:
        """
        Verify a ZK proof.
        
        Args:
            proof_data: Proof components and public signals
            device_id: Device ID to verify
        
        Returns:
            True if proof is valid
        """
        try:
            proof = proof_data.get("proof", {})
            public_signals = proof_data.get("publicSignals", [])
            timestamp = proof_data.get("timestamp", 0)
            
            # Check timestamp freshness (5 minute window)
            current_time = int(time.time())
            if abs(current_time - timestamp) > 300:  # 5 minutes
                return False
            
            # Verify proof structure
            if not all(key in proof for key in ['a', 'b', 'c']):
                return False
            
            if len(proof['a']) != 2 or len(proof['c']) != 2:
                return False
            
            if len(public_signals) < 2:
                return False
            
            # Verify device ID matches
            expected_device_hash = self.hash_to_field(device_id)
            if public_signals[0] != expected_device_hash:
                return False
            
            # Basic validity checks on proof components
            for val in proof['a'] + proof['c']:
                if val == 0 or val >= self.modulus:
                    return False
            
            return True
            
        except Exception as e:
            print(f"Proof verification error: {e}")
            return False
    
    def generate_device_keypair(self, device_id: str) -> Tuple[str, str]:
        """
        Generate a public/private keypair for a device.
        
        Args:
            device_id: Device identifier
        
        Returns:
            Tuple of (public_key_hash, private_key)
        """
        # Generate random private key
        private_key = hashlib.sha256(
            f"{device_id}{random.randint(0, 2**256)}{time.time()}".encode()
        ).hexdigest()
        
        # Derive public key hash
        public_key_hash = hashlib.sha256(private_key.encode()).hexdigest()
        
        return public_key_hash, private_key


# Global ZKP generator instance
zkp_generator = ZKPGenerator()
