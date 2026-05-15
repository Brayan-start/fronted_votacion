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
