/**
 * Strongly-typed ZKP Proof structures for TypeScript/React Native
 * 
 * These types ensure type safety when handling proofs between
 * the frontend and backend, replacing loose JSON strings.
 */

/**
 * ZKP Protocol types
 */
export enum ProofProtocol {
    GROTH16 = 'groth16',
    PLONK = 'plonk',
    STARK = 'stark',
    COMMITMENT = 'commitment',
}

/**
 * Proof verification status
 */
export enum ProofStatus {
    VALID = 'valid',
    INVALID = 'invalid',
    PENDING = 'pending',
    FAILED = 'failed',
}

/**
 * Core ZKP Proof structure
 * 
 * Strongly-typed replacement for JSON strings.
 * Handles binary data efficiently.
 */
export interface ZKProof {
    /** ZKP protocol used */
    protocol: ProofProtocol;

    /** Raw proof data as hex string (converted from bytes) */
    proof_bytes: string;

    /** Public inputs to the proof */
    public_inputs: string[];

    /** Commitment value (for commitment-based proofs) */
    commitment?: string;

    /** Additional proof metadata */
    metadata?: Record<string, any>;
}

/**
 * Proof generation request
 */
export interface ZKProofRequest {
    device_id: string;
    secret: string;
    timestamp?: number;
    additional_inputs?: Record<string, string[]>;
}

/**
 * Proof generation response
 */
export interface ZKProofResponse {
    /** The generated proof */
    proof: ZKProof;

    /** Timestamp when proof was generated */
    generated_at: string;

    /** Device ID */
    device_id: string;

    /** Hash of the proof for quick verification */
    proof_hash: string;

    /** Time taken to generate proof (ms) */
    generation_time_ms: number;

    /** Whether proof was from cache */
    cached: boolean;
}

/**
 * Proof verification request
 */
export interface ZKProofVerificationRequest {
    proof: ZKProof;
    device_id: string;
    expected_commitment?: string;
}

/**
 * Proof verification response
 */
export interface ZKProofVerificationResponse {
    /** Verification status */
    status: ProofStatus;

    /** Whether proof is valid */
    valid: boolean;

    /** Device ID */
    device_id: string;

    /** Verification timestamp */
    verified_at: string;

    /** Time taken to verify (ms) */
    verification_time_ms: number;

    /** Optional message */
    message?: string;

    /** Additional details */
    details?: Record<string, any>;
}

/**
 * Merkle tree proof structure
 */
export interface MerkleProof {
    /** Merkle root hash */
    root: string;

    /** Leaf hash being proven */
    leaf: string;

    /** Sibling hashes for proof path */
    siblings: string[];

    /** Path indices (0=left, 1=right) */
    indices: number[];
}

/**
 * Complete device authentication proof package
 */
export interface DeviceAuthProof {
    /** Device ID */
    device_id: string;

    /** ZK Proof */
    proof: ZKProof;

    /** Device public key */
    device_public_key: string;

    /** Authentication timestamp */
    auth_timestamp: string;

    /** Optional challenge */
    challenge?: string;

    /** Optional response */
    response?: string;
}

/**
 * Batch proof generation request
 */
export interface BatchProofRequest {
    /** Array of proof requests */
    proofs: ZKProofRequest[];

    /** Optional batch ID */
    batch_id?: string;

    /** Generate in parallel */
    parallel?: boolean;
}

/**
 * Batch proof generation response
 */
export interface BatchProofResponse {
    /** Batch ID */
    batch_id: string;

    /** Generated proofs */
    proofs: ZKProofResponse[];

    /** Total time taken (ms) */
    total_time_ms: number;

    /** Number of successful proofs */
    success_count: number;

    /** Number of failed proofs */
    failure_count: number;

    /** Failure details */
    failures: Array<Record<string, any>>;
}

/**
 * Type guards for runtime type checking
 */

export function isZKProof(obj: any): obj is ZKProof {
    return (
        typeof obj === 'object' &&
        typeof obj.protocol === 'string' &&
        typeof obj.proof_bytes === 'string' &&
        Array.isArray(obj.public_inputs)
    );
}

export function isZKProofResponse(obj: any): obj is ZKProofResponse {
    return (
        typeof obj === 'object' &&
        isZKProof(obj.proof) &&
        typeof obj.device_id === 'string' &&
        typeof obj.proof_hash === 'string'
    );
}

export function isMerkleProof(obj: any): obj is MerkleProof {
    return (
        typeof obj === 'object' &&
        typeof obj.root === 'string' &&
        typeof obj.leaf === 'string' &&
        Array.isArray(obj.siblings) &&
        Array.isArray(obj.indices)
    );
}

/**
 * Utility functions for proof handling
 */

/**
 * Convert hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
}

/**
 * Convert Uint8Array to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Calculate proof hash for quick comparison
 */
export function calculateProofHash(proof: ZKProof): string {
    const data = JSON.stringify({
        protocol: proof.protocol,
        proof_bytes: proof.proof_bytes,
        public_inputs: proof.public_inputs,
    });

    // Simple hash (in production, use crypto.subtle.digest)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16).padStart(8, '0');
}
