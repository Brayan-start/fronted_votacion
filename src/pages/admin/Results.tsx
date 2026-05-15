import React, { useState, useEffect, useMemo, Component, ReactNode } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { electionService } from '../../services/electionService';
import { analyticsService, ElectionAnalytics, CandidateResult, CategoryResult } from '../../services/analyticsService';
import { 
  BarChart3, 
  Download, 
  RefreshCcw, 
  Users, 
  Vote, 
  Award,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell
} from 'recharts';
import { Election } from '../../types';

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

// --- UNIVERSAL ERROR BOUNDARY ---
class ResultsErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) { console.error("[RESULTS_CRASH]", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white/50 backdrop-blur-xl rounded-[3rem] p-12 text-center border-2 border-dashed border-red-200">
          <AlertCircle className="text-red-500 mb-4" size={64} />
          <h2 className="text-2xl font-black text-slate-900">Oops, algo salió mal</h2>
          <p className="text-slate-500 mt-2 mb-8">Hubo un error al renderizar los resultados. No te preocupes, tus datos están seguros.</p>
          <Button onClick={() => window.location.reload()} className="bg-slate-900">Recargar Módulo</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- ISOLATED COMPONENTS ---

const CategoryChart: React.FC<{ data: any[] }> = ({ data }) => {
  // Use fixed dimensions to avoid ResizeObserver loops which cause lead-grey screens/crashes
  return (
    <div className="w-full flex justify-center overflow-hidden">
      <BarChart width={400} height={300} data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="candidate_name" 
          tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
        <Bar dataKey="vote_count" radius={[8, 8, 0, 0]} barSize={35}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </div>
  );
};

const CategorySection: React.FC<{ category: CategoryResult }> = ({ category }) => {
  const safeCandidates = useMemo(() => 
    Array.isArray(category?.candidates) ? category.candidates.filter(c => c && typeof c === 'object') : []
  , [category]);

  const sorted = useMemo(() => 
    [...safeCandidates].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
  , [safeCandidates]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-4">
          <span className="w-10 h-1 bg-blue-500 rounded-full"></span>
          {category?.category_name || 'Categoría'}
        </h2>
        <div className="h-px flex-1 bg-white/5"></div>
        <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-widest">
          {(category?.total_votes || 0).toLocaleString()} Votos
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white rounded-[2.5rem] border-none shadow-2xl h-[450px] flex flex-col" noPadding>
          <div className="p-8 pb-4">
            <h3 className="font-black text-slate-800 flex items-center gap-3 text-lg">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <BarChart3 size={20} />
              </div>
              Distribución
            </h3>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 pb-8">
            {category.total_votes > 0 ? (
              <CategoryChart data={safeCandidates} />
            ) : (
              <div className="text-center opacity-30">
                <Vote size={48} className="mx-auto mb-2" />
                <p className="text-xs font-black uppercase">Sin votos</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-white rounded-[2.5rem] border-none shadow-2xl h-[450px] flex flex-col" noPadding>
          <div className="p-8 border-b border-slate-50">
            <h3 className="font-black text-slate-800 flex items-center gap-3 text-lg">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Users size={20} />
              </div>
              Ranking
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
            {sorted.map((cand, i) => (
              <div key={cand.candidate_id || i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative shrink-0">
                    <img 
                      src={cand.photo_url || "https://via.placeholder.com/150?text=C"} 
                      className="w-12 h-12 rounded-xl object-cover border-2 border-slate-100"
                      onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150?text=C")}
                    />
                    {i === 0 && cand.vote_count > 0 && (
                      <div className="absolute -top-2 -right-2 bg-amber-400 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg border-2 border-white">
                        <Award size={12} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 text-base truncate leading-tight">{cand.candidate_name || 'Candidato'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Votos: {cand.vote_count || 0}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-xl font-black text-indigo-600">{cand.percentage || 0}%</p>
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${cand.percentage || 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {sorted.length === 0 && <div className="p-20 text-center text-slate-300 font-bold italic">No hay candidatos</div>}
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

const Results: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [analytics, setAnalytics] = useState<ElectionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await electionService.getAll();
        if (mounted) {
          const valid = Array.isArray(data) ? data : [];
          setElections(valid);
          if (valid.length > 0) setSelectedElection(valid[0].id);
        }
      } catch (e) {
        if (mounted) setError("Error de conexión");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedElection) return;
    let mounted = true;
    (async () => {
      setFetching(true);
      try {
        const res = await analyticsService.getElectionResults(selectedElection);
        if (mounted) setAnalytics(res);
      } catch (e) {
        console.error("Fetch Results Error", e);
      } finally {
        if (mounted) setFetching(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedElection]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-blue-400" size={48} />
      <p className="text-white/60 font-black uppercase tracking-[0.2em] text-[10px]">Sincronizando...</p>
    </div>
  );

  return (
    <ResultsErrorBoundary>
      <div className="space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-md">
              <BarChart3 size={40} className="text-blue-400" />
              Resultados
            </h1>
            <p className="text-blue-100/60 font-black uppercase text-[10px] tracking-widest mt-1">UPEA Vota • En Vivo</p>
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <select 
              className="flex-1 lg:flex-none px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-black text-sm outline-none"
              value={selectedElection}
              onChange={(e) => setSelectedElection(e.target.value)}
            >
              {elections.map(e => <option key={e.id} value={e.id} className="text-slate-900">{e.title}</option>)}
              {elections.length === 0 && <option value="">No hay elecciones</option>}
            </select>
            <Button variant="secondary" className="rounded-2xl w-12 h-12 !p-0 shadow-lg" onClick={() => setSelectedElection(selectedElection)} loading={fetching}>
              <RefreshCcw size={20} className={fetching ? 'animate-spin' : ''} />
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/10 text-white rounded-2xl px-6" onClick={() => window.print()}>
              <Download size={18} className="mr-2" /> PDF
            </Button>
          </div>
        </div>

        {error ? (
          <div className="py-20 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
            <p className="text-white font-bold">{error}</p>
          </div>
        ) : analytics && Array.isArray(analytics.results_by_category) && analytics.results_by_category.length > 0 ? (
          <div className="space-y-12">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Sufragios', val: analytics.total_votes || 0, icon: Vote, color: 'text-blue-400', bg: 'bg-blue-500/20' },
                { label: 'Participación', val: `${analytics.participation_percentage || 0}%`, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
                { label: 'Categorías', val: analytics.results_by_category.length, icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/20' }
              ].map((s, i) => (
                <Card key={i} className="bg-slate-900/40 backdrop-blur-xl border-white/5 text-white p-8 relative overflow-hidden">
                  <div className="flex items-center gap-5 relative z-10">
                    <div className={`p-4 ${s.bg} rounded-[1.5rem] border border-white/5 ${s.color}`}>
                      <s.icon size={32} />
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">{s.label}</p>
                      <h3 className="text-4xl font-black mt-1">{s.val.toLocaleString()}</h3>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Render categories */}
            <div className="space-y-16">
              {analytics.results_by_category.map((cat, idx) => (
                <CategorySection key={cat.category_id || idx} category={cat} />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-32 text-center bg-slate-900/40 backdrop-blur-2xl rounded-[4rem] border border-dashed border-white/10">
            <BarChart3 className="text-white/20 mx-auto mb-6" size={64} />
            <h2 className="text-2xl font-black text-white">Esperando Resultados</h2>
            <p className="text-blue-100/40 font-medium max-w-xs mx-auto mt-2">Los datos se cargarán automáticamente al seleccionar una elección válida.</p>
          </div>
        )}
      </div>
    </ResultsErrorBoundary>
  );
};

export default Results;
