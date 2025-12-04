"""Real-time monitoring system for device status and events using WebSockets"""
import asyncio
from typing import Dict, Set, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class RealtimeMonitor:
    """Manages real-time device monitoring and WebSocket connections"""
    
    def __init__(self):
        # Track active WebSocket connections
        self.active_connections: Set = set()
        
        # Track device heartbeats
        self.device_heartbeats: Dict[str, datetime] = {}
        
        # Track device status
        self.device_status: Dict[str, str] = {}  # device_id -> status (online/offline/idle)
        
        # Heartbeat timeout (5 minutes)
        self.heartbeat_timeout = timedelta(minutes=5)
        
        # Event history (last 100 events)
        self.event_history = []
        self.max_history = 100
        
        logger.info("Real-time monitor initialized")
    
    async def connect(self, sid: str):
        """Register a new WebSocket connection"""
        self.active_connections.add(sid)
        logger.info(f"WebSocket connected: {sid}. Active connections: {len(self.active_connections)}")
    
    async def disconnect(self, sid: str):
        """Remove a WebSocket connection"""
        self.active_connections.discard(sid)
        logger.info(f"WebSocket disconnected: {sid}. Active connections: {len(self.active_connections)}")
    
    async def broadcast_event(self, event_type: str, data: dict):
        """Broadcast an event to all connected clients"""
        event = {
            'type': event_type,
            'timestamp': int(datetime.now().timestamp()),
            'data': data
        }
        
        # Add to history
        self.event_history.append(event)
        if len(self.event_history) > self.max_history:
            self.event_history.pop(0)
        
        # Broadcast to all connections (will be implemented with Socket.IO)
        logger.info(f"Broadcasting event: {event_type} to {len(self.active_connections)} clients")
        
        return event
    
    async def update_device_heartbeat(self, device_id: str):
        """Update device heartbeat timestamp"""
        now = datetime.now()
        old_status = self.device_status.get(device_id, 'offline')
        
        self.device_heartbeats[device_id] = now
        self.device_status[device_id] = 'online'
        
        # If device just came online, broadcast event
        if old_status != 'online':
            await self.broadcast_event('device_status_change', {
                'device_id': device_id,
                'status': 'online',
                'timestamp': int(now.timestamp())
            })
        
        return {
            'device_id': device_id,
            'status': 'online',
            'last_heartbeat': int(now.timestamp())
        }
    
    async def check_device_timeouts(self):
        """Check for devices that have timed out"""
        now = datetime.now()
        timeout_devices = []
        
        for device_id, last_heartbeat in self.device_heartbeats.items():
            if now - last_heartbeat > self.heartbeat_timeout:
                if self.device_status.get(device_id) != 'offline':
                    self.device_status[device_id] = 'offline'
                    timeout_devices.append(device_id)
                    
                    # Broadcast offline event
                    await self.broadcast_event('device_status_change', {
                        'device_id': device_id,
                        'status': 'offline',
                        'last_seen': int(last_heartbeat.timestamp())
                    })
        
        return timeout_devices
    
    def get_device_status(self, device_id: str) -> dict:
        """Get current status of a device"""
        status = self.device_status.get(device_id, 'offline')
        last_heartbeat = self.device_heartbeats.get(device_id)
        
        return {
            'device_id': device_id,
            'status': status,
            'last_heartbeat': int(last_heartbeat.timestamp()) if last_heartbeat else None
        }
    
    def get_all_device_statuses(self) -> list:
        """Get status of all tracked devices"""
        statuses = []
        for device_id in set(list(self.device_heartbeats.keys()) + list(self.device_status.keys())):
            statuses.append(self.get_device_status(device_id))
        return statuses
    
    async def emit_device_registered(self, device_data: dict):
        """Emit event when a device is registered"""
        await self.broadcast_event('device_registered', device_data)
    
    async def emit_device_authenticated(self, device_data: dict):
        """Emit event when a device authenticates"""
        await self.broadcast_event('device_authenticated', device_data)
    
    async def emit_data_submitted(self, data_info: dict):
        """Emit event when data is submitted"""
        await self.broadcast_event('data_submitted', data_info)
    
    async def emit_batch_anchored(self, batch_info: dict):
        """Emit event when Merkle batch is anchored"""
        await self.broadcast_event('batch_anchored', batch_info)
    
    def get_event_history(self, limit: int = 50) -> list:
        """Get recent event history"""
        return self.event_history[-limit:]
    
    def get_connection_count(self) -> int:
        """Get number of active WebSocket connections"""
        return len(self.active_connections)


# Global monitor instance
realtime_monitor = RealtimeMonitor()


async def start_heartbeat_checker():
    """Background task to check for device timeouts"""
    while True:
        try:
            await realtime_monitor.check_device_timeouts()
        except Exception as e:
            logger.error(f"Error in heartbeat checker: {e}")
        
        # Check every 30 seconds
        await asyncio.sleep(30)
