"""Router de usuarios registrados (listado completo, no solo estudiantes)."""

from fastapi import APIRouter, Depends, HTTPException
from typing import List

from app.db.supabase import supabase_admin
from app.routers.deps import get_current_user
from app.models.schemas import UserResponse

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_all_users(current_user: UserResponse = Depends(get_current_user)):
    """Obtiene todos los usuarios registrados (admins y estudiantes). Solo ADMIN."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado. Solo administradores.")
    response = supabase_admin.table("profiles").select("*").order("created_at", desc=True).execute()
    return response.data


@router.patch("/{user_id}/estado", response_model=UserResponse)
async def toggle_user_status(
    user_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    """Activa o desactiva un usuario (toggle is_active). Solo ADMIN."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado. Solo administradores.")

    # Obtener estado actual
    user_query = supabase_admin.table("profiles").select("id, is_active").eq("id", user_id).single().execute()
    if not user_query.data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    current_active = user_query.data.get("is_active", True)
    new_active = not current_active

    response = (
        supabase_admin.table("profiles")
        .update({"is_active": new_active})
        .eq("id", user_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=500, detail="Error al actualizar el estado del usuario")

    return UserResponse(**response.data[0])
