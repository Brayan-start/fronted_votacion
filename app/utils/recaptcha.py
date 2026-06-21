"""
Utilidad para verificar tokens de Google reCAPTCHA v2 en el servidor.

Llama a la API de Google para validar que el usuario resolvió
correctamente el desafío "No soy un robot".

Flujo:
  1. El frontend envía el token generado por el widget al endpoint /login.
  2. Esta función POSTea el token + secret_key a Google.
  3. Google responde con {"success": true/false, "error-codes": [...]}.
"""

import httpx
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# URL de verificación de Google reCAPTCHA v2
GOOGLE_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"

# Clave de prueba oficial de Google: SIEMPRE retorna success=true
# https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do
RECAPTCHA_TEST_SECRET = "6LeIxAcTAAAAAGG-vFI1TnRWxZMNFuojJ4WifJWe"


async def verify_recaptcha_token(token: str | None) -> bool:
    """
    Verifica un token de reCAPTCHA v2 contra la API de Google.

    Comportamiento según entorno:
      - Si RECAPTCHA_SKIP_VERIFICATION=true y no hay secret key:
        saltea la validación (útil en desarrollo local).
      - Si la secret key es la de PRUEBA oficial de Google:
        Google siempre responde success=true.
      - Si el token es None/vacío: retorna False.
      - En producción con clave real: llama a Google y retorna el resultado.

    Args:
        token: Token generado por el widget reCAPTCHA en el frontend.

    Returns:
        True si el token es válido, False en caso contrario.
    """
    secret_key = settings.RECAPTCHA_SECRET_KEY

    # ── 1. Modo desarrollo: omitir verificación completa ──────────────────
    # Si RECAPTCHA_SKIP_VERIFICATION=true se saltea TODO el proceso.
    # Útil para desarrollo local sin depender de las claves de Google.
    if settings.RECAPTCHA_SKIP_VERIFICATION:
        logger.info(
            "[reCAPTCHA] RECAPTCHA_SKIP_VERIFICATION=true → verificación omitida. "
            "Token recibido: %s",
            "SÍ" if token else "NO (vacío)",
        )
        return True

    # ── 2. Secret key no configurada ─────────────────────────────────────
    if not secret_key:
        logger.error(
            "[reCAPTCHA] RECAPTCHA_SECRET_KEY no está configurada. "
            "El login será rechazado. Configúrala en Render o en tu .env local."
        )
        return False

    # ── 3. Advertencia si se usa la clave de prueba en producción ─────────
    if secret_key == RECAPTCHA_TEST_SECRET:
        logger.warning(
            "[reCAPTCHA] Se está usando la clave de PRUEBA oficial. "
            "En producción, regístrate en https://www.google.com/recaptcha/admin "
            "y usa una clave real."
        )

    # ── 4. Token ausente ──────────────────────────────────────────────────
    if not token:
        logger.warning("[reCAPTCHA] Token vacío o nulo — el usuario no resolvió el desafío.")
        return False

    # ── 5. Llamada a la API de Google ─────────────────────────────────────
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                GOOGLE_VERIFY_URL,
                data={
                    "secret": secret_key,
                    "response": token,
                },
            )
            result = response.json()

        if result.get("success"):
            logger.info("[reCAPTCHA] Verificación exitosa.")
            return True

        # La verificación falló — registrar códigos de error sin exponer datos sensibles
        error_codes = result.get("error-codes", [])
        logger.warning(
            f"[reCAPTCHA] Verificación fallida. Códigos de error: {error_codes}"
        )
        return False

    except httpx.TimeoutException:
        logger.error("[reCAPTCHA] Timeout al conectar con la API de Google.")
        return False
    except httpx.RequestError as e:
        logger.error(f"[reCAPTCHA] Error de conexión: {e}")
        return False
    except Exception as e:
        logger.error(f"[reCAPTCHA] Error inesperado: {e}")
        return False
