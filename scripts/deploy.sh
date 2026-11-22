#!/usr/bin/env bash
set -euo pipefail

# Деплой Citata: коммит (если есть изменения) → push → VPS (PM2 + Nginx).
# Запуск: npm run deploy
#         npm run deploy -- "сообщение коммита"
#
# Переменные окружения (опционально):
#   DEPLOY_SERVER   default: root@194.58.118.247
#   DEPLOY_REMOTE   default: origin
#   DEPLOY_BRANCH   default: main
#   DEPLOY_APP_DIR  default: /var/www/citata
#   SKIP_COMMIT=1   не коммитить, только push + деплой

SERVER="${DEPLOY_SERVER:-root@194.58.118.247}"
REMOTE="${DEPLOY_REMOTE:-origin}"
BRANCH="${DEPLOY_BRANCH:-main}"
APP_DIR="${DEPLOY_APP_DIR:-/var/www/citata}"
COMMIT_MSG="${1:-}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Deploy Citata"
echo "    remote: $REMOTE"
echo "    branch: $BRANCH"
echo "    server: $SERVER"
echo "    app:    $APP_DIR"
echo

if [[ ! -d .git ]]; then
  echo "Error: это не git-репозиторий ($ROOT_DIR)" >&2
  exit 1
fi

dirty=0
if ! git diff-index --quiet HEAD -- 2>/dev/null; then dirty=1; fi
if [[ -n "$(git ls-files --others --exclude-standard)" ]]; then dirty=1; fi

if [[ "$dirty" -eq 1 ]]; then
  if [[ "${SKIP_COMMIT:-0}" == "1" ]]; then
    echo "Warning: есть незакоммиченные изменения — на сервер уйдёт только то, что уже в git."
    echo
  else
    echo "==> Commit local changes"
    git add -A
    if [[ -z "$COMMIT_MSG" ]]; then
      COMMIT_MSG="Deploy $(date '+%Y-%m-%d %H:%M')"
    fi
    git commit -m "$COMMIT_MSG"
    echo
  fi
fi

echo "==> Push to GitHub ($REMOTE/$BRANCH)"
git push "$REMOTE" "$BRANCH"
echo

ssh_cmd=(ssh)
if [[ -n "${SSHPASS:-}" ]] && command -v sshpass >/dev/null 2>&1; then
  ssh_cmd=(sshpass -e ssh)
elif [[ -n "${DEPLOY_SSH_KEY:-}" ]]; then
  ssh_cmd=(ssh -i "$DEPLOY_SSH_KEY" -o IdentitiesOnly=yes)
fi

echo "==> Deploy on server"
"${ssh_cmd[@]}" "$SERVER" "bash -s" -- "$APP_DIR" "$BRANCH" <<'REMOTE'
set -euo pipefail

APP_DIR="$1"
BRANCH="$2"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=768}"

cd "$APP_DIR"

echo "-> git pull"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "-> npm ci"
npm ci

echo "-> backend generate + migrate"
cd "$APP_DIR/backend"
npm run generate:importmap || true
npm run generate:types || true
if [[ -f src/payload-types.ts ]]; then
  cp src/payload-types.ts ../frontend/src/payload-types.ts
  # frontend не зависит от пакета payload — убираем augmentation
  sed -i "/^declare module 'payload'/,/^}/d" ../frontend/src/payload-types.ts || true
fi
npm run migrate || true

echo "-> build backend"
npm run build
if pm2 describe citata-api >/dev/null 2>&1; then
  pm2 restart citata-api --update-env
else
  PORT=3011 NODE_ENV=production pm2 start npm --name citata-api --cwd "$APP_DIR/backend" -- start
fi

echo "-> wait for API :3011"
for i in $(seq 1 30); do
  if curl -sf -o /dev/null http://127.0.0.1:3011/; then
    echo "   API ready"
    break
  fi
  sleep 2
  if [[ "$i" -eq 30 ]]; then
    echo "Warning: API не ответил вовремя, продолжаем сборку frontend" >&2
  fi
done

echo "-> build frontend"
cd "$APP_DIR/frontend"
npm run build
if pm2 describe citata-web >/dev/null 2>&1; then
  pm2 restart citata-web --update-env
else
  PORT=3010 NODE_ENV=production pm2 start npm --name citata-web --cwd "$APP_DIR/frontend" -- start
fi

pm2 save
pm2 status citata-api citata-web
REMOTE

echo
echo "Done: https://citata-pr.ru"
echo "Admin: https://citata-pr.ru/admin"
