"""Strongly-typed proof data models for type-safe ZKP operations"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class ProofProtocol(str, Enum):
    """ZKP Protocol types"""
    GROTH16 = "groth16"
    PLONK = "plonk"
    STARK = "stark"
    COMMITMENT = "commitment"  # Current simplified implementation


class ProofStatus(str, Enum):
    """Proof verification status"""
    VALID = "valid"
    INVALID = "invalid"
    PENDING = "pending"
    FAILED = "failed"


class ZKProof(BaseModel):
    """
    Strongly-typed ZKP Proof structure.
    
    Replaces loose JSON strings with proper type safety.
    Optimized for binary data transfer (bytes instead of hex strings).
    """
    protocol: ProofProtocol = Field(
        ...,
        description="ZKP protocol used (groth16, plonk, etc.)"
    )
    
    proof_bytes: bytes = Field(
        ...,
        description="Raw proof data as bytes (more efficient than hex strings)"
    )
    
    public_inputs: List[str] = Field(
        default_factory=list,
        description="Public inputs to the proof"
    )
    
    commitment: Optional[str] = Field(
        None,
        description="Commitment value (for commitment-based proofs)"
    )
    
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional proof metadata"
    )
    
    class Config:
        use_enum_values = True
        json_encoders = {
            bytes: lambda v: v.hex()  # Convert bytes to hex for JSON serialization
        }


class ZKProofRequest(BaseModel):
    """Request model for proof generation"""
    device_id: str = Field(..., min_length=1, max_length=100)
    secret: str = Field(..., min_length=1)
    timestamp: Optional[int] = None
    additional_inputs: Dict[str, List[str]] = Field(default_factory=dict)


class ZKProofResponse(BaseModel):
    """Response model for proof generation"""
    proof: ZKProof
    generated_at: datetime
    device_id: str
    proof_hash: str = Field(
        ...,
        description="Hash of the proof for quick verification"
    )
    generation_time_ms: int = Field(
        ...,
        description="Time taken to generate proof in milliseconds"
    )
    cached: bool = Field(
        default=False,
        description="Whether proof was retrieved from cache"
    )


class ZKProofVerificationRequest(BaseModel):
    """Request model for proof verification"""
    proof: ZKProof
    device_id: str
    expected_commitment: Optional[str] = None


class ZKProofVerificationResponse(BaseModel):
    """Response model for proof verification"""
    status: ProofStatus
    valid: bool
    device_id: str
    verified_at: datetime
    verification_time_ms: int
    message: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)


class MerkleProof(BaseModel):
    """Merkle tree proof structure"""
    root: str = Field(..., description="Merkle root hash")
    leaf: str = Field(..., description="Leaf hash being proven")
    siblings: List[str] = Field(
        default_factory=list,
        description="Sibling hashes for proof path"
    )
    indices: List[int] = Field(
        default_factory=list,
        description="Path indices (0=left, 1=right)"
    )
    
    def to_bytes(self) -> bytes:
        """Convert proof to binary format for efficient storage"""
        import json
        return json.dumps(self.dict()).encode()
    
    @classmethod
    def from_bytes(cls, data: bytes) -> 'MerkleProof':
        """Reconstruct proof from binary format"""
        import json
        return cls(**json.loads(data.decode()))


class DeviceAuthProof(BaseModel):
    """
    Complete device authentication proof package.
    Combines ZK proof with device metadata.
    """
    device_id: str
    proof: ZKProof
    device_public_key: str
    auth_timestamp: datetime
    challenge: Optional[str] = None
    response: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            bytes: lambda v: v.hex()
        }


class BatchProofRequest(BaseModel):
    """Request for batch proof generation"""
    proofs: List[ZKProofRequest]
    batch_id: Optional[str] = None
    parallel: bool = Field(
        default=True,
        description="Whether to generate proofs in parallel"
    )


class BatchProofResponse(BaseModel):
    """Response for batch proof generation"""
    batch_id: str
    proofs: List[ZKProofResponse]
    total_time_ms: int
    success_count: int
    failure_count: int
    failures: List[Dict[str, Any]] = Field(default_factory=list)
