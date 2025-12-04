"""Advanced analytics system for ZK-IoTChain metrics and data visualization"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging
from collections import defaultdict

logger = logging.getLogger(__name__)


class AnalyticsEngine:
    """Analytics engine for generating system metrics and insights"""
    
    def __init__(self, db):
        self.db = db
    
    async def get_overview_stats(self) -> Dict:
        """Get high-level system statistics"""
        # Device stats
        total_devices = await self.db.devices.count_documents({})
        active_devices = await self.db.devices.count_documents({"is_active": True})
        
        # Data stats
        total_data = await self.db.iot_data.count_documents({})
        anchored_data = await self.db.iot_data.count_documents({"anchored": True})
        
        # Batch stats
        total_batches = await self.db.merkle_batches.count_documents({})
        
        # Auth stats
        total_auths = await self.db.auth_logs.count_documents({})
        
        # Recent activity (last 24 hours)
        yesterday = int((datetime.now() - timedelta(days=1)).timestamp())
        recent_devices = await self.db.devices.count_documents({"registered_at": {"$gte": yesterday}})
        recent_data = await self.db.iot_data.count_documents({"timestamp": {"$gte": yesterday}})
        recent_auths = await self.db.auth_logs.count_documents({"timestamp": {"$gte": yesterday}})
        
        return {
            "devices": {
                "total": total_devices,
                "active": active_devices,
                "inactive": total_devices - active_devices,
                "registered_24h": recent_devices
            },
            "data": {
                "total": total_data,
                "anchored": anchored_data,
                "pending": total_data - anchored_data,
                "submitted_24h": recent_data
            },
            "batches": {
                "total": total_batches
            },
            "authentications": {
                "total": total_auths,
                "count_24h": recent_auths
            }
        }
    
    async def get_device_analytics(self, device_id: Optional[str] = None) -> Dict:
        """Get analytics for specific device or all devices"""
        if device_id:
            # Single device analytics
            device = await self.db.devices.find_one({"device_id": device_id})
            if not device:
                raise ValueError(f"Device {device_id} not found")
            
            data_count = await self.db.iot_data.count_documents({"device_id": device_id})
            auth_count = await self.db.auth_logs.count_documents({"device_id": device_id})
            
            # Get recent data submissions
            recent_data = await self.db.iot_data.find(
                {"device_id": device_id}
            ).sort("timestamp", -1).limit(10).to_list(10)
            
            return {
                "device_id": device_id,
                "device_name": device.get("device_name"),
                "device_type": device.get("device_type"),
                "registered_at": device.get("registered_at"),
                "is_active": device.get("is_active"),
                "total_data_submitted": data_count,
                "total_authentications": auth_count,
                "recent_submissions": [{
                    "data_hash": d.get("data_hash"),
                    "timestamp": d.get("timestamp"),
                    "anchored": d.get("anchored")
                } for d in recent_data]
            }
        else:
            # All devices analytics
            devices = await self.db.devices.find().to_list(100)
            device_analytics = []
            
            for device in devices:
                data_count = await self.db.iot_data.count_documents({"device_id": device["device_id"]})
                auth_count = await self.db.auth_logs.count_documents({"device_id": device["device_id"]})
                
                device_analytics.append({
                    "device_id": device["device_id"],
                    "device_name": device.get("device_name"),
                    "device_type": device.get("device_type"),
                    "total_data": data_count,
                    "total_auths": auth_count,
                    "is_active": device.get("is_active")
                })
            
            return {
                "total_devices": len(devices),
                "devices": device_analytics
            }
    
    async def get_proof_analytics(self) -> Dict:
        """Get ZKP generation and verification metrics"""
        # Get all authentications
        auths = await self.db.auth_logs.find().to_list(1000)
        
        total_proofs = len(auths)
        successful_proofs = sum(1 for a in auths if a.get("success", False))
        
        # Calculate time-based stats
        proof_times = defaultdict(int)
        for auth in auths:
            timestamp = auth.get("timestamp", 0)
            hour = datetime.fromtimestamp(timestamp).hour
            proof_times[hour] += 1
        
        return {
            "total_proofs_generated": total_proofs,
            "successful_verifications": successful_proofs,
            "failed_verifications": total_proofs - successful_proofs,
            "success_rate": (successful_proofs / total_proofs * 100) if total_proofs > 0 else 0,
            "proofs_by_hour": dict(proof_times)
        }
    
    async def get_blockchain_analytics(self) -> Dict:
        """Get blockchain transaction and gas analytics"""
        batches = await self.db.merkle_batches.find().to_list(1000)
        
        total_batches = len(batches)
        total_gas = sum(b.get("gas_used", 0) for b in batches if b.get("gas_used"))
        avg_gas = total_gas / total_batches if total_batches > 0 else 0
        
        # Calculate gas by network
        gas_by_network = defaultdict(lambda: {"count": 0, "total_gas": 0})
        for batch in batches:
            # Assuming network info might be in blockchain_tx or metadata
            network = "sepolia"  # Default, can be extended
            gas_used = batch.get("gas_used", 0)
            gas_by_network[network]["count"] += 1
            gas_by_network[network]["total_gas"] += gas_used
        
        return {
            "total_batches": total_batches,
            "total_gas_used": total_gas,
            "average_gas_per_batch": avg_gas,
            "gas_by_network": dict(gas_by_network),
            "total_data_anchored": sum(b.get("data_count", 0) for b in batches)
        }
    
    async def get_time_series_data(
        self,
        metric: str,
        start_time: int,
        end_time: int,
        interval: str = "hour"
    ) -> Dict:
        """Get time-series data for a specific metric"""
        # Convert timestamps
        start_dt = datetime.fromtimestamp(start_time)
        end_dt = datetime.fromtimestamp(end_time)
        
        if metric == "data_submissions":
            # Get data submissions over time
            data_points = await self.db.iot_data.find({
                "timestamp": {"$gte": start_time, "$lte": end_time}
            }).to_list(10000)
            
            # Group by interval
            time_buckets = defaultdict(int)
            for point in data_points:
                timestamp = point.get("timestamp", 0)
                dt = datetime.fromtimestamp(timestamp)
                
                if interval == "hour":
                    bucket = dt.replace(minute=0, second=0, microsecond=0)
                elif interval == "day":
                    bucket = dt.replace(hour=0, minute=0, second=0, microsecond=0)
                else:
                    bucket = dt
                
                time_buckets[int(bucket.timestamp())] += 1
            
            return {
                "metric": metric,
                "interval": interval,
                "start_time": start_time,
                "end_time": end_time,
                "data_points": [{"timestamp": k, "value": v} for k, v in sorted(time_buckets.items())]
            }
        
        elif metric == "authentications":
            # Get authentications over time
            auths = await self.db.auth_logs.find({
                "timestamp": {"$gte": start_time, "$lte": end_time}
            }).to_list(10000)
            
            time_buckets = defaultdict(int)
            for auth in auths:
                timestamp = auth.get("timestamp", 0)
                dt = datetime.fromtimestamp(timestamp)
                
                if interval == "hour":
                    bucket = dt.replace(minute=0, second=0, microsecond=0)
                elif interval == "day":
                    bucket = dt.replace(hour=0, minute=0, second=0, microsecond=0)
                else:
                    bucket = dt
                
                time_buckets[int(bucket.timestamp())] += 1
            
            return {
                "metric": metric,
                "interval": interval,
                "start_time": start_time,
                "end_time": end_time,
                "data_points": [{"timestamp": k, "value": v} for k, v in sorted(time_buckets.items())]
            }
        
        else:
            raise ValueError(f"Unsupported metric: {metric}")
    
    async def export_data(self, data_type: str, format: str = "json") -> Dict:
        """Export data for external analysis"""
        if data_type == "devices":
            devices = await self.db.devices.find().to_list(1000)
            for d in devices:
                d.pop("_id", None)
                d.pop("private_key", None)  # Security
            return {"data_type": data_type, "format": format, "records": devices, "count": len(devices)}
        
        elif data_type == "data_submissions":
            data = await self.db.iot_data.find().to_list(10000)
            for d in data:
                d.pop("_id", None)
            return {"data_type": data_type, "format": format, "records": data, "count": len(data)}
        
        elif data_type == "batches":
            batches = await self.db.merkle_batches.find().to_list(1000)
            for b in batches:
                b.pop("_id", None)
            return {"data_type": data_type, "format": format, "records": batches, "count": len(batches)}
        
        else:
            raise ValueError(f"Unsupported data type: {data_type}")
