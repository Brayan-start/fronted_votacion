import api from './api';
import { User, LoginRequest, TokenResponse, UpdateProfileRequest, PhotoUploadRequest, ChangePasswordRequest, ApiMessageResponse } from '../types';

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
  },

  // ── Perfil ────────────────────────────────────────────────────────────

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.put('/students/profile', data);
    return response.data;
  },

  uploadPhoto: async (data: PhotoUploadRequest): Promise<User> => {
    const response = await api.post('/students/photo', data);
    return response.data;
  },

  // ── Cambio de contraseña ──────────────────────────────────────────────

  forgotPassword: async (email: string): Promise<ApiMessageResponse> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyResetCode: async (email: string, code: string): Promise<ApiMessageResponse> => {
    const response = await api.post('/auth/verify-code', { email, code });
    return response.data;
  },

  resetPassword: async (email: string, code: string, new_password: string): Promise<ApiMessageResponse> => {
    const response = await api.post('/auth/reset-password', { email, code, new_password });
    return response.data;
  },

  // ── Cambio de contraseña desde sesión activa ──────────────────────────

  changePassword: async (data: ChangePasswordRequest): Promise<ApiMessageResponse> => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },

  // ── Cerrar sesión en todos los dispositivos ──────────────────────────

  logoutAll: async (): Promise<ApiMessageResponse> => {
    const response = await api.post('/auth/logout-all');
    return response.data;
  },
};
