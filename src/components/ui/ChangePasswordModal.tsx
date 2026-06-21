import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import Swal from 'sweetalert2';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      setError('Ingresa tu contraseña actual.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      Swal.fire({
        icon: 'success',
        title: '¡Contraseña actualizada!',
        text: 'Tu contraseña se cambió correctamente. La próxima vez que inicies sesión usa tu nueva contraseña.',
        confirmButtonColor: '#3b82f6',
        background: '#1a1d29',
        color: '#f1f5f9',
      });

      handleClose();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al cambiar la contraseña. Intenta de nuevo.';

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: detail,
        confirmButtonColor: '#ef4444',
        background: '#1a1d29',
        color: '#f1f5f9',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-md rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-secondary)]/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Lock size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-[var(--text-primary)]">Cambiar Contraseña</h2>
                <p className="text-xs font-medium text-[var(--text-tertiary)]">
                  Ingresa tu contraseña actual y la nueva
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-[var(--text-tertiary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Contraseña actual */}
            <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
                Contraseña Actual
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setError(''); }}
                  placeholder="Tu contraseña actual"
                  required
                  className="w-full h-12 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-input)] pl-11 pr-4 text-base font-bold text-[var(--text-primary)] outline-none transition-all focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-[var(--text-tertiary)]"
                />
              </div>
            </div>

            {/* Nueva contraseña */}
            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
                Nueva Contraseña
              </label>
              <div className="relative mb-3">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full h-12 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-input)] pl-11 pr-4 text-base font-bold text-[var(--text-primary)] outline-none transition-all focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] placeholder:text-[var(--text-tertiary)]"
                />
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Confirmar nueva contraseña"
                  required
                  className="w-full h-12 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-input)] pl-11 pr-4 text-base font-bold text-[var(--text-primary)] outline-none transition-all focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] placeholder:text-[var(--text-tertiary)]"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-sm font-bold text-red-400">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black text-base shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-500 hover:to-green-500 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Cambiar Contraseña
                </>
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChangePasswordModal;
