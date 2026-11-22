# Citata — деплой и окружение

**Стек:** Next.js 15 (frontend) + Payload CMS 3 (backend) + PostgreSQL + S3 Рег.облако + GSAP.  
**Монорепо workspaces**, **два процесса** на VPS (без Docker) — как Win-Win.

| На VPS | Frontend | Backend |
|--------|----------|---------|
| Путь | `/var/www/citata/frontend` | `/var/www/citata/backend` |
| PM2 | `citata-web` | `citata-api` |
| Порт | **3000** | **3001** |
| URL | сайт + `/admin` | `/api/*`, `/payload` |

Прод-домен: [citata-pr.ru](https://citata-pr.ru).  
Nginx: `/` и `/admin` → 3000; `/api` и `/payload` → 3001.

---

## 1. Локальная разработка

```bash
# PostgreSQL
psql -h localhost -d postgres -c "CREATE ROLE citata WITH LOGIN PASSWORD 'password';"
psql -h localhost -d postgres -c "CREATE DATABASE citata_dev OWNER citata;"

cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

npm install
npm run dev:back    # :3001 — первый раз откройте /payload и создайте user + API Key
npm run dev:front   # :3000
# или: npm run dev
```

| Переменная (frontend) | Назначение |
|----------------------|------------|
| `CONTENT_SOURCE` | `fixtures` \| `payload` |
| `API_URL` | `http://127.0.0.1:3001` |
| `PAYLOAD_API_KEY` | API Key пользователя Payload (запись из `/admin`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Вход в кастомную `/admin` |
| `REVALIDATE_SECRET` | Webhook ISR |

| Переменная (backend) | Назначение |
|---------------------|------------|
| `DATABASE_URL` | PostgreSQL |
| `PAYLOAD_SECRET` | Payload |
| `FRONTEND_URL` | `http://localhost:3000` — revalidate |
| `REVALIDATE_SECRET` | тот же, что на фронте |
| `NEXT_PUBLIC_SERVER_URL` | `http://localhost:3001` |

Seed:

```bash
npm run seed -w backend
```

---

## 2. Nginx (прод)

```nginx
server {
    listen 80;
    server_name citata-pr.ru www.citata-pr.ru;
    client_max_body_size 50m;

    # Admin media upload живёт на Next (/admin/api/…), не на Payload.
    # Весь остальной /api/ → Payload CMS.
    location ^~ /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location ^~ /payload {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

На проде `/payload` — IP whitelist / VPN.

---

## 3. PM2 (первый запуск)

```bash
# из корня репо на сервере
cd /var/www/citata
npm ci

cd backend && cp .env.example .env && nano .env
npm run build
pm2 start npm --name citata-api -- start

cd ../frontend && cp .env.example .env && nano .env
# API_URL=http://127.0.0.1:3001
# NEXT_PUBLIC_SITE_URL=https://citata-pr.ru
# CONTENT_SOURCE=payload
npm run build
pm2 start npm --name citata-web -- start

pm2 save
```

Обновление с локальной машины:

```bash
npm run deploy
# или с сообщением коммита:
npm run deploy -- "fix contacts layout"
```

Скрипт `scripts/deploy.sh`: коммитит незакоммиченное → `git push` → на VPS `git pull`, migrate, build backend/frontend, `pm2 restart citata-api` + `citata-web`.

Нужен SSH на `root@194.58.118.247` (ключ) либо `SSHPASS=... npm run deploy`.

Обновление вручную на сервере:

```bash
cd /var/www/citata && git pull && npm ci
cd backend && npm run build && pm2 restart citata-api
cd ../frontend && npm run build && pm2 restart citata-web
```

---

## 4. S3 и бэкапы

Как раньше: бакеты `citata-media` + `citata-backups` в Рег.облаке.  
Переменные `S3_*` — в **backend** `.env`.  
Скрипты: `backend/scripts/ops/backup-*.sh`.

---

## 5. HTTPS

```bash
sudo certbot --nginx -d citata-pr.ru -d www.citata-pr.ru
```

После TLS: `FRONTEND_URL` / `NEXT_PUBLIC_SITE_URL` / `API_URL` (публичный или localhost для server-side) обновить в `.env` и пересобрать.
