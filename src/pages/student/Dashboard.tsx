import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { electionService } from '../../services/electionService';
import { voteService } from '../../services/voteService';
import { useAuth } from '../../context/AuthContext';
import { Election } from '../../types';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  Vote, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  Users,
  Award,
  RefreshCcw
} from 'lucide-react';

const StudentDashboard: React.FC = () => {
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
        voteService.getUserStats()
      ]);
      setElections(electionsData);
      setVoteCount(stats.count);
      setVotedElections(stats.voted_elections);
    } catch (err: any) {
      console.error(err);
      setError('No se pudo cargar la información. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white drop-shadow-md">
            Hola, {user?.name} 👋
          </h1>
          <p className="text-blue-100 font-medium mt-2 max-w-xl">
            Bienvenido al sistema oficial de votación de la <span className="text-white font-bold">UPEA</span>. Tu participación fortalece nuestra autonomía universitaria.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Identidad Verificada</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
              <Award size={16} className="text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">{user?.career || 'Estudiante'}</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Elections List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Vote size={24} className="text-blue-300" />
              Elecciones Disponibles
            </h2>
            {error && (
              <button 
                onClick={fetchData}
                className="flex items-center gap-2 text-sm font-bold text-blue-300 hover:text-white transition-colors"
              >
                <RefreshCcw size={16} />
                Reintentar
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse !p-0 overflow-hidden h-64 border-none">
                  <div className="h-2 bg-slate-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                    <div className="h-6 bg-slate-100 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded-lg w-full"></div>
                    <div className="h-10 bg-slate-100 rounded-xl w-full mt-auto"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-500/10 backdrop-blur-sm rounded-[2rem] border border-dashed border-red-500/20">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-400" size={32} />
              </div>
              <p className="text-red-200 font-medium px-6">{error}</p>
            </div>
          ) : elections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {elections.filter(e => e.status === 'active').length > 0 ? (
                elections.filter(e => e.status === 'active').map((election) => {
                  const Icon = getElectionIcon(election.type);
                  const hasVoted = votedElections.includes(election.id);

                  return (
                    <Card key={election.id} className="group hover:shadow-2xl transition-all duration-300 !p-0 overflow-hidden flex flex-col border-none ring-1 ring-black/5 relative">
                      {hasVoted && (
                        <div className="absolute top-0 right-0 z-20 p-4">
                          <div className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle2 size={12} />
                            Participación Registrada
                          </div>
                        </div>
                      )}
                      <div className={`h-2 ${hasVoted ? 'bg-emerald-500' : 'bg-blue-600'}`}></div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-2xl ${hasVoted ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                            <Icon size={24} />
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${hasVoted ? 'bg-emerald-100 text-emerald-700' : 'bg-green-100 text-green-700'}`}>
                            {hasVoted ? '● Completada' : '● En curso'}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight mb-2">
                          {election.title}
                        </h3>
                        
                        <p className="text-gray-500 text-sm line-clamp-2 mb-6 font-medium">
                          {election.description}
                        </p>

                        <div className="mt-auto space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                              <Calendar size={14} />
                              {new Date(election.start_date).toLocaleDateString()}
                            </div>
                            <div className="w-px h-4 bg-gray-200"></div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                              <Clock size={14} />
                              {new Date(election.end_date).toLocaleDateString()}
                            </div>
                          </div>

                          <Button 
                            size="full" 
                            onClick={() => navigate(`/student/vote/${election.id}`)}
                            className={`rounded-2xl py-3 group-hover:shadow-lg transition-all ${
                              hasVoted 
                                ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-100 hover:bg-emerald-100' 
                                : ''
                            }`}
                          >
                            {hasVoted ? 'Revisar Voto' : 'Ejercer Voto'}
                            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-20 bg-white/10 backdrop-blur-sm rounded-[2rem] border border-dashed border-white/20">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-white/40" size={32} />
                  </div>
                  <p className="text-white/60 font-medium">No hay elecciones activas actualmente.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/10 backdrop-blur-sm rounded-[2rem] border border-dashed border-white/20">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-white/40" size={32} />
              </div>
              <p className="text-white/60 font-medium">No hay elecciones activas actualmente.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 size={24} className="text-blue-300" />
            Tu Estado
          </h2>
          
          <Card className="bg-white/80 backdrop-blur-xl border-none shadow-xl">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Registro Universitario</p>
                <p className="text-lg font-black text-blue-900">{user?.reg_univ}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Cédula de Identidad</p>
                <p className="text-lg font-black text-indigo-900">{user?.id_card}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 relative overflow-hidden group">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Votos Emitidos</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-black text-emerald-900">{voteCount}</p>
                  {voteCount > 0 && (
                    <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-md uppercase tracking-tighter animate-in fade-in zoom-in">
                      Voto registrado
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={48} className="text-emerald-900" />
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-500" />
                Recordatorios
              </h4>
              <ul className="text-xs text-gray-500 space-y-3 font-medium">
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 shrink-0"></span>
                  El voto es obligatorio y personal.
                </li>
                <li className="flex gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 shrink-0"></span>
                  Tu voto está encriptado y es 100% anónimo.
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
