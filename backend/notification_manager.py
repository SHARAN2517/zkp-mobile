"""
Notification Manager for Backend
Sends push notifications to mobile clients via Expo
"""

import requests
import logging
from typing import List, Dict, Optional
import json

logger = logging.getLogger(__name__)

# Expo Push Notification API endpoint
EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


class NotificationManager:
    """Manages push notifications via Expo Push Notification service"""
    
    def __init__(self):
        self.expo_push_tokens: Dict[str, str] = {}  # device_id -> expo_push_token
        
    def register_device(self, device_id: str, expo_push_token: str):
        """Register device's Expo push token"""
        self.expo_push_tokens[device_id] = expo_push_token
        logger.info(f"Registered push token for device {device_id}")
        
    def unregister_device(self, device_id: str):
        """Unregister device's push token"""
        if device_id in self.expo_push_tokens:
            del self.expo_push_tokens[device_id]
            logger.info(f"Unregistered push token for device {device_id}")
            
    def send_notification(
        self,
        expo_push_token: str,
        title: str,
        body: str,
        data: Optional[Dict] = None,
        priority: str = "high"
    ) -> bool:
        """Send push notification to a single device"""
        message = {
            "to": expo_push_token,
            "title": title,
            "body": body,
            "sound": "default",
            "priority": priority,
            "data": data or {}
        }
        
        try:
            response = requests.post(
                EXPO_PUSH_URL,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                json=message,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("data", {}).get("status") == "ok":
                    logger.info(f"Notification sent successfully to {expo_push_token[:10]}...")
                    return True
                else:
                    logger.error(f"Expo API error: {result}")
                    return False
            else:
                logger.error(f"Failed to send notification: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending notification: {e}")
            return False
            
    def send_batch_notifications(
        self,
        expo_push_tokens: List[str],
        title: str,
        body: str,
        data: Optional[Dict] = None
    ) -> int:
        """Send notifications to multiple devices"""
        messages = [
            {
                "to": token,
                "title": title,
                "body": body,
                "sound": "default",
                "data": data or {}
            }
            for token in expo_push_tokens
        ]
        
        try:
            response = requests.post(
                EXPO_PUSH_URL,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                json=messages,
                timeout=10
            )
            
            if response.status_code == 200:
                results = response.json().get("data", [])
                success_count = sum(1 for r in results if r.get("status") == "ok")
                logger.info(f"Sent {success_count}/{len(messages)} notifications successfully")
                return success_count
            else:
                logger.error(f"Failed to send batch notifications: {response.status_code}")
                return 0
                
        except Exception as e:
            logger.error(f"Error sending batch notifications: {e}")
            return 0
            
    def notify_device_registered(self, device_id: str, device_name: str):
        """Send notification when device is registered"""
        if device_id in self.expo_push_tokens:
            self.send_notification(
                self.expo_push_tokens[device_id],
                "✅ Device Registered",
                f"Device '{device_name}' successfully registered with ZK-IoTChain",
                {"type": "device_registered", "device_id": device_id}
            )
            
    def notify_data_submitted(self, device_id: str, data_count: int):
        """Send notification when data is submitted"""
        if device_id in self.expo_push_tokens:
            self.send_notification(
                self.expo_push_tokens[device_id],
                "📊 Data Submitted",
                f"{data_count} data points submitted successfully",
                {"type": "data_submitted", "device_id": device_id, "count": data_count}
            )
            
    def notify_data_anchored(self, device_id: str, chain: str, tx_hash: str):
        """Send notification when data is anchored to blockchain"""
        if device_id in self.expo_push_tokens:
            self.send_notification(
                self.expo_push_tokens[device_id],
                "⛓️ Data Anchored to Blockchain",
                f"Your data has been anchored to {chain}",
                {
                    "type": "data_anchored",
                    "device_id": device_id,
                    "chain": chain,
                    "tx_hash": tx_hash
                }
            )
            
    def notify_proof_verified(self, device_id: str, success: bool):
        """Send notification about proof verification result"""
        if device_id in self.expo_push_tokens:
            if success:
                self.send_notification(
                    self.expo_push_tokens[device_id],
                    "✅ Proof Verified",
                    "Your zero-knowledge proof was successfully verified",
                    {"type": "proof_verified", "device_id": device_id, "success": True}
                )
            else:
                self.send_notification(
                    self.expo_push_tokens[device_id],
                    "❌ Proof Verification Failed",
                    "Zero-knowledge proof verification failed",
                    {"type": "proof_verified", "device_id": device_id, "success": False},
                    priority="high"
                )
                
    def notify_device_offline(self, device_id: str, device_name: str):
        """Send notification when device goes offline"""
        if device_id in self.expo_push_tokens:
            self.send_notification(
                self.expo_push_tokens[device_id],
                "⚠️ Device Offline",
                f"Device '{device_name}' has gone offline",
                {"type": "device_offline", "device_id": device_id},
                priority="high"
            )
            
    def broadcast_system_notification(self, title: str, body: str, data: Optional[Dict] = None):
        """Send notification to all registered devices"""
        tokens = list(self.expo_push_tokens.values())
        if tokens:
            self.send_batch_notifications(tokens, title, body, data)


# Global notification manager instance
notification_manager = NotificationManager()
