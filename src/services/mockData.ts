import { Election, Category, Candidate, User, Career } from '../types';

export const mockCareers: Career[] = [
  { id: '1', name: 'Ingeniería de Sistemas', faculty: 'Área de Ingeniería' },
  { id: '2', name: 'Derecho', faculty: 'Área de Ciencias Sociales' },
  { id: '3', name: 'Medicina', faculty: 'Área de Salud' },
  { id: '4', name: 'Contaduría Pública', faculty: 'Área de Ciencias Económicas' },
  { id: '5', name: 'Administración de Empresas', faculty: 'Área de Ciencias Económicas' },
];

export const mockElections: Election[] = [
  {
    id: '1',
    title: 'Elecciones de Rectorado UPEA 2026',
    description: 'Elección para el cargo de Rector y Vicerrector de la Universidad Pública de El Alto.',
    startDate: '2026-06-01',
    endDate: '2026-06-02',
    status: 'active',
    type: 'rectorado',
  },
  {
    id: '2',
    title: 'Consejo Estudiantil de Sistemas',
    description: 'Votaciones para delegados del centro de estudiantes de Ingeniería de Sistemas.',
    startDate: '2026-05-15',
    endDate: '2026-05-16',
    status: 'active',
    type: 'consejo',
  },
  {
    id: '3',
    title: 'Representantes de Carrera - Derecho',
    description: 'Elección de representantes ante el Honorable Consejo de Carrera.',
    startDate: '2026-05-20',
    endDate: '2026-05-21',
    status: 'inactive',
    type: 'carrera',
  },
];

export const mockCategories: Category[] = [
  { id: 'c1', name: 'Rector', electionId: '1' },
  { id: 'c2', name: 'Vicerrector', electionId: '1' },
  { id: 'c3', name: 'Primer Delegado', electionId: '2' },
];

export const mockCandidates: Candidate[] = [
  {
    id: 'can1',
    name: 'Dr. Condori Apaza',
    description: 'Propuesta: Digitalización total de trámites universitarios.',
    photoUrl: 'https://i.pravatar.cc/150?u=can1',
    categoryId: 'c1',
    career: 'Ingeniería de Sistemas',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'can2',
    name: 'Dra. Quispe Mamani',
    description: 'Propuesta: Incremento de presupuesto para investigación y becas comedor.',
    photoUrl: 'https://i.pravatar.cc/150?u=can2',
    categoryId: 'c1',
    career: 'Medicina',
  },
];

export const mockUser: User = {
  id: '1',
  name: 'Juan',
  lastName: 'Mamani',
  regUniv: '20210001',
  idCard: '12345678',
  email: 'juan.mamani@upea.bo',
  role: 'student',
  career: 'Ingeniería de Sistemas',
};

export const mockAdmin: User = {
  id: '2',
  name: 'Administrador',
  lastName: 'UPEA',
  regUniv: 'ADMIN01',
  idCard: '87654321',
  email: 'admin@upea.bo',
  role: 'admin',
};
