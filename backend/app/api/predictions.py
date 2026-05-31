import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models import Prediction, User
from app.api.auth import get_current_user
from app.services.ml_service import MLService

router = APIRouter()

# Input body validation schemas
class TabularPredictionInput(BaseModel):
    disease_type: str  # 'heart', 'diabetes', 'ckd', 'liver'
    input_data: Dict[str, Any]

@router.post("/predict-tabular")
def predict_tabular(
    data: TabularPredictionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    disease = data.disease_type.lower()
    if disease not in ["heart", "diabetes", "ckd", "liver"]:
        raise HTTPException(status_code=400, detail="Invalid tabular prediction type")

    # Perform inference & calculate SHAP
    inference_result = MLService.predict_tabular(disease, data.input_data)

    # Save to Database
    prediction_record = Prediction(
        patient_id=current_user.id,
        prediction_type=inference_result["prediction_type"],
        input_data=inference_result["inputs"],
        result_data={
            "probability": inference_result["probability"],
            "confidence": inference_result["confidence"]
        },
        shap_values=inference_result["shap_values"],
        risk_score=inference_result["risk_score"],
        risk_level=inference_result["risk_level"]
    )
    db.add(prediction_record)
    db.commit()
    db.refresh(prediction_record)

    return {
        "id": prediction_record.id,
        "prediction_type": prediction_record.prediction_type,
        "input_data": prediction_record.input_data,
        "result_data": prediction_record.result_data,
        "shap_values": prediction_record.shap_values,
        "risk_score": prediction_record.risk_score,
        "risk_level": prediction_record.risk_level,
        "created_at": prediction_record.created_at
    }

@router.post("/predict-image")
async def predict_image(
    image_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    type_lower = image_type.lower()
    if type_lower not in ["pneumonia", "brain_tumor"]:
        raise HTTPException(status_code=400, detail="Invalid image prediction type")
        
    image_bytes = await file.read()
    
    # Perform CNN inference & Grad-CAM simulation
    inference_result = MLService.predict_image(type_lower, image_bytes)
    
    # Save record to Database
    prediction_record = Prediction(
        patient_id=current_user.id,
        prediction_type=inference_result["prediction_type"],
        input_data={"filename": file.filename},
        result_data={
            "probability": inference_result["probability"],
            "label": inference_result["label"],
            "confidence": inference_result["confidence"],
            "grad_cam": inference_result["grad_cam"]
        },
        shap_values=None,
        risk_score=inference_result["risk_score"],
        risk_level=inference_result["risk_level"]
    )
    db.add(prediction_record)
    db.commit()
    db.refresh(prediction_record)
    
    return {
        "id": prediction_record.id,
        "prediction_type": prediction_record.prediction_type,
        "input_data": prediction_record.input_data,
        "result_data": prediction_record.result_data,
        "risk_score": prediction_record.risk_score,
        "risk_level": prediction_record.risk_level,
        "created_at": prediction_record.created_at
    }

@router.get("/history")
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # If admin or doctor, show all predictions. Else, show user's own
    if current_user.role in ["ADMIN", "DOCTOR"]:
        records = db.query(Prediction).order_by(Prediction.created_at.desc()).all()
    else:
        records = db.query(Prediction).filter(Prediction.patient_id == current_user.id).order_by(Prediction.created_at.desc()).all()
        
    return records

@router.get("/analytics")
def get_prediction_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns prediction risk aggregations, counts, and trend graphs over time.
    """
    if current_user.role in ["ADMIN", "DOCTOR"]:
        records = db.query(Prediction).all()
    else:
        records = db.query(Prediction).filter(Prediction.patient_id == current_user.id).all()
        
    # Aggregate trends by date and type
    trends = {}
    risk_distribution = {"LOW": 0, "MODERATE": 0, "HIGH": 0}
    type_counts = {}
    
    for r in records:
        # Date string formatting
        date_str = r.created_at.strftime("%Y-%m-%d")
        trends.setdefault(date_str, []).append(r.risk_score)
        
        # Risk distribution
        risk_distribution[r.risk_level] = risk_distribution.get(r.risk_level, 0) + 1
        
        # Type count
        type_counts[r.prediction_type] = type_counts.get(r.prediction_type, 0) + 1
        
    # Format trend timeline
    timeline = []
    for d, scores in sorted(trends.items()):
        timeline.append({
            "date": d,
            "avg_risk": int(sum(scores) / len(scores)),
            "count": len(scores)
        })
        
    return {
        "total_predictions": len(records),
        "risk_distribution": risk_distribution,
        "prediction_types": type_counts,
        "timeline": timeline
    }
