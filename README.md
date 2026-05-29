# ASTeroid - уникальный проект для расширенного анализа ваших приложений!

📖 **[Ультимативный гайд по всем библиотекам →](GUIDE.md)**

## Стек

| Категория            | Библиотека                            |
| -------------------- | ------------------------------------- |
| UI                   | React 19 + TypeScript                 |
| Бандлер              | Vite 7 (SWC)                          |
| Серверное состояние  | TanStack Query v5                     |
| Клиентское состояние | Zustand v5 + Immer                    |
| Роутинг              | React Router v7                       |
| HTTP                 | Axios                                 |
| Стилизация           | SCSS + CSS Variables                  |
| Формы                | react-hook-form + @hookform/resolvers |
| Валидация            | Zod                                   |
| Иконки               | lucide-react                          |
| Уведомления          | sonner                                |
| Дата/время           | date-fns                              |
| Drag & Drop          | @dnd-kit/core + @dnd-kit/sortable     |
| Линтер               | ESLint (flat config) + Prettier       |
| Git-хуки             | Husky v9 + lint-staged                |

## Начало работы

```bash
# 1. Установить зависимости
npm install

# 2. Запустить dev-сервер
npm run dev
# → http://localhost:3000
```

## Скрипты

| Скрипт               | Описание                                 |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Запустить dev-сервер на :3000            |
| `npm run build`      | Продакшн-сборка                          |
| `npm run build:dev`  | Dev-сборка (с source maps)               |
| `npm run preview`    | Предварительный просмотр продакшн-сборки |
| `npm run lint`       | Проверка линтером (ноль предупреждений)  |
| `npm run lint:fix`   | Автоисправление ошибок линтера           |
| `npm run format`     | Проверка форматирования Prettier         |
| `npm run format:fix` | Форматирование всех файлов Prettier      |
