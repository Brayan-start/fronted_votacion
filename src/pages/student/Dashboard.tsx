import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockElections } from '../../services/mockData';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white drop-shadow-sm">Bienvenido a VotU</h1>
        <p className="text-slate-300 font-medium">Selecciona una elección activa para ejercer tu voto.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockElections.map((election) => (
          <Card key={election.id} className="flex flex-col h-full hover:shadow-lg transition-all border-l-4 border-l-blue-600">
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900">{election.title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                  election.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {election.status === 'active' ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2">
                {election.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar size={16} />
                  <span>Inicia: {new Date(election.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={16} />
                  <span>Finaliza: {new Date(election.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <Button 
                size="full" 
                disabled={election.status !== 'active'}
                onClick={() => navigate(`/student/vote/${election.id}`)}
                className="gap-2"
              >
                {election.status === 'active' ? 'Votar Ahora' : 'Próximamente'}
                <ArrowRight size={18} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {mockElections.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">No hay elecciones disponibles en este momento.</p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
