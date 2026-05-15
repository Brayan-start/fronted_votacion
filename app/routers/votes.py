from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import VoteCreate, VoteResponse, UserResponse
from app.db.supabase import supabase, supabase_admin
from app.routers.deps import get_current_user
from app.services.biometric import biometric_service
from app.utils.image import process_base64_image
from app.core.config import settings
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
            logger.info(f"Embedding no encontrado para usuario {user_id}. Intentando generar desde foto de perfil.")
            import requests
            try:
                photo_bytes = requests.get(profile.data["photo_url"]).content
                stored_embedding = biometric_service.get_embedding(photo_bytes)
                if stored_embedding:
                    supabase_admin.table("face_embeddings").upsert({
                        "user_id": user_id,
                        "embedding": stored_embedding
                    }).execute()
                else:
                    raise HTTPException(status_code=400, detail="No se pudo procesar la foto de registro para biometría")
            except Exception as ex:
                logger.error(f"Error descargando/procesando foto de perfil: {ex}")
                raise HTTPException(status_code=400, detail="Error al recuperar foto de registro")
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
    current_user: UserResponse = Depends(get_current_user)
):
    user_id = current_user.id
    
    # 1. Validaciones Previas
    # 1.1 Ya votó?
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

    # 1.2 Elección activa?
    election = supabase_admin.table("elections").select("status").eq("id", vote_in.election_id).single().execute()
    if not election.data or election.data["status"] != "active":
        raise HTTPException(status_code=400, detail="La elección no está activa")

    # 2. Verificación Biométrica (Re-validamos por seguridad en el commit final)
    await _perform_biometric_check(user_id, vote_in.face_capture_base64)

    # 3. Registro de Voto Atómico
    vote_data = {
        "user_id": user_id,
        "election_id": vote_in.election_id,
        "category_id": vote_in.category_id,
        "candidate_id": vote_in.candidate_id
    }
    
    response = supabase_admin.table("votes").insert(vote_data).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="No se pudo registrar el voto. Intenta nuevamente.")
    
    logger.info(f"Voto exitoso registrado: Usuario {user_id} - Elección {vote_in.election_id}")
    return response.data[0]
