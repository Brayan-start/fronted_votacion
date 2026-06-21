from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models.schemas import UserResponse, UpdateProfileRequest, PhotoUploadRequest
from app.db.supabase import supabase_admin
from app.routers.deps import get_current_user
from app.utils.storage import upload_base64_image
from app.utils.image import process_base64_image
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: UserResponse = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    data: UpdateProfileRequest,
    current_user: UserResponse = Depends(get_current_user),
):
    """Actualiza nombre, apellido y/o carrera del perfil del estudiante."""
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay campos para actualizar")

    response = (
        supabase_admin.table("profiles")
        .update(update_data)
        .eq("id", current_user.id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=500, detail="Error al actualizar el perfil")
    logger.info("Perfil actualizado para usuario %s", current_user.id)
    return UserResponse(**response.data[0])

@router.post("/photo", response_model=UserResponse)
async def upload_photo(
    data: PhotoUploadRequest,
    current_user: UserResponse = Depends(get_current_user),
):
    """Sube o reemplaza la foto de perfil del estudiante."""
    user_id = current_user.id
    photo_path = f"estudiantes/{user_id}_profile.jpg"

    # Subir imagen a Supabase Storage
    photo_url = upload_base64_image(data.photo_base64, "photos-estudiantes", photo_path)
    if not photo_url:
        raise HTTPException(status_code=500, detail="Error al subir la foto de perfil")

    # Actualizar la URL en el perfil
    response = (
        supabase_admin.table("profiles")
        .update({"photo_url": photo_url})
        .eq("id", user_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=500, detail="Error al actualizar la foto de perfil")

    logger.info("Foto de perfil actualizada para usuario %s", user_id)
    return UserResponse(**response.data[0])

@router.get("/", response_model=List[UserResponse])
async def get_all_students(current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    response = supabase_admin.table("profiles").select("*").eq("role", "student").execute()
    return response.data

@router.delete("/{student_id}")
async def delete_student(student_id: str, current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    response = supabase_admin.table("profiles").delete().eq("id", student_id).execute()
    return {"message": "Estudiante eliminado"}
