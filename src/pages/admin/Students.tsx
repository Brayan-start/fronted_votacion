import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Modal } from '../../components/ui/Modal';
import { authService } from '../../services/authService';
import { User } from '../../types';
import { Search, UserMinus, UserCheck, Shield, CheckCircle2, Loader2, AlertCircle, RefreshCcw } from 'lucide-react';

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.getAllStudents();
      setStudents(data);
    } catch (err) {
      setError("No se pudieron cargar los estudiantes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDeleteClick = (id: string) => {
    setStudentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (studentToDelete) {
      try {
        await authService.deleteStudent(studentToDelete);
        // Actualizamos el estado local eliminando el estudiante
        setStudents(prev => prev.filter(s => s.id !== studentToDelete));
        setIsDeleteModalOpen(false);
        setStudentToDelete(null);
        setIsSuccessModalOpen(true);
        setTimeout(() => setIsSuccessModalOpen(false), 2000);
      } catch (err) {
        alert("Error al eliminar estudiante");
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
          <h1 className="text-2xl font-bold text-white drop-shadow-sm">Base de Datos de Estudiantes UPEA</h1>
          <p className="text-slate-300 font-medium">Listado oficial de universitarios habilitados para el sufragio.</p>
        </div>
        <Button variant="outline" className="bg-white/10 border-white/20 text-white" onClick={fetchStudents}>
          <RefreshCcw size={18} className="mr-2" /> Actualizar
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, registro o cédula..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 sm:mx-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <AlertCircle className="text-red-500 mx-auto mb-2" size={32} />
              <p className="text-gray-500 font-medium">{error}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                  <th className="px-6 py-3 font-semibold">Estudiante</th>
                  <th className="px-6 py-3 font-semibold">Registro</th>
                  <th className="px-6 py-3 font-semibold">Cédula</th>
                  <th className="px-6 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {student.name[0]}{student.last_name[0]}
                        </div>
                        <span className="font-medium text-gray-900">{student.name} {student.last_name}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.reg_univ}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{student.id_card}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteClick(student.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar Estudiante"
                        >
                          <UserMinus size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
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
        message="¿Estás seguro de que deseas eliminar a este estudiante? Esta acción revocará su acceso al sistema de votación de la UPEA."
        confirmText="Eliminar permanentemente"
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
          <h3 className="text-xl font-bold text-gray-900">¡Acción Completada!</h3>
          <p className="text-gray-500 mt-2">El estudiante ha sido removido de la base de datos satisfactoriamente.</p>
        </div>
      </Modal>
    </div>
  );
};

export default Students;
