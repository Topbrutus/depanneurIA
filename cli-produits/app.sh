#!/usr/bin/env bash
# ============================================================
# app.sh — Système CLI d'ajout de produits
# Modes : 1=produit unique  2=liste  3=lot (scan)
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP="$SCRIPT_DIR/tmp"
LOGS="$SCRIPT_DIR/logs"
INPUT="$SCRIPT_DIR/input"
PROCESSED="$SCRIPT_DIR/processed"

PRODUCTS_JSON="$TMP/products.json"
LOT_JSON="$TMP/lot.json"
LOG_FILE="$LOGS/session_$(date +%Y%m%d_%H%M%S).log"

# ── Config API ───────────────────────────────────────────────
API_URL="${DEPANNEUR_API:-http://localhost:3001/api/products}"

# ── Couleurs ────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ── Helpers ─────────────────────────────────────────────────
log() { echo "[$(date +%H:%M:%S)] $*" >> "$LOG_FILE"; }
info()    { echo -e "${CYAN}→ $*${RESET}"; log "INFO: $*"; }
success() { echo -e "${GREEN}✔ $*${RESET}"; log "OK: $*"; }
warn()    { echo -e "${YELLOW}⚠ $*${RESET}"; log "WARN: $*"; }
error()   { echo -e "${RED}✘ $*${RESET}"; log "ERROR: $*"; }

check_dep() {
    command -v "$1" &>/dev/null || {
        error "Dépendance manquante : $1"
        echo "  Installe avec : $2"
        exit 1
    }
}

# Vérifie jq (obligatoire)
check_dep jq "sudo apt install jq"

# ── Initialisation ───────────────────────────────────────────
init() {
    [ -f "$PRODUCTS_JSON" ] || echo "[]" > "$PRODUCTS_JSON"
    [ -f "$LOT_JSON" ]      || echo "[]" > "$LOT_JSON"
    log "Session démarrée"
}

# ── Mise à jour atomique JSON ────────────────────────────────
json_append() {
    local file="$1"
    local filter="$2"
    shift 2
    local args=("$@")

    local tmp_file
    tmp_file=$(mktemp "$TMP/json_XXXXXX.tmp")

    if jq "${args[@]}" "$filter" "$file" > "$tmp_file" 2>>"$LOG_FILE"; then
        mv "$tmp_file" "$file"
    else
        rm -f "$tmp_file"
        error "Erreur JSON — fichier conservé intact"
        return 1
    fi
}

# ── Envoi vers l'API depanneurIA ─────────────────────────────
# Usage : send_to_api "$name" "$price" "$category" "$emoji" "$stock"
send_to_api() {
    local name="$1" price="$2" category="${3:-Divers}" emoji="${4:-🥔}" stock="${5:-0}"

    local payload
    payload=$(jq -n \
        --arg  name     "$name" \
        --arg  price    "$price" \
        --arg  category "$category" \
        --arg  emoji    "$emoji" \
        --argjson stock "$stock" \
        '{"name":$name,"price":($price|tonumber),"category":$category,"emoji":$emoji,"stock":$stock}')

    local response http_code
    response=$(curl -s -w "\n%{http_code}" \
        -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "$payload" 2>>"$LOG_FILE")

    http_code=$(echo "$response" | tail -1)
    local body
    body=$(echo "$response" | head -n -1)

    if [[ "$http_code" == "201" ]]; then
        local id
        id=$(echo "$body" | jq -r '.id // "?"')
        success "→ API OK (id: $id) — $name"
        log "API POST OK: id=$id name=$name price=$price"
        return 0
    else
        warn "→ API erreur $http_code — $name (conservé en local)"
        log "API POST ERREUR: $http_code | payload: $payload | body: $body"
        return 1
    fi
}

# ── Afficher le récapitulatif ─────────────────────────────────
show_summary() {
    local file="$1"
    local total pending completed scanned
    total=$(jq 'length' "$file")
    pending=$(jq '[.[] | select(.status=="pending")] | length' "$file")
    completed=$(jq '[.[] | select(.status=="completed")] | length' "$file")
    scanned=$(jq '[.[] | select(.status=="scanned")] | length' "$file")
    echo -e "\n${BOLD}--- Récapitulatif ---${RESET}"
    echo "  Total    : $total"
    echo "  Traités  : $completed"
    echo "  En attente: $pending"
    echo "  Scannés  : $scanned"
}

# ══════════════════════════════════════════════════════════════
# MODE 1 — Produit unique
# ══════════════════════════════════════════════════════════════
saisie_confirmer() {
    # Affiche les champs pré-remplis et permet de les modifier
    # Args : name price category emoji stock barcode
    local NAME="$1" PRICE="$2" CATEGORY="$3" EMOJI="$4" STOCK="$5" BARCODE="$6"

    echo ""
    echo -e "${BOLD}--- Données du produit ---${RESET}"
    echo "  Nom       : $NAME"
    echo "  Prix      : $PRICE \$"
    echo "  Catégorie : $CATEGORY"
    echo "  Emoji     : $EMOJI"
    echo "  Stock     : $STOCK"
    [ -n "$BARCODE" ] && echo "  Barcode   : $BARCODE"
    echo ""

    read -rp "Modifier ? (Enter=confirmer, n=annuler, champ à changer) : " ACTION
    [[ "${ACTION,,}" == "n" ]] && { warn "Annulé"; return 1; }

    if [ -n "$ACTION" ]; then
        echo "  (laisse vide pour garder la valeur actuelle)"
        read -rp "  Nom       [$NAME]      : " v; NAME="${v:-$NAME}"
        read -rp "  Prix      [$PRICE]     : " v; PRICE="${v:-$PRICE}"
        read -rp "  Catégorie [$CATEGORY]  : " v; CATEGORY="${v:-$CATEGORY}"
        read -rp "  Emoji     [$EMOJI]     : " v; EMOJI="${v:-$EMOJI}"
        read -rp "  Stock     [$STOCK]     : " v; STOCK="${v:-$STOCK}"
        read -rp "  Barcode   [$BARCODE]   : " v; BARCODE="${v:-$BARCODE}"
    fi

    json_append "$PRODUCTS_JSON" \
        '. += [{"name":$n,"price":($p|tonumber),"category":$c,"emoji":$e,
                "stock":($s|tonumber),"barcode":$b,
                "status":"completed","source":"manual","added_at":$ts}]' \
        --arg n  "$NAME" \
        --arg p  "$PRICE" \
        --arg c  "$CATEGORY" \
        --arg e  "$EMOJI" \
        --arg s  "$STOCK" \
        --arg b  "${BARCODE:-}" \
        --arg ts "$(date -Iseconds)"

    send_to_api "$NAME" "$PRICE" "$CATEGORY" "$EMOJI" "$STOCK"
    return 0
}

mode_single() {
    echo -e "\n${BOLD}=== MODE 1 : Produit unique ===${RESET}\n"
    echo "  1) Photo du produit   (Gemini analyse et remplit tout)"
    echo "  2) Code-barres        (recherche Open Food Facts)"
    echo "  3) Saisie manuelle"
    echo ""
    read -rp "Méthode [1/2/3] : " METHOD

    local NAME="" PRICE="" CATEGORY="Divers" EMOJI="🥔" STOCK="0" BARCODE=""

    case "$METHOD" in

        # ── Photo → Gemini ────────────────────────────────
        1)
            read -rp "Chemin de la photo : " IMG
            IMG="${IMG/#\~/$HOME}"
            [ ! -f "$IMG" ] && { error "Image introuvable"; return 1; }

            info "Envoi à Gemini..."
            local b64
            b64=$(base64 -w 0 "$IMG")

            local response
            response=$(curl -s -X POST \
                "${API_URL%/products}/generate-product" \
                -H "Content-Type: application/json" \
                -d "{\"imageBase64\":\"$b64\"}" 2>>"$LOG_FILE")

            local api_err
            api_err=$(echo "$response" | jq -r '.error // empty')
            [ -n "$api_err" ] && { error "Gemini : $api_err"; return 1; }

            NAME=$(echo "$response"     | jq -r '.name       // ""')
            PRICE=$(echo "$response"    | jq -r '.marketPrice // "0"')
            CATEGORY=$(echo "$response" | jq -r '.category   // "Divers"')
            EMOJI=$(echo "$response"    | jq -r '.emoji      // "🥔"')
            STOCK="0"

            success "Gemini a analysé le produit"
            ;;

        # ── Code-barres → Open Food Facts ─────────────────
        2)
            read -rp "Code-barres : " BARCODE
            [ -z "$BARCODE" ] && { warn "Barcode vide"; return 1; }

            info "Recherche Open Food Facts..."
            local response
            response=$(curl -s \
                "${API_URL%/products}/lookup-barcode?code=$BARCODE" \
                2>>"$LOG_FILE")

            local api_err
            api_err=$(echo "$response" | jq -r '.error // empty')
            [ -n "$api_err" ] && { warn "Non trouvé : $api_err — continue en manuel"; }

            NAME=$(echo "$response"     | jq -r '.name      // ""')
            CATEGORY=$(echo "$response" | jq -r '.category  // "Divers"')
            EMOJI=$(echo "$response"    | jq -r '.emoji     // "🥔"')
            PRICE="0"
            STOCK="0"

            [ -n "$NAME" ] && success "Produit trouvé : $NAME" || warn "Introuvable — complète manuellement"
            ;;

        # ── Manuel ────────────────────────────────────────
        3|*)
            read -rp "Nom du produit          : " NAME
            [ -z "$NAME" ] && { warn "Nom vide — abandon"; return; }
            read -rp "Prix (ex: 1.99)         : " PRICE
            read -rp "Catégorie    [Divers]   : " v; CATEGORY="${v:-Divers}"
            read -rp "Emoji        [🥔]       : " v; EMOJI="${v:-🥔}"
            read -rp "Stock initial     [0]   : " v; STOCK="${v:-0}"
            read -rp "Code-barres (optionnel) : " BARCODE
            ;;
    esac

    saisie_confirmer "$NAME" "$PRICE" "$CATEGORY" "$EMOJI" "$STOCK" "$BARCODE" \
        && show_summary "$PRODUCTS_JSON"
}

# ══════════════════════════════════════════════════════════════
# Helpers partagés : traitement séquentiel et en lot
# ══════════════════════════════════════════════════════════════

# Traitement séquentiel des entrées "pending" dans products.json
process_sequential() {
    echo -e "\n${BOLD}Traitement séquentiel${RESET}"
    echo -e "${YELLOW}Enter = valider le nom  |  texte = modifier  |  s = sauter${RESET}\n"

    local idx=0
    local total_pending
    total_pending=$(jq '[.[] | select(.status=="pending")] | length' "$PRODUCTS_JSON")

    while true; do
        local item
        item=$(jq -r --argjson i "$idx" \
            '[.[] | select(.status=="pending")] | .[$i] // empty' \
            "$PRODUCTS_JSON")
        [ -z "$item" ] && break

        local original_name
        original_name=$(echo "$item" | jq -r '.name')
        local item_idx
        item_idx=$(jq -r --arg n "$original_name" \
            '[to_entries[] | select(.value.status=="pending" and .value.name==$n)] | .[0].key' \
            "$PRODUCTS_JSON")

        echo -e "${CYAN}[$((idx+1))/$total_pending]${RESET} ${BOLD}$original_name${RESET}"
        read -rp "  Nom       (Enter=garder, s=sauter) : " EDIT

        if [[ "${EDIT,,}" == "s" ]]; then
            warn "Sauté : $original_name"
            ((idx++)) || true
            continue
        fi

        local final_name="${EDIT:-$original_name}"
        local price category emoji stock barcode
        read -rp "  Prix (ex: 1.99)                    : " price
        [ -z "$price" ] && { warn "Prix requis — sauté"; ((idx++)) || true; continue; }
        read -rp "  Catégorie          [Divers]        : " category
        category="${category:-Divers}"
        read -rp "  Emoji              [🥔]            : " emoji
        emoji="${emoji:-🥔}"
        read -rp "  Stock initial      [0]             : " stock
        stock="${stock:-0}"
        read -rp "  Code-barres        (optionnel)     : " barcode

        jq --argjson i "$item_idx" \
           --arg n  "$final_name" \
           --arg p  "$price" \
           --arg c  "$category" \
           --arg e  "$emoji" \
           --arg s  "$stock" \
           --arg b  "${barcode:-}" \
           --arg ts "$(date -Iseconds)" \
           '.[$i].name=$n | .[$i].price=($p|tonumber) | .[$i].category=$c
            | .[$i].emoji=$e | .[$i].stock=($s|tonumber) | .[$i].barcode=$b
            | .[$i].status="completed" | .[$i].processed_at=$ts' \
           "$PRODUCTS_JSON" > "$TMP/tmp_proc.json" \
        && mv "$TMP/tmp_proc.json" "$PRODUCTS_JSON"

        send_to_api "$final_name" "$price" "$category" "$emoji" "$stock"
        ((idx++)) || true
    done

    success "Traitement séquentiel terminé"
    show_summary "$PRODUCTS_JSON"
}

# Transfert des entrées "pending" → lot.json (status: scanned)
# pour traitement différé via mode_lot
push_list_to_lot() {
    local moved=0
    local tmp_lot
    tmp_lot=$(mktemp "$TMP/lot_push_XXXXXX.tmp")

    # Copier le lot existant
    cp "$LOT_JSON" "$tmp_lot"

    jq -c '.[] | select(.status=="pending")' "$PRODUCTS_JSON" \
    | while IFS= read -r item; do
        local name bc
        name=$(echo "$item" | jq -r '.name')
        bc=$(echo "$item"   | jq -r '.barcode // ""')
        jq --arg n  "$name" \
           --arg bc "$bc" \
           --arg ts "$(date -Iseconds)" \
           '. += [{"name":$n,"barcode":$bc,"quantity":1,"status":"scanned",
                   "source":"list","scanned_at":$ts}]' \
           "$tmp_lot" > "$TMP/lot_push_tmp2.json" \
        && mv "$TMP/lot_push_tmp2.json" "$tmp_lot"
        ((moved++)) || true
    done

    mv "$tmp_lot" "$LOT_JSON"

    # Marquer les pending comme "in_lot" dans products.json
    jq '[.[] | if .status=="pending" then .status="in_lot" else . end]' \
       "$PRODUCTS_JSON" > "$TMP/tmp_inlot.json" \
    && mv "$TMP/tmp_inlot.json" "$PRODUCTS_JSON"

    success "$(jq '[.[] | select(.status=="scanned")] | length' "$LOT_JSON") entrée(s) ajoutée(s) au lot"
    info "Lance le Mode 3 → option 'Traiter le lot' pour les compléter"
}

# ══════════════════════════════════════════════════════════════
# MODE 2 — Liste (texte / txt / csv / excel / fzf / photo OCR)
# ══════════════════════════════════════════════════════════════
mode_list() {
    echo -e "\n${BOLD}=== MODE 2 : Liste ===${RESET}\n"

    # ── ÉTAPE A : choix de la source ──────────────────────────
    echo -e "${BOLD}Source de la liste :${RESET}"
    echo "  1) Coller du texte         (Ctrl+D pour terminer)"
    echo "  2) Fichier TXT             (une ligne = un produit)"
    echo "  3) Fichier CSV             (choix de la colonne)"
    echo "  4) Fichier Excel .xlsx     (choix de la feuille et colonne)"
    echo "  5) Parcourir avec fzf      (dossier input/)"
    echo ""
    read -rp "Source [1-5] : " LIST_MODE

    RAW="$TMP/raw.txt"
    rm -f "$RAW"

    case "$LIST_MODE" in

        # ── 1) Texte collé ──────────────────────────────────
        1)
            info "Colle ta liste puis Ctrl+D :"
            cat > "$RAW"
            ;;

        # ── 2) Fichier TXT ──────────────────────────────────
        2)
            read -rp "Chemin du fichier TXT : " FILE
            FILE="${FILE/#\~/$HOME}"
            [ ! -f "$FILE" ] && { error "Introuvable : $FILE"; return 1; }
            cp "$FILE" "$RAW"
            ;;

        # ── 3) Fichier CSV ──────────────────────────────────
        3)
            check_dep csvcut "pip install csvkit   ou   sudo apt install python3-csvkit"
            read -rp "Chemin du fichier CSV : " FILE
            FILE="${FILE/#\~/$HOME}"
            [ ! -f "$FILE" ] && { error "Introuvable : $FILE"; return 1; }

            info "En-têtes disponibles :"
            csvcut -n "$FILE"
            read -rp "Numéro ou nom de la colonne [1] : " COL
            COL="${COL:-1}"

            csvcut -c "$COL" "$FILE" | tail -n +2 > "$RAW"
            success "Colonne « $COL » extraite"
            ;;

        # ── 4) Fichier Excel ────────────────────────────────
        4)
            check_dep python3 "sudo apt install python3"
            python3 -c "import openpyxl" 2>/dev/null \
                || { error "openpyxl manquant"; echo "  pip install openpyxl"; return 1; }

            read -rp "Chemin du fichier .xlsx : " FILE
            FILE="${FILE/#\~/$HOME}"
            [ ! -f "$FILE" ] && { error "Introuvable : $FILE"; return 1; }

            info "Feuilles disponibles :"
            python3 - "$FILE" <<'PYEOF'
import sys, openpyxl
wb = openpyxl.load_workbook(sys.argv[1], read_only=True)
for i, name in enumerate(wb.sheetnames, 1):
    print(f"  {i}) {name}")
PYEOF
            read -rp "Nom ou numéro de la feuille [1] : " SHEET
            SHEET="${SHEET:-1}"

            info "Colonnes de la feuille :"
            python3 - "$FILE" "$SHEET" <<'PYEOF'
import sys, openpyxl
wb = openpyxl.load_workbook(sys.argv[1], read_only=True)
sheets = wb.sheetnames
try:
    idx = int(sys.argv[2]) - 1
    ws = wb[sheets[idx]]
except (ValueError, IndexError):
    ws = wb[sys.argv[2]]
row = next(ws.iter_rows(min_row=1, max_row=1, values_only=True))
for i, h in enumerate(row, 1):
    print(f"  {i}) {h}")
PYEOF
            read -rp "Numéro de la colonne [1] : " COL_XL
            COL_XL="${COL_XL:-1}"

            python3 - "$FILE" "$SHEET" "$COL_XL" > "$RAW" <<'PYEOF'
import sys, openpyxl
wb = openpyxl.load_workbook(sys.argv[1], read_only=True)
sheets = wb.sheetnames
try:
    idx = int(sys.argv[2]) - 1
    ws = wb[sheets[idx]]
except (ValueError, IndexError):
    ws = wb[sys.argv[2]]
col = int(sys.argv[3]) - 1
for row in ws.iter_rows(min_row=2, values_only=True):
    val = row[col] if col < len(row) else None
    if val:
        print(str(val).strip())
PYEOF
            success "Excel importé ($(wc -l < "$RAW") lignes)"
            ;;

        # ── 5) Sélection fzf ────────────────────────────────
        5)
            check_dep fzf "sudo apt install fzf"
            info "Parcours du dossier input/ — sélectionne un fichier :"
            local selected
            selected=$(find "$INPUT" -type f | fzf --prompt="Fichier > " \
                --preview="head -20 {}" --preview-window=right:50%)
            [ -z "$selected" ] && { warn "Aucune sélection"; return; }
            info "Fichier sélectionné : $selected"

            case "$selected" in
                *.csv)
                    check_dep csvcut "pip install csvkit"
                    info "En-têtes :"
                    csvcut -n "$selected"
                    read -rp "Colonne [1] : " COL
                    COL="${COL:-1}"
                    csvcut -c "$COL" "$selected" | tail -n +2 > "$RAW"
                    ;;
                *.xlsx)
                    python3 -c "import openpyxl" 2>/dev/null \
                        || { error "pip install openpyxl"; return 1; }
                    read -rp "Colonne [1] : " COL_XL
                    COL_XL="${COL_XL:-1}"
                    python3 - "$selected" "1" "$COL_XL" > "$RAW" <<'PYEOF'
import sys, openpyxl
wb = openpyxl.load_workbook(sys.argv[1], read_only=True)
ws = wb[wb.sheetnames[int(sys.argv[2])-1]]
col = int(sys.argv[3]) - 1
for row in ws.iter_rows(min_row=2, values_only=True):
    val = row[col] if col < len(row) else None
    if val: print(str(val).strip())
PYEOF
                    ;;
                *)
                    cp "$selected" "$RAW"
                    ;;
            esac
            ;;

        *)
            error "Choix invalide"
            return 1
            ;;
    esac

    # ── ÉTAPE B : nettoyage et parsing ────────────────────────
    awk 'NF' "$RAW" \
        | sed 's/^[[:space:]]*//; s/[[:space:]]*$//' \
        | grep -v '^[[:punct:][:space:]]*$' \
        > "$TMP/clean.txt" || true

    local count=0
    while IFS= read -r LINE; do
        [ -z "$LINE" ] && continue
        json_append "$PRODUCTS_JSON" \
            '. += [{"name":$l,"status":"pending","source":"list","added_at":$ts}]' \
            --arg l  "$LINE" \
            --arg ts "$(date -Iseconds)"
        ((count++)) || true
    done < "$TMP/clean.txt"

    success "$count produit(s) chargé(s) en mémoire"
    cp "$RAW" "$PROCESSED/raw_$(date +%Y%m%d_%H%M%S).txt"

    # ── ÉTAPE C : choix du mode de traitement ─────────────────
    echo ""
    echo -e "${BOLD}Comment traiter cette liste ?${RESET}"
    echo "  1) Séquentiel maintenant   (produit par produit, interactif)"
    echo "  2) En lot différé          (→ stocké dans lot.json, traiter via Mode 3)"
    echo "  3) Plus tard               (garder en 'pending', revenir au menu)"
    echo ""
    read -rp "Traitement [1/2/3] : " PROC_MODE

    case "$PROC_MODE" in
        1) process_sequential ;;
        2) push_list_to_lot   ;;
        3)
            info "$count entrée(s) en attente dans products.json (status: pending)"
            show_summary "$PRODUCTS_JSON"
            ;;
        *)
            warn "Choix invalide — liste conservée en 'pending'"
            show_summary "$PRODUCTS_JSON"
            ;;
    esac
}

# ══════════════════════════════════════════════════════════════
# MODE 3 — Lot (scan continu + traitement différé)
# ══════════════════════════════════════════════════════════════
mode_lot() {
    echo -e "\n${BOLD}=== MODE 3 : Lot (scan continu) ===${RESET}"
    echo -e "${YELLOW}Scanner les codes-barres. Tape 'STOP' pour terminer le scan.${RESET}\n"

    local count=0
    while true; do
        read -rp "Code [ou STOP] : " CODE
        [ "${CODE^^}" = "STOP" ] && break
        [ -z "$CODE" ] && continue

        json_append "$LOT_JSON" \
            '. += [{"barcode":$c,"quantity":1,"status":"scanned","scanned_at":$ts}]' \
            --arg c  "$CODE" \
            --arg ts "$(date -Iseconds)"

        ((count++)) || true
        echo -e "  ${GREEN}BIP ✔${RESET}  ($count scanné(s))"
    done

    success "$count code(s) scannés"
    show_summary "$LOT_JSON"

    echo ""
    read -rp "Traiter le lot maintenant ? [O/n] : " DO_PROCESS
    [[ "${DO_PROCESS,,}" == "n" ]] && return

    echo -e "\n${BOLD}Traitement du lot — Enter pour valider, 's' pour sauter${RESET}\n"

    local idx=0
    local total
    total=$(jq '[.[] | select(.status=="scanned")] | length' "$LOT_JSON")

    while true; do
        local item
        item=$(jq -r --argjson i "$idx" '[.[] | select(.status=="scanned")] | .[$i] // empty' "$LOT_JSON")
        [ -z "$item" ] && break

        local bc
        bc=$(echo "$item" | jq -r '.barcode')
        local item_idx
        item_idx=$(jq -r --arg c "$bc" '[to_entries[] | select(.value.status=="scanned" and .value.barcode==$c)] | .[0].key' "$LOT_JSON")

        echo -e "${CYAN}[$((idx+1))/$total]${RESET} Code-barres : ${BOLD}$bc${RESET}"
        read -rp "  Nom produit (s=sauter)             : " NAME
        if [[ "${NAME,,}" == "s" ]] || [ -z "$NAME" ]; then
            warn "Sauté : $bc"
            ((idx++)) || true
            continue
        fi

        local price category emoji stock
        read -rp "  Prix (ex: 1.99)                    : " price
        [ -z "$price" ] && { warn "Prix requis — sauté"; ((idx++)) || true; continue; }
        read -rp "  Catégorie          [Divers]        : " category
        category="${category:-Divers}"
        read -rp "  Emoji              [🥔]            : " emoji
        emoji="${emoji:-🥔}"
        read -rp "  Stock initial      [1]             : " stock
        stock="${stock:-1}"

        jq --argjson i "$item_idx" \
           --arg n  "$NAME" \
           --arg p  "$price" \
           --arg c  "$category" \
           --arg e  "$emoji" \
           --arg s  "$stock" \
           --arg ts "$(date -Iseconds)" \
           '.[$i].name=$n | .[$i].price=($p|tonumber) | .[$i].category=$c
            | .[$i].emoji=$e | .[$i].stock=($s|tonumber)
            | .[$i].status="completed" | .[$i].processed_at=$ts' \
           "$LOT_JSON" > "$TMP/tmp_lot_proc.json" \
        && mv "$TMP/tmp_lot_proc.json" "$LOT_JSON"

        json_append "$PRODUCTS_JSON" \
            '. += [{"name":$n,"barcode":$bc,"price":($p|tonumber),"category":$c,
                    "emoji":$e,"stock":($s|tonumber),
                    "status":"completed","source":"scan","added_at":$ts}]' \
            --arg n  "$NAME" \
            --arg bc "$bc" \
            --arg p  "$price" \
            --arg c  "$category" \
            --arg e  "$emoji" \
            --arg s  "$stock" \
            --arg ts "$(date -Iseconds)"

        send_to_api "$NAME" "$price" "$category" "$emoji" "$stock"
        ((idx++)) || true
    done

    success "Lot traité"
    show_summary "$LOT_JSON"
}

# ══════════════════════════════════════════════════════════════
# MODE : Photo d'une liste papier (OCR → liste de produits)
# ══════════════════════════════════════════════════════════════
mode_photo_list() {
    echo -e "\n${BOLD}=== Photo d'une liste papier ===${RESET}\n"

    check_dep tesseract "sudo zypper install tesseract-ocr tesseract-ocr-traineddata-fra"
    { command -v magick &>/dev/null || command -v convert &>/dev/null; } \
        || { error "imagemagick manquant"; echo "  sudo zypper install imagemagick"; return 1; }

    read -rp "Chemin de la photo : " IMG
    IMG="${IMG/#\~/$HOME}"
    [ ! -f "$IMG" ] && { error "Image introuvable : $IMG"; return 1; }

    info "Prétraitement de l'image..."
    local magick_cmd
    magick_cmd=$(command -v magick 2>/dev/null || command -v convert)
    "$magick_cmd" "$IMG" \
        -resize 2000x \
        -colorspace Gray \
        -sharpen 0x1 \
        -threshold 50% \
        "$TMP/ocr_prep.png" 2>>"$LOG_FILE"

    info "Extraction du texte (OCR)..."
    tesseract "$TMP/ocr_prep.png" "$TMP/ocr_out" \
        -l fra+eng --psm 6 2>>"$LOG_FILE"

    local RAW="$TMP/raw.txt"
    mv "$TMP/ocr_out.txt" "$RAW"
    success "OCR terminé"

    echo ""
    info "Aperçu du texte extrait :"
    echo "---"
    head -20 "$RAW"
    echo "---"
    read -rp "Continuer avec ce texte ? [O/n] : " CONFIRM
    [[ "${CONFIRM,,}" == "n" ]] && { warn "Annulé"; return; }

    # Nettoyage et parsing
    awk 'NF' "$RAW" \
        | sed 's/^[[:space:]]*//; s/[[:space:]]*$//' \
        | grep -v '^[[:punct:][:space:]]*$' \
        > "$TMP/clean.txt" || true

    local count=0
    while IFS= read -r LINE; do
        [ -z "$LINE" ] && continue
        json_append "$PRODUCTS_JSON" \
            '. += [{"name":$l,"status":"pending","source":"photo_list","added_at":$ts}]' \
            --arg l  "$LINE" \
            --arg ts "$(date -Iseconds)"
        ((count++)) || true
    done < "$TMP/clean.txt"

    success "$count produit(s) extrait(s) de la photo"
    cp "$RAW" "$PROCESSED/ocr_$(date +%Y%m%d_%H%M%S).txt"

    # Choix du traitement
    echo ""
    echo -e "${BOLD}Comment traiter cette liste ?${RESET}"
    echo "  1) Séquentiel maintenant   (produit par produit, interactif)"
    echo "  2) En lot différé          (traiter via option Lot du menu)"
    echo "  3) Plus tard               (garder en 'pending')"
    echo ""
    read -rp "Traitement [1/2/3] : " PROC_MODE

    case "$PROC_MODE" in
        1) process_sequential ;;
        2) push_list_to_lot   ;;
        3) info "$count entrée(s) en attente (status: pending)"; show_summary "$PRODUCTS_JSON" ;;
        *) warn "Conservé en 'pending'"; show_summary "$PRODUCTS_JSON" ;;
    esac
}

# ══════════════════════════════════════════════════════════════
# Exporter les produits
# ══════════════════════════════════════════════════════════════
mode_export() {
    local out="$PROCESSED/products_$(date +%Y%m%d_%H%M%S).json"
    cp "$PRODUCTS_JSON" "$out"
    success "Exporté : $out"

    echo ""
    echo "  Total produits : $(jq 'length' "$PRODUCTS_JSON")"
    echo "  Complétés      : $(jq '[.[] | select(.status=="completed")] | length' "$PRODUCTS_JSON")"
    echo "  En attente     : $(jq '[.[] | select(.status=="pending")] | length' "$PRODUCTS_JSON")"
}

# ══════════════════════════════════════════════════════════════
# Menu principal
# ══════════════════════════════════════════════════════════════
main_menu() {
    while true; do
        echo ""
        echo -e "${BOLD}╔═══════════════════════════════════════╗${RESET}"
        echo -e "${BOLD}║     Système d'ajout de produits       ║${RESET}"
        echo -e "${BOLD}╠═══════════════════════════════════════╣${RESET}"
        echo -e "${BOLD}║  1)${RESET} Entrer un produit               ${BOLD}║${RESET}"
        echo -e "${BOLD}║  2)${RESET} Entrer une liste de produits    ${BOLD}║${RESET}"
        echo -e "${BOLD}║  3)${RESET} Photo d'une liste papier (OCR)  ${BOLD}║${RESET}"
        echo -e "${BOLD}╠═══════════════════════════════════════╣${RESET}"
        echo -e "${BOLD}║  4)${RESET} Lot — scan continu              ${BOLD}║${RESET}"
        echo -e "${BOLD}║  5)${RESET} Voir les produits               ${BOLD}║${RESET}"
        echo -e "${BOLD}║  6)${RESET} Exporter                        ${BOLD}║${RESET}"
        echo -e "${BOLD}║  7)${RESET} Réinitialiser la mémoire        ${BOLD}║${RESET}"
        echo -e "${BOLD}║  q)${RESET} Quitter                         ${BOLD}║${RESET}"
        echo -e "${BOLD}╚═══════════════════════════════════════╝${RESET}"
        echo ""
        read -rp "Choix : " MODE

        case "$MODE" in
            1) mode_single     ;;
            2) mode_list       ;;
            3) mode_photo_list ;;
            4) mode_lot        ;;
            5)
                echo ""
                jq '.' "$PRODUCTS_JSON"
                ;;
            6) mode_export ;;
            7)
                read -rp "Confirmer réinitialisation ? [oui/non] : " CONF
                [[ "$CONF" == "oui" ]] && {
                    echo "[]" > "$PRODUCTS_JSON"
                    echo "[]" > "$LOT_JSON"
                    success "Mémoire réinitialisée"
                }
                ;;
            q|Q) info "Au revoir !"; exit 0 ;;
            *) warn "Choix invalide" ;;
        esac
    done
}

# ── Lancement ────────────────────────────────────────────────
init
main_menu
