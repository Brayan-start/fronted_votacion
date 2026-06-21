import api from './api';
import { VoteCreate, VoteResponse, VoteHistoryItem, CarnetData } from '../types';

export const voteService = {
  castVote: async (data: VoteCreate): Promise<VoteResponse> => {
    const response = await api.post('/votes/', data);
    return response.data;
  },

  verifyFace: async (data: VoteCreate): Promise<any> => {
    const response = await api.post('/votes/verify', data);
    return response.data;
  },

  getUserStats: async (): Promise<{ count: number, voted_elections: string[] }> => {
    const response = await api.get('/votes/stats');
    return response.data;
  },

  checkStatus: async (electionId: string, categoryId: string) => {
    return true;
  },

  // ── Historial personal de votación ───────────────────────────────────
  getHistory: async (): Promise<VoteHistoryItem[]> => {
    const response = await api.get('/votes/history');
    return response.data;
  },

  // ── Datos para el carnet de sufragio ─────────────────────────────────
  getCarnetData: async (): Promise<CarnetData> => {
    const response = await api.get('/votes/carnet');
    return response.data;
  },

  // ── Verificación pública de carnet ──────────────────────────────────
  verifyCarnet: async (code: string): Promise<any> => {
    const response = await api.get(`/votes/verify-carnet?code=${encodeURIComponent(code)}`);
    return response.data;
  },
};
