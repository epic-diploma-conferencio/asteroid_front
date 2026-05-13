# ─── Prod-образ фронтенда: статическая сборка + nginx ─────────────────────────
# Stage 1: сборка Vite-приложения
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# В prod VITE_API_URL должен быть относительным /api, потому что внешний nginx
# (см. nginx/nginx.conf) сам проксирует /api на manager:3000.
# .env.production уже выставляет VITE_API_URL=/api.
RUN npm run build

# ─── Stage 2: раздача статики через nginx ─────────────────────────────────────
FROM nginx:1.27-alpine

# Подменяем дефолтный server-конфиг на наш собственный (см. nginx/nginx.conf)
RUN rm /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
