"""
SNARK Service Foundation
Provides interface for circom/snarkjs-based SNARK proof generation
Note: Requires circom and snarkjs to be installed separately
"""

import subprocess
import json
import os
from pathlib import Path
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)


class SNARKService:
    """
    Service for generating and verifying SNARK proofs using circom/snarkjs
    
    This is a foundation implementation that requires:
      - circom compiler installed
    - snarkjs library installed
    - Circuit files (.circom)
    - Proving/verification keys generated
    """
    
    def __init__(self, circuits_dir: str = "./circuits"):
        self.circuits_dir = Path(circuits_dir)
        self.circuits_dir.mkdir(exist_ok=True)
        self.build_dir = self.circuits_dir / "build"
        self.build_dir.mkdir(exist_ok=True)
        
    def check_dependencies(self) -> Dict[str, bool]:
        """Check if circom and snarkjs are installed"""
        dependencies = {}
        
        # Check circom
        try:
            result = subprocess.run(
                ["circom", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            dependencies["circom"] = result.returncode == 0
        except (FileNotFoundError, subprocess.TimeoutExpired):
            dependencies["circom"] = False
            
        # Check snarkjs
        try:
            result = subprocess.run(
                ["snarkjs", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            dependencies["snarkjs"] = result.returncode == 0
        except (FileNotFoundError, subprocess.TimeoutExpired):
            dependencies["snarkjs"] = False
            
        return dependencies
        
    def compile_circuit(self, circuit_name: str) -> bool:
        """
        Compile a circom circuit
        
        Args:
            circuit_name: Name of circuit file (without .circom extension)
            
        Returns:
            True if compilation successful
        """
        circuit_file = self.circuits_dir / f"{circuit_name}.circom"
        
        if not circuit_file.exists():
            logger.error(f"Circuit file not found: {circuit_file}")
            return False
            
        try:
            logger.info(f"Compiling circuit: {circuit_name}")
            result = subprocess.run(
                [
                    "circom",
                    str(circuit_file),
                    "--r1cs",
                    "--wasm",
                    "--sym",
                    "-o", str(self.build_dir)
                ],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                logger.info(f"Successfully compiled {circuit_name}")
                return True
            else:
                logger.error(f"Compilation failed: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Error compiling circuit: {e}")
            return False
            
    def generate_proof(
        self,
        circuit_name: str,
        input_data: Dict,
        proving_key_path: Optional[str] = None
    ) -> Optional[Dict]:
        """
        Generate a SNARK proof
        
        Args:
            circuit_name: Name of the circuit
            input_data: Input signals for the circuit
            proving_key_path: Path to proving key (optional)
            
        Returns:
            Proof data including proof and public signals
        """
        # Save input to file
        input_file = self.build_dir / f"{circuit_name}_input.json"
        with open(input_file, 'w') as f:
            json.dump(input_data, f)
            
        witness_file = self.build_dir / f"{circuit_name}_witness.wtns"
        proof_file = self.build_dir / f"{circuit_name}_proof.json"
        public_file = self.build_dir / f"{circuit_name}_public.json"
        
        wasm_file = self.build_dir / f"{circuit_name}_js" / f"{circuit_name}.wasm"
        
        try:
            # Generate witness
            logger.info("Generating witness...")
            subprocess.run(
                [
                    "snarkjs",
                    "wtns",
                    "calculate",
                    str(wasm_file),
                    str(input_file),
                    str(witness_file)
                ],
                check=True,
                capture_output=True,
                timeout=30
            )
            
            # Generate proof (requires proving key)
            if proving_key_path and os.path.exists(proving_key_path):
                logger.info("Generating proof...")
                subprocess.run(
                    [
                        "snarkjs",
                        "groth16",
                        "prove",
                        proving_key_path,
                        str(witness_file),
                        str(proof_file),
                        str(public_file)
                    ],
                    check=True,
                    capture_output=True,
                    timeout=30
                )
                
                # Read proof and public signals
                with open(proof_file, 'r') as f:
                    proof = json.load(f)
                with open(public_file, 'r') as f:
                    public_signals = json.load(f)
                    
                return {
                    "proof": proof,
                    "publicSignals": public_signals,
                    "scheme": "groth16"
                }
            else:
                logger.warning("Proving key not found. Proof generation skipped.")
                return None
                
        except Exception as e:
            logger.error(f"Error generating proof: {e}")
            return None
            
    def verify_proof(
        self,
        proof_data: Dict,
        verification_key_path: str
    ) -> bool:
        """
        Verify a SNARK proof
        
        Args:
            proof_data: Proof and public signals
            verification_key_path: Path to verification key
            
        Returns:
            True if proof is valid
        """
        if not os.path.exists(verification_key_path):
            logger.error(f"Verification key not found: {verification_key_path}")
            return False
            
        # Save proof data to file
        proof_file = self.build_dir / "temp_proof.json"
        public_file = self.build_dir / "temp_public.json"
        
        with open(proof_file, 'w') as f:
            json.dump(proof_data.get("proof", {}), f)
        with open(public_file, 'w') as f:
            json.dump(proof_data.get("publicSignals", []), f)
            
        try:
            logger.info("Verifying proof...")
            result = subprocess.run(
                [
                    "snarkjs",
                    "groth16",
                    "verify",
                    verification_key_path,
                    str(public_file),
                    str(proof_file)
                ],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            # Check if verification succeeded
            is_valid = "OK" in result.stdout
            logger.info(f"Proof verification result: {'VALID' if is_valid else 'INVALID'}")
            return is_valid
            
        except Exception as e:
            logger.error(f"Error verifying proof: {e}")
            return False


# Global SNARK service instance
snark_service = SNARKService()
