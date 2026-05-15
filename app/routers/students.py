from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models.schemas import UserResponse
from app.db.supabase import supabase_admin
from app.routers.deps import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: UserResponse = Depends(get_current_user)):
    return current_user

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
    # Nota: Borrar perfil también debería borrar el usuario de Auth si es posible (vía service_role)
    response = supabase_admin.table("profiles").delete().eq("id", student_id).execute()
    return {"message": "Estudiante eliminado"}
