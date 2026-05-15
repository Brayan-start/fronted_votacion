import React, { useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, ShieldCheck, AlertCircle, Loader2, CheckCircle2, UserCheck, UserX } from 'lucide-react';
import { Button } from './Button';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (image: string) => void;
  title?: string;
  isVerifying?: boolean;
  error?: string | null;
  mode?: 'capture' | 'verify';
}

export const CameraModal: React.FC<CameraModalProps> = ({ 
  isOpen, 
  onClose, 
  onCapture, 
  title = "Validación Biométrica",
  isVerifying = false,
  error = null,
  mode = 'capture'
}) => {
  const webcamRef = React.useRef<Webcam>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  
  // Simulated face detection for UI feedback
  useEffect(() => {
    let interval: any;
    if (isCameraReady && isOpen) {
      interval = setInterval(() => {
        // Randomly simulate detection for UX feel (real detection happens on backend)
        setFaceDetected(prev => Math.random() > 0.1); 
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isCameraReady, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsCameraReady(false);
      setFaceDetected(false);
    }
  }, [isOpen]);

  const handleAction = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 bg-slate-950/95 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-5xl h-full sm:h-auto sm:aspect-video bg-slate-900 sm:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 overflow-hidden flex flex-col"
      >
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-6 sm:p-10 flex items-center justify-between z-20 bg-gradient-to-b from-slate-950/80 to-transparent">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Camera size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight leading-none">{title}</h3>
              <div className="mt-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className={`text-xs font-black uppercase tracking-[0.2em] ${faceDetected ? 'text-green-400' : 'text-red-400'}`}>
                  {faceDetected ? 'Rostro Detectado' : 'No se detecta rostro'}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-4 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <X size={28} />
          </button>
        </div>

        {/* Camera Center */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {/* Animated Biometric Frame */}
          <div className={`absolute inset-0 z-10 transition-all duration-700 pointer-events-none border-[60px] sm:border-[100px] border-slate-950/60`}>
             <div className={`w-full h-full border-4 rounded-[4rem] sm:rounded-[6rem] transition-colors duration-500 flex items-center justify-center ${
               faceDetected ? 'border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.2)]' : 'border-red-500/30'
             }`}>
                {/* Scanning Animation */}
                <AnimatePresence>
                  {isCameraReady && faceDetected && !isVerifying && (
                    <motion.div 
                      initial={{ top: '20%' }}
                      animate={{ top: '80%' }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                      className="absolute left-10 right-10 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_15px_rgba(34,197,94,0.8)] z-20"
                    />
                  )}
                </AnimatePresence>
             </div>
          </div>

          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            onUserMedia={() => setIsCameraReady(true)}
            className="w-full h-full object-cover"
            videoConstraints={{
              width: 1920,
              height: 1080,
              facingMode: "user"
            }}
          />

          {/* Verification Loading Overlay */}
          <AnimatePresence>
            {isVerifying && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-indigo-950/80 backdrop-blur-md z-40 flex flex-col items-center justify-center text-white"
              >
                <div className="w-32 h-32 relative flex items-center justify-center">
                   <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                   <div className="absolute inset-0 border-4 border-indigo-400 rounded-full border-t-transparent animate-spin" />
                   <ShieldCheck size={48} className="animate-pulse" />
                </div>
                <h4 className="mt-8 text-2xl font-black uppercase tracking-[0.4em] italic">Analizando Perfil</h4>
                <p className="mt-2 text-indigo-300 font-bold animate-pulse uppercase text-xs tracking-widest">Validando identidad universitaria...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 z-20 bg-gradient-to-t from-slate-950/90 to-transparent flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="hidden sm:flex items-center gap-4 text-white/40">
             <ShieldCheck size={20} className="text-indigo-400" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em]">Protocolo Biométrico Seguro v2.0</p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isVerifying}
              className="flex-1 sm:flex-none py-5 px-10 rounded-2xl border-white/10 text-white/60 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-xs"
            >
              Cancelar
            </Button>
            
            <Button 
              onClick={handleAction}
              disabled={!isCameraReady || isVerifying}
              className={`flex-[2] sm:flex-none py-6 px-16 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all active:scale-95
                ${faceDetected 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20' 
                  : 'bg-slate-800 text-white/30 border border-white/5'}
              `}
            >
              {mode === 'capture' ? (
                <><CheckCircle2 size={24} className="mr-3" /> Capturar Rostro</>
              ) : (
                <><UserCheck size={24} className="mr-3" /> Verificar Identidad</>
              )}
            </Button>
          </div>
        </div>

        {/* Corner Decorations */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-white/10 pointer-events-none rounded-tl-3xl" />
        <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-white/10 pointer-events-none rounded-tr-3xl" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-white/10 pointer-events-none rounded-bl-3xl" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-white/10 pointer-events-none rounded-br-3xl" />

        {/* Error Toast inside Modal */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6"
            >
              <div className="bg-red-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-red-400">
                <AlertCircle size={24} className="shrink-0" />
                <p className="text-xs font-black uppercase tracking-wider">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
