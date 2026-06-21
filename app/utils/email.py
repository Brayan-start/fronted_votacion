"""
Servicio de envío de correos para el sistema.

Usa el SDK oficial de Brevo (brevo-python) con TransactionalEmailsApi.
Requiere BREVO_API_KEY configurada en las variables de entorno.
"""

import asyncio
import logging
from functools import partial

import brevo_python
from brevo_python.rest import ApiException
from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email(to_email: str, subject: str, html_body: str) -> bool:
    if not settings.BREVO_API_KEY:
        logger.warning(
            "[EMAIL] BREVO_API_KEY no configurada. Simulando envío a %s con asunto: %s",
            to_email, subject,
        )
        return True

    from_email = settings.SMTP_FROM_EMAIL or "noreply@upeavota.com"

    try:
        configuration = brevo_python.Configuration()
        configuration.api_key["api-key"] = settings.BREVO_API_KEY
        api_client = brevo_python.ApiClient(configuration)
        api_instance = brevo_python.TransactionalEmailsApi(api_client)

        send_email = brevo_python.SendSmtpEmail(
            sender={"email": from_email, "name": "UPEA Vota"},
            to=[{"email": to_email}],
            subject=subject,
            html_content=html_body,
        )

        loop = asyncio.get_running_loop()
        await loop.run_in_executor(
            None,
            partial(api_instance.send_transac_email, send_email),
        )

        logger.info("[EMAIL] Correo enviado vía Brevo a %s", to_email)
        return True

    except ApiException as e:
        logger.error(
            "[EMAIL] Brevo API error (%s): %s", e.status, e.body,
        )
        return False
    except Exception as e:
        logger.error("[EMAIL] Error inesperado al enviar correo: %s", e)
        return False
