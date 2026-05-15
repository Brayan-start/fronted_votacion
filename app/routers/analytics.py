from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.db.supabase import supabase_admin
from app.routers.deps import get_current_user
from app.models.analytics import ElectionAnalytics, CategoryResult, CandidateResult, GlobalStats
from app.models.schemas import UserResponse

router = APIRouter()

@router.get("/global-stats", response_model=GlobalStats)
async def get_global_stats(current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")

    total_voters = supabase_admin.table("profiles").select("id", count="exact").eq("role", "student").execute().count
    active_elections = supabase_admin.table("elections").select("id", count="exact").eq("status", "active").execute().count
    total_votes = supabase_admin.table("votes").select("id", count="exact").execute().count
    
    participation = 0.0
    if total_voters and total_voters > 0:
        participation = round((total_votes / (total_voters)) * 100, 2)

    return {
        "total_voters": total_voters or 0,
        "active_elections": active_elections or 0,
        "total_votes_cast": total_votes or 0,
        "participation_rate": participation
    }

@router.get("/{election_id}", response_model=ElectionAnalytics)
async def get_election_analytics(
    election_id: str, 
    current_user: UserResponse = Depends(get_current_user)
):
    # Validar rol admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado")

    # 1. Obtener info de la elección
    election = supabase_admin.table("elections").select("*").eq("id", election_id).single().execute()
    if not election.data:
        raise HTTPException(status_code=404, detail="Elección no encontrada")

    # 2. Obtener categorías
    categories = supabase_admin.table("categories").select("*").eq("election_id", election_id).execute()
    
    # 3. Obtener resultados agregados
    results_data = []
    total_election_votes = 0

    for cat in categories.data:
        cat_id = cat["id"]
        candidates = supabase_admin.table("candidates").select("*").eq("category_id", cat_id).execute()
        
        cat_total_votes = 0
        cand_results = []
        
        for cand in candidates.data:
            count_res = supabase_admin.table("votes").select("id", count="exact").match({
                "election_id": election_id,
                "category_id": cat_id,
                "candidate_id": cand["id"]
            }).execute()
            
            votes = count_res.count if count_res.count is not None else 0
            cat_total_votes += votes
            
            cand_results.append({
                "candidate_id": cand["id"],
                "candidate_name": cand["name"],
                "photo_url": cand["photo_url"],
                "vote_count": votes,
                "percentage": 0.0
            })

        for r in cand_results:
            if cat_total_votes > 0:
                r["percentage"] = round((r["vote_count"] / cat_total_votes) * 100, 2)

        results_data.append({
            "category_id": cat_id,
            "category_name": cat["name"],
            "total_votes": cat_total_votes,
            "candidates": cand_results
        })
        
        total_election_votes += cat_total_votes

    total_students = supabase_admin.table("profiles").select("id", count="exact").eq("role", "student").execute()
    participation = 0.0
    if total_students.count and total_students.count > 0:
        max_voters = max([c["total_votes"] for c in results_data]) if results_data else 0
        participation = round((max_voters / total_students.count) * 100, 2)

    return {
        "election_id": election_id,
        "election_title": election.data["title"],
        "total_votes": total_election_votes,
        "participation_percentage": participation,
        "results_by_category": results_data
    }
