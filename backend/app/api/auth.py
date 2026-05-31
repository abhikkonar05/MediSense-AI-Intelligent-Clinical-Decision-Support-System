from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from jose import jwt, JWTError

from app.db.session import get_db
from app.db.models import User, PatientProfile, DoctorProfile
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# Pydantic Schemas for inputs
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "PATIENT"  # "PATIENT", "DOCTOR", "ADMIN"
    phone: Optional[str] = None
    # For doctors
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    hospital_name: Optional[str] = None
    experience_years: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", status_code=201)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Standard role validation
    role = user_in.role.upper()
    if role not in ["PATIENT", "DOCTOR", "ADMIN"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    # Hash password & create user
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        password_hash=hashed_pwd,
        full_name=user_in.full_name,
        role=role,
        phone=user_in.phone,
        otp_code="123456",  # Predefined mock OTP code for registration
        otp_expires_at=datetime.now(timezone.utc) + timedelta(minutes=15),
        is_verified=False
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize profiles
    if role == "PATIENT":
        profile = PatientProfile(user_id=user.id)
        db.add(profile)
    elif role == "DOCTOR":
        if not user_in.license_number or not user_in.specialization:
            db.delete(user)
            db.commit()
            raise HTTPException(status_code=400, detail="License and specialization are required for doctors")
        profile = DoctorProfile(
            user_id=user.id,
            specialization=user_in.specialization,
            license_number=user_in.license_number,
            hospital_name=user_in.hospital_name,
            experience_years=user_in.experience_years
        )
        db.add(profile)
        
    db.commit()
    
    return {
        "message": "Registration successful. Please verify using the OTP sent.",
        "email": user.email,
        "role": user.role
    }

@router.post("/verify-otp")
def verify_otp(verify_in: VerifyOTP, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == verify_in.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.otp_code != verify_in.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code")
        
    user.is_verified = True
    user.otp_code = None
    db.commit()
    
    return {"message": "OTP verified successfully. Your account is now active!"}

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    # Check if verified
    if not user.is_verified:
        # Re-generate OTP code
        user.otp_code = "123456"
        db.commit()
        raise HTTPException(
            status_code=403, 
            detail="Account not verified. Please verify using the OTP."
        )
        
    access_token = create_access_token(subject=user.email)
    
    # Pack profile data
    profile_data = {}
    if user.role == "PATIENT" and user.patient_profile:
        profile_data = {
            "dob": str(user.patient_profile.date_of_birth) if user.patient_profile.date_of_birth else None,
            "gender": user.patient_profile.gender,
            "blood_group": user.patient_profile.blood_group,
            "height": float(user.patient_profile.height) if user.patient_profile.height else None,
            "weight": float(user.patient_profile.weight) if user.patient_profile.weight else None,
            "avatar": user.patient_profile.avatar_url
        }
    elif user.role == "DOCTOR" and user.doctor_profile:
        profile_data = {
            "specialization": user.doctor_profile.specialization,
            "license": user.doctor_profile.license_number,
            "hospital": user.doctor_profile.hospital_name,
            "experience": user.doctor_profile.experience_years,
            "rating": float(user.doctor_profile.rating)
        }

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "profile": profile_data
        }
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "phone": current_user.phone
    }
