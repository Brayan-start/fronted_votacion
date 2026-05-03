import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { mockCandidates, mockCategories } from '../../services/mockData';
import { Plus, Edit, Trash2, User, Video, Image as ImageIcon } from 'lucide-react';
import { Candidate } from '../../types';

const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<Partial<Candidate> | null>(null);

  const handleOpenModal = (candidate?: Candidate) => {
    setCurrentCandidate(candidate || { name: '', description: '', photoUrl: '', categoryId: mockCategories[0]?.id || '' });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setIsModalOpen(false);
    alert('Candidato guardado.');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar este candidato?')) {
      setCandidates(candidates.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm">Gestión de Candidatos</h1>
          <p className="text-slate-300 font-medium">Administra los perfiles de los postulantes.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus size={20} />
          Nuevo Candidato
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {candidates.map((candidate) => {
          const category = mockCategories.find(c => c.id === candidate.categoryId);
          return (
            <Card key={candidate.id} className="overflow-hidden group">
              <div className="relative aspect-video bg-gray-100">
                <img src={candidate.photoUrl} alt={candidate.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(candidate)} className="p-2 bg-white/90 text-blue-600 rounded-full shadow hover:bg-white">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(candidate.id)} className="p-2 bg-white/90 text-red-600 rounded-full shadow hover:bg-white">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-gray-900">{candidate.name}</h3>
                  <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded">
                    {category?.name}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{candidate.description}</p>
                {candidate.videoUrl && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                    <Video size={14} />
                    Video de propuesta vinculado
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
        title={currentCandidate?.id ? 'Editar Candidato' : 'Nuevo Candidato'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
          <Input 
            label="Nombre Completo" 
            value={currentCandidate?.name}
            onChange={(e) => setCurrentCandidate({ ...currentCandidate, name: e.target.value })}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Categoría</label>
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
            <label className="text-sm font-medium text-gray-700">Descripción / Propuesta</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              rows={3}
              value={currentCandidate?.description}
              onChange={(e) => setCurrentCandidate({ ...currentCandidate, description: e.target.value })}
            />
          </div>
          <Input 
            label="URL de Foto (Avatar)" 
            placeholder="https://..." 
            value={currentCandidate?.photoUrl}
            onChange={(e) => setCurrentCandidate({ ...currentCandidate, photoUrl: e.target.value })}
          />
          <Input 
            label="URL de Video (Propuesta)" 
            placeholder="https://youtube.com/..." 
            value={currentCandidate?.videoUrl}
            onChange={(e) => setCurrentCandidate({ ...currentCandidate, videoUrl: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Candidates;
