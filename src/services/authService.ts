import api from './api';
import { User, LoginRequest, TokenResponse } from '../types';

export const authService = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  
  register: async (data: any): Promise<User> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  getMe: async (): Promise<User> => {
    const response = await api.get('/students/me');
    return response.data;
  },
  
  getAllStudents: async (): Promise<User[]> => {
    const response = await api.get('/students/');
    return response.data;
  },

  deleteStudent: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`);
  }
};
