# DEP-0321 à DEP-0333 — Boutique manuelle et navigation produits

## Périmètre

Ce document définit la **page boutique en mode manuel**, la structure de
**navigation par catégories et sous-catégories**, le **champ de recherche**,
les **filtres et le tri**, la **carte produit de base** et les **actions
directes** disponibles depuis cette carte (ajout au panier, voir détail,
fermer détail).

Ces décisions s'appuient sur les dispositions définies en DEP-0181–DEP-0189,
les composants UI définis en DEP-0228–DEP-0240, et le modèle catalogue défini
en DEP-0241–DEP-0255.

Il s'agit exclusivement de **documentation** : aucun code produit, aucune
implémentation. Les spécifications décrites ici serviront de référence pour les
futures implémentations front-end et back-end.

---

## DEP-0321 — Page boutique manuelle avec grille de produits

### Objectif

Définir la structure et le contenu de la page boutique en mode manuel, c'est-à-dire
la vue principale depuis laquelle le client navigue et commande sans assistance
conversationnelle.

### Structure de la page

| Zone              | Contenu                                                         | Position desktop    | Position mobile       |
|-------------------|-----------------------------------------------------------------|---------------------|-----------------------|
| Header            | Logo, mode actif, icône panier avec badge                       | Haut — pleine largeur | Haut — pleine largeur |
| Navigation gauche | Catégories (DEP-0322), filtres (DEP-0325–DEP-0328)             | Colonne gauche fixe | Menu burger (repliable) |
| Zone centrale     | Barre de recherche (DEP-0324), barre de tri (DEP-0329), grille | Colonne centrale    | Corps principal |
| Zone droite       | Panier (DEP-0183)                                               | Colonne droite fixe | Bouton flottant bas |

### Grille de produits

| Attribut           | Valeur                                                          |
|--------------------|-----------------------------------------------------------------|
| Colonnes desktop   | 3 colonnes (≥ 1024px)                                           |
| Colonnes tablette  | 2 colonnes (768px–1023px)                                       |
| Colonnes mobile    | 2 colonnes (< 768px), basculement liste vertical possible       |
| Espacement         | Gap de 16px entre les cartes                                    |
| Chargement         | Pagination ou défilement infini — V1 : pagination simple        |
| État vide          | Message « Aucun produit disponible pour le moment. »            |
| État chargement    | Squelettes de cartes (skeleton loaders)                         |

### Comportement général

- La grille affiche tous les produits actifs du tenant par défaut, sans filtre
  appliqué.
- Les filtres et la recherche réduisent la grille en temps réel.
- Le tri modifie l'ordre sans changer la sélection.
- La grille conserve sa position de défilement lors d'une action sur le panier.

### Références

- Disposition desktop : DEP-0181
- Disposition mobile : DEP-0182
- Comportement au clic : DEP-0189

---

## DEP-0322 — Navigation par catégories

### Objectif

Définir la navigation principale par catégories permettant au client de
restreindre la grille à une catégorie de produits spécifique.

### Structure

| Élément              | Description                                                    |
|----------------------|----------------------------------------------------------------|
| Emplacement desktop  | Colonne gauche, au-dessus des filtres                          |
| Emplacement mobile   | Menu burger, premier niveau                                    |
| Entrée « Tout »      | Toujours présente en premier — affiche tous les produits actifs|
| Entrées catégories   | Triées par `display_order` (DEP-0241), une par ligne           |
| Indicateur actif     | Catégorie sélectionnée surlignée (fond coloré ou bordure)      |
| Compteur produits    | Optionnel — affiche le nombre de produits disponibles          |

### Comportement

- Un clic sur une catégorie filtre la grille et met à jour l'URL
  (ex. `/boutique?categorie=boissons`).
- Un clic sur « Tout » réinitialise le filtre catégorie.
- Une seule catégorie est active à la fois.
- Si une sous-catégorie est sélectionnée (DEP-0323), la catégorie parente reste
  marquée comme active (état parent actif).
- L'état de la catégorie active persiste lors d'un rechargement de page.

### Règles

- Les catégories sans produit actif sont masquées par défaut en V1.
- L'ordre d'affichage suit `display_order` du modèle tenant (DEP-0253).
- Maximum 12 catégories affichées sans scroll sur desktop — au-delà, scroll
  vertical interne à la colonne.

---

## DEP-0323 — Navigation par sous-catégories si nécessaire

### Objectif

Définir le comportement de navigation en deux niveaux (catégorie → sous-catégorie)
lorsque la hiérarchie du catalogue le justifie.

### Condition d'activation

Les sous-catégories ne s'affichent que si la catégorie sélectionnée possède
des enfants (`parent_id` non nul, `depth = 1`, DEP-0241) **et** qu'au moins
une sous-catégorie contient des produits actifs.

### Structure

| Élément                | Description                                                    |
|------------------------|----------------------------------------------------------------|
| Déclencheur            | Clic sur une catégorie parente ayant des enfants               |
| Affichage              | Sous-liste indentée sous la catégorie parente (accordéon)      |
| Emplacement desktop    | Sous la catégorie parente, indentée de 16px                    |
| Emplacement mobile     | Deuxième niveau dans le menu burger                            |
| Indicateur actif       | Sous-catégorie sélectionnée surlignée                          |

### Comportement

- Le clic sur une catégorie parente ayant des enfants :
  1. Déploie les sous-catégories (accordéon).
  2. Filtre la grille sur la catégorie parente complète.
- Le clic sur une sous-catégorie filtre la grille sur cette sous-catégorie
  uniquement.
- Un clic sur « Tout » ou sur la catégorie parente active referme les
  sous-catégories et réinitialise au niveau parent.
- En V1 : deux niveaux maximum (catégorie → sous-catégorie). Pas de troisième
  niveau.

### Règles

- Si aucune catégorie ne possède de sous-catégorie, ce composant n'est pas
  rendu.
- Les sous-catégories sans produit actif sont masquées.

---

## DEP-0324 — Champ de recherche de produits

### Objectif

Définir le champ de recherche permettant au client de trouver un produit par
mot-clé, nom, marque ou synonyme.

### Structure

| Attribut           | Valeur                                                         |
|--------------------|----------------------------------------------------------------|
| Emplacement        | En-tête de la zone centrale, au-dessus de la barre de tri     |
| Largeur            | Pleine largeur de la zone centrale                             |
| Placeholder        | « Rechercher un produit… »                                     |
| Icône              | Loupe à gauche du champ                                        |
| Bouton effacer     | Croix [✕] à droite, visible uniquement si le champ est non vide|
| Icône micro        | Non présente en mode manuel (réservée au mode assisté)         |

### Comportement

| Action                       | Résultat                                                      |
|------------------------------|---------------------------------------------------------------|
| Saisie de 2 caractères min   | Filtrage en temps réel de la grille (debounce 300 ms)         |
| Saisie + touche Entrée       | Soumission de la recherche, mise à jour URL                   |
| Clic sur [✕]                 | Réinitialisation du champ et restauration de la grille complète|
| Aucun résultat               | Message « Aucun produit trouvé pour "[terme]". »              |
| Résultats partiels           | Grille mise à jour avec les produits correspondants           |

### Sources de recherche

La recherche porte sur les champs suivants du catalogue (DEP-0242–DEP-0246) :

| Champ recherché     | Priorité |
|---------------------|----------|
| `label` (nom produit) | Haute   |
| `brand` (marque)    | Haute    |
| `tags`              | Moyenne  |
| Synonymes (DEP-0246)| Moyenne  |
| `description`       | Basse    |

### Règles

- La recherche n'est pas sensible à la casse ni aux accents.
- Les résultats respectent les filtres actifs (catégorie, disponibilité).
- La recherche active désactive le filtre catégorie (la grille ne montre plus
  qu'une catégorie sélectionnée mais tous les résultats correspondants).
- L'état de la recherche est conservé dans l'URL
  (ex. `/boutique?q=pepsi`).

---

## DEP-0325 — Filtre par catégorie

### Objectif

Définir le filtre par catégorie appliqué depuis la navigation gauche (desktop)
ou le menu burger (mobile), complémentaire à DEP-0322.

### Comportement

| Action                          | Résultat                                            |
|---------------------------------|-----------------------------------------------------|
| Clic sur une catégorie          | Grille filtrée sur cette catégorie uniquement        |
| Clic sur « Tout »               | Filtre catégorie supprimé, grille complète affichée  |
| Catégorie active + recherche    | Les deux filtres s'appliquent simultanément          |
| Catégorie active + tri          | Le tri s'applique sur les résultats filtrés          |

### Indicateurs visuels

- Catégorie active : fond coloré (`--color-primary-light`) + label en gras.
- Nombre de produits dans la catégorie affiché à droite du label (optionnel V1).
- Aucune catégorie active = état « Tout » implicite.

### Règles

- Un seul filtre catégorie actif à la fois.
- Incompatible avec « filtre par dernière commande » (DEP-0328) — si les deux
  sont demandés, le plus récent prend la priorité.

---

## DEP-0326 — Filtre par disponibilité

### Objectif

Définir le filtre permettant au client d'afficher uniquement les produits
disponibles (en stock), ou d'inclure les produits en rupture.

### Options du filtre

| Option               | Description                                           | État par défaut |
|----------------------|-------------------------------------------------------|-----------------|
| En stock uniquement  | Affiche uniquement les variantes `en_stock`           | Activé          |
| Tout afficher        | Affiche aussi les variantes `rupture` et `faible_stock`| Désactivé      |

### Comportement

- Par défaut, la grille affiche uniquement les produits en stock (`en_stock`
  ou `faible_stock`).
- Les produits en rupture (`rupture`) sont masqués par défaut.
- Si le filtre « Tout afficher » est activé, les produits en rupture
  apparaissent avec un badge « Rupture » et le bouton « Ajouter au panier »
  est désactivé pour ces produits.

### Indicateur visuel

| État variante  | Badge affiché       | Bouton panier          |
|----------------|---------------------|------------------------|
| `en_stock`     | Aucun               | Actif                  |
| `faible_stock` | « Faible stock »    | Actif                  |
| `rupture`      | « Rupture »         | Désactivé (grisé)      |

### Règles

- Le filtre disponibilité s'applique en complément des autres filtres actifs.
- La source de disponibilité est DEP-0248.

---

## DEP-0327 — Filtre par produits populaires

### Objectif

Définir le filtre permettant au client d'afficher uniquement les produits
identifiés comme populaires sur la période récente.

### Source des données

Les produits populaires sont définis par la structure DEP-0250 :
- `period = "30j"` par défaut.
- Triés par `rank` croissant (1 = plus populaire).

### Comportement

| Action                         | Résultat                                              |
|--------------------------------|-------------------------------------------------------|
| Activation du filtre           | Grille limitée aux produits avec un rang populaire    |
| Désactivation                  | Retour à la grille sans filtre populaire              |
| Filtre populaire + catégorie   | Produits populaires dans la catégorie sélectionnée    |
| Filtre populaire + recherche   | Produits populaires correspondant au terme recherché  |

### Indicateur visuel

- Filtre actif : bouton ou tag surligné.
- Les cartes produits populaires affichent un badge « Populaire » (DEP-0330).

### Règles

- Incompatible avec le filtre « dernière commande » (DEP-0328) — les deux ne
  peuvent pas être actifs simultanément. Le plus récent prend la priorité.
- Si aucun produit populaire n'existe pour le tenant, le filtre est masqué.

---

## DEP-0328 — Filtre par dernière commande

### Objectif

Définir le filtre permettant au client d'afficher uniquement les produits
présents dans sa dernière commande, facilitant la re-commande rapide.

### Condition d'activation

Ce filtre n'est visible que si le client est **connecté** et possède **au
moins une commande précédente** (DEP-0316).

### Comportement

| Action                       | Résultat                                                    |
|------------------------------|-------------------------------------------------------------|
| Activation du filtre         | Grille limitée aux produits de la dernière commande         |
| Désactivation                | Retour à la grille sans filtre                              |
| Produit absent du catalogue  | Produit masqué (non affiché même s'il était dans la commande)|
| Produit en rupture           | Affiché avec badge « Rupture », bouton panier désactivé     |

### Indicateur visuel

- Filtre actif : bouton ou tag surligné avec mention
  « Ma dernière commande ».
- Nombre de produits disponibles affiché dans le label du filtre
  (ex. « Ma dernière commande — 3 produits »).

### Règles

- Incompatible avec le filtre « populaires » (DEP-0327) — le plus récent prend
  la priorité.
- Incompatible avec le filtre « catégorie » actif — si une catégorie est
  sélectionnée, ce filtre s'applique à l'intérieur de cette catégorie.
- Si le client n'est pas connecté, ce filtre est masqué (non rendu).

---

## DEP-0329 — Tri simple de produits

### Objectif

Définir les options de tri disponibles pour ordonner les produits affichés
dans la grille.

### Options de tri

| ID tri          | Label affiché              | Critère de tri                     | Par défaut |
|-----------------|----------------------------|------------------------------------|------------|
| `pertinence`    | Pertinence                 | Ordre catalogue tenant (DEP-0252)  | Oui        |
| `prix_asc`      | Prix croissant             | Prix public croissant              | Non        |
| `prix_desc`     | Prix décroissant           | Prix public décroissant            | Non        |
| `populaire`     | Les plus populaires        | Rank DEP-0250 croissant            | Non        |
| `alpha_asc`     | A → Z                      | Label produit alphabétique         | Non        |

### Structure du composant

| Attribut       | Valeur                                                          |
|----------------|-----------------------------------------------------------------|
| Emplacement    | À droite de la barre de recherche, en haut de la zone centrale  |
| Forme          | Menu déroulant (select ou dropdown)                             |
| Label          | « Trier par : [Option active] »                                 |
| Largeur        | Adaptative (min 160px)                                          |

### Comportement

- Le tri par défaut est « Pertinence » (ordre défini par le tenant).
- Un changement de tri est appliqué immédiatement, sans rechargement de page.
- Le tri s'applique sur la sélection courante (grille filtrée ou complète).
- L'option de tri active est reflétée dans l'URL
  (ex. `/boutique?tri=prix_asc`).

### Règles

- Le tri ne réinitialise pas les filtres actifs.
- Si le prix n'est pas disponible pour une variante, les produits sans prix
  sont placés en fin de liste lors du tri par prix.

---

## DEP-0330 — Carte produit de base

### Objectif

Définir la structure, le contenu et les états visuels de la carte produit
affichée dans la grille.

### Structure de la carte

| Élément              | Contenu                                             | Obligatoire |
|----------------------|-----------------------------------------------------|-------------|
| Photo produit        | Image principale (DEP-0244), format carré           | Oui         |
| Nom du produit       | `label` (DEP-0242), tronqué à 2 lignes max          | Oui         |
| Marque               | `brand` (DEP-0242), si disponible                   | Non         |
| Format / variante    | Label de la variante par défaut (DEP-0243)          | Oui         |
| Prix                 | Prix public de la variante par défaut               | Oui         |
| Badge disponibilité  | Affiché selon DEP-0326                              | Conditionnel|
| Badge populaire      | « Populaire » si rang ≤ 10 sur 30j (DEP-0250)      | Conditionnel|
| Bouton « Ajouter »   | Bouton primaire compact, icône + label              | Oui         |

### Dimensions et style

| Attribut         | Valeur                                            |
|------------------|---------------------------------------------------|
| Forme            | Rectangle arrondi (border-radius 8px)             |
| Fond             | Blanc (`--color-surface`)                         |
| Ombre            | Légère (`box-shadow: 0 2px 8px rgba(0,0,0,0.08)`)|
| Photo            | Ratio 1:1, `object-fit: cover`                    |
| Hauteur carte    | Variable selon contenu — min 220px                |
| Hover desktop    | Élévation ombre + légère translation haut (2px)   |

### États visuels

| État             | Description visuelle                                          |
|------------------|---------------------------------------------------------------|
| Normal           | Style standard décrit ci-dessus                               |
| Hover            | Ombre renforcée, translation 2px vers le haut                 |
| Produit en rupture| Opacity 0.6, badge « Rupture », bouton « Ajouter » grisé    |
| Ajout en cours   | Animation flyout vers le panier (DEP-0189)                    |
| Déjà dans panier | Badge quantité sur la carte (ex. « × 2 dans le panier »)     |

### Comportements de clic

| Zone cliquée          | Action déclenchée                        | Référence |
|-----------------------|------------------------------------------|-----------|
| Corps de la carte     | Ouvrir le détail produit                 | DEP-0332  |
| Bouton « Ajouter »    | Ajout direct au panier (sans modal)      | DEP-0331  |

### Règles

- La photo est obligatoire. Si absente, afficher un placeholder neutre avec
  l'initiale du nom produit.
- Le prix affiché est celui de la variante par défaut (`is_default = true`,
  DEP-0243).
- La carte n'affiche qu'une seule variante à la fois (la variante par défaut).
  Le changement de variante est disponible dans le détail produit (DEP-0332).

---

## DEP-0331 — Action ajouter au panier depuis une carte produit

### Objectif

Définir le comportement exact du bouton « Ajouter au panier » présent sur la
carte produit, permettant un ajout direct sans ouverture du modal de détail.

### Déclencheur

Clic sur le bouton « Ajouter » de la carte produit (DEP-0330).

### Comportement

| Étape | Action                                                                    |
|-------|---------------------------------------------------------------------------|
| 1     | Validation : le produit est disponible (`en_stock` ou `faible_stock`)     |
| 2     | Si client non connecté : demande de connexion avant ajout                 |
| 3     | Ajout de 1 unité de la variante par défaut au panier                      |
| 4     | Animation flyout : translation visuelle de la carte vers l'icône panier   |
| 5     | Badge de quantité du panier incrémenté (+1)                               |
| 6     | Micro-animation de pulsation sur l'icône panier                           |
| 7     | Si déjà dans le panier : quantité incrémentée (+1), badge carte mis à jour |

### Quantité par défaut

- Quantité ajoutée : **1 unité** à chaque clic.
- Pour ajuster la quantité, le client passe par le détail produit (DEP-0332)
  ou directement dans le panier.

### Produit en rupture

- Si `state = "rupture"` (DEP-0248) : le bouton est **grisé et non cliquable**.
- Aucun ajout n'est possible depuis la carte pour un produit en rupture.

### Feedback visuel

| Moment                  | Feedback                                           |
|-------------------------|----------------------------------------------------|
| Clic → ajout réussi     | Animation flyout + badge panier incrémenté         |
| Déjà dans le panier     | Badge « × N dans le panier » visible sur la carte  |
| Produit en rupture      | Bouton grisé, curseur « interdit »                 |
| Erreur (réseau, etc.)   | Toast d'erreur discret en bas d'écran              |

---

## DEP-0332 — Action voir détail d'un produit

### Objectif

Définir le comportement d'ouverture du modal de détail produit lorsque le
client clique sur le corps d'une carte produit.

### Déclencheur

Clic sur le corps de la carte produit (hors bouton « Ajouter »).

### Comportement d'ouverture

| Attribut          | Valeur                                                         |
|-------------------|----------------------------------------------------------------|
| Type              | Modal / overlay pleine hauteur sur mobile, centré sur desktop  |
| Animation         | Fade-in (200ms) + légère montée (translateY de 8px → 0)        |
| Fond              | Overlay sombre semi-transparent (`rgba(0,0,0,0.5)`)            |
| Fermeture         | Clic sur [✕], clic hors du modal, ou touche Échap              |
| URL               | Mise à jour optionnelle (ex. `/boutique?produit=slug`)          |

### Contenu du modal de détail

| Élément                  | Description                                          |
|--------------------------|------------------------------------------------------|
| Photo(s) produit         | Carousel si plusieurs photos (DEP-0244)              |
| Nom du produit           | `label` complet (DEP-0242)                           |
| Marque                   | `brand` si disponible                                |
| Description              | `description` complète (DEP-0242)                    |
| Sélecteur de variante    | Boutons ou select pour choisir le format (DEP-0243)  |
| Prix                     | Prix de la variante sélectionnée                     |
| Indicateur disponibilité | Badge DEP-0326 pour la variante sélectionnée         |
| Sélecteur de quantité    | [−] [N] [+], valeur initiale = 1                     |
| Bouton « Ajouter »       | Bouton primaire pleine largeur dans le modal         |
| Bouton « Fermer »        | Icône [✕] en haut à droite du modal                  |

### Comportement du sélecteur de variante

- La variante par défaut (`is_default = true`) est pré-sélectionnée.
- Le changement de variante met à jour le prix et la disponibilité affichés.
- Si une variante est en rupture, son option est désactivée dans le sélecteur.

### Comportement du sélecteur de quantité

- Valeur minimale : 1.
- Pas de valeur maximale définie en V1.
- Clic sur [−] en quantité = 1 : ne descend pas sous 1 (pas de suppression
  depuis ce sélecteur).

### Règles

- Un seul modal de détail peut être ouvert à la fois.
- L'ouverture du modal ne vide pas le panier ni ne réinitialise les filtres.
- Le scroll de la page principale est bloqué tant que le modal est ouvert.

---

## DEP-0333 — Action fermer le détail d'un produit

### Objectif

Définir les mécanismes de fermeture du modal de détail produit.

### Déclencheurs de fermeture

| Déclencheur                        | Comportement                                              |
|------------------------------------|-----------------------------------------------------------|
| Clic sur le bouton [✕]             | Fermeture immédiate du modal                              |
| Clic sur l'overlay sombre          | Fermeture immédiate du modal                              |
| Touche Échap (clavier)             | Fermeture immédiate du modal                              |
| Clic sur « Ajouter au panier »     | Ajout au panier **puis** fermeture automatique du modal   |
| Navigation vers une autre page     | Fermeture et réinitialisation du modal                    |

### Animation de fermeture

- Fade-out (150ms) + légère descente (translateY de 0 → 8px).
- L'overlay sombre disparaît en simultané.

### État après fermeture

- La grille reprend sa position de défilement d'avant l'ouverture du modal.
- Les filtres et le tri actifs sont conservés.
- Le focus clavier revient sur la carte produit qui a déclenché l'ouverture
  (accessibilité).

### Règles

- La fermeture ne supprime pas d'éventuels ajouts au panier effectués pendant
  que le modal était ouvert.
- Si le client a modifié la quantité dans le modal sans cliquer « Ajouter »,
  la quantité est réinitialisée à 1 à la prochaine ouverture.
- L'URL est réinitialisée à l'URL de la boutique (suppression du paramètre
  `?produit=slug`) après fermeture.

---

## Synthèse du bloc DEP-0321–DEP-0333

| DEP      | Sujet                              | Décision clé                                               |
|----------|------------------------------------|------------------------------------------------------------|
| DEP-0321 | Page boutique manuelle             | Grille 3 col desktop / 2 col mobile, pagination V1         |
| DEP-0322 | Navigation par catégories          | Colonne gauche desktop, menu burger mobile, une active     |
| DEP-0323 | Navigation par sous-catégories     | Accordéon, 2 niveaux max, uniquement si enfants actifs     |
| DEP-0324 | Champ de recherche                 | Filtre temps réel dès 2 chars, debounce 300ms, sans micro  |
| DEP-0325 | Filtre par catégorie               | Exclusif, mis à jour URL, combinable avec tri et recherche |
| DEP-0326 | Filtre par disponibilité           | En stock par défaut, rupture masquée, badge par état       |
| DEP-0327 | Filtre par produits populaires     | Rang DEP-0250, incompatible filtre dernière commande       |
| DEP-0328 | Filtre par dernière commande       | Client connecté requis, incompatible filtre populaires     |
| DEP-0329 | Tri simple                         | 5 options, pertinence par défaut, mis à jour URL           |
| DEP-0330 | Carte produit de base              | Photo, nom, prix, badge, bouton ajouter, 2 zones de clic   |
| DEP-0331 | Ajout au panier depuis la carte    | 1 unité par défaut, flyout, badge carte, rupture bloquante |
| DEP-0332 | Voir détail produit                | Modal overlay, carousel photo, sélecteur variante/quantité |
| DEP-0333 | Fermer le détail produit           | 3 déclencheurs, fermeture auto après ajout, focus retour   |
