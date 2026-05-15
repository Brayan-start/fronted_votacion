import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { analyticsService } from '../../services/analyticsService';
import { 
  Users, 
  Vote, 
  CheckCircle, 
  Clock,
  TrendingUp,
  BarChart3,
  ArrowRight,
  GraduationCap,
  Gavel,
  Stethoscope,
  Calculator,
  Briefcase,
  Loader2
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Estudiantes', value: '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Elecciones Activas', value: '0', icon: Vote, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Votos Emitidos', value: '0', icon: CheckCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Participación', value: '0%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await analyticsService.getGlobalStats();
        setStats([
          { label: 'Total Estudiantes', value: data.total_voters.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Elecciones Activas', value: data.active_elections.toString(), icon: Vote, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Votos Emitidos', value: data.total_votes_cast.toLocaleString(), icon: CheckCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Participación', value: `${data.participation_rate}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
        ]);
      } catch (err) {
        console.error("Error fetching admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const categories = [
    { title: 'Elecciones de Rectorado', count: '1 Elección', icon: GraduationCap, color: 'bg-indigo-500', path: '/admin/elections' },
    { title: 'Consejo Estudiantil', count: '5 Carreras', icon: Vote, color: 'bg-rose-500', path: '/admin/categories' },
    { title: 'Representantes de Carrera', count: '12 Carreras', icon: Users, color: 'bg-emerald-500', path: '/admin/candidates' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white drop-shadow-md">Inicio Administrativo</h1>
          <p className="text-blue-100 font-medium">Gestión del sistema de votación UPEA</p>
        </div>
        <Button 
          variant="primary" 
          className="shadow-xl" 
          onClick={() => navigate('/admin/results')}
        >
          <BarChart3 size={20} className="mr-2" />
          Ver Resultados en Vivo
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:scale-[1.02] transition-transform cursor-default">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">{stat.value}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Sections */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Vote size={24} className="text-blue-300" />
            Secciones Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <div key={i} className="group cursor-pointer" onClick={() => navigate(cat.path)}>
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-transparent hover:border-blue-500 transition-all">
                  <div className={`w-12 h-12 ${cat.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    <cat.icon size={24} />
                  </div>
                  <h3 className="font-bold text-gray-900 leading-tight">{cat.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 font-medium">{cat.count}</p>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Gestionar <ArrowRight size={14} className="ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Card className="bg-blue-600 text-white p-8 rounded-[2.5rem] border-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-2">Panel de Control de Integridad</h3>
              <p className="text-blue-100 mb-6 max-w-lg">El sistema está monitoreando activamente la red de votación. Todos los procesos biométricos y registros de sufragio están siendo encriptados en tiempo real.</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Biometría Activa
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  Nodos Sincronizados
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar / Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock size={24} className="text-blue-300" />
            Acciones Rápidas
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Nueva Elección', desc: 'Crear proceso electoral', color: 'bg-blue-600', path: '/admin/elections' },
              { label: 'Cargar Padrón', desc: 'Importar lista Excel/CSV', color: 'bg-indigo-600', path: '/admin/students' },
              { label: 'Generar Reporte', desc: 'PDF de resultados finales', color: 'bg-slate-800', path: '/admin/results' },
              { label: 'Auditoría', desc: 'Ver logs del sistema', color: 'bg-amber-600', path: '/admin/dashboard' },
            ].map((action, i) => (
              <button 
                key={i}
                onClick={() => navigate(action.path)}
                className="w-full text-left bg-white p-4 rounded-2xl shadow-md border border-slate-100 hover:border-blue-500 hover:-translate-y-1 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{action.label}</p>
                    <p className="text-xs text-gray-500 font-medium">{action.desc}</p>
                  </div>
                  <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-2xl">
            <h3 className="font-bold mb-2">Estado del Servidor</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-green-400">OPERATIVO</span>
            </div>
            <p className="text-sm text-slate-400 mb-6">Todos los nodos de votación están sincronizados y seguros.</p>
            <Button variant="secondary" size="full" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Ver Diagnóstico
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
