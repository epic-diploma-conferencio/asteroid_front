export interface SavedProject {
  id: string;
  name: string;
  ownerEmail: string;
  ownerIsMe: boolean;
  language: string;
  createdAt: string;
  preview: string;
}

const placeholder = (seed: number) => `https://picsum.photos/seed/saved${seed}/640/480`;

export const mockProjects: SavedProject[] = [
  {
    id: '1',
    name: 'ASTANAKEBAB',
    ownerEmail: 'ishowspeed@gmail.com',
    ownerIsMe: true,
    language: 'Java',
    createdAt: '3 дня назад',
    preview: placeholder(1),
  },
  {
    id: '2',
    name: 'ivan.zip',
    ownerEmail: 'dimarikept@gmail.com',
    ownerIsMe: false,
    language: 'C#',
    createdAt: '3 дня назад',
    preview: placeholder(2),
  },
  {
    id: '3',
    name: 'ivan.zip',
    ownerEmail: 'dimarikept@gmail.com',
    ownerIsMe: false,
    language: 'TS',
    createdAt: '3 дня назад',
    preview: placeholder(3),
  },
  {
    id: '4',
    name: 'legacy-core-auth-service',
    ownerEmail: 'dimarikept@gmail.com',
    ownerIsMe: false,
    language: 'Go',
    createdAt: '5 дней назад',
    preview: placeholder(4),
  },
  {
    id: '5',
    name: 'payments-gateway',
    ownerEmail: 'ishowspeed@gmail.com',
    ownerIsMe: true,
    language: 'Kotlin',
    createdAt: '1 неделю назад',
    preview: placeholder(5),
  },
  {
    id: '6',
    name: 'observability-dashboard',
    ownerEmail: 'tima@yandex.ru',
    ownerIsMe: false,
    language: 'TS',
    createdAt: '2 недели назад',
    preview: placeholder(6),
  },
  {
    id: '7',
    name: 'ai-code-review-bot',
    ownerEmail: 'morsssovski@gmail.com',
    ownerIsMe: true,
    language: 'Python',
    createdAt: '3 недели назад',
    preview: placeholder(7),
  },
];
