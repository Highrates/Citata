# ЦИТАТА — сайт PR-агентства

Монорепо: **`frontend/`** (Next.js :3000) + **`backend/`** (Payload CMS :3001).

Структура: **[doc/structure.md](./doc/structure.md)** · Деплой: **[doc/DEPLOY.md](./doc/DEPLOY.md)**

## Быстрый старт

```bash
# PostgreSQL (один раз)
psql -h localhost -d postgres -c "CREATE ROLE citata WITH LOGIN PASSWORD 'password';"
psql -h localhost -d postgres -c "CREATE DATABASE citata_dev OWNER citata;"

cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

npm install
npm run dev          # оба процесса
# или по отдельности:
npm run dev:front    # http://localhost:3000
npm run dev:back     # http://localhost:3001
```

| URL | Что |
|-----|-----|
| http://localhost:3000 | Публичный сайт |
| http://localhost:3000/admin | Кастомная CMS-админка |
| http://localhost:3001/payload | Payload UI |
| http://localhost:3001/api/cases | REST API |

По умолчанию `CONTENT_SOURCE=fixtures` — фронт без БД. Для записи из `/admin` задайте `PAYLOAD_API_KEY` в `frontend/.env` (ключ пользователя в Payload → Users → API Key).

## Workspaces

```bash
npm run build:front
npm run build:back
npm run seed -w backend   # после миграций / первого старта backend
npm test                  # мапперы на frontend
```
