"""
AI/ML-based Tampering Detection and Anomaly Detection System
Uses machine learning to predict and detect potential attacks before they occur
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import logging
import json
from collections import deque

logger = logging.getLogger(__name__)


class TamperingDetectionEngine:
    """
    AI-powered tampering detection using anomaly detection algorithms
    Monitors device behavior patterns and predicts potential attacks
    """
    
    def __init__(self, contamination: float = 0.1):
        """
        Initialize the tampering detection engine
        
        Args:
            contamination: Expected proportion of outliers (default: 10%)
        """
        self.contamination = contamination
        self.model = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        
        # Store historical data for training
        self.device_history: Dict[str, deque] = {}
        self.max_history_size = 1000
        
        # Threat levels
        self.THREAT_LEVELS = {
            'SAFE': 0,
            'LOW': 1,
            'MEDIUM': 2,
            'HIGH': 3,
            'CRITICAL': 4
        }
        
        # Feature importance weights
        self.feature_weights = {
            'auth_frequency': 1.5,
            'data_submission_rate': 1.3,
            'failed_auth_count': 2.0,
            'time_between_submissions': 1.2,
            'data_value_variance': 1.1,
            'unusual_timing': 1.8,
        }
    
    def extract_features(self, device_id: str, device_data: Dict) -> np.ndarray:
        """
        Extract relevant features from device data for anomaly detection
        
        Features include:
        - Authentication frequency
        - Failed authentication attempts
        - Data submission patterns
        - Time-based patterns
        - Data value variance
        """
        features = []
        
        # Time-based features
        current_time = datetime.now()
        last_auth_time = device_data.get('last_authenticated', 0)
        registered_time = device_data.get('registered_at', 0)
        
        # Calculate time-based metrics
        hours_since_last_auth = (current_time.timestamp() - last_auth_time) / 3600
        days_since_registration = (current_time.timestamp() - registered_time) / 86400
        
        # Authentication pattern features
        auth_frequency = device_data.get('auth_count_24h', 0)
        failed_auth_count = device_data.get('failed_auth_count', 0)
        auth_success_rate = device_data.get('auth_success_rate', 1.0)
        
        # Data submission features
        submission_rate = device_data.get('submissions_per_hour', 0)
        data_variance = device_data.get('data_variance', 0)
        avg_submission_interval = device_data.get('avg_submission_interval', 3600)
        
        # Unusual timing detection (submissions at odd hours)
        current_hour = current_time.hour
        is_unusual_hour = 1 if (current_hour < 6 or current_hour > 22) else 0
        
        # Build feature vector
        features.extend([
            hours_since_last_auth,
            days_since_registration,
            auth_frequency,
            failed_auth_count,
            1.0 - auth_success_rate,  # Failure rate
            submission_rate,
            data_variance,
            avg_submission_interval,
            is_unusual_hour,
            device_data.get('total_data_submitted', 0)
        ])
        
        return np.array(features).reshape(1, -1)
    
    def train_model(self, historical_data: List[Dict]) -> bool:
        """
        Train the anomaly detection model on historical device data
        
        Args:
            historical_data: List of device activity records
            
        Returns:
            True if training successful
        """
        try:
            if len(historical_data) < 50:
                logger.warning("Insufficient data for training. Need at least 50 records.")
                return False
            
            # Extract features from all historical data
            features_list = []
            for record in historical_data:
                device_id = record.get('device_id', 'unknown')
                features = self.extract_features(device_id, record)
                features_list.append(features.flatten())
            
            X = np.array(features_list)
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.model.fit(X_scaled)
            self.is_trained = True
            
            logger.info(f"Model trained on {len(historical_data)} records")
            return True
            
        except Exception as e:
            logger.error(f"Error training model: {e}")
            return False
    
    def predict_tampering(self, device_id: str, device_data: Dict) -> Dict:
        """
        Predict potential tampering or anomalous behavior
        
        Args:
            device_id: Device identifier
            device_data: Current device metrics and activity data
            
        Returns:
            Dict with prediction results including:
            - is_anomaly: Boolean
            - anomaly_score: Float (-1 to 1, lower is more anomalous)
            - threat_level: String (SAFE, LOW, MEDIUM, HIGH, CRITICAL)
            - confidence: Float (0 to 1)
            - reasons: List of detected anomalies
        """
        try:
            # Extract features
            features = self.extract_features(device_id, device_data)
            
            if not self.is_trained:
                # Use rule-based detection if model not trained
                return self._rule_based_detection(device_id, device_data, features)
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Predict anomaly
            prediction = self.model.predict(features_scaled)[0]
            anomaly_score = self.model.score_samples(features_scaled)[0]
            
            is_anomaly = prediction == -1
            
            # Convert score to confidence (0 to 1)
            # Anomaly scores are typically between -0.5 and 0.5
            confidence = min(1.0, max(0.0, (0.5 - anomaly_score) * 2))
            
            # Determine threat level
            threat_level = self._calculate_threat_level(anomaly_score, device_data)
            
            # Identify specific anomalies
            reasons = self._identify_anomaly_reasons(device_id, device_data, features)
            
            result = {
                'device_id': device_id,
                'is_anomaly': is_anomaly,
                'anomaly_score': float(anomaly_score),
                'threat_level': threat_level,
                'confidence': float(confidence),
                'reasons': reasons,
                'timestamp': datetime.now().isoformat(),
                'prediction_method': 'ML' if self.is_trained else 'Rule-based'
            }
            
            # Store in history for continuous learning
            self._update_history(device_id, features.flatten())
            
            return result
            
        except Exception as e:
            logger.error(f"Error predicting tampering for {device_id}: {e}")
            return {
                'device_id': device_id,
                'is_anomaly': False,
                'error': str(e),
                'threat_level': 'UNKNOWN'
            }
    
    def _rule_based_detection(self, device_id: str, device_data: Dict, features: np.ndarray) -> Dict:
        """
        Fallback rule-based detection when ML model is not trained
        """
        reasons = []
        threat_score = 0
        
        # Check failed authentication attempts
        failed_auth = device_data.get('failed_auth_count', 0)
        if failed_auth > 5:
            reasons.append(f"High failed authentication attempts: {failed_auth}")
            threat_score += 3
        elif failed_auth > 2:
            reasons.append(f"Multiple failed authentication attempts: {failed_auth}")
            threat_score += 1
        
        # Check unusual authentication frequency
        auth_count = device_data.get('auth_count_24h', 0)
        if auth_count > 100:
            reasons.append(f"Unusually high authentication frequency: {auth_count}/24h")
            threat_score += 2
        
        # Check data submission rate
        submission_rate = device_data.get('submissions_per_hour', 0)
        if submission_rate > 60:
            reasons.append(f"Abnormal data submission rate: {submission_rate}/hour")
            threat_score += 2
        
        # Check for unusual timing
        current_hour = datetime.now().hour
        if (current_hour < 6 or current_hour > 22) and auth_count > 0:
            reasons.append("Activity during unusual hours (late night/early morning)")
            threat_score += 1
        
        # Check authentication success rate
        auth_success_rate = device_data.get('auth_success_rate', 1.0)
        if auth_success_rate < 0.5:
            reasons.append(f"Low authentication success rate: {auth_success_rate:.1%}")
            threat_score += 2
        
        # Determine threat level based on score
        if threat_score >= 7:
            threat_level = 'CRITICAL'
        elif threat_score >= 5:
            threat_level = 'HIGH'
        elif threat_score >= 3:
            threat_level = 'MEDIUM'
        elif threat_score >= 1:
            threat_level = 'LOW'
        else:
            threat_level = 'SAFE'
        
        is_anomaly = threat_score >= 3
        confidence = min(1.0, threat_score / 10.0)
        
        return {
            'device_id': device_id,
            'is_anomaly': is_anomaly,
            'anomaly_score': -threat_score / 10.0,  # Normalize to -1 to 0
            'threat_level': threat_level,
            'confidence': confidence,
            'reasons': reasons,
            'timestamp': datetime.now().isoformat(),
            'prediction_method': 'Rule-based'
        }
    
    def _calculate_threat_level(self, anomaly_score: float, device_data: Dict) -> str:
        """
        Calculate threat level based on anomaly score and additional factors
        """
        # Lower anomaly scores indicate more anomalous behavior
        if anomaly_score < -0.4:
            return 'CRITICAL'
        elif anomaly_score < -0.3:
            return 'HIGH'
        elif anomaly_score < -0.2:
            return 'MEDIUM'
        elif anomaly_score < -0.1:
            return 'LOW'
        else:
            return 'SAFE'
    
    def _identify_anomaly_reasons(self, device_id: str, device_data: Dict, features: np.ndarray) -> List[str]:
        """
        Identify specific reasons why behavior is considered anomalous
        """
        reasons = []
        
        # Analyze individual features
        failed_auth = device_data.get('failed_auth_count', 0)
        if failed_auth > 5:
            reasons.append(f"Excessive failed authentications: {failed_auth}")
        
        auth_rate = device_data.get('auth_count_24h', 0)
        if auth_rate > 50:
            reasons.append(f"Abnormal authentication frequency: {auth_rate}/day")
        
        submission_rate = device_data.get('submissions_per_hour', 0)
        if submission_rate > 30:
            reasons.append(f"High data submission rate: {submission_rate}/hour")
        
        variance = device_data.get('data_variance', 0)
        if variance > 1000:
            reasons.append(f"High data variance detected: {variance:.2f}")
        
        current_hour = datetime.now().hour
        if current_hour < 6 or current_hour > 22:
            reasons.append("Activity during unusual hours")
        
        if not reasons:
            reasons.append("General pattern deviation from normal behavior")
        
        return reasons
    
    def _update_history(self, device_id: str, features: np.ndarray):
        """
        Update historical data for continuous learning
        """
        if device_id not in self.device_history:
            self.device_history[device_id] = deque(maxlen=self.max_history_size)
        
        self.device_history[device_id].append(features)
    
    def get_device_risk_profile(self, device_id: str) -> Dict:
        """
        Get comprehensive risk profile for a device based on historical behavior
        """
        if device_id not in self.device_history:
            return {
                'device_id': device_id,
                'risk_score': 0,
                'risk_level': 'UNKNOWN',
                'historical_anomalies': 0,
                'message': 'Insufficient historical data'
            }
        
        history = list(self.device_history[device_id])
        anomaly_count = 0
        
        if self.is_trained and len(history) > 0:
            # Predict on historical data
            features_scaled = self.scaler.transform(history)
            predictions = self.model.predict(features_scaled)
            anomaly_count = np.sum(predictions == -1)
        
        anomaly_rate = anomaly_count / len(history) if len(history) > 0 else 0
        risk_score = int(anomaly_rate * 100)
        
        if risk_score > 50:
            risk_level = 'HIGH'
        elif risk_score > 30:
            risk_level = 'MEDIUM'
        elif risk_score > 10:
            risk_level = 'LOW'
        else:
            risk_level = 'SAFE'
        
        return {
            'device_id': device_id,
            'risk_score': risk_score,
            'risk_level': risk_level,
            'historical_anomalies': int(anomaly_count),
            'total_records': len(history),
            'anomaly_rate': f"{anomaly_rate:.1%}"
        }


# Global instance
tampering_detector = TamperingDetectionEngine()


# Helper functions for integration
def analyze_device_behavior(device_id: str, device_data: Dict) -> Dict:
    """
    Convenience function to analyze device behavior
    """
    return tampering_detector.predict_tampering(device_id, device_data)


def train_detection_model(historical_data: List[Dict]) -> bool:
    """
    Train the detection model with historical data
    """
    return tampering_detector.train_model(historical_data)


def get_risk_profile(device_id: str) -> Dict:
    """
    Get device risk profile
    """
    return tampering_detector.get_device_risk_profile(device_id)
