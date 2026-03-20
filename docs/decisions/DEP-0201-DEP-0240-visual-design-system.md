# DEP-0201 à DEP-0240 — Système visuel de base

## Périmètre

Définir le système de design visuel complet pour l'application depaneurIA, incluant
les couleurs, la typographie, les styles visuels des composants, les icônes, les animations
et les spécifications des composants de base. Ce document constitue la référence visuelle
unique avant le passage à l'implémentation en code.

---

## Partie 1 : Système de couleurs (DEP-0201 à DEP-0204)

### DEP-0201 — Couleurs principales de l'interface

#### Palette primaire

Les couleurs principales définissent l'identité visuelle de l'application et sont utilisées
pour les éléments interactifs principaux, les en-têtes, et les actions importantes.

- **Primaire principal** : `#2563EB` (bleu saturé)
  - Usage : boutons principaux, liens, en-têtes actifs, focus states
  - Contraste : 4.5:1 minimum sur fond blanc
  - Variantes :
    - Hover : `#1D4ED8` (bleu plus foncé)
    - Active : `#1E40AF` (bleu encore plus foncé)
    - Désactivé : `#93C5FD` (bleu pâle)

- **Primaire secondaire** : `#10B981` (vert émeraude)
  - Usage : ajout au panier, confirmations rapides, indicateurs positifs
  - Contraste : 4.5:1 minimum sur fond blanc
  - Variantes :
    - Hover : `#059669`
    - Active : `#047857`
    - Désactivé : `#6EE7B7`

- **Accent** : `#F59E0B` (orange ambré)
  - Usage : badges de notification, promotions, points d'attention
  - Contraste : 3:1 minimum sur fond blanc
  - Variantes :
    - Hover : `#D97706`
    - Active : `#B45309`

#### Neutrals (gris)

- **Noir principal** : `#0F172A` (slate-900)
  - Usage : texte principal, titres importants

- **Gris foncé** : `#334155` (slate-700)
  - Usage : texte secondaire, sous-titres

- **Gris moyen** : `#64748B` (slate-500)
  - Usage : texte tertiaire, labels, placeholders

- **Gris clair** : `#CBD5E1` (slate-300)
  - Usage : bordures, séparateurs

- **Gris très clair** : `#F1F5F9` (slate-100)
  - Usage : fonds de sections, cartes légères

- **Blanc** : `#FFFFFF`
  - Usage : fond principal, cartes, surfaces

---

### DEP-0202 — Couleurs secondaires de l'interface

#### Palette secondaire

Ces couleurs complètent la palette primaire et servent pour des contextes spécifiques
sans surcharger l'interface.

- **Indigo** : `#6366F1` (indigo-500)
  - Usage : tags de catégories, badges informatifs, liens secondaires
  - Variantes :
    - Clair : `#A5B4FC` (indigo-300)
    - Foncé : `#4338CA` (indigo-700)

- **Cyan** : `#06B6D4` (cyan-500)
  - Usage : indicateurs de fraîcheur, notifications livreur, éléments froids
  - Variantes :
    - Clair : `#67E8F9` (cyan-300)
    - Foncé : `#0E7490` (cyan-700)

- **Violet** : `#8B5CF6` (violet-500)
  - Usage : éléments premium, fonctionnalités assistant IA
  - Variantes :
    - Clair : `#C4B5FD` (violet-300)
    - Foncé : `#6D28D9` (violet-700)

- **Rose** : `#EC4899` (pink-500)
  - Usage : produits favoris, promotions spéciales
  - Variantes :
    - Clair : `#F9A8D4` (pink-300)
    - Foncé : `#BE185D` (pink-700)

#### Règle d'usage

- Utiliser les couleurs secondaires avec parcimonie (max 20% de l'interface)
- Privilégier les couleurs principales pour les actions importantes
- Les couleurs secondaires servent à différencier les contextes, non à attirer l'attention

---

### DEP-0203 — Couleurs d'état : succès, alerte, erreur, attente

#### Couleurs sémantiques

Ces couleurs communiquent l'état d'une action ou d'un système et doivent être utilisées
de manière cohérente dans toute l'application.

- **Succès** : `#10B981` (green-500)
  - Usage : commande validée, livraison complétée, action réussie
  - Fond clair : `#D1FAE5` (green-100)
  - Bordure : `#6EE7B7` (green-300)
  - Texte : `#047857` (green-700)
  - Contraste : 4.5:1 minimum

- **Alerte / Warning** : `#F59E0B` (amber-500)
  - Usage : produit bientôt indisponible, action à confirmer, attention requise
  - Fond clair : `#FEF3C7` (amber-100)
  - Bordure : `#FCD34D` (amber-300)
  - Texte : `#B45309` (amber-700)
  - Contraste : 4.5:1 minimum

- **Erreur** : `#EF4444` (red-500)
  - Usage : échec de validation, produit indisponible, erreur système
  - Fond clair : `#FEE2E2` (red-100)
  - Bordure : `#FCA5A5` (red-300)
  - Texte : `#B91C1C` (red-700)
  - Contraste : 4.5:1 minimum

- **Attente / Info** : `#3B82F6` (blue-500)
  - Usage : chargement en cours, information neutre, état intermédiaire
  - Fond clair : `#DBEAFE` (blue-100)
  - Bordure : `#93C5FD` (blue-300)
  - Texte : `#1E40AF` (blue-700)
  - Contraste : 4.5:1 minimum

#### Patterns d'utilisation

- **Messages toast** : utiliser fond clair + bordure + texte foncé
- **Badges d'état** : utiliser couleur pleine avec texte blanc (contraste vérifié)
- **Icônes d'état** : utiliser la couleur principale de l'état
- **Bordures de champs** : erreur en rouge, succès en vert, focus en bleu

---

### DEP-0204 — Couleurs d'accessibilité à contraste élevé

#### Mode contraste élevé

Pour les utilisateurs malvoyants ou dans des conditions de luminosité difficiles,
un mode contraste élevé doit être disponible via les préférences système ou un toggle.

**Contraste minimum requis : 7:1 (niveau AAA WCAG 2.1)**

- **Texte principal sur fond blanc** : `#000000` (noir pur)
  - Contraste : 21:1

- **Texte secondaire sur fond blanc** : `#1F2937` (gray-800)
  - Contraste : 16:1

- **Liens et boutons primaires** : `#1E40AF` (bleu foncé)
  - Contraste : 8.6:1 sur blanc
  - Focus border : `#000000` avec épaisseur 3px

- **Succès (contraste élevé)** : `#047857` (green-700)
  - Contraste : 7.8:1 sur blanc

- **Erreur (contraste élevé)** : `#B91C1C` (red-700)
  - Contraste : 8.2:1 sur blanc

- **Alerte (contraste élevé)** : `#B45309` (amber-700)
  - Contraste : 7.1:1 sur blanc

#### Adaptations en mode contraste élevé

- Épaisseur des bordures : minimum 2px (au lieu de 1px)
- Taille minimale des cibles tactiles : 48x48px (au lieu de 44x44px)
- Espacement accru entre éléments interactifs : 16px minimum
- Suppression des dégradés au profit de couleurs unies
- Focus indicators : bordure noire de 3px + offset de 2px
- Désactivation des ombres portées subtiles

#### Détection automatique

```
prefers-contrast: high
```

Le système doit détecter et appliquer automatiquement le mode contraste élevé
si l'utilisateur l'a activé dans ses préférences système.

---

## Partie 2 : Système typographique (DEP-0205 à DEP-0210)

### DEP-0205 — Typographie principale

#### Police principale : Inter

**Famille** : Inter (sans-serif géométrique)
**Raison** : excellente lisibilité à toutes les tailles, optimisée pour les écrans,
support complet des caractères français, open source, chargement rapide.

**Source** : Google Fonts
**Graisses utilisées** :

- Regular (400) : texte courant
- Medium (500) : sous-titres, labels
- SemiBold (600) : titres secondaires, boutons
- Bold (700) : titres principaux, CTA importants

**Fallback stack** :

```css
font-family:
  'Inter',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  'Roboto',
  'Helvetica Neue',
  Arial,
  sans-serif;
```

#### Optimisations

- Variable font si supporté (meilleure compression)
- Chargement asynchrone avec `font-display: swap`
- Subset français + anglais uniquement
- Preload pour les graisses 400 et 600

---

### DEP-0206 — Typographie secondaire

#### Police secondaire : JetBrains Mono (usage spécifique)

**Famille** : JetBrains Mono (monospace)
**Usage** : codes de commande, IDs techniques, données structurées, logs

**Graisse** : Regular (400) uniquement
**Fallback stack** :

```css
font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

#### Police pour les chiffres importants : Inter Tabular

Pour les prix, quantités, et données numériques alignées, utiliser les chiffres
tabulaires d'Inter :

```css
font-variant-numeric: tabular-nums;
```

Ceci garantit l'alignement vertical des colonnes de chiffres.

---

### DEP-0207 — Échelle des titres

#### Hiérarchie typographique

**H1 — Titre de page principal**

- Taille : 32px (2rem)
- Graisse : Bold (700)
- Hauteur de ligne : 1.2 (38.4px)
- Espacement lettres : -0.02em
- Marge basse : 24px
- Usage : une seule fois par page, titre principal

**H2 — Titre de section**

- Taille : 24px (1.5rem)
- Graisse : SemiBold (600)
- Hauteur de ligne : 1.3 (31.2px)
- Espacement lettres : -0.01em
- Marge basse : 16px
- Usage : sections majeures

**H3 — Sous-titre de section**

- Taille : 20px (1.25rem)
- Graisse : SemiBold (600)
- Hauteur de ligne : 1.4 (28px)
- Espacement lettres : normal
- Marge basse : 12px
- Usage : sous-sections, cartes

**H4 — Titre de carte/composant**

- Taille : 16px (1rem)
- Graisse : Medium (500)
- Hauteur de ligne : 1.5 (24px)
- Espacement lettres : normal
- Marge basse : 8px
- Usage : titres de cartes produits, noms de produits

**H5 — Label accentué**

- Taille : 14px (0.875rem)
- Graisse : Medium (500)
- Hauteur de ligne : 1.5 (21px)
- Transform : uppercase
- Espacement lettres : 0.05em
- Usage : labels de sections, catégories

#### Responsive

Sur mobile (< 768px) :

- H1 : 28px
- H2 : 22px
- H3 : 18px
- H4 et H5 : inchangés

---

### DEP-0208 — Échelle du corps de texte

#### Styles de paragraphe

**Body Large — Texte principal accentué**

- Taille : 18px (1.125rem)
- Graisse : Regular (400)
- Hauteur de ligne : 1.6 (28.8px)
- Couleur : `#0F172A` (noir principal)
- Usage : textes d'introduction, messages importants

**Body — Texte standard**

- Taille : 16px (1rem)
- Graisse : Regular (400)
- Hauteur de ligne : 1.5 (24px)
- Couleur : `#0F172A` (noir principal)
- Usage : corps de texte principal, descriptions

**Body Small — Texte secondaire**

- Taille : 14px (0.875rem)
- Graisse : Regular (400)
- Hauteur de ligne : 1.5 (21px)
- Couleur : `#334155` (gris foncé)
- Usage : métadonnées, informations complémentaires

**Caption — Légende**

- Taille : 12px (0.75rem)
- Graisse : Regular (400)
- Hauteur de ligne : 1.4 (16.8px)
- Couleur : `#64748B` (gris moyen)
- Usage : légendes, timestamps, notes de bas de page

#### Règles de lisibilité

- Longueur de ligne maximale : 65-75 caractères (optimal)
- Espacement entre paragraphes : 1em (16px)
- Alignement : gauche pour le français (jamais justifié)
- Orphelines/veuves : éviter (minimum 2 lignes)

---

### DEP-0209 — Échelle des boutons

#### Typographie des boutons

**Bouton Large (CTA principal)**

- Taille : 16px (1rem)
- Graisse : SemiBold (600)
- Hauteur de ligne : 1.5 (24px)
- Transform : none (casse normale)
- Padding : 14px 28px
- Hauteur totale : 52px
- Usage : actions principales (valider commande, ajouter au panier)

**Bouton Medium (action secondaire)**

- Taille : 15px (0.9375rem)
- Graisse : Medium (500)
- Hauteur de ligne : 1.5 (22.5px)
- Transform : none
- Padding : 10px 20px
- Hauteur totale : 44px
- Usage : actions courantes

**Bouton Small (action tertiaire)**

- Taille : 14px (0.875rem)
- Graisse : Medium (500)
- Hauteur de ligne : 1.5 (21px)
- Transform : none
- Padding : 8px 16px
- Hauteur totale : 36px
- Usage : actions secondaires, liens d'action

**Bouton Icon-only (action icône seule)**

- Taille : 44x44px minimum (zone de tap)
- Icône : 20x20px
- Padding : 12px (centré)
- Usage : fermer, menu, favoris

#### États des boutons

- **Default** : couleur pleine + texte contrasté
- **Hover** : couleur plus foncée + légère élévation (shadow)
- **Active** : couleur encore plus foncée + shadow réduite
- **Focus** : outline bleu 3px + offset 2px
- **Disabled** : opacité 40% + cursor not-allowed
- **Loading** : spinner centré + texte fade

---

### DEP-0210 — Échelle des cartes produits

#### Typographie des cartes produits

Les cartes produits ont une hiérarchie typographique interne stricte pour faciliter
le scan visuel et la comparaison.

**Nom du produit**

- Taille : 16px (1rem)
- Graisse : SemiBold (600)
- Hauteur de ligne : 1.4 (22.4px)
- Couleur : `#0F172A`
- Lignes max : 2 (ellipsis si dépassement)
- Usage : identité du produit

**Description courte / Variante**

- Taille : 14px (0.875rem)
- Graisse : Regular (400)
- Hauteur de ligne : 1.5 (21px)
- Couleur : `#64748B` (gris moyen)
- Lignes max : 1
- Usage : format, poids, saveur

**Prix (si affiché)**

- Taille : 18px (1.125rem)
- Graisse : Bold (700)
- Hauteur de ligne : 1.3 (23.4px)
- Couleur : `#0F172A`
- Font-variant : tabular-nums
- Usage : prix unitaire

**Badge de disponibilité**

- Taille : 12px (0.75rem)
- Graisse : Medium (500)
- Hauteur de ligne : 1.3 (15.6px)
- Transform : uppercase
- Espacement lettres : 0.05em
- Couleur : selon état (vert, orange, rouge)
- Usage : en stock, limité, rupture

**Label catégorie**

- Taille : 11px (0.6875rem)
- Graisse : Medium (500)
- Hauteur de ligne : 1.4 (15.4px)
- Transform : uppercase
- Espacement lettres : 0.08em
- Couleur : `#6366F1` (indigo)
- Usage : tag de catégorie

#### Responsive

Sur mobile, les cartes produits en mode liste :

- Nom : 15px
- Description : 13px
- Prix : 16px
- Badges : inchangés

---

## Partie 3 : Styles visuels des composants (DEP-0211 à DEP-0218)

### DEP-0211 — Style visuel des cartes produits

#### Structure visuelle

**Carte produit standard (mode grille)**

Dimensions :

- Largeur : flexible (grille responsive)
- Ratio d'aspect : 3:4 (image) + contenu texte
- Padding interne : 12px
- Border-radius : 12px
- Border : 1px solid `#E2E8F0`
- Background : `#FFFFFF`

Structure :

```
┌──────────────────────────┐
│                          │
│   Image produit          │
│   (ratio 1:1)            │
│                          │
├──────────────────────────┤
│ Badge catégorie          │
│ Nom du produit           │
│ Description courte       │
│ Badge disponibilité      │
│                          │
│ Prix        [+ Panier]   │
└──────────────────────────┘
```

**Image produit**

- Ratio : 1:1 (carré)
- Object-fit : cover
- Border-radius : 8px (top)
- Background : `#F8FAFC` (si chargement)
- Hover : légère scale (1.05) avec transition smooth

**Badge disponibilité**

- Position : absolute top-right sur l'image
- Padding : 4px 8px
- Border-radius : 6px
- Background : semi-transparent (backdrop-blur)
- Exemple : `rgba(16, 185, 129, 0.9)` pour "En stock"

**Bouton ajout panier**

- Style : icon + text ou icon-only selon largeur
- Taille : 36px hauteur
- Border-radius : 8px
- Hover : élévation + couleur active
- Loading : spinner + texte "Ajout..."

#### États de la carte

- **Default** : border `#E2E8F0`, shadow : none
- **Hover** : border `#CBD5E1`, shadow : `0 4px 12px rgba(0,0,0,0.08)`
- **Selected** : border `#2563EB` (2px), shadow : `0 4px 16px rgba(37,99,235,0.15)`
- **Unavailable** : opacity 60%, grayscale filter, cursor not-allowed

---

### DEP-0212 — Style visuel du panier

#### Structure visuelle

Le panier est une section verticale sticky qui affiche les produits ajoutés,
le résumé et les actions de validation.

**Container panier**

- Width : 100% du container parent (section 3)
- Max-height : calc(100vh - 100px) (scroll interne)
- Background : `#FFFFFF`
- Border : 1px solid `#E2E8F0`
- Border-radius : 12px
- Padding : 16px
- Shadow : `0 2px 8px rgba(0,0,0,0.04)`

**Header panier**

- Titre : "Panier" + badge de quantité
- Taille titre : 18px SemiBold
- Badge : `#2563EB` background, texte blanc
- Action : bouton "Vider" (text-only, petit)

**Item de panier**

Structure d'un item :

```
┌────────────────────────────────┐
│ [Image] Nom du produit         │
│ 60x60   Description            │
│         [- 2 +]      Prix      │
│         Bouton suppr.          │
└────────────────────────────────┘
```

- Padding : 12px
- Border-bottom : 1px solid `#F1F5F9` (sauf dernier)
- Background hover : `#F8FAFC`

**Miniature produit**

- Size : 60x60px
- Border-radius : 8px
- Object-fit : cover

**Contrôles quantité**

- Style : boutons [-] [quantité] [+]
- Taille boutons : 28x28px
- Border : 1px solid `#CBD5E1`
- Border-radius : 6px
- Quantité : 14px Medium, min-width 32px, centré

**Bouton supprimer**

- Style : icon-only (icône poubelle)
- Taille : 32x32px
- Couleur : `#64748B`, hover `#EF4444`
- Position : à droite de la ligne

**Footer panier (résumé)**

- Border-top : 2px solid `#E2E8F0`
- Padding-top : 16px
- Background : `#F8FAFC` (optionnel)

Contenu :

- Total articles : "X articles"
- Ligne "Total" : Bold, 18px
- Bouton CTA : "Commander" (large, pleine largeur)

#### États du panier

- **Vide** : message centré + illustration + suggestion (dernière commande)
- **En cours** : liste des items + résumé
- **Commande validée** : message de succès + animation de confirmation
- **Erreur** : message d'erreur en haut du panier

---

### DEP-0213 — Style visuel du chat assistant

#### Structure visuelle

Le chat assistant est intégré dans la section 3 (desktop) ou en modal/drawer (mobile),
sous le panier ou dans un onglet dédié.

**Container chat**

- Background : `#FFFFFF`
- Border : 1px solid `#E2E8F0`
- Border-radius : 12px
- Padding : 16px
- Min-height : 300px
- Max-height : 500px (scroll messages)

**Header chat**

- Titre : "Assistant" + indicateur de statut
- Taille : 16px SemiBold
- Indicateur : pastille verte "En ligne" ou grise "Hors ligne"
- Bouton fermer : icon-only (X), top-right

**Zone de messages**

- Padding : 12px
- Overflow-y : auto
- Display : flex column
- Gap : 12px entre messages

**Message assistant (à gauche)**

Structure :

```
┌─────────────────────────┐
│ 🤖 [Avatar]             │
│    Message texte        │
│    de l'assistant       │
│    12:34                │
└─────────────────────────┘
```

- Avatar : icône robot, 32x32px, background `#EDE9FE` (violet clair)
- Bubble : background `#F3F4F6`, text `#0F172A`
- Border-radius : 12px (avec pointeur vers avatar)
- Padding : 12px 16px
- Max-width : 85%
- Timestamp : 11px, `#64748B`, margin-top 4px

**Message client (à droite)**

Structure :

```
        ┌─────────────────────┐
        │      Message texte  │
        │      du client      │
        │           12:35     │
        └─────────────────────┘
```

- Bubble : background `#2563EB`, text `#FFFFFF`
- Border-radius : 12px
- Padding : 12px 16px
- Max-width : 85%
- Align : flex-end
- Timestamp : 11px, `#93C5FD`, margin-top 4px

**Zone de saisie**

- Border-top : 1px solid `#E2E8F0`
- Padding-top : 12px
- Display : flex gap 8px

Input :

- Flex : 1
- Height : 40px
- Border : 1px solid `#CBD5E1`
- Border-radius : 8px
- Padding : 8px 12px
- Font-size : 14px
- Placeholder : "Demandez un produit..."

Bouton envoyer :

- Size : 40x40px (icon-only)
- Background : `#2563EB`
- Icon : flèche ou avion papier, blanc
- Border-radius : 8px
- Disabled si input vide

Bouton micro (si mode vocal actif) :

- Size : 40x40px
- Background : `#F3F4F6`, hover `#10B981` (actif)
- Icon : micro, couleur adaptée
- Border-radius : 8px
- Animation pulse si en écoute

---

### DEP-0214 — Style visuel des suggestions

#### Structure visuelle

Les suggestions sont des tuiles rapides affichées par l'assistant pour proposer
des produits ou des actions.

**Container suggestions**

- Display : flex column gap 8px
- Padding : 0 (dans le chat) ou 16px (section dédiée)
- Max suggestions visibles : 5
- Scroll : auto si dépassement

**Tuile suggestion**

Structure :

```
┌────────────────────────────────────┐
│ [Img] Nom produit          [+]     │
│ 40px  Description courte           │
└────────────────────────────────────┘
```

- Height : 60px
- Background : `#F8FAFC`
- Border : 1px solid `#E2E8F0`
- Border-radius : 10px
- Padding : 8px 12px
- Display : flex align-center gap 12px
- Hover : background `#EFF6FF`, border `#93C5FD`
- Cursor : pointer

**Image produit (suggestion)**

- Size : 40x40px
- Border-radius : 6px
- Object-fit : cover

**Texte**

- Nom : 14px SemiBold, `#0F172A`, line-clamp 1
- Description : 12px Regular, `#64748B`, line-clamp 1

**Bouton action**

- Size : 32x32px
- Icon : + (ajouter)
- Background : `#2563EB`
- Color : white
- Border-radius : 6px
- Hover : background `#1D4ED8`

**Animation d'apparition**

- Fade in + slide up
- Durée : 200ms
- Easing : ease-out
- Stagger : 50ms entre chaque suggestion

---

### DEP-0215 — Style visuel des badges d'état de commande

#### Badges d'état

Les badges d'état communiquent visuellement l'étape actuelle de la commande.

**Badge "Nouvelle"**

- Background : `#DBEAFE` (blue-100)
- Text : `#1E40AF` (blue-700)
- Icon : clock ou hourglass
- Border : none

**Badge "En préparation"**

- Background : `#FEF3C7` (amber-100)
- Text : `#B45309` (amber-700)
- Icon : cooking/chef hat
- Border : none

**Badge "Prête"**

- Background : `#D1FAE5` (green-100)
- Text : `#047857` (green-700)
- Icon : checkmark-circle
- Border : none

**Badge "En livraison"**

- Background : `#E0E7FF` (indigo-100)
- Text : `#4338CA` (indigo-700)
- Icon : truck ou scooter
- Border : none

**Badge "Livrée"**

- Background : `#D1FAE5` (green-100)
- Text : `#047857` (green-700)
- Icon : checkmark-double
- Border : none

**Badge "Annulée"**

- Background : `#FEE2E2` (red-100)
- Text : `#B91C1C` (red-700)
- Icon : x-circle
- Border : none

**Badge "Problème"**

- Background : `#FEE2E2` (red-100)
- Text : `#B91C1C` (red-700)
- Icon : alert-triangle
- Border : 1px solid `#FCA5A5` (red-300)

#### Style commun

- Height : 28px
- Padding : 4px 12px 4px 8px
- Border-radius : 14px (pill)
- Font-size : 12px
- Font-weight : Medium (500)
- Display : inline-flex align-center gap 4px
- Icon size : 16x16px

---

### DEP-0216 — Style visuel des alertes du dépanneur

#### Structure des alertes

Les alertes du dépanneur sont affichées en notifications toast (top-right) ou
en bannière (top) selon l'urgence.

**Alerte "Nouvelle commande"**

- Type : toast
- Background : `#2563EB`
- Text : `#FFFFFF`
- Icon : bell, animé (shake)
- Duration : 8 secondes (ou jusqu'à clic)
- Sound : notification sonore (optionnel)
- Action : "Voir la commande" (bouton blanc outline)

**Alerte "Commande urgente"**

- Type : bannière fixe (top, full width)
- Background : `#FEF3C7` (amber-100)
- Text : `#78350F` (amber-900)
- Border-bottom : 3px solid `#F59E0B`
- Icon : alert-circle
- Padding : 12px 16px
- Action : "Traiter maintenant" (bouton primaire)

**Alerte "Produit manquant"**

- Type : toast
- Background : `#FEE2E2` (red-100)
- Text : `#7F1D1D` (red-900)
- Icon : package-x
- Duration : 5 secondes
- Action : "Marquer indisponible" (lien)

**Alerte "Livreur disponible"**

- Type : toast
- Background : `#D1FAE5` (green-100)
- Text : `#064E3B` (green-900)
- Icon : user-check
- Duration : 5 secondes
- Action : "Assigner" (lien)

#### Style des toasts

- Width : 360px
- Max-width : 90vw
- Padding : 16px
- Border-radius : 12px
- Shadow : `0 8px 24px rgba(0,0,0,0.12)`
- Position : fixed top-right (ou top-center sur mobile)
- Z-index : 9999
- Animation entrée : slide-in-right + fade-in
- Animation sortie : slide-out-right + fade-out

---

### DEP-0217 — Style visuel des alertes du livreur

#### Structure des alertes

Les alertes du livreur sont optimisées pour mobile et doivent être visibles
même en conditions de mobilité.

**Alerte "Nouvelle livraison assignée"**

- Type : modal full-screen (mobile) ou toast large (desktop)
- Background : `#2563EB`
- Text : `#FFFFFF`
- Icon : truck, animé
- Sound : notification sonore forte
- Vibration : pattern court (mobile)
- Actions : "Accepter" (vert) | "Refuser" (gris)
- Auto-dismiss : 15 secondes (retour à liste)

**Alerte "Client absent"**

- Type : modal dialog
- Background : `#FFFFFF`
- Title : "Client non disponible"
- Text : Instructions pour retour ou réessai
- Actions : "Appeler client" | "Retour dépanneur"

**Alerte "Problème de livraison"**

- Type : modal dialog
- Background : `#FFFFFF`
- Title : "Signaler un problème"
- Form : textarea + boutons prédéfinis
- Actions : "Envoyer" | "Annuler"

**Notification "Livraison terminée"**

- Type : toast
- Background : `#10B981` (green)
- Text : `#FFFFFF`
- Icon : checkmark-circle
- Duration : 3 secondes
- Sound : succès

#### Spécificités livreur

- Taille de texte minimale : 16px (lisibilité mobile)
- Boutons : min 48px hauteur (accessibilité tactile)
- Contraste élevé par défaut (conditions extérieures)
- Icônes larges : 24x24px minimum
- Feedbacks haptiques (vibrations) sur actions importantes

---

### DEP-0218 — Style visuel des écrans de chargement

#### Spinner principal

**Spinner global (page)**

- Type : spinning circle
- Size : 48px
- Color : `#2563EB` (primaire)
- Stroke-width : 4px
- Animation : rotation 1s linear infinite
- Background overlay : `rgba(255,255,255,0.9)` ou `rgba(0,0,0,0.1)`
- Position : fixed center screen
- Z-index : 9998

**Spinner inline (bouton)**

- Type : spinning circle
- Size : 16px
- Color : currentColor (hérite du texte)
- Stroke-width : 2px
- Position : remplace l'icône ou le texte du bouton

**Spinner section (carte, composant)**

- Type : spinning circle
- Size : 32px
- Color : `#64748B` (gris)
- Position : centré dans le container

#### Skeleton screens

Pour les cartes produits et listes en chargement, utiliser des skeletons animés
au lieu de spinners.

**Skeleton carte produit**

Structure :

```
┌──────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ (image)
│                          │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓          │ (titre)
│ ▓▓▓▓▓▓▓▓▓▓              │ (desc)
│                          │
│ ▓▓▓▓▓      ▓▓▓▓▓▓▓▓▓▓▓ │ (prix + btn)
└──────────────────────────┘
```

- Background : linear-gradient animé
- Couleurs : `#F1F5F9` -> `#E2E8F0` -> `#F1F5F9`
- Animation : shimmer de gauche à droite, 1.5s ease-in-out infinite
- Border-radius : identique aux éléments réels

**Skeleton texte**

- Height : hauteur du texte cible (16px, 18px, etc.)
- Width : variable (70-100% de la largeur)
- Border-radius : 4px
- Background : shimmer

#### Messages de chargement

Pour les opérations longues (> 3 secondes), afficher un message :

- "Chargement des produits..."
- "Validation de la commande..."
- "Connexion à l'assistant..."

Style :

- Font-size : 14px
- Color : `#64748B`
- Position : sous le spinner
- Margin-top : 12px

---

## Partie 4 : Icônes et animations (DEP-0219 à DEP-0227)

### DEP-0219 — Icônes minimales du système

#### Bibliothèque d'icônes

**Source** : Lucide Icons (fork optimisé de Feather Icons)
**Raison** : open source, SVG optimisés, style cohérent, excellente couverture

**Style** : outline (trait), pas de remplissage
**Stroke-width** : 2px (standard), 1.5px (small)

#### Icônes essentielles

**Navigation et interface**

- `menu` : menu burger (3 lignes)
- `x` : fermer, annuler
- `chevron-left` / `chevron-right` : navigation
- `chevron-down` / `chevron-up` : accordéons, dropdowns
- `arrow-left` : retour
- `home` : accueil
- `search` : recherche
- `settings` : paramètres
- `user` : profil utilisateur
- `log-out` : déconnexion

**Panier et commerce**

- `shopping-cart` : panier
- `shopping-bag` : sac (alternatif)
- `plus` : ajouter
- `minus` : retirer
- `trash-2` : supprimer
- `check` : valider
- `x-circle` : annuler
- `credit-card` : paiement (futur)

**Produits et catalogue**

- `package` : produit, colis
- `grid` : vue grille
- `list` : vue liste
- `filter` : filtres
- `tag` : étiquette, catégorie
- `star` : favoris (futur)
- `image` : photo produit

**Communication et assistant**

- `message-circle` : chat, messages
- `mic` : micro, vocal
- `phone` : téléphone
- `send` : envoyer message
- `bot` : assistant IA (custom si besoin)

**États et notifications**

- `bell` : notification
- `alert-circle` : information
- `alert-triangle` : attention, warning
- `check-circle` : succès
- `x-circle` : erreur
- `info` : info
- `help-circle` : aide

**Livraison et commandes**

- `truck` : livraison, livreur
- `map-pin` : adresse, localisation
- `clock` : attente, horaire
- `calendar` : date
- `package-check` : livré
- `package-x` : problème colis

**Autres**

- `eye` : voir, afficher
- `eye-off` : masquer
- `edit` : éditer
- `copy` : copier
- `download` : télécharger
- `upload` : uploader
- `refresh-cw` : recharger
- `external-link` : lien externe

#### Règles d'usage

- Toujours accompagner d'un label textuel (accessibilité)
- Taille standard : 20x20px (boutons medium), 24x24px (boutons large)
- Couleur : hériter de la couleur du texte parent
- Stroke : 2px (standard), ne pas modifier
- Ne jamais distordre (ratio 1:1)

---

### DEP-0220 — Animations minimales du système

#### Principes d'animation

- **Durée** : courte (150-300ms) pour interactions, moyenne (300-500ms) pour transitions
- **Easing** :
  - `ease-out` pour apparitions (décélération)
  - `ease-in` pour disparitions (accélération)
  - `ease-in-out` pour mouvements (fluide)
- **Performance** : préférer `transform` et `opacity` (GPU-accelerated)
- **Respect prefers-reduced-motion** : désactiver animations si demandé

#### Animations globales

**Fade in (apparition)**

```css
opacity: 0 -> 1
duration: 200ms
easing: ease-out
```

Usage : toast, modals, tooltips

**Fade out (disparition)**

```css
opacity: 1 -> 0
duration: 150ms
easing: ease-in
```

Usage : fermeture toast, dismissal

**Slide in (entrée latérale)**

```css
transform: translateX(100%) -> translateX(0)
opacity: 0 -> 1
duration: 250ms
easing: ease-out
```

Usage : drawer, sidebar mobile

**Slide up (entrée bas)**

```css
transform: translateY(20px) -> translateY(0)
opacity: 0 -> 1
duration: 200ms
easing: ease-out
```

Usage : suggestions, dropdowns

**Scale up (agrandissement)**

```css
transform: scale(0.95) -> scale(1)
opacity: 0 -> 1
duration: 150ms
easing: ease-out
```

Usage : modal dialog, popover

**Shake (erreur)**

```css
transform: translateX(0 -> -10px -> 10px -> -10px -> 0)
duration: 400ms
easing: ease-in-out
iterations: 1
```

Usage : erreur validation champ

**Pulse (attention)**

```css
transform: scale(1 -> 1.05 -> 1)
duration: 600ms
easing: ease-in-out
iterations: 2
```

Usage : notification importante, nouvel item

**Skeleton shimmer (chargement)**

```css
background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)
background-size: 200% 100%
animation: shimmer 1.5s ease-in-out infinite
```

---

### DEP-0221 — Animation d'ajout au panier

#### Séquence d'animation

Lorsqu'un produit est ajouté au panier depuis une carte produit :

**Étape 1 : Feedback immédiat sur le bouton (0-150ms)**

- Scale button : 1 -> 0.95 -> 1
- Background : couleur primaire -> couleur active
- Easing : ease-in-out

**Étape 2 : Animation de la miniature (150-500ms)**

- Clone visuel de l'image produit créé
- Position initiale : centre de la carte produit
- Transform :
  - translateX/Y : vers l'icône panier (calcul dynamique)
  - scale : 1 -> 0.3
  - opacity : 1 -> 0 (à 80% du trajet)
- Duration : 350ms
- Easing : ease-in (accélération)
- Courbe : bezier pour effet parabole

**Étape 3 : Feedback panier (450-600ms)**

- Icône panier : scale 1 -> 1.2 -> 1
- Badge quantité : fade in + slide down si nouveau
- Background panier : flash `#10B981` (green) 150ms
- Duration : 150ms
- Easing : ease-out

**Étape 4 : Mise à jour du panier (600ms+)**

- Nouvel item : slide down + fade in dans la liste
- Duration : 200ms
- Stagger : si plusieurs items ajoutés successivement

#### Feedback sonore (optionnel)

- Son : "pop" subtil (< 100ms)
- Volume : bas
- Condition : préférences utilisateur

---

### DEP-0222 — Animation de retrait du panier

#### Séquence d'animation

Lorsqu'un produit est retiré du panier (bouton supprimer ou quantité = 0) :

**Étape 1 : Confirmation visuelle (0-100ms)**

- Item : background fade to `#FEE2E2` (red-100)
- Duration : 100ms

**Étape 2 : Slide out (100-350ms)**

- Transform : translateX(0 -> -100%)
- Opacity : 1 -> 0
- Height : hauteur actuelle -> 0 (collapse)
- Duration : 250ms
- Easing : ease-in

**Étape 3 : Repositionnement des autres items (350-500ms)**

- Items suivants : slide up pour combler l'espace
- Duration : 150ms
- Easing : ease-out

**Étape 4 : Mise à jour des totaux (500-650ms)**

- Total : fade out ancien -> fade in nouveau
- Badge quantité panier : update avec scale pulse
- Duration : 150ms

#### État panier vide

Si dernier item retiré :

- Fade out de la liste (200ms)
- Fade in du message "Panier vide" + illustration (300ms)
- Stagger : 100ms entre les deux

---

### DEP-0223 — Animation d'ouverture des suggestions

#### Séquence d'animation

Lorsque l'assistant affiche des suggestions produits :

**Conteneur suggestions (0-200ms)**

- Height : 0 -> auto
- Opacity : 0 -> 1
- Duration : 200ms
- Easing : ease-out

**Tuiles suggestions (stagger)**

- Chaque tuile apparaît séquentiellement avec :
  - Transform : translateY(10px) -> translateY(0)
  - Opacity : 0 -> 1
  - Duration : 200ms par tuile
  - Easing : ease-out
  - Stagger delay : 50ms entre chaque tuile

**Ordre d'apparition**

- Tuiles de haut en bas
- Max 5 tuiles visibles
- Si > 5, les suivantes apparaissent au scroll

**Icône indicateur**

- Icône "suggestions" dans le chat : pulse 1 fois
- Durée pulse : 300ms

---

### DEP-0224 — Animation de fermeture des suggestions

#### Séquence d'animation

Lorsque les suggestions sont fermées (action utilisateur ou auto-close) :

**Tuiles suggestions (reverse stagger)**

- Chaque tuile disparaît séquentiellement :
  - Transform : translateY(0) -> translateY(-10px)
  - Opacity : 1 -> 0
  - Duration : 150ms par tuile
  - Easing : ease-in
  - Stagger delay : 30ms entre chaque tuile
  - Ordre : bas vers haut (inverse de l'ouverture)

**Conteneur suggestions (après tuiles)**

- Height : auto -> 0
- Opacity : maintenu à 0
- Duration : 100ms
- Easing : ease-in

**Total durée** : ~400ms pour 5 suggestions

---

### DEP-0225 — Animation de changement d'état de commande

#### Séquence d'animation

Lorsque l'état d'une commande change (ex: "Nouvelle" -> "En préparation") :

**Badge d'état**

- Scale : 1 -> 1.15 -> 1
- Background : transition de l'ancienne couleur vers la nouvelle
- Duration : 300ms
- Easing : ease-in-out

**Icône d'état**

- Rotation : 0deg -> 360deg (si icône change)
- Opacity : 1 -> 0 -> 1 (cross-fade)
- Duration : 250ms
- Easing : ease-in-out

**Ligne de statut (stepper horizontal)**

- Barre de progression : width animate jusqu'à la nouvelle étape
- Duration : 400ms
- Easing : ease-out
- Icône de l'étape atteinte : scale pulse + couleur verte

**Notification associée (optionnel)**

- Toast notification avec le nouvel état
- Apparition : slide down + fade in
- Duration : 250ms
- Auto-dismiss : 4 secondes

---

### DEP-0226 — Animation d'alerte nouvelle commande

#### Séquence d'animation (côté dépanneur)

Lorsqu'une nouvelle commande arrive :

**Notification toast (0-300ms)**

- Entrée : slide in right + fade in
- Scale : 0.9 -> 1 (léger bounce)
- Duration : 300ms
- Easing : ease-out

**Icône bell (0-600ms)**

- Shake animation : rotate -15deg -> 15deg -> -10deg -> 10deg -> 0deg
- Duration : 600ms
- Iterations : 2
- Easing : ease-in-out

**Badge nombre de commandes (300-450ms)**

- Scale : 0 -> 1.2 -> 1
- Background : flash `#EF4444` (red)
- Duration : 150ms
- Easing : ease-out

**Bordure notification (pendant toute la durée)**

- Border-color : pulse entre `#2563EB` et `#1D4ED8`
- Duration : 1s
- Iterations : 3

**Son (simultané avec visuel)**

- Notification sonore de 500ms
- Volume : configurable
- Pattern : double-beep

---

### DEP-0227 — Animation d'alerte assignation livreur

#### Séquence d'animation (côté livreur)

Lorsqu'une livraison est assignée au livreur :

**Modal plein écran (0-350ms)**

- Background overlay : opacity 0 -> 0.9
- Modal : scale 0.8 -> 1 + fade in
- Duration : 350ms
- Easing : ease-out

**Icône truck (200-800ms)**

- Entrée : slide in left (mouvement du véhicule)
- Transform : translateX(-100%) -> translateX(0)
- Scale : 0.8 -> 1
- Duration : 400ms
- Bounce finale : scale 1 -> 1.1 -> 1

**Détails commande (stagger)**

- Chaque ligne d'info apparaît séquentiellement :
  - Slide up + fade in
  - Duration : 200ms par ligne
  - Stagger : 80ms
- Lignes : adresse, client, items, instructions

**Boutons d'action (600-800ms)**

- Fade in + slide up
- Duration : 200ms
- Scale : 0.95 -> 1

**Bordure du modal**

- Glow pulse `#10B981` (green)
- Duration : 1.5s
- Iterations : 2

**Feedback haptique (mobile)**

- Vibration pattern : [200ms, 100ms, 200ms]
- Simultané avec animation

**Son (simultané)**

- Notification sonore forte
- Duration : 800ms
- Volume : élevé (livreur en déplacement)

---

## Partie 5 : Spécifications des composants (DEP-0228 à DEP-0239)

### DEP-0228 — Composant bouton principal

#### Spécifications visuelles

**Variantes**

1. **Primary (action principale)**
   - Background : `#2563EB`
   - Text : `#FFFFFF`
   - Border : none
   - Usage : "Commander", "Ajouter au panier", "Valider"

2. **Secondary (action secondaire)**
   - Background : `#FFFFFF`
   - Text : `#2563EB`
   - Border : 2px solid `#2563EB`
   - Usage : "Annuler", "Retour", "Voir plus"

3. **Success (action positive)**
   - Background : `#10B981`
   - Text : `#FFFFFF`
   - Border : none
   - Usage : "Confirmer livraison", "Marquer terminé"

4. **Danger (action destructive)**
   - Background : `#EF4444`
   - Text : `#FFFFFF`
   - Border : none
   - Usage : "Supprimer", "Annuler commande"

**Tailles**

- **Large** : 52px height, 16px font, 14px 28px padding
- **Medium** : 44px height, 15px font, 10px 20px padding
- **Small** : 36px height, 14px font, 8px 16px padding

**États**

- **Default** : couleur de base
- **Hover** :
  - Background : couleur -10% luminosité
  - Shadow : `0 4px 12px rgba(0,0,0,0.1)`
  - Transform : translateY(-1px)
  - Cursor : pointer
- **Active** :
  - Background : couleur -20% luminosité
  - Shadow : `0 2px 4px rgba(0,0,0,0.1)`
  - Transform : translateY(0)
- **Focus** :
  - Outline : 3px solid `#93C5FD`
  - Outline-offset : 2px
- **Disabled** :
  - Opacity : 0.4
  - Cursor : not-allowed
  - Shadow : none
- **Loading** :
  - Spinner centered (16px)
  - Text : fade to 0.6 opacity
  - Cursor : wait

**Anatomie**

```
┌─────────────────────────────┐
│  [Icon] Texte bouton        │
│   20px   16px SemiBold      │
└─────────────────────────────┘
```

- Border-radius : 8px
- Gap icon-text : 8px
- Font-weight : SemiBold (600)
- Transition : all 150ms ease

**Accessibilité**

- Min touch target : 44x44px
- Focus visible : oui
- ARIA : role="button", aria-label si icon-only
- Keyboard : Space/Enter pour activer

---

### DEP-0229 — Composant bouton secondaire

#### Spécifications visuelles

**Style Ghost (transparence)**

- Background : transparent
- Text : `#2563EB` (ou couleur contextuelle)
- Border : 1px solid `#CBD5E1`
- Hover : Background `#F1F5F9`
- Active : Background `#E2E8F0`

**Style Link (lien texte)**

- Background : transparent
- Text : `#2563EB`
- Border : none
- Hover : Text `#1D4ED8`, underline
- Active : Text `#1E40AF`

**Style Icon-only (icône seule)**

- Background : `#F3F4F6`
- Size : 44x44px (touch target)
- Icon : 20x20px, couleur `#64748B`
- Border-radius : 8px
- Hover : Background `#E5E7EB`, Icon `#2563EB`
- Active : Background `#D1D5DB`

**Usage**

- Actions tertiaires non-critiques
- Navigation secondaire
- Outils et utilitaires (fermer, éditer, copier)
- Actions répétées dans une liste

**Accessibilité**

- Si icon-only : aria-label obligatoire
- Tooltip au hover (délai 300ms)
- Focus visible avec outline

---

### DEP-0230 — Composant champ de recherche

#### Spécifications visuelles

**Anatomie**

```
┌────────────────────────────────────────┐
│ [Icon]  Placeholder ou texte     [X]   │
│  🔍     14px Regular              Clear │
└────────────────────────────────────────┘
```

**Dimensions**

- Height : 44px
- Width : 100% du container (max 600px)
- Padding : 12px 40px 12px 44px
- Border-radius : 10px

**Styles**

- Background : `#F8FAFC`
- Border : 1px solid `#E2E8F0`
- Text : 14px Regular, `#0F172A`
- Placeholder : 14px Regular, `#94A3B8`

**Icônes**

- Icône recherche (gauche) : 20x20px, `#64748B`, position absolute left 12px
- Icône clear (droite) : 16x16px, `#94A3B8`, visible seulement si input non vide

**États**

- **Default** : border `#E2E8F0`
- **Hover** : border `#CBD5E1`, background `#FFFFFF`
- **Focus** :
  - Border `#2563EB` (2px)
  - Outline : none (custom border)
  - Background : `#FFFFFF`
  - Shadow : `0 0 0 3px rgba(37,99,235,0.1)`
- **Filled** : bouton clear visible (fade in)
- **Disabled** : opacity 0.5, cursor not-allowed

**Comportement**

- Recherche instantanée (debounce 300ms)
- Affichage résultats : dropdown sous le champ
- Clear : reset + focus maintenu
- Escape : clear + blur

**Accessibilité**

- Label visible ou aria-label
- Role : searchbox
- Aria-autocomplete : list (si dropdown)
- Keyboard : Escape pour clear, Arrows pour résultats

---

### DEP-0231 — Composant carte produit

#### Spécifications complètes

**Dimensions**

- Aspect ratio : 3:4 (image + contenu)
- Min-width : 200px
- Max-width : 280px (grille flexible)
- Padding : 12px
- Border-radius : 12px

**Structure visuelle**

```
┌──────────────────────────┐
│                          │
│   [Image 1:1]            │
│   Badge catégorie        │
│   Badge dispo (si oui)   │
│                          │
├──────────────────────────┤
│ Nom produit (2 lignes)   │
│ Description (1 ligne)    │
│                          │
│ Prix        [+ Panier]   │
│ 18px Bold   36px btn     │
└──────────────────────────┘
```

**Image**

- Ratio : 1:1
- Border-radius : 8px 8px 0 0
- Object-fit : cover
- Background : `#F1F5F9` (loading)
- Lazy loading : oui

**Badges**

- Catégorie : top-left, `#6366F1` bg, 11px uppercase
- Disponibilité : top-right, selon état (vert/orange/rouge)
- Position : absolute sur l'image
- Padding : 4px 8px
- Border-radius : 6px

**Texte**

- Nom : 16px SemiBold, `#0F172A`, 2 lignes max, ellipsis
- Description : 14px Regular, `#64748B`, 1 ligne, ellipsis
- Prix : 18px Bold, `#0F172A`, tabular-nums

**Bouton ajout panier**

- Size : 36px height
- Icon : plus, 16px
- Background : `#2563EB`
- Border-radius : 8px
- Hover : background `#1D4ED8`, scale 1.05
- Position : bottom-right du contenu

**États**

- **Default** : border `#E2E8F0`, shadow none
- **Hover** : border `#CBD5E1`, shadow `0 4px 12px rgba(0,0,0,0.08)`
- **Selected** : border `#2563EB` 2px, shadow `0 4px 16px rgba(37,99,235,0.15)`
- **Unavailable** : opacity 60%, grayscale filter, "Indisponible" badge

**Responsive**

- Desktop : grille 3-4 colonnes
- Tablet : grille 3 colonnes
- Mobile : grille 2 colonnes ou liste verticale

---

### DEP-0232 — Composant miniature panier

#### Spécifications visuelles

**Badge panier (header/nav)**

```
┌────────────┐
│  🛒  (3)   │
│ 24px  12px │
└────────────┘
```

- Icône : shopping-cart, 24x24px, `#0F172A`
- Badge quantité :
  - Size : 18x18px (circle)
  - Background : `#EF4444` (red)
  - Text : 11px Bold, `#FFFFFF`
  - Position : absolute top-right de l'icône, offset -4px
- Hover : scale 1.1 sur l'ensemble

**Bouton panier (mobile, sticky bottom)**

```
┌──────────────────────────────────────┐
│  Voir le panier (3) — Total: 45.00$ │
│  16px SemiBold       18px Bold       │
└──────────────────────────────────────┘
```

- Height : 56px
- Width : calc(100% - 32px), max 600px
- Margin : 0 16px 16px
- Padding : 16px 20px
- Background : `#2563EB`
- Text : `#FFFFFF`
- Border-radius : 12px
- Shadow : `0 8px 24px rgba(37,99,235,0.3)`
- Sticky : bottom 16px, z-index 100

**Animation pulse**

Si nouvel item ajouté :

- Scale : 1 -> 1.15 -> 1
- Duration : 300ms
- Badge : background flash `#10B981` -> `#EF4444`

---

### DEP-0233 — Composant message assistant

#### Spécifications visuelles

**Structure**

```
┌──────────────────────────────┐
│ 🤖 [Avatar]                  │
│    Texte du message          │
│    de l'assistant...         │
│    12:34                     │
└──────────────────────────────┘
```

**Avatar**

- Size : 32x32px
- Background : `#EDE9FE` (violet-100)
- Icon : bot, 20x20px, `#8B5CF6` (violet)
- Border-radius : 50%
- Flex-shrink : 0

**Bubble**

- Background : `#F3F4F6` (gray-100)
- Text : 14px Regular, `#0F172A`
- Padding : 12px 16px
- Border-radius : 12px 12px 12px 4px (pointer en bas-gauche)
- Max-width : 85%
- Line-height : 1.5

**Timestamp**

- Text : 11px Regular, `#64748B`
- Margin-top : 4px
- Align : left

**Typing indicator**

Pendant que l'assistant "tape" :

```
┌──────────────────────────────┐
│ 🤖 [Avatar]                  │
│    ● ● ● (animated)          │
└──────────────────────────────┘
```

- 3 dots animés
- Size : 8px each
- Color : `#94A3B8`
- Animation : bounce, stagger 150ms

**Actions suggérées (boutons rapides)**

Si le message contient des actions suggérées (ex: "Oui" / "Non") :

- Afficher en dessous du message
- Boutons small, secondary style
- Display : flex gap 8px
- Margin-top : 8px

---

### DEP-0234 — Composant message client

#### Spécifications visuelles

**Structure**

```
        ┌──────────────────────┐
        │  Texte du message    │
        │  du client...        │
        │              12:35   │
        └──────────────────────┘
```

**Bubble**

- Background : `#2563EB` (primaire)
- Text : 14px Regular, `#FFFFFF`
- Padding : 12px 16px
- Border-radius : 12px 12px 4px 12px (pointer en bas-droite)
- Max-width : 85%
- Line-height : 1.5
- Align : flex-end (à droite)

**Timestamp**

- Text : 11px Regular, `#BFDBFE` (blue-200)
- Margin-top : 4px
- Align : right

**États d'envoi**

Icons en bas à droite du timestamp :

- **Sending** : single checkmark, gray
- **Sent** : double checkmark, gray
- **Read** : double checkmark, blue (si implémenté)
- Size : 12x12px

**Erreur d'envoi**

Si échec :

- Border : 1px solid `#FCA5A5` (red-300)
- Background : `#FEE2E2` (red-100)
- Text : `#7F1D1D` (red-900)
- Icon : alert-circle, red
- Action : "Réessayer" link en dessous

---

### DEP-0235 — Composant tuile suggestion

#### Spécifications visuelles

**Structure**

```
┌────────────────────────────────────┐
│ [Img] Nom produit          [+]     │
│ 40px  Description courte   32px    │
└────────────────────────────────────┘
```

**Dimensions**

- Height : 60px
- Width : 100%
- Padding : 8px 12px
- Border-radius : 10px

**Styles**

- Background : `#F8FAFC`
- Border : 1px solid `#E2E8F0`
- Hover : background `#EFF6FF`, border `#93C5FD`
- Active : background `#DBEAFE`
- Cursor : pointer

**Image**

- Size : 40x40px
- Border-radius : 6px
- Object-fit : cover
- Flex-shrink : 0

**Texte**

- Nom : 14px SemiBold, `#0F172A`, 1 ligne, ellipsis
- Description : 12px Regular, `#64748B`, 1 ligne, ellipsis
- Display : flex column, gap 2px
- Flex : 1 (take available space)

**Bouton ajout**

- Size : 32x32px
- Icon : plus, 16px
- Background : `#2563EB`
- Text : `#FFFFFF`
- Border-radius : 6px
- Hover : background `#1D4ED8`, scale 1.05
- Flex-shrink : 0

**Animation**

- Apparition : slide up + fade in, stagger 50ms
- Click : scale 0.98 sur toute la tuile

---

### DEP-0236 — Composant indicateur d'état de livraison

#### Spécifications visuelles (stepper horizontal)

**Structure**

```
┌───────────────────────────────────────────────────┐
│  ●───────●───────●───────○───────○                │
│ Reçue  Prép.  Prête  Livr.  Livrée               │
│ 12:00  12:15  12:40   --      --                  │
└───────────────────────────────────────────────────┘
```

**Anatomie**

- Étapes : 5 (nouvelle, préparation, prête, en livraison, livrée)
- Cercles (nodes) : 32px diameter
- Ligne de connexion : 2px height, entre les cercles
- Espacement : équidistant

**Styles des cercles**

- **Complétée** :
  - Background : `#10B981` (green)
  - Icon : checkmark, 16px, white
  - Border : none

- **Active** :
  - Background : `#2563EB` (blue)
  - Icon : selon étape, 16px, white
  - Border : none
  - Pulse animation

- **À venir** :
  - Background : `#F1F5F9` (gray-light)
  - Border : 2px solid `#CBD5E1`
  - No icon

**Ligne de connexion**

- **Complétée** : background `#10B981`
- **En cours** : gradient `#10B981` -> `#CBD5E1`
- **À venir** : background `#E2E8F0`

**Labels**

- Nom étape : 12px Medium, `#0F172A`, centré sous le cercle
- Timestamp : 11px Regular, `#64748B`, centré sous le nom

**Responsive mobile**

- Version verticale (liste)
- Cercles à gauche, textes à droite
- Ligne verticale entre les cercles

---

### DEP-0237 — Composant carte dernière commande

#### Spécifications visuelles

**Structure**

```
┌──────────────────────────────────────┐
│ Votre dernière commande              │
│ 16 mars 2024 — 3 articles            │
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

**Dimensions**

- Width : 100% (max 400px)
- Padding : 20px
- Border-radius : 12px
- Border : 1px solid `#E2E8F0`
- Background : `#FFFFFF`

**Header**

- Titre : 16px SemiBold, `#0F172A`
- Meta : 13px Regular, `#64748B`
- Margin-bottom : 16px

**Liste produits**

- Item : flex row, justify space-between
- Nom : 14px Regular, `#0F172A`
- Quantité : 14px Regular, `#64748B`
- Prix : 14px Medium, `#0F172A`, tabular-nums
- Gap : 8px entre items

**Total**

- Border-top : 1px solid `#E2E8F0`
- Padding-top : 12px
- Margin-top : 12px
- Text : 16px Bold, `#0F172A`
- Align : right

**Bouton action**

- Style : secondary
- Width : 100%
- Margin-top : 16px
- Text : "Recommander cette commande"

---

### DEP-0238 — Composant carte top 10

#### Spécifications visuelles

**Structure**

```
┌──────────────────────────────────────┐
│ Top 10 des produits populaires       │
│                                      │
│ 1  [Img] Nom produit      [+ Panier]│
│    40px  14px SemiBold    32px      │
│                                      │
│ 2  [Img] Nom produit      [+ Panier]│
│ ...                                  │
│ 10 [Img] Nom produit      [+ Panier]│
└──────────────────────────────────────┘
```

**Dimensions**

- Width : 100% (max 400px)
- Padding : 20px
- Border-radius : 12px
- Border : 1px solid `#E2E8F0`
- Background : `#FFFFFF`

**Header**

- Titre : 16px SemiBold, `#0F172A`
- Margin-bottom : 16px

**Item du top 10**

```
┌────────────────────────────────────┐
│ #1 [Img] Nom du produit       [+] │
│ 18px 40px 14px SemiBold       32px│
└────────────────────────────────────┘
```

- Height : 56px
- Padding : 8px 0
- Border-bottom : 1px solid `#F1F5F9` (sauf dernier)
- Hover : background `#F8FAFC`

**Numéro de rang**

- Size : 18px Bold
- Color : gradient `#2563EB` (top 3), `#64748B` (autres)
- Width : 24px
- Align : center

**Image**

- Size : 40x40px
- Border-radius : 6px
- Object-fit : cover

**Nom**

- Text : 14px SemiBold, `#0F172A`
- Flex : 1
- Line-clamp : 1

**Bouton ajout**

- Size : 32x32px
- Style : identique à tuile suggestion

---

### DEP-0239 — Composant modal de confirmation

#### Spécifications visuelles

**Overlay**

- Background : `rgba(0, 0, 0, 0.5)`
- Backdrop-filter : blur(4px)
- Z-index : 9999
- Cursor : pointer (ferme au clic)

**Modal dialog**

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

**Dimensions**

- Width : 90vw, max 440px
- Padding : 24px
- Border-radius : 16px
- Background : `#FFFFFF`
- Shadow : `0 20px 60px rgba(0,0,0,0.3)`

**Icône (optionnelle)**

- Size : 48x48px
- Background : selon type (info: blue-100, warning: amber-100, danger: red-100)
- Icon : 24x24px, couleur assortie
- Border-radius : 50%
- Margin-bottom : 16px

**Titre**

- Text : 18px SemiBold, `#0F172A`
- Margin-bottom : 8px

**Message**

- Text : 14px Regular, `#334155`
- Line-height : 1.5
- Margin-bottom : 24px

**Actions**

- Display : flex gap 12px
- Justify : flex-end (ou center selon context)
- Bouton annuler : secondary style
- Bouton confirmer : primary (ou danger si destructive)

**Animation**

- Entrée : scale 0.95 -> 1, fade in, duration 200ms
- Sortie : scale 1 -> 0.95, fade out, duration 150ms
- Overlay : fade in/out

**Accessibilité**

- Role : dialog
- Aria-modal : true
- Aria-labelledby : id du titre
- Focus trap : oui
- Escape : ferme la modal
- Focus initial : bouton primaire

---

### DEP-0240 — Faire valider le système visuel de base avant de coder plus loin

#### Checkpoint de validation

**Objectif**

Avant de passer à l'implémentation en code, ce document de design system doit être
validé par les parties prenantes (product owner, développeurs, designers).

**Points de validation**

1. **Cohérence de la palette de couleurs**
   - Les couleurs principales, secondaires, d'état et d'accessibilité sont-elles cohérentes ?
   - Les contrastes respectent-ils les normes WCAG 2.1 AA (minimum) et AAA (idéal) ?
   - Les couleurs sont-elles adaptées à la marque et au public cible ?

2. **Typographie et lisibilité**
   - Les échelles typographiques sont-elles suffisantes pour tous les contextes ?
   - Les tailles de texte sont-elles lisibles sur tous les supports (desktop, mobile) ?
   - Les graisses de police choisies sont-elles disponibles et optimisées ?

3. **Styles des composants**
   - Les composants définis couvrent-ils tous les besoins identifiés dans DEP-0181-0200 ?
   - Les états (hover, active, disabled, loading) sont-ils complets ?
   - Les dimensions et espacements sont-ils cohérents ?

4. **Animations et feedback**
   - Les animations sont-elles subtiles et performantes ?
   - Les durées et easings sont-ils appropriés ?
   - Le respect de `prefers-reduced-motion` est-il garanti ?

5. **Accessibilité**
   - Tous les composants ont-ils des alternatives textuelles (aria-labels) ?
   - Les zones de tap sont-elles suffisantes (min 44x44px) ?
   - Le mode contraste élevé est-il fonctionnel ?
   - La navigation au clavier est-elle possible partout ?

**Checklist de validation**

- [ ] Palette de couleurs approuvée (primaire, secondaire, états, accessibilité)
- [ ] Typographie approuvée (Inter + JetBrains Mono, échelles complètes)
- [ ] Styles visuels des 10 composants principaux validés
- [ ] Icônes minimales identifiées (Lucide Icons)
- [ ] 7 animations clés définies et approuvées
- [ ] 12 spécifications de composants complètes et validées
- [ ] Tests de contraste WCAG effectués et validés
- [ ] Responsive design validé (desktop, tablet, mobile)
- [ ] Cohérence avec les décisions UX de DEP-0181-0200 confirmée
- [ ] Accord écrit ou verbal des parties prenantes obtenu

**Prochaines étapes après validation**

Une fois ce document validé :

1. Créer les tokens de design (variables CSS/SCSS)
2. Implémenter les composants de base dans le code
3. Construire une bibliothèque de composants (Storybook ou similaire)
4. Tester l'accessibilité avec des outils automatisés et des tests utilisateurs
5. Documenter les patterns d'usage pour les développeurs

**Note importante**

Toute modification majeure de ce système visuel après validation devra être
documentée dans un nouveau document de décision (ex: DEP-0XXX-visual-system-update.md)
pour tracer l'évolution et éviter les incohérences.

---

## Résumé et couverture

Ce document définit **l'intégralité du système visuel de base** pour l'application
depaneurIA V1, couvrant les 40 tâches de DEP-0201 à DEP-0240 :

**Couleurs (4)** : principale, secondaire, états, accessibilité
**Typographie (6)** : principale, secondaire, titres, corps, boutons, cartes produits
**Styles composants (8)** : cartes produits, panier, chat, suggestions, badges, alertes (x2), chargement
**Icônes et animations (9)** : icônes minimales, animations système, animations spécifiques (x7)
**Composants (12)** : boutons (x2), recherche, carte produit, miniature panier, messages (x2), suggestion, indicateur livraison, cartes (x2), modal
**Validation (1)** : checkpoint avant implémentation

**Total : 40 tâches documentées**

Le système est conçu pour être :

- **Cohérent** : toutes les décisions visuelles suivent les mêmes principes
- **Accessible** : WCAG 2.1 AA minimum, mode contraste élevé, keyboard navigation
- **Performant** : animations GPU-accelerated, respect de prefers-reduced-motion
- **Évolutif** : tokens et composants permettent des variations futures
- **Documenté** : chaque décision est explicite et justifiée

Ce document constitue la **référence unique** pour l'implémentation du design system
et doit être maintenu à jour au fil de l'évolution du projet.
