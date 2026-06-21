import cv2
import face_recognition
import numpy as np
import io
import logging
from typing import List
from PIL import Image, ImageOps
from app.services.biometric.base import BiometricProvider

logger = logging.getLogger(__name__)

class DlibBiometricProvider(BiometricProvider):
    def __init__(self):
        self._model_loaded = False

    def _ensure_model_ready(self):
        if not self._model_loaded:
            logger.info("Lazy Loading: dlib/face_recognition models ready for use.")
            self._model_loaded = True

    def _add_top_padding(self, img: Image.Image, padding_ratio: float = 0.2) -> Image.Image:
        w, h = img.size
        pad_h = int(h * padding_ratio)
        new_h = h + pad_h
        padded = Image.new("RGB", (w, new_h), (128, 128, 128))
        padded.paste(img, (0, pad_h))
        return padded

    def _try_encoding(self, image: np.ndarray, label: str) -> List[float]:
        face_locs = face_recognition.face_locations(image, model="hog")
        logger.info(f"[{label}] face_locations encontradas: {len(face_locs)}")
        if not face_locs:
            return []
        encodings = face_recognition.face_encodings(image, known_face_locations=face_locs, model="hog")
        if encodings:
            logger.info(f"Rostro detectado con {label}")
            return encodings[0].tolist()
        return []

    def get_embedding(self, image_bytes: bytes) -> List[float]:
        self._ensure_model_ready()
        try:
            pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            logger.info(f"Imagen recibida: tamaño={pil_img.size}, modo={pil_img.mode}, bytes={len(image_bytes)}")

            # Redimensionar si supera 800px de ancho
            if pil_img.width > 800:
                ratio = 800.0 / pil_img.width
                new_h = int(pil_img.height * ratio)
                pil_img = pil_img.resize((800, new_h), Image.Resampling.LANCZOS)

            # 1er intento: con padding superior 20%
            padded = self._add_top_padding(pil_img, 0.2)
            padded_np = np.array(padded)
            result = self._try_encoding(padded_np, "HOG + padding superior")
            if result:
                return result

            # 2do intento: sin padding
            raw_np = np.array(pil_img)
            result = self._try_encoding(raw_np, "HOG sin padding")
            if result:
                return result

            # 3er intento: ecualización de histograma + upsampling
            try:
                gray = cv2.cvtColor(raw_np, cv2.COLOR_RGB2GRAY)
                eq_gray = cv2.equalizeHist(gray)
                eq_rgb = cv2.cvtColor(eq_gray, cv2.COLOR_GRAY2RGB)

                face_locs = face_recognition.face_locations(
                    eq_rgb, number_of_times_to_upsample=1, model="hog"
                )
                logger.info(f"[ecualización + upsampling] face_locations encontradas: {len(face_locs)}")
                if face_locs:
                    encodings = face_recognition.face_encodings(
                        eq_rgb, known_face_locations=face_locs, num_upsampling=1
                    )
                    if encodings:
                        logger.info("Rostro detectado con ecualización + upsampling")
                        return encodings[0].tolist()
            except Exception as e2:
                logger.warning(f"Intento con ecualización falló: {e2}")

            logger.warning("No se detectó rostro en la imagen (3 intentos agotados)")
            return []

        except Exception as e:
            logger.error(f"Error extrayendo embedding: {e}")
            return []

    def compare_faces(self, known_embedding: List[float], image_to_check_bytes: bytes, threshold: float) -> bool:
        self._ensure_model_ready()
        try:
            # 1. Obtener encoding de la captura actual
            current_encoding = self.get_embedding(image_to_check_bytes)
            if not current_encoding:
                logger.warning("No se detectó rostro en la captura actual")
                return False

            # 2. Comparar usando distancia euclidiana (face_recognition.face_distance)
            known_enc = np.array(known_embedding)
            current_enc = np.array(current_encoding)
            
            distance = face_recognition.face_distance([known_enc], current_enc)[0]
            logger.info(f"Biometría: Distancia calculada = {distance:.4f} (Threshold: {threshold})")
            
            return distance <= threshold
        except Exception as e:
            logger.error(f"Error en comparación biométrica: {e}")
            return False
