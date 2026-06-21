import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import Swal from 'sweetalert2';
import {
  User, Mail, GraduationCap, Hash, Calendar, Camera, CheckCircle2,
  AlertTriangle, Save, LogOut, ShieldCheck, ShieldX, Lock,
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Estado del formulario de perfil ──────────────────────────────────
  const [name, setName] = useState(user?.name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [career, setCareer] = useState(user?.career || '');

  // ── Estado de foto ───────────────────────────────────────────────────
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // ── Estado general ───────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  // Sincronizar si el usuario cambia externamente
  useEffect(() => {
    if (user) {
      setName(user.name);
      setLastName(user.last_name);
      setCareer(user.career || '');
    }
  }, [user]);

  // ── Actualizar datos del perfil ──────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const updatedUser = await authService.updateProfile({
        name: name.trim(),
        last_name: lastName.trim(),
        career: career.trim() || undefined,
      });
      // Actualizar el contexto de auth con los nuevos datos
      const token = localStorage.getItem('token');
      if (token) {
        login(token, updatedUser);
      }
      setSuccessMsg('Perfil actualizado correctamente.');
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al guardar.';
      setErrorMsg(detail);
    } finally {
      setSaving(false);
    }
  };

  // ── Subir foto de perfil ─────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo y tamaño
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Solo se permiten imágenes.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('La imagen no debe superar los 5 MB.');
      return;
    }

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setPhotoPreview(base64);
      setUploadingPhoto(true);
      setErrorMsg('');
      setSuccessMsg('');
      try {
        const updatedUser = await authService.uploadPhoto({ photo_base64: base64 });
        const token = localStorage.getItem('token');
        if (token) {
          login(token, updatedUser);
        }
        setPhotoPreview(null);
        setSuccessMsg('Foto de perfil actualizada.');
      } catch (err: unknown) {
        const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Error al subir la foto.';
        setErrorMsg(detail);
        setPhotoPreview(null);
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  // ── Cerrar sesión en todos los dispositivos ───────────────────────────
  const handleLogoutAll = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Cerrar sesión en todos los dispositivos?',
      text: 'Se cerrará tu sesión en este dispositivo y en todos los demás donde tengas sesión activa. Deberás iniciar sesión nuevamente.',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar todo',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      background: '#1a1d29',
      color: '#f1f5f9',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setLoggingOutAll(true);
    try {
      await authService.logoutAll();
      await Swal.fire({
        icon: 'success',
        title: 'Sesiones cerradas',
        text: 'Se cerró tu sesión en todos los dispositivos.',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: '#1a1d29',
        color: '#f1f5f9',
      });
      logout();
      navigate('/login');
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cerrar todas las sesiones. Intenta de nuevo.',
        confirmButtonColor: '#ef4444',
        background: '#1a1d29',
        color: '#f1f5f9',
      });
    } finally {
      setLoggingOutAll(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] flex items-center gap-3">
            <User size={28} className="text-blue-400" />
            Mi Perfil
          </h1>
          <p className="text-sm font-medium text-[var(--text-tertiary)] mt-1">
            Administra tu información personal y seguridad
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Columna izquierda: Foto ───────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-[var(--bg-card)] backdrop-blur-xl border-[var(--border-color)] shadow-xl">
            <div className="flex flex-col items-center text-center">
              {/* Avatar / Foto */}
              <div className="relative group mb-4">
                <div className="w-36 h-36 rounded-[2rem] overflow-hidden border-4 border-[var(--border-color)] bg-[var(--bg-tertiary)] shadow-xl">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : user?.photo_url ? (
                    <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-black text-[var(--text-tertiary)] bg-gradient-to-br from-blue-600/20 to-indigo-600/20">
                      {user?.name?.[0]}{user?.last_name?.[0]}
                    </div>
                  )}
                </div>
                {/* Botón de cámara flotante */}
                <button
                  onClick={triggerFileInput}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-1 -right-1 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl disabled:opacity-60"
                  title="Cambiar foto"
                >
                  {uploadingPhoto ? (
                    <span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  ) : (
                    <Camera size={20} />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <h2 className="text-xl font-black text-[var(--text-primary)]">{user?.name} {user?.last_name}</h2>
              <p className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider">@{user?.reg_univ}</p>

              <div className="w-full mt-6 pt-6 border-t border-[var(--border-color)] space-y-3">
                <div className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)]/50 rounded-xl">
                  <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Rol</span>
                  <span className="text-sm font-black text-[var(--text-primary)] capitalize">{user?.role}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)]/50 rounded-xl">
                  <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Miembro desde</span>
                  <span className="text-sm font-black text-[var(--text-primary)]">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Columna derecha: Información y edición ────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[var(--bg-card)] backdrop-blur-xl border-[var(--border-color)] shadow-xl">
            <h3 className="text-lg font-black text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <User size={20} className="text-blue-400" />
              Información Personal
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-input)] px-4 text-base font-bold text-[var(--text-primary)] outline-none transition-all focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-[var(--text-tertiary)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-12 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-input)] px-4 text-base font-bold text-[var(--text-primary)] outline-none transition-all focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-[var(--text-tertiary)]"
                    required
                  />
                </div>
              </div>

              {/* Correo (solo lectura) */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
                  <Mail size={14} className="inline mr-1" />
                  Correo Electrónico
                </label>
                <div className="w-full h-12 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-tertiary)]/50 px-4 flex items-center text-base font-bold text-[var(--text-secondary)]">
                  {user?.email}
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)] font-medium mt-1.5 ml-1">
                  El correo no se puede modificar desde aquí.
                </p>
              </div>

              {/* RU (solo lectura) */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
                  <Hash size={14} className="inline mr-1" />
                  Registro Universitario
                </label>
                <div className="w-full h-12 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-tertiary)]/50 px-4 flex items-center text-base font-bold text-[var(--text-secondary)]">
                  {user?.reg_univ}
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)] font-medium mt-1.5 ml-1">
                  Permanente, no se puede modificar.
                </p>
              </div>

              {/* CI (solo lectura) */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
                  <Hash size={14} className="inline mr-1" />
                  Cédula de Identidad
                </label>
                <div className="w-full h-12 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-tertiary)]/50 px-4 flex items-center text-base font-bold text-[var(--text-secondary)]">
                  {user?.id_card}
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)] font-medium mt-1.5 ml-1">
                  Permanente, no se puede modificar.
                </p>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
                  <Lock size={14} className="inline mr-1" />
                  Contraseña
                </label>
                <div className="w-full rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-tertiary)]/50 px-4 py-3 flex items-center justify-between">
                  <span className="text-base font-bold text-[var(--text-secondary)]">
                    {user?.password_changed ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400">
                        <ShieldCheck size={16} />
                        Personalizada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[var(--text-tertiary)]">
                        <ShieldX size={16} />
                        CI original
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => navigate('/student/change-password')}
                    className="text-xs font-black text-blue-400 hover:text-blue-300 uppercase tracking-wider transition-colors"
                  >
                    Cambiar
                  </button>
                </div>
              </div>

              {/* Carrera */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
                  <GraduationCap size={14} className="inline mr-1" />
                  Carrera
                </label>
                <input
                  type="text"
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                  placeholder="Ej. Ingeniería de Sistemas"
                  className="w-full h-12 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-input)] px-4 text-base font-bold text-[var(--text-primary)] outline-none transition-all focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] placeholder:text-[var(--text-tertiary)]"
                />
              </div>

              {/* Mensajes de feedback */}
              {successMsg && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm font-bold text-emerald-400">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-sm font-bold text-red-400">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Botón guardar */}
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  size="lg"
                  loading={saving}
                  className="rounded-2xl"
                >
                  <Save size={20} />
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Card>

          {/* Información de la cuenta */}
          <Card className="bg-[var(--bg-card)] backdrop-blur-xl border-[var(--border-color)] shadow-xl">
            <h3 className="text-lg font-black text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-400" />
              Detalles de la Cuenta
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--bg-tertiary)]/50 rounded-2xl border border-[var(--border-color)]">
                <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1">ID de Usuario</p>
                <p className="text-sm font-bold text-[var(--text-primary)] font-mono truncate">{user?.id}</p>
              </div>
              <div className="p-4 bg-[var(--bg-tertiary)]/50 rounded-2xl border border-[var(--border-color)]">
                <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Cédula de Identidad</p>
                <p className="text-sm font-bold text-[var(--text-primary)]">{user?.id_card}</p>
              </div>
              <div className="p-4 bg-[var(--bg-tertiary)]/50 rounded-2xl border border-[var(--border-color)]">
                <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Registrado</p>
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-BO', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  }) : '-'}
                </p>
              </div>
              <div className="p-4 bg-[var(--bg-tertiary)]/50 rounded-2xl border border-[var(--border-color)]">
                <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Rol</p>
                <p className="text-sm font-bold text-[var(--text-primary)] capitalize">{user?.role === 'student' ? 'Estudiante' : 'Administrador'}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
              <button
                onClick={handleLogoutAll}
                disabled={loggingOutAll}
                className="w-full h-12 rounded-xl border-2 border-red-500/30 bg-red-500/5 text-red-400 font-black text-sm transition-all hover:bg-red-500/15 hover:border-red-500/50 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {loggingOutAll ? (
                  <span className="w-5 h-5 rounded-full border-2 border-red-400/40 border-t-red-400 animate-spin" />
                ) : (
                  <LogOut size={18} />
                )}
                Cerrar sesión en todos los dispositivos
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
