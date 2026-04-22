import type { ResultCardData } from './ResultCard';

const mountains = (seed: number) => `https://picsum.photos/seed/research-mountains-${seed}/960/640`;

export const researchCards: ResultCardData[] = [
  {
    id: 'ast',
    title: 'AST-деревья файлов',
    subtitle: <>Проанализировано файлов: 15</>,
    preview: mountains(1),
  },
  {
    id: 'arch',
    title: 'Архитектурные отклонения',
    subtitle: (
      <>
        Количество архитектурных ошибок:{' '}
        <span className="research-card__value research-card__value--danger">43</span>
      </>
    ),
    preview: mountains(2),
  },
  {
    id: 'structure',
    title: 'Структурный анализ',
    subtitle: (
      <>
        Соответствие проекта структуре FSD:{' '}
        <span className="research-card__value research-card__value--success">96%</span>
      </>
    ),
    preview: mountains(3),
  },
  {
    id: 'deps',
    title: 'Анализ зависимостей проекта',
    subtitle: (
      <>
        Уязвимостей в проекте: 5, из них <u>критических</u>:{' '}
        <span className="research-card__value research-card__value--success">0</span>
        <span className="research-card__subtitle-meta">(на момент 05.03.2026 13:00 GMT)</span>
      </>
    ),
    preview: mountains(4),
  },
];
