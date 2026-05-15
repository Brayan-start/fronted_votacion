import { useState, useCallback, useRef } from 'react';
import Webcam from 'react-webcam';

export const useWebcam = () => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const openCamera = useCallback(() => {
    setIsCameraOpen(true);
    setError(null);
  }, []);

  const closeCamera = useCallback(() => {
    setIsCameraOpen(false);
    if (webcamRef.current && webcamRef.current.video) {
      const stream = webcamRef.current.video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, []);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setIsCameraOpen(false);
        return imageSrc;
      }
    }
    return null;
  }, [webcamRef]);

  const resetCapture = useCallback(() => {
    setCapturedImage(null);
    setIsCameraOpen(true);
  }, []);

  const onUserMediaError = useCallback((err: string | DOMException) => {
    console.error("Webcam Error:", err);
    setError("No se pudo acceder a la cámara. Por favor verifica los permisos.");
    setIsCameraOpen(false);
  }, []);

  return {
    webcamRef,
    isCameraOpen,
    capturedImage,
    error,
    openCamera,
    closeCamera,
    capture,
    resetCapture,
    onUserMediaError,
    setCapturedImage
  };
};
