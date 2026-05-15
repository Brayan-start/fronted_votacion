import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { CameraModal } from '../../components/ui/CameraModal';
import { authService } from '../../services/authService';
import { 
  Camera, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck,
  Info,
  UserCheck,
  RefreshCcw,
  UserMinus
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
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
        else if (value.length < 6) error = 'El CI debe tener al menos 6 dígitos';
        break;
      case 'email':
        if (!value) error = 'El correo es obligatorio';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Correo electrónico inválido';
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

  const isStep1Valid = formData.name && !errors.name && formData.lastName && !errors.lastName && formData.regUniv && !errors.regUniv && formData.idCard && !errors.idCard && formData.email && !errors.email;

  const handleCapture = (image: string) => {
    setCapturedImage(image);
    setIsCameraModalOpen(false);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      await authService.register({
        name: formData.name,
        last_name: formData.lastName,
        reg_univ: formData.regUniv,
        id_card: formData.idCard,
        email: formData.email,
        password: formData.idCard,
        role: 'student',
        photo_base64: capturedImage
      });
      setStep(5);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="text-center mb-6"><h2 className="text-2xl font-bold text-gray-900">Datos Personales</h2><p className="text-gray-500">Información básica de estudiante</p></div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombres" name="name" value={formData.name} onChange={handleInputChange} error={errors.name} required />
              <Input label="Apellidos" name="lastName" value={formData.lastName} onChange={handleInputChange} error={errors.lastName} required />
            </div>
            <Input label="Registro Universitario (RU)" name="regUniv" value={formData.regUniv} onChange={handleInputChange} error={errors.regUniv} required />
            <Input label="Cédula de Identidad (CI)" name="idCard" value={formData.idCard} onChange={handleInputChange} error={errors.idCard} required />
            <Input label="Correo Electrónico" name="email" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} required />
            <Button size="full" onClick={() => setStep(2)} className="mt-6" disabled={!isStep1Valid}>Siguiente <ArrowRight size={18} className="ml-2" /></Button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center mb-6"><h2 className="text-2xl font-bold text-gray-900">Validación Biométrica</h2><p className="text-gray-500">Paso 2 de 4: Requisitos</p></div>
            <div className="bg-blue-50 p-6 rounded-3xl space-y-4 border border-blue-100">
              <div className="flex items-start gap-3"><div className="p-2 bg-blue-100 rounded-2xl text-blue-600"><Info size={24} /></div>
                <ul className="text-sm text-blue-900 space-y-3 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-600" /> Sin accesorios faciales</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-600" /> Buena iluminación</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-blue-600" /> Rostro centrado en el marco</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="full" onClick={() => setStep(1)}><ArrowLeft size={18} className="mr-2" /> Volver</Button>
              <Button size="full" onClick={() => setStep(3)}>Entendido <ArrowRight size={18} className="ml-2" /></Button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center mb-6"><h2 className="text-2xl font-bold text-gray-900">Captura de Perfil</h2><p className="text-gray-500">Paso 3 de 4: Imagen oficial</p></div>
            <div className="relative aspect-[4/3] bg-slate-900 rounded-[2.5rem] overflow-hidden border-8 border-slate-50 shadow-2xl flex items-center justify-center">
              {capturedImage ? (
                <div className="relative w-full h-full">
                  <img src={capturedImage} alt="Profile" className="w-full h-full object-cover" />
                  <button onClick={() => setCapturedImage(null)} className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"><RefreshCcw size={20} /></button>
                </div>
              ) : (
                <div className="text-center p-10">
                  <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400 shadow-inner"><Camera size={48} /></div>
                  <Button onClick={() => setIsCameraModalOpen(true)} className="rounded-2xl px-10 py-5 bg-indigo-600 shadow-xl">Iniciar Cámara</Button>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="full" onClick={() => setStep(2)}><ArrowLeft size={18} className="mr-2" /> Volver</Button>
              <Button size="full" onClick={() => setStep(4)} disabled={!capturedImage}>Continuar <ArrowRight size={18} className="ml-2" /></Button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="text-center mb-6"><h2 className="text-2xl font-bold text-gray-900">Finalizar Registro</h2><p className="text-gray-500">Resumen de información</p></div>
            <div className="bg-slate-50 border-2 border-white rounded-[2rem] p-6 shadow-xl flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border-2 border-slate-100 flex-shrink-0 shadow-sm">{capturedImage && <img src={capturedImage} alt="Profile" className="w-full h-full object-cover" />}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-900 text-lg truncate leading-tight">{formData.name} {formData.lastName}</h3>
                <p className="text-slate-500 text-sm font-medium truncate">{formData.email}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-600 border border-green-500/20"><ShieldCheck size={14} /> Biometría Lista</div>
              </div>
            </div>
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100"><p className="text-xs text-amber-800 leading-relaxed font-medium text-center italic">Declaro que la información es verídica y el rostro capturado me pertenece legalmente.</p></div>
            <div className="flex gap-4">
              <Button variant="outline" size="full" onClick={() => setStep(3)} disabled={loading}><ArrowLeft size={18} className="mr-2" /> Volver</Button>
              <Button size="full" onClick={handleFinalSubmit} loading={loading} className="bg-slate-900 hover:bg-black py-5">Confirmar y Registrar</Button>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10 space-y-8">
            <div className="w-28 h-28 bg-green-50 text-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-green-100 border-4 border-white"><UserCheck size={64} /></div>
            <div><h2 className="text-4xl font-black text-slate-900">¡Bienvenido!</h2><p className="text-slate-500 mt-2 font-medium">Tu cuenta universitaria ha sido activada.</p></div>
            <Button size="full" onClick={() => navigate('/login')} className="py-6 rounded-3xl text-lg font-black bg-indigo-600 shadow-2xl">Iniciar Sesión Ahora</Button>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-10 px-4">
      {step < 5 && (
        <div className="flex justify-between mb-10 px-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${step === i ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 scale-110' : step > i ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {step > i ? <CheckCircle size={24} /> : i}
              </div>
            </div>
          ))}
        </div>
      )}

      <Card className="rounded-[3rem] border-none shadow-2xl p-10 bg-white/80 backdrop-blur-xl relative overflow-hidden">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </Card>

      <CameraModal 
        isOpen={isCameraModalOpen} 
        onClose={() => setIsCameraModalOpen(false)} 
        onCapture={handleCapture} 
        mode="capture"
        title="Registro de Identidad"
      />

      {step < 5 && (
        <div className="text-center mt-8 font-medium">
          <p className="text-slate-400 text-sm">¿Ya eres parte de la plataforma? <Link to="/login" className="text-indigo-600 font-black hover:underline underline-offset-4">Inicia sesión</Link></p>
        </div>
      )}
    </div>
  );
};

export default Register;
