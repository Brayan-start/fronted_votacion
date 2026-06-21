import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Vote, 
  Layers, 
  Users, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Sun,
  Moon,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { MeshBackground } from './MeshBackground';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Inicio', path: '/admin/dashboard' },
    { icon: Vote, label: 'Elecciones', path: '/admin/elections' },
    { icon: Layers, label: 'Categorías', path: '/admin/categories' },
    { icon: Users, label: 'Candidatos', path: '/admin/candidates' },
    { icon: BarChart3, label: 'Resultados', path: '/admin/results' },
    { icon: Users, label: 'Estudiantes', path: '/admin/students' },
    { icon: Shield, label: 'Auditoría', path: '/admin/auditoria' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex relative">
      <MeshBackground />
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[var(--bg-sidebar)] backdrop-blur-xl border-r border-[var(--border-color)] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Vote size={24} />
              </div>
              <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">UPEA <span className="text-blue-500">Vota</span></h1>
            </div>
            <button className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-[var(--text-secondary)]" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 border border-blue-500/20 font-bold' 
                      : 'text-[var(--text-tertiary)] hover:bg-white/5 hover:text-[var(--text-primary)] font-medium'}
                  `}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight size={16} className="ml-auto text-blue-400" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-6 border-t border-[var(--border-color)]">
            <div className="bg-[var(--bg-tertiary)]/50 rounded-2xl p-4 mb-4 flex items-center gap-3 border border-[var(--border-color)]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shrink-0">
                {user?.name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] truncate">{user?.name} {user?.last_name}</p>
                <p className="text-xs text-[var(--text-tertiary)] font-medium truncate uppercase tracking-wider">{user?.role}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleTheme}
                className="flex-1 !rounded-xl border border-[var(--border-color)]"
                title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="flex-1 !rounded-xl border border-[var(--border-color)] text-[var(--accent-red)] hover:bg-red-500/10"
              >
                <LogOut size={16} />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-20 bg-[var(--bg-secondary)]/60 backdrop-blur-md border-b border-[var(--border-color)] flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2.5 hover:bg-white/5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)]" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)]/50 rounded-full border border-[var(--border-color)] text-sm font-semibold text-[var(--text-secondary)]">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <button
              onClick={toggleTheme}
              className="p-2.5 hover:bg-white/5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto space-y-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
