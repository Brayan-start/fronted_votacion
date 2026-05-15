import face_recognition
import numpy as np
import io
import logging
from typing import List
from app.services.biometric.base import BiometricProvider

logger = logging.getLogger(__name__)

class DlibBiometricProvider(BiometricProvider):
    def __init__(self):
        self._model_loaded = False
        # No cargamos nada en el init para Lazy Loading real

    def _ensure_model_ready(self):
        if not self._model_loaded:
            logger.info("Lazy Loading: dlib/face_recognition models ready for use.")
            self._model_loaded = True

    def get_embedding(self, image_bytes: bytes) -> List[float]:
        self._ensure_model_ready()
        try:
            image = face_recognition.load_image_file(io.BytesIO(image_bytes))
            # Usamos model="hog" para ser más livianos en CPU/RAM
            encodings = face_recognition.face_encodings(image, model="hog")
            
            if not encodings:
                return []
            
            return encodings[0].tolist()
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
