import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { usuariosService } from '../../services/usuariosService';
import { User } from '../../types';
import { Search, Loader2, AlertCircle, RefreshCcw, ShieldCheck, ShieldX, ToggleLeft, ToggleRight } from 'lucide-react';

const UsuariosRegistrados: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggleUserId, setToggleUserId] = useState<string | null>(null);
  const [toggleUserName, setToggleUserName] = useState('');
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usuariosService.getAll();
      setUsers(data);
    } catch {
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleClick = (user: User) => {
    setToggleUserId(user.id);
    setToggleUserName(`${user.name} ${user.last_name}`);
    setIsToggleModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!toggleUserId) return;
    setTogglingId(toggleUserId);
    try {
      const updated = await usuariosService.toggleEstado(toggleUserId);
      setUsers(prev => prev.map(u => (u.id === toggleUserId ? { ...u, is_active: updated.is_active } : u)));
      const action = updated.is_active ? 'habilitado' : 'deshabilitado';
      showToast('success', 'Estado actualizado', `El usuario ha sido ${action} correctamente.`);
    } catch {
      showToast('error', 'Error', 'No se pudo cambiar el estado del usuario.');
    } finally {
      setTogglingId(null);
      setIsToggleModalOpen(false);
      setToggleUserId(null);
    }
  };

  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.reg_univ.includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm)
  );

  const roleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">
          ADMIN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
        STUDENT
      </span>
    );
  };

  const stateBadge = (isActive: boolean | undefined) => {
    if (isActive ?? true) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
          <ShieldCheck size={12} />
          Habilitado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20">
        <ShieldX size={12} />
        Deshabilitado
      </span>
    );
  };

  const toggleBadge = (isActive: boolean | undefined) => {
    if (isActive ?? true) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
          <ToggleRight size={16} />
          Activo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400">
        <ToggleLeft size={16} />
        Inactivo
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Usuarios Registrados</h1>
          <p className="text-[var(--text-secondary)] font-medium">
            Listado completo de usuarios del sistema (administradores y estudiantes).
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={fetchUsers}>
          <RefreshCcw size={18} /> Actualizar
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, registro o email..."
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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
                  <th className="px-6 py-4 font-semibold">Usuario</th>
                  <th className="px-6 py-4 font-semibold">Rol</th>
                  <th className="px-6 py-4 font-semibold">Registro / CI</th>
                  <th className="px-6 py-4 font-semibold">Fecha Registro</th>
                  <th className="px-6 py-4 font-semibold text-center">Estado</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-[var(--bg-tertiary)]/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                            {user.name[0]}{user.last_name[0]}
                          </div>
                          <div>
                            <span className="font-medium text-[var(--text-primary)] block">
                              {user.name} {user.last_name}
                            </span>
                            <span className="text-xs text-[var(--text-tertiary)]">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{roleBadge(user.role)}</td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {user.reg_univ} / {user.id_card}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString('es-BO', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">{stateBadge(user.is_active)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleClick(user)}
                          disabled={togglingId === user.id}
                          className={`p-2 rounded-lg transition-colors ${
                            (user.is_active ?? true)
                              ? 'text-red-400 hover:bg-red-500/10'
                              : 'text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                          title={(user.is_active ?? true) ? 'Deshabilitar usuario' : 'Habilitar usuario'}
                        >
                          {togglingId === user.id ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            toggleBadge(user.is_active)
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-[var(--text-tertiary)]">
                      No se encontraron usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <ConfirmModal
        isOpen={isToggleModalOpen}
        onClose={() => {
          setIsToggleModalOpen(false);
          setToggleUserId(null);
        }}
        onConfirm={handleConfirmToggle}
        title="Cambiar estado de usuario"
        message={`¿Estás seguro de que deseas ${(users.find(u => u.id === toggleUserId)?.is_active ?? true) ? 'deshabilitar' : 'habilitar'} a "${toggleUserName}"? ${
          (users.find(u => u.id === toggleUserId)?.is_active ?? true)
            ? 'El usuario no podrá iniciar sesión hasta que sea habilitado nuevamente.'
            : 'El usuario podrá iniciar sesión nuevamente.'
        }`}
        confirmText={(users.find(u => u.id === toggleUserId)?.is_active ?? true) ? 'Sí, deshabilitar' : 'Sí, habilitar'}
        variant={(users.find(u => u.id === toggleUserId)?.is_active ?? true) ? 'danger' : 'primary'}
      />
    </div>
  );
};

export default UsuariosRegistrados;
