from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class Role(str, Enum):
    ADMIN = "admin"
    STUDENT = "student"

class ElectionStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    CLOSED = "closed"

class ElectionType(str, Enum):
    RECTORADO = "rectorado"
    CONSEJO = "consejo"
    CARRERA = "carrera"

# --- User / Profile ---

class UserBase(BaseModel):
    name: str
    last_name: str
    reg_univ: str
    id_card: str
    email: EmailStr
    role: Role = Role.STUDENT
    career: Optional[str] = None

class UserCreate(UserBase):
    password: str
    photo_base64: Optional[str] = None # For registration

class UserUpdate(BaseModel):
    name: Optional[str] = None
    last_name: Optional[str] = None
    career: Optional[str] = None
    photo_url: Optional[str] = None

class UserResponse(UserBase):
    id: str
    photo_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Election ---

class ElectionBase(BaseModel):
    title: str
    description: Optional[str] = ""
    start_date: datetime
    end_date: datetime
    status: ElectionStatus = ElectionStatus.INACTIVE
    type: ElectionType

class ElectionCreate(ElectionBase):
    pass

class ElectionResponse(ElectionBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Category ---

class CategoryBase(BaseModel):
    name: str
    election_id: str

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Candidate ---

class CandidateBase(BaseModel):
    name: str
    description: str
    category_id: str
    career: Optional[str] = None
    video_url: Optional[str] = None
    photo_url: Optional[str] = None

class CandidateCreate(CandidateBase):
    photo_base64: Optional[str] = None

class CandidateResponse(CandidateBase):
    id: str
    photo_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Vote ---

class VoteCreate(BaseModel):
    election_id: str
    category_id: str
    candidate_id: str
    face_capture_base64: str # For verification during voting

class VoteResponse(BaseModel):
    id: str
    user_id: str
    election_id: str
    category_id: str
    candidate_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Auth ---

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    reg_univ: str
    id_card: str
    recaptcha_token: str | None = None  # Token de reCAPTCHA v2 enviado desde el frontend

# --- Profile ---

class UpdateProfileRequest(BaseModel):
    """Datos editables del perfil (el estudiante solo puede cambiar nombre, apellido y carrera)."""
    name: Optional[str] = None
    last_name: Optional[str] = None
    career: Optional[str] = None

class PhotoUploadRequest(BaseModel):
    """Foto de perfil en base64."""
    photo_base64: str

# --- Password Reset ---

class PasswordResetRequest(BaseModel):
    """Solicitud de código de verificación para cambio de contraseña."""
    email: EmailStr

class VerifyResetCodeRequest(BaseModel):
    """Verificación del código enviado al correo."""
    email: EmailStr
    code: str

class ResetPasswordRequest(BaseModel):
    """Cambio de contraseña con código verificado."""
    email: EmailStr
    code: str
    new_password: str = Field(..., min_length=6, description="Nueva contraseña (mínimo 6 caracteres)")

class ChangePasswordRequest(BaseModel):
    """Cambio de contraseña desde sesión activa (usuario autenticado)."""
    current_password: str = Field(..., min_length=1, description="Contraseña actual")
    new_password: str = Field(..., min_length=6, description="Nueva contraseña (mínimo 6 caracteres)")

# --- Vote History ---

class VoteHistoryItem(BaseModel):
    """Detalle de un voto individual para el historial del votante."""
    id: str
    election_title: str
    election_type: str
    category_name: str
    candidate_name: str
    created_at: datetime

class CarnetData(BaseModel):
    """Datos necesarios para generar el carnet de sufragio del usuario."""
    name: str
    last_name: str
    id_card: str
    reg_univ: str
    email: str
    carrera: Optional[str] = None
    mesa: str
    gestion: str
    fecha_emision: str
    codigo_verificacion: str
    photo_url: Optional[str] = None

class CarnetVerificationResponse(BaseModel):
    """Respuesta de verificación pública de un carnet de sufragio."""
    valido: bool
    nombre: Optional[str] = None
    ru: Optional[str] = None
    mesa: Optional[str] = None
    gestion: Optional[str] = None
    mensaje: str

# --- Audit ---

class AuditLogEntry(BaseModel):
    """Registro de auditoría."""
    usuario: str
    rol: str
    accion: str
    detalle: Optional[str] = None
    ip: Optional[str] = None
    resultado: str  # "exito" | "error"

class AuditLogResponse(BaseModel):
    """Respuesta con un registro de auditoría."""
    id: str
    usuario: str
    rol: str
    accion: str
    detalle: Optional[str] = None
    ip: Optional[str] = None
    resultado: str
    created_at: datetime

class AuditLogListResponse(BaseModel):
    """Lista paginada de registros de auditoría."""
    total: int
    page: int
    per_page: int
    data: List[AuditLogResponse]
