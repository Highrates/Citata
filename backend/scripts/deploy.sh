#!/usr/bin/env bash
# Совместимость: реальный деплой — scripts/deploy.sh в корне монорепо.
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/scripts/deploy.sh" "$@"
