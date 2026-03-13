#!/usr/bin/env bash
# =============================================================================
# scripts/smoke-local.sh — Smoke test local rapide avant de pousser une PR
# DEP-0103 / DEP-0107
# =============================================================================
# Usage : bash scripts/smoke-local.sh
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Couleurs
if [ -t 1 ]; then OK='\033[0;32m✅'; FAIL='\033[0;31m❌'; WARN='\033[1;33m⚠️ '; NC='\033[0m'
else OK='OK'; FAIL='FAIL'; WARN='WARN'; NC=''; fi

pass=0; fail=0

check() {
  local label="$1"; shift
  if "$@" &>/dev/null; then
    echo -e "${OK} ${label}${NC}"
    ((pass++))
  else
    echo -e "${FAIL} ${label}${NC}"
    ((fail++))
  fi
}

warn_check() {
  local label="$1"; shift
  if "$@" &>/dev/null; then
    echo -e "${OK} ${label}${NC}"
  else
    echo -e "${WARN} ${label} (non bloquant)${NC}"
  fi
}

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  depaneurIA — smoke-local                ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# --- Prérequis ---------------------------------------------------------------
echo "▶ Prérequis"
check "node >= 20"       node -e "if(parseInt(process.versions.node)<20) process.exit(1)"
check "pnpm disponible"  command -v pnpm
check ".env.local existe" test -f .env.local
echo ""

# --- Structure workspace -------------------------------------------------------
echo "▶ Structure monorepo"
for pkg in apps/web apps/api packages/types packages/ui packages/utils; do
  check "$pkg/package.json" test -f "$pkg/package.json"
done
echo ""

# --- Dépendances ---------------------------------------------------------------
echo "▶ Dépendances"
check "node_modules présent" test -d node_modules
check "pnpm install (dry)" pnpm install --frozen-lockfile --silent
echo ""

# --- Qualité -------------------------------------------------------------------
echo "▶ Lint / Typecheck / Test / Build"
check "lint"       pnpm lint
check "typecheck"  pnpm typecheck
check "test"       pnpm test
check "build"      pnpm build
echo ""

# --- Docs minimales ------------------------------------------------------------
echo "▶ Docs requises"
for doc in docs/STATE.md docs/GITHUB-SETUP.md docs/RELEASE-CHECKLIST.md; do
  check "$doc" test -f "$doc"
done
echo ""

# --- Résumé -------------------------------------------------------------------
echo "══════════════════════════════════════════"
if [ "$fail" -eq 0 ]; then
  echo -e "${OK} Tout OK — $pass vérifications passées${NC}"
else
  echo -e "${FAIL} $fail échec(s) sur $((pass+fail)) vérifications${NC}"
  exit 1
fi
echo ""
