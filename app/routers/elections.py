from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import logging
from app.models.schemas import ElectionResponse, CategoryResponse, CandidateResponse, ElectionCreate, CategoryCreate, UserResponse
from app.db.supabase import supabase, supabase_admin
from app.routers.deps import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

# --- Categories (Move more specific routes UP) ---

@router.get("/categories/all", response_model=List[CategoryResponse])
async def get_all_categories():
    response = supabase_admin.table("categories").select("*").order("created_at", desc=True).execute()
    return response.data

@router.get("/categories/{category_id}/candidates", response_model=List[CandidateResponse])
async def get_category_candidates(category_id: str):
    response = supabase_admin.table("candidates").select("*").eq("category_id", category_id).execute()
    return response.data

# --- Elections ---

@router.get("/", response_model=List[ElectionResponse])
async def get_elections():
    response = supabase_admin.table("elections").select("*").order("created_at", desc=True).execute()
    return response.data

@router.post("/", response_model=ElectionResponse)
async def create_election(election_in: ElectionCreate, current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")

    data = election_in.model_dump(mode='json')
    response = supabase_admin.table("elections").insert(data).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Error al crear la elección en la base de datos")

    return response.data[0]

@router.get("/{election_id}", response_model=ElectionResponse)
async def get_election(election_id: str):
    logger.info(f"[DEV] Buscando elección ID: {election_id}")
    try:
        response = supabase_admin.table("elections").select("*").eq("id", election_id).execute()
        if not response.data:
            logger.warning(f"[DEV] Elección no encontrada: {election_id}")
            raise HTTPException(status_code=404, detail="Elección no encontrada")
        return response.data[0]
    except Exception as e:
        logger.error(f"[DEV] Error en get_election: {e}")
        if "invalid input syntax for type uuid" in str(e):
             raise HTTPException(status_code=400, detail="ID de elección inválido")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{election_id}", response_model=ElectionResponse)
async def update_election(election_id: str, election_in: dict, current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")

    update_data = {k: v for k, v in election_in.items() if k not in ['id', 'created_at']}
    response = supabase_admin.table("elections").update(update_data).eq("id", election_id).execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Error al actualizar la elección")

    return response.data[0]

@router.delete("/{election_id}")
async def delete_election(election_id: str, current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    supabase_admin.table("elections").delete().eq("id", election_id).execute()
    return {"message": "Elección eliminada"}

# --- Category Specifics ---

@router.get("/{election_id}/categories", response_model=List[CategoryResponse])
async def get_election_categories(election_id: str):
    response = supabase_admin.table("categories").select("*").eq("election_id", election_id).execute()
    return response.data

@router.post("/categories/", response_model=CategoryResponse)
async def create_category(category_in: CategoryCreate, current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    response = supabase_admin.table("categories").insert(category_in.model_dump()).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Error al crear la categoría")
    return response.data[0]

@router.delete("/categories/{category_id}")
async def delete_category(category_id: str, current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    supabase_admin.table("categories").delete().eq("id", category_id).execute()
    return {"message": "Categoría eliminada"}
