import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Vote, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <Link to="/student/dashboard" className="flex items-center gap-2">
            <Vote className="text-blue-600" size={28} />
            <span className="text-xl font-bold text-gray-900">VotU</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium">{user?.name} {user?.lastName}</span>
              <span className="text-xs text-gray-500">{user?.regUniv}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {user?.name[0]}{user?.lastName[0]}
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} VotU - Sistema de Votación Universitaria
        </div>
      </footer>
    </div>
  );
};

export default StudentLayout;
