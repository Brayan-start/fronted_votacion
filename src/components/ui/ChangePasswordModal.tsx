import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, KeyRound, Lock, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

type Step = 'email' | 'code' | 'password' | 'success';

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, userEmail }) => {
  const { theme } = useTheme();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(userEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setStep('email');
    setEmail(userEmail);
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email.trim());
      setStep('code');
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al enviar el código.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Ingresa el código de verificación.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.verifyResetCode(email.trim(), code.trim());
      setStep('password');
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Código inválido.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(email.trim(), code.trim(), newPassword);
      setStep('success');
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al cambiar la contraseña.';
      setError(detail);
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
              {step === 'success' ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 size={22} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Lock size={22} />
                </div>
              )}
              <div>
                <h2 className="text-lg font-black text-[var(--text-primary)]">Cambiar Contraseña</h2>
                <p className="text-xs font-medium text-[var(--text-tertiary)]">
                  {step === 'email' && 'Recibirás un código de verificación'}
                  {step === 'code' && 'Revisa tu bandeja de entrada'}
                  {step === 'password' && 'Ingresa tu nueva contraseña'}
                  {step === 'success' && 'Contraseña actualizada'}
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

          {/* Stepper */}
          <div className="flex items-center gap-2 mb-6">
            {['email', 'code', 'password'].map((s, i) => {
              const isActive = step === s || (step === 'success' && s === 'password');
              const isPast = s === 'email' && (step === 'code' || step === 'password' || step === 'success');
              const isPast2 = s === 'code' && (step === 'password' || step === 'success');
              const completed = isPast || isPast2;
              return (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                      completed || isActive ? 'bg-blue-600 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                    }`}>
                      {completed ? <CheckCircle2 size={14} /> : i + 1}
                    </div>
                    <span className={`text-xs font-bold hidden sm:block ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                      {i === 0 ? 'Correo' : i === 1 ? 'Código' : 'Contraseña'}
                    </span>
                  </div>
                  {i < 2 && <div className="flex-1 h-px bg-[var(--border-color)]" />}
                </React.Fragment>
              );
            })}
          </div>

          {/* Step: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="tu@correo.com"
                    required
                    className="w-full h-12 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-input)] pl-11 pr-4 text-base font-bold text-[var(--text-primary)] outline-none transition-all focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-[var(--text-tertiary)]"
                  />
                </div>
              </div>

              <p className="text-xs text-[var(--text-tertiary)] font-medium leading-relaxed">
                Te enviaremos un código de <strong>6 dígitos</strong> a tu correo.
                El código expira en <strong>10 minutos</strong>.
              </p>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-sm font-bold text-red-400">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-base shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                ) : (
                  <>
                    <Mail size={18} />
                    Enviar Código
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step: Code */}
          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
                  Código de Verificación
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="w-full h-14 text-center text-2xl font-black tracking-[0.3em] rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] placeholder:text-[var(--text-tertiary)]"
                />
              </div>

              <p className="text-xs text-[var(--text-tertiary)] font-medium">
                Revisa tu bandeja de entrada (y la carpeta de spam).
              </p>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-sm font-bold text-red-400">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex-1 h-12 rounded-xl border-2 border-[var(--border-color)] bg-transparent text-[var(--text-secondary)] font-bold text-sm transition-all hover:bg-white/5"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-sm shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-blue-500 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Verificar
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step: New Password */}
          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative mb-3">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
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
                    placeholder="Confirmar contraseña"
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
                    <Lock size={18} />
                    Cambiar Contraseña
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">¡Contraseña Actualizada!</h3>
                <p className="text-sm font-medium text-[var(--text-tertiary)] mt-1">
                  Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-base shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500"
              >
                Cerrar
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChangePasswordModal;
