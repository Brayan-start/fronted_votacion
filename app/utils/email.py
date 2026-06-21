"""
Servicio de envío de correos para el sistema.

Usa la API HTTP de Brevo (antes Sendinblue) en vez de SMTP directo, porque
Render bloquea las conexiones salientes a puertos SMTP (25, 465, 587) en
el plan Free desde septiembre 2025. La API de Brevo viaja por HTTPS (443),
que no está bloqueado.

Si no hay BREVO_API_KEY configurada, se intenta SMTP tradicional (útil en
desarrollo local). Si tampoco hay SMTP configurado, se simula el envío.
"""

import smtplib
import logging
import httpx
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


async def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """
    Envía un correo electrónico. Prioridad: Brevo API > SMTP > simulado.

    Args:
        to_email: Dirección de correo destino.
        subject: Asunto del mensaje.
        html_body: Contenido HTML del mensaje.

    Returns:
        True si se envió (o simuló) correctamente, False en caso de error real.
    """
    from_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USER

    # ── Opción 1: Brevo API (recomendado en producción / Render) ──────────
    if settings.BREVO_API_KEY:
        try:
            payload = {
                "sender": {"email": from_email, "name": "UPEA Vota"},
                "to": [{"email": to_email}],
                "subject": subject,
                "htmlContent": html_body,
            }
            headers = {
                "api-key": settings.BREVO_API_KEY,
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(BREVO_API_URL, json=payload, headers=headers)

            if response.status_code in (200, 201):
                logger.info("[EMAIL] Correo enviado vía Brevo a %s", to_email)
                return True
            else:
                logger.error(
                    "[EMAIL] Brevo respondió con error %s: %s",
                    response.status_code, response.text,
                )
                return False
        except Exception as e:
            logger.error("[EMAIL] Error inesperado al usar Brevo: %s", e)
            return False

    # ── Opción 2: SMTP tradicional (funciona en local, NO en Render Free) ─
    smtp_server = settings.SMTP_SERVER
    smtp_port = settings.SMTP_PORT
    smtp_user = settings.SMTP_USER
    smtp_password = settings.SMTP_PASSWORD

    if not smtp_server or not smtp_user:
        logger.warning(
            "[EMAIL] Ni Brevo ni SMTP configurados. Simulando envío a %s con asunto: %s",
            to_email, subject,
        )
        logger.info("[EMAIL] Cuerpo HTML (simulado):\n%s", html_body)
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = from_email or smtp_user
        msg["To"] = to_email
        msg["Subject"] = subject

        part_html = MIMEText(html_body, "html")
        msg.attach(part_html)

        with smtplib.SMTP(smtp_server, smtp_port, timeout=10) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(from_email or smtp_user, to_email, msg.as_string())

        logger.info("[EMAIL] Correo enviado exitosamente (SMTP) a %s", to_email)
        return True

    except smtplib.SMTPException as e:
        logger.error("[EMAIL] Error SMTP al enviar correo a %s: %s", to_email, e)
        return False
    except Exception as e:
        logger.error("[EMAIL] Error inesperado al enviar correo: %s", e)
        return False