from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from app.db.session import get_db
from app.db.models import DoctorProfile, User, Appointment
from app.api.auth import get_current_user

router = APIRouter()

class AppointmentCreate(BaseModel):
    doctor_id: str
    appointment_time: datetime
    reason: str

@router.get("/list")
def get_doctors(db: Session = Depends(get_db)):
    doctors = db.query(User).filter(User.role == "DOCTOR").all()
    
    formatted = []
    for doc in doctors:
        spec = "General Medicine"
        exp = 5
        hospital = "MediSense General Hospital"
        fee = 100
        rating = 4.8
        
        if doc.doctor_profile:
            spec = doc.doctor_profile.specialization
            exp = doc.doctor_profile.experience_years
            hospital = doc.doctor_profile.hospital_name or hospital
            fee = float(doc.doctor_profile.consultation_fee or fee)
            rating = float(doc.doctor_profile.rating or rating)
            
        formatted.append({
            "id": doc.id,
            "full_name": doc.full_name,
            "email": doc.email,
            "specialization": spec,
            "experience_years": exp,
            "hospital_name": hospital,
            "consultation_fee": fee,
            "rating": rating
        })
    return formatted

@router.get("/recommend")
def recommend_specialist(symptoms: str, db: Session = Depends(get_db)):
    """
    Symptom-to-specialist doctor matching rules.
    """
    text = symptoms.lower()
    specialization = "General Practitioner"
    
    if any(w in text for w in ["chest", "heart", "breath", "pressure"]):
        specialization = "Cardiologist"
    elif any(w in text for w in ["glucose", "diabetes", "sugar", "insulin"]):
        specialization = "Endocrinologist"
    elif any(w in text for w in ["kidney", "urine", "creatinine", "renal"]):
        specialization = "Nephrologist"
    elif any(w in text for w in ["liver", "bilirubin", "yellow", "abdominal"]):
        specialization = "Hepatologist"
    elif any(w in text for w in ["head", "brain", "dizzy", "vision"]):
        specialization = "Neurologist"

    # Find matching doctors
    doctors = db.query(User).join(DoctorProfile).filter(
        DoctorProfile.specialization.ilike(f"%{specialization}%")
    ).all()
    
    # Fallback to general practitioners if no specific specialist matches
    if not doctors:
        doctors = db.query(User).filter(User.role == "DOCTOR").limit(2).all()
        
    formatted = []
    for doc in doctors:
        formatted.append({
            "id": doc.id,
            "full_name": doc.full_name,
            "specialization": doc.doctor_profile.specialization if doc.doctor_profile else specialization,
            "hospital_name": doc.doctor_profile.hospital_name if doc.doctor_profile else "MediSense Clinical Clinic",
            "consultation_fee": float(doc.doctor_profile.consultation_fee or 100),
            "rating": float(doc.doctor_profile.rating or 4.9)
        })
        
    return {
        "matched_specialization": specialization,
        "recommendations": formatted
    }

@router.post("/book", status_code=201)
def book_appointment(
    data: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify doctor exists
    doctor = db.query(User).filter(User.id == data.doctor_id, User.role == "DOCTOR").first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    appointment = Appointment(
        patient_id=current_user.id,
        doctor_id=data.doctor_id,
        appointment_time=data.appointment_time,
        status="CONFIRMED", # Instant auto-booking for smoother UX demo
        reason=data.reason
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    return {
        "id": appointment.id,
        "doctor_name": doctor.full_name,
        "appointment_time": appointment.appointment_time,
        "status": appointment.status,
        "reason": appointment.reason
    }

@router.get("/appointments")
def get_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "DOCTOR":
        appointments = db.query(Appointment).filter(Appointment.doctor_id == current_user.id).all()
    else:
        appointments = db.query(Appointment).filter(Appointment.patient_id == current_user.id).all()
        
    formatted = []
    for appt in appointments:
        pat = db.query(User).filter(User.id == appt.patient_id).first()
        doc = db.query(User).filter(User.id == appt.doctor_id).first()
        
        formatted.append({
            "id": appt.id,
            "patient_name": pat.full_name if pat else "Unknown Patient",
            "doctor_name": doc.full_name if doc else "Unknown Doctor",
            "appointment_time": appt.appointment_time,
            "status": appt.status,
            "reason": appt.reason
        })
    return formatted
