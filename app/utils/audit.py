"""Módulo de auditoría para registrar eventos del sistema."""

import logging
from datetime import datetime
from typing import Optional

from app.db.supabase import supabase_admin

logger = logging.getLogger(__name__)

# Acciones predefinidas
ACCION_LOGIN_EXITOSO = "Inicio de sesión exitoso"
ACCION_LOGIN_FALLIDO = "Inicio de sesión fallido"
ACCION_REGISTRO = "Registro de nuevo usuario"
ACCION_CAMBIO_CONTRASENA = "Cambio de contraseña"
ACCION_RECUPERACION_CONTRASENA = "Recuperación de contraseña"
ACCION_EMISION_VOTO = "Emisión de voto"
ACCION_CIERRE_SESION = "Cierre de sesión"
ACCION_CREAR_CANDIDATO = "Creación de candidato"
ACCION_EDITAR_CANDIDATO = "Edición de candidato"
ACCION_ELIMINAR_CANDIDATO = "Eliminación de candidato"
ACCION_ACCION_ADMIN = "Acción administrativa"


async def log_audit(
    usuario: str,
    rol: str,
    accion: str,
    detalle: Optional[str] = None,
    ip: Optional[str] = None,
    resultado: str = "exito",
) -> None:
    """Registra un evento en la tabla de auditoría.

    Args:
        usuario: Nombre del usuario que realizó la acción.
        rol: Rol del usuario (admin, student).
        accion: Descripción de la acción realizada.
        detalle: Información adicional sobre la acción.
        ip: Dirección IP del usuario.
        resultado: "exito" o "error".
    """
    try:
        supabase_admin.table("audit_logs").insert({
            "usuario": usuario,
            "rol": rol,
            "accion": accion,
            "detalle": detalle,
            "ip": ip,
            "resultado": resultado,
        }).execute()
        logger.debug(f"Audit log: {usuario} - {accion} - {resultado}")
    except Exception as e:
        logger.error(f"Error al registrar auditoría: {e}")


def get_client_ip(request) -> str:
    """Obtiene la dirección IP del cliente desde la request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "0.0.0.0"
