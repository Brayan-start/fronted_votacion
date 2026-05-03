import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { mockAdmin, mockUser } from '../../services/mockData';

const Login: React.FC = () => {
  const [regUniv, setRegUniv] = useState('');
  const [idCard, setIdCard] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulando llamada a API
    setTimeout(() => {
      if (regUniv === 'admin' && idCard === 'admin') {
        login('fake-jwt-token-admin', { ...mockAdmin });
        navigate('/admin/dashboard');
      } else {
        login('fake-jwt-token-student', { ...mockUser, regUniv, idCard });
        navigate('/student/dashboard');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
        <Input
          label="Registro Universitario"
          placeholder="Ej: 20210001"
          value={regUniv}
          onChange={(e) => setRegUniv(e.target.value)}
          required
        />
        <Input
          label="Cédula de Identidad"
          type="password"
          placeholder="********"
          value={idCard}
          onChange={(e) => setIdCard(e.target.value)}
          required
        />
        <Button type="submit" size="full" loading={loading}>
          Entrar
        </Button>
        <div className="text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Regístrate aquí
          </Link>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-500">
          <p>Mock Credentials:</p>
          <p>Admin: admin / admin</p>
          <p>Student: cualquer / valor</p>
        </div>
      </form>
    </Card>
  );
};

export default Login;
