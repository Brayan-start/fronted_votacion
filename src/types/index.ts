export type Role = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  last_name: string;
  reg_univ: string;
  id_card: string;
  email: string;
  role: Role;
  photo_url?: string;
  career?: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive' | 'closed';
  type: 'rectorado' | 'consejo' | 'carrera';
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  election_id: string;
  created_at?: string;
}

export interface Candidate {
  id: string;
  name: string;
  description: string;
  photo_url: string;
  photo_base64?: string;
  video_url?: string;
  category_id: string;
  career?: string;
  created_at?: string;
}

export interface Career {
  id: string;
  name: string;
  faculty: string;
}

export interface LoginRequest {
  reg_univ: string;
  id_card: string;
  recaptcha_token?: string; // Token de reCAPTCHA v2 para validación servidor
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface VoteCreate {
  election_id: string;
  category_id: string;
  candidate_id: string;
  face_capture_base64: string;
}

export interface VoteResponse {
  id: string;
  user_id: string;
  election_id: string;
  category_id: string;
  candidate_id: string;
  created_at: string;
}

// --- Profile ---

export interface UpdateProfileRequest {
  name?: string;
  last_name?: string;
  career?: string;
}

export interface PhotoUploadRequest {
  photo_base64: string;
}

// --- Password Reset ---

export interface PasswordResetRequest {
  email: string;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ApiMessageResponse {
  message: string;
}

// --- Vote History ---

export interface VoteHistoryItem {
  id: string;
  election_title: string;
  election_type: string;
  category_name: string;
  candidate_name: string;
  created_at: string;
}

// --- Carnet ---

export interface CarnetData {
  name: string;
  last_name: string;
  id_card: string;
  reg_univ: string;
  email: string;
  carrera?: string;
  mesa: string;
  gestion: string;
  fecha_emision: string;
  codigo_verificacion: string;
  photo_url?: string;
}
