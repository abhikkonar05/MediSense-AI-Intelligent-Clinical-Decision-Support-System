import os
from typing import List

class Settings:
    PROJECT_NAME: str = "MediSense AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_clinical_decision_support_key_99182371")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # DB URL - fallback to SQLite if postgres is not provided
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./medisense.db"
    )
    
    # CORS Origins allowed
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",  # Vite Dev
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "*"
    ]

settings = Settings()
