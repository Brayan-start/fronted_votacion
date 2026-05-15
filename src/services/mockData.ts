import { Election, Category, Candidate, User, Career } from '../types';

export const mockCareers: Career[] = [
  { id: '1', name: 'Ingeniería de Sistemas', faculty: 'Área de Ingeniería' },
  { id: '2', name: 'Derecho', faculty: 'Área de Sociales' },
  { id: '3', name: 'Medicina', faculty: 'Área de Salud' },
];

export const mockElections: Election[] = [
  { 
    id: '1', 
    title: 'Elecciones Rectorado 2026', 
    description: 'Elección de las máximas autoridades universitarias de la UPEA para el periodo 2026-2029.', 
    start_date: '2026-06-01', 
    end_date: '2026-06-02', 
    status: 'inactive',
    type: 'rectorado'
  },
  { 
    id: '2', 
    title: 'Consejo Universitario - Sistemas', 
    description: 'Representantes estudiantiles ante el Honorable Consejo Universitario.', 
    start_date: '2026-05-15', 
    end_date: '2026-05-16', 
    status: 'active',
    type: 'consejo'
  },
  { 
    id: '3', 
    title: 'Centro de Estudiantes Ingeniería', 
    description: 'Elección de delegados para el centro de estudiantes de la carrera.', 
    start_date: '2026-05-20', 
    end_date: '2026-05-21', 
    status: 'active',
    type: 'carrera'
  },
];

export const mockCategories: Category[] = [
  { id: 'c1', name: 'Rector', election_id: '1' },
  { id: 'c2', name: 'Vicerrector', election_id: '1' },
  { id: 'c3', name: 'Primer Delegado', election_id: '2' },
];

export const mockCandidates: Candidate[] = [
  { 
    id: 'can1', 
    name: 'Frente REVOLUCIÓN', 
    description: 'Comprometidos con la excelencia académica y la transparencia.', 
    photo_url: 'https://i.pravatar.cc/150?u=can1', 
    category_id: 'c1',
    video_url: 'https://youtube.com/watch?v=123'
  },
  { 
    id: 'can2', 
    name: 'Frente INTEGRIDAD', 
    description: 'Por una universidad moderna y digitalizada.', 
    photo_url: 'https://i.pravatar.cc/150?u=can2', 
    category_id: 'c1',
    video_url: 'https://youtube.com/watch?v=456'
  },
];

export const mockUser: User = {
  id: '1',
  name: 'Juan',
  last_name: 'Mamani',
  reg_univ: '20210001',
  id_card: '12345678',
  email: 'juan.mamani@upea.bo',
  role: 'student',
  career: 'Ingeniería de Sistemas',
};

export const mockAdmin: User = {
  id: '2',
  name: 'Administrador',
  last_name: 'UPEA',
  reg_univ: 'ADMIN01',
  id_card: '87654321',
  email: 'admin@upea.bo',
  role: 'admin',
};
