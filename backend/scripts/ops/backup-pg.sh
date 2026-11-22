#!/usr/bin/env bash
set -euo pipefail

# Ежедневный бэкап PostgreSQL → S3 (бакет citata-backups).
# На сервере: /usr/local/bin/citata-backup-pg.sh
# Cron: 0 3 * * * /usr/local/bin/citata-backup-pg.sh

: "${DATABASE_URL:?}"
: "${S3_BACKUP_BUCKET:?}"
: "${S3_ACCESS_KEY_ID:?}"
: "${S3_SECRET_ACCESS_KEY:?}"
: "${S3_ENDPOINT:?}"
: "${S3_REGION:=ru-1}"

STAMP="$(date +%Y%m%d-%H%M%S)"
TMP="/tmp/citata-pg-${STAMP}.sql.gz"
KEY="postgres/citata-${STAMP}.sql.gz"

pg_dump "${DATABASE_URL}" | gzip -9 > "${TMP}"

AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID}" \
AWS_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY}" \
aws s3 cp "${TMP}" "s3://${S3_BACKUP_BUCKET}/${KEY}" \
  --endpoint-url "${S3_ENDPOINT}" \
  --region "${S3_REGION}"

rm -f "${TMP}"
echo "Backup uploaded: s3://${S3_BACKUP_BUCKET}/${KEY}"
