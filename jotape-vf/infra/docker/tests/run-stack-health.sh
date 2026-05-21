#!/usr/bin/env bash
# Pruebas de integración contra el stack Docker (API + DB).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT}/infra/docker"

echo "==> Building and starting API + DB..."
docker compose up -d --build db api

cleanup() {
  echo "==> Stopping stack..."
  docker compose down --remove-orphans
}
trap cleanup EXIT

echo "==> Waiting for API /health..."
for _ in $(seq 1 45); do
  if curl -sf "http://127.0.0.1:8000/health" >/dev/null; then
    echo "API healthy."
    exit 0
  fi
  sleep 2
done

echo "Timed out waiting for API."
exit 1
