import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, LogIn, User, Lock, Sun, Moon, Sparkles, AlertTriangle, Home } from 'lucide-react';
import Swal from 'sweetalert2';
import ReCAPTCHA from 'react-google-recaptcha'; // Widget de reCAPTCHA v2
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/authService';
import BallotAnimation from '../../components/ui/BallotAnimation';

const Login: React.FC = () => {
  const [regUniv, setRegUniv] = useState('');
  const [idCard, setIdCard] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegUnivFocused, setIsRegUnivFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null); // Ref para controlar el widget de reCAPTCHA
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null); // Token generado por reCAPTCHA
  const [recaptchaError, setRecaptchaError] = useState(false); // Indica si el reCAPTCHA falló/expiró

  // ── Validación de site key al cargar el componente ──────────────────────
  const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const RECAPTCHA_TEST_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
  // Si en producción se deja la clave de prueba, se advierte en consola
  if (RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY === RECAPTCHA_TEST_KEY && import.meta.env.PROD) {
    console.warn(
      '[reCAPTCHA] ADVERTENCIA: Se está usando la clave de PRUEBA en producción. ' +
      'Regístrate en https://www.google.com/recaptcha/admin y configura VITE_RECAPTCHA_SITE_KEY ' +
      'con una clave real para tu dominio.'
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!regUniv.trim() || !idCard.trim()) {
      setError('Registro universitario o cédula de identidad incorrectos. Intenta nuevamente.');
      Swal.fire({
        icon: 'warning',
        title: 'Campos vacíos',
        text: 'Por favor completa todos los campos para iniciar sesión.',
        confirmButtonColor: '#3b82f6',
        background: theme === 'dark' ? '#1a1d29' : '#ffffff',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
      });
      return;
    }

    // --- Validación de reCAPTCHA del lado del cliente ---
    if (!recaptchaToken) {
      setRecaptchaError(true);
      setError('Por favor completa el desafío "No soy un robot" antes de continuar.');
      Swal.fire({
        icon: 'warning',
        title: 'reCAPTCHA requerido',
        text: 'Debes confirmar que no eres un robot para iniciar sesión.',
        confirmButtonColor: '#3b82f6',
        background: theme === 'dark' ? '#1a1d29' : '#ffffff',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
      });
      return;
    }

    if (loading) return;

    setLoading(true);
    setError('');

    try {
      // Se envía el token de reCAPTCHA al servidor para validación adicional
      const response = await authService.login({
        reg_univ: regUniv.trim(),
        id_card: idCard.trim(),
        recaptcha_token: recaptchaToken,
      });

      setIsSuccess(true);
      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: `Inicio de sesión exitoso, ${response.user.name}`,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: theme === 'dark' ? '#1a1d29' : '#ffffff',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
      });
      login(response.access_token, response.user);
      navigate(response.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (submitError: unknown) {
      const err = submitError as { response?: { data?: { detail?: string } } };
      const detail = err.response?.data?.detail || 'Registro universitario o cédula de identidad incorrectos. Intenta nuevamente.';
      setError(detail);
      setIsError(true);
      setTimeout(() => setIsError(false), 1800);

      // Si el error es por reCAPTCHA, se reinicia el widget para que el usuario lo resuelva de nuevo
      if (detail.toLowerCase().includes('recaptcha')) {
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        setRecaptchaError(true);
      }

      await Swal.fire({
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: detail,
        confirmButtonColor: '#ef4444',
        background: theme === 'dark' ? '#1a1d29' : '#ffffff',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="hidden lg:flex lg:w-[45%] relative flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 px-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-400/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 w-full flex-1 flex items-center justify-center px-4 min-h-0"
        >
          <BallotAnimation
            focusField={isRegUnivFocused ? 'reg_univ' : isPasswordFocused ? 'id_card' : 'none'}
            typingTotal={Math.min(100, (regUniv.length + idCard.length) * 2.5)}
            isSubmitting={loading}
            isSuccess={isSuccess}
            isError={isError}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative z-10 mt-4 text-center"
        >
          <h2 className="text-3xl font-black text-white">UPEA Vota</h2>
          <p className="mt-2 text-base font-medium text-blue-200/80">
            Elecciones transparentes y seguras
          </p>
        </motion.div>
      </div>

      <div className="flex flex-1 items-center justify-center p-2 sm:p-4">
        <motion.div className="fixed top-5 right-5 z-50 flex items-center gap-2">
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors shadow-lg"
            aria-label="Ir al inicio"
          >
            <Home size={18} />
          </Link>
          <motion.button
            onClick={toggleTheme}
            whileTap={{ scale: 0.9 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors shadow-lg"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-[460px]"
        >
          <div className="lg:hidden mb-4 text-center w-full max-w-[340px] mx-auto">
            <BallotAnimation
              focusField={isRegUnivFocused ? 'reg_univ' : isPasswordFocused ? 'id_card' : 'none'}
              typingTotal={Math.min(100, (regUniv.length + idCard.length) * 2.5)}
              isSubmitting={loading}
              isSuccess={isSuccess}
              isError={isError}
            />
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 backdrop-blur-xl px-5 pb-6 pt-8 shadow-[var(--shadow-xl)] sm:px-6 sm:pb-8">
              <div className="mb-8 text-center">
                <motion.div
                  initial={{ rotate: -6, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 12 }}
                  className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                >
                  <Sparkles size={28} />
                </motion.div>
                <h1 className="text-4xl font-black leading-tight text-[var(--text-primary)] sm:text-4xl">Bienvenido</h1>
                <p className="mt-3 text-sm font-semibold text-[var(--text-secondary)]">
                  Accede a tu plataforma electoral universitaria
                </p>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 ml-1 block text-xs font-black uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                    Registro Universitario
                  </span>
                  <span className="relative block">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={20} />
                    <input
                      type="text"
                      value={regUniv}
                      onFocus={() => { setIsRegUnivFocused(true); setIsPasswordFocused(false); setError(''); }}
                      onBlur={() => setIsRegUnivFocused(false)}
                      onChange={(e) => { setRegUniv(e.target.value); setError(''); }}
                      placeholder="Ej. 20001234"
                      required
                      className={`h-14 w-full rounded-2xl border-2 bg-[var(--bg-input)] pl-12 pr-4 text-base font-bold text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-tertiary)] focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] ${
                        error ? 'border-red-500/50' : 'border-[var(--border-color)] focus:border-blue-500'
                      }`}
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 ml-1 block text-xs font-black uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                    Cédula de Identidad
                  </span>
                  <span className="relative block">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={idCard}
                      onFocus={() => { setIsPasswordFocused(true); setIsRegUnivFocused(false); setError(''); }}
                      onBlur={() => setIsPasswordFocused(false)}
                      onChange={(e) => { setIdCard(e.target.value); setError(''); }}
                      placeholder="Tu CI como contraseña"
                      required
                      className={`h-14 w-full rounded-2xl border-2 bg-[var(--bg-input)] pl-12 pr-12 text-base font-bold text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-tertiary)] focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] ${
                        error ? 'border-red-500/50' : 'border-[var(--border-color)] focus:border-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-[var(--text-tertiary)] transition-colors hover:bg-white/5 hover:text-blue-400"
                      aria-label={showPassword ? 'Ocultar cédula' : 'Mostrar cédula'}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </span>
                </label>

                {/* Widget de Google reCAPTCHA v2 — Checkbox "No soy un robot"
                    Se renderiza antes del botón de ingreso. La site key se carga desde
                    VITE_RECAPTCHA_SITE_KEY. Si no está configurada, usa la clave de
                    prueba oficial de Google (siempre pasa, útil en desarrollo).        */}
                <div className={`flex justify-center pt-1 ${recaptchaError ? '[&_iframe]:border-2 [&_iframe]:border-red-500/50 [&_iframe]:rounded-lg' : ''}`}>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                    theme={theme === 'dark' ? 'dark' : 'light'}
                    onChange={(token: string | null) => {
                      // El usuario resolvió el desafío correctamente
                      // El token se envía al backend para verificación server-side
                      if (token) {
                        console.log('[reCAPTCHA] Token generado correctamente');
                      }
                      setRecaptchaToken(token);
                      setRecaptchaError(false);
                      setError('');
                    }}
                    onExpired={() => {
                      // El token expira automáticamente tras 2 minutos
                      setRecaptchaToken(null);
                      setRecaptchaError(true);
                      setError('El código de seguridad expiró. Vuelve a marcar "No soy un robot".');
                    }}
                    onError={() => {
                      // Error de red o clave de sitio inválida
                      setRecaptchaToken(null);
                      setRecaptchaError(true);
                      setError('Error al cargar el sistema de seguridad. Recarga la página o contacta al administrador.');
                    }}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="mt-2 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-lg font-black text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500 disabled:pointer-events-none disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white"
                      />
                      Validando...
                    </>
                  ) : (
                    <>
                      <LogIn size={21} />
                      Entrar ahora
                    </>
                  )}
                </motion.button>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3.5 text-sm font-bold text-red-400"
                    >
                      <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="pt-4 text-center text-sm font-bold text-[var(--text-tertiary)]">
                  ¿Aún no tienes cuenta?{' '}
                  <Link to="/register" className="text-blue-400 underline-offset-4 hover:underline hover:text-blue-300">
                    Crear una cuenta
                  </Link>
                </p>
              </form>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-[var(--border-color)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--text-tertiary)]">
              Seguro y personal
            </span>
            <span className="h-px w-12 bg-[var(--border-color)]" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
