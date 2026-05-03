import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { 
  User, 
  Camera, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck,
  Info,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    regUniv: '',
    idCard: '',
    email: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    lastName: '',
    regUniv: '',
    idCard: '',
    email: '',
  });
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const webcamRef = useRef<Webcam>(null);
  const navigate = useNavigate();

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'name':
      case 'lastName':
        if (!value.trim()) error = 'Este campo es obligatorio';
        else if (value.length < 2) error = 'Mínimo 2 caracteres';
        break;
      case 'regUniv':
        if (!value) error = 'El RU es obligatorio';
        else if (!/^\d+$/.test(value)) error = 'Debe contener solo números';
        else if (value.length < 6) error = 'RU inválido (muy corto)';
        break;
      case 'idCard':
        if (!value) error = 'El CI es obligatorio';
        else if (!/^\d+$/.test(value)) error = 'Debe contener solo números';
        else if (value.length < 5) error = 'CI inválido';
        break;
      case 'email':
        if (!value) error = 'El correo es obligatorio';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Correo electrónico inválido';
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const isStep1Valid = 
    formData.name && !errors.name &&
    formData.lastName && !errors.lastName &&
    formData.regUniv && !errors.regUniv &&
    formData.idCard && !errors.idCard &&
    formData.email && !errors.email;

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setIsCameraOpen(false);
    }
  }, [webcamRef]);

  const handleFinalSubmit = async () => {
    setLoading(true);
    // Simular validación facial y registro
    setTimeout(() => {
      setLoading(false);
      nextStep(); // Ir al paso de éxito final o confirmación
    }, 2000);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Datos Personales</h2>
              <p className="text-gray-500">Paso 1 de 4: Información básica</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombres"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                required
              />
              <Input
                label="Apellidos"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                error={errors.lastName}
                required
              />
            </div>
            <Input
              label="Registro Universitario (RU)"
              name="regUniv"
              value={formData.regUniv}
              onChange={handleInputChange}
              error={errors.regUniv}
              required
            />
            <Input
              label="Cédula de Identidad (CI)"
              name="idCard"
              value={formData.idCard}
              onChange={handleInputChange}
              error={errors.idCard}
              required
            />
            <Input
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
            />
            <Button size="full" onClick={nextStep} className="mt-6" disabled={!isStep1Valid}>
              Siguiente <ArrowRight size={18} className="ml-2" />
            </Button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Instrucciones</h2>
              <p className="text-gray-500">Paso 2 de 4: Preparación para validación</p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-blue-100 rounded-full text-blue-600">
                  <Info size={20} />
                </div>
                <ul className="text-sm text-blue-800 space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-blue-600" /> Sin lentes u objetos que cubran el rostro
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-blue-600" /> Asegúrate de tener buena iluminación
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-blue-600" /> Rostro completamente visible y centrado
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-blue-600" /> Sin filtros ni ediciones
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-blue-600" /> Fondo preferiblemente claro y uniforme
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" size="full" onClick={prevStep}>
                <ArrowLeft size={18} className="mr-2" /> Volver
              </Button>
              <Button size="full" onClick={nextStep}>
                Entendido <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Captura de Identidad</h2>
              <p className="text-gray-500">Paso 3 de 4: Validación Facial</p>
            </div>

            <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border-4 border-gray-100 shadow-inner flex items-center justify-center">
              {isCameraOpen ? (
                <>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                    videoConstraints={{ facingMode: "user" }}
                  />
                  <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                    <div className="w-full h-full border-2 border-white/50 rounded-[100%] border-dashed"></div>
                  </div>
                  <Button 
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full w-14 h-14 p-0 shadow-2xl border-4 border-white"
                    onClick={capture}
                  >
                    <Camera size={24} />
                  </Button>
                </>
              ) : capturedImage ? (
                <img src={capturedImage} alt="Capture" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="text-gray-400" size={32} />
                  </div>
                  <Button onClick={() => setIsCameraOpen(true)}>
                    Abrir Cámara
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button variant="outline" size="full" onClick={prevStep}>
                <ArrowLeft size={18} className="mr-2" /> Volver
              </Button>
              <Button size="full" onClick={nextStep} disabled={!capturedImage}>
                Siguiente <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Confirmación</h2>
              <p className="text-gray-500">Paso 4 de 4: Finalizar registro</p>
            </div>

            <div className="bg-white border rounded-2xl p-6 shadow-sm flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {capturedImage && <img src={capturedImage} alt="Profile" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{formData.name} {formData.lastName}</h3>
                <p className="text-gray-500 text-sm truncate">{formData.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <ShieldCheck size={12} /> Validación Facial Lista
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs text-amber-800 leading-relaxed">
                Al hacer clic en "Finalizar Registro", confirmas que la información proporcionada es verídica y que el rostro capturado corresponde a tu identidad universitaria.
              </p>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" size="full" onClick={prevStep} disabled={loading}>
                <ArrowLeft size={18} className="mr-2" /> Volver
              </Button>
              <Button size="full" onClick={handleFinalSubmit} loading={loading}>
                Finalizar Registro <CheckCircle size={18} className="ml-2" />
              </Button>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8 space-y-6"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
              <UserCheck size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">¡Registro Exitoso!</h2>
              <p className="text-gray-500 mt-2">Tu cuenta ha sido creada y verificada correctamente.</p>
            </div>
            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
              Ahora puedes iniciar sesión con tu RU y CI para participar en las elecciones de la UPEA.
            </p>
            <Button size="full" onClick={() => navigate('/login')}>
              Ir al Login
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-8">
      {step < 5 && (
        <div className="flex justify-between mb-8 px-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  step === i 
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-lg' 
                    : step > i 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > i ? <CheckCircle size={20} /> : i}
              </div>
            </div>
          ))}
        </div>
      )}

      <Card className="p-8 overflow-hidden">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </Card>

      {step < 5 && (
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default Register;
