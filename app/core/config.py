import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

from typing import List

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "UPEA Vota API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours

    # CORS
    # Convert string like "http://localhost:5173,https://site.com" to list
    _cors_origins: str = os.getenv("CORS_ORIGINS", "*")
    CORS_ORIGINS: List[str] = _cors_origins.split(",")

    # Biometrics
    FACE_MATCH_THRESHOLD: float = float(os.getenv("FACE_MATCH_THRESHOLD", "0.55"))
    MAX_IMAGE_SIZE_MB: int = 2
    
    class Config:
        case_sensitive = True

settings = Settings()
