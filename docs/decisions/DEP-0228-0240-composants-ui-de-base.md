# DEP-0228 à DEP-0240 — Composants UI de base

## Périmètre

Ce document définit les **12 composants d'interface utilisateur de base** du système visuel
depaneurIA, ainsi que les **critères de validation** à satisfaire avant toute implémentation.

Chaque composant est spécifié en termes de structure, dimensions, styles, états,
comportement et accessibilité.

**Référence parente** : `DEP-0201-DEP-0240-visual-design-system.md`
**Palette et typographie** : DEP-0201 à DEP-0210
**Styles visuels et animations** : DEP-0211 à DEP-0227

---

## DEP-0228 — Composant bouton principal

### Variantes

1. **Primary** — action principale
   - Background : `#2563EB`
   - Texte : `#FFFFFF`, 16px SemiBold
   - Bordure : aucune
   - Usage : « Commander », « Ajouter au panier », « Valider »

2. **Secondary** — action complémentaire
   - Background : `#FFFFFF`
   - Texte : `#2563EB`, 16px SemiBold
   - Bordure : `2px solid #2563EB`

3. **Success** — confirmation positive
   - Background : `#10B981`
   - Texte : `#FFFFFF`

4. **Danger** — action destructrice
   - Background : `#EF4444`
   - Texte : `#FFFFFF`

### Tailles

| Taille | Hauteur | Font  | Padding        |
|--------|---------|-------|----------------|
| Large  | 52px    | 16px  | 14px 28px      |
| Medium | 44px    | 15px  | 10px 20px      |
| Small  | 36px    | 14px  | 8px 16px       |

### États

- **Default** : couleur de base selon la variante
- **Hover** : couleur plus foncée + ombre `0 2px 8px rgba(0,0,0,0.15)` + `translateY(-1px)`
- **Active** : couleur encore plus foncée, pas de translation
- **Focus** : outline `3px solid rgba(37,99,235,0.4)`, offset 2px
- **Disabled** : opacité 40%, curseur `not-allowed`
- **Loading** : spinner animé à la place de l'icône, texte grisé

### Anatomie

```
┌─────────────────────────────┐
│  [Icon] Texte bouton        │
│   20px   16px SemiBold      │
└─────────────────────────────┘
```

- Border-radius : 8px
- Gap icône-texte : 8px
- Transition : `all 150ms ease`

### Accessibilité

- Zone tactile minimale : 44×44px
- Focus visible obligatoire
- Rôle ARIA implicite (`button`)
- Navigation clavier : Space et Enter déclenchent l'action

---

## DEP-0229 — Composant bouton secondaire

### Styles

1. **Ghost** — action tertiaire
   - Background : transparent
   - Texte : `#2563EB`
   - Bordure : `1px solid #CBD5E1`
   - Hover : background `#F1F5F9`

2. **Link** — navigation secondaire
   - Background : transparent
   - Texte : `#2563EB`
   - Bordure : aucune
   - Hover : soulignement

3. **Icon-only** — outils (fermer, éditer, copier)
   - Background : `#F3F4F6`
   - Dimensions : 44×44px
   - Icône : 20×20px, `#64748B`
   - Border-radius : 8px

### Usage

- Actions tertiaires et navigation secondaire
- Barres d'outils et actions contextuelles
- Boutons de fermeture, d'édition, de copie

### Accessibilité

- Les boutons icon-only doivent avoir un `aria-label` descriptif
- Tooltip au survol (délai 300ms)

---

## DEP-0230 — Composant champ de recherche

### Anatomie

```
┌────────────────────────────────────────┐
│ [🔍]  Placeholder ou texte       [X]  │
│  Icon  14px Regular              Clear │
└────────────────────────────────────────┘
```

### Dimensions

- Hauteur : 44px
- Largeur : 100% (max 600px)
- Padding : `12px 40px 12px 44px`
- Border-radius : 10px

### Styles

- Background : `#F8FAFC`
- Bordure : `1px solid #E2E8F0`
- Texte : 14px Regular, `#0F172A`
- Placeholder : 14px Regular, `#94A3B8`

### États

- **Default** : bordure `#E2E8F0`
- **Hover** : bordure `#CBD5E1`, background `#FFFFFF`
- **Focus** : bordure `#2563EB` (2px), ombre `0 0 0 3px rgba(37,99,235,0.1)`
- **Rempli** : bordure `#CBD5E1`, bouton clear visible

### Comportement

- Recherche instantanée avec debounce de 300ms
- Dropdown de résultats sous le champ
- Le bouton clear réinitialise le champ et maintient le focus
- Escape efface le contenu et retire le focus

### Accessibilité

- `<label>` associé ou `aria-label`
- `role="searchbox"`
- `aria-autocomplete="list"` quand les suggestions sont actives

---

## DEP-0231 — Composant carte produit

### Dimensions

- Ratio : 3:4 (image + contenu)
- Min-width : 200px
- Max-width : 280px
- Padding : 12px
- Border-radius : 12px

### Structure

```
┌──────────────────────────┐
│                          │
│   [Image 1:1]            │
│   Badge catégorie        │
│   Badge dispo            │
│                          │
├──────────────────────────┤
│ Nom produit (2 lignes)   │
│ Description (1 ligne)    │
│                          │
│ Prix        [+ Panier]   │
│ 18px Bold   36px btn     │
└──────────────────────────┘
```

### Image

- Ratio : 1:1
- Border-radius : `8px 8px 0 0`
- Object-fit : cover
- Background loading : `#F1F5F9`
- Lazy loading : oui

### Badges

- **Catégorie** : haut-gauche, background `#6366F1`, 11px uppercase, `#FFFFFF`
- **Disponibilité** : haut-droite (vert/orange/rouge selon stock)
- Position : absolute sur l'image
- Padding : `4px 8px`, border-radius : 6px

### Texte

- Nom : 16px SemiBold, `#0F172A`, 2 lignes max, ellipsis
- Description : 14px Regular, `#64748B`, 1 ligne, ellipsis
- Prix : 18px Bold, `#0F172A`, `font-variant-numeric: tabular-nums`

### Bouton ajout panier

- Taille : 36px hauteur
- Icône : plus, 16px
- Background : `#2563EB`
- Border-radius : 8px
- Hover : background `#1D4ED8`, `scale(1.05)`

### États

- **Default** : bordure `#E2E8F0`, pas d'ombre
- **Hover** : bordure `#CBD5E1`, ombre `0 4px 12px rgba(0,0,0,0.08)`
- **Selected** : bordure `#2563EB` (2px), ombre `0 4px 16px rgba(37,99,235,0.15)`
- **Indisponible** : opacité 60%, filtre niveaux de gris

### Responsive

- Desktop : 3–4 colonnes
- Tablette : 3 colonnes
- Mobile : 2 colonnes ou liste verticale

---

## DEP-0232 — Composant miniature panier

### Badge panier (header/nav)

```
┌────────────┐
│  🛒  (3)   │
│ 24px  12px │
└────────────┘
```

- Icône : shopping-cart, 24×24px, `#0F172A`
- Badge quantité : cercle 18×18px, background `#EF4444`, texte 11px Bold `#FFFFFF`
- Position : absolute haut-droite, offset -4px
- Hover : `scale(1.1)`

### Bouton panier mobile (sticky bottom)

```
┌──────────────────────────────────────┐
│  Voir le panier (3) — Total: 45.00$ │
│  16px SemiBold       18px Bold       │
└──────────────────────────────────────┘
```

- Hauteur : 56px
- Largeur : `calc(100% - 32px)`, max 600px
- Margin : `0 16px 16px`
- Padding : `16px 20px`
- Background : `#2563EB`
- Texte : `#FFFFFF`
- Border-radius : 12px
- Ombre : `0 8px 24px rgba(37,99,235,0.3)`
- Position : sticky bottom 16px, z-index 100

### Animation d'ajout

- Scale : `1 → 1.15 → 1`, durée 300ms
- Badge : flash `#10B981` → `#EF4444`

---

## DEP-0233 — Composant message assistant

### Structure

```
┌──────────────────────────────┐
│ 🤖 [Avatar]                  │
│    Texte du message          │
│    de l'assistant...         │
│    12:34                     │
└──────────────────────────────┘
```

### Avatar

- Taille : 32×32px
- Background : `#EDE9FE` (violet-100)
- Icône : bot, 20×20px, `#8B5CF6`
- Border-radius : 50%

### Bulle

- Background : `#F3F4F6` (gray-100)
- Texte : 14px Regular, `#0F172A`
- Padding : `12px 16px`
- Border-radius : `12px 12px 12px 4px` (pointe bas-gauche)
- Max-width : 85%
- Line-height : 1.5

### Horodatage

- Texte : 11px Regular, `#64748B`
- Margin-top : 4px

### Indicateur de frappe

```
┌──────────────────────────────┐
│ 🤖 [Avatar]                  │
│    ● ● ● (animé)             │
└──────────────────────────────┘
```

- 3 points animés, 8px chacun, `#94A3B8`
- Animation : bounce, décalage 150ms entre chaque point

### Actions rapides

- Affichage sous le message si applicable
- Boutons secondaires compacts
- Display : `flex`, gap 8px
- Margin-top : 8px

---

## DEP-0234 — Composant message client

### Structure

```
        ┌──────────────────────┐
        │  Texte du message    │
        │  du client...        │
        │              12:35   │
        └──────────────────────┘
```

### Bulle

- Background : `#2563EB` (primary)
- Texte : 14px Regular, `#FFFFFF`
- Padding : `12px 16px`
- Border-radius : `12px 12px 4px 12px` (pointe bas-droite)
- Max-width : 85%
- Line-height : 1.5
- Alignement : flex-end (droite)

### Horodatage

- Texte : 11px Regular, `#BFDBFE` (blue-200)
- Margin-top : 4px
- Alignement : droite

### Indicateurs d'envoi

- **En cours** : simple coche, gris
- **Envoyé** : double coche, gris
- **Lu** : double coche, bleu (si implémenté)
- Taille : 12×12px

### Erreur d'envoi

- Bordure : `1px solid #FCA5A5` (red-300)
- Background : `#FEE2E2` (red-100)
- Texte : `#7F1D1D` (red-900)
- Icône : alert-circle, rouge
- Action : lien « Réessayer » sous le message

---

## DEP-0235 — Composant tuile suggestion

### Structure

```
┌────────────────────────────────────┐
│ [Img] Nom produit          [+]    │
│ 40px  Description courte   32px   │
└────────────────────────────────────┘
```

### Dimensions

- Hauteur : 60px
- Largeur : 100%
- Padding : `8px 12px`
- Border-radius : 10px

### Styles

- Background : `#F8FAFC`
- Bordure : `1px solid #E2E8F0`
- Hover : background `#EFF6FF`, bordure `#93C5FD`
- Active : background `#DBEAFE`
- Curseur : pointer

### Image

- Taille : 40×40px
- Border-radius : 6px
- Object-fit : cover
- Flex-shrink : 0

### Texte

- Nom : 14px SemiBold, `#0F172A`, 1 ligne, ellipsis
- Description : 12px Regular, `#64748B`, 1 ligne, ellipsis
- Display : flex column, gap 2px
- Flex : 1

### Bouton ajout

- Taille : 32×32px
- Icône : plus, 16px
- Background : `#2563EB`
- Texte : `#FFFFFF`
- Border-radius : 6px
- Hover : background `#1D4ED8`, `scale(1.05)`
- Flex-shrink : 0

### Animation

- Apparition : slide up + fade in, décalage 50ms entre tuiles
- Clic : `scale(0.98)` sur toute la tuile

---

## DEP-0236 — Composant indicateur d'état de livraison

### Structure (stepper horizontal)

```
┌───────────────────────────────────────────────────┐
│  ●───────●───────●───────○───────○                │
│ Reçue  Prép.  Prête  Livr.  Livrée               │
│ 12:00  12:15  12:40   --      --                  │
└───────────────────────────────────────────────────┘
```

### Étapes

5 étapes : Reçue → Préparation → Prête → En livraison → Livrée

### Anatomie

- Cercles (nœuds) : 32px de diamètre
- Ligne de connexion : 2px de hauteur
- Espacement : équidistant

### Styles des cercles

- **Complété** : background `#10B981`, icône checkmark 16px `#FFFFFF`
- **Actif** : background `#2563EB`, icône étape 16px `#FFFFFF`, animation pulse
- **À venir** : background `#F1F5F9`, bordure `2px solid #CBD5E1`, pas d'icône

### Ligne de connexion

- **Complétée** : background `#10B981`
- **En cours** : dégradé `#10B981` → `#CBD5E1`
- **À venir** : background `#E2E8F0`

### Labels

- Nom de l'étape : 12px Medium, `#0F172A`, centré sous le cercle
- Horodatage : 11px Regular, `#64748B`, centré sous le nom

### Responsive mobile

- Version verticale (liste)
- Cercles à gauche, texte à droite
- Ligne verticale entre les cercles

---

## DEP-0237 — Composant carte dernière commande

### Structure

```
┌──────────────────────────────────────┐
│ Votre dernière commande              │
│ 16 mars 2024 — 3 articles           │
│                                      │
│ • Produit 1        x2     12.00$    │
│ • Produit 2        x1      8.50$    │
│ • Produit 3        x1      5.00$    │
│                                      │
│ Total: 25.50$                        │
│                                      │
│ [Recommander cette commande]         │
└──────────────────────────────────────┘
```

### Dimensions

- Largeur : 100% (max 400px)
- Padding : 20px
- Border-radius : 12px
- Bordure : `1px solid #E2E8F0`
- Background : `#FFFFFF`

### En-tête

- Titre : 16px SemiBold, `#0F172A`
- Méta : 13px Regular, `#64748B`
- Margin-bottom : 16px

### Liste de produits

- Item : flex row, justify space-between
- Nom : 14px Regular, `#0F172A`
- Quantité : 14px Regular, `#64748B`
- Prix : 14px Medium, `#0F172A`, `tabular-nums`
- Gap : 8px entre les items

### Total

- Séparateur : `border-top: 1px solid #E2E8F0`
- Padding-top : 12px
- Margin-top : 12px
- Texte : 16px Bold, `#0F172A`
- Alignement : droite

### Bouton d'action

- Style : secondary (DEP-0229)
- Largeur : 100%
- Margin-top : 16px
- Texte : « Recommander cette commande »

---

## DEP-0238 — Composant carte top 10

### Structure

```
┌──────────────────────────────────────┐
│ Top 10 des produits populaires       │
│                                      │
│ 1  [Img] Nom produit      [+ Panier]│
│    40px  14px SemiBold     32px      │
│                                      │
│ 2  [Img] Nom produit      [+ Panier]│
│ ...                                  │
│ 10 [Img] Nom produit      [+ Panier]│
└──────────────────────────────────────┘
```

### Dimensions

- Largeur : 100% (max 400px)
- Padding : 20px
- Border-radius : 12px
- Bordure : `1px solid #E2E8F0`
- Background : `#FFFFFF`

### En-tête

- Titre : 16px SemiBold, `#0F172A`
- Margin-bottom : 16px

### Item du top 10

```
┌────────────────────────────────────┐
│ #1 [Img] Nom du produit       [+] │
│ 18px 40px 14px SemiBold       32px│
└────────────────────────────────────┘
```

- Hauteur : 56px
- Padding : `8px 0`
- Séparateur : `border-bottom: 1px solid #F1F5F9` (sauf dernier)
- Hover : background `#F8FAFC`

### Numéro de rang

- Taille : 18px Bold
- Couleur : `#2563EB` (top 3), `#64748B` (les autres)
- Largeur : 24px
- Alignement : center

### Image

- Taille : 40×40px
- Border-radius : 6px
- Object-fit : cover

### Nom

- Texte : 14px SemiBold, `#0F172A`
- Flex : 1
- Line-clamp : 1

### Bouton ajout

- Taille : 32×32px
- Style identique à la tuile suggestion (DEP-0235)

---

## DEP-0239 — Composant modal de confirmation

### Overlay

- Background : `rgba(0, 0, 0, 0.5)`
- Backdrop-filter : `blur(4px)`
- Z-index : 9999
- Clic sur l'overlay ferme la modal

### Structure

```
┌─────────────────────────────────┐
│  [Icon]  Titre                  │
│  48px    18px SemiBold          │
│                                 │
│  Message de confirmation        │
│  14px Regular, 2-3 lignes       │
│                                 │
│  [Annuler]    [Confirmer]       │
│  Secondary    Primary           │
└─────────────────────────────────┘
```

### Dimensions

- Largeur : 90vw, max 440px
- Padding : 24px
- Border-radius : 16px
- Background : `#FFFFFF`
- Ombre : `0 20px 60px rgba(0,0,0,0.3)`

### Icône (optionnelle)

- Taille : 48×48px
- Background par type :
  - Info : `#DBEAFE` (blue-100), icône `#2563EB`
  - Avertissement : `#FEF3C7` (amber-100), icône `#F59E0B`
  - Danger : `#FEE2E2` (red-100), icône `#EF4444`
- Icône : 24×24px, couleur correspondante
- Border-radius : 50%
- Margin-bottom : 16px

### Titre

- Texte : 18px SemiBold, `#0F172A`
- Margin-bottom : 8px

### Message

- Texte : 14px Regular, `#334155`
- Line-height : 1.5
- Margin-bottom : 24px

### Actions

- Display : `flex`, gap 12px
- Justify : flex-end (ou center)
- Bouton annuler : style secondary (DEP-0229)
- Bouton confirmer : style primary (DEP-0228) ou danger si action destructrice

### Animation

- Entrée : `scale(0.95) → scale(1)`, fade in, 200ms
- Sortie : `scale(1) → scale(0.95)`, fade out, 150ms
- Overlay : fade in/out

### Accessibilité

- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` : ID du titre
- Piège de focus (focus trap) : oui
- Escape : ferme la modal
- Focus initial : bouton principal

---

## DEP-0240 — Critères de validation du système visuel de base

### Objectif

Avant toute implémentation en code, le système visuel défini dans les DEP-0201 à DEP-0239
doit être validé avec les parties prenantes (product owner, développeurs, designers).

### Points de validation

#### 1. Cohérence de la palette de couleurs

- Les couleurs primaires, secondaires, d'état et d'accessibilité sont-elles cohérentes ?
- Les contrastes respectent-ils WCAG 2.1 AA (minimum) et AAA (idéal) ?
- Les couleurs sont-elles adaptées à la marque et au public cible ?

#### 2. Typographie et lisibilité

- Les échelles typographiques couvrent-elles tous les contextes ?
- Les tailles de texte sont-elles lisibles sur tous les supports (desktop, mobile) ?
- Les graisses de police choisies sont-elles disponibles et optimisées ?

#### 3. Styles des composants

- Les composants définis couvrent-ils tous les besoins issus de DEP-0181 à DEP-0200 ?
- Les états (hover, active, disabled, loading) sont-ils complets ?
- Les dimensions et espacements sont-ils cohérents ?

#### 4. Animations et feedback

- Les animations sont-elles subtiles et performantes ?
- Les durées et easings sont-ils appropriés ?
- Le respect de `prefers-reduced-motion` est-il garanti ?

#### 5. Accessibilité

- Tous les composants ont-ils des alternatives textuelles (`aria-label`) ?
- Les zones tactiles sont-elles suffisantes (min 44×44px) ?
- Le mode contraste élevé est-il fonctionnel ?
- La navigation clavier est-elle possible partout ?

### Checklist de validation

- [ ] Palette de couleurs approuvée (primaire, secondaire, états, accessibilité)
- [ ] Typographie approuvée (Inter + JetBrains Mono, échelles complètes)
- [ ] Styles visuels des 10 composants principaux validés
- [ ] Icônes minimales identifiées (Lucide Icons)
- [ ] 7 animations clés définies et approuvées
- [ ] 12 spécifications de composants de base validées
- [ ] Tests de contraste WCAG effectués et validés
- [ ] Design responsive validé (desktop, tablette, mobile)
- [ ] Cohérence avec les décisions UX DEP-0181 à DEP-0200 confirmée
- [ ] Accord écrit ou verbal des parties prenantes obtenu

### Prochaines étapes après validation

1. Créer les design tokens (variables CSS/SCSS)
2. Implémenter les composants de base en code
3. Construire la bibliothèque de composants (Storybook ou équivalent)
4. Tester l'accessibilité avec des outils automatisés et des tests utilisateur
5. Documenter les patterns d'usage pour les développeurs

### Note importante

Toute modification majeure du système visuel après validation doit être documentée dans un
nouveau document de décision (ex. `DEP-0XXX-visual-system-update.md`) pour tracer
l'évolution et éviter les incohérences.
