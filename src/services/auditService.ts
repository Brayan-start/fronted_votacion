import api from './api';

export interface AuditLogEntry {
  id: string;
  usuario: string;
  rol: string;
  accion: string;
  detalle?: string;
  ip?: string;
  resultado: string;
  created_at: string;
}

export interface AuditLogListResponse {
  total: number;
  page: number;
  per_page: number;
  data: AuditLogEntry[];
}

export interface AuditFilters {
  page?: number;
  per_page?: number;
  accion?: string;
  usuario?: string;
  rol?: string;
  resultado?: string;
  search?: string;
  desde?: string;
  hasta?: string;
}

export const auditService = {
  getLogs: async (filters: AuditFilters = {}): Promise<AuditLogListResponse> => {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.per_page) params.set('per_page', String(filters.per_page));
    if (filters.accion) params.set('accion', filters.accion);
    if (filters.usuario) params.set('usuario', filters.usuario);
    if (filters.rol) params.set('rol', filters.rol);
    if (filters.resultado) params.set('resultado', filters.resultado);
    if (filters.search) params.set('search', filters.search);
    if (filters.desde) params.set('desde', filters.desde);
    if (filters.hasta) params.set('hasta', filters.hasta);
    const response = await api.get(`/audit/?${params.toString()}`);
    return response.data;
  },

  getAcciones: async (): Promise<string[]> => {
    const response = await api.get('/audit/acciones');
    return response.data;
  },
};
