import api from './api';
import { User } from '../types';

export const usuariosService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/usuarios/');
    return response.data;
  },

  toggleEstado: async (userId: string): Promise<User> => {
    const response = await api.patch(`/usuarios/${userId}/estado`);
    return response.data;
  },
};
