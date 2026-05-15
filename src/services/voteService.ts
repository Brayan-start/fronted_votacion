import api from './api';
import { VoteCreate, VoteResponse } from '../types';

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
    // Implementar si existe endpoint de validación previa
    // Por ahora el backend ya valida en el POST
    return true;
  }
};
