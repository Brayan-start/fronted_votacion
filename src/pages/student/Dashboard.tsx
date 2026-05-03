import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockElections } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  Vote, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  Users,
  Award
} from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
              <span className="text-xs font-bold text-white uppercase tracking-wider">{user?.career}</span>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockElections.map((election) => {
              const Icon = getElectionIcon(election.type);
              return (
                <Card key={election.id} className="group hover:shadow-2xl transition-all duration-300 !p-0 overflow-hidden flex flex-col border-none ring-1 ring-black/5">
                  <div className={`h-2 ${election.status === 'active' ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl ${election.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                        <Icon size={24} />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        election.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {election.status === 'active' ? '● En curso' : '● Finalizada'}
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
                          {new Date(election.startDate).toLocaleDateString()}
                        </div>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                          <Clock size={14} />
                          {new Date(election.endDate).toLocaleDateString()}
                        </div>
                      </div>

                      <Button 
                        size="full" 
                        disabled={election.status !== 'active'}
                        onClick={() => navigate(`/student/vote/${election.id}`)}
                        className="rounded-2xl py-3 group-hover:shadow-lg transition-all"
                      >
                        {election.status === 'active' ? 'Ejercer Voto' : 'Cerrado'}
                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {mockElections.length === 0 && (
            <div className="text-center py-20 bg-white/10 backdrop-blur-sm rounded-[2rem] border border-dashed border-white/20">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-white/40" size={32} />
              </div>
              <p className="text-white/60 font-medium">No hay elecciones programadas para tu carrera hoy.</p>
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
                <p className="text-lg font-black text-blue-900">{user?.regUniv}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Cédula de Identidad</p>
                <p className="text-lg font-black text-indigo-900">{user?.idCard}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Votos Emitidos</p>
                <p className="text-lg font-black text-emerald-900">0</p>
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
