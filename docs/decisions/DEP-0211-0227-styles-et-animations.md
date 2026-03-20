# DEP-0211 à DEP-0227 — Styles visuels et animations

## Périmètre

Ce document définit uniquement les **styles visuels des composants clés** (DEP-0211 à DEP-0218),
les **icônes minimales du système** (DEP-0219), et les **animations minimales** (DEP-0220 à DEP-0227)
pour l'application depaneurIA.

Ces spécifications constituent la référence visuelle et cinématique avant l'implémentation en code.

**Note** : Ce document extrait les sections DEP-0211 à DEP-0227 du système visuel complet
documenté dans `DEP-0201-DEP-0240-visual-design-system.md`.

---

## Partie 1 : Styles visuels des composants (DEP-0211 à DEP-0218)

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

## Partie 2 : Icônes et animations (DEP-0219 à DEP-0227)

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

## Résumé du langage visuel et des animations

### Langage visuel

Le système visuel de depaneurIA repose sur des principes de **clarté**, **efficacité** et **accessibilité** :

**Composants clés** :

- **Cartes produits** : design épuré avec images carrées, badges de disponibilité et actions rapides
- **Panier** : interface sticky verticale avec contrôles de quantité intuitifs et résumé permanent
- **Chat assistant** : bulles de conversation distinguées (bleu pour client, gris pour assistant) avec zone de saisie claire
- **Suggestions** : tuiles compactes permettant l'ajout rapide de produits recommandés
- **Badges d'état** : codes couleur cohérents pour chaque étape du cycle de commande
- **Alertes** : notifications toast pour les événements normaux, modaux pour les actions critiques
- **Écrans de chargement** : spinners pour actions courtes, skeletons shimmer pour chargements de contenu

**Palette et états** :

- Bleu (`#2563EB`) : actions principales et interface
- Vert (`#10B981`) : succès, disponibilité, confirmations
- Orange (`#F59E0B`) : alertes et avertissements
- Rouge (`#EF4444`) : erreurs et actions destructives
- États visuels distincts : default, hover, focus, active, disabled

### Animations

Le système d'animations privilégie la **réactivité perçue** et le **feedback immédiat** :

**Principes** :

- Durées courtes (150-300ms) pour maintenir la fluidité
- GPU-accelerated (`transform` et `opacity`) pour les performances
- Respect de `prefers-reduced-motion` pour l'accessibilité

**Animations critiques** :

1. **Ajout au panier** : séquence complète en 4 étapes avec vol de miniature (600ms total)
2. **Retrait du panier** : feedback négatif suivi d'un collapse fluide (650ms)
3. **Suggestions** : apparition/fermeture avec stagger pour guider l'œil (200-400ms)
4. **Changements d'état** : transitions visuelles claires avec pulse et rotation (250-400ms)
5. **Alertes dépanneur** : notifications shake + pulse pour attirer l'attention (600ms)
6. **Alertes livreur** : modal full-screen avec stagger + vibration pour garantir la visibilité (800ms)

**Philosophie** :

- Les animations communiquent l'état du système (chargement, succès, erreur)
- Chaque mouvement a un but fonctionnel, pas uniquement décoratif
- Les feedbacks visuels et tactiles renforcent la confiance de l'utilisateur
- Les micro-interactions réduisent la perception d'attente

---

**Date de création** : 2026-03-13
**Statut** : Spécification de référence pour implémentation
**Prochaine étape** : Validation avant passage au code (DEP-0240)
