import { HttpResponse, delay, http } from 'msw';

import { env } from '@/shared/config';

import { cloneDefaultCards, db, type SavedResearchRecord } from './db';
import { createAccessToken, readAccessToken } from './token';

const base = env.apiUrl;

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

const publicUser = (u: { id: string; login: string }) => ({
  login: u.login,
});

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

const buildProjectListItem = (r: SavedResearchRecord, currentUserId: string) => ({
  id: r.id,
  name: r.name,
  description: r.description,
  ownerEmail: ownerEmailFor(r.ownerId),
  ownerIsMe: r.ownerId === currentUserId,
  language: r.language,
  createdAt: r.createdAt,
  preview: r.preview,
});

const ownerEmailFor = (ownerId: string) => {
  const user = Array.from(db.users.values()).find((u) => u.id === ownerId);
  if (!user) {
    return 'unknown@example.com';
  }
  return user.login.includes('@') ? user.login : `${user.login}@example.com`;
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
    };
    db.users.set(login, user);
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
      .filter((r) => r.ownerId === user.id)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map((r) => buildProjectListItem(r, user.id));
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
    if (!research || research.ownerId !== user.id) {
      return json(errorBody('Не найдено', 'NOT_FOUND', 404, `/saved/${id}`), 404);
    }
    return json({
      id: research.id,
      name: research.name,
      description: research.description,
      language: research.language,
      createdAt: research.createdAt,
      preview: research.preview,
      cards: research.cards,
    });
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
      language: 'TypeScript',
      createdAt: new Date().toISOString(),
      preview: `https://picsum.photos/seed/${id}/640/480`,
      cards: cloneDefaultCards(),
    };
    db.researches.set(id, record);
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
    return json(buildProjectListItem(research, user.id));
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
];
