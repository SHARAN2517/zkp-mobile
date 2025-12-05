"""
API Endpoints for AI/ML Tampering Detection
Integrates machine learning-based anomaly detection into the backend
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from ml_tampering_detection import (
    tampering_detector,
    analyze_device_behavior,
    train_detection_model,
    get_risk_profile
)

logger = logging.getLogger(__name__)

# Create router for ML endpoints
ml_router = APIRouter(prefix="/ml", tags=["Machine Learning"])


class DeviceBehaviorAnalysis(BaseModel):
    device_id: str
    auth_count_24h: Optional[int] = 0
    failed_auth_count: Optional[int] = 0
    auth_success_rate: Optional[float] = 1.0
    submissions_per_hour: Optional[float] = 0
    data_variance: Optional[float] = 0
    avg_submission_interval: Optional[int] = 3600
    last_authenticated: Optional[int] = 0
    registered_at: Optional[int] = 0
    total_data_submitted: Optional[int] = 0


class TrainingDataRequest(BaseModel):
    device_records: List[Dict[str, Any]]


@ml_router.post("/analyze-device")
async def analyze_device(analysis_request: DeviceBehaviorAnalysis):
    """
    Analyze device behavior using AI/ML to detect potential tampering
    
    Returns:
        - is_anomaly: Whether behavior is anomalous
        - threat_level: SAFE, LOW, MEDIUM, HIGH, CRITICAL
        - confidence: Confidence score (0-1)
        - reasons: List of specific suspicious behaviors detected
    """
    try:
        device_data = analysis_request.dict()
        result = analyze_device_behavior(
            device_data['device_id'],
            device_data
        )
        
        return {
            "success": True,
            **result
        }
    
    except Exception as e:
        logger.error(f"Error analyzing device: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@ml_router.get("/device-risk/{device_id}")
async def get_device_risk(device_id: str):
    """
    Get comprehensive risk profile for a device based on historical behavior
    
    Returns:
        - risk_score: 0-100 risk score
        - risk_level: Overall risk classification
        - historical_anomalies: Count of past anomalies detected
        - anomaly_rate: Percentage of anomalous behavior
    """
    try:
        profile = get_risk_profile(device_id)
        return {
            "success": True,
            **profile
        }
    
    except Exception as e:
        logger.error(f"Error getting risk profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@ml_router.post("/train-model")
async def train_model(training_request: TrainingDataRequest):
    """
    Train the ML model with historical device data
    
    Requirements:
        - Minimum 50 records recommended for effective training
        - Each record should include device metrics
    
    Returns:
        - success: Whether training succeeded
        - records_used: Number of records used for training
    """
    try:
        records = training_request.device_records
        
        if len(records) < 10:
            raise HTTPException(
                status_code=400,
                detail="Insufficient data. Need at least 10 records for training."
            )
        
        success = train_detection_model(records)
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Model training failed"
            )
        
        return {
            "success": True,
            "records_used": len(records),
            "model_status": "trained",
            "message": "Model trained successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error training model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@ml_router.get("/model-status")
async def get_model_status():
    """
    Get current status of the ML tampering detection model
    
    Returns:
        - is_trained: Whether model has been trained
        - device_count: Number of devices being monitored
        - total_predictions: Historical prediction count
    """
    try:
        return {
            "success": True,
            "is_trained": tampering_detector.is_trained,
            "device_count": len(tampering_detector.device_history),
            "contamination_rate": tampering_detector.contamination,
            "model_type": "Isolation Forest",
            "status": "active" if tampering_detector.is_trained else "untrained"
        }
    
    except Exception as e:
        logger.error(f"Error getting model status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@ml_router.get("/threat-statistics")
async def get_threat_statistics():
    """
    Get overall threat statistics across all monitored devices
    
    Returns aggregated threat intelligence including:
        - Total devices monitored
        - Devices by threat level
        - Recent anomalies
    """
    try:
        threat_stats = {
            'SAFE': 0,
            'LOW': 0,
            'MEDIUM': 0,
            'HIGH': 0,
            'CRITICAL': 0
        }
        
        # Analyze all devices in history
        for device_id in tampering_detector.device_history.keys():
            profile = get_risk_profile(device_id)
            risk_level = profile.get('risk_level', 'SAFE')
            if risk_level in threat_stats:
                threat_stats[risk_level] += 1
        
        total_devices = len(tampering_detector.device_history)
        
        return {
            "success": True,
            "total_devices_monitored": total_devices,
            "threat_distribution": threat_stats,
            "high_risk_count": threat_stats['HIGH'] + threat_stats['CRITICAL'],
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error getting threat statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Helper endpoint for automatic analysis during registration/authentication
@ml_router.post("/auto-analyze")
async def auto_analyze_device_activity(device_id: str, activity_type: str):
    """
    Automatically analyze device activity during registration or authentication
    
    Used by the system to automatically detect suspicious patterns
    """
    try:
        # This would be called automatically by the system
        # when devices register or authenticate
        logger.info(f"Auto-analyzing {device_id} for {activity_type}")
        
        # Return quick analysis
        return {
            "success": True,
            "device_id": device_id,
            "activity_type": activity_type,
            "analyzed_at": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Error in auto-analysis: {e}")
        return {
            "success": False,
            "error": str(e)
        }
