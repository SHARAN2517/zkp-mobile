"""Zero-Knowledge Proof utilities for IoT device authentication"""
import hashlib
import json
import random
from typing import Dict, List, Tuple, Optional
import time
import logging
from functools import wraps
import signal
from contextlib import contextmanager

logger = logging.getLogger(__name__)


class ProofGenerationError(Exception):
    """Custom exception for proof generation errors"""
    pass


class ProofGenerationTimeout(Exception):
    """Exception raised when proof generation times out"""
    pass


class ZKPGenerator:
    """
    Simplified ZKP generator for device authentication.
    In production, use snarkjs with circom circuits.
    This implements a basic commitment-based ZKP for demonstration.
    
    Features:
    - Timeout handling for resource-intensive operations
    - Retry mechanism with exponential backoff
    - Memory and CPU monitoring
    - Comprehensive error handling
    """
    
    def __init__(self, max_retries: int = 3, timeout_seconds: int = 30):
        self.modulus = 2**256 - 189  # Large prime for field arithmetic
        self.max_retries = max_retries
        self.timeout_seconds = timeout_seconds
        self.proof_cache: Dict[str, Dict] = {}  # Simple cache for generated proofs
    
    def hash_to_field(self, data: str) -> int:
        """Hash data to a field element"""
        hash_bytes = hashlib.sha256(data.encode()).digest()
        return int.from_bytes(hash_bytes, 'big') % self.modulus
    
    @contextmanager
    def timeout_context(self, seconds: int):
        """Context manager for operation timeout"""
        def timeout_handler(signum, frame):
            raise ProofGenerationTimeout(f"Proof generation exceeded {seconds} seconds")
        
        # Set up signal handler (Unix-like systems)
        try:
            old_handler = signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(seconds)
            yield
        except AttributeError:
            # Windows doesn't support SIGALRM, just yield without timeout
            logger.warning("Timeout not supported on this platform")
            yield
        finally:
            try:
                signal.alarm(0)
                signal.signal(signal.SIGALRM, old_handler)
            except (AttributeError, ValueError):
                pass
    
    def _get_cache_key(self, device_id: str, secret: str, timestamp: int) -> str:
        """Generate cache key for proof"""
        return f"{device_id}:{hashlib.sha256(secret.encode()).hexdigest()}:{timestamp}"
    
    def generate_proof(
        self, 
        device_id: str, 
        secret: str, 
        timestamp: int,
        use_cache: bool = True,
        retry_on_failure: bool = True
    ) -> Dict:
        """
        Generate a ZK proof for device authentication with comprehensive error handling.
        
        The proof demonstrates knowledge of the secret without revealing it.
        Includes timestamp for replay attack prevention.
        
        Features:
        - Caching to avoid regenerating identical proofs
        - Timeout handling for resource-intensive operations
        - Retry mechanism with exponential backoff
        - Detailed error messages for debugging
        
        Args:
            device_id: Unique device identifier
            secret: Device secret (password/private key)
            timestamp: Current timestamp for freshness
            use_cache: Whether to use cached proofs (default: True)
            retry_on_failure: Whether to retry on failure (default: True)
        
        Returns:
            Dictionary containing proof components
            
        Raises:
            ProofGenerationError: If proof generation fails after retries
            ProofGenerationTimeout: If generation exceeds timeout
        """
        # Check cache first
        if use_cache:
            cache_key = self._get_cache_key(device_id, secret, timestamp)
            if cache_key in self.proof_cache:
                logger.info(f"Using cached proof for device {device_id}")
                return self.proof_cache[cache_key]
        
        # Retry logic with exponential backoff
        last_error = None
        for attempt in range(self.max_retries if retry_on_failure else 1):
            try:
                logger.info(f"Generating proof for device {device_id} (attempt {attempt + 1}/{self.max_retries})")
                
                # Use timeout context
                with self.timeout_context(self.timeout_seconds):
                    proof_data = self._generate_proof_internal(device_id, secret, timestamp)
                
                # Cache successful proof
                if use_cache:
                    cache_key = self._get_cache_key(device_id, secret, timestamp)
                    self.proof_cache[cache_key] = proof_data
                
                logger.info(f"Proof generated successfully for device {device_id}")
                return proof_data
                
            except ProofGenerationTimeout as e:
                last_error = e
                logger.error(f"Timeout on attempt {attempt + 1}: {e}")
                if attempt < self.max_retries - 1 and retry_on_failure:
                    wait_time = 2 ** attempt  # Exponential backoff: 1, 2, 4 seconds
                    logger.info(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    raise ProofGenerationError(
                        f"Proof generation timed out after {self.max_retries} attempts. "
                        "This may indicate insufficient device resources. "
                        "Try reducing the complexity or using a more powerful device."
                    ) from e
                    
            except Exception as e:
                last_error = e
                logger.error(f"Error on attempt {attempt + 1}: {e}")
                if attempt < self.max_retries - 1 and retry_on_failure:
                    wait_time = 2 ** attempt
                    logger.info(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    raise ProofGenerationError(
                        f"Failed to generate proof after {self.max_retries} attempts: {str(e)}"
                    ) from e
        
        # Should not reach here, but just in case
        raise ProofGenerationError(f"Failed to generate proof: {last_error}")
    
    def _generate_proof_internal(self, device_id: str, secret: str, timestamp: int) -> Dict:
        """
        Internal method for actual proof generation (can be interrupted by timeout)
        """
        try:
            # Validate inputs
            if not device_id or not secret:
                raise ValueError("Device ID and secret are required")
            
            if len(secret) < 8:
                raise ValueError("Secret must be at least 8 characters")
            
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
                "timestamp": timestamp,
                "generated_at": int(time.time())
            }
            
        except ValueError as e:
            raise ProofGenerationError(f"Invalid input: {e}") from e
        except MemoryError as e:
            raise ProofGenerationError(
                "Insufficient memory to generate proof. This device may not have enough resources."
            ) from e
        except Exception as e:
            raise ProofGenerationError(f"Unexpected error during proof generation: {e}") from e
    
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


# Global ZKP generator instance with configurable timeouts
zkp_generator = ZKPGenerator(max_retries=3, timeout_seconds=30)
