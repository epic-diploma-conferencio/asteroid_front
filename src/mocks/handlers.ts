import { HttpResponse, delay, http } from 'msw';

import { env } from '@/shared/config';

import { cloneDefaultCards, db, persistMockDb, type SavedResearchRecord } from './db';
import { createAccessToken, readAccessToken } from './token';

const base = env.apiUrl;
const ANALYSIS_DURATION_MS = 60_000;
const LONG_POLL_TIMEOUT_MS = 20_000;
const DRAFT_TTL_MS = 30 * 60_000;

const url = (path: string) => `${base}${path}`;

const json = <T>(body: T, status = 200) => HttpResponse.json(body as object, { status });

const errorBody = (message: string, code: string, status: number, path: string) => ({
  timestamp: new Date().toISOString(),
  status,
  code,
  message,
  path,
});

const randomId = () => Math.random().toString(36).slice(2, 10);

const publicUser = (u: {
  login: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}) => ({
  login: u.login,
  firstName: u.firstName ?? u.login,
  lastName: u.lastName ?? u.login,
  avatarUrl:
    u.avatarUrl ?? `https://cdn.example.com/avatars/${encodeURIComponent(u.login)}/default.webp`,
});

const normalizeResearchName = (archiveName: string) => {
  const trimmed = archiveName.trim();
  const nameWithoutZip = trimmed.replace(/\.zip$/i, '');
  const normalized = nameWithoutZip.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return 'Новое исследование';
  }

  return normalized;
};

const pruneExpiredDraft = (research: SavedResearchRecord) => {
  if (research.isSaved || !research.expiresAt) {
    return false;
  }

  if (Date.now() < Date.parse(research.expiresAt)) {
    return false;
  }

  db.researches.delete(research.id);
  persistMockDb();
  return true;
};

const hydrateResearchIfReady = (research: SavedResearchRecord) => {
  if (pruneExpiredDraft(research)) {
    return null;
  }

  if (research.status !== 'processing' || !research.readyAt) {
    return research;
  }

  if (Date.now() < Date.parse(research.readyAt)) {
    return research;
  }

  research.status = 'completed';
  research.readyAt = null;
  research.preview = research.preview || `https://picsum.photos/seed/${research.id}/640/480`;
  research.cards = research.cards.length > 0 ? research.cards : cloneDefaultCards();
  research.expiresAt = research.isSaved ? null : new Date(Date.now() + DRAFT_TTL_MS).toISOString();
  persistMockDb();

  return research;
};

const authUser = (req: Request) => {
  const header = req.headers.get('authorization') ?? req.headers.get('Authorization') ?? '';
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7) : '';
  const payload = readAccessToken(token);
  if (!payload) {
    return null;
  }
  const user = Array.from(db.users.values()).find((u) => u.id === payload.sub);
  return user ?? null;
};

const buildProjectListItem = (r: SavedResearchRecord, currentUserId: string) => {
  const research = hydrateResearchIfReady(r);
  if (!research) {
    return null;
  }

  return {
    id: research.id,
    name: research.name,
    description: research.description,
    ownerEmail: ownerEmailFor(research.ownerId),
    ownerIsMe: research.ownerId === currentUserId,
    isSaved: research.isSaved,
    language: research.language,
    createdAt: research.createdAt,
    preview: research.preview,
    status: research.status,
  };
};

const ownerEmailFor = (ownerId: string | null) => {
  if (!ownerId) {
    return 'guest@asteroid.local';
  }
  const user = Array.from(db.users.values()).find((u) => u.id === ownerId);
  if (!user) {
    return 'unknown@example.com';
  }
  return user.login.includes('@') ? user.login : `${user.login}@example.com`;
};

const buildResearchDetail = (research: SavedResearchRecord, currentUserId: string | null) => {
  const hydratedResearch = hydrateResearchIfReady(research);
  if (!hydratedResearch) {
    return null;
  }

  return {
    id: hydratedResearch.id,
    name: hydratedResearch.name,
    description: hydratedResearch.description,
    ownerIsMe: hydratedResearch.ownerId !== null && hydratedResearch.ownerId === currentUserId,
    isSaved: hydratedResearch.isSaved,
    status: hydratedResearch.status,
    language: hydratedResearch.language,
    createdAt: hydratedResearch.createdAt,
    preview: hydratedResearch.preview,
    cards: hydratedResearch.status === 'completed' ? hydratedResearch.cards : [],
  };
};

export const handlers = [
  http.post(url('/auth/register'), async ({ request }) => {
    await delay(250);
    const body = (await request.json()) as { login?: string; password?: string };
    const login = (body.login ?? '').trim();
    const password = body.password ?? '';
    if (login.length < 3 || password.length < 6) {
      return json(errorBody('Некорректные данные', 'BAD_REQUEST', 400, '/auth/register'), 400);
    }
    if (db.users.has(login)) {
      return json(errorBody('Пользователь уже существует', 'CONFLICT', 409, '/auth/register'), 409);
    }
    const user = {
      id: randomId(),
      login,
      password,
      firstName: login,
      lastName: login,
      avatarUrl: `https://cdn.example.com/avatars/${encodeURIComponent(login)}/default.webp`,
    };
    db.users.set(login, user);
    persistMockDb();
    const accessToken = createAccessToken(user.id, user.login);
    return json({ accessToken, expiresIn: 3600, user: publicUser(user) });
  }),

  http.post(url('/auth/login'), async ({ request }) => {
    await delay(250);
    const body = (await request.json()) as { login?: string; password?: string };
    const login = (body.login ?? '').trim();
    const password = body.password ?? '';
    const user = db.users.get(login);
    if (!user || user.password !== password) {
      return json(errorBody('Неверный логин или пароль', 'UNAUTHORIZED', 401, '/auth/login'), 401);
    }
    const accessToken = createAccessToken(user.id, user.login);
    return json({ accessToken, expiresIn: 3600, user: publicUser(user) });
  }),

  http.post(url('/auth/refresh'), async ({ request }) => {
    await delay(150);
    const user = authUser(request);
    if (!user) {
      return json(errorBody('Нет сессии', 'UNAUTHORIZED', 401, '/auth/refresh'), 401);
    }
    const accessToken = createAccessToken(user.id, user.login);
    return json({ accessToken, expiresIn: 3600, user: publicUser(user) });
  }),

  http.post(url('/auth/logout'), async () => {
    await delay(100);
    return json({ message: 'Сессия завершена' });
  }),

  http.get(url('/auth/me'), async ({ request }) => {
    await delay(100);
    const user = authUser(request);
    if (!user) {
      return json(errorBody('Нет сессии', 'UNAUTHORIZED', 401, '/auth/me'), 401);
    }
    return json(publicUser(user));
  }),

  http.get(url('/saved'), async ({ request }) => {
    await delay(200);
    const user = authUser(request);
    if (!user) {
      return json(errorBody('Нет сессии', 'UNAUTHORIZED', 401, '/saved'), 401);
    }
    const list = Array.from(db.researches.values())
      .map((research) => hydrateResearchIfReady(research))
      .filter(
        (research): research is SavedResearchRecord =>
          research !== null &&
          research.ownerId === user.id &&
          (research.isSaved || research.status === 'processing'),
      )
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((research) => buildProjectListItem(research, user.id))
      .filter((item): item is NonNullable<typeof item> => item !== null);
    return json({ items: list });
  }),

  http.get(url('/saved/:id'), async ({ request, params }) => {
    await delay(200);
    const user = authUser(request);
    if (!user) {
      return json(errorBody('Нет сессии', 'UNAUTHORIZED', 401, '/saved/:id'), 401);
    }
    const id = String(params.id);
    const research = db.researches.get(id);
    if (!research || research.ownerId !== user.id || !research.isSaved) {
      return json(errorBody('Не найдено', 'NOT_FOUND', 404, `/saved/${id}`), 404);
    }
    const detail = buildResearchDetail(research, user.id);
    if (!detail) {
      return json(errorBody('Не найдено', 'NOT_FOUND', 404, `/saved/${id}`), 404);
    }
    return json(detail);
  }),

  http.post(url('/saved'), async ({ request }) => {
    await delay(250);
    const user = authUser(request);
    if (!user) {
      return json(errorBody('Нет сессии', 'UNAUTHORIZED', 401, '/saved'), 401);
    }
    const body = (await request.json()) as { name?: string; description?: string | null };
    const name = (body.name ?? '').trim();
    if (name.length < 3 || name.length > 40) {
      return json(errorBody('Некорректное имя', 'BAD_REQUEST', 400, '/saved'), 400);
    }
    const id = `r-${randomId()}`;
    const record: SavedResearchRecord = {
      id,
      ownerId: user.id,
      name,
      description: body.description ?? null,
      isSaved: true,
      language: 'TypeScript',
      createdAt: new Date().toISOString(),
      preview: `https://picsum.photos/seed/${id}/640/480`,
      cards: cloneDefaultCards(),
      status: 'completed',
      readyAt: null,
      expiresAt: null,
    };
    db.researches.set(id, record);
    persistMockDb();
    return json(buildProjectListItem(record, user.id), 201);
  }),

  http.patch(url('/saved/:id'), async ({ request, params }) => {
    await delay(200);
    const user = authUser(request);
    if (!user) {
      return json(errorBody('Нет сессии', 'UNAUTHORIZED', 401, '/saved/:id'), 401);
    }
    const id = String(params.id);
    const research = db.researches.get(id);
    if (!research || research.ownerId !== user.id) {
      return json(errorBody('Не найдено', 'NOT_FOUND', 404, `/saved/${id}`), 404);
    }
    const body = (await request.json()) as { name?: string; description?: string | null };
    if (typeof body.name === 'string') {
      const name = body.name.trim();
      if (name.length < 3 || name.length > 40) {
        return json(errorBody('Некорректное имя', 'BAD_REQUEST', 400, `/saved/${id}`), 400);
      }
      research.name = name;
    }
    if (body.description !== undefined) {
      research.description = body.description;
    }
    research.isSaved = true;
    research.expiresAt = null;
    persistMockDb();

    const item = buildProjectListItem(research, user.id);
    if (!item) {
      return json(errorBody('Не найдено', 'NOT_FOUND', 404, `/saved/${id}`), 404);
    }

    return json(item);
  }),

  http.delete(url('/saved/:id'), async ({ request, params }) => {
    await delay(150);
    const user = authUser(request);
    if (!user) {
      return json(errorBody('Нет сессии', 'UNAUTHORIZED', 401, '/saved/:id'), 401);
    }
    const id = String(params.id);
    const research = db.researches.get(id);
    if (!research || research.ownerId !== user.id) {
      return json(errorBody('Не найдено', 'NOT_FOUND', 404, `/saved/${id}`), 404);
    }
    db.researches.delete(id);
    persistMockDb();
    return json({ message: 'Удалено' });
  }),

  http.get(url('/articles'), async () => {
    await delay(220);
    const articles = Array.from(db.articles.values()).map(
      ({ content: _content, ...article }) => article,
    );
    return json(articles);
  }),

  http.get(url('/articles/:articleId'), async ({ params }) => {
    await delay(220);
    const articleId = String(params.articleId);
    const article = db.articles.get(articleId);

    if (!article) {
      return json(errorBody('Статья не найдена', 'NOT_FOUND', 404, `/articles/${articleId}`), 404);
    }

    return json(article);
  }),

  http.post(url('/upload'), async ({ request }) => {
    await delay(420);
    const formData = await request.formData();
    const archive = formData.get('file');
    const languageField = formData.get('language');

    if (!(archive instanceof File)) {
      return json(errorBody('Файл не найден', 'BAD_REQUEST', 400, '/upload'), 400);
    }

    const archiveId = `upload-${randomId()}`;
    const uploadedArchive = {
      id: archiveId,
      archiveName: archive.name,
      fileCount: 1,
      uploadedAt: new Date().toISOString(),
      language: typeof languageField === 'string' && languageField.trim() ? languageField : 'Mixed',
    };

    db.uploads.set(archiveId, uploadedArchive);
    persistMockDb();

    return json({
      message: 'Архив успешно загружен',
      archiveId,
      archiveName: archive.name,
      fileCount: 1,
      language: uploadedArchive.language,
    });
  }),

  http.get(url('/rules/avaliable'), async () => {
    await delay(280);
    return json({
      rules: db.rules,
    });
  }),

  http.get(url('/research/:id'), async ({ request, params }) => {
    await delay(220);
    const currentUser = authUser(request);
    const id = String(params.id);
    const research = db.researches.get(id);

    if (!research) {
      return json(errorBody('Не найдено', 'NOT_FOUND', 404, `/research/${id}`), 404);
    }

    const detail = buildResearchDetail(research, currentUser?.id ?? null);
    if (!detail) {
      return json(errorBody('Не найдено', 'NOT_FOUND', 404, `/research/${id}`), 404);
    }

    return json(detail);
  }),

  http.get(url('/research/:id/status'), async ({ request, params }) => {
    const id = String(params.id);
    const research = db.researches.get(id);

    if (!research) {
      return json(errorBody('Не найдено', 'NOT_FOUND', 404, `/research/${id}/status`), 404);
    }

    const searchParams = new URL(request.url).searchParams;
    const since = searchParams.get('since') === 'completed' ? 'completed' : 'processing';
    const hydratedResearch = hydrateResearchIfReady(research);
    if (!hydratedResearch) {
      return json(errorBody('Не найдено', 'NOT_FOUND', 404, `/research/${id}/status`), 404);
    }

    if (hydratedResearch.status !== since) {
      return json({
        id: hydratedResearch.id,
        status: hydratedResearch.status,
      });
    }

    const remainingMs = research.readyAt
      ? Math.max(0, Date.parse(research.readyAt) - Date.now())
      : 0;
    const waitMs = Math.min(LONG_POLL_TIMEOUT_MS, remainingMs);
    await delay(waitMs);

    const refreshedResearch = hydrateResearchIfReady(research);
    if (!refreshedResearch) {
      return json(errorBody('Не найдено', 'NOT_FOUND', 404, `/research/${id}/status`), 404);
    }

    return json({
      id: refreshedResearch.id,
      status: refreshedResearch.status,
    });
  }),

  http.post(url('/startAnalysis'), async ({ request }) => {
    await delay(260);
    const currentUser = authUser(request);
    const body = (await request.json()) as {
      rules?: Array<{ ruleName?: string; value?: boolean }>;
      uploadId?: string | null;
    };

    const rules = (body.rules ?? []).filter(
      (rule): rule is { ruleName: string; value: boolean } => typeof rule.ruleName === 'string',
    );

    if (rules.length < 1) {
      return json(
        errorBody('Нужно минимум одно правило', 'BAD_REQUEST', 400, '/startAnalysis'),
        400,
      );
    }

    const analysisId = `analysis-${randomId()}`;
    const researchId = `r-${randomId()}`;
    const archive = body.uploadId ? db.uploads.get(body.uploadId) : undefined;
    const researchRecord: SavedResearchRecord = {
      id: researchId,
      ownerId: currentUser?.id ?? null,
      name: normalizeResearchName(archive?.archiveName ?? 'Новое исследование'),
      description: null,
      isSaved: false,
      language: archive?.language ?? 'Mixed',
      createdAt: new Date().toISOString(),
      preview: '',
      cards: [],
      status: 'processing',
      readyAt: new Date(Date.now() + ANALYSIS_DURATION_MS).toISOString(),
      expiresAt: new Date(Date.now() + ANALYSIS_DURATION_MS + DRAFT_TTL_MS).toISOString(),
    };

    db.researches.set(researchId, researchRecord);

    db.analysisJobs.set(analysisId, {
      id: analysisId,
      createdAt: new Date().toISOString(),
      rules: rules.filter((rule) => rule.value).map((rule) => rule.ruleName),
      uploadId: body.uploadId ?? null,
      researchId,
    });
    persistMockDb();

    return json({
      message: 'Анализ успешно запущен',
      researchId,
      status: 'processing',
    });
  }),
];
