from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List
import logging
from app.models.schemas import CandidateResponse, CandidateCreate, UserResponse
from app.db.supabase import supabase_admin
from app.routers.deps import get_current_user
from app.utils.storage import upload_base64_image
from app.utils.audit import log_audit, get_client_ip
import uuid

router = APIRouter()
logger = logging.getLogger(__name__)

BUCKET_NAME = "candidates"

@router.get("/", response_model=List[CandidateResponse])
async def get_all_candidates():
    response = supabase_admin.table("candidates").select("*").order("created_at", desc=True).execute()
    return response.data

@router.post("/", response_model=CandidateResponse)
async def create_candidate(
    candidate_in: CandidateCreate,
    request: Request,
    current_user: UserResponse = Depends(get_current_user)
):
    client_ip = get_client_ip(request)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    data = candidate_in.model_dump(exclude={"photo_base64"})
    
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
            await log_audit(
                usuario=f"{current_user.name} {current_user.last_name}",
                rol="admin",
                accion="Creación de candidato",
                detalle="Error al subir imagen",
                ip=client_ip,
                resultado="error",
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo subir la imagen al servidor. Verifica que el bucket 'candidates' exista y sea público."
            )
    
    response = supabase_admin.table("candidates").insert(data).execute()
    
    if not response.data:
        await log_audit(
            usuario=f"{current_user.name} {current_user.last_name}",
            rol="admin",
            accion="Creación de candidato",
            detalle="Error al insertar en base de datos",
            ip=client_ip,
            resultado="error",
        )
        raise HTTPException(status_code=500, detail="Error al registrar el candidato en la base de datos")
    
    await log_audit(
        usuario=f"{current_user.name} {current_user.last_name}",
        rol="admin",
        accion="Creación de candidato",
        detalle=f"Candidato: {candidate_in.name}",
        ip=client_ip,
        resultado="exito",
    )
    return response.data[0]

@router.put("/{candidate_id}", response_model=CandidateResponse)
async def update_candidate(
    candidate_id: str,
    candidate_in: dict,
    request: Request,
    current_user: UserResponse = Depends(get_current_user)
):
    client_ip = get_client_ip(request)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    if "photo_base64" in candidate_in and candidate_in["photo_base64"]:
        file_name = f"candidate_{uuid.uuid4()}.jpg"
        photo_url = upload_base64_image(
            base64_str=candidate_in["photo_base64"],
            bucket=BUCKET_NAME,
            path=file_name
        )
        if photo_url:
            candidate_in["photo_url"] = photo_url
            del candidate_in["photo_base64"]
        else:
            raise HTTPException(status_code=500, detail="Error al actualizar la imagen en el servidor")
    
    response = supabase_admin.table("candidates").update(candidate_in).eq("id", candidate_id).execute()
    
    if not response.data:
        await log_audit(
            usuario=f"{current_user.name} {current_user.last_name}",
            rol="admin",
            accion="Edición de candidato",
            detalle=f"Error al actualizar candidato {candidate_id}",
            ip=client_ip,
            resultado="error",
        )
        raise HTTPException(status_code=500, detail="Error al actualizar el candidato")
    
    await log_audit(
        usuario=f"{current_user.name} {current_user.last_name}",
        rol="admin",
        accion="Edición de candidato",
        detalle=f"Candidato ID: {candidate_id}",
        ip=client_ip,
        resultado="exito",
    )
    return response.data[0]

@router.delete("/{candidate_id}")
async def delete_candidate(
    candidate_id: str,
    request: Request,
    current_user: UserResponse = Depends(get_current_user)
):
    client_ip = get_client_ip(request)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    
    cand = supabase_admin.table("candidates").select("name").eq("id", candidate_id).single().execute()
    cand_name = cand.data["name"] if cand.data else "Desconocido"
    
    supabase_admin.table("candidates").delete().eq("id", candidate_id).execute()
    
    await log_audit(
        usuario=f"{current_user.name} {current_user.last_name}",
        rol="admin",
        accion="Eliminación de candidato",
        detalle=f"Candidato: {cand_name} (ID: {candidate_id})",
        ip=client_ip,
        resultado="exito",
    )
    return {"message": "Candidato eliminado con éxito"}
