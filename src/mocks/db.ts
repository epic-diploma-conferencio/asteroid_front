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

export interface ArticleRecord {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  content: string;
}

export interface AvailableRuleRecord {
  ruleName: string;
  ruleRussian: string;
  ruleDescription: string;
}

export interface UploadedArchiveRecord {
  id: string;
  archiveName: string;
  fileCount: number;
  uploadedAt: string;
}

export interface AnalysisJobRecord {
  id: string;
  createdAt: string;
  rules: string[];
  uploadId: string | null;
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

const articleCover = (seed: string) => `https://picsum.photos/seed/article-${seed}/640/640`;

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
  articles: new Map<string, ArticleRecord>(),
  uploads: new Map<string, UploadedArchiveRecord>(),
  analysisJobs: new Map<string, AnalysisJobRecord>(),
  sessions: new Map<string, string>(),
  rules: [] as AvailableRuleRecord[],
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

const seedArticles: ArticleRecord[] = [
  {
    id: 'upload-project',
    title: 'Как загрузить проект или архив',
    excerpt: 'Какие форматы поддерживаются и как подготовить архив перед анализом.',
    coverImage: articleCover('upload-project'),
    content: `## Какие форматы можно загружать

- одиночные файлы популярных языков программирования;
- zip-архивы с проектом;
- подготовленные каталоги без бинарных артефактов.

## Что лучше проверить перед отправкой

- удалите тяжёлые \`node_modules\`, \`.gradle\`, \`dist\` и другие сборочные папки;
- убедитесь, что в архив попали исходники, конфиги и lock-файлы;
- если проект большой, начните с отдельного модуля, чтобы быстрее получить первый отчёт.

![Схема загрузки](https://picsum.photos/seed/article-upload/1200/680)

## Что происходит после загрузки

После отправки система распаковывает проект, строит карту файлов и даёт вам выбрать, какие части репозитория включать в анализ.`,
  },
  {
    id: 'save-research',
    title: 'Как сохранять исследования',
    excerpt: 'Когда лучше сохранять отчёт, как назвать исследование и где искать его потом.',
    coverImage: articleCover('save-research'),
    content: `## Когда стоит сохранять исследование

Сохраняйте результат сразу после получения нужного набора карточек, чтобы позже вернуться к тем же метрикам и описанию.

## Как выбрать название

- используйте имя проекта или модуля;
- добавляйте короткий контекст: \`frontend-core / релиз 1.4\`;
- в описание заносите, что именно вы проверяли.

## Где потом искать результат

Все сохранённые исследования лежат в разделе **Сохраненные исследования**. Оттуда можно открыть конкретный результат и при необходимости обновить его название или описание.`,
  },
  {
    id: 'read-ast',
    title: 'Как читать AST-карточки',
    excerpt: 'Коротко о том, что показывают AST-деревья файлов и зачем они нужны в отчёте.',
    coverImage: articleCover('read-ast'),
    content: `## Что показывает AST-экран

AST-карточки показывают структуру файла не как текст, а как дерево конструкций: условий, циклов, возвратов и присваиваний.

## На что смотреть в первую очередь

- много вложенных ветвлений;
- громоздкие функции с несколькими ветками \`return\`;
- повторяющиеся участки дерева в похожих файлах.

\`\`\`ts
if (user && user.role === 'admin') {
  return canPublish(post);
}
\`\`\`

Даже такой небольшой фрагмент в AST превращается в наглядную схему условий и ветвлений.`,
  },
  {
    id: 'share-results',
    title: 'Как делиться результатами с командой',
    excerpt: 'Советы по оформлению исследования перед тем, как отправить его коллегам.',
    coverImage: articleCover('share-results'),
    content: `## Перед отправкой коллегам

- дайте исследованию понятное название;
- добавьте короткое описание, что именно было проверено;
- зафиксируйте, какие карточки требуют внимания в первую очередь.

## Что удобно обсуждать по сохранённому исследованию

1. архитектурные отклонения;
2. состояние зависимостей;
3. AST-деревья самых спорных файлов.

Так у команды всегда будет единая точка входа в обсуждение результата.`,
  },
];

seedArticles.forEach((article) => db.articles.set(article.id, article));

export const cloneDefaultCards = () => defaultCards.map((c) => ({ ...c }));

db.rules = [
  {
    ruleName: 'structAnalysis',
    ruleRussian: 'Структурный анализ',
    ruleDescription:
      'Система проверит, как разложены файлы и слои проекта относительно ожидаемой структуры.',
  },
  {
    ruleName: 'archAnalysis',
    ruleRussian: 'Архитектурный анализ',
    ruleDescription:
      'Поиск нарушений между модулями, слоями и потенциально опасных архитектурных связей.',
  },
  {
    ruleName: 'dependencyAnalysis',
    ruleRussian: 'Анализ зависимостей проекта',
    ruleDescription: 'Проверка внешних зависимостей, связей между пакетами и критичных импортов.',
  },
  {
    ruleName: 'buildAnalysis',
    ruleRussian: 'Анализ билда проекта',
    ruleDescription:
      'Проверка сборочных конфигов, alias-ов и сценариев, которые могут ломать запуск.',
  },
  {
    ruleName: 'lintAnalysis',
    ruleRussian: 'Линт-анализ',
    ruleDescription:
      'Проверка типичных style issues, потенциальных багов и проблем читаемости кода.',
  },
  {
    ruleName: 'unusedVarsAnalysis',
    ruleRussian: 'Анализ неиспользуемых переменных',
    ruleDescription:
      'Поиск забытых импортов, переменных и параметров, которые больше не участвуют в логике.',
  },
  {
    ruleName: 'vulnerabilityAnalysis',
    ruleRussian: 'Анализ уязвимостей в проекте',
    ruleDescription:
      'Проверка зависимостей и конфигураций на признаки известных уязвимостей и рисков.',
  },
  {
    ruleName: 'complexityAnalysis',
    ruleRussian: 'Анализ сложности кода',
    ruleDescription:
      'Поиск самых перегруженных функций, тяжёлых ветвлений и сложно поддерживаемых мест.',
  },
];
