import type { ResearchCard } from '@/entities/research';

const mountains = (seed: number) => `https://picsum.photos/seed/research-mountains-${seed}/960/640`;

export const researchCards: ResearchCard[] = [
  {
    id: 'ast',
    kind: 'ast',
    title: 'AST-деревья файлов',
    stat: { label: 'Проанализировано файлов', value: '15', tone: 'neutral' },
    preview: mountains(1),
    files: ['main.ts', 'modules.ts', 'config.ts', 'router.ts', 'store.ts', 'auth.ts'],
  },
  {
    id: 'arch',
    kind: 'arch',
    title: 'Архитектурные отклонения',
    stat: { label: 'Количество архитектурных ошибок', value: '43', tone: 'danger' },
    preview: mountains(2),
  },
  {
    id: 'structure',
    kind: 'structure',
    title: 'Структурный анализ',
    stat: { label: 'Соответствие проекта структуре FSD', value: '96%', tone: 'success' },
    preview: mountains(3),
  },
  {
    id: 'deps',
    kind: 'deps',
    title: 'Анализ зависимостей проекта',
    stat: { label: 'Уязвимостей в проекте', value: '5', tone: 'neutral' },
    preview: mountains(4),
  },
];

export const buildCardsFromResearch = (cards: ResearchCard[]): ResearchCard[] => cards;
