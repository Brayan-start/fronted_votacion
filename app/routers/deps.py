from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
import logging

from app.core.config import settings
from app.db.supabase import supabase_admin
from app.models.schemas import UserResponse

logger = logging.getLogger(__name__)

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
    
    # Verificar session_token del JWT contra la base de datos
    token_session = payload.get("session_token")
    db_session = user_query.data.get("session_token")

    if db_session and token_session:
        # Comparar como strings para evitar problemas de tipo UUID
        if str(token_session) != str(db_session):
            logger.warning(f"session_token inválido para usuario {user_id}: token={token_session}, db={db_session}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="La sesión ha sido cerrada en otro dispositivo. Inicia sesión de nuevo.",
                headers={"WWW-Authenticate": "Bearer"},
            )
    elif db_session and not token_session:
        # Token antiguo sin session_token — permitir por compatibilidad (login previo a migración)
        logger.info(f"JWT sin session_token para {user_id}, permitiendo por compatibilidad")
    
    return UserResponse(**user_query.data)
