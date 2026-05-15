import api from './api';
import { Candidate } from '../types';

export const candidateService = {
  getAll: async (): Promise<Candidate[]> => {
    const response = await api.get('/candidates/');
    return response.data;
  },

  getByCategory: async (categoryId: string): Promise<Candidate[]> => {
    const response = await api.get(`/elections/categories/${categoryId}/candidates`);
    return response.data;
  },
  
  create: async (data: Partial<Candidate>): Promise<Candidate> => {
    const response = await api.post('/candidates/', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<Candidate>): Promise<Candidate> => {
    const response = await api.put(`/candidates/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/candidates/${id}`);
  }
};
