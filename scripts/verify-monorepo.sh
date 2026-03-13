#!/usr/bin/env bash
# =============================================================================
# scripts/verify-monorepo.sh — Vérifie l'intégrité du monorepo
# DEP-0107
# =============================================================================
# Usage : bash scripts/verify-monorepo.sh
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ -t 1 ]; then OK='\033[0;32m✅'; FAIL='\033[0;31m❌'; NC='\033[0m'
else OK='OK'; FAIL='FAIL'; NC=''; fi

errors=0

check() {
  local label="$1"; shift
  if "$@" &>/dev/null; then
    echo -e "${OK} ${label}${NC}"
  else
    echo -e "${FAIL} ${label}${NC}"
    ((errors++))
  fi
}

echo ""
echo "depaneurIA — verify-monorepo"
echo "────────────────────────────"

echo ""
echo "Fichiers racine obligatoires"
for f in package.json pnpm-workspace.yaml tsconfig.json .eslintrc.json .prettierrc .env.example; do
  check "$f" test -f "$f"
done

echo ""
echo "Workspaces apps"
for app in web api; do
  check "apps/$app/package.json" test -f "apps/$app/package.json"
done

echo ""
echo "Workspaces packages"
for pkg in types ui utils; do
  check "packages/$pkg/package.json" test -f "packages/$pkg/package.json"
done

echo ""
echo "Scripts racine"
for script in dev build test lint typecheck; do
  check "script:$script défini" node -e \
    "const p=require('./package.json'); if(!p.scripts?.['$script']) process.exit(1)"
done

echo ""
echo "Workflows CI"
for wf in .github/workflows/ci.yml .github/workflows/smoke.yml; do
  check "$wf" test -f "$wf"
done

echo ""
echo "Docs requises"
for doc in docs/STATE.md docs/GITHUB-SETUP.md docs/RELEASE-CHECKLIST.md; do
  check "$doc" test -f "$doc"
done

echo ""
echo "────────────────────────────"
if [ "$errors" -eq 0 ]; then
  echo -e "${OK} Monorepo valide${NC}"
else
  echo -e "${FAIL} $errors problème(s) détecté(s)${NC}"
  exit 1
fi
echo ""
