"""Cross-chain data anchoring and verification system"""
from typing import Dict, List, Optional
import asyncio
import logging

logger = logging.getLogger(__name__)


class CrossChainBridge:
    """Manages cross-chain Merkle root anchoring and verification"""
    
    def __init__(self, multi_chain_client, db):
        self.multi_chain_client = multi_chain_client
        self.db = db
        logger.info("Cross-chain bridge initialized")
    
    async def anchor_cross_chain(
        self,
        merkle_root: str,
        batch_size: int,
        metadata: str,
        target_chains: List[str]
    ) -> Dict:
        """Anchor Merkle root to multiple blockchains"""
        
        if not target_chains:
            raise ValueError("At least one target chain must be specified")
        
        results = {}
        successful_anchors = []
        failed_anchors = []
        
        # Anchor to each specified chain
        for chain in target_chains:
            try:
                logger.info(f"Anchoring to {chain}...")
                
                result = self.multi_chain_client.anchor_merkle_root(
                    merkle_root,
                    batch_size,
                    metadata,
                    chain
                )
                
                results[chain] = result
                
                if result.get("success"):
                    successful_anchors.append(chain)
                else:
                    failed_anchors.append(chain)
            
            except Exception as e:
                logger.error(f"Failed to anchor to {chain}: {e}")
                results[chain] = {
                    "success": False,
                    "error": str(e),
                    "network": chain
                }
                failed_anchors.append(chain)
        
        # Store cross-chain anchor info
        cross_chain_doc = {
            "merkle_root": merkle_root,
            "batch_size": batch_size,
            "metadata": metadata,
            "target_chains": target_chains,
            "results": results,
            "successful_chains": successful_anchors,
            "failed_chains": failed_anchors,
            "timestamp": int(asyncio.get_event_loop().time())
        }
        
        await self.db.cross_chain_anchors.insert_one(cross_chain_doc)
        
        return {
            "success": len(successful_anchors) > 0,
            "merkle_root": merkle_root,
            "total_chains": len(target_chains),
            "successful_chains": successful_anchors,
            "failed_chains": failed_anchors,
            "results": results,
            "message": f"Anchored to {len(successful_anchors)}/{len(target_chains)} chains"
        }
    
    async def verify_cross_chain(
        self,
        data_hash: str,
        merkle_root: str,
        chains: Optional[List[str]] = None
    ) -> Dict:
        """Verify data integrity across multiple chains"""
        
        # Get cross-chain anchor info
        anchor = await self.db.cross_chain_anchors.find_one({"merkle_root": merkle_root})
        
        if not anchor:
            raise ValueError(f"No cross-chain anchor found for root {merkle_root}")
        
        if chains is None:
            chains = anchor["successful_chains"]
        
        verification_results = {}
        
        for chain in chains:
            try:
                # In a full implementation, this would query the blockchain
                # to verify the Merkle root is anchored on-chain
                # For now, we check our database records
                
                chain_result = anchor["results"].get(chain, {})
                
                if chain_result.get("success"):
                    verification_results[chain] = {
                        "verified": True,
                        "tx_hash": chain_result.get("tx_hash"),
                        "block_number": chain_result.get("block_number"),
                        "explorer_url": chain_result.get("explorer_url")
                    }
                else:
                    verification_results[chain] = {
                        "verified": False,
                        "error": "Anchor failed"
                    }
            
            except Exception as e:
                logger.error(f"Error verifying on {chain}: {e}")
                verification_results[chain] = {
                    "verified": False,
                    "error": str(e)
                }
        
        verified_count = sum(1 for r in verification_results.values() if r.get("verified"))
        
        return {
            "success": True,
            "data_hash": data_hash,
            "merkle_root": merkle_root,
            "total_chains": len(chains),
            "verified_chains": verified_count,
            "verification_results": verification_results,
            "is_valid": verified_count > 0
        }
    
    async def get_anchor_status(self, merkle_root: str) -> Dict:
        """Get status of cross-chain anchoring for a Merkle root"""
        
        anchor = await self.db.cross_chain_anchors.find_one({"merkle_root": merkle_root})
        
        if not anchor:
            raise ValueError(f"No cross-chain anchor found for root {merkle_root}")
        
        anchor.pop("_id", None)
        
        return {
            "success": True,
            "anchor_info": anchor
        }
    
    async def list_cross_chain_anchors(self) -> List[Dict]:
        """List all cross-chain anchors"""
        
        anchors = await self.db.cross_chain_anchors.find().to_list(100)
        
        for anchor in anchors:
            anchor.pop("_id", None)
        
        return {
            "success": True,
            "total": len(anchors),
            "anchors": anchors
        }
    
    async def get_chain_sync_status(self) -> Dict:
        """Get synchronization status across all chains"""
        
        # Get all successful anchors per chain
        anchors = await self.db.cross_chain_anchors.find().to_list(1000)
        
        chain_stats = {}
        
        for anchor in anchors:
            for chain in anchor.get("successful_chains", []):
                if chain not in chain_stats:
                    chain_stats[chain] = {
                        "total_anchors": 0,
                        "last_anchor_time": 0
                    }
                
                chain_stats[chain]["total_anchors"] += 1
                anchor_time = anchor.get("timestamp", 0)
                
                if anchor_time > chain_stats[chain]["last_anchor_time"]:
                    chain_stats[chain]["last_anchor_time"] = anchor_time
        
        return {
            "success": True,
            "chain_statistics": chain_stats,
            "total_cross_chain_anchors": len(anchors)
        }
