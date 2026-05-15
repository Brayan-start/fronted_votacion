import base64
import os
import uuid
import logging
from app.db.supabase import supabase_admin

logger = logging.getLogger(__name__)

def ensure_bucket_exists(bucket_name: str):
    """
    Verifica si el bucket existe en Supabase Storage, si no, intenta crearlo.
    """
    try:
        logger.info(f"[BUCKET CHECK] Verificando existencia del bucket: {bucket_name}")
        buckets = supabase_admin.storage.list_buckets()
        exists = any(b.name == bucket_name for b in buckets)
        
        if not exists:
            logger.warning(f"[BUCKET CHECK] El bucket '{bucket_name}' no existe. Intentando crear...")
            supabase_admin.storage.create_bucket(bucket_name, options={"public": True})
            logger.info(f"[BUCKET CHECK] Bucket '{bucket_name}' creado con éxito (Público)")
        else:
            logger.info(f"[BUCKET CHECK] El bucket '{bucket_name}' ya existe.")
            
    except Exception as e:
        logger.error(f"[BUCKET CHECK] Error al gestionar el bucket '{bucket_name}': {e}")
        # No relanzamos aquí para no bloquear el inicio si hay un error de permisos listando buckets,
        # pero el upload fallará después si realmente no existe.

def upload_base64_image(base64_str: str, bucket: str, path: str) -> str:
    """
    Sube una imagen base64 a un bucket de Supabase y retorna la URL pública.
    """
    logger.info(f"[UPLOAD START] Iniciando subida de imagen a bucket: {bucket}, path: {path}")
    
    try:
        # Asegurar que el bucket existe antes de subir
        ensure_bucket_exists(bucket)

        # Limpiar prefijo base64 si existe (data:image/jpeg;base64,...)
        if "base64," in base64_str:
            base64_str = base64_str.split("base64,")[1]
        
        image_data = base64.b64decode(base64_str)
        
        # Subir archivo
        # Usamos update=True por si acaso ya existe (aunque usamos UUIDs únicos)
        response = supabase_admin.storage.from_(bucket).upload(
            path=path,
            file=image_data,
            file_options={"content-type": "image/jpeg", "cache-control": "3600"}
        )
        
        if hasattr(response, 'error') and response.error:
            logger.error(f"[UPLOAD ERROR] Error de Supabase: {response.error}")
            return None

        # Obtener URL pública
        url_res = supabase_admin.storage.from_(bucket).get_public_url(path)
        
        public_url = ""
        if hasattr(url_res, 'public_url'):
            public_url = url_res.public_url
        elif isinstance(url_res, dict):
            public_url = url_res.get("publicURL") or url_res.get("public_url")
        else:
            public_url = str(url_res)

        if public_url:
            logger.info(f"[UPLOAD SUCCESS] Imagen subida correctamente: {public_url}")
            return public_url
        
        return None

    except Exception as e:
        logger.error(f"[UPLOAD ERROR] Excepción crítica al subir imagen: {e}")
        return None
