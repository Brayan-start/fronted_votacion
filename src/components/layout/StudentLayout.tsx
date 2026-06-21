import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Vote, LogOut, Sun, Moon, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { MeshBackground } from './MeshBackground';
import { motion, AnimatePresence } from 'framer-motion';

const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <MeshBackground />
      <header className="h-20 bg-[var(--bg-secondary)]/60 backdrop-blur-md border-b border-[var(--border-color)] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <Link to="/student/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Vote size={24} />
            </div>
            <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">UPEA <span className="text-blue-500">Vota</span></span>
          </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={toggleTheme}
                className="p-2.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white/5 rounded-xl transition-all border border-[var(--border-color)]"
                title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Enlace a Mi Perfil */}
              <Link
                to="/student/profile"
                className="p-2.5 text-[var(--text-tertiary)] hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all border border-[var(--border-color)]"
                title="Mi Perfil"
              >
                <User size={20} />
              </Link>

              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-[var(--text-primary)]">{user?.name} {user?.last_name}</span>
                <span className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wider">{user?.reg_univ}</span>
              </div>
              <Link
                to="/student/profile"
                className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md border-2 border-[var(--border-color)] shrink-0 hover:scale-105 transition-transform cursor-pointer"
                title="Mi Perfil"
              >
                {user?.photo_url ? (
                  <img src={user.photo_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <>{user?.name?.[0]}{user?.last_name?.[0]}</>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 text-[var(--text-secondary)] hover:text-[var(--accent-red)] hover:bg-red-500/10 rounded-xl transition-all border border-[var(--border-color)]"
                title="Cerrar Sesión"
              >
                <LogOut size={22} />
              </button>
            </div>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-[var(--bg-secondary)]/40 backdrop-blur-md border-t border-[var(--border-color)] py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center text-[var(--text-tertiary)] text-sm font-medium">
          &copy; {new Date().getFullYear()} UPEA Vota &bull; Sistema de Votación Universitaria &bull; Universidad Pública de El Alto
        </div>
      </footer>
    </div>
  );
};

export default StudentLayout;
