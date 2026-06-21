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
    # CORS
    # NOTA: se lee como str (no List[str]) porque pydantic-settings intenta
    # parsear los campos List[...] como JSON desde la variable de entorno,
    # y un valor separado por comas como "http://a.com,http://b.com" no es
    # JSON válido. Por eso se convierte a lista en una @property.
    CORS_ORIGINS_RAW: str = os.getenv("CORS_ORIGINS", "*")

    @property
    def CORS_ORIGINS(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS_RAW.split(",") if origin.strip()]

    # Google reCAPTCHA
    RECAPTCHA_SECRET_KEY: str = os.getenv("RECAPTCHA_SECRET_KEY", "")
    # En desarrollo, si está vacía se omite la validación para facilitar pruebas
    RECAPTCHA_SKIP_VERIFICATION: bool = os.getenv("RECAPTCHA_SKIP_VERIFICATION", "false").lower() == "true"

    # SMTP (para envío de correos — cambio de contraseña, etc.)
    BREVO_API_KEY: str = os.getenv("BREVO_API_KEY", "")
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "")
    
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "")

    # Biometrics
    FACE_MATCH_THRESHOLD: float = float(os.getenv("FACE_MATCH_THRESHOLD", "0.55"))
    MAX_IMAGE_SIZE_MB: int = 2
    
    class Config:
        case_sensitive = True

settings = Settings()
