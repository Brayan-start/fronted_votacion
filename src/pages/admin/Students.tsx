import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Search, UserMinus, UserCheck, Shield } from 'lucide-react';

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const mockStudents = [
    { id: '1', name: 'Juan Pérez', regUniv: '20210001', idCard: '12345678', status: 'verified' },
    { id: '2', name: 'María García', regUniv: '20210002', idCard: '87654321', status: 'verified' },
    { id: '3', name: 'Carlos López', regUniv: '20210003', idCard: '11223344', status: 'pending' },
  ];

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar este estudiante del sistema?')) {
      alert('Estudiante eliminado.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Base de Datos de Estudiantes</h1>
        <p className="text-gray-500">Listado de usuarios habilitados para votar.</p>
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
              {mockStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
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
                      onClick={() => handleDelete(student.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      title="Eliminar Estudiante"
                    >
                      <UserMinus size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Students;
