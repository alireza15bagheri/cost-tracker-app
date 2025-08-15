#!/usr/bin/env bash
set -Eeuo pipefail

# dev-up.sh — build frontend and (re)start docker stack fast
# Usage:
#   ./dev-up.sh [--no-cache] [--logs] [--skip-build] [--services "svc1 svc2"] [--frontend-dir path]
#
# Flags:
#   --no-cache        Build images without using the cache (slower but clean)
#   --logs            Follow docker logs after start (optionally restrict with --services)
#   --skip-build      Skip the frontend build step
#   --services "... " Space-separated list of services to show logs for (requires --logs)
#   --frontend-dir p  Path to frontend directory (default: ./frontend if exists, else .)
#   -h | --help       Show help

# --- parse args ---
NO_CACHE=0
FOLLOW_LOGS=0
SKIP_BUILD=0
SERVICES=""
FRONTEND_DIR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-cache) NO_CACHE=1; shift ;;
    --logs) FOLLOW_LOGS=1; shift ;;
    --skip-build) SKIP_BUILD=1; shift ;;
    --services) SERVICES="${2:-}"; shift 2 ;;
    --frontend-dir) FRONTEND_DIR="${2:-}"; shift 2 ;;
    -h|--help)
      sed -n '3,36p' "$0"; exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

# --- locate project root (this script's directory) ---
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
cd "$SCRIPT_DIR"

# --- pick frontend dir ---
if [[ -z "${FRONTEND_DIR}" ]]; then
  if [[ -f "frontend/package.json" ]]; then
    FRONTEND_DIR="frontend"
  elif [[ -f "package.json" ]]; then
    FRONTEND_DIR="."
  else
    echo "Could not find package.json. Use --frontend-dir to specify the frontend path." >&2
    exit 1
  fi
fi

# --- choose docker compose command (v2 or legacy) ---
compose() {
  if command -v docker &>/dev/null && docker compose version &>/dev/null; then
    docker compose "$@"
  elif command -v docker-compose &>/dev/null; then
    docker-compose "$@"
  else
    echo "docker compose not found. Install Docker Desktop or docker-compose." >&2
    exit 1
  fi
}

# --- prerequisites ---
command -v npm >/dev/null || { echo "npm not found on PATH." >&2; exit 1; }
command -v docker >/dev/null || { echo "docker not found on PATH." >&2; exit 1; }

start_ts=$(date +%s)

# --- build frontend ---
if [[ "$SKIP_BUILD" -eq 0 ]]; then
  echo "==> Building frontend in: $FRONTEND_DIR"
  pushd "$FRONTEND_DIR" >/dev/null
  npm run build
  popd >/dev/null
else
  echo "==> Skipping frontend build (per --skip-build)"
fi

# --- docker build/up ---
if [[ "$NO_CACHE" -eq 1 ]]; then
  echo "==> Building images without cache"
  compose build --no-cache
  echo "==> Starting containers"
  compose up -d
else
  echo "==> Starting containers with build (cache enabled)"
  compose up -d --build
fi

end_ts=$(date +%s)
echo "==> Done in $((end_ts - start_ts))s"

# --- optional logs ---
if [[ "$FOLLOW_LOGS" -eq 1 ]]; then
  if [[ -n "$SERVICES" ]]; then
    # shellcheck disable=SC2086
    compose logs -f $SERVICES
  else
    compose logs -f
  fi
fi

