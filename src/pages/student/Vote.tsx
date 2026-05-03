import React, { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { mockElections, mockCategories, mockCandidates } from '../../services/mockData';
import { CheckCircle2, User, Camera, ShieldCheck, AlertTriangle } from 'lucide-react';

const Vote: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const election = mockElections.find(e => e.id === id);

  const [step, setStep] = useState(1); // 1: Seleccion, 2: Validacion Facial, 3: Confirmacion
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'success' | 'fail' | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidate(candidateId);
  };

  const startVerification = () => {
    setStep(2);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    // Simular reconocimiento facial
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult('success');
      setTimeout(() => setStep(3), 1500);
    }, 2000);
  };

  const handleConfirmVote = () => {
    alert('¡Tu voto ha sido registrado correctamente!');
    navigate('/student/dashboard');
  };

  if (!election) return <div>Elección no encontrada.</div>;

  const currentCandidate = mockCandidates.find(c => c.id === selectedCandidate);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between px-4 sm:px-10 py-4 bg-white rounded-xl shadow-sm border border-gray-100">
        {[
          { step: 1, label: 'Selección' },
          { step: 2, label: 'Verificación' },
          { step: 3, label: 'Confirmación' }
        ].map((s) => (
          <div key={s.step} className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
              step >= s.step ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {s.step}
            </div>
            <span className={`text-xs font-medium ${step >= s.step ? 'text-blue-600' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{election.title}</h2>
            <p className="text-gray-500">Selecciona al candidato de tu preferencia para la categoría: <strong>Rector</strong></p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {mockCandidates.map((candidate) => (
              <div 
                key={candidate.id}
                onClick={() => handleSelectCandidate(candidate.id)}
                className={`
                  relative cursor-pointer group rounded-2xl border-2 p-4 transition-all
                  ${selectedCandidate === candidate.id ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-blue-200'}
                `}
              >
                {selectedCandidate === candidate.id && (
                  <div className="absolute top-4 right-4 text-blue-600">
                    <CheckCircle2 size={24} />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img src={candidate.photoUrl} alt={candidate.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{candidate.name}</h4>
                    <p className="text-sm text-gray-500 line-clamp-1">{candidate.description}</p>
                  </div>
                </div>
                {candidate.videoUrl && (
                  <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-center text-blue-600 font-medium">
                    Ver video de propuesta
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Button 
              size="lg" 
              disabled={!selectedCandidate} 
              onClick={startVerification}
              className="px-10"
            >
              Continuar
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <Card className="max-w-md mx-auto animate-in zoom-in duration-300">
          <div className="text-center space-y-4">
            <ShieldCheck size={48} className="mx-auto text-blue-600" />
            <h2 className="text-xl font-bold">Verificación de Identidad</h2>
            <p className="text-sm text-gray-500">
              Para garantizar la transparencia, necesitamos confirmar que eres tú.
            </p>

            <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-full overflow-hidden border-4 border-blue-100">
              {verificationResult === 'success' ? (
                <div className="absolute inset-0 bg-green-500/20 flex flex-col items-center justify-center animate-in fade-in duration-300">
                  <CheckCircle2 size={64} className="text-green-600" />
                  <p className="text-green-700 font-bold mt-2">Identidad Verificada</p>
                </div>
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                />
              )}
              {isVerifying && (
                <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                  <div className="w-full h-1 bg-blue-600 animate-scan"></div>
                  <div className="absolute text-white font-bold bg-blue-600/50 px-3 py-1 rounded-full">
                    Escaneando...
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex flex-col gap-3">
              {!verificationResult && (
                <>
                  <Button onClick={handleVerify} loading={isVerifying} size="full">
                    Escanear Rostro
                  </Button>
                  <Button variant="outline" size="full" onClick={() => setStep(1)}>
                    Volver a selección
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="max-w-lg mx-auto animate-in slide-in-from-right duration-500">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold">Resumen de Votación</h2>
            
            <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-200 space-y-4">
              <p className="text-sm text-blue-600 font-bold uppercase tracking-wider">Candidato Seleccionado</p>
              <div className="flex flex-col items-center gap-3">
                <img 
                  src={currentCandidate?.photoUrl} 
                  alt={currentCandidate?.name} 
                  className="w-24 h-24 rounded-2xl border-4 border-white shadow-sm object-cover" 
                />
                <h3 className="text-xl font-bold text-gray-900">{currentCandidate?.name}</h3>
                <p className="text-sm text-gray-600">Elección: {election.title}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 text-left">
              <AlertTriangle className="text-amber-600 shrink-0" size={20} />
              <p className="text-xs text-amber-800">
                Al confirmar, tu voto será cifrado y enviado de forma anónima al sistema. Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Modificar
              </Button>
              <Button className="flex-1" onClick={handleConfirmVote}>
                Confirmar Voto
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Vote;
