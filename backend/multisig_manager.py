"""Multi-signature device registration system"""
from typing import Dict, List, Optional
from enum import Enum
from datetime import datetime, timedelta
import secrets
import logging

logger = logging.getLogger(__name__)


class ProposalStatus(Enum):
    """Status of a multi-sig proposal"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXECUTED = "executed"
    EXPIRED = "expired"


class MultiSigManager:
    """Manages multi-signature device registration proposals"""
    
    def __init__(self, db):
        self.db = db
        self.default_threshold = 2  # 2-of-3 by default
        self.proposal_expiry = timedelta(days=7)  # Proposals expire after 7 days
        logger.info("Multi-sig manager initialized")
    
    async def create_proposal(
        self,
        device_id: str,
        device_name: str,
        device_type: str,
        public_key_hash: str,
        proof_data: Dict,
        proposer: str,
        required_approvals: int = 2
    ) -> Dict:
        """Create a new device registration proposal"""
        
        # Check if proposal already exists
        existing = await self.db.multisig_proposals.find_one({"device_id": device_id})
        if existing and existing.get("status") != ProposalStatus.REJECTED.value:
            raise ValueError(f"Active proposal already exists for device {device_id}")
        
        proposal = {
            "proposal_id": secrets.token_hex(16),
            "device_id": device_id,
            "device_name": device_name,
            "device_type": device_type,
            "public_key_hash": public_key_hash,
            "proof_data": proof_data,
            "proposer": proposer,
            "required_approvals": required_approvals,
            "approvals": [],
            "rejections": [],
            "status": ProposalStatus.PENDING.value,
            "created_at": int(datetime.now().timestamp()),
            "expires_at": int((datetime.now() + self.proposal_expiry).timestamp()),
            "executed_at": None
        }
        
        await self.db.multisig_proposals.insert_one(proposal)
        
        logger.info(f"Created multi-sig proposal {proposal['proposal_id']} for device {device_id}")
        
        return {
            "success": True,
            "proposal_id": proposal["proposal_id"],
            "device_id": device_id,
            "required_approvals": required_approvals,
            "status": ProposalStatus.PENDING.value
        }
    
    async def approve_proposal(self, proposal_id: str, approver: str, signature: str) -> Dict:
        """Approve a device registration proposal"""
        
        proposal = await self.db.multisig_proposals.find_one({"proposal_id": proposal_id})
        if not proposal:
            raise ValueError(f"Proposal {proposal_id} not found")
        
        # Check if expired
        if int(datetime.now().timestamp()) > proposal["expires_at"]:
            await self.db.multisig_proposals.update_one(
                {"proposal_id": proposal_id},
                {"$set": {"status": ProposalStatus.EXPIRED.value}}
            )
            raise ValueError("Proposal has expired")
        
        if proposal["status"] != ProposalStatus.PENDING.value:
            raise ValueError(f"Proposal is not pending (status: {proposal['status']})")
        
        # Check if already approved/rejected by this signer
        if approver in [a["approver"] for a in proposal["approvals"]]:
            raise ValueError(f"Already approved by {approver}")
        
        if approver in [r["rejector"] for r in proposal["rejections"]]:
            raise ValueError(f"Already rejected by {approver}")
        
        # Add approval
        approval = {
            "approver": approver,
            "signature": signature,
            "timestamp": int(datetime.now().timestamp())
        }
        
        await self.db.multisig_proposals.update_one(
            {"proposal_id": proposal_id},
            {"$push": {"approvals": approval}}
        )
        
        # Check if threshold met
        updated_proposal = await self.db.multisig_proposals.find_one({"proposal_id": proposal_id})
        approval_count = len(updated_proposal["approvals"])
        
        if approval_count >= proposal["required_approvals"]:
            # Mark as approved
            await self.db.multisig_proposals.update_one(
                {"proposal_id": proposal_id},
                {"$set": {"status": ProposalStatus.APPROVED.value}}
            )
            
            logger.info(f"Proposal {proposal_id} reached approval threshold ({approval_count}/{proposal['required_approvals']})")
            
            return {
                "success": True,
                "proposal_id": proposal_id,
                "approvals": approval_count,
                "required": proposal["required_approvals"],
                "status": ProposalStatus.APPROVED.value,
                "message": "Proposal approved and ready for execution"
            }
        
        return {
            "success": True,
            "proposal_id": proposal_id,
            "approvals": approval_count,
            "required": proposal["required_approvals"],
            "status": ProposalStatus.PENDING.value,
            "message": f"Approval recorded ({approval_count}/{proposal['required_approvals']})"
        }
    
    async def reject_proposal(self, proposal_id: str, rejector: str, reason: str) -> Dict:
        """Reject a device registration proposal"""
        
        proposal = await self.db.multisig_proposals.find_one({"proposal_id": proposal_id})
        if not proposal:
            raise ValueError(f"Proposal {proposal_id} not found")
        
        if proposal["status"] != ProposalStatus.PENDING.value:
            raise ValueError(f"Proposal is not pending (status: {proposal['status']})")
        
        # Add rejection
        rejection = {
            "rejector": rejector,
            "reason": reason,
            "timestamp": int(datetime.now().timestamp())
        }
        
        await self.db.multisig_proposals.update_one(
            {"proposal_id": proposal_id},
            {
                "$push": {"rejections": rejection},
                "$set": {"status": ProposalStatus.REJECTED.value}
            }
        )
        
        logger.info(f"Proposal {proposal_id} rejected by {rejector}")
        
        return {
            "success": True,
            "proposal_id": proposal_id,
            "status": ProposalStatus.REJECTED.value,
            "message": "Proposal rejected"
        }
    
    async def execute_proposal(self, proposal_id: str, blockchain_result: Optional[Dict] = None) -> Dict:
        """Execute an approved proposal (register device)"""
        
        proposal = await self.db.multisig_proposals.find_one({"proposal_id": proposal_id})
        if not proposal:
            raise ValueError(f"Proposal {proposal_id} not found")
        
        if proposal["status"] != ProposalStatus.APPROVED.value:
            raise ValueError(f"Proposal must be approved before execution (current status: {proposal['status']})")
        
        # Execute the registration
        # This would typically be done with blockchain_client
        
        # Mark as executed
        await self.db.multisig_proposals.update_one(
            {"proposal_id": proposal_id},
            {
                "$set": {
                    "status": ProposalStatus.EXECUTED.value,
                    "executed_at": int(datetime.now().timestamp()),
                    "blockchain_result": blockchain_result
                }
            }
        )
        
        logger.info(f"Proposal {proposal_id} executed successfully")
        
        return {
            "success": True,
            "proposal_id": proposal_id,
            "device_id": proposal["device_id"],
            "status": ProposalStatus.EXECUTED.value,
            "blockchain_result": blockchain_result
        }
    
    async def get_proposal(self, proposal_id: str) -> Dict:
        """Get proposal details"""
        proposal = await self.db.multisig_proposals.find_one({"proposal_id": proposal_id})
        if not proposal:
            raise ValueError(f"Proposal {proposal_id} not found")
        
        proposal.pop("_id", None)
        return proposal
    
    async def list_proposals(self, status: Optional[str] = None) -> List[Dict]:
        """List all proposals, optionally filtered by status"""
        query = {}
        if status:
            query["status"] = status
        
        proposals = await self.db.multisig_proposals.find(query).to_list(100)
        for p in proposals:
            p.pop("_id", None)
        
        return proposals
    
    async def add_signer(self, signer_address: str, signer_name: str) -> Dict:
        """Add an authorized signer"""
        # Check if already exists
        existing = await self.db.authorized_signers.find_one({"address": signer_address})
        if existing:
            raise ValueError(f"Signer {signer_address} already authorized")
        
        signer = {
            "address": signer_address,
            "name": signer_name,
            "added_at": int(datetime.now().timestamp()),
            "is_active": True
        }
        
        await self.db.authorized_signers.insert_one(signer)
        
        return {
            "success": True,
            "signer": signer_address,
            "message": "Signer added successfully"
        }
    
    async def list_signers(self) -> List[Dict]:
        """List all authorized signers"""
        signers = await self.db.authorized_signers.find().to_list(100)
        for s in signers:
            s.pop("_id", None)
        return signers
