import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { auditService, AuditLogEntry, AuditFilters } from '../../services/auditService';
import {
  Shield, Search, Filter, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Clock, User, Globe, RefreshCcw,
} from 'lucide-react';

const ITEMS_PER_PAGE = 20;

const Auditoria: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [acciones, setAcciones] = useState<string[]>([]);
  const [filters, setFilters] = useState<AuditFilters>({
    per_page: ITEMS_PER_PAGE,
  });
  const [searchText, setSearchText] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await auditService.getLogs({ ...filters, page });
      setLogs(response.data);
      setTotal(response.total);
    } catch (err) {
      console.error('Error al cargar auditoría:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcciones = async () => {
    try {
      const data = await auditService.getAcciones();
      setAcciones(data);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchAcciones();
  }, [page, filters]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchText || undefined }));
    setPage(1);
  };

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ per_page: ITEMS_PER_PAGE });
    setSearchText('');
    setPage(1);
  };

  const getResultadoBadge = (resultado: string) => {
    if (resultado === 'exito') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
          <CheckCircle2 size={10} />
          Éxito
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20">
        <XCircle size={10} />
        Error
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] flex items-center gap-3">
          <Shield size={28} className="text-amber-400" />
          Auditoría
        </h1>
        <p className="text-sm font-medium text-[var(--text-tertiary)] mt-1">
          Registro de eventos y actividades del sistema.
        </p>
      </div>

      <Card className="border-[var(--border-color)]">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Buscar en usuario, acción o detalle..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full h-10 pl-10 pr-4 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-input)] text-sm font-medium text-[var(--text-primary)] outline-none focus:border-amber-500 placeholder:text-[var(--text-tertiary)]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filters.accion || ''}
              onChange={(e) => handleFilterChange('accion', e.target.value || undefined)}
              className="h-10 px-3 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-input)] text-sm font-medium text-[var(--text-primary)] outline-none focus:border-amber-500"
            >
              <option value="">Todas las acciones</option>
              {acciones.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            <select
              value={filters.rol || ''}
              onChange={(e) => handleFilterChange('rol', e.target.value || undefined)}
              className="h-10 px-3 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-input)] text-sm font-medium text-[var(--text-primary)] outline-none focus:border-amber-500"
            >
              <option value="">Todos los roles</option>
              <option value="admin">Admin</option>
              <option value="student">Estudiante</option>
            </select>

            <select
              value={filters.resultado || ''}
              onChange={(e) => handleFilterChange('resultado', e.target.value || undefined)}
              className="h-10 px-3 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-input)] text-sm font-medium text-[var(--text-primary)] outline-none focus:border-amber-500"
            >
              <option value="">Todos los resultados</option>
              <option value="exito">Éxito</option>
              <option value="error">Error</option>
            </select>

            <input
              type="date"
              value={filters.desde || ''}
              onChange={(e) => handleFilterChange('desde', e.target.value || undefined)}
              className="h-10 px-3 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-input)] text-sm font-medium text-[var(--text-primary)] outline-none focus:border-amber-500"
              title="Desde"
            />

            <input
              type="date"
              value={filters.hasta || ''}
              onChange={(e) => handleFilterChange('hasta', e.target.value || undefined)}
              className="h-10 px-3 rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-input)] text-sm font-medium text-[var(--text-primary)] outline-none focus:border-amber-500"
              title="Hasta"
            />

            <Button variant="primary" onClick={handleSearch} className="h-10 !rounded-xl">
              <Search size={16} />
              Buscar
            </Button>

            <Button variant="ghost" onClick={clearFilters} className="h-10 !rounded-xl border border-[var(--border-color)]">
              <RefreshCcw size={16} />
              Limpiar
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border-[var(--border-color)]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full border-4 border-[var(--border-color)] border-t-amber-500 animate-spin" />
              <p className="text-[var(--text-tertiary)] font-medium">Cargando registros...</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <Shield size={48} className="mx-auto mb-4 text-[var(--text-tertiary)]" />
            <p className="text-[var(--text-tertiary)] font-medium">No se encontraron registros de auditoría.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-color)]">
                    <th className="text-left py-3 px-4 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Usuario</th>
                    <th className="text-left py-3 px-4 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Rol</th>
                    <th className="text-left py-3 px-4 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Acción</th>
                    <th className="text-left py-3 px-4 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Detalle</th>
                    <th className="text-left py-3 px-4 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">IP</th>
                    <th className="text-center py-3 px-4 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Resultado</th>
                    <th className="text-right py-3 px-4 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-[var(--border-color)]/50 hover:bg-[var(--bg-tertiary)]/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-[var(--text-tertiary)] shrink-0" />
                          <span className="font-bold text-[var(--text-primary)] text-xs truncate max-w-[180px]">{log.usuario}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                          {log.rol}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-[var(--text-primary)]">{log.accion}</td>
                      <td className="py-3 px-4 text-xs text-[var(--text-tertiary)] max-w-[200px] truncate">{log.detalle || '-'}</td>
                      <td className="py-3 px-4">
                        {log.ip ? (
                          <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                            <Globe size={12} />
                            {log.ip}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">{getResultadoBadge(log.resultado)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-[10px] text-[var(--text-tertiary)]">
                          <Clock size={12} />
                          {new Date(log.created_at).toLocaleString('es-BO')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)] mt-4">
                <p className="text-[11px] text-[var(--text-tertiary)] font-medium">
                  Mostrando {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} de {total} registros
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="!rounded-xl border border-[var(--border-color)]"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-xs font-bold text-[var(--text-primary)] px-3">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="!rounded-xl border border-[var(--border-color)]"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default Auditoria;
