import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { electionService } from '../../services/electionService';
import { candidateService } from '../../services/candidateService';
import { Plus, Edit, Trash2, AlertCircle, RefreshCcw, ExternalLink, Video, Users } from 'lucide-react';
import { Candidate, Category } from '../../types';

const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<Partial<Candidate> | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { showToast } = useToast();

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
    } catch {
      setError('Error al cargar datos de candidatos');
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (candidateObj?: Candidate) => {
    setLocalPreview(null);
    setUploadError(null);
    if (candidateObj) {
      setCurrentCandidate({ ...candidateObj });
    } else {
      setCurrentCandidate({ name: '', description: '', photo_url: '', video_url: '', category_id: categories[0]?.id || '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!currentCandidate?.name || !currentCandidate?.category_id) return;
    setIsSaving(true);
    setUploadError(null);
    try {
      const payload = { ...currentCandidate };
      if (!payload.photo_url) payload.photo_url = undefined;
      if (!payload.video_url) payload.video_url = undefined;
      if (payload.id) {
        await candidateService.update(payload.id, payload);
        showToast('success', 'Candidato actualizado', 'Los cambios se guardaron correctamente.');
      } else {
        await candidateService.create(payload);
        showToast('success', 'Candidato creado', 'El candidato se registró exitosamente.');
      }
      setIsModalOpen(false);
      setLocalPreview(null);
      await fetchData(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      const msg = error.response?.data?.detail || 'Error al conectar con el servidor';
      setUploadError(msg);
      showToast('error', 'Error al guardar', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadError(null);
      const objectUrl = URL.createObjectURL(file);
      setLocalPreview(objectUrl);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCurrentCandidate(prev => ({ ...prev!, photo_base64: base64String, photo_url: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    return () => { if (localPreview) URL.revokeObjectURL(localPreview); };
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
        showToast('success', 'Eliminación exitosa', 'El candidato ha sido eliminado.');
        setIsDeleteModalOpen(false);
        setCandidateToDelete(null);
      } catch {
        showToast('error', 'Error al eliminar', 'No se pudo eliminar el candidato.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Candidatos</h1>
          <p className="text-[var(--text-secondary)] font-medium">Gestión de perfiles y propuestas.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus size={20} /> Nuevo Candidato
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="aspect-video bg-[var(--bg-tertiary)] animate-pulse rounded-2xl h-64"></div>)}
        </div>
      ) : error ? (
        <div className="p-10 text-center bg-[var(--bg-secondary)]/50 rounded-2xl border border-dashed border-[var(--border-color)]">
          <AlertCircle className="mx-auto text-red-400 mb-2" size={32} />
          <p className="text-[var(--text-secondary)] font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchData()} className="mt-4">
            <RefreshCcw size={14} className="mr-2" /> Reintentar
          </Button>
        </div>
      ) : candidates.length === 0 ? (
        <div className="p-16 text-center bg-[var(--bg-secondary)]/30 rounded-2xl border border-dashed border-[var(--border-color)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
            <Users size={32} className="text-[var(--text-tertiary)]" />
          </div>
          <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">No hay candidatos registrados</h3>
          <p className="text-sm text-[var(--text-tertiary)] font-medium max-w-md mx-auto">
            Aún no se han registrado candidatos en el sistema.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {candidates.map((candidate) => {
            const category = categories.find(c => c.id === candidate.category_id);
            return (
              <Card key={candidate.id} className="overflow-hidden group hover:shadow-xl transition-all border-[var(--border-color)] flex flex-col h-full">
                <div className="relative aspect-[4/3] bg-[var(--bg-tertiary)] overflow-hidden">
                  <img 
                    src={candidate.photo_url || 'https://via.placeholder.com/400x300?text=Sin+Foto'} 
                    alt={candidate.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => handleOpenModal(candidate)} className="p-2.5 bg-[var(--bg-card)] text-blue-400 rounded-xl shadow-xl hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)]"><Edit size={18} /></button>
                    <button onClick={() => handleDeleteClick(candidate.id)} className="p-2.5 bg-[var(--bg-card)] text-red-400 rounded-xl shadow-xl hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)]"><Trash2 size={18} /></button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] uppercase font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-lg tracking-widest">{category?.name || 'Candidato'}</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-black text-xl text-[var(--text-primary)] leading-tight mb-1">{candidate.name}</h3>
                  <p className="text-sm text-[var(--text-tertiary)] line-clamp-3 leading-relaxed mt-2 italic">"{candidate.description}"</p>
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
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleSave} loading={isSaving}>Guardar Candidato</Button>
          </>
        }
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto">
          <Input label="Nombre Completo" value={currentCandidate?.name || ''} onChange={(e) => setCurrentCandidate({ ...currentCandidate!, name: e.target.value })} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Categoría</label>
            <select className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[var(--text-primary)]" value={currentCandidate?.category_id || ''} onChange={(e) => setCurrentCandidate({ ...currentCandidate!, category_id: e.target.value })}>
              <option value="" disabled>Seleccione una categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Resumen</label>
            <textarea className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[var(--text-primary)]" rows={3} value={currentCandidate?.description || ''} onChange={(e) => setCurrentCandidate({ ...currentCandidate!, description: e.target.value })} />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Imagen</label>
            <div className="flex flex-col gap-3">
              {localPreview || currentCandidate?.photo_url ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-tertiary)]">
                  <img src={localPreview || currentCandidate?.photo_url} className="w-full h-full object-contain" alt="Preview" />
                  {!isSaving && (
                    <button onClick={() => { setLocalPreview(null); setCurrentCandidate({ ...currentCandidate!, photo_base64: undefined, photo_url: '' }); }} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700"><Trash2 size={16} /></button>
                  )}
                  {localPreview && <div className="absolute bottom-2 left-2 px-3 py-1 bg-blue-600/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase">Imagen local lista</div>}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-xl p-6 bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="candidate-photo" />
                  <label htmlFor="candidate-photo" className="cursor-pointer flex flex-col items-center">
                    <Plus className="text-blue-400 mb-2" />
                    <span className="text-sm font-bold text-[var(--text-primary)]">Subir Imagen</span>
                    <span className="text-xs text-[var(--text-tertiary)] mt-1">JPG, PNG hasta 2MB</span>
                  </label>
                </div>
              )}
              <Input label="O URL externa" placeholder="https://..." value={currentCandidate?.photo_url || ''} onChange={(e) => { setLocalPreview(null); setCurrentCandidate({ ...currentCandidate!, photo_url: e.target.value, photo_base64: undefined }); }} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Video de Propuesta</label>
            <Input placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..." value={currentCandidate?.video_url || ''} onChange={(e) => setCurrentCandidate({ ...currentCandidate!, video_url: e.target.value })} />
            <p className="text-[10px] text-[var(--text-tertiary)] font-medium flex items-center gap-1">
              <Video size={12} /> YouTube o Vimeo. Los estudiantes podrán verlo al votar.
            </p>
          </div>

          {uploadError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold">
              <AlertCircle size={16} /> {uploadError}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Eliminar Candidato" message="¿Estás seguro? Esta acción es irreversible." confirmText="Sí, eliminar" variant="danger" />
    </div>
  );
};

export default Candidates;
