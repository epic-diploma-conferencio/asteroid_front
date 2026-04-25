import type { PublicUser } from '@/entities/user/model/user.types';

export interface MockUser extends PublicUser {
  id: string;
  password: string;
}

export interface SavedResearchRecord {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  language: string;
  createdAt: string;
  preview: string;
  cards: ResearchCard[];
}

export interface ResearchCard {
  id: string;
  kind: 'ast' | 'arch' | 'structure' | 'deps';
  title: string;
  stat: { label: string; value: string; tone?: 'danger' | 'success' | 'neutral' } | null;
  preview: string;
  files?: string[];
}

const placeholder = (seed: number | string) => `https://picsum.photos/seed/saved-${seed}/640/480`;

const defaultCards: ResearchCard[] = [
  {
    id: 'ast',
    kind: 'ast',
    title: 'AST-деревья файлов',
    stat: { label: 'Проанализировано файлов', value: '15', tone: 'neutral' },
    preview: placeholder('ast-1'),
    files: ['main.ts', 'modules.ts', 'config.ts', 'index.ts', 'router.ts', 'store.ts'],
  },
  {
    id: 'arch',
    kind: 'arch',
    title: 'Архитектурные отклонения',
    stat: { label: 'Количество архитектурных ошибок', value: '43', tone: 'danger' },
    preview: placeholder('arch-1'),
  },
  {
    id: 'structure',
    kind: 'structure',
    title: 'Структурный анализ',
    stat: { label: 'Соответствие проекта структуре FSD', value: '96%', tone: 'success' },
    preview: placeholder('structure-1'),
  },
  {
    id: 'deps',
    kind: 'deps',
    title: 'Анализ зависимостей проекта',
    stat: { label: 'Уязвимостей в проекте', value: '5', tone: 'neutral' },
    preview: placeholder('deps-1'),
  },
];

export const db = {
  users: new Map<string, MockUser>(),
  researches: new Map<string, SavedResearchRecord>(),
  sessions: new Map<string, string>(),
};

const seedUser: MockUser = {
  id: 'u-1',
  login: 'mors@example.com',
  password: 'password1',
};
db.users.set(seedUser.login, seedUser);

const seedResearches: SavedResearchRecord[] = [
  {
    id: 'r-ASTANAKEBAB',
    ownerId: seedUser.id,
    name: 'ASTANAKEBAB',
    description: 'Главный проект команды, Java',
    language: 'Java',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    preview: placeholder(1),
    cards: defaultCards,
  },
  {
    id: 'r-payments',
    ownerId: seedUser.id,
    name: 'payments-gateway',
    description: null,
    language: 'Kotlin',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    preview: placeholder(5),
    cards: defaultCards,
  },
  {
    id: 'r-codebot',
    ownerId: seedUser.id,
    name: 'ai-code-review-bot',
    description: 'Экспериментальный бот для PR-ревью',
    language: 'Python',
    createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
    preview: placeholder(7),
    cards: defaultCards,
  },
];
seedResearches.forEach((r) => db.researches.set(r.id, r));

export const cloneDefaultCards = () => defaultCards.map((c) => ({ ...c }));
