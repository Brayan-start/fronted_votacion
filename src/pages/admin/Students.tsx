import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Modal } from '../../components/ui/Modal';
import { Search, UserMinus, UserCheck, Shield, CheckCircle2 } from 'lucide-react';

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([
    { id: '1', name: 'Juan Pérez', regUniv: '20210001', idCard: '12345678', status: 'verified' },
    { id: '2', name: 'María García', regUniv: '20210002', idCard: '87654321', status: 'verified' },
    { id: '3', name: 'Carlos López', regUniv: '20210003', idCard: '11223344', status: 'pending' },
  ]);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setStudentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      setStudents(students.filter(s => s.id !== studentToDelete));
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
      
      setIsSuccessModalOpen(true);
      setTimeout(() => setIsSuccessModalOpen(false), 2000);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.regUniv.includes(searchTerm) ||
    s.idCard.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white drop-shadow-sm">Base de Datos de Estudiantes UPEA</h1>
        <p className="text-slate-300 font-medium">Listado oficial de universitarios habilitados para el sufragio.</p>
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                <th className="px-6 py-3 font-semibold">Estudiante</th>
                <th className="px-6 py-3 font-semibold">Registro</th>
                <th className="px-6 py-3 font-semibold">Cédula</th>
                <th className="px-6 py-3 font-semibold">Estado</th>
                <th className="px-6 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-gray-900">{student.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.regUniv}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.idCard}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 text-xs font-bold ${
                        student.status === 'verified' ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {student.status === 'verified' ? <UserCheck size={14} /> : <Shield size={14} />}
                        {student.status === 'verified' ? 'Verificado' : 'Pendiente'}
                      </span>
                    </td>
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
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No se encontraron estudiantes que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
        showClose={false}
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
