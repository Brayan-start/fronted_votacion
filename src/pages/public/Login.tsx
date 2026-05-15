import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { authService } from '../../services/authService';
import AnimatedCharacter from '../../components/ui/AnimatedCharacter';
import { ShieldAlert, LogIn, UserCircle, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login: React.FC = () => {
  const [regUniv, setRegUniv] = useState('');
  const [idCard, setIdCard] = useState('');
  const [regUnivError, setRegUnivError] = useState('');
  const [idCardError, setIdCardError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Animation States for the Character
  const [isHiding, setIsHiding] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Mouse tracking for eyes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position (0 to 1)
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleRegUnivChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegUniv(value);
    setError('');
    setIsError(false);
    
    // When typing, look more towards the input area if not being tracked by mouse
    // (Mouse tracking is primary, but typing gives a "focused" look)

    if (value === 'admin' || value === '') {
      setRegUnivError('');
      return;
    }

    if (!/^\d+$/.test(value)) {
      setRegUnivError('El RU debe contener solo números');
    } else {
      setRegUnivError('');
    }
  };

  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIdCard(value);
    setError('');
    setIsError(false);

    if (value === 'admin' || value === '') {
      setIdCardError('');
      return;
    }

    if (!/^\d+$/.test(value)) {
      setIdCardError('La cédula debe contener solo números');
    } else {
      setIdCardError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regUnivError || idCardError) return;
    setLoading(true);
    setError('');
    setIsError(false);

    try {
      console.log(`[DEV] Intentando login para RU: ${regUniv}`);
      const response = await authService.login({
        reg_univ: regUniv,
        id_card: idCard
      });
      
      setIsSuccess(true);
      
      // Delay to show success animation
      setTimeout(() => {
        login(response.access_token, response.user);
        if (response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }, 1500);

    } catch (err: any) {
      console.error("[DEV] Error en login:", err);
      setError(err.response?.data?.detail || 'Credenciales incorrectas. Reintenta.');
      setIsError(true);
      // Shake animation and reset error state
      setTimeout(() => setIsError(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#F8FAFC] overflow-hidden relative font-sans">
      {/* Abstract Background Shapes (WeStud Style) */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-50 rounded-bl-[100px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-blue-50 rounded-tr-[80px] -z-10"></div>
      
      {/* Decorative Floating Dots */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-indigo-200 rounded-full"></div>
      <div className="absolute top-40 right-40 w-6 h-6 bg-pink-100 rounded-full"></div>
      <div className="absolute bottom-20 right-20 w-8 h-8 bg-blue-100 rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[480px] relative z-20"
      >
        {/* Interactive Mascot */}
        <AnimatedCharacter 
          isHiding={isHiding} 
          mousePos={mousePos} 
          isSuccess={isSuccess}
          isError={isError}
        />

        <Card className="p-12 bg-white shadow-[0_40px_100px_-20px_rgba(79,70,229,0.12)] border border-indigo-50/50 rounded-[3rem] relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-2xl mb-6 shadow-lg shadow-indigo-200"
            >
              <LogIn size={32} />
            </motion.div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Bienvenido</h1>
            <p className="text-slate-500 font-medium">Accede a la plataforma electoral UPEA</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-8"
              >
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3">
                  <ShieldAlert size={20} className="shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Registro Universitario</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <UserCircle size={22} />
                </div>
                <input
                  type="text"
                  placeholder="Ej. 20001234"
                  value={regUniv}
                  onChange={handleRegUnivChange}
                  onFocus={() => setIsHiding(false)}
                  required
                  className={`
                    w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold text-slate-700
                    ${regUnivError ? 'border-red-200 bg-red-50' : 'border-transparent focus:border-indigo-600 focus:bg-white focus:shadow-xl focus:shadow-indigo-50'}
                  `}
                />
              </div>
              {regUnivError && <p className="text-xs text-red-500 font-bold ml-1 mt-1">{regUnivError}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Cédula de Identidad</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <KeyRound size={22} />
                </div>
                <input
                  type="password"
                  placeholder="Tu contraseña (CI)"
                  value={idCard}
                  onChange={handleIdCardChange}
                  onFocus={() => setIsHiding(true)} 
                  onBlur={() => setIsHiding(false)}
                  required
                  className={`
                    w-full pl-12 pr-4 py-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold text-slate-700
                    ${idCardError ? 'border-red-200 bg-red-50' : 'border-transparent focus:border-indigo-600 focus:bg-white focus:shadow-xl focus:shadow-indigo-50'}
                  `}
                />
              </div>
              {idCardError && <p className="text-xs text-red-500 font-bold ml-1 mt-1">{idCardError}</p>}
            </div>
            
            <Button 
              type="submit" 
              size="full" 
              loading={loading} 
              className={`
                py-5 rounded-2xl text-lg font-black transition-all shadow-xl
                ${isSuccess ? 'bg-green-500 hover:bg-green-600 shadow-green-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}
              `}
            >
              {isSuccess ? '¡Listo!' : 'Entrar ahora'}
            </Button>

            <div className="text-center pt-8">
              <p className="text-sm text-slate-400 font-bold">
                ¿Aún no tienes cuenta?{' '}
                <Link to="/register" className="text-indigo-600 font-black hover:underline underline-offset-4 decoration-2">
                  Crear una cuenta
                </Link>
              </p>
            </div>
          </form>
        </Card>
        
        <div className="flex items-center justify-center gap-6 mt-12">
          <span className="w-12 h-px bg-slate-200"></span>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.4em]">UPEA VOTA &bull; 2026</p>
          <span className="w-12 h-px bg-slate-200"></span>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
