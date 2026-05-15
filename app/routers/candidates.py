from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import logging
from app.models.schemas import CandidateResponse, CandidateCreate, UserResponse
from app.db.supabase import supabase_admin
from app.routers.deps import get_current_user
from app.utils.storage import upload_base64_image
import uuid

router = APIRouter()
logger = logging.getLogger(__name__)

BUCKET_NAME = "candidates"

@router.get("/", response_model=List[CandidateResponse])
async def get_all_candidates():
    response = supabase_admin.table("candidates").select("*").order("created_at", desc=True).execute()
    return response.data

@router.post("/", response_model=CandidateResponse)
async def create_candidate(candidate_in: CandidateCreate, current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # 1. Preparar datos base
    data = candidate_in.model_dump(exclude={"photo_base64"})
    
    # 2. Manejar subida de foto si existe base64
    if candidate_in.photo_base64:
        file_name = f"candidate_{uuid.uuid4()}.jpg"
        photo_url = upload_base64_image(
            base64_str=candidate_in.photo_base64,
            bucket=BUCKET_NAME,
            path=file_name
        )
        if photo_url:
            data["photo_url"] = photo_url
        else:
            logger.error(f"[UPLOAD ERROR] Fallo al procesar imagen para nuevo candidato")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="No se pudo subir la imagen al servidor. Verifica que el bucket 'candidates' exista y sea público."
            )
    
    # 3. Insertar en DB
    response = supabase_admin.table("candidates").insert(data).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Error al registrar el candidato en la base de datos")
        
    return response.data[0]

@router.put("/{candidate_id}", response_model=CandidateResponse)
async def update_candidate(candidate_id: str, candidate_in: dict, current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # Si viene photo_base64 en la actualización
    if "photo_base64" in candidate_in and candidate_in["photo_base64"]:
        file_name = f"candidate_{uuid.uuid4()}.jpg"
        photo_url = upload_base64_image(
            base64_str=candidate_in["photo_base64"],
            bucket=BUCKET_NAME,
            path=file_name
        )
        if photo_url:
            candidate_in["photo_url"] = photo_url
            # Limpiar el base64 para que no se guarde en DB
            del candidate_in["photo_base64"]
        else:
            raise HTTPException(status_code=500, detail="Error al actualizar la imagen en el servidor")
    
    response = supabase_admin.table("candidates").update(candidate_in).eq("id", candidate_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Error al actualizar el candidato")
        
    return response.data[0]

@router.delete("/{candidate_id}")
async def delete_candidate(candidate_id: str, current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    # Opcional: Podríamos intentar borrar la imagen de storage aquí
    
    supabase_admin.table("candidates").delete().eq("id", candidate_id).execute()
    return {"message": "Candidato eliminado con éxito"}
