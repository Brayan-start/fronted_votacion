"""Router de auditoría para consultar eventos del sistema."""

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from typing import Optional, List

from app.db.supabase import supabase_admin
from app.routers.deps import get_current_user
from app.models.schemas import UserResponse, AuditLogResponse, AuditLogListResponse

router = APIRouter()


@router.get("/", response_model=AuditLogListResponse)
async def get_audit_logs(
    request: Request,
    page: int = Query(1, ge=1, description="Número de página"),
    per_page: int = Query(20, ge=1, le=100, description="Registros por página"),
    accion: Optional[str] = Query(None, description="Filtrar por acción"),
    usuario: Optional[str] = Query(None, description="Filtrar por nombre de usuario"),
    rol: Optional[str] = Query(None, description="Filtrar por rol (admin, student)"),
    resultado: Optional[str] = Query(None, description="Filtrar por resultado (exito, error)"),
    search: Optional[str] = Query(None, description="Búsqueda general en usuario, acción o detalle"),
    desde: Optional[str] = Query(None, description="Fecha desde (YYYY-MM-DD)"),
    hasta: Optional[str] = Query(None, description="Fecha hasta (YYYY-MM-DD)"),
    current_user: UserResponse = Depends(get_current_user),
):
    """Obtiene registros de auditoría con filtros y paginación. Solo administradores."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado. Solo administradores.")

    try:
        query = supabase_admin.table("audit_logs").select("*", count="exact")

        # Aplicar filtros
        if accion:
            query = query.eq("accion", accion)
        if usuario:
            query = query.ilike("usuario", f"%{usuario}%")
        if rol:
            query = query.eq("rol", rol)
        if resultado:
            query = query.eq("resultado", resultado)
        if desde:
            query = query.gte("created_at", f"{desde}T00:00:00Z")
        if hasta:
            query = query.lte("created_at", f"{hasta}T23:59:59Z")
        if search:
            query = query.or_(f"usuario.ilike.%{search}%,accion.ilike.%{search}%,detalle.ilike.%{search}%")

        # Ordenar por fecha descendente y paginar
        offset = (page - 1) * per_page
        response = (
            query
            .order("created_at", desc=True)
            .range(offset, offset + per_page - 1)
            .execute()
        )

        total = response.count if hasattr(response, "count") and response.count is not None else 0

        return AuditLogListResponse(
            total=total,
            page=page,
            per_page=per_page,
            data=[AuditLogResponse(**item) for item in (response.data or [])],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar auditoría: {str(e)}")


@router.get("/acciones", response_model=List[str])
async def get_audit_actions(
    current_user: UserResponse = Depends(get_current_user),
):
    """Obtiene la lista de acciones disponibles para filtrar."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso denegado.")

    try:
        response = (
            supabase_admin.table("audit_logs")
            .select("accion")
            .execute()
        )
        acciones = list(set(item["accion"] for item in (response.data or [])))
        acciones.sort()
        return acciones
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
