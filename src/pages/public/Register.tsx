import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Camera, RefreshCw } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    regUniv: '',
    idCard: '',
  });
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const navigate = useNavigate();

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
    }
  }, [webcamRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert('Debes capturar tu foto facial para el registro.');
      return;
    }
    setLoading(true);
    // Simular registro
    setTimeout(() => {
      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      navigate('/login');
      setLoading(false);
    }, 1500);
  };

  const videoConstraints = {
    width: 400,
    height: 400,
    facingMode: 'user',
  };

  return (
    <Card className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Registro de Estudiante</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombres"
            placeholder="Juan"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Apellidos"
            placeholder="Pérez"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
          <Input
            label="Registro Univ."
            placeholder="20210001"
            value={formData.regUniv}
            onChange={(e) => setFormData({ ...formData, regUniv: e.target.value })}
            required
          />
          <Input
            label="Cédula"
            placeholder="12345678"
            value={formData.idCard}
            onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Validación Facial</label>
          <div className="relative aspect-square w-full max-w-[300px] mx-auto bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300">
            {!image ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={capture}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera size={24} />
                </button>
              </>
            ) : (
              <>
                <img src={image} alt="Capture" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw size={24} />
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-center text-gray-500">
            Asegúrate de que tu rostro sea visible y esté bien iluminado.
          </p>
        </div>

        <Button type="submit" size="full" loading={loading}>
          Registrarse
        </Button>

        <div className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Inicia Sesión
          </Link>
        </div>
      </form>
    </Card>
  );
};

export default Register;
