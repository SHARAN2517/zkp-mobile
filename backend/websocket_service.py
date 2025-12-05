"""
WebSocket Service for Real-Time Updates
Enables multi-device dashboard synchronization
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set, List
import json
import logging
import asyncio

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for real-time updates"""
    
    def __init__(self):
        # Active connections mapped by client ID
        self.active_connections: Dict[str, WebSocket] = {}
        # Subscriptions: topic -> set of client IDs
        self.subscriptions: Dict[str, Set[str]] = {}
        
    async def connect(self, websocket: WebSocket, client_id: str):
        """Accept new WebSocket connection"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected. Total connections: {len(self.active_connections)}")
        
    def disconnect(self, client_id: str):
        """Remove WebSocket connection"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            
        # Remove from all subscriptions
        for topic in self.subscriptions:
            self.subscriptions[topic].discard(client_id)
            
        logger.info(f"Client {client_id} disconnected. Total connections: {len(self.active_connections)}")
        
    def subscribe(self, client_id: str, topic: str):
        """Subscribe client to a topic"""
        if topic not in self.subscriptions:
            self.subscriptions[topic] = set()
        self.subscriptions[topic].add(client_id)
        logger.info(f"Client {client_id} subscribed to {topic}")
        
    def unsubscribe(self, client_id: str, topic: str):
        """Unsubscribe client from a topic"""
        if topic in self.subscriptions:
            self.subscriptions[topic].discard(client_id)
            
    async def send_personal_message(self, message: dict, client_id: str):
        """Send message to specific client"""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to {client_id}: {e}")
                self.disconnect(client_id)
                
    async def broadcast(self, message: dict, topic: str = None):
        """Broadcast message to all clients or specific topic subscribers"""
        if topic and topic in self.subscriptions:
            # Send to topic subscribers only
            client_ids = list(self.subscriptions[topic])
        else:
            # Send to all clients
            client_ids = list(self.active_connections.keys())
            
        disconnected = []
        for client_id in client_ids:
            try:
                await self.active_connections[client_id].send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to {client_id}: {e}")
                disconnected.append(client_id)
                
        # Clean up disconnected clients
        for client_id in disconnected:
            self.disconnect(client_id)
            
    async def notify_device_event(self, device_id: str, event_type: str, data: dict):
        """Notify clients about device events"""
        message = {
            "type": "device_event",
            "device_id": device_id,
            "event_type": event_type,
            "data": data,
            "timestamp": data.get("timestamp")
        }
        await self.broadcast(message, topic=f"device:{device_id}")
        await self.broadcast(message, topic="devices")
        
    async def notify_blockchain_event(self, chain: str, event_type: str, data: dict):
        """Notify clients about blockchain events"""
        message = {
            "type": "blockchain_event",
            "chain": chain,
            "event_type": event_type,
            "data": data,
            "timestamp": data.get("timestamp")
        }
        await self.broadcast(message, topic=f"blockchain:{chain}")
        await self.broadcast(message, topic="blockchain")
        
    async def notify_metrics_update(self, metrics: dict):
        """Notify clients about system metrics updates"""
        message = {
            "type": "metrics_update",
            "metrics": metrics
        }
        await self.broadcast(message, topic="metrics")
        

# Global connection manager instance
manager = ConnectionManager()


async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint handler"""
    await manager.connect(websocket, client_id)
    
    try:
        while True:
            # Receive messages from client
            data = await websocket.receive_json()
            
            # Handle different message types
            msg_type = data.get("type")
            
            if msg_type == "subscribe":
                topic = data.get("topic")
                if topic:
                    manager.subscribe(client_id, topic)
                    await manager.send_personal_message({
                        "type": "subscribed",
                        "topic": topic
                    }, client_id)
                    
            elif msg_type == "unsubscribe":
                topic = data.get("topic")
                if topic:
                    manager.unsubscribe(client_id, topic)
                    await manager.send_personal_message({
                        "type": "unsubscribed",
                        "topic": topic
                    }, client_id)
                    
            elif msg_type == "ping":
                await manager.send_personal_message({
                    "type": "pong"
                }, client_id)
                
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error for {client_id}: {e}")
        manager.disconnect(client_id)
