#!/usr/bin/env bash
set -euo pipefail

# Синхронизация медиа-бакета в бакет бэкапов (rclone или aws s3 sync).
# Требует: aws cli, настроенные ключи S3.

: "${S3_MEDIA_BUCKET:?}"
: "${S3_BACKUP_BUCKET:?}"
: "${S3_ENDPOINT:?}"
: "${S3_REGION:=ru-1}"

AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID}" \
AWS_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY}" \
aws s3 sync "s3://${S3_MEDIA_BUCKET}" "s3://${S3_BACKUP_BUCKET}/media/" \
  --endpoint-url "${S3_ENDPOINT}" \
  --region "${S3_REGION}"

echo "Media sync complete"
