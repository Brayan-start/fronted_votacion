import React from 'react';
import { Card } from '../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Award, Users, CheckCircle, TrendingUp, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const Results: React.FC = () => {
  const data = [
    { name: 'FRENTE UNIDOS', votes: 1245, color: '#3b82f6' },
    { name: 'UPEA SIEMPRE', votes: 980, color: '#10b981' },
    { name: 'RENOVACIÓN', votes: 450, color: '#f59e0b' },
    { name: 'BLANCOS', votes: 120, color: '#94a3b8' },
    { name: 'NULOS', votes: 85, color: '#ef4444' },
  ];

  const participationData = [
    { name: 'Votaron', value: 2880, color: '#3b82f6' },
    { name: 'No Votaron', value: 320, color: '#e2e8f0' },
  ];

  const winner = data[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white drop-shadow-sm">Resultados en Tiempo Real</h1>
          <p className="text-slate-300 font-medium">Elecciones Rectorado UPEA 2026</p>
        </div>
        <Button variant="outline" className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20">
          <Download size={18} />
          Exportar Reporte
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl text-white">
              <Users size={24} />
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Votos</p>
              <h3 className="text-2xl font-bold">2,880</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl text-white">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-emerald-100 text-sm font-medium">Participación</p>
              <h3 className="text-2xl font-bold">90.2%</h3>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl text-white">
              <Award size={24} />
            </div>
            <div>
              <p className="text-amber-100 text-sm font-medium">Líder Actual</p>
              <h3 className="text-2xl font-bold uppercase">{winner.name}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Distribución de Votos por Frente" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 40, right: 40, top: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120} 
                tick={{ fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={30}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Participación Estudiantil" className="h-[400px]">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={participationData}
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {participationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 pb-4">
              {participationData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-medium text-gray-600">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card title="Frente Ganador Proyectado">
        <div className="flex flex-col md:flex-row items-center gap-8 p-4">
          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Award size={64} />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-3xl font-black text-gray-900">{winner.name}</h3>
              <p className="text-blue-600 font-bold flex items-center gap-2">
                <TrendingUp size={20} />
                Tendencia Irreversible
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Votos Totales</p>
                <p className="text-xl font-bold text-gray-900">{winner.votes}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Porcentaje</p>
                <p className="text-xl font-bold text-gray-900">
                  {((winner.votes / 2880) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Results;
