import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { CameraModal } from '../../components/ui/CameraModal';
import { useToast } from '../../context/ToastContext';
import { electionService } from '../../services/electionService';
import { candidateService } from '../../services/candidateService';
import { voteService } from '../../services/voteService';
import { Election, Category, Candidate } from '../../types';
import { 
  CheckCircle2, Camera, ShieldCheck, AlertTriangle, Loader2, RefreshCcw,
  AlertCircle, FileText, PlayCircle, Check, UserCheck, Info, UserX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Vote: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [election, setElection] = useState<Election | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVoting, setIsSavingVote] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isBiometricErrorModalOpen, setIsBiometricErrorModalOpen] = useState(false);
  const [isAlreadyVotedModalOpen, setIsAlreadyVotedModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || id === "undefined") {
        setError("Enlace de votación inválido.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const elect = await electionService.getById(id);
        
        if (!elect) {
          setError("No se encontró la información de la elección.");
          setLoading(false);
          return;
        }

        const now = new Date();
        const startDate = new Date(elect.start_date);
        const endDate = new Date(elect.end_date);

        if (elect.status !== 'active') {
          setError("La elección no está activa.");
          setLoading(false);
          return;
        }

        if (now < startDate) {
          setError("La elección aún no ha comenzado.");
          setLoading(false);
          return;
        }

        if (now > endDate) {
          setError("La elección ya finalizó.");
          setLoading(false);
          return;
        }
        
        setElection(elect);
        
        const cats = await electionService.getCategories(id);
        if (!cats || cats.length === 0) {
          setError("Esta elección no tiene categorías configuradas.");
          setLoading(false);
          return;
        }

        setCategories(cats);
        const cands = await candidateService.getByCategory(cats[0].id);
        setCandidates(cands);
        
      } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } } };
        const detail = error.response?.data?.detail || "";
        if (detail.toLowerCase().includes("ya has emitido") || detail.toLowerCase().includes("voto registrado")) {
            setIsAlreadyVotedModalOpen(true);
        } else {
            setError("No se pudo cargar la información de la elección.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const loadCandidates = async (categoryId: string) => {
    try {
      setLoading(true);
      const cands = await candidateService.getByCategory(categoryId);
      setCandidates(cands);
    } catch {
      setError("No se pudieron cargar los candidatos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidate(candidateId);
  };

  const openBiometry = () => {
    setVerificationError(null);
    setIsCameraModalOpen(true);
  };

  const handleVerifyIdentity = async (image: string) => {
    if (!image || !election || !categories.length || !selectedCandidate) return;

    setIsVerifying(true);
    setVerificationError(null);
    
    try {
      const currentCategory = categories[currentCategoryIndex];
      await voteService.verifyFace({
        election_id: election.id,
        category_id: currentCategory.id,
        candidate_id: selectedCandidate,
        face_capture_base64: image
      });
      
      setCapturedImage(image);
      setIsCameraModalOpen(false);
      setIsConfirmModalOpen(true);

    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { detail?: string } } };
      const status = error.response?.status;
      const detail = error.response?.data?.detail || "";
      
      if (detail.toLowerCase().includes("ya has emitido")) {
          setIsCameraModalOpen(false);
          setIsAlreadyVotedModalOpen(true);
      } else if (status === 401 && (detail.toLowerCase().includes('facial') || detail.toLowerCase().includes('rostro'))) {
        setVerificationError("Identidad no confirmada. El rostro no coincide.");
        showToast('error', 'Verificación fallida', 'El rostro capturado no coincide con nuestros registros.');
      } else {
        setVerificationError(detail || "Error en la verificación.");
        showToast('error', 'Error de verificación', detail || 'Ocurrió un error al verificar la identidad.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFinalVote = async () => {
    if (!capturedImage || !election || !categories.length || !selectedCandidate) return;
    
    setIsSavingVote(true);
    try {
      const currentCategory = categories[currentCategoryIndex];
      await voteService.castVote({
        election_id: election.id,
        category_id: currentCategory.id,
        candidate_id: selectedCandidate,
        face_capture_base64: capturedImage
      });
      
      setIsConfirmModalOpen(false);
      showToast('success', 'Voto registrado', 'Tu voto ha sido emitido correctamente.');
      
      if (currentCategoryIndex < categories.length - 1) {
        setStep(2); 
      } else {
        setStep(3); 
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      const detail = error.response?.data?.detail || "";
      if (detail.toLowerCase().includes("ya has emitido")) {
          setIsConfirmModalOpen(false);
          setIsAlreadyVotedModalOpen(true);
      } else {
          showToast('error', 'Error al votar', detail || 'Error al registrar el voto.');
          setIsConfirmModalOpen(false);
      }
    } finally {
      setIsSavingVote(false);
    }
  };

  const nextCategory = async () => {
    const nextIndex = currentCategoryIndex + 1;
    if (nextIndex < categories.length) {
      setCurrentCategoryIndex(nextIndex);
      setSelectedCandidate(null);
      setCapturedImage(null);
      setStep(1);
      await loadCandidates(categories[nextIndex].id);
    }
  };

  const getSafeEmbedUrl = (url: string) => {
    if (!url) return null;
    const ytRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const ytMatch = url.match(ytRegex);
    if (ytMatch && ytMatch[2].length === 11) return `https://www.youtube.com/embed/${ytMatch[2]}`;
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };

  const handleViewProposal = (candidate: Candidate) => {
    setViewingCandidate(candidate);
    setIsProposalModalOpen(true);
  };

  const handleViewVideo = (candidate: Candidate) => {
    setViewingCandidate(candidate);
    setIsVideoModalOpen(true);
  };

  if (loading && step === 1 && candidates.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-indigo-400" size={48} />
      <p className="text-[var(--text-secondary)] font-medium animate-pulse">Preparando boleta...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto text-center py-20 bg-[var(--bg-secondary)]/60 backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 border border-[var(--border-color)]">
      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle className="text-red-400" size={40} /></div>
      <h2 className="text-2xl font-black text-[var(--text-primary)] mb-4">{error}</h2>
      <Button size="full" onClick={() => navigate('/student/dashboard')} className="rounded-2xl py-4">Volver</Button>
    </div>
  );

  const currentCategory = categories[currentCategoryIndex];
  const currentCandidate = candidates.find(c => c.id === selectedCandidate);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between px-6 sm:px-12 py-6 bg-[var(--bg-secondary)]/50 backdrop-blur-md rounded-2xl border border-[var(--border-color)] shadow-xl">
        {[
          { step: 1, label: 'Selección' },
          { step: 2, label: 'Finalizado' }
        ].map((s) => {
          const isFinal = step === 3;
          const isActive = (step === s.step) || (step > s.step && s.step < 2) || (s.step === 2 && isFinal);
          return (
            <div key={s.step} className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black transition-all duration-500 ${isActive ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/40 scale-110' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'}`}>
                {((step > s.step && s.step < 2) || (s.step === 2 && isFinal)) ? <CheckCircle2 size={24} /> : s.step}
              </div>
              <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-indigo-400' : 'text-[var(--text-tertiary)]'}`}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tight">{election?.title}</h2>
            <div className="flex items-center justify-center gap-3">
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">{currentCategory?.name}</span>
              {categories.length > 1 && <span className="text-[var(--text-tertiary)] text-sm font-bold">Paso {currentCategoryIndex + 1} de {categories.length}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-[var(--bg-secondary)]/50 rounded-[2.5rem] h-64 animate-pulse border border-[var(--border-color)] shadow-xl overflow-hidden flex flex-col">
                  <div className="aspect-[16/10] bg-[var(--bg-tertiary)]" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-[var(--bg-tertiary)] rounded-lg w-3/4" />
                    <div className="h-4 bg-[var(--bg-tertiary)] rounded-lg w-full" />
                    <div className="h-10 bg-[var(--bg-tertiary)] rounded-xl w-full mt-2" />
                  </div>
                </div>
              ))
            ) : candidates.length > 0 ? (
              candidates.map((candidate) => (
                <motion.div 
                  whileHover={{ scale: 1.01 }} 
                  key={candidate.id}
                  className={`relative flex flex-col rounded-[2.5rem] border-4 transition-all duration-300 overflow-hidden ${selectedCandidate === candidate.id ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_20px_50px_rgba(79,70,229,0.3)]' : 'border-[var(--border-color)] bg-[var(--bg-secondary)]/50 shadow-xl'}`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden group">
                    <img src={candidate.photo_url || "https://via.placeholder.com/400x250?text=Candidato"} alt={candidate.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                    {selectedCandidate === candidate.id && (
                      <div className="absolute top-4 right-4 w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-[var(--bg-primary)] z-10"><Check size={28} strokeWidth={4} /></div>
                    )}
                    <div className="absolute bottom-4 left-6 right-6"><h4 className="text-2xl font-black text-white leading-tight drop-shadow-lg">{candidate.name}</h4></div>
                  </div>

                  <div className="p-6 flex flex-col flex-1 space-y-4">
                    <p className="text-sm text-[var(--text-tertiary)] font-medium line-clamp-2 italic">"{candidate.description}"</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleViewProposal(candidate)} className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-[var(--border-color)]"><FileText size={16} /> Propuesta</button>
                      {candidate.video_url && (
                        <button onClick={() => handleViewVideo(candidate)} className="flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-rose-500/20"><PlayCircle size={16} /> Ver Video</button>
                      )}
                    </div>
                    <Button 
                      variant={selectedCandidate === candidate.id ? 'primary' : 'outline'} 
                      size="full" 
                      onClick={() => handleSelectCandidate(candidate.id)}
                      className={`rounded-2xl py-4 font-black uppercase tracking-[0.1em] text-sm ${selectedCandidate === candidate.id ? '' : 'border-[var(--border-color)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-indigo-500'}`}
                    >
                      {selectedCandidate === candidate.id ? 'Seleccionado' : 'Seleccionar Candidato'}
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-[var(--bg-secondary)]/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-[var(--border-color)]">
                <div className="w-24 h-24 bg-[var(--bg-tertiary)] rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-[var(--text-tertiary)]">
                  <UserX size={48} />
                </div>
                <h3 className="text-2xl font-black text-[var(--text-primary)]">No hay candidatos disponibles</h3>
                <p className="text-[var(--text-tertiary)] font-medium mt-2">Espere a que el administrador registre candidatos para esta categoría.</p>
                <Button variant="outline" onClick={() => navigate('/student/dashboard')} className="mt-8 border-[var(--border-color)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                  Regresar al Panel
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center mt-12">
            <Button 
              size="lg" 
              disabled={!selectedCandidate || loading} 
              onClick={openBiometry}
              className={`px-16 py-8 rounded-[2rem] text-xl font-black shadow-2xl transition-all duration-300 min-w-[300px] ${selectedCandidate ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:scale-105 hover:shadow-indigo-500/50' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-[var(--border-color)] cursor-not-allowed opacity-50'}`}
            >
              Ejercer Voto <Camera size={24} className="ml-3" />
            </Button>
            <p className="text-[var(--text-tertiary)] text-xs font-bold uppercase tracking-widest mt-4">Inicia validación facial para continuar</p>
          </div>
        </div>
      )}

      {(step === 2 || step === 3) && (
        <div className="max-w-md mx-auto text-center space-y-10 animate-in zoom-in duration-500 py-12">
          <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-blue-500 text-white rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/40 border-8 border-[var(--bg-primary)]"><CheckCircle2 size={72} /></div>
          <div>
            <h2 className="text-5xl font-black text-[var(--text-primary)] tracking-tight">{step === 3 ? '¡Logrado!' : '¡Registrado!'}</h2>
            <p className="text-[var(--text-secondary)] mt-4 font-medium text-lg px-4">Voto para <span className="text-white">{currentCategory?.name}</span> procesado.</p>
          </div>
          <div className="pt-6">
            {step === 2 ? (
              <Button size="full" onClick={nextCategory} className="rounded-3xl py-7 text-xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-2xl">Siguiente Categoría <RefreshCcw size={24} className="ml-3" /></Button>
            ) : (
              <Button size="full" onClick={() => navigate('/student/dashboard')} className="rounded-3xl py-7 text-xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-2xl">Finalizar Votación</Button>
            )}
          </div>
        </div>
      )}

      {/* MODALS */}
      <CameraModal 
        isOpen={isCameraModalOpen} 
        onClose={() => setIsCameraModalOpen(false)} 
        onCapture={handleVerifyIdentity} 
        isVerifying={isVerifying} 
        error={verificationError}
        mode="verify"
        title={`Validación para ${currentCategory?.name}`}
      />

      <Modal isOpen={isProposalModalOpen} onClose={() => setIsProposalModalOpen(false)} title="Propuesta Electoral">
        {viewingCandidate && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-[var(--border-color)] pb-6">
              <img src={viewingCandidate.photo_url || "https://via.placeholder.com/100"} className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-[var(--border-color)]" />
              <div>
                <h3 className="text-xl font-black text-[var(--text-primary)]">{viewingCandidate.name}</h3>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md uppercase tracking-wider border border-indigo-500/20">{currentCategory?.name}</span>
              </div>
            </div>
            <div className="bg-[var(--bg-tertiary)]/50 p-6 rounded-[2rem] border border-[var(--border-color)]">
              <p className="text-[var(--text-secondary)] leading-relaxed font-medium">{viewingCandidate.description}</p>
            </div>
            <Button size="full" onClick={() => setIsProposalModalOpen(false)} className="rounded-2xl py-4 font-black">Entendido</Button>
          </div>
        )}
      </Modal>

      <Modal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} title="Video Presentación" size="lg">
        {viewingCandidate?.video_url && (
          <div className="space-y-6">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border-2 border-[var(--border-color)]">
              <iframe src={getSafeEmbedUrl(viewingCandidate.video_url) || ''} className="w-full h-full" allowFullScreen />
            </div>
            <Button size="full" onClick={() => setIsVideoModalOpen(false)} className="rounded-2xl py-4 font-black">Cerrar Video</Button>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => { setIsConfirmModalOpen(false); setCapturedImage(null); }}
        onConfirm={handleFinalVote}
        loading={isVoting}
        title="Confirmación de Identidad"
        message={`Identidad verificada con éxito. ¿Estás seguro de emitir tu voto por ${currentCandidate?.name}? Esta acción no se puede deshacer.`}
        confirmText="Sí, emitir voto"
        cancelText="Cancelar"
        variant="primary"
      />

      <ConfirmModal
        isOpen={isBiometricErrorModalOpen}
        onClose={() => setIsBiometricErrorModalOpen(false)}
        onConfirm={openBiometry}
        title="Falla de Identidad"
        message="Tu rostro no coincide con nuestro registro oficial."
        confirmText="Reintentar"
        cancelText="Cancelar"
        variant="primary"
      />

      <Modal isOpen={isAlreadyVotedModalOpen} onClose={() => navigate('/student/dashboard')} title="">
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
          <div className="w-24 h-24 bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-lg">
            <Info size={56} />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-[var(--text-primary)] leading-tight">Participación Registrada</h3>
            <p className="text-[var(--text-secondary)] font-medium px-4">Detectamos que ya has emitido tu voto para esta categoría en la elección actual.</p>
          </div>
          <div className="bg-[var(--bg-tertiary)]/50 p-4 rounded-2xl border border-[var(--border-color)] w-full">
            <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-widest">Sistema UPEA Vota • Integridad Garantizada</p>
          </div>
          <Button size="full" onClick={() => navigate('/student/dashboard')} className="py-5 rounded-2xl font-black">
            Entendido, volver al inicio
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Vote;
