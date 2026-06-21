import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { electionService } from '../../services/electionService';
import { Plus, Edit, Trash2, Tag, AlertCircle, RefreshCcw } from 'lucide-react';
import { Category, Election } from '../../types';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const fetchData = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const [electionsData, allCategories] = await Promise.all([
        electionService.getAll(),
        electionService.getAllCategories()
      ]);
      setElections(electionsData);
      setCategories(allCategories);
    } catch {
      setError('Error al cargar datos');
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenModal = (categoryObj?: Category) => {
    if (categoryObj) {
      setCurrentCategory(categoryObj);
    } else {
      setCurrentCategory({ name: '', election_id: elections[0]?.id || '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!currentCategory?.name || !currentCategory?.election_id) return;
    setIsSaving(true);
    try {
      await electionService.createCategory(currentCategory);
      setIsModalOpen(false);
      await fetchData(true);
      showToast('success', 'Categoría guardada', 'La categoría se registró correctamente.');
    } catch {
      showToast('error', 'Error al guardar', 'No se pudo guardar la categoría.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await electionService.deleteCategory(categoryToDelete);
        await fetchData(true);
        showToast('success', 'Eliminación exitosa', 'La categoría ha sido eliminada.');
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
      } catch {
        showToast('error', 'Error al eliminar', 'No se pudo eliminar la categoría.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Categorías de Votación</h1>
          <p className="text-[var(--text-secondary)] font-medium">Define los cargos o estamentos para los procesos electorales.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus size={20} />
          Nueva Categoría
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-24 bg-[var(--bg-tertiary)] animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-10 text-center bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-color)]">
          <AlertCircle className="mx-auto text-red-400 mb-2" size={32} />
          <p className="text-[var(--text-secondary)] font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchData()} className="mt-4">
            <RefreshCcw size={14} className="mr-2" /> Reintentar
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const election = elections.find(e => e.id === category.election_id);
            return (
              <Card key={category.id} className="relative group hover:border-blue-500/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                      <Tag size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)]">{category.name}</h3>
                      <p className="text-xs text-[var(--text-tertiary)] font-medium">Elección: {election?.title || 'No asignada'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(category)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded" title="Editar">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(category.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded" title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
          {categories.length === 0 && (
            <div className="col-span-full py-10 text-center text-[var(--text-tertiary)]">
              No hay categorías registradas.
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentCategory?.id ? 'Editar Categoría' : 'Nueva Categoría'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleSave} loading={isSaving}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Nombre de la Categoría" 
            placeholder="Ej: Candidato a Rector, Representante Estudiantil..." 
            value={currentCategory?.name || ''}
            onChange={(e) => setCurrentCategory({ ...currentCategory!, name: e.target.value })}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Asignar a Proceso Electoral</label>
            <select 
              className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[var(--text-primary)]"
              value={currentCategory?.election_id || ''}
              onChange={(e) => setCurrentCategory({ ...currentCategory!, election_id: e.target.value })}
            >
              <option value="" disabled>Seleccione una elección</option>
              {elections.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Categoría"
        message="¿Seguro que deseas eliminar esta categoría? Esto podría afectar a los candidatos vinculados a ella."
        confirmText="Confirmar Eliminación"
        variant="danger"
      />
    </div>
  );
};

export default Categories;
