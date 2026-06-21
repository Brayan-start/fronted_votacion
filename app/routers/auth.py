import random
import string
import hashlib
import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.models.schemas import (
    UserCreate, UserResponse, Token, LoginRequest,
    PasswordResetRequest, VerifyResetCodeRequest, ResetPasswordRequest,
    ChangePasswordRequest,
)
from app.db.supabase import supabase, supabase_admin
from app.core.security import create_access_token, get_password_hash
from app.core.config import settings
from app.routers.deps import get_current_user
from app.utils.storage import upload_base64_image
from app.utils.image import process_base64_image
from app.utils.recaptcha import verify_recaptcha_token
from app.utils.email import send_email
from app.utils.audit import log_audit, get_client_ip
from app.services.biometric import biometric_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# ── Almacén en memoria de códigos de verificación ──────────────────────
# Estructura: { email_hash: {"code": str, "expires_at": datetime, "used": bool} }
# NOTA: Para producción con múltiples workers, reemplazar por Redis o una
# tabla en Supabase. El hash del email evita exponer el correo en logs.
_reset_codes: dict = {}
RESET_CODE_EXPIRE_MINUTES = 10
RESET_CODE_LENGTH = 6
# Límite de solicitudes por hora por email
_REQUEST_LIMITS: dict = {}
MAX_REQUESTS_PER_HOUR = 3

# ── Log de estado de reCAPTCHA al iniciar el servidor ─────────────────────
if settings.RECAPTCHA_SECRET_KEY:
    logger.info("[reCAPTCHA] Configurada correctamente con RECAPTCHA_SECRET_KEY.")
    if settings.RECAPTCHA_SKIP_VERIFICATION:
        logger.warning("[reCAPTCHA] RECAPTCHA_SKIP_VERIFICATION=true — la validación está DESHABILITADA.")
else:
    if settings.RECAPTCHA_SKIP_VERIFICATION:
        logger.warning("[reCAPTCHA] RECAPTCHA_SECRET_KEY vacía y RECAPTCHA_SKIP_VERIFICATION=true — la validación se omitirá en los login.")
    else:
        logger.error("[reCAPTCHA] RECAPTCHA_SECRET_KEY no está configurada. El login será rechazado.")

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, request: Request):
    client_ip = get_client_ip(request)
    # 1. Verificar si ya existe en perfiles (RU o CI)
    existing_user = supabase_admin.table("profiles").select("*").or_(f"reg_univ.eq.{user_in.reg_univ},id_card.eq.{user_in.id_card}").execute()
    if existing_user.data:
        await log_audit(
            usuario=user_in.reg_univ,
            rol="student",
            accion="Registro de nuevo usuario",
            detalle="Intento de registro fallido: RU o CI ya registrados",
            ip=client_ip,
            resultado="error",
        )
        raise HTTPException(status_code=400, detail="El RU o CI ya están registrados")

    # 2. Crear usuario en Auth de Supabase usando Admin API
    # Esto evita la necesidad de confirmación por email y asegura la creación del perfil vía trigger
    try:
        auth_response = supabase_admin.auth.admin.create_user({
            "email": user_in.email,
            "password": user_in.password,
            "user_metadata": {
                "name": user_in.name,
                "last_name": user_in.last_name,
                "reg_univ": user_in.reg_univ,
                "id_card": user_in.id_card,
                "role": user_in.role.value,
                "career": user_in.career
            },
            "email_confirm": True
        })
    except Exception as e:
        logger.error(f"Error en create_user (Admin): {e}")
        # Si falla, intentar detectar si es por password corto
        error_msg = str(e)
        if "password" in error_msg.lower():
            error_msg = "La contraseña (CI) debe tener al menos 6 caracteres"
        raise HTTPException(status_code=400, detail=f"Error en Registro: {error_msg}")
    
    if not auth_response:
        raise HTTPException(status_code=400, detail="Error al crear usuario en Auth")

    # En supabase-py 2.x, admin.create_user retorna un objeto que contiene el usuario
    # Puede ser el objeto User directo o un UserResponse con .user
    user_id = getattr(auth_response, 'id', None)
    if not user_id and hasattr(auth_response, 'user'):
        user_id = auth_response.user.id
        
    if not user_id:
        logger.error(f"No se pudo obtener el ID del usuario. Respuesta: {auth_response}")
        raise HTTPException(status_code=500, detail="Error interno al procesar el registro")
    
    # 3. Procesar foto y guardarla en Storage
    photo_url = None
    if user_in.photo_base64:
        photo_path = f"estudiantes/{user_id}.jpg"
        photo_url = upload_base64_image(user_in.photo_base64, "photos-estudiantes", photo_path)
        
        # Actualizar perfil con la URL de la foto
        if photo_url:
            supabase_admin.table("profiles").update({"photo_url": photo_url}).eq("id", user_id).execute()

        # 4. Generar y guardar embedding facial
        try:
            image_bytes = process_base64_image(user_in.photo_base64)
            embedding = biometric_service.get_embedding(image_bytes)
            if embedding:
                supabase_admin.table("face_embeddings").upsert({
                    "user_id": user_id,
                    "embedding": embedding
                }).execute()
        except Exception as e:
            logger.error(f"Falla al generar embedding: {e}")

    # 5. Recuperar perfil final
    profile_response = supabase_admin.table("profiles").select("*").eq("id", user_id).single().execute()
    
    if not profile_response.data:
        await log_audit(
            usuario=user_in.reg_univ,
            rol="student",
            accion="Registro de nuevo usuario",
            detalle="Error al recuperar perfil después de crear usuario",
            ip=client_ip,
            resultado="error",
        )
        raise HTTPException(status_code=500, detail="Error al recuperar el perfil creado")

    await log_audit(
        usuario=f"{user_in.name} {user_in.last_name} ({user_in.reg_univ})",
        rol="student",
        accion="Registro de nuevo usuario",
        ip=client_ip,
        resultado="exito",
    )
    return profile_response.data

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, request: Request):
    client_ip = get_client_ip(request)
    logger.info(f"Intento de login para RU: {login_data.reg_univ} desde IP: {client_ip}")

    # --- Validación de reCAPTCHA ---
    logger.info("[reCAPTCHA] Token recibido: %s", "SÍ" if login_data.recaptcha_token else "NO (vacío)")
    recaptcha_valid = await verify_recaptcha_token(login_data.recaptcha_token)
    if not recaptcha_valid:
        logger.warning(f"[reCAPTCHA] Validación fallida para RU: {login_data.reg_univ}")
        await log_audit(
            usuario=login_data.reg_univ,
            rol="student",
            accion="Inicio de sesión fallido",
            detalle="reCAPTCHA fallido",
            ip=client_ip,
            resultado="error",
        )
        raise HTTPException(
            status_code=400,
            detail="La verificación de seguridad no fue superada. "
                   "Por favor, marca nuevamente la casilla 'No soy un robot' e intenta de nuevo."
        )

    # 1. Buscar el perfil asociado al RU.
    user_query = (
        supabase_admin
        .table("profiles")
        .select("*")
        .eq("reg_univ", login_data.reg_univ)
        .execute()
    )
    
    if not user_query.data:
        logger.warning(f"RU no encontrado: {login_data.reg_univ}")
        await log_audit(
            usuario=login_data.reg_univ,
            rol="student",
            accion="Inicio de sesión fallido",
            detalle="RU no encontrado",
            ip=client_ip,
            resultado="error",
        )
        raise HTTPException(status_code=401, detail="Usuario no encontrado o RU incorrecto")
    
    profile = user_query.data[0]
    user_id = profile["id"]

    # 2. Validar contraseña contra Supabase Auth.
    #    El campo id_card del request contiene la contraseña
    #    (inicialmente igual al CI, luego la que el usuario haya definido).
    email = profile.get("email", "")
    try:
        sign_in_result = supabase.auth.sign_in_with_password({
            "email": email,
            "password": login_data.id_card,
        })
        if not sign_in_result or not sign_in_result.user:
            logger.warning(f"Password incorrecto para RU: {login_data.reg_univ} (email: {email})")
            await log_audit(
                usuario=login_data.reg_univ,
                rol=profile.get("role", "student"),
                accion="Inicio de sesión fallido",
                detalle="Contraseña incorrecta",
                ip=client_ip,
                resultado="error",
            )
            raise HTTPException(status_code=401, detail="Credenciales incorrectas.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en sign_in_with_password para RU {login_data.reg_univ}: {e}")
        await log_audit(
            usuario=login_data.reg_univ,
            rol=profile.get("role", "student"),
            accion="Inicio de sesión fallido",
            detalle=f"Error de autenticación: {e}",
            ip=client_ip,
            resultado="error",
        )
        raise HTTPException(status_code=401, detail="Credenciales incorrectas.")

    # 3. Generar nuestro propio token para el sistema.
    session_token = profile.get("session_token")
    access_token = create_access_token(subject=user_id, session_token=session_token)
    
    logger.info(f"Login exitoso: {login_data.reg_univ} (ID: {user_id})")
    await log_audit(
        usuario=f"{profile['name']} {profile['last_name']} ({login_data.reg_univ})",
        rol=profile.get("role", "student"),
        accion="Inicio de sesión exitoso",
        ip=client_ip,
        resultado="exito",
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": profile
    }

# ──────────────────────────────────────────────────────────────────────
# CAMBIO DE CONTRASEÑA (vía código de verificación al correo)
# ──────────────────────────────────────────────────────────────────────

def _hash_email(email: str) -> str:
    """Retorna un hash SHA-256 del email para usar como key en el dict interno."""
    return hashlib.sha256(email.lower().strip().encode()).hexdigest()

def _check_rate_limit(email: str) -> None:
    """
    Control de tasa: máximo MAX_REQUESTS_PER_HOUR solicitudes por hora por email.
    Los registros antiguos (> 1 hora) se limpian automáticamente.
    """
    now = datetime.utcnow()
    email_lower = email.lower().strip()
    # Limpiar entradas expiradas
    expired = [k for k, v in _REQUEST_LIMITS.items() if v["reset_at"] < now]
    for k in expired:
        del _REQUEST_LIMITS[k]

    if email_lower in _REQUEST_LIMITS:
        entry = _REQUEST_LIMITS[email_lower]
        if entry["count"] >= MAX_REQUESTS_PER_HOUR:
            raise HTTPException(
                status_code=429,
                detail=f"Has superado el límite de solicitudes. Intenta de nuevo en 1 hora.",
            )
        entry["count"] += 1
    else:
        _REQUEST_LIMITS[email_lower] = {"count": 1, "reset_at": now + timedelta(hours=1)}

@router.post("/forgot-password", status_code=200)
async def forgot_password(data: PasswordResetRequest, request: Request):
    client_ip = get_client_ip(request)
    email = data.email.strip().lower()
    logger.info("[RESET] Solicitud de código para email: %s desde IP: %s", email, client_ip)

    user_query = (
        supabase_admin.table("profiles")
        .select("id, email, name")
        .eq("email", email)
        .execute()
    )
    if not user_query.data:
        logger.warning("[RESET] Email no registrado: %s", email)
        await log_audit(
            usuario=email,
            rol="student",
            accion="Recuperación de contraseña",
            detalle="Email no registrado",
            ip=client_ip,
            resultado="error",
        )
        return {"message": "Si el correo está registrado, recibirás un código de verificación."}

    user = user_query.data[0]
    _check_rate_limit(email)

    code = "".join(random.choices(string.digits, k=RESET_CODE_LENGTH))
    expires_at = datetime.utcnow() + timedelta(minutes=RESET_CODE_EXPIRE_MINUTES)

    email_key = _hash_email(email)
    _reset_codes[email_key] = {
        "code": code,
        "expires_at": expires_at,
        "used": False,
    }

    user_name = user.get("name", "Usuario")
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
        <div style="max-width: 480px; margin: auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <h2 style="color: #1e40af; margin-top: 0;">UPEA Vota</h2>
            <p>Hola <strong>{user_name}</strong>,</p>
            <p>Recibiste este correo porque solicitaste cambiar tu contraseña.</p>
            <p style="font-size: 14px; color: #666;">Tu código de verificación es:</p>
            <div style="background: #1e40af; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 16px; border-radius: 12px; letter-spacing: 8px; margin: 16px 0;">
                {code}
            </div>
            <p style="font-size: 14px; color: #666;">Este código expira en <strong>{RESET_CODE_EXPIRE_MINUTES} minutos</strong> y solo puede usarse una vez.</p>
            <p style="font-size: 14px; color: #666;">Si no solicitaste este cambio, ignora este mensaje.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">UPEA Vota — Sistema de Votación Universitaria</p>
        </div>
    </body>
    </html>
    """

    sent = await send_email(
        to_email=email,
        subject="Tu código de verificación - UPEA Vota",
        html_body=html_body,
    )

    if not sent:
        logger.error("[RESET] Fallo al enviar el correo a %s", email)
        await log_audit(
            usuario=email,
            rol="student",
            accion="Recuperación de contraseña",
            detalle="Error al enviar correo vía Brevo",
            ip=client_ip,
            resultado="error",
        )
        raise HTTPException(
            status_code=500,
            detail="Error al enviar el correo. Verifica la configuración de Brevo o intenta más tarde.",
        )

    logger.info("[RESET] Código enviado a %s (expira: %s)", email, expires_at.isoformat())
    await log_audit(
        usuario=email,
        rol="student",
        accion="Recuperación de contraseña",
        detalle="Código de verificación enviado",
        ip=client_ip,
        resultado="exito",
    )
    return {"message": "Si el correo está registrado, recibirás un código de verificación."}

@router.post("/verify-code", status_code=200)
async def verify_reset_code(data: VerifyResetCodeRequest, request: Request):
    client_ip = get_client_ip(request)
    email = data.email.strip().lower()
    email_key = _hash_email(email)
    stored = _reset_codes.get(email_key)

    if not stored:
        logger.warning("[RESET] Código no encontrado para email (hash): %s", email_key[:8])
        raise HTTPException(status_code=400, detail="Código inválido o expirado.")

    if datetime.utcnow() > stored["expires_at"]:
        del _reset_codes[email_key]
        raise HTTPException(status_code=400, detail="El código ha expirado. Solicita uno nuevo.")

    if stored["used"]:
        del _reset_codes[email_key]
        raise HTTPException(status_code=400, detail="Este código ya fue utilizado. Solicita uno nuevo.")

    if stored["code"] != data.code.strip():
        logger.warning("[RESET] Código incorrecto para email (hash): %s", email_key[:8])
        raise HTTPException(status_code=400, detail="Código incorrecto.")

    stored["verified"] = True

    logger.info("[RESET] Código verificado correctamente para email (hash): %s", email_key[:8])
    await log_audit(
        usuario=email,
        rol="student",
        accion="Recuperación de contraseña",
        detalle="Código verificado exitosamente",
        ip=client_ip,
        resultado="exito",
    )
    return {"message": "Código verificado correctamente. Ahora puedes cambiar tu contraseña."}

@router.post("/reset-password", status_code=200)
async def reset_password(data: ResetPasswordRequest, request: Request):
    client_ip = get_client_ip(request)
    email = data.email.strip().lower()
    email_key = _hash_email(email)
    stored = _reset_codes.get(email_key)

    if not stored:
        raise HTTPException(status_code=400, detail="Código inválido o expirado. Solicita uno nuevo.")

    if datetime.utcnow() > stored["expires_at"]:
        del _reset_codes[email_key]
        raise HTTPException(status_code=400, detail="El código ha expirado. Solicita uno nuevo.")

    if stored["used"]:
        del _reset_codes[email_key]
        raise HTTPException(status_code=400, detail="Este código ya fue utilizado. Solicita uno nuevo.")

    if not stored.get("verified"):
        raise HTTPException(status_code=400, detail="Primero debes verificar el código.")

    if stored["code"] != data.code.strip():
        del _reset_codes[email_key]
        raise HTTPException(status_code=400, detail="Código incorrecto.")

    # Marcar como usado (one-time use)
    stored["used"] = True

    # Buscar el usuario por email
    user_query = (
        supabase_admin.table("profiles")
        .select("id, email")
        .eq("email", email)
        .execute()
    )
    if not user_query.data:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    user_id = user_query.data[0]["id"]

    # Hashear la nueva contraseña con bcrypt
    hashed_password = get_password_hash(data.new_password)

    # Actualizar la contraseña en Supabase Auth usando Admin API
    try:
        update_result = supabase_admin.auth.admin.update_user_by_id(
            user_id,
            {"password": data.new_password},
        )
        logger.info("[RESET] update_user_by_id respuesta para %s: %s", user_id, update_result)
    except Exception as e:
        logger.error("[RESET] Error al actualizar contraseña en Auth: %s", e)
        await log_audit(
            usuario=email,
            rol="student",
            accion="Cambio de contraseña",
            detalle="Error al actualizar en Supabase Auth",
            ip=client_ip,
            resultado="error",
        )
        raise HTTPException(status_code=500, detail="Error al cambiar la contraseña. Intenta de nuevo.")

    # Marcar que el usuario cambió su contraseña
    try:
        supabase_admin.table("profiles").update({"password_changed": True}).eq("id", user_id).execute()
    except Exception as e:
        logger.warning("[RESET] No se pudo actualizar password_changed para %s: %s", user_id, e)

    del _reset_codes[email_key]

    logger.info("[RESET] Contraseña actualizada exitosamente para usuario %s", user_id)
    await log_audit(
        usuario=email,
        rol="student",
        accion="Cambio de contraseña",
        ip=client_ip,
        resultado="exito",
    )
    return {"message": "Contraseña cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."}

# ──────────────────────────────────────────────────────────────────────
# CAMBIO DE CONTRASEÑA DESDE SESIÓN ACTIVA (usuario autenticado)
# ──────────────────────────────────────────────────────────────────────

@router.post("/change-password", status_code=200)
async def change_password(
    data: ChangePasswordRequest,
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Cambia la contraseña del usuario autenticado.
    Requiere la contraseña actual para verificar la identidad.
    """
    client_ip = get_client_ip(request)
    user_id = current_user.id
    email = current_user.email

    # 1. Verificar la contraseña actual contra Supabase Auth
    try:
        sign_in_result = supabase.auth.sign_in_with_password({
            "email": email,
            "password": data.current_password,
        })
        if not sign_in_result or not sign_in_result.user:
            logger.warning("[CHANGE_PASSWORD] sign_in_with_password no retornó usuario para %s", user_id)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="La contraseña actual es incorrecta.",
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("[CHANGE_PASSWORD] Excepción validando contraseña actual para %s: %s", user_id, e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La contraseña actual es incorrecta.",
        )

    # 2. Actualizar la contraseña en Supabase Auth
    #    (usa el Admin API — modifica auth.users, NO la tabla profiles)
    try:
        update_result = supabase_admin.auth.admin.update_user_by_id(
            user_id,
            {"password": data.new_password},
        )
        logger.info(
            "[CHANGE_PASSWORD] update_user_by_id respuesta para %s: %s",
            user_id, update_result,
        )
    except Exception as e:
        logger.error("[CHANGE_PASSWORD] Excepción en update_user_by_id para %s: %s", user_id, e)
        await log_audit(
            usuario=f"{current_user.name} {current_user.last_name} ({current_user.reg_univ})",
            rol=current_user.role,
            accion="Cambio de contraseña",
            detalle=f"Error al actualizar en Supabase Auth: {e}",
            ip=client_ip,
            resultado="error",
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al cambiar la contraseña. Intenta de nuevo.",
        )

    # 3. Marcar que el usuario cambió su contraseña
    try:
        supabase_admin.table("profiles").update({"password_changed": True}).eq("id", user_id).execute()
    except Exception as e:
        logger.warning("[CHANGE_PASSWORD] No se pudo actualizar password_changed para %s: %s", user_id, e)

    # 4. Verificar que la nueva contraseña funciona
    try:
        supabase.auth.sign_in_with_password({
            "email": email,
            "password": data.new_password,
        })
        logger.info("[CHANGE_PASSWORD] Nueva contraseña verificada para %s", user_id)
    except Exception as e:
        logger.error(
            "[CHANGE_PASSWORD] La nueva contraseña NO funciona después del update para %s: %s",
            user_id, e,
        )
        await log_audit(
            usuario=f"{current_user.name} {current_user.last_name} ({current_user.reg_univ})",
            rol=current_user.role,
            accion="Cambio de contraseña",
            detalle="La nueva contraseña no pasó verificación post-actualización",
            ip=client_ip,
            resultado="error",
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="El cambio de contraseña no pudo ser verificado. Intenta de nuevo.",
        )

    logger.info("[CHANGE_PASSWORD] Contraseña actualizada exitosamente para usuario %s", user_id)
    await log_audit(
        usuario=f"{current_user.name} {current_user.last_name} ({current_user.reg_univ})",
        rol=current_user.role,
        accion="Cambio de contraseña",
        detalle="Contraseña cambiada desde sesión activa",
        ip=client_ip,
        resultado="exito",
    )
    return {"message": "Contraseña cambiada exitosamente."}

# ──────────────────────────────────────────────────────────────────────
# CERRAR SESIÓN EN TODOS LOS DISPOSITIVOS
# ──────────────────────────────────────────────────────────────────────

@router.post("/logout-all", status_code=200)
async def logout_all(
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Invalida todas las sesiones activas del usuario (todos los dispositivos).

    Estrategia (3 capas de fallback):
      1. Llamar a la API Admin de Supabase Auth (sign_out).
      2. Si falla, eliminar directamente los registros de auth.sessions.
      3. Siempre regenera session_token en profiles, invalidando
         cualquier JWT existente (verificado en get_current_user).
    """
    user_id = current_user.id
    client_ip = get_client_ip(request)
    supabase_ok = False

    # ── Capa 1: Supabase Auth Admin API ──────────────────────────────
    try:
        # En supabase-py v2 el método es sign_out(user_id, scope="global")
        if hasattr(supabase_admin.auth, 'admin') and hasattr(supabase_admin.auth.admin, 'sign_out'):
            try:
                supabase_admin.auth.admin.sign_out(user_id, scope="global")
                supabase_ok = True
                logger.info("[LOGOUT_ALL] sign_out(scope=global) OK para %s", user_id)
            except TypeError:
                # Firmas antiguas: solo user_id
                supabase_admin.auth.admin.sign_out(user_id)
                supabase_ok = True
                logger.info("[LOGOUT_ALL] sign_out(user_id) OK para %s", user_id)
        else:
            logger.warning("[LOGOUT_ALL] sign_out no disponible en esta versión de supabase-py")
    except Exception as e:
        logger.error("[LOGOUT_ALL] Error en sign_out para %s: %s", user_id, e, exc_info=True)

    # ── Capa 2: Eliminar sesiones directamente desde auth.sessions ────
    if not supabase_ok:
        try:
            result = supabase_admin.table("sessions").delete().eq("user_id", user_id).execute()
            logger.info("[LOGOUT_ALL] Eliminación directa de sessions para %s: %s", user_id, result)
            supabase_ok = True
        except Exception as e:
            logger.error("[LOGOUT_ALL] Error al eliminar sessions para %s: %s", user_id, e, exc_info=True)

    # ── Capa 3 (siempre): regenerar session_token en profiles ─────────
    try:
        new_token = str(uuid.uuid4())
        supabase_admin.table("profiles").update(
            {"session_token": new_token}
        ).eq("id", user_id).execute()
        logger.info("[LOGOUT_ALL] session_token regenerado para %s → %s", user_id, new_token)
    except Exception as e:
        logger.error("[LOGOUT_ALL] Error al regenerar session_token para %s: %s", user_id, e, exc_info=True)
        await log_audit(
            usuario=f"{current_user.name} {current_user.last_name} ({current_user.reg_univ})",
            rol=current_user.role,
            accion="Cierre de sesión en todos los dispositivos",
            detalle=f"Error crítico al regenerar session_token: {e}",
            ip=client_ip,
            resultado="error",
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudieron cerrar todas las sesiones, intenta de nuevo.",
        )

    await log_audit(
        usuario=f"{current_user.name} {current_user.last_name} ({current_user.reg_univ})",
        rol=current_user.role,
        accion="Cierre de sesión en todos los dispositivos",
        ip=client_ip,
        resultado="exito",
    )
    return {"message": "Sesión cerrada en todos los dispositivos correctamente."}
