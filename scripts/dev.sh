#!/usr/bin/env bash
# =============================================================================
# scripts/dev.sh — Lance tout le projet depaneurIA en local
# DEP-0141
# =============================================================================
# Utilisation :
#   ./scripts/dev.sh
#
# Prérequis :
#   - Node.js >= 20  (node --version)
#   - pnpm >= 9      (pnpm --version)
#   - Fichier .env.local à la racine (copié depuis .env.example)
# =============================================================================

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.local"
ENV_EXAMPLE="$ROOT_DIR/.env.example"

# --- Couleurs (désactivées si pas de terminal) --------------------------------
if [ -t 1 ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  NC='\033[0m'
else
  RED='' GREEN='' YELLOW='' NC=''
fi

info()    { echo -e "${GREEN}[dev]${NC} $*"; }
warning() { echo -e "${YELLOW}[dev]${NC} $*"; }
error()   { echo -e "${RED}[dev]${NC} $*" >&2; }

# --- Vérification des prérequis -----------------------------------------------
check_command() {
  local cmd="$1"
  local min_version="$2"
  if ! command -v "$cmd" &>/dev/null; then
    error "$cmd n'est pas installé. Voir le README pour les prérequis."
    exit 1
  fi
  info "$cmd trouvé : $(command -v "$cmd")"
}

check_command node ""
check_command pnpm ""

# --- Vérification du fichier .env.local --------------------------------------
if [ ! -f "$ENV_FILE" ]; then
  warning ".env.local introuvable. Copie automatique depuis .env.example..."
  if [ -f "$ENV_EXAMPLE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    warning "Fichier .env.local créé. Pensez à renseigner les valeurs réelles."
  else
    error ".env.example introuvable. Impossible de créer .env.local."
    exit 1
  fi
fi

# --- Installation des dépendances si nécessaire -------------------------------
if [ ! -d "$ROOT_DIR/node_modules" ]; then
  info "Installation des dépendances (pnpm install)..."
  if ! pnpm install --frozen-lockfile; then
    warning "lockfile non à jour — relance sans --frozen-lockfile"
    pnpm install
  fi
fi

# --- Lancement ----------------------------------------------------------------
info "Démarrage de toutes les applications en mode développement..."
info "  → apps/web  sur http://localhost:3000"
info "  → apps/api  sur http://localhost:3001"
info ""
info "Appuyez sur Ctrl+C pour arrêter."
echo ""

cd "$ROOT_DIR"
exec pnpm dev
