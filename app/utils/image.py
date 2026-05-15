import base64
import io
import sys
from PIL import Image

def process_base64_image(base64_str: str, max_size: tuple = (640, 480)) -> bytes:
    """
    Decodifica, valida y optimiza una imagen base64 para biometría.
    """
    # 1. Validar tamaño del string (aproximación de bytes)
    size_in_bytes = (len(base64_str) * 3) / 4
    if size_in_bytes > 5 * 1024 * 1024: # 5MB limit para el payload total
        raise ValueError("La imagen excede el tamaño máximo permitido")

    if "base64," in base64_str:
        base64_str = base64_str.split("base64,")[1]
    
    try:
        img_data = base64.b64decode(base64_str)
        img = Image.open(io.BytesIO(img_data))
        
        # Validar formato
        if img.format not in ["JPEG", "PNG", "MPO"]:
            raise ValueError(f"Formato {img.format} no soportado. Use JPG o PNG.")

        # Redimensionar para ahorrar RAM (Crítico en Render Free)
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        if img.mode != "RGB":
            img = img.convert("RGB")
            
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=75) # Bajamos un poco la calidad para más ahorro
        final_bytes = buffer.getvalue()
        
        # Limpieza explícita
        buffer.close()
        del img_data
        
        return final_bytes
    except Exception as e:
        raise ValueError(f"Error procesando imagen: {str(e)}")
