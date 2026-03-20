# DEP-0256 à DEP-0270 — Conventions de contenu et médias du catalogue

## Périmètre

Ce document définit uniquement les **conventions de structure et de contenu** pour les données catalogue de depaneurIA V1 :

- Structures de données pour unités, images et ordres d'affichage (DEP-0256 à DEP-0260)
- Conventions techniques pour les images produits (DEP-0261 à DEP-0265)
- Conventions éditoriales pour les textes et mots-clés (DEP-0266 à DEP-0270)

Ces spécifications constituent la référence pour la gestion du catalogue produit avant l'implémentation en code.

---

## Partie 1 : Structures de données (DEP-0256 à DEP-0260)

### DEP-0256 — Structure d'une unité de vente

Une unité de vente définit le format commercial d'un produit (ex: canette 355ml, bouteille 2L, paquet de 6).

#### Champs requis

| Champ        | Type    | Description               | Exemple                |
| ------------ | ------- | ------------------------- | ---------------------- |
| `unit_type`  | string  | Type d'unité (enum)       | `"unit"`, `"pack"`     |
| `quantity`   | number  | Quantité dans l'unité     | `1`, `6`, `12`         |
| `volume`     | number? | Volume en ml (si liquide) | `355`, `2000`          |
| `weight`     | number? | Poids en g (si solide)    | `250`, `500`           |
| `unit_label` | string  | Étiquette affichée        | `"355ml"`, `"6x355ml"` |

#### Types d'unités supportés

- `"unit"` : unité individuelle (canette, bouteille, sac)
- `"pack"` : paquet multiple (6-pack, 12-pack)
- `"box"` : boîte/carton (format familial)
- `"bulk"` : vrac (kg, lb)

#### Règles de validation

- Une unité doit avoir soit `volume`, soit `weight`, soit les deux
- Le `unit_label` doit être unique par produit
- Pour les packs, `quantity` représente le nombre d'unités contenues
- Les unités vrac utilisent `weight` avec une valeur de référence (ex: 100g)

#### Exemple JSON

```json
{
  "unit_type": "unit",
  "quantity": 1,
  "volume": 355,
  "unit_label": "355ml"
}
```

```json
{
  "unit_type": "pack",
  "quantity": 6,
  "volume": 355,
  "unit_label": "6x355ml"
}
```

---

### DEP-0257 — Structure d'une image principale produit

L'image principale est l'image par défaut affichée dans les cartes produits et les listes.

#### Champs requis

| Champ        | Type    | Description                      | Exemple                             |
| ------------ | ------- | -------------------------------- | ----------------------------------- |
| `url`        | string  | URL de l'image (CDN/storage)     | `"https://cdn.../product-123.webp"` |
| `alt_text`   | string  | Texte alternatif (accessibilité) | `"Coca-Cola canette 355ml"`         |
| `width`      | number  | Largeur en pixels                | `800`                               |
| `height`     | number  | Hauteur en pixels                | `800`                               |
| `format`     | string  | Format du fichier                | `"webp"`, `"jpg"`                   |
| `file_size`  | number  | Taille du fichier en octets      | `45000`                             |
| `is_primary` | boolean | Indicateur d'image principale    | `true`                              |

#### Champs optionnels

| Champ           | Type     | Description                         | Exemple                                    |
| --------------- | -------- | ----------------------------------- | ------------------------------------------ |
| `thumbnail_url` | string   | URL de la vignette (150×150)        | `"https://cdn.../product-123-thumb.webp"`  |
| `medium_url`    | string   | URL de la version moyenne (400×400) | `"https://cdn.../product-123-medium.webp"` |
| `blurhash`      | string   | BlurHash pour chargement progressif | `"LEHV6nWB2yk8pyo0adR*.7kCMdnj"`           |
| `uploaded_at`   | datetime | Date de téléversement               | `"2026-03-13T10:30:00Z"`                   |

#### Règles

- Une seule image par produit peut avoir `is_primary: true`
- Le ratio doit être 1:1 (carré) pour l'uniformité dans les grilles
- Les URLs doivent pointer vers des images optimisées CDN
- L'`alt_text` doit décrire le produit de manière claire (accessibilité)

#### Exemple JSON

```json
{
  "url": "https://cdn.depanneur.app/products/coca-cola-355ml-full.webp",
  "alt_text": "Coca-Cola canette 355ml",
  "width": 800,
  "height": 800,
  "format": "webp",
  "file_size": 42500,
  "is_primary": true,
  "thumbnail_url": "https://cdn.depanneur.app/products/coca-cola-355ml-thumb.webp",
  "medium_url": "https://cdn.depanneur.app/products/coca-cola-355ml-medium.webp",
  "blurhash": "LEHV6nWB2yk8pyo0adR*.7kCMdnj"
}
```

---

### DEP-0258 — Structure d'images secondaires produit

Les images secondaires permettent d'afficher le produit sous différents angles ou contextes.

#### Champs requis

| Champ           | Type    | Description                       | Exemple                                  |
| --------------- | ------- | --------------------------------- | ---------------------------------------- |
| `url`           | string  | URL de l'image                    | `"https://cdn.../product-123-alt1.webp"` |
| `alt_text`      | string  | Texte alternatif descriptif       | `"Coca-Cola canette - vue arrière"`      |
| `width`         | number  | Largeur en pixels                 | `800`                                    |
| `height`        | number  | Hauteur en pixels                 | `800`                                    |
| `format`        | string  | Format du fichier                 | `"webp"`, `"jpg"`                        |
| `display_order` | number  | Ordre d'affichage (0-indexed)     | `0`, `1`, `2`                            |
| `is_primary`    | boolean | Toujours `false` pour secondaires | `false`                                  |

#### Champs optionnels

| Champ           | Type   | Description             | Exemple                                        |
| --------------- | ------ | ----------------------- | ---------------------------------------------- |
| `image_type`    | string | Type d'image (contexte) | `"detail"`, `"context"`, `"packaging"`         |
| `thumbnail_url` | string | URL de la vignette      | `"https://cdn.../product-123-alt1-thumb.webp"` |

#### Règles

- Maximum 4 images secondaires par produit (5 images au total avec la principale)
- Le `display_order` détermine l'ordre dans les galeries (0 = première après l'image principale)
- Toutes les images secondaires doivent avoir `is_primary: false`
- Le ratio 1:1 est recommandé mais pas obligatoire pour les secondaires
- Les `image_type` aident à catégoriser : `"detail"` (zoom), `"context"` (produit en situation), `"packaging"` (emballage)

#### Exemple JSON

```json
[
  {
    "url": "https://cdn.depanneur.app/products/coca-cola-355ml-back.webp",
    "alt_text": "Coca-Cola canette 355ml - informations nutritionnelles",
    "width": 800,
    "height": 800,
    "format": "webp",
    "display_order": 0,
    "is_primary": false,
    "image_type": "packaging"
  },
  {
    "url": "https://cdn.depanneur.app/products/coca-cola-355ml-context.webp",
    "alt_text": "Coca-Cola canette 355ml servie avec glaçons",
    "width": 800,
    "height": 600,
    "format": "webp",
    "display_order": 1,
    "is_primary": false,
    "image_type": "context"
  }
]
```

---

### DEP-0259 — Structure de l'ordre d'affichage des catégories

L'ordre des catégories détermine leur position dans la navigation et les listes.

#### Champs requis

| Champ           | Type    | Description                                  | Exemple          |
| --------------- | ------- | -------------------------------------------- | ---------------- |
| `category_id`   | string  | Identifiant unique de la catégorie           | `"cat-boissons"` |
| `display_order` | number  | Position d'affichage (0-indexed)             | `0`, `1`, `2`    |
| `is_visible`    | boolean | Visibilité dans la navigation                | `true`, `false`  |
| `parent_id`     | string? | ID de la catégorie parente (sous-catégories) | `"cat-boissons"` |

#### Champs optionnels

| Champ         | Type    | Description                              | Exemple               |
| ------------- | ------- | ---------------------------------------- | --------------------- |
| `is_featured` | boolean | Catégorie mise en avant (page d'accueil) | `true`, `false`       |
| `icon`        | string  | Icône associée (nom Lucide)              | `"coffee"`, `"candy"` |
| `color`       | string  | Couleur d'accent (hex)                   | `"#6366F1"`           |

#### Règles

- Le `display_order` est global et détermine l'ordre dans toutes les interfaces
- Les catégories avec `is_visible: false` n'apparaissent pas dans la navigation publique mais restent accessibles par lien direct
- Les catégories `is_featured: true` apparaissent sur la page d'accueil
- Pour les sous-catégories, le `parent_id` doit pointer vers une catégorie parente valide
- Deux catégories au même niveau ne peuvent pas avoir le même `display_order`

#### Exemple JSON

```json
[
  {
    "category_id": "cat-boissons",
    "display_order": 0,
    "is_visible": true,
    "parent_id": null,
    "is_featured": true,
    "icon": "coffee",
    "color": "#6366F1"
  },
  {
    "category_id": "cat-boissons-gazeuses",
    "display_order": 0,
    "is_visible": true,
    "parent_id": "cat-boissons",
    "is_featured": false
  },
  {
    "category_id": "cat-collations",
    "display_order": 1,
    "is_visible": true,
    "parent_id": null,
    "is_featured": true,
    "icon": "candy",
    "color": "#EC4899"
  }
]
```

---

### DEP-0260 — Structure de l'ordre d'affichage des produits

L'ordre des produits détermine leur position dans les listes et grilles au sein d'une catégorie.

#### Champs requis

| Champ           | Type    | Description                                        | Exemple                   |
| --------------- | ------- | -------------------------------------------------- | ------------------------- |
| `product_id`    | string  | Identifiant unique du produit                      | `"prod-coca-355"`         |
| `category_id`   | string  | Catégorie d'appartenance                           | `"cat-boissons-gazeuses"` |
| `display_order` | number  | Position d'affichage dans la catégorie (0-indexed) | `0`, `1`, `2`             |
| `is_visible`    | boolean | Visibilité dans la catégorie                       | `true`, `false`           |

#### Champs optionnels

| Champ             | Type    | Description                                 | Exemple         |
| ----------------- | ------- | ------------------------------------------- | --------------- |
| `is_featured`     | boolean | Produit vedette (affiché en premier)        | `true`, `false` |
| `is_popular`      | boolean | Produit populaire (badge)                   | `true`, `false` |
| `boost_score`     | number  | Score de boost pour le tri dynamique        | `0` à `100`     |
| `pinned_position` | number? | Position épinglée (force une position fixe) | `0`, `1`, `2`   |

#### Règles de tri

L'ordre final d'affichage des produits suit cette priorité :

1. **Produits épinglés** (`pinned_position !== null`) : affichés à leur position exacte
2. **Produits vedettes** (`is_featured: true`) : affichés avant les autres
3. **Produits populaires** (`is_popular: true`) : affichés ensuite
4. **Tri par `display_order`** : ordre défini manuellement
5. **Tri par `boost_score`** : score dynamique (facultatif)
6. **Tri alphabétique** : par défaut si égalité

#### Règles de visibilité

- Les produits avec `is_visible: false` n'apparaissent pas dans les listes publiques
- Ils restent accessibles par lien direct ou recherche (si disponibles)
- Un produit peut appartenir à plusieurs catégories avec des `display_order` différents

#### Exemple JSON

```json
[
  {
    "product_id": "prod-coca-355",
    "category_id": "cat-boissons-gazeuses",
    "display_order": 0,
    "is_visible": true,
    "is_featured": true,
    "is_popular": true,
    "boost_score": 95,
    "pinned_position": null
  },
  {
    "product_id": "prod-pepsi-355",
    "category_id": "cat-boissons-gazeuses",
    "display_order": 1,
    "is_visible": true,
    "is_featured": false,
    "is_popular": true,
    "boost_score": 88
  },
  {
    "product_id": "prod-sprite-355",
    "category_id": "cat-boissons-gazeuses",
    "display_order": 2,
    "is_visible": true,
    "is_featured": false,
    "is_popular": false,
    "boost_score": 75,
    "pinned_position": 5
  }
]
```

---

## Partie 2 : Conventions techniques des images (DEP-0261 à DEP-0265)

### DEP-0261 — Convention de taille des images produits

#### Tailles standardisées

| Nom      | Dimensions  | Poids max | Usage                               |
| -------- | ----------- | --------- | ----------------------------------- |
| `thumb`  | 150×150px   | 15 KB     | Miniatures panier, listes compactes |
| `medium` | 400×400px   | 60 KB     | Cartes produits, suggestions        |
| `full`   | 800×800px   | 150 KB    | Détail produit, zoom                |
| `hero`   | 1200×1200px | 250 KB    | Bannières, promotions (optionnel)   |

#### Règles de génération

- **Ratio** : 1:1 (carré) pour toutes les tailles principales
- **Format source** : minimum 800×800px en haute qualité
- **Génération automatique** : les tailles `thumb` et `medium` sont générées automatiquement depuis `full`
- **Responsive** : utiliser `srcset` avec les différentes tailles pour l'optimisation
- **Chargement progressif** : utiliser BlurHash ou LQIP (Low Quality Image Placeholder)

#### Formats supportés

- **Priorité 1** : WebP (meilleur ratio qualité/taille)
- **Fallback** : JPEG (compatibilité navigateurs anciens)
- **Éviter** : PNG (sauf si transparence nécessaire, rare pour produits alimentaires)

#### Exemples de noms de fichiers

```
product-coca-cola-355ml-thumb.webp    (150×150, ~12 KB)
product-coca-cola-355ml-medium.webp   (400×400, ~45 KB)
product-coca-cola-355ml-full.webp     (800×800, ~120 KB)
```

---

### DEP-0262 — Convention de nommage des images produits

#### Format standardisé

```
<type>-<slug-produit>-<variante>-<taille>.<extension>
```

#### Composants du nom

| Composant      | Description                        | Exemple                   |
| -------------- | ---------------------------------- | ------------------------- |
| `type`         | Type de média (toujours `product`) | `product`                 |
| `slug-produit` | Slug kebab-case du produit         | `coca-cola`               |
| `variante`     | Unité/format du produit            | `355ml`, `2l`, `6pack`    |
| `taille`       | Taille de l'image                  | `thumb`, `medium`, `full` |
| `extension`    | Format de fichier                  | `webp`, `jpg`             |

#### Règles

- Utiliser **kebab-case** pour tous les composants
- Pas d'espaces, pas d'accents, pas de caractères spéciaux
- Le slug-produit doit être dérivé du nom officiel du produit
- La variante indique l'unité ou le format spécifique
- Toujours en minuscules

#### Images secondaires

Pour les images secondaires, ajouter un suffixe descriptif :

```
product-coca-cola-355ml-back-medium.webp         (vue arrière)
product-coca-cola-355ml-context-medium.webp      (produit en situation)
product-coca-cola-355ml-ingredients-full.webp    (tableau nutritionnel)
```

#### Exemples valides

```
product-coca-cola-355ml-thumb.webp
product-coca-cola-355ml-medium.webp
product-coca-cola-355ml-full.webp
product-coca-cola-2l-thumb.webp
product-pepsi-355ml-6pack-medium.webp
product-lays-chips-ketchup-255g-full.webp
```

#### Exemples invalides

```
❌ Product_Coca_Cola_355ml.jpg          (underscores, PascalCase)
❌ coca-cola-can.webp                   (manque type et taille)
❌ product-coca cola-355ml-full.webp    (espaces)
❌ product-coca-cola-355ML-full.webp    (majuscules dans variante)
```

---

### DEP-0263 — Convention de compression des images produits

#### Paramètres de compression WebP

| Taille   | Qualité WebP | Poids cible | Poids max |
| -------- | ------------ | ----------- | --------- |
| `thumb`  | 75%          | 10 KB       | 15 KB     |
| `medium` | 80%          | 40 KB       | 60 KB     |
| `full`   | 85%          | 100 KB      | 150 KB    |
| `hero`   | 90%          | 180 KB      | 250 KB    |

#### Paramètres de compression JPEG (fallback)

| Taille   | Qualité JPEG | Poids cible | Poids max |
| -------- | ------------ | ----------- | --------- |
| `thumb`  | 70%          | 15 KB       | 20 KB     |
| `medium` | 75%          | 50 KB       | 80 KB     |
| `full`   | 80%          | 120 KB      | 180 KB    |

#### Outils recommandés

- **Automatique** : Sharp (Node.js), ImageMagick, Cloudflare Images
- **Manuel** : Squoosh.app, TinyPNG
- **Batch** : Scripts de traitement par lots avec Sharp

#### Optimisations additionnelles

- **Métadonnées** : supprimer les métadonnées EXIF (sauf copyright si nécessaire)
- **Profil colorimétrique** : sRGB pour la compatibilité web
- **Chroma subsampling** : 4:2:0 pour JPEG (réduit la taille sans perte visible)
- **Progressive JPEG** : activer pour meilleur rendu progressif
- **WebP lossless** : seulement pour images avec texte ou graphiques nets

#### Validation qualité

- **Contrôle visuel** : toujours vérifier visuellement après compression
- **Métriques** : SSIM (Structural Similarity Index) > 0.95 souhaité
- **Tests** : vérifier sur écrans Retina et écrans standards
- **Accessibilité** : s'assurer que les produits restent reconnaissables après compression

---

### DEP-0264 — Convention de recadrage des images produits

#### Règles de cadrage

1. **Centrage du produit**
   - Le produit doit occuper 70-85% de la surface de l'image
   - Centré horizontalement et verticalement
   - Espace respiration uniforme sur les 4 côtés

2. **Orientation**
   - Produit face à la caméra (étiquette lisible)
   - Vertical pour bouteilles/canettes
   - Horizontal pour emballages/sachets larges
   - Angle léger (10-15°) acceptable pour dynamisme

3. **Zones de sécurité**
   - Marge minimale de 5% sur chaque bord
   - Aucune partie du produit coupée (sauf si volontaire pour contexte)
   - Étiquettes et textes importants entièrement visibles

#### Recadrage automatique

Pour les images sources non-carrées, appliquer un recadrage intelligent :

- **Detect subject** : utiliser la détection d'objet pour identifier le produit principal
- **Smart crop** : centrer sur le produit détecté
- **Fallback** : crop centré si détection échoue

#### Cas spéciaux

**Produits multiples (packs)** :

- Afficher l'ensemble du pack clairement
- Privilégier une vue d'ensemble plutôt qu'un zoom sur une unité

**Produits avec emballage transparent** :

- Montrer le contenu visible à travers l'emballage
- Équilibre entre emballage et contenu

**Produits sans emballage (vrac)** :

- Utiliser un contenant neutre standardisé
- Fond uni pour mettre en valeur le produit

#### Outils

- **Automatique** : Cloudinary (smart crop), Imgix (focal point)
- **Manuel** : Photoshop, GIMP, Figma
- **Batch** : Scripts avec Sharp + face/object detection

---

### DEP-0265 — Convention de fond visuel des images produits

#### Fond standard : blanc pur

**Couleur recommandée** : `#FFFFFF` (blanc pur)

**Avantages** :

- Uniformité visuelle dans les grilles
- Contraste maximal avec l'interface
- Facilite la découpe du produit (masking)
- Standard e-commerce reconnu

**Application** :

- Utilisé pour 90% des images produits
- Obligatoire pour les images `thumb` et `medium`
- Recommandé pour `full` sauf exception

#### Fonds alternatifs autorisés

**1. Fond de contexte (images secondaires uniquement)**

- Usage : montrer le produit en situation réelle
- Exemples : boisson servie, snack sur une table
- Restriction : seulement pour images `context` secondaires
- Qualité : fond non distrayant, produit toujours l'élément principal

**2. Fond légèrement coloré (cas exceptionnels)**

- Usage : différenciation visuelle pour catégories premium
- Couleurs autorisées : nuances très claires (`#F8F9FA`, `#F0F9FF`)
- Restriction : doit être validé par le tenant (cohérence marque)
- Limite : < 10% des produits d'un catalogue

**3. Ombres et reflets**

- Ombre portée légère : autorisée si subtile et naturelle
- Reflet : autorisé si améliore la présentation sans distraire
- Règle : ne jamais obscurcir le produit ou créer de confusion

#### Fonds interdits

❌ **Motifs ou textures** : distraient de l'essentiel
❌ **Dégradés prononcés** : rompent l'uniformité
❌ **Fonds foncés** : mauvais contraste avec interface
❌ **Décors complexes** : sauf images de contexte secondaires
❌ **Transparence (PNG alpha)** : problèmes de rendu selon navigateurs

#### Traitement du fond

**Suppression du fond (détourage)** :

- Utiliser des outils automatiques (remove.bg, Photoshop Magic Eraser)
- Affiner manuellement si nécessaire (cheveux, surfaces réfléchissantes)
- Antialiasing doux sur les contours
- Sauvegarder en WebP ou JPEG avec fond blanc (pas PNG transparent)

**Cohérence par catégorie** :

- Tous les produits d'une même catégorie doivent avoir le même type de fond
- Si un produit a un fond contextuel, c'est une image secondaire
- L'image principale reste toujours fond blanc

---

## Partie 3 : Conventions éditoriales (DEP-0266 à DEP-0270)

### DEP-0266 — Convention des textes courts de produits

Les textes courts sont affichés dans les cartes produits, le panier et les listes.

#### Nom du produit (product_name)

**Format** : `[Marque] [Type] [Variante principale]`

**Longueur** :

- Minimum : 3 caractères
- Maximum : 60 caractères
- Idéal : 25-40 caractères

**Règles** :

- Commence par la marque (si applicable)
- Inclut le type de produit
- Inclut la variante principale (saveur, format)
- Pas d'unité dans le nom (unité séparée dans l'UI)
- Première lettre en majuscule, reste selon la marque
- Pas de point final

**Exemples** :

```
✅ Coca-Cola Classic
✅ Pepsi Diète
✅ Lays Chips Ketchup
✅ Doritos Nacho Cheese
✅ Red Bull Energy Drink
✅ Barre Mars

❌ COCA-COLA CLASSIC 355ML           (tout en majuscules, unité incluse)
❌ coca-cola                          (pas de majuscule)
❌ Coca                               (trop vague)
❌ Boisson gazeuse Coca-Cola Classic  (trop descriptif)
```

#### Description courte (short_description)

**Format** : une phrase descriptive concise

**Longueur** :

- Minimum : 10 caractères
- Maximum : 120 caractères
- Idéal : 50-80 caractères

**Règles** :

- Complète le nom avec des détails utiles
- Mentionne les caractéristiques clés (saveur, texture, usage)
- Langage simple et direct
- Pas de jargon marketing excessif
- Commence par une majuscule, termine par un point
- Évite la redondance avec le nom

**Exemples** :

```
✅ Boisson gazeuse classique au cola, rafraîchissante.
✅ Version sans sucre avec le même goût authentique.
✅ Chips de pommes de terre croustillantes, saveur ketchup.
✅ Croustilles de maïs tortilla épicées au fromage.
✅ Boisson énergisante avec taurine et caféine.
✅ Chocolat au lait avec caramel et nougatine.

❌ La meilleure boisson du monde!!!           (trop marketing)
❌ Boisson                                     (trop vague)
❌ Coca-Cola Classic boisson gazeuse cola     (redondance avec nom)
```

#### Badge/étiquette (product_badge)

**Format** : mot-clé court, 1-3 mots

**Longueur** : maximum 20 caractères

**Exemples** :

- `"Nouveau"` : produit récemment ajouté
- `"Populaire"` : produit très commandé
- `"Promo"` : en promotion
- `"Bio"` : certifié biologique
- `"Sans sucre"` : produit diététique
- `"Local"` : production locale

**Règles** :

- Un seul badge par produit (priorité au plus important)
- Mis à jour dynamiquement (ex: "Nouveau" expire après 30 jours)
- Pas de badge si rien de notable

---

### DEP-0267 — Convention des descriptions longues de produits

Les descriptions longues sont affichées dans la page de détail du produit (si implémentée).

#### Format général

**Structure recommandée** :

1. Paragraphe d'introduction (1-2 phrases)
2. Caractéristiques principales (liste à puces)
3. Informations complémentaires (optionnel)

**Longueur** :

- Minimum : 50 caractères
- Maximum : 500 caractères
- Idéal : 150-300 caractères

#### Contenu

**Paragraphe d'introduction** :

- Présente le produit de manière engageante
- Évoque l'expérience ou l'usage
- Ton positif mais factuel

**Caractéristiques principales** :

- Format : liste à puces ou phrases courtes
- Inclut : saveur, ingrédients clés, format, origine (si pertinent)
- Évite : informations redondantes avec les champs structurés

**Informations complémentaires** :

- Allergènes (si non couverts par champ dédié)
- Conseils d'utilisation
- Accords recommandés

#### Exemples

**Boisson gazeuse** :

```markdown
Le Coca-Cola Classic offre un goût unique de cola, apprécié depuis des décennies.
Parfait pour accompagner vos repas ou se rafraîchir à tout moment de la journée.

- Saveur cola authentique
- Formule originale
- Contient caféine
- Meilleur servi frais
```

**Snack salé** :

```markdown
Les chips Lays Ketchup sont préparées avec des pommes de terre sélectionnées
et assaisonnées avec une saveur de ketchup équilibrée, sucrée et légèrement acidulée.

- Pommes de terre 100% canadiennes
- Saveur ketchup signature
- Croustillant garanti
- Sans cholestérol
```

#### Ton et style

- **Langage** : français canadien standard, accessible
- **Registre** : professionnel mais chaleureux
- **Éviter** : superlatifs excessifs, langage trop promotionnel
- **Privilégier** : descriptions factuelles, avantages clairs
- **Inclusif** : neutre, accessible à tous

#### Traduction

- Si multilingue, traduire fidèlement sans adapter le marketing
- Maintenir la même structure dans toutes les langues
- Adapter les unités si nécessaire (ml vs oz)

---

### DEP-0268 — Convention des mots-clés de recherche

Les mots-clés permettent d'améliorer la recherche de produits par le client.

#### Structure

**Format** : tableau de chaînes de caractères (array of strings)

```json
{
  "keywords": ["coca", "coke", "cola", "boisson gazeuse", "soda", "canette"]
}
```

#### Types de mots-clés

1. **Noms de marque** :
   - Nom officiel : `"Coca-Cola"`
   - Diminutifs : `"Coke"`, `"Coca"`
   - Variantes orthographiques : `"Cocacola"`

2. **Types de produits** :
   - Générique : `"boisson gazeuse"`, `"soda"`, `"cola"`
   - Catégorie : `"boisson"`, `"rafraîchissement"`

3. **Caractéristiques** :
   - Saveur : `"ketchup"`, `"barbecue"`, `"original"`
   - Format : `"canette"`, `"bouteille"`, `"format familial"`
   - Attributs : `"diète"`, `"sans sucre"`, `"bio"`

4. **Usage / contexte** :
   - Moment : `"déjeuner"`, `"collation"`, `"soirée"`
   - Occasion : `"party"`, `"pique-nique"`

#### Règles

- **Nombre** : 5 à 15 mots-clés par produit
- **Langue** : mots-clés dans la langue du catalogue (fr-CA ou en-CA)
- **Casse** : tout en minuscules pour la recherche
- **Doublons** : éviter les redondances évidentes
- **Pertinence** : chaque mot-clé doit être véritablement utile pour trouver le produit
- **Singulier/pluriel** : inclure les deux si recherches différentes
- **Accents** : inclure les versions avec et sans accents si pertinent

#### Exemples complets

**Coca-Cola Classic 355ml** :

```json
{
  "keywords": [
    "coca-cola",
    "coca",
    "coke",
    "cola",
    "boisson gazeuse",
    "soda",
    "boisson",
    "rafraîchissement",
    "canette",
    "355ml",
    "classic",
    "rouge"
  ]
}
```

**Lays Chips Ketchup 255g** :

```json
{
  "keywords": [
    "lays",
    "chips",
    "croustilles",
    "pommes de terre",
    "ketchup",
    "tomate",
    "rouge",
    "collation",
    "snack",
    "salé",
    "sac",
    "255g"
  ]
}
```

#### Génération automatique

- **Obligatoire** : nom du produit, marque, catégorie
- **Recommandé** : analyse du nom et de la description pour extraire mots-clés
- **Enrichissement manuel** : ajouter synonymes et termes contextuels

#### Maintenance

- Analyser les requêtes de recherche sans résultat
- Ajouter les termes fréquemment recherchés aux mots-clés pertinents
- Réviser trimestriellement pour optimiser

---

### DEP-0269 — Convention des synonymes parlés pour l'assistant

Les synonymes parlés permettent à l'assistant conversationnel (texte/voix web) de comprendre différentes formulations.

#### Structure

**Format** : tableau de chaînes de caractères avec variantes orales

```json
{
  "spoken_synonyms": [
    "un Coke",
    "une canette de Coke",
    "un Coca",
    "du cola",
    "une boisson gazeuse",
    "un soda au cola"
  ]
}
```

#### Types de synonymes

1. **Formulations naturelles** :
   - Article + nom : `"un Coke"`, `"une canette de Pepsi"`
   - Nom seul : `"Coke"`, `"Pepsi"`
   - Avec quantifiant : `"deux Coke"`, `"trois chips"`

2. **Variantes familières** :
   - Diminutifs : `"Coke"` pour `"Coca-Cola"`
   - Langage courant : `"chips"` pour `"croustilles"`
   - Expressions régionales : `"liqueur"` pour `"boisson gazeuse"` (Québec)

3. **Descriptions génériques** :
   - Type : `"une boisson froide"`, `"des chips"`
   - Catégorie : `"quelque chose de sucré"`, `"à grignoter"`

4. **Variantes avec unités** :
   - Unité explicite : `"une canette de 355"`, `"un deux litres"`
   - Format : `"le petit format"`, `"le grand format"`

#### Règles

- **Nombre** : 5 à 20 synonymes par produit
- **Naturel** : formulations qu'un client utiliserait réellement à l'oral
- **Article** : inclure les variantes avec article (`"un"`, `"une"`, `"du"`, `"de la"`)
- **Quantité** : inclure singulier et pluriel si applicable
- **Contexte** : ajouter des synonymes contextuels (`"pour l'apéro"`, `"pour le lunch"`)
- **Casse** : minuscules (l'assistant normalise)

#### Exemples complets

**Coca-Cola Classic 355ml** :

```json
{
  "spoken_synonyms": [
    "un Coke",
    "une canette de Coke",
    "un Coca-Cola",
    "un Coca",
    "du cola",
    "une boisson gazeuse",
    "un soda",
    "une liqueur" (Québec),
    "un Coke en canette",
    "un Coke classique",
    "un petit Coke"
  ]
}
```

**Lays Chips Ketchup 255g** :

```json
{
  "spoken_synonyms": [
    "des chips",
    "des chips Lays",
    "des chips ketchup",
    "des croustilles ketchup",
    "un sac de chips ketchup",
    "des Lays rouges",
    "des chips au ketchup",
    "quelque chose de salé",
    "des chips pour l'apéro"
  ]
}
```

#### Gestion des ambiguïtés

Si plusieurs produits partagent des synonymes similaires :

- L'assistant demande une clarification
- Propose des choix avec unités/formats : `"Voulez-vous le 355ml ou le 2L ?"`
- Utilise le contexte de la conversation pour déduire

#### Tests et validation

- Tester avec des phrases naturelles d'utilisateurs
- Analyser les conversations où l'assistant ne comprend pas
- Enrichir les synonymes en fonction des incompréhensions

---

### DEP-0270 — Convention des synonymes téléphoniques pour l'agent vocal

Les synonymes téléphoniques sont optimisés pour la reconnaissance vocale téléphonique, qui a des contraintes spécifiques (qualité audio variable, accents, bruits de fond).

#### Structure

**Format** : tableau de chaînes avec variantes phonétiques

```json
{
  "phone_synonyms": ["coca cola", "ko ka ko la", "coke", "ko ke", "cola", "ko la"]
}
```

#### Spécificités téléphoniques

1. **Phonétique simplifiée** :
   - Découper les mots complexes : `"coca cola"` → `"ko ka ko la"`
   - Variantes de prononciation : `"Pepsi"` → `"pep si"`, `"pep zee"`
   - Sons similaires : `"k"` vs `"c"`, `"s"` vs `"z"`

2. **Mots épelés** :
   - Marques pouvant être mal comprises : `"XL"` → `"x l"`, `"ex el"`
   - Formats : `"355ml"` → `"trois cent cinquante cinq millilitres"`, `"trois cinquante cinq"`

3. **Chiffres et unités** :
   - Formats numériques : `"355"` → `"trois cent cinquante cinq"`, `"trois cinquante cinq"`
   - Unités : `"ml"` → `"millilitre"`, `"millilitres"`, `"mili"`, `"m l"`
   - Poids : `"255g"` → `"deux cent cinquante cinq grammes"`, `"deux cinquante cinq"`

4. **Variantes régionales** :
   - Accents québécois : `"deux"` peut sonner comme `"deu"`
   - Expressions locales : `"liqueur"` pour `"boisson gazeuse"`

#### Règles

- **Nombre** : 8 à 25 synonymes par produit (plus que l'assistant texte)
- **Séparation** : espacer les syllabes pour noms complexes
- **Redondance** : privilégier plus de variantes qu'avec l'assistant texte
- **Tests audio** : valider avec des enregistrements réels
- **Qualité** : supposer une qualité audio moyenne (téléphone standard)

#### Exemples complets

**Coca-Cola Classic 355ml** :

```json
{
  "phone_synonyms": [
    "coca cola",
    "ko ka ko la",
    "coke",
    "ko ke",
    "coca",
    "ko ka",
    "cola",
    "ko la",
    "coca cola trois cent cinquante cinq",
    "coke trois cinquante cinq",
    "canette de coke",
    "canette de coca",
    "liqueur cola",
    "boisson cola",
    "soda cola"
  ]
}
```

**Lays Chips Ketchup 255g** :

```json
{
  "phone_synonyms": [
    "lays",
    "lais",
    "lay",
    "chips lays",
    "chips ketchup",
    "croustilles ketchup",
    "chips au ketchup",
    "lays ketchup",
    "lays rouge",
    "sac de chips ketchup",
    "deux cent cinquante cinq grammes",
    "deux cinquante cinq",
    "petit sac",
    "chips tomate"
  ]
}
```

#### Caractères spéciaux et ponctuation

- **Éviter** : les apostrophes peuvent être mal interprétées (`"m'apporte"` → `"m apporte"`)
- **Tirets** : remplacer par espaces (`"Coca-Cola"` → `"coca cola"`)
- **Majuscules** : inutiles (système normalise en minuscules)

#### Gestion des homophones

Préparer des stratégies pour les mots qui sonnent pareil :

- `"lait"` (produit laitier) vs `"lays"` (chips)
- `"coke"` (boisson) vs `"cook"` (cuisine)

L'agent vocal utilise le contexte de la conversation et la catégorie attendue pour lever l'ambiguïté.

#### Tests et amélioration continue

- **Tests réguliers** : enregistrer des appels de tests avec différents accents
- **Analyse des échecs** : identifier les mots mal reconnus
- **Enrichissement** : ajouter les variantes problématiques aux synonymes
- **Feedback terrain** : écouter les retours des vrais utilisateurs

---

## Résumé des conventions de contenu et médias

### Structures de données (DEP-0256 à DEP-0260)

Le catalogue de depaneurIA repose sur des structures claires et cohérentes :

**Unités de vente (DEP-0256)** :

- Types standardisés (`unit`, `pack`, `box`, `bulk`)
- Informations volume/poids selon le contexte
- Labels affichés clairs (`"355ml"`, `"6x355ml"`)

**Images produits (DEP-0257, DEP-0258)** :

- Image principale (1:1, CDN-hosted, alt text obligatoire)
- Jusqu'à 4 images secondaires (détails, contexte, packaging)
- Métadonnées complètes (dimensions, format, poids, BlurHash)

**Ordre d'affichage (DEP-0259, DEP-0260)** :

- Catégories : ordre global, visibilité, sous-catégories supportées
- Produits : ordre par catégorie, épinglage, boost dynamique
- Produits vedettes et populaires identifiés

### Conventions techniques des images (DEP-0261 à DEP-0265)

Des standards stricts assurent la qualité et la cohérence visuelle :

**Tailles (DEP-0261)** :

- 4 tailles standardisées : thumb (150px), medium (400px), full (800px), hero (1200px)
- Ratio 1:1 pour uniformité dans les grilles
- Génération automatique des dérivées depuis la source

**Nommage (DEP-0262)** :

- Format : `product-<slug>-<variante>-<taille>.<ext>`
- Kebab-case strict, minuscules, pas d'espaces
- Exemples : `product-coca-cola-355ml-full.webp`

**Compression (DEP-0263)** :

- WebP prioritaire (75-90% qualité selon taille)
- JPEG fallback (70-80% qualité)
- Poids cibles respectés : thumb <15KB, medium <60KB, full <150KB

**Recadrage (DEP-0264)** :

- Produit centré, occupant 70-85% de l'image
- Marges de sécurité 5% minimum
- Smart crop automatique avec détection d'objet

**Fond (DEP-0265)** :

- Standard : blanc pur `#FFFFFF` (90% des cas)
- Alternatifs autorisés : contexte (images secondaires), légèrement coloré (rare)
- Interdits : motifs, dégradés, fonds foncés, transparence PNG

### Conventions éditoriales (DEP-0266 à DEP-0270)

Le contenu textuel suit des règles précises pour la clarté et l'efficacité :

**Textes courts (DEP-0266)** :

- Nom : 25-40 caractères, `[Marque] [Type] [Variante]`
- Description : 50-80 caractères, phrase descriptive concise
- Badge : 1 mot-clé, maximum 20 caractères

**Description longue (DEP-0267)** :

- 150-300 caractères idéal
- Structure : intro + caractéristiques + infos complémentaires
- Ton professionnel et chaleureux

**Mots-clés de recherche (DEP-0268)** :

- 5 à 15 mots-clés par produit
- Types : marques, types, caractéristiques, usage
- Tout en minuscules pour normalisation

**Synonymes parlés assistant (DEP-0269)** :

- 5 à 20 formulations naturelles
- Avec articles, quantifiants, variantes familières
- Optimisé pour conversation texte/voix web

**Synonymes téléphoniques (DEP-0270)** :

- 8 à 25 variantes phonétiques
- Découpage syllabique, homophones, chiffres épelés
- Optimisé pour reconnaissance vocale téléphonique

### Principes généraux

**Qualité** : Chaque élément (image, texte, métadonnée) est soigné et cohérent.

**Performance** : Formats optimisés, compression intelligente, chargement progressif.

**Accessibilité** : Alt text obligatoire, descriptions claires, support multilingue.

**Maintenabilité** : Conventions strictes facilitent l'automatisation et la gestion à grande échelle.

**Évolutivité** : Structures extensibles, support multi-tenant, adaptabilité aux besoins futurs.

### Synthèse ciblée DEP-0261 à DEP-0270 (images, textes, synonymes)

- Tailles et formats images : 4 formats carrés (`thumb` 150px, `medium` 400px, `full` 800px, `hero` 1200px), WebP prioritaire (75-90% selon taille), JPEG fallback.
- Nommage et rendu : `product-<slug>-<variante>-<taille>.<ext>`, kebab-case, alt obligatoire, recadrage centré 70-85%, fond blanc `#FFFFFF` (fond contexte réservé aux secondaires).
- Textes courts/longs : nom 25-40 car., description courte 50-80 car., badge ≤20 car. ; description longue 150-300 car. structurée (intro + puces).
- Recherche : 5-15 mots-clés en minuscules couvrant marque, type, caractéristiques, usages, variantes singulier/pluriel.
- Synonymes : assistant (5-20 formulations naturelles avec articles/quantités) ; téléphone (8-25 variantes phonétiques, syllabées, chiffres épelés).

---

**Date de création** : 2026-03-13
**Statut** : Spécification de référence pour gestion catalogue
**Prochaine étape** : Création du jeu de données de démonstration (DEP-0271 à DEP-0280)
