from abc import ABC, abstractmethod
from typing import List, Optional

class BiometricProvider(ABC):
    @abstractmethod
    def get_embedding(self, image_bytes: bytes) -> List[float]:
        """Extrae el embedding facial de una imagen."""
        pass

    @abstractmethod
    def compare_faces(self, known_embedding: List[float], image_to_check_bytes: bytes, threshold: float) -> bool:
        """Compara un rostro capturado contra un embedding guardado."""
        pass
