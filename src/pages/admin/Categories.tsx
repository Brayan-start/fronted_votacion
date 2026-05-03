import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { mockCategories, mockElections } from '../../services/mockData';
import { Plus, Edit, Trash2, Tag, CheckCircle2 } from 'lucide-react';
import { Category } from '../../types';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleOpenModal = (category?: Category) => {
    setCurrentCategory(category || { name: '', electionId: mockElections[0]?.id || '' });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!currentCategory?.name || !currentCategory?.electionId) return;

    if (currentCategory.id) {
      setCategories(categories.map(c => c.id === currentCategory.id ? currentCategory as Category : c));
    } else {
      const newCategory: Category = {
        ...currentCategory as Category,
        id: Math.random().toString(36).substr(2, 9),
      };
      setCategories([...categories, newCategory]);
    }

    setIsModalOpen(false);
    setIsSuccessModalOpen(true);
    setTimeout(() => setIsSuccessModalOpen(false), 2000);
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      setCategories(categories.filter(c => c.id !== categoryToDelete));
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const election = mockElections.find(e => e.id === category.electionId);
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
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentCategory?.id ? 'Editar Categoría' : 'Nueva Categoría de Elección'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Guardar</Button>
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
              value={currentCategory?.electionId}
              onChange={(e) => setCurrentCategory({ ...currentCategory, electionId: e.target.value })}
            >
              <option value="" disabled>Seleccione una elección</option>
              {mockElections.map(e => (
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
