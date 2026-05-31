import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Numeric, Text, JSON, Date, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.session import Base

# Define Enums for SQLAlchemy
class UserRole(str, enum.Enum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    ADMIN = "ADMIN"

class AppointmentStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"

# Helper for UUID / String standard type
# We make it work seamlessly on both PostgreSQL (UUID type) and SQLite (String type)
def get_uuid_type():
    return String(36)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), default="PATIENT")  # Store as string for SQLite compatibility
    phone = Column(String(20), nullable=True)
    otp_code = Column(String(6), nullable=True)
    otp_expires_at = Column(DateTime(timezone=True), nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(10), nullable=True)
    blood_group = Column(String(5), nullable=True)
    height = Column(Numeric(5, 2), nullable=True)
    weight = Column(Numeric(5, 2), nullable=True)
    avatar_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="patient_profile")

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    specialization = Column(String(100), nullable=False)
    license_number = Column(String(100), unique=True, nullable=False)
    hospital_name = Column(String(255), nullable=True)
    experience_years = Column(Integer, nullable=True)
    availability_status = Column(Boolean, default=True)
    consultation_fee = Column(Numeric(10, 2), nullable=True)
    rating = Column(Numeric(3, 2), default=5.00)

    user = relationship("User", back_populates="doctor_profile")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    prediction_type = Column(String(50), nullable=False)  # 'HEART', 'DIABETES', 'CKD', 'LIVER', 'PNEUMONIA', 'BRAIN_TUMOR'
    input_data = Column(JSON, nullable=False)
    result_data = Column(JSON, nullable=False)
    shap_values = Column(JSON, nullable=True)
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(String(20), nullable=False)  # 'LOW', 'MODERATE', 'HIGH'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class WearableData(Base):
    __tablename__ = "wearable_data"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    heart_rate = Column(Integer, nullable=True)
    steps = Column(Integer, nullable=True)
    calories_burned = Column(Integer, nullable=True)
    sleep_duration_minutes = Column(Integer, nullable=True)
    blood_oxygen_level = Column(Numeric(5, 2), nullable=True)

class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_url = Column(Text, nullable=False)
    raw_ocr_text = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    detected_anomalies = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    appointment_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(20), default="PENDING")  # 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'
    reason = Column(Text, nullable=True)
    notes_by_doctor = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(String(36), ForeignKey("users.id"), nullable=True)  # Null represents AI chatbot
    message = Column(Text, nullable=False)
    is_voice = Column(Boolean, default=False)
    voice_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
