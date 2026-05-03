import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Vote, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

import { MeshBackground } from './MeshBackground';

const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <MeshBackground />
      <header className="h-20 bg-white/40 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <Link to="/student/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Vote size={24} />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">VotU</span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{user?.name} {user?.lastName}</span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{user?.regUniv}</span>
            </div>
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
              {user?.name[0]}{user?.lastName[0]}
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title="Cerrar Sesión"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <footer className="bg-white/40 backdrop-blur-md border-t border-slate-200/50 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm font-medium">
          &copy; {new Date().getFullYear()} VotU &bull; Sistema de Votación Universitaria &bull; Versión 1.0
        </div>
      </footer>
    </div>
  );
};

export default StudentLayout;
