from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models import ChatMessage, User
from app.api.auth import get_current_user

router = APIRouter()

class MessageInput(BaseModel):
    message: str
    receiver_id: Optional[str] = None  # None for AI Assistant

@router.post("/send")
def send_message(
    data: MessageInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Store user message
    user_msg = ChatMessage(
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        message=data.message,
        is_voice=False
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # If receiver_id is None, it is a chat with the AI assistant. Let's auto-respond!
    ai_response_msg = None
    if not data.receiver_id:
        text = data.message.lower()
        response = "I am here to assist. Could you describe your symptoms or what diagnostics you are looking to review?"
        
        # Symptom extraction rules
        if any(w in text for w in ["chest pain", "heart rate", "shortness of breath"]):
            response = "⚠️ ALERT: You mentioned potential cardiac symptoms. Please seek urgent professional care if the pain is severe. I recommend scheduling an immediate Heart Disease Risk Diagnostic under our prediction module."
        elif any(w in text for w in ["thirsty", "urination", "fatigue", "diabetic"]):
            response = "Understood. Increased thirst and fatigue can be signs of glucose fluctuations. I advise utilizing our Diabetes Predictor or consulting a metabolic specialist."
        elif any(w in text for w in ["cough", "fever", "chest x-ray"]):
            response = "A cough accompanied by a fever might indicate a respiratory infection. Please consider taking a Chest X-ray and uploading it to our Pneumonia analysis tool."
        elif any(w in text for w in ["headache", "blurry vision", "dizziness"]):
            response = "Chronic headaches or vision issues should be clinically evaluated. You can consult one of our recommended neurologists or try our Brain MRI Tumor detector."

        # Save AI assistant message
        ai_msg = ChatMessage(
            sender_id=current_user.id, # Link it to user session
            receiver_id=None,
            message=f"[MediSense AI] {response}",
            is_voice=False
        )
        db.add(ai_msg)
        db.commit()
        db.refresh(ai_msg)
        ai_response_msg = {
            "id": ai_msg.id,
            "sender_id": "ai",
            "message": ai_msg.message,
            "created_at": ai_msg.created_at
        }

    return {
        "user_message": {
            "id": user_msg.id,
            "sender_id": current_user.id,
            "message": user_msg.message,
            "created_at": user_msg.created_at
        },
        "ai_response": ai_response_msg
    }

@router.post("/voice-whisper")
async def voice_whisper(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Simulates Whisper speech-to-text processing for microphone audio files.
    """
    # Simple transcript simulation based on filename length
    transcript = "I have been experiencing mild chest tightness and occasional fatigue during exercise."
    if len(file.filename) % 2 == 0:
        transcript = "Can you help me evaluate my recent blood glucose levels? I feel dry mouth."
        
    return {
        "transcript": transcript,
        "confidence": 0.98
    }

@router.get("/history")
def get_chat_history(
    receiver_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves message history between user and another user (doctor/patient) or AI assistant.
    """
    if not receiver_id:
        # Chat history with AI assistant
        messages = db.query(ChatMessage).filter(
            ChatMessage.sender_id == current_user.id,
            ChatMessage.receiver_id == None
        ).order_by(ChatMessage.created_at.asc()).all()
    else:
        # Chat history between patient and doctor
        messages = db.query(ChatMessage).filter(
            ((ChatMessage.sender_id == current_user.id) & (ChatMessage.receiver_id == receiver_id)) |
            ((ChatMessage.sender_id == receiver_id) & (ChatMessage.receiver_id == current_user.id))
        ).order_by(ChatMessage.created_at.asc()).all()
        
    # Standardize output model
    formatted = []
    for m in messages:
        sender_label = "user" if m.sender_id == current_user.id else "doctor"
        if not m.receiver_id and "[MediSense AI]" in m.message:
            sender_label = "ai"
            
        formatted.append({
            "id": m.id,
            "sender_id": m.sender_id,
            "sender_label": sender_label,
            "message": m.message,
            "is_voice": m.is_voice,
            "created_at": m.created_at
        })
        
    return formatted
