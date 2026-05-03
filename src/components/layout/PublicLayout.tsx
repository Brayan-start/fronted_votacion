import React from 'react';
import { Outlet } from 'react-router-dom';
import { MeshBackground } from './MeshBackground';
import { Vote } from 'lucide-react';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <MeshBackground />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 mb-4 animate-bounce-slow">
            <Vote size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">VotU</h1>
          <p className="text-slate-500 font-medium">Elecciones transparentes y seguras</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default PublicLayout;
