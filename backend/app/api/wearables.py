from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models import WearableData, User, Prediction
from app.api.auth import get_current_user
from app.services.ml_service import MLService

router = APIRouter()

class WearableSync(BaseModel):
    heart_rate: Optional[int] = 72
    steps: Optional[int] = 5000
    calories_burned: Optional[int] = 2000
    sleep_duration_minutes: Optional[int] = 480
    blood_oxygen_level: Optional[float] = 98.5

@router.post("/sync")
def sync_wearable(
    data: WearableSync,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    wearable = WearableData(
        patient_id=current_user.id,
        heart_rate=data.heart_rate,
        steps=data.steps,
        calories_burned=data.calories_burned,
        sleep_duration_minutes=data.sleep_duration_minutes,
        blood_oxygen_level=data.blood_oxygen_level
    )
    db.add(wearable)
    db.commit()
    db.refresh(wearable)
    
    # Calculate health score dynamically
    recent_predictions = db.query(Prediction).filter(
        Prediction.patient_id == current_user.id
    ).order_by(Prediction.created_at.desc()).limit(5).all()
    
    predictions_payload = [
        {"risk_score": p.risk_score} for p in recent_predictions
    ]
    
    health_score = MLService.calculate_health_score(
        predictions_list=predictions_payload,
        wearables=data.model_dump()
    )
    
    return {
        "message": "Telemetry synced successfully!",
        "health_score": health_score,
        "wearable": {
            "heart_rate": wearable.heart_rate,
            "steps": wearable.steps,
            "calories_burned": wearable.calories_burned,
            "sleep_duration_minutes": wearable.sleep_duration_minutes,
            "blood_oxygen_level": float(wearable.blood_oxygen_level or 0)
        }
    }

@router.get("/metrics")
def get_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns wearable telemetry log history for charting.
    """
    metrics = db.query(WearableData).filter(
        WearableData.patient_id == current_user.id
    ).order_by(WearableData.timestamp.desc()).limit(20).all()
    
    # Reverse to make chronological for Recharts
    metrics.reverse()
    
    # Generate default data if none exists yet for dashboard rendering
    if not metrics:
        import datetime
        mocked = []
        for i in range(7):
            day = datetime.datetime.now() - datetime.timedelta(days=6-i)
            mocked.append({
                "date": day.strftime("%a"),
                "heart_rate": 70 + (i % 3) * 5,
                "steps": 4000 + i * 1200,
                "calories_burned": 1800 + i * 200,
                "sleep_duration_hours": round((400 + (i % 2) * 80) / 60, 1),
                "blood_oxygen_level": 98.0 + (i % 2) * 0.8
            })
        return mocked
        
    formatted = []
    for m in metrics:
        formatted.append({
            "date": m.timestamp.strftime("%a %H:%M"),
            "heart_rate": m.heart_rate,
            "steps": m.steps,
            "calories_burned": m.calories_burned,
            "sleep_duration_hours": round((m.sleep_duration_minutes or 480) / 60, 1),
            "blood_oxygen_level": float(m.blood_oxygen_level or 98.5)
        })
        
    return formatted
