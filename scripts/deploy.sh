#!/usr/bin/env bash
set -euo pipefail

# Деплой Citata на VPS (PM2 + Nginx, без Docker).
# Перед первым запуском задайте переменные ниже или экспортируйте в ~/.bashrc.

: "${DEPLOY_HOST:?Set DEPLOY_HOST (IP или домен VPS)}"
: "${DEPLOY_USER:=root}"
: "${REMOTE_PATH:=/var/www/citata}"
: "${PM2_NAME:=citata-web}"
: "${GIT_BRANCH:=main}"

SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"

echo "→ Push to origin/${GIT_BRANCH} (если есть коммиты)"
git push origin "${GIT_BRANCH}" || true

echo "→ Deploy on ${SSH_TARGET}:${REMOTE_PATH}"
ssh "${SSH_TARGET}" bash -s <<EOF
set -euo pipefail
cd "${REMOTE_PATH}"
git fetch origin
git checkout "${GIT_BRANCH}"
git pull origin "${GIT_BRANCH}"
npm ci
npm run generate:importmap
npm run generate:types
npx payload migrate
rm -rf .next
npm run build
pm2 restart "${PM2_NAME}" || pm2 start npm --name "${PM2_NAME}" -- start
pm2 save
EOF

echo "✓ Deploy complete"
