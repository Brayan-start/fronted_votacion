import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">VotU</h1>
          <p className="text-gray-500">Sistema de Votación Universitaria</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default PublicLayout;
