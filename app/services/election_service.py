"""Servicio de actualización de estados de elecciones."""

import logging
from datetime import datetime, timezone

from app.db.supabase import supabase_admin

logger = logging.getLogger(__name__)


def update_expired_elections() -> int:
    """
    Cambia a 'closed' las elecciones activas cuya fecha de fin ya pasó.
    Retorna la cantidad de elecciones actualizadas.
    """
    now = datetime.now(timezone.utc).isoformat()
    response = (
        supabase_admin.table("elections")
        .update({"status": "closed"})
        .eq("status", "active")
        .lt("end_date", now)
        .execute()
    )
    updated = len(response.data) if response.data else 0
    if updated > 0:
        logger.info(f"Se cerraron {updated} elección(es) vencida(s)")
    return updated
