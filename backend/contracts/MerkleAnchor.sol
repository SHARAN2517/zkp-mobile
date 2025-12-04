// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MerkleAnchor
 * @dev Anchors Merkle tree roots of IoT data batches for integrity verification
 */
contract MerkleAnchor {
    struct DataBatch {
        bytes32 merkleRoot;
        uint256 timestamp;
        uint256 batchSize;
        address submitter;
        string batchMetadata; // e.g., device IDs included
    }
    
    mapping(uint256 => DataBatch) public batches;
    mapping(bytes32 => uint256) public rootToBatchId;
    
    uint256 public currentBatchId;
    uint256 public totalDataAnchored;
    
    event MerkleRootAnchored(
        uint256 indexed batchId,
        bytes32 indexed merkleRoot,
        uint256 batchSize,
        address indexed submitter,
        uint256 timestamp
    );
    
    event DataVerified(
        bytes32 indexed dataHash,
        uint256 indexed batchId,
        bool isValid
    );
    
    /**
     * @dev Anchor a Merkle root on-chain
     * @param merkleRoot Root hash of the Merkle tree
     * @param batchSize Number of data entries in this batch
     * @param metadata Additional batch information
     */
    function anchorMerkleRoot(
        bytes32 merkleRoot,
        uint256 batchSize,
        string memory metadata
    ) external returns (uint256) {
        require(merkleRoot != bytes32(0), "Invalid Merkle root");
        require(batchSize > 0, "Batch size must be positive");
        
        currentBatchId++;
        
        batches[currentBatchId] = DataBatch({
            merkleRoot: merkleRoot,
            timestamp: block.timestamp,
            batchSize: batchSize,
            submitter: msg.sender,
            batchMetadata: metadata
        });
        
        rootToBatchId[merkleRoot] = currentBatchId;
        totalDataAnchored += batchSize;
        
        emit MerkleRootAnchored(
            currentBatchId,
            merkleRoot,
            batchSize,
            msg.sender,
            block.timestamp
        );
        
        return currentBatchId;
    }
    
    /**
     * @dev Verify data integrity using Merkle proof
     * @param batchId Batch ID containing the data
     * @param dataHash Hash of the data to verify
     * @param proof Merkle proof (sibling hashes)
     * @param index Index of data in the Merkle tree
     */
    function verifyData(
        uint256 batchId,
        bytes32 dataHash,
        bytes32[] memory proof,
        uint256 index
    ) external returns (bool) {
        require(batches[batchId].merkleRoot != bytes32(0), "Batch does not exist");
        
        bytes32 computedHash = dataHash;
        
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            
            if (index % 2 == 0) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
            
            index = index / 2;
        }
        
        bool isValid = computedHash == batches[batchId].merkleRoot;
        
        emit DataVerified(dataHash, batchId, isValid);
        return isValid;
    }
    
    /**
     * @dev Get batch information
     */
    function getBatch(uint256 batchId) external view returns (DataBatch memory) {
        return batches[batchId];
    }
    
    /**
     * @dev Get batch ID for a Merkle root
     */
    function getBatchIdByRoot(bytes32 merkleRoot) external view returns (uint256) {
        return rootToBatchId[merkleRoot];
    }
    
    /**
     * @dev Get total number of data entries anchored
     */
    function getTotalDataAnchored() external view returns (uint256) {
        return totalDataAnchored;
    }
}
