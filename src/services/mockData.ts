import { Election, Category, Candidate, User } from '../types';

export const mockElections: Election[] = [
  {
    id: '1',
    title: 'Elecciones de Rectoría 2026',
    description: 'Elección para el cargo de Rector de la Universidad Nacional.',
    startDate: '2026-06-01',
    endDate: '2026-06-02',
    status: 'active',
  },
  {
    id: '2',
    title: 'Consejo Estudiantil de Ingeniería',
    description: 'Votaciones para delegados de la Facultad de Ingeniería.',
    startDate: '2026-05-15',
    endDate: '2026-05-16',
    status: 'inactive',
  },
];

export const mockCategories: Category[] = [
  { id: 'c1', name: 'Rector', electionId: '1' },
  { id: 'c2', name: 'Vicerrector', electionId: '1' },
];

export const mockCandidates: Candidate[] = [
  {
    id: 'can1',
    name: 'Dr. Juan Pérez',
    description: 'Propuesta: Modernización de laboratorios.',
    photoUrl: 'https://i.pravatar.cc/150?u=can1',
    categoryId: 'c1',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'can2',
    name: 'Dra. María García',
    description: 'Propuesta: Becas de intercambio internacional.',
    photoUrl: 'https://i.pravatar.cc/150?u=can2',
    categoryId: 'c1',
  },
];

export const mockUser: User = {
  id: '1',
  name: 'Estudiante',
  lastName: 'Prueba',
  regUniv: '20210001',
  idCard: '12345678',
  role: 'student',
};

export const mockAdmin: User = {
  id: '2',
  name: 'Admin',
  lastName: 'Sistema',
  regUniv: 'ADMIN01',
  idCard: '87654321',
  role: 'admin',
};
