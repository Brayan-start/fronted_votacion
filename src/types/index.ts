export type Role = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  lastName: string;
  regUniv: string;
  idCard: string;
  email: string;
  role: Role;
  photoUrl?: string;
  career?: string;
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
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'closed';
  type: 'rectorado' | 'consejo' | 'carrera';
}

export interface Category {
  id: string;
  name: string;
  electionId: string;
}

export interface Candidate {
  id: string;
  name: string;
  description: string;
  photoUrl: string;
  videoUrl?: string;
  categoryId: string;
  career?: string;
}

export interface Career {
  id: string;
  name: string;
  faculty: string;
}
