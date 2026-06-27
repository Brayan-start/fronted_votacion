import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { electionService } from '../../services/electionService';
import { Plus, Edit, Trash2, Search, RefreshCcw, Filter, AlertCircle } from 'lucide-react';
import { Election } from '../../types';

const Elections: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentElection, setCurrentElection] = useState<Partial<Election> | null>(null);
  const [electionToDelete, setElectionToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const { showToast } = useToast();

  const extractTime = (isoStr: string | undefined): string => {
    if (!isoStr) return '08:00';
    const match = isoStr.match(/T(\d{2}:\d{2})/);
    return match ? match[1] : '08:00';
  };

  const getDatePart = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };

  const fetchElections = async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const data = await electionService.getAll();
      setElections(data);
    } catch {
      setError('Error al cargar elecciones');
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => { fetchElections(); }, []);

  const handleOpenModal = (election?: Election) => {
    setCurrentElection(election || { 
      title: '', description: '', start_date: '', end_date: '', 
      status: 'inactive' as const, type: 'rectorado' as const
    });
    setStartTime(election ? extractTime(election.start_date) : '08:00');
    setEndTime(election ? extractTime(election.end_date) : '16:00');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!currentElection?.title || !currentElection?.start_date || !currentElection?.end_date) return;
    setIsSaving(true);
    try {
      const payload = {
        ...currentElection,
        start_date: `${getDatePart(currentElection.start_date)}T${startTime}:00`,
        end_date: `${getDatePart(currentElection.end_date)}T${endTime}:00`,
      };
      if (currentElection.id) {
        const updated = await electionService.update(currentElection.id, payload);
        showToast('success', 'Elección actualizada', 'Los datos se guardaron correctamente.');
        setElections(prev => prev.map(e => e.id === updated.id ? updated : e));
      } else {
        const created = await electionService.create(payload);
        showToast('success', 'Elección creada', 'El proceso electoral se registró exitosamente.');
        setElections(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
      await fetchElections(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      showToast('error', 'Error al guardar', error.response?.data?.detail || 'Ocurrió un error al guardar la elección.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setElectionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (electionToDelete) {
      try {
        await electionService.delete(electionToDelete);
        setElections(prev => prev.filter(e => e.id !== electionToDelete));
        showToast('success', 'Eliminación exitosa', 'La elección ha sido eliminada.');
        setIsDeleteModalOpen(false);
        setElectionToDelete(null);
      } catch {
        showToast('error', 'Error al eliminar', 'No se pudo eliminar la elección.');
      }
    }
  };

  const getEffectiveStatus = (e: Election): string => {
    if (e.status !== 'active') return e.status;
    const now = new Date();
    const endDate = new Date(e.end_date);
    return endDate < now ? 'closed' : 'active';
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Gestión de Elecciones</h1>
          <p className="text-[var(--text-secondary)] font-medium">Configuración de procesos electorales universitarios.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus size={20} />
          Nueva Elección
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
            <input 
              type="text" 
              placeholder="Buscar elección por título..." 
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2" onClick={() => fetchElections()}>
            <RefreshCcw size={18} />
            Actualizar
          </Button>
        </div>

        <div className="overflow-x-auto -mx-6 sm:mx-0">
          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-[var(--bg-tertiary)] animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <AlertCircle className="mx-auto text-red-400 mb-2" size={32} />
              <p className="text-[var(--text-secondary)] font-medium">{error}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[var(--text-tertiary)] text-sm uppercase border-b border-[var(--border-color)]">
                  <th className="px-6 py-4 font-semibold">Título / Tipo</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold">Periodo</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredElections.map((election) => (
                  <tr key={election.id} className="hover:bg-[var(--bg-tertiary)]/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[var(--text-primary)]">{election.title}</p>
                      <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                        {getElectionTypeLabel(election.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const effStatus = getEffectiveStatus(election);
                        const isActuallyExpired = election.status === 'active' && effStatus === 'closed';
                        return (
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            effStatus === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                            effStatus === 'closed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                            'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                          }`}>
                            {effStatus === 'active' ? 'Activa' : effStatus === 'closed' ? (isActuallyExpired ? 'Vencida' : 'Cerrada') : 'Inactiva'}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                      <div className="flex flex-col">
                        <span>Desde: {new Date(election.start_date).toLocaleDateString()}</span>
                        <span>Hasta: {new Date(election.end_date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(election)}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(election.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredElections.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-[var(--text-tertiary)]">
                      No se encontraron elecciones.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentElection?.id ? 'Editar Elección' : 'Nueva Elección Universitaria'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleSave} loading={isSaving}>Guardar Cambios</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Título de la Elección" 
            placeholder="Ej: Elecciones Rectorado 2026"
            value={currentElection?.title || ''} 
            onChange={(e) => setCurrentElection({...currentElection!, title: e.target.value})}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Descripción del Proceso</label>
            <textarea 
              className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
              rows={3}
              value={currentElection?.description || ''}
              onChange={(e) => setCurrentElection({...currentElection!, description: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Tipo de Elección</label>
              <select 
                className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[var(--text-primary)]"
                value={currentElection?.type || 'rectorado'}
                onChange={(e) => setCurrentElection({...currentElection!, type: e.target.value as any})}
              >
                <option value="rectorado">Rectorado</option>
                <option value="consejo">Consejo Universitario</option>
                <option value="carrera">Consejo de Carrera</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Estado</label>
              <select 
                className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[var(--text-primary)]"
                value={currentElection?.status || 'inactive'}
                onChange={(e) => setCurrentElection({...currentElection!, status: e.target.value as any})}
              >
                <option value="inactive">Inactiva</option>
                <option value="active">Activa</option>
                <option value="closed">Cerrada</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input 
                label="Fecha Inicio" 
                type="date" 
                value={currentElection?.start_date && !isNaN(new Date(currentElection.start_date).getTime()) 
                  ? new Date(currentElection.start_date).toISOString().split('T')[0] 
                  : currentElection?.start_date || ''} 
                onChange={(e) => setCurrentElection({...currentElection!, start_date: e.target.value})}
              />
              <Input 
                label="Hora Inicio" 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Input 
                label="Fecha Fin" 
                type="date" 
                value={currentElection?.end_date && !isNaN(new Date(currentElection.end_date).getTime()) 
                  ? new Date(currentElection.end_date).toISOString().split('T')[0] 
                  : currentElection?.end_date || ''} 
                onChange={(e) => setCurrentElection({...currentElection!, end_date: e.target.value})}
              />
              <Input 
                label="Hora Fin" 
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Elección"
        message="¿Estás seguro de que deseas eliminar esta elección? Esta acción no se puede deshacer y se perderán todos los datos relacionados."
        confirmText="Eliminar permanentemente"
        variant="danger"
      />
    </div>
  );
};

export default Elections;
