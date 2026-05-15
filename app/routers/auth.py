from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import UserCreate, UserResponse, Token, LoginRequest
from app.db.supabase import supabase, supabase_admin
from app.core.security import create_access_token, get_password_hash, verify_password
from app.utils.storage import upload_base64_image
from app.utils.image import process_base64_image
from app.services.biometric import biometric_service
import base64
import uuid
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate):
    # 1. Verificar si ya existe en perfiles (RU o CI)
    # IMPORTANTE: Usar supabase_admin para bypass de RLS durante validación previa al login
    existing_user = supabase_admin.table("profiles").select("*").or_(f"reg_univ.eq.{user_in.reg_univ},id_card.eq.{user_in.id_card}").execute()
    if existing_user.data:
        raise HTTPException(status_code=400, detail="El RU o CI ya están registrados")

    # 2. Crear usuario en Auth de Supabase usando Admin API
    # Esto evita la necesidad de confirmación por email y asegura la creación del perfil vía trigger
    try:
        auth_response = supabase_admin.auth.admin.create_user({
            "email": user_in.email,
            "password": user_in.password,
            "user_metadata": {
                "name": user_in.name,
                "last_name": user_in.last_name,
                "reg_univ": user_in.reg_univ,
                "id_card": user_in.id_card,
                "role": user_in.role.value,
                "career": user_in.career
            },
            "email_confirm": True
        })
    except Exception as e:
        logger.error(f"Error en create_user (Admin): {e}")
        # Si falla, intentar detectar si es por password corto
        error_msg = str(e)
        if "password" in error_msg.lower():
            error_msg = "La contraseña (CI) debe tener al menos 6 caracteres"
        raise HTTPException(status_code=400, detail=f"Error en Registro: {error_msg}")
    
    if not auth_response:
        raise HTTPException(status_code=400, detail="Error al crear usuario en Auth")

    # En supabase-py 2.x, admin.create_user retorna un objeto que contiene el usuario
    # Puede ser el objeto User directo o un UserResponse con .user
    user_id = getattr(auth_response, 'id', None)
    if not user_id and hasattr(auth_response, 'user'):
        user_id = auth_response.user.id
        
    if not user_id:
        logger.error(f"No se pudo obtener el ID del usuario. Respuesta: {auth_response}")
        raise HTTPException(status_code=500, detail="Error interno al procesar el registro")
    
    # 3. Procesar foto y guardarla en Storage
    photo_url = None
    if user_in.photo_base64:
        photo_path = f"estudiantes/{user_id}.jpg"
        photo_url = upload_base64_image(user_in.photo_base64, "photos-estudiantes", photo_path)
        
        # Actualizar perfil con la URL de la foto
        if photo_url:
            supabase_admin.table("profiles").update({"photo_url": photo_url}).eq("id", user_id).execute()

        # 4. Generar y guardar embedding facial
        try:
            image_bytes = process_base64_image(user_in.photo_base64)
            embedding = biometric_service.get_embedding(image_bytes)
            if embedding:
                supabase_admin.table("face_embeddings").upsert({
                    "user_id": user_id,
                    "embedding": embedding
                }).execute()
        except Exception as e:
            logger.error(f"Falla al generar embedding: {e}")

    # 5. Recuperar perfil final
    profile_response = supabase_admin.table("profiles").select("*").eq("id", user_id).single().execute()
    
    if not profile_response.data:
        raise HTTPException(status_code=500, detail="Error al recuperar el perfil creado")

    return profile_response.data

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest):
    logger.info(f"Intento de login para RU: {login_data.reg_univ}")
    
    # 1. Buscar el email asociado al RU
    # Usamos supabase_admin porque RLS podría bloquear la lectura si no estamos logueados
    user_query = supabase_admin.table("profiles").select("email, id").eq("reg_univ", login_data.reg_univ).execute()
    
    if not user_query.data:
        logger.warning(f"RU no encontrado: {login_data.reg_univ}")
        raise HTTPException(status_code=401, detail="Usuario no encontrado o RU incorrecto")
    
    user_email = user_query.data[0]["email"]
    user_id = user_query.data[0]["id"]

    # 2. Autenticar con Supabase Auth usando email y CI (password)
    try:
        auth_res = supabase.auth.sign_in_with_password({
            "email": user_email,
            "password": login_data.id_card
        })
        
        if not auth_res.user:
            raise HTTPException(status_code=401, detail="Cédula de identidad incorrecta")
            
    except Exception as e:
        logger.error(f"Error de autenticación Supabase: {e}")
        raise HTTPException(status_code=401, detail="Credenciales inválidas o error de conexión")

    # 3. Obtener el perfil completo para la respuesta
    profile_res = supabase_admin.table("profiles").select("*").eq("id", user_id).single().execute()
    
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    # 4. Generar nuestro propio token para el sistema (o usar el de supabase)
    # Para consistencia con el resto de la app que usa settings.JWT_SECRET:
    access_token = create_access_token(subject=user_id)
    
    logger.info(f"Login exitoso: {login_data.reg_univ} (ID: {user_id})")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": profile_res.data
    }
