import hashlib
import random
from datetime import datetime
from typing import List

import requests

from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.models.schemas import VoteCreate, VoteResponse, UserResponse, VoteHistoryItem, CarnetData, CarnetVerificationResponse
from app.db.supabase import supabase, supabase_admin
from app.routers.deps import get_current_user
from app.services.biometric import biometric_service
from app.utils.image import process_base64_image
from app.core.config import settings
from app.utils.audit import log_audit, get_client_ip
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

async def _perform_biometric_check(user_id: str, face_capture_base64: str):
    """
    Función interna para realizar el chequeo biométrico.
    """
    # 1. Obtener foto de registro del usuario
    profile = supabase_admin.table("profiles").select("photo_url").eq("id", user_id).single().execute()
    if not profile.data or not profile.data["photo_url"]:
        raise HTTPException(status_code=400, detail="El usuario no tiene una foto de registro válida")

    try:
        # 2. Obtener embedding guardado
        stored_emb_res = supabase_admin.table("face_embeddings").select("embedding").eq("user_id", user_id).execute()
        
        if not stored_emb_res.data:
            logger.info(f"Embedding no encontrado para usuario {user_id}. Usando captura actual como referencia.")
            current_capture_bytes = process_base64_image(face_capture_base64)
            stored_embedding = biometric_service.get_embedding(current_capture_bytes)
            if not stored_embedding:
                raise HTTPException(
                    status_code=400,
                    detail="No se detectó rostro en la cámara. Asegúrate de tener buena iluminación."
                )
            supabase_admin.table("face_embeddings").upsert({
                "user_id": user_id,
                "embedding": stored_embedding
            }).execute()
            logger.info(f"PRIMERA VERIFICACIÓN: Embedding creado desde captura para usuario {user_id}")
            return True
        else:
            stored_embedding = stored_emb_res.data[0]["embedding"]

        # 3. Procesar captura actual
        current_capture_bytes = process_base64_image(face_capture_base64)
        
        # 4. Comparar Real
        is_verified = biometric_service.compare_faces(
            stored_embedding, 
            current_capture_bytes, 
            settings.FACE_MATCH_THRESHOLD
        )
        
        if not is_verified:
            logger.warning(f"VERIFICACIÓN FALLIDA: Rostro no coincide para usuario {user_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Verificación facial fallida. El rostro no coincide con nuestro registro."
            )
            
        logger.info(f"VERIFICACIÓN EXITOSA: Usuario {user_id} validado biométricamente")
        return True

    except HTTPException as he:
        raise he
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error crítico en proceso de biometría: {e}")
        raise HTTPException(status_code=500, detail="Error interno en la verificación biométrica")

@router.get("/stats")
async def get_user_stats(current_user: UserResponse = Depends(get_current_user)):
    """
    Retorna estadísticas del usuario actual: total de votos y IDs de elecciones en las que participó.
    """
    try:
        response = supabase_admin.table("votes").select("election_id", count="exact").eq("user_id", current_user.id).execute()
        
        # Conteo total
        count = response.count if hasattr(response, 'count') and response.count is not None else len(response.data)
        
        # Lista de elecciones únicas donde ya votó
        voted_election_ids = list(set([v["election_id"] for v in response.data]))
        
        return {
            "count": count, 
            "voted_elections": voted_election_ids
        }
    except Exception as e:
        logger.error(f"Error al obtener estadísticas de votos: {e}")
        return {"count": 0, "voted_elections": []}

@router.post("/verify")
async def verify_identity(
    vote_in: VoteCreate, 
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Endpoint para validar identidad sin registrar el voto todavía.
    """
    await _perform_biometric_check(current_user.id, vote_in.face_capture_base64)
    return {"status": "success", "message": "Identidad verificada correctamente"}

@router.post("/", response_model=VoteResponse)
async def cast_vote(
    vote_in: VoteCreate,
    request: Request,
    current_user: UserResponse = Depends(get_current_user)
):
    user_id = current_user.id
    client_ip = get_client_ip(request)
    
    existing_vote = supabase_admin.table("votes").select("id").match({
        "user_id": user_id,
        "election_id": vote_in.election_id,
        "category_id": vote_in.category_id
    }).execute()
    
    if existing_vote.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya has emitido tu voto para esta categoría en esta elección"
        )

    election = supabase_admin.table("elections").select("status").eq("id", vote_in.election_id).single().execute()
    if not election.data or election.data["status"] != "active":
        await log_audit(
            usuario=f"{current_user.name} {current_user.last_name} ({current_user.reg_univ})",
            rol="student",
            accion="Emisión de voto",
            detalle=f"Intento de voto en elección inactiva: {vote_in.election_id}",
            ip=client_ip,
            resultado="error",
        )
        raise HTTPException(status_code=400, detail="La elección no está activa")

    await _perform_biometric_check(user_id, vote_in.face_capture_base64)

    vote_data = {
        "user_id": user_id,
        "election_id": vote_in.election_id,
        "category_id": vote_in.category_id,
        "candidate_id": vote_in.candidate_id
    }
    
    response = supabase_admin.table("votes").insert(vote_data).execute()
    
    if not response.data:
        await log_audit(
            usuario=f"{current_user.name} {current_user.last_name} ({current_user.reg_univ})",
            rol="student",
            accion="Emisión de voto",
            detalle="Error al registrar voto en base de datos",
            ip=client_ip,
            resultado="error",
        )
        raise HTTPException(status_code=500, detail="No se pudo registrar el voto. Intenta nuevamente.")
    
    logger.info(f"Voto exitoso registrado: Usuario {user_id} - Elección {vote_in.election_id}")
    await log_audit(
        usuario=f"{current_user.name} {current_user.last_name} ({current_user.reg_univ})",
        rol="student",
        accion="Emisión de voto",
        detalle=f"Elección: {vote_in.election_id}",
        ip=client_ip,
        resultado="exito",
    )
    return response.data[0]

# ──────────────────────────────────────────────────────────────────────
# HISTORIAL PERSONAL DE VOTACIÓN
# ──────────────────────────────────────────────────────────────────────

@router.get("/history", response_model=List[VoteHistoryItem])
async def get_vote_history(current_user: UserResponse = Depends(get_current_user)):
    """
    Retorna el historial completo de votos del usuario autenticado,
    con detalles de la elección, categoría y candidato seleccionado.
    """
    user_id = current_user.id
    votes_resp = (
        supabase_admin.table("votes")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    if not votes_resp.data:
        return []

    history = []
    for v in votes_resp.data:
        # Obtener nombre de la elección
        election = supabase_admin.table("elections").select("title, type").eq("id", v["election_id"]).single().execute()
        election_title = election.data["title"] if election.data else "Desconocida"
        election_type = election.data["type"] if election.data else ""

        # Obtener nombre de la categoría
        category = supabase_admin.table("categories").select("name").eq("id", v["category_id"]).single().execute()
        category_name = category.data["name"] if category.data else "Desconocida"

        # Obtener nombre del candidato
        candidate = supabase_admin.table("candidates").select("name").eq("id", v["candidate_id"]).single().execute()
        candidate_name = candidate.data["name"] if candidate.data else "Desconocido"

        history.append(VoteHistoryItem(
            id=v["id"],
            election_title=election_title,
            election_type=election_type,
            category_name=category_name,
            candidate_name=candidate_name,
            created_at=v["created_at"],
        ))

    return history

# ──────────────────────────────────────────────────────────────────────
# CARNET DE SUFRAGIO — datos para generar el PDF en el frontend
# ──────────────────────────────────────────────────────────────────────

# ──────────────────────────────────────────────────────────────────────
# VERIFICACIÓN PÚBLICA DE CARNET (sin autenticación)
# ──────────────────────────────────────────────────────────────────────

@router.get("/verify-carnet", response_model=CarnetVerificationResponse)
async def verify_carnet(code: str):
    """Verifica públicamente un código de carnet de sufragio."""
    if not code or len(code) < 10:
        return CarnetVerificationResponse(
            valido=False,
            mensaje="Código de verificación inválido."
        )

    # Buscar el código en todos los perfiles
    profiles = supabase_admin.table("profiles").select("*").execute()
    for profile in profiles.data or []:
        raw = f"{profile['reg_univ']}|{profile['id_card']}|{str(datetime.utcnow().year)}|{profile['id']}"
        codigo = hashlib.sha256(raw.encode()).hexdigest()[:16].upper()
        if codigo == code:
            mesa_hash = hashlib.md5(profile["reg_univ"].encode()).hexdigest()[:4]
            mesa_num = str(int(mesa_hash, 16) % 100).zfill(2)
            return CarnetVerificationResponse(
                valido=True,
                nombre=f"{profile['name']} {profile['last_name']}",
                ru=profile["reg_univ"],
                mesa=mesa_num,
                gestion=str(datetime.utcnow().year),
                mensaje="Carnet válido. El documento corresponde a un estudiante registrado."
            )

    return CarnetVerificationResponse(
        valido=False,
        mensaje="Código no encontrado o carnet no válido."
    )

@router.get("/carnet", response_model=CarnetData)
async def get_carnet_data(current_user: UserResponse = Depends(get_current_user)):
    """
    Retorna los datos necesarios para generar el Carnet de Sufragio PDF
    del usuario autenticado.

    El carnet incluye: nombre, CI, RU, número de mesa (asignado en base
    al RU), gestión electoral, fecha de emisión y un código único de
    verificación generado a partir de los datos del usuario.
    """
    user = current_user

    # Generar número de mesa basado en hash del RU (consistente siempre)
    mesa_hash = hashlib.md5(user.reg_univ.encode()).hexdigest()[:4]
    mesa_num = str(int(mesa_hash, 16) % 100).zfill(2)

    # Gestión electoral = año actual
    gestion = str(datetime.utcnow().year)

    # Fecha de emisión
    fecha_emision = datetime.utcnow().strftime("%d/%m/%Y")

    # Código único de verificación (hash de datos del usuario)
    raw = f"{user.reg_univ}|{user.id_card}|{gestion}|{user.id}"
    codigo = hashlib.sha256(raw.encode()).hexdigest()[:16].upper()

    return CarnetData(
        name=user.name,
        last_name=user.last_name,
        id_card=user.id_card,
        reg_univ=user.reg_univ,
        email=user.email,
        carrera=user.career,
        mesa=mesa_num,
        gestion=gestion,
        fecha_emision=fecha_emision,
        codigo_verificacion=codigo,
        photo_url=user.photo_url,
    )
