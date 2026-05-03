import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
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
  Briefcase
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Votantes UPEA', value: '45,234', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Elecciones Activas', value: '3', icon: Vote, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Votos Emitidos', value: '12,856', icon: CheckCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Participación', value: '68%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const categories = [
    { title: 'Elecciones de Rectorado', count: '1 Elección', icon: GraduationCap, color: 'bg-indigo-500' },
    { title: 'Consejo Estudiantil', count: '5 Carreras', icon: Vote, color: 'bg-rose-500' },
    { title: 'Representantes de Carrera', count: '12 Carreras', icon: Users, color: 'bg-emerald-500' },
  ];

  const faculties = [
    { name: 'Ingeniería de Sistemas', count: 1200, icon: GraduationCap },
    { name: 'Derecho', count: 1500, icon: Gavel },
    { name: 'Medicina', count: 900, icon: Stethoscope },
    { name: 'Contaduría Pública', count: 1100, icon: Calculator },
    { name: 'Administración de Empresas', count: 850, icon: Briefcase },
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
              <div key={i} className="group cursor-pointer">
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

          <Card className="!p-0 overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Participación por Carrera</h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Actualizado hace 2 min</span>
            </div>
            <div className="divide-y">
              {faculties.map((fac, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                      <fac.icon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{fac.name}</p>
                      <div className="w-48 h-2 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${(fac.count / 1500) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">{fac.count}</p>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Votos</p>
                  </div>
                </div>
              ))}
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
              { label: 'Nueva Elección', desc: 'Crear proceso electoral', color: 'bg-blue-600' },
              { label: 'Cargar Padrón', desc: 'Importar lista Excel/CSV', color: 'bg-indigo-600' },
              { label: 'Generar Reporte', desc: 'PDF de resultados finales', color: 'bg-slate-800' },
              { label: 'Auditoría', desc: 'Ver logs del sistema', color: 'bg-amber-600' },
            ].map((action, i) => (
              <button 
                key={i}
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
