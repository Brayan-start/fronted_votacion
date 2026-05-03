import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { mockAdmin, mockUser } from '../../services/mockData';
import { LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const [regUniv, setRegUniv] = useState('');
  const [idCard, setIdCard] = useState('');
  const [regUnivError, setRegUnivError] = useState('');
  const [idCardError, setIdCardError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegUnivChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegUniv(value);
    
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
    <div className="w-full max-w-md mx-auto">
      <Card className="p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
            <LogIn className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Bienvenido de nuevo</h2>
          <p className="text-gray-500 mt-2 text-center">Ingresa tus credenciales para acceder al sistema de votación UPEA</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Registro Universitario (RU)"
            placeholder="Ej: 20210001"
            value={regUniv}
            onChange={handleRegUnivChange}
            error={regUnivError}
            required
          />
          <Input
            label="Cédula de Identidad (CI)"
            type="password"
            placeholder="Ingresa tu CI"
            value={idCard}
            onChange={handleIdCardChange}
            error={idCardError}
            required
          />
          
          <Button type="submit" size="full" loading={loading} className="py-3">
            Iniciar Sesión
          </Button>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta activa?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                Regístrate ahora
              </Link>
            </p>
          </div>
        </form>
      </Card>
      
      <p className="text-center mt-8 text-xs text-gray-400 uppercase tracking-widest">
        Universidad Pública de El Alto &copy; 2026
      </p>
    </div>
  );
};

export default Login;
