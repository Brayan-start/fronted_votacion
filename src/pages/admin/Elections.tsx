import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { mockElections } from '../../services/mockData';
import { Plus, Edit, Trash2, Search, Filter, CheckCircle2 } from 'lucide-react';
import { Election } from '../../types';

const Elections: React.FC = () => {
  const [elections, setElections] = useState<Election[]>(mockElections);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentElection, setCurrentElection] = useState<Partial<Election> | null>(null);
  const [electionToDelete, setElectionToDelete] = useState<string | null>(null);

  const handleOpenModal = (election?: Election) => {
    setCurrentElection(election || { 
      title: '', 
      description: '', 
      startDate: '', 
      endDate: '', 
      status: 'inactive',
      type: 'rectorado'
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!currentElection?.title || !currentElection?.startDate || !currentElection?.endDate) return;

    if (currentElection.id) {
      setElections(elections.map(e => e.id === currentElection.id ? currentElection as Election : e));
    } else {
      const newElection: Election = {
        ...currentElection as Election,
        id: Math.random().toString(36).substr(2, 9),
      };
      setElections([...elections, newElection]);
    }
    
    setIsModalOpen(false);
    setIsSuccessModalOpen(true);
    setTimeout(() => setIsSuccessModalOpen(false), 2000);
  };

  const handleDeleteClick = (id: string) => {
    setElectionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (electionToDelete) {
      setElections(elections.filter(e => e.id !== electionToDelete));
      setIsDeleteModalOpen(false);
      setElectionToDelete(null);
    }
  };

  const filteredElections = elections.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getElectionTypeLabel = (type: string) => {
    switch (type) {
      case 'rectorado': return 'Rectorado';
      case 'consejo': return 'Consejo Universitario';
      case 'carrera': return 'Consejo de Carrera';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm">Gestión de Elecciones UPEA</h1>
          <p className="text-slate-300 font-medium">Configuración de procesos electorales universitarios.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 bg-blue-600 hover:bg-blue-700">
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
              placeholder="Buscar elección por título..." 
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
                <th className="px-6 py-3 font-semibold">Título / Tipo</th>
                <th className="px-6 py-3 font-semibold">Estado</th>
                <th className="px-6 py-3 font-semibold">Periodo</th>
                <th className="px-6 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredElections.map((election) => (
                <tr key={election.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{election.title}</p>
                    <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                      {getElectionTypeLabel(election.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      election.status === 'active' ? 'bg-green-100 text-green-700' : 
                      election.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {election.status === 'active' ? 'Activa' : election.status === 'closed' ? 'Cerrada' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex flex-col">
                      <span>Desde: {new Date(election.startDate).toLocaleDateString()}</span>
                      <span>Hasta: {new Date(election.endDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(election)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(election.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
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

      {/* Modal de Formulario */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentElection?.id ? 'Editar Elección' : 'Nueva Elección Universitaria'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Guardar Cambios</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Título de la Elección" 
            placeholder="Ej: Elecciones Rectorado 2026"
            value={currentElection?.title} 
            onChange={(e) => setCurrentElection({...currentElection, title: e.target.value})}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Descripción del Proceso</label>
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              rows={3}
              value={currentElection?.description}
              onChange={(e) => setCurrentElection({...currentElection, description: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Tipo de Elección</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={currentElection?.type}
                onChange={(e) => setCurrentElection({...currentElection, type: e.target.value as any})}
              >
                <option value="rectorado">Rectorado</option>
                <option value="consejo">Consejo Universitario</option>
                <option value="carrera">Consejo de Carrera</option>
              </select>
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
        </div>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Elección"
        message="¿Estás seguro de que deseas eliminar esta elección? Esta acción no se puede deshacer y se perderán todos los datos relacionados."
        confirmText="Eliminar permanentemente"
        variant="danger"
      />

      {/* Modal de Éxito (Feedback) */}
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
          <h3 className="text-xl font-bold text-gray-900">¡Operación Exitosa!</h3>
          <p className="text-gray-500 mt-2">Los datos de la elección han sido actualizados correctamente.</p>
        </div>
      </Modal>
    </div>
  );
};

export default Elections;
