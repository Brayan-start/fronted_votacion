import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { electionService } from '../../services/electionService';
import { voteService } from '../../services/voteService';
import { useAuth } from '../../context/AuthContext';
import { Election } from '../../types';
import {
  Vote, CheckCircle2, AlertCircle, Calendar, Clock, ArrowRight,
  GraduationCap, Users, Award, RefreshCcw, User,
} from 'lucide-react';

const Inicio: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [elections, setElections] = useState<Election[]>([]);
  const [voteCount, setVoteCount] = useState<number>(0);
  const [votedElections, setVotedElections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [electionsData, stats] = await Promise.all([
        electionService.getAll(),
        voteService.getUserStats(),
      ]);
      setElections(electionsData);
      setVoteCount(stats.count);
      setVotedElections(stats.voted_elections);
    } catch {
      setError('No se pudo cargar la información.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getElectionIcon = (type?: string) => {
    switch (type) {
      case 'rectorado': return GraduationCap;
      case 'consejo': return Award;
      case 'carrera': return Users;
      default: return Vote;
    }
  };

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 backdrop-blur-md p-8 rounded-[2rem] border border-blue-500/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white/20 overflow-hidden">
              {user?.photo_url ? (
                <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <>{user?.name?.[0]}{user?.last_name?.[0]}</>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white drop-shadow-md">
                ¡Bienvenido, {user?.name}!
              </h1>
              <p className="text-blue-100 font-medium mt-1">
                Panel del votante — Sistema Electoral UPEA
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {voteCount > 0 ? `${voteCount} voto(s) emitido(s)` : 'Pendiente de votar'}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
              <Award size={16} className="text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {user?.career || 'Estudiante'}
              </span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Elecciones disponibles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Vote size={24} className="text-blue-400" />
              Elecciones Disponibles
            </h2>
            {error && (
              <button onClick={fetchData} className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
                <RefreshCcw size={16} /> Reintentar
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse !p-0 overflow-hidden h-64 border-[var(--border-color)]">
                  <div className="h-2 bg-[var(--bg-tertiary)]" />
                  <div className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-2xl" />
                    <div className="h-6 bg-[var(--bg-tertiary)] rounded-lg w-3/4" />
                    <div className="h-4 bg-[var(--bg-tertiary)] rounded-lg w-full" />
                    <div className="h-10 bg-[var(--bg-tertiary)] rounded-xl w-full mt-auto" />
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-500/10 backdrop-blur-sm rounded-[2rem] border border-dashed border-red-500/20">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-400" size={32} />
              </div>
              <p className="text-[var(--accent-red)] font-medium px-6">{error}</p>
            </div>
          ) : elections.filter(e => e.status === 'active').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {elections.filter(e => e.status === 'active').map((election) => {
                const Icon = getElectionIcon(election.type);
                const hasVoted = votedElections.includes(election.id);
                return (
                  <Card key={election.id} className="group hover:shadow-2xl transition-all duration-300 !p-0 overflow-hidden flex flex-col border-[var(--border-color)] relative">
                    {hasVoted && (
                      <div className="absolute top-0 right-0 z-20 p-4">
                        <div className="bg-emerald-500/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                          <CheckCircle2 size={12} /> Votaste
                        </div>
                      </div>
                    )}
                    <div className={`h-2 ${hasVoted ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`} />
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl ${hasVoted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                          <Icon size={24} />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${hasVoted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                          {hasVoted ? '● Completada' : '● En curso'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-blue-400 transition-colors leading-tight mb-2">
                        {election.title}
                      </h3>
                      <p className="text-[var(--text-tertiary)] text-sm line-clamp-2 mb-6 font-medium">
                        {election.description}
                      </p>
                      <div className="mt-auto space-y-3">
                        <div className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)]/50 rounded-xl border border-[var(--border-color)]">
                          <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] font-bold">
                            <Calendar size={14} />
                            {new Date(election.start_date).toLocaleDateString()}
                          </div>
                          <div className="w-px h-4 bg-[var(--border-color)]" />
                          <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] font-bold">
                            <Clock size={14} />
                            {new Date(election.end_date).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          size="full"
                          onClick={() => navigate(`/student/vote/${election.id}`)}
                          className={`rounded-2xl py-3 group-hover:shadow-lg transition-all ${hasVoted ? '!bg-emerald-500/10 !text-emerald-400 border-2 border-emerald-500/20 hover:!bg-emerald-500/20' : ''}`}
                        >
                          {hasVoted ? 'Revisar Voto' : 'Ejercer Voto'}
                          <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-[var(--bg-secondary)]/50 backdrop-blur-sm rounded-[2rem] border border-dashed border-[var(--border-color)]">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-[var(--text-tertiary)]" size={32} />
              </div>
              <p className="text-[var(--text-tertiary)] font-medium">No hay elecciones activas actualmente.</p>
            </div>
          )}
        </div>

        {/* Estado del usuario */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <CheckCircle2 size={24} className="text-blue-400" />
            Tu Estado
          </h2>
          <Card className="bg-[var(--bg-card)] backdrop-blur-xl border-[var(--border-color)] shadow-xl">
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Registro Universitario</p>
                <p className="text-lg font-black text-[var(--text-primary)]">{user?.reg_univ}</p>
              </div>
              <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Cédula de Identidad</p>
                <p className="text-lg font-black text-[var(--text-primary)]">{user?.id_card}</p>
              </div>
              <div className={`p-4 rounded-2xl border relative overflow-hidden ${voteCount > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: voteCount > 0 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
                  Estado de Votación
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-black text-[var(--text-primary)]">
                    {voteCount > 0 ? `${voteCount} voto(s) emitido(s)` : 'Sin votos aún'}
                  </p>
                  {voteCount > 0 ? (
                    <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md uppercase border border-emerald-500/20">
                      ✓ Votó
                    </span>
                  ) : (
                    <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md uppercase border border-amber-500/20">
                      Pendiente
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
              <h4 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2 text-sm">
                <User size={18} className="text-blue-400" />
                Acciones rápidas
              </h4>
              <div className="space-y-2">
                <Button variant="outline" size="full" onClick={() => navigate('/student/profile')} className="rounded-xl">
                  <User size={16} /> Ver Mi Perfil
                </Button>
                <Button variant="outline" size="full" onClick={() => navigate('/student/carnet')} className="rounded-xl">
                  <Award size={16} /> Mi Carnet de Sufragio
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
