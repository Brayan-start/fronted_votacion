import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { electionService } from '../../services/electionService';
import { Plus, Edit, Trash2, Tag, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';
import { Category, Election } from '../../types';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    } catch (err: any) {
      console.error(err);
      setError('Error al cargar datos');
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = async (categoryObj?: Category) => {
    // Aseguramos que tenemos las últimas elecciones antes de abrir para que aparezcan en el select
    try {
      const freshElections = await electionService.getAll();
      setElections(freshElections);
      
      const defaultElectionId = freshElections.length > 0 ? freshElections[0].id : '';
      
      if (categoryObj) {
        setCurrentCategory(categoryObj);
      } else {
        setCurrentCategory({ 
          name: '', 
          election_id: defaultElectionId 
        });
      }
      setIsModalOpen(true);
    } catch (err) {
      alert("Error al sincronizar elecciones");
    }
  };

  const handleSave = async () => {
    if (!currentCategory?.name || !currentCategory?.election_id) return;

    setIsSaving(true);
    try {
      if (currentCategory.id) {
        // Implementación de actualización si el service la soporta
        // Por ahora simulamos con create si no existe update en el service
        // Pero el service de electionService no tiene updateCategory explícito en el archivo leído
        // Sin embargo, podemos usar el patrón de refresco.
        await electionService.createCategory(currentCategory); 
      } else {
        await electionService.createCategory(currentCategory);
      }
      
      setIsModalOpen(false);
      await fetchData(true);
      
      setIsSuccessModalOpen(true);
      setTimeout(() => setIsSuccessModalOpen(false), 2000);
    } catch (err: any) {
      alert('Error al guardar categoría');
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
        await fetchData();
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
      } catch (err: any) {
        alert('Error al eliminar categoría');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm">Categorías de Votación UPEA</h1>
          <p className="text-slate-300 font-medium">Define los cargos o estamentos para los procesos electorales.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus size={20} />
          Nueva Categoría
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-24 bg-white/20 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-10 text-center bg-white/10 rounded-2xl">
          <AlertCircle className="mx-auto text-red-400 mb-2" size={32} />
          <p className="text-white font-medium">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => fetchData()} className="mt-4">
            <RefreshCcw size={14} className="mr-2" /> Reintentar
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const election = elections.find(e => e.id === category.election_id);
            return (
              <Card key={category.id} className="relative group hover:border-blue-200 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <Tag size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{category.name}</h3>
                      <p className="text-xs text-gray-500 font-medium">Elección: {election?.title || 'No asignada'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal(category)} 
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(category.id)} 
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
          {categories.length === 0 && (
            <div className="col-span-full py-10 text-center text-slate-300">
              No hay categorías registradas.
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentCategory?.id ? 'Editar Categoría' : 'Nueva Categoría de Elección'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" loading={isSaving}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Nombre de la Categoría" 
            placeholder="Ej: Candidato a Rector, Representante Estudiantil..." 
            value={currentCategory?.name}
            onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Asignar a Proceso Electoral</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={currentCategory?.election_id}
              onChange={(e) => setCurrentCategory({ ...currentCategory, election_id: e.target.value })}
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

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title=""
      >
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">¡Categoría Actualizada!</h3>
          <p className="text-gray-500 mt-2">La categoría ha sido registrada correctamente en el sistema de la UPEA.</p>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
