import api from './api';
import { Election, Category } from '../types';

export const electionService = {
  getAll: async (): Promise<Election[]> => {
    const response = await api.get('/elections/');
    return response.data;
  },
  
  getById: async (id: string): Promise<Election> => {
    const response = await api.get(`/elections/${id}`);
    return response.data;
  },
  
  getCategories: async (electionId: string): Promise<Category[]> => {
    const response = await api.get(`/elections/${electionId}/categories`);
    return response.data;
  },

  getAllCategories: async (): Promise<Category[]> => {
    const response = await api.get('/elections/categories/all');
    return response.data;
  },

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    const response = await api.post('/elections/categories/', data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/elections/categories/${id}`);
  },
  
  create: async (data: Partial<Election>): Promise<Election> => {
    const response = await api.post('/elections/', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<Election>): Promise<Election> => {
    const response = await api.put(`/elections/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/elections/${id}`);
  }
};
