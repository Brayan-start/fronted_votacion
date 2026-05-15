import base64
import numpy as np
import cv2

class FaceService:
    def __init__(self):
        # Aquí cargarías el modelo insightface en producción
        # self.model = ...
        pass

    def get_embedding(self, base64_image: str):
        """
        Genera un embedding de 128/512 dimensiones desde una imagen base64.
        Para el MVP, simularemos un embedding.
        """
        # Lógica real: 
        # 1. Decodificar base64 a imagen opencv
        # 2. Detectar rostro
        # 3. Extraer embedding
        return [0.0] * 128 # Simulación

    def verify(self, user_id: str, capture_base64: str) -> bool:
        """
        Compara el rostro capturado con el embedding guardado del usuario.
        """
        # 1. Obtener embedding guardado de la tabla face_embeddings
        # 2. Generar embedding de la captura actual
        # 3. Calcular distancia coseno
        return True # Simulación para el MVP

face_service = FaceService()
