import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import { voteService } from '../../services/voteService';

interface VerificationResult {
  valido: boolean;
  nombre?: string;
  ru?: string;
  mesa?: string;
  gestion?: string;
  mensaje: string;
}

const VerifyCarnet: React.FC = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setLoading(false);
      setError('No se proporcionó un código de verificación.');
      return;
    }
    voteService.verifyCarnet(code)
      .then(setResult)
      .catch(() => setError('Error al verificar el carnet.'))
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-blue-100">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <ShieldCheck size={32} />
            </div>
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Verificación de Carnet
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Sistema de Votación Universitaria - UPEA Vota
          </p>

          {loading && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 size={40} className="text-blue-600 animate-spin" />
              <p className="text-gray-500 font-medium">Verificando carnet...</p>
            </div>
          )}

          {error && !loading && (
            <div className="py-4">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <XCircle size={48} className="text-red-500" />
              </div>
              <p className="text-red-600 font-bold text-lg mb-2">Error</p>
              <p className="text-gray-500 text-sm mb-6">{error}</p>
            </div>
          )}

          {result && !loading && (
            <>
              <div className="mb-6">
                {result.valido ? (
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={48} className="text-green-600" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <XCircle size={48} className="text-red-500" />
                  </div>
                )}
                <h2 className={`text-xl font-black ${result.valido ? 'text-green-700' : 'text-red-700'}`}>
                  {result.valido ? 'Carnet Válido' : 'Carnet Inválido'}
                </h2>
                <p className="text-gray-500 text-sm mt-2">{result.mensaje}</p>
              </div>

              {result.valido && (
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-3 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estudiante</span>
                    <span className="text-sm font-bold text-gray-800">{result.nombre}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">R.U.</span>
                    <span className="text-sm font-bold text-gray-800">{result.ru}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">N° Mesa</span>
                    <span className="text-sm font-bold text-gray-800">{result.mesa}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gestión</span>
                    <span className="text-sm font-bold text-gray-800">{result.gestion}</span>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>

          <p className="text-[10px] text-gray-400 mt-4">
            Universidad Pública de El Alto - Sistema de Votación Electrónica
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyCarnet;
