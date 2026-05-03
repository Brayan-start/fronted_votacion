import React from 'react';
import { Card } from '../../components/ui/Card';
import { 
  Users, 
  Vote, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const data = [
  { name: 'Rectoría', votos: 400 },
  { name: 'Decanato', votos: 300 },
  { name: 'Consejo', votos: 200 },
  { name: 'Delegados', votos: 278 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const AdminDashboard: React.FC = () => {
  const stats = [
    { label: 'Total Votantes', value: '1,234', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+12%', trendUp: true },
    { label: 'Elecciones Activas', value: '3', icon: Vote, color: 'text-green-600', bg: 'bg-green-100', trend: '0%', trendUp: true },
    { label: 'Votos Emitidos', value: '856', icon: CheckCircle, color: 'text-amber-600', bg: 'bg-amber-100', trend: '+5%', trendUp: true },
    { label: 'Pendientes', value: '378', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100', trend: '-2%', trendUp: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-500">Resumen general del sistema de votación.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {stat.trend} respecto a ayer
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Votos por Elección" subtitle="Participación en las elecciones actuales.">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="votos" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Actividad Reciente" subtitle="Últimas acciones realizadas en el sistema.">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <Users size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nuevo estudiante registrado</p>
                  <p className="text-xs text-gray-500">Hace {i + 1} horas</p>
                </div>
                <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Info
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
