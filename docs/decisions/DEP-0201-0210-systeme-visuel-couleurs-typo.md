# DEP-0201 à DEP-0210 — Système visuel : couleurs et typographie

Périmètre : palette de couleurs (principales, secondaires, états, accessibilité) et système typographique (polices, échelles titres, corps, boutons, cartes produits) pour la V1 depaneurIA.

---

## Couleurs

### DEP-0201 — Couleurs principales
- **Primaire** `#2563EB` (bleu) — boutons majeurs, liens forts, focus ; hover `#1D4ED8`, active `#1E40AF`, désactivé `#93C5FD`.
- **Positive** `#10B981` (vert) — ajout panier, confirmations ; hover `#059669`, active `#047857`, désactivé `#6EE7B7`.
- **Accent** `#F59E0B` (ambre) — promos, badges attention ; hover `#D97706`, active `#B45309`.
- **Neutres** : `#0F172A` texte fort, `#334155` texte secondaire, `#64748B` labels/placeholders, `#CBD5E1` bordures, `#F1F5F9` fonds légers, `#FFFFFF` surfaces.

### DEP-0202 — Couleurs secondaires
- **Indigo** `#6366F1` (tags catégories) — clair `#A5B4FC`, foncé `#4338CA`.
- **Cyan** `#06B6D4` (notifications froides) — clair `#67E8F9`, foncé `#0E7490`.
- **Violet** `#8B5CF6` (assistant IA/premium) — clair `#C4B5FD`, foncé `#6D28D9`.
- **Rose** `#EC4899` (favoris/promo spéciale) — clair `#F9A8D4`, foncé `#BE185D`.
- Règle : usage ponctuel (<20% de l’interface), les actions majeures restent en palette principale.

### DEP-0203 — Couleurs d’état
- **Succès** : base `#10B981`, fond `#D1FAE5`, bordure `#6EE7B7`, texte `#047857`.
- **Alerte** : base `#F59E0B`, fond `#FEF3C7`, bordure `#FCD34D`, texte `#B45309`.
- **Erreur** : base `#EF4444`, fond `#FEE2E2`, bordure `#FCA5A5`, texte `#B91C1C`.
- **Attente / Info** : base `#3B82F6`, fond `#DBEAFE`, bordure `#93C5FD`, texte `#1E40AF`.
- Usages : toasts (fond clair + bordure + texte), badges (couleur pleine + texte blanc), bordures de champs selon état ; contraste min 4.5:1.

### DEP-0204 — Couleurs contraste élevé
- Objectif AAA (contraste ≥7:1) avec toggle ou préférence système.
- Texte principal : `#000000`; secondaire : `#1F2937`.
- Actions primaires : `#1E40AF` (focus border `#000000` épaisseur 3px).
- États : succès `#047857`, erreur `#B91C1C`, alerte `#B45309`.
- Adaptations : bordures 2px mini, cibles 48x48px, focus visible (border noire 3px + offset 2px), couleurs unies sans dégradé.

---

## Typographie

### DEP-0205 — Typographie principale
- **Police** : Inter (sans-serif). Graisses : 400 (texte), 500 (labels), 600 (titres secondaires/boutons), 700 (titres principaux).
- **Fallback** : `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif`.
- Chargement : font-display swap, subset FR/EN, preload 400 et 600, variable font si possible.

### DEP-0206 — Typographie secondaire
- **Police** : JetBrains Mono (monospace) pour codes/IDs/données alignées, graisse 400.
- **Fallback** : `'JetBrains Mono', 'Fira Code', 'Courier New', monospace`.
- Chiffres tabulaires Inter pour prix/quantités : `font-variant-numeric: tabular-nums`.

### DEP-0207 — Échelle des titres
- **H1** 32px / 1.2 / 700 / -0.02em — titre de page (mobile 28px).
- **H2** 24px / 1.3 / 600 / -0.01em — sections (mobile 22px).
- **H3** 20px / 1.4 / 600 — sous-sections (mobile 18px).
- **H4** 16px / 1.5 / 500 — titres de cartes.
- **H5** 14px / 1.5 / 500 / uppercase / 0.05em — labels accentués.

### DEP-0208 — Échelle du corps de texte
- **Body Large** 18px / 1.6 / 400 — textes d’intro.
- **Body** 16px / 1.5 / 400 — texte standard.
- **Body Small** 14px / 1.5 / 400 — infos secondaires.
- **Caption** 12px / 1.4 / 400 — légendes, timestamps.
- Règles : 65–75 caractères par ligne, paragraphes espacés de 1em, alignement à gauche.

### DEP-0209 — Échelle des boutons
- **CTA Large** 16px / 1.5 / 600 — padding 14x28, hauteur 52px.
- **Bouton Medium** 15px / 1.5 / 500 — padding 10x20, hauteur 44px.
- **Bouton Small** 14px / 1.5 / 500 — padding 8x16, hauteur 36px.
- **Icon-only** 44x44px zone tap, icône 20x20, padding 12px.
- États : hover foncé + élévation, active plus foncé, focus outline bleu 3px + offset 2px, disabled opacité 40%, loading spinner centré.

### DEP-0210 — Échelle des cartes produits
- **Nom produit** 16px / 1.4 / 600, 2 lignes max, `#0F172A`.
- **Description courte** 14px / 1.5 / 400, 1 ligne, `#64748B`.
- **Prix** 18px / 1.3 / 700, tabular nums, `#0F172A`.
- **Badge disponibilité** 12px / 1.3 / 500 / uppercase / 0.05em, couleur selon état.
- **Label catégorie** 11px / 1.4 / 500 / uppercase / 0.08em, `#6366F1`.
- Mobile (liste) : nom 15px, description 13px, prix 16px, badges inchangés.
