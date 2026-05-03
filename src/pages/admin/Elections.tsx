import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { mockElections } from '../../services/mockData';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Election } from '../../types';

const Elections: React.FC = () => {
  const [elections, setElections] = useState<Election[]>(mockElections);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentElection, setCurrentElection] = useState<Partial<Election> | null>(null);

  const handleOpenModal = (election?: Election) => {
    setCurrentElection(election || { title: '', description: '', startDate: '', endDate: '', status: 'inactive' });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    // Simular guardado
    setIsModalOpen(false);
    alert('Cambios guardados exitosamente.');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta elección?')) {
      setElections(elections.filter(e => e.id !== id));
    }
  };

  const filteredElections = elections.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Elecciones</h1>
          <p className="text-gray-500">Crea y administra los procesos electorales.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus size={20} />
          Nueva Elección
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar elección..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter size={18} />
            Filtros
          </Button>
        </div>

        <div className="overflow-x-auto -mx-6 sm:mx-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                <th className="px-6 py-3 font-semibold">Título</th>
                <th className="px-6 py-3 font-semibold">Estado</th>
                <th className="px-6 py-3 font-semibold">Inicio</th>
                <th className="px-6 py-3 font-semibold">Fin</th>
                <th className="px-6 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredElections.map((election) => (
                <tr key={election.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{election.title}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{election.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      election.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {election.status === 'active' ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(election.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(election.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(election)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(election.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentElection?.id ? 'Editar Elección' : 'Nueva Elección'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar Elección</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Título" 
            value={currentElection?.title} 
            onChange={(e) => setCurrentElection({...currentElection, title: e.target.value})}
          />
          <Input 
            label="Descripción" 
            value={currentElection?.description} 
            onChange={(e) => setCurrentElection({...currentElection, description: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Fecha Inicio" 
              type="date" 
              value={currentElection?.startDate} 
              onChange={(e) => setCurrentElection({...currentElection, startDate: e.target.value})}
            />
            <Input 
              label="Fecha Fin" 
              type="date" 
              value={currentElection?.endDate} 
              onChange={(e) => setCurrentElection({...currentElection, endDate: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Estado</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={currentElection?.status}
              onChange={(e) => setCurrentElection({...currentElection, status: e.target.value as any})}
            >
              <option value="inactive">Inactiva</option>
              <option value="active">Activa</option>
              <option value="closed">Cerrada</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Elections;
