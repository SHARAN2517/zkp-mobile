"""Merkle Tree implementation for IoT data integrity verification"""
import hashlib
from typing import List, Dict, Optional
import json
import math


class MerkleTree:
    """
    Merkle Tree for efficient data integrity verification.
    Batches IoT data and creates a tamper-evident data structure.
    """
    
    def __init__(self, data_hashes: List[str]):
        """
        Initialize Merkle tree with data hashes.
        
        Args:
            data_hashes: List of data hashes (hex strings)
        """
        self.data_hashes = data_hashes
        self.tree_levels: List[List[str]] = []
        self.root: Optional[str] = None
        
        if data_hashes:
            self._build_tree()
    
    def _hash(self, data: str) -> str:
        """Hash function for tree construction"""
        return hashlib.sha256(data.encode()).hexdigest()
    
    def _hash_pair(self, left: str, right: str) -> str:
        """Hash a pair of nodes"""
        return self._hash(left + right)
    
    def _build_tree(self):
        """Build the Merkle tree from leaf nodes"""
        if not self.data_hashes:
            return
        
        # Start with leaf level
        current_level = self.data_hashes.copy()
        self.tree_levels = [current_level]
        
        # Build tree level by level
        while len(current_level) > 1:
            next_level = []
            
            # Process pairs
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                
                # If odd number of nodes, duplicate the last one
                if i + 1 < len(current_level):
                    right = current_level[i + 1]
                else:
                    right = left
                
                parent = self._hash_pair(left, right)
                next_level.append(parent)
            
            self.tree_levels.append(next_level)
            current_level = next_level
        
        # Root is the final single node
        self.root = current_level[0] if current_level else None
    
    def get_root(self) -> Optional[str]:
        """Get the Merkle root"""
        return self.root
    
    def get_proof(self, index: int) -> List[Dict[str, str]]:
        """
        Generate Merkle proof for data at given index.
        
        Args:
            index: Index of data in the leaf level
        
        Returns:
            List of proof objects with hash and position
        """
        if index >= len(self.data_hashes) or index < 0:
            return []
        
        proof = []
        current_index = index
        
        # Traverse from leaf to root
        for level_idx in range(len(self.tree_levels) - 1):
            level = self.tree_levels[level_idx]
            
            # Find sibling
            if current_index % 2 == 0:
                # Current is left, sibling is right
                sibling_index = current_index + 1
                position = "right"
            else:
                # Current is right, sibling is left
                sibling_index = current_index - 1
                position = "left"
            
            # Handle case where sibling doesn't exist (odd number of nodes)
            if sibling_index < len(level):
                sibling_hash = level[sibling_index]
            else:
                sibling_hash = level[current_index]  # Duplicate current
            
            proof.append({
                "hash": sibling_hash,
                "position": position
            })
            
            # Move to parent index
            current_index = current_index // 2
        
        return proof
    
    def verify_proof(self, data_hash: str, proof: List[Dict[str, str]], root: str) -> bool:
        """
        Verify a Merkle proof.
        
        Args:
            data_hash: Hash of the data to verify
            proof: Merkle proof from get_proof()
            root: Expected Merkle root
        
        Returns:
            True if proof is valid
        """
        computed_hash = data_hash
        
        for proof_element in proof:
            sibling_hash = proof_element["hash"]
            position = proof_element["position"]
            
            if position == "left":
                computed_hash = self._hash_pair(sibling_hash, computed_hash)
            else:
                computed_hash = self._hash_pair(computed_hash, sibling_hash)
        
        return computed_hash == root
    
    def get_tree_info(self) -> Dict:
        """Get tree information"""
        return {
            "leaf_count": len(self.data_hashes),
            "tree_height": len(self.tree_levels),
            "root": self.root,
            "levels": [len(level) for level in self.tree_levels]
        }


def hash_data(data: Dict) -> str:
    """Hash IoT data for Merkle tree"""
    # Sort keys for consistent hashing
    data_str = json.dumps(data, sort_keys=True)
    return hashlib.sha256(data_str.encode()).hexdigest()


def create_batch_merkle_tree(data_list: List[Dict]) -> MerkleTree:
    """
    Create Merkle tree from a batch of IoT data.
    
    Args:
        data_list: List of IoT data dictionaries
    
    Returns:
        MerkleTree instance
    """
    data_hashes = [hash_data(data) for data in data_list]
    return MerkleTree(data_hashes)
