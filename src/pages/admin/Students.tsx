import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { User } from '../../types';
import { Search, UserMinus, Loader2, AlertCircle, RefreshCcw, ShieldCheck, ShieldX } from 'lucide-react';

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.getAllStudents();
      setStudents(data);
    } catch {
      setError("No se pudieron cargar los estudiantes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleDeleteClick = (id: string) => {
    setStudentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (studentToDelete) {
      try {
        await authService.deleteStudent(studentToDelete);
        setStudents(prev => prev.filter(s => s.id !== studentToDelete));
        showToast('success', 'Eliminación exitosa', 'El estudiante ha sido removido del sistema.');
        setIsDeleteModalOpen(false);
        setStudentToDelete(null);
      } catch {
        showToast('error', 'Error al eliminar', 'No se pudo eliminar el estudiante.');
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.reg_univ.includes(searchTerm) ||
    s.id_card.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Base de Datos de Estudiantes</h1>
          <p className="text-[var(--text-secondary)] font-medium">Listado oficial de universitarios habilitados para el sufragio.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={fetchStudents}>
          <RefreshCcw size={18} /> Actualizar
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, registro o cédula..." 
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 sm:mx-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-400" size={40} />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <AlertCircle className="text-red-400 mx-auto mb-2" size={32} />
              <p className="text-[var(--text-secondary)] font-medium">{error}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[var(--text-tertiary)] text-sm uppercase border-b border-[var(--border-color)]">
                  <th className="px-6 py-4 font-semibold">Estudiante</th>
                  <th className="px-6 py-4 font-semibold">Registro</th>
                  <th className="px-6 py-4 font-semibold">Cédula</th>
                  <th className="px-6 py-4 font-semibold text-center">Contraseña</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-[var(--bg-tertiary)]/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                            {student.name[0]}{student.last_name[0]}
                          </div>
                          <span className="font-medium text-[var(--text-primary)]">{student.name} {student.last_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{student.reg_univ}</td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{student.id_card}</td>
                      <td className="px-6 py-4 text-center">
                        {student.password_changed ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                            <ShieldCheck size={15} />
                            Cambiada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-tertiary)]">
                            <ShieldX size={15} />
                            Original (CI)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteClick(student.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar Estudiante"
                        >
                          <UserMinus size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-[var(--text-tertiary)]">
                      No se encontraron estudiantes que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Estudiante"
        message="¿Estás seguro de que deseas eliminar a este estudiante? Esta acción revocará su acceso al sistema de votación."
        confirmText="Eliminar permanentemente"
        variant="danger"
      />
    </div>
  );
};

export default Students;
