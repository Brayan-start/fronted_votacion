import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { mockCategories, mockElections } from '../../services/mockData';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Category } from '../../types';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);

  const handleOpenModal = (category?: Category) => {
    setCurrentCategory(category || { name: '', electionId: mockElections[0]?.id || '' });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setIsModalOpen(false);
    alert('Categoría guardada.');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar esta categoría?')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm">Gestión de Categorías</h1>
          <p className="text-slate-300 font-medium">Define los cargos o grupos para las votaciones.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus size={20} />
          Nueva Categoría
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const election = mockElections.find(e => e.id === category.electionId);
          return (
            <Card key={category.id} className="relative group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Tag size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{category.name}</h3>
                    <p className="text-xs text-gray-500">Elección: {election?.title}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(category)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(category.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
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
        title={currentCategory?.id ? 'Editar Categoría' : 'Nueva Categoría'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Nombre de la Categoría" 
            placeholder="Ej: Rector, Decano..." 
            value={currentCategory?.name}
            onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Asignar a Elección</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={currentCategory?.electionId}
              onChange={(e) => setCurrentCategory({ ...currentCategory, electionId: e.target.value })}
            >
              {mockElections.map(e => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
