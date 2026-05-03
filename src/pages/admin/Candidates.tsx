import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { mockCandidates, mockCategories } from '../../services/mockData';
import { Plus, Edit, Trash2, Video, CheckCircle2 } from 'lucide-react';
import { Candidate } from '../../types';

const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<Partial<Candidate> | null>(null);
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);

  const handleOpenModal = (candidate?: Candidate) => {
    setCurrentCandidate(candidate || { name: '', description: '', photoUrl: '', categoryId: mockCategories[0]?.id || '' });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!currentCandidate?.name || !currentCandidate?.categoryId) return;

    if (currentCandidate.id) {
      setCandidates(candidates.map(c => c.id === currentCandidate.id ? currentCandidate as Candidate : c));
    } else {
      const newCandidate: Candidate = {
        ...currentCandidate as Candidate,
        id: Math.random().toString(36).substr(2, 9),
      };
      setCandidates([...candidates, newCandidate]);
    }

    setIsModalOpen(false);
    setIsSuccessModalOpen(true);
    setTimeout(() => setIsSuccessModalOpen(false), 2000);
  };

  const handleDeleteClick = (id: string) => {
    setCandidateToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (candidateToDelete) {
      setCandidates(candidates.filter(c => c.id !== candidateToDelete));
      setIsDeleteModalOpen(false);
      setCandidateToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm">Candidatos UPEA</h1>
          <p className="text-slate-300 font-medium">Gestión de perfiles y propuestas de los postulantes.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus size={20} />
          Nuevo Candidato
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {candidates.map((candidate) => {
          const category = mockCategories.find(c => c.id === candidate.categoryId);
          return (
            <Card key={candidate.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="relative aspect-video bg-gray-100">
                <img 
                  src={candidate.photoUrl || 'https://via.placeholder.com/400x225?text=Sin+Imagen'} 
                  alt={candidate.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(candidate)} 
                    className="p-2 bg-white/90 text-blue-600 rounded-full shadow hover:bg-white transition-colors"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(candidate.id)} 
                    className="p-2 bg-white/90 text-red-600 rounded-full shadow hover:bg-white transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-gray-900">{candidate.name}</h3>
                  <span className="text-[10px] uppercase font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">
                    {category?.name}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{candidate.description}</p>
                {candidate.videoUrl && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold bg-blue-50/50 p-1.5 rounded-lg w-fit">
                    <Video size={14} />
                    Propuesta en Video
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentCandidate?.id ? 'Editar Perfil de Candidato' : 'Registrar Nuevo Candidato'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Guardar Candidato</Button>
          </>
        }
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto px-1 custom-scrollbar">
          <Input 
            label="Nombre Completo del Candidato" 
            placeholder="Ej: Lic. Marcelo Pérez"
            value={currentCandidate?.name}
            onChange={(e) => setCurrentCandidate({ ...currentCandidate, name: e.target.value })}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Categoría / Cargo</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={currentCandidate?.categoryId}
              onChange={(e) => setCurrentCandidate({ ...currentCandidate, categoryId: e.target.value })}
            >
              {mockCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Resumen de Propuesta</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              rows={3}
              placeholder="Describa brevemente las propuestas del candidato..."
              value={currentCandidate?.description}
              onChange={(e) => setCurrentCandidate({ ...currentCandidate, description: e.target.value })}
            />
          </div>
          <Input 
            label="URL de Fotografía" 
            placeholder="https://images.unsplash.com/..." 
            value={currentCandidate?.photoUrl}
            onChange={(e) => setCurrentCandidate({ ...currentCandidate, photoUrl: e.target.value })}
          />
          <Input 
            label="URL de Video de Propuesta" 
            placeholder="https://youtube.com/watch?v=..." 
            value={currentCandidate?.videoUrl}
            onChange={(e) => setCurrentCandidate({ ...currentCandidate, videoUrl: e.target.value })}
          />
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Candidato"
        message="¿Estás seguro de eliminar a este candidato del sistema? Los votos asociados (si existen) podrían verse afectados."
        confirmText="Sí, eliminar candidato"
        variant="danger"
      />

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title=""
        showClose={false}
      >
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">¡Registro Actualizado!</h3>
          <p className="text-gray-500 mt-2">La información del candidato ha sido guardada satisfactoriamente.</p>
        </div>
      </Modal>
    </div>
  );
};

export default Candidates;
