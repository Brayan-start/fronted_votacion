"""
Servicio de envío de correos SMTP para el sistema.

Utiliza las credenciales configuradas en variables de entorno para
enviar correos como códigos de verificación para cambio de contraseña.
"""

import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """
    Envía un correo electrónico usando SMTP con TLS.

    Args:
        to_email: Dirección de correo destino.
        subject: Asunto del mensaje.
        html_body: Contenido HTML del mensaje.

    Returns:
        True si se envió correctamente, False en caso de error.
    """
    smtp_server = settings.SMTP_SERVER
    smtp_port = settings.SMTP_PORT
    smtp_user = settings.SMTP_USER
    smtp_password = settings.SMTP_PASSWORD
    from_email = settings.SMTP_FROM_EMAIL

    # Si no hay configuración SMTP, se simula el envío (modo desarrollo)
    if not smtp_server or not smtp_user:
        logger.warning(
            "[EMAIL] SMTP no configurado. Simulando envío a %s con asunto: %s",
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

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(from_email or smtp_user, to_email, msg.as_string())

        logger.info("[EMAIL] Correo enviado exitosamente a %s", to_email)
        return True

    except smtplib.SMTPException as e:
        logger.error("[EMAIL] Error SMTP al enviar correo a %s: %s", to_email, e)
        return False
    except Exception as e:
        logger.error("[EMAIL] Error inesperado al enviar correo: %s", e)
        return False
