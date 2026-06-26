import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';
import StudentSidebarLayout from './components/layout/StudentSidebarLayout';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import VerifyCarnet from './pages/public/VerifyCarnet';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Elections from './pages/admin/Elections';
import Categories from './pages/admin/Categories';
import Candidates from './pages/admin/Candidates';
import Students from './pages/admin/Students';
import Results from './pages/admin/Results';
import Auditoria from './pages/admin/Auditoria';
import UsuariosRegistrados from './pages/admin/UsuariosRegistrados';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import Vote from './pages/student/Vote';
import Profile from './pages/student/Profile';
import Inicio from './pages/student/Inicio';
import Historial from './pages/student/Historial';
import Carnet from './pages/student/Carnet';
import ChangePassword from './pages/student/ChangePassword';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<Landing />} />

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
            <Route path="results" element={<Results />} />
            <Route path="students" element={<Students />} />
            <Route path="usuarios" element={<UsuariosRegistrados />} />
            <Route path="auditoria" element={<Auditoria />} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Student Routes — Panel con Sidebar */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentSidebarLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Inicio />} />
            <Route path="vote/:id" element={<Vote />} />
            <Route path="profile" element={<Profile />} />
            <Route path="history" element={<Historial />} />
            <Route path="carnet" element={<Carnet />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route index element={<Navigate to="/student/dashboard" replace />} />
          </Route>

          {/* Student Routes (layout anterior sin sidebar, compatibilidad) */}
          <Route
            path="/student/legacy"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route index element={<Navigate to="/student/legacy/dashboard" replace />} />
          </Route>

          {/* Public Verification Route — sin layout, standalone */}
          <Route path="/verify-carnet" element={<VerifyCarnet />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
