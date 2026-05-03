import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';

// Public Pages
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Elections from './pages/admin/Elections';
import Categories from './pages/admin/Categories';
import Candidates from './pages/admin/Candidates';
import Students from './pages/admin/Students';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import Vote from './pages/student/Vote';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="elections" element={<Elections />} />
            <Route path="categories" element={<Categories />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="results" element={<div className="p-4 bg-white rounded-lg shadow text-center py-20 text-gray-500">Módulo de resultados en tiempo real (Visualización de Gráficas)</div>} />
            <Route path="students" element={<Students />} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="vote/:id" element={<Vote />} />
            <Route index element={<Navigate to="/student/dashboard" replace />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
