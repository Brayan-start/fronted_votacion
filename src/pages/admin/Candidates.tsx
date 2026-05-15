import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { electionService } from '../../services/electionService';
import { candidateService } from '../../services/candidateService';
import { Plus, Edit, Trash2, Video, CheckCircle2, AlertCircle, RefreshCcw, ExternalLink, Loader2 } from 'lucide-react';
import { Candidate, Category } from '../../types';

// Helper function to extract YouTube ID
const getYouTubeID = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<Partial<Candidate> | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchData = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const [allCategories, allCandidates] = await Promise.all([
        electionService.getAllCategories(),
        candidateService.getAll()
      ]);
      setCategories(allCategories);
      setCandidates(allCandidates);
    } catch (err: any) {
      console.error(err);
      setError('Error al cargar datos de candidatos');
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = async (candidateObj?: Candidate) => {
    setLocalPreview(null);
    setUploadError(null);
    
    if (candidateObj) {
      setCurrentCandidate({ ...candidateObj });
    } else {
      const defaultCategoryId = categories.length > 0 ? categories[0].id : '';
      setCurrentCandidate({ 
        name: '', 
        description: '', 
        photo_url: '', 
        category_id: defaultCategoryId 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!currentCandidate?.name || !currentCandidate?.category_id) return;

    setIsSaving(true);
    setUploadError(null);
    console.log("[UPLOAD START] Guardando candidato y procesando imagen...");

    try {
      if (currentCandidate.id) {
        await candidateService.update(currentCandidate.id, currentCandidate);
      } else {
        await candidateService.create(currentCandidate);
      }

      console.log("[UPLOAD SUCCESS] Candidato guardado correctamente");
      setIsModalOpen(false);
      setLocalPreview(null);
      await fetchData(true);
      
      setIsSuccessModalOpen(true);
      setTimeout(() => setIsSuccessModalOpen(false), 2000);
    } catch (err: any) {
      console.error("[UPLOAD ERROR]", err);
      const msg = err.response?.data?.detail || 'Error al conectar con el servidor';
      setUploadError(msg);
      // Mantenemos el modal abierto y la preview local para reintento
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadError(null);
      // 1. Vista previa inmediata
      const objectUrl = URL.createObjectURL(file);
      setLocalPreview(objectUrl);

      // 2. Convertir a base64 para envío (el backend se encargará del Storage)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCurrentCandidate(prev => ({ 
          ...prev!, 
          photo_base64: base64String, 
          photo_url: '' // Limpiamos URL externa para priorizar archivo
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const handleDeleteClick = (id: string) => {
    setCandidateToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (candidateToDelete) {
      try {
        await candidateService.delete(candidateToDelete);
        await fetchData(true);
        setIsDeleteModalOpen(false);
        setCandidateToDelete(null); 
      } catch (err) {
        alert('Error al eliminar candidato');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm">Candidatos UPEA</h1>
          <p className="text-slate-300 font-medium">Gestión de perfiles y propuestas.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus size={20} /> Nuevo Candidato
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="aspect-video bg-white/10 animate-pulse rounded-2xl h-64"></div>)}
        </div>
      ) : error ? (
        <div className="p-10 text-center bg-white/10 rounded-2xl border border-dashed border-white/20">
          <AlertCircle className="mx-auto text-red-400 mb-2" size={32} />
          <p className="text-white font-medium">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => fetchData()} className="mt-4">
            <RefreshCcw size={14} className="mr-2" /> Reintentar
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {candidates.map((candidate) => {
            const category = categories.find(c => c.id === candidate.category_id);
            return (
              <Card key={candidate.id} className="overflow-hidden group hover:shadow-xl transition-all border-none bg-white shadow-md flex flex-col h-full">
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img 
                    src={candidate.photo_url || 'https://via.placeholder.com/400x300?text=Sin+Foto'} 
                    alt={candidate.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => handleOpenModal(candidate)} className="p-2.5 bg-white/95 text-blue-600 rounded-xl shadow-xl hover:bg-white"><Edit size={18} /></button>
                    <button onClick={() => handleDeleteClick(candidate.id)} className="p-2.5 bg-white/95 text-red-600 rounded-xl shadow-xl hover:bg-white"><Trash2 size={18} /></button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] uppercase font-black bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-lg tracking-widest">{category?.name || 'Candidato'}</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-black text-xl text-slate-900 leading-tight mb-1">{candidate.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mt-2 italic">"{candidate.description}"</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        title={currentCandidate?.id ? 'Editar Perfil' : 'Nuevo Candidato'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" loading={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Candidato'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto px-1 custom-scrollbar">
          <Input label="Nombre Completo" value={currentCandidate?.name} onChange={(e) => setCurrentCandidate({ ...currentCandidate!, name: e.target.value })} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Categoría</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none" value={currentCandidate?.category_id} onChange={(e) => setCurrentCandidate({ ...currentCandidate!, category_id: e.target.value })}>
              <option value="" disabled>Seleccione una categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Resumen</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} value={currentCandidate?.description} onChange={(e) => setCurrentCandidate({ ...currentCandidate!, description: e.target.value })} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Imagen</label>
            <div className="flex flex-col gap-3">
              {localPreview || currentCandidate?.photo_url ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border bg-slate-50">
                  <img src={localPreview || currentCandidate?.photo_url} className="w-full h-full object-contain" alt="Preview" />
                  {!isSaving && (
                    <button onClick={() => { setLocalPreview(null); setCurrentCandidate({ ...currentCandidate!, photo_base64: undefined, photo_url: '' }); }} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700"><Trash2 size={16} /></button>
                  )}
                  {localPreview && <div className="absolute bottom-2 left-2 px-3 py-1 bg-blue-600/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase">Imagen local lista</div>}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-slate-100 cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="candidate-photo" />
                  <label htmlFor="candidate-photo" className="cursor-pointer flex flex-col items-center">
                    <Plus className="text-blue-600 mb-2" />
                    <span className="text-sm font-bold text-gray-700">Subir Imagen</span>
                    <span className="text-xs text-gray-500 mt-1">JPG, PNG hasta 2MB</span>
                  </label>
                </div>
              )}
              <Input label="O URL externa" placeholder="https://..." value={currentCandidate?.photo_url} onChange={(e) => { setLocalPreview(null); setCurrentCandidate({ ...currentCandidate!, photo_url: e.target.value, photo_base64: undefined }); }} />
            </div>
          </div>

          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold animate-in slide-in-from-top-2">
              <AlertCircle size={16} /> {uploadError}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Eliminar Candidato" message="¿Estás seguro? Esta acción es irreversible." confirmText="Sí, eliminar" variant="danger" />
      
      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title="">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <CheckCircle2 className="text-green-600 mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-900">¡Acción Completada!</h3>
        </div>
      </Modal>
    </div>
  );
};

export default Candidates;
