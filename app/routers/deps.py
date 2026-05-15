from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError

from app.core.config import settings
from app.db.supabase import supabase_admin
from app.models.schemas import UserResponse

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No se pudo validar el token",
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token ha expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Credenciales de autenticación inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_query = supabase_admin.table("profiles").select("*").eq("id", user_id).single().execute()
    if not user_query.data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return UserResponse(**user_query.data)
