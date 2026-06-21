import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { voteService } from '../../services/voteService';
import { VoteHistoryItem } from '../../types';
import {
  Clock, CheckCircle2, AlertCircle, Vote, RefreshCcw,
} from 'lucide-react';

const Historial: React.FC = () => {
  const [history, setHistory] = useState<VoteHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await voteService.getHistory();
      setHistory(data);
    } catch {
      setError('No se pudo cargar tu historial de votación.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] flex items-center gap-3">
            <Clock size={28} className="text-blue-400" />
            Historial Personal
          </h1>
          <p className="text-sm font-medium text-[var(--text-tertiary)] mt-1">
            Registro de todos los votos que has emitido en el sistema.
          </p>
        </div>
        {error && (
          <button onClick={fetchHistory} className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
            <RefreshCcw size={16} /> Reintentar
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse border-[var(--border-color)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-[var(--bg-tertiary)] rounded-lg w-3/4" />
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded-lg w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-500/10 backdrop-blur-sm rounded-[2rem] border border-dashed border-red-500/20">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-400" size={32} />
          </div>
          <p className="text-[var(--accent-red)] font-medium">{error}</p>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-secondary)]/50 backdrop-blur-sm rounded-[2rem] border border-dashed border-[var(--border-color)]">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Vote className="text-[var(--text-tertiary)]" size={32} />
          </div>
          <p className="text-[var(--text-tertiality)] font-medium">Aún no has emitido ningún voto.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-[var(--border-color)] hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-[var(--text-primary)] truncate">
                        {item.election_title}
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] border border-[var(--border-color)] shrink-0 self-start">
                        {new Date(item.created_at).toLocaleDateString('es-BO', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-2.5 bg-[var(--bg-tertiary)]/50 rounded-xl border border-[var(--border-color)]">
                        <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Categoría</p>
                        <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{item.category_name}</p>
                      </div>
                      <div className="p-2.5 bg-[var(--bg-tertiary)]/50 rounded-xl border border-[var(--border-color)]">
                        <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Candidato</p>
                        <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{item.candidate_name}</p>
                      </div>
                      <div className="p-2.5 bg-[var(--bg-tertiary)]/50 rounded-xl border border-[var(--border-color)]">
                        <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Tipo</p>
                        <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5 capitalize">{item.election_type}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Historial;
