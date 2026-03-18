# DEP-0271 à DEP-0280 — Catalogue de démonstration et validations

## Périmètre

Ce document définit le **jeu de données initial de démonstration** du catalogue
depaneurIA ainsi que les **règles de validation minimales** à respecter avant tout
chargement.

Il s'agit exclusivement de **documentation** : aucun seed réel en base, aucun code
produit. Les données décrites ici serviront de référence pour les futures
implémentations de seed et de tests de chargement.

---

## DEP-0271 — Jeu de catégories initial pour la démonstration

### Objectif

Définir un ensemble minimal et réaliste de catégories produits permettant de
valider l'affichage, la navigation et le filtrage dans l'interface.

### Catégories retenues

| ID   | Slug              | Nom affiché           | Icône suggérée   |
|------|-------------------|-----------------------|------------------|
| C-01 | freins            | Freins                | 🛑               |
| C-02 | filtres           | Filtres               | 🔧               |
| C-03 | eclairage         | Éclairage             | 💡               |
| C-04 | huiles-fluides    | Huiles et fluides     | 🛢️               |
| C-05 | batteries         | Batteries             | 🔋               |
| C-06 | pneus             | Pneus                 | ⚫               |
| C-07 | essuyage          | Essuyage              | 🌧️               |
| C-08 | demarrage         | Démarrage             | 🔑               |

### Règles

- Chaque catégorie possède un `slug` unique en kebab-case.
- Chaque catégorie possède un nom affiché en français, ≤ 30 caractères.
- Minimum 5 catégories pour la démo ; 8 retenues ici.

---

## DEP-0272 — Jeu de produits initial pour la démonstration

### Objectif

Fournir un catalogue fictif de produits couvrant toutes les catégories définies
en DEP-0271, suffisant pour tester recherche, tri et affichage carte/liste.

### Produits retenus

| ID   | Nom court                    | Catégorie (slug)  | Prix TTC (€) | Dispo       |
|------|------------------------------|--------------------|--------------|-------------|
| P-01 | Plaquettes frein avant       | freins             | 34.90        | en_stock    |
| P-02 | Disque frein ventilé 280 mm  | freins             | 52.50        | en_stock    |
| P-03 | Filtre à huile               | filtres            | 8.90         | en_stock    |
| P-04 | Filtre à air                 | filtres            | 12.50        | en_stock    |
| P-05 | Ampoule H7 55W              | eclairage          | 6.90         | en_stock    |
| P-06 | Kit xénon H1                 | eclairage          | 45.00        | rupture     |
| P-07 | Huile moteur 5W-30 5L        | huiles-fluides     | 38.90        | en_stock    |
| P-08 | Liquide de refroidissement   | huiles-fluides     | 14.90        | en_stock    |
| P-09 | Batterie 60Ah 540A           | batteries          | 89.90        | en_stock    |
| P-10 | Pneu été 205/55 R16          | pneus              | 62.00        | en_stock    |
| P-11 | Balai essuie-glace 600 mm    | essuyage           | 11.90        | en_stock    |
| P-12 | Démarreur reconditionné      | demarrage          | 149.00       | sur_commande|

### Règles

- Chaque produit référence une catégorie existante (DEP-0271).
- Prix exprimé en euros TTC, décimal à 2 chiffres.
- Le champ `dispo` utilise l'un des états définis en DEP-0279.
- Minimum 10 produits pour la démo ; 12 retenus ici.

---

## DEP-0273 — Jeu de photos initial pour la démonstration

### Objectif

Associer au moins une image à chaque produit de démo pour valider l'affichage
des vignettes, du zoom et du carrousel.

### Convention de nommage

```
/images/products/{product_id}/{product_id}-{index}.webp
```

Exemple : `/images/products/P-01/P-01-1.webp`

### Images prévues

| Produit | Nombre d'images | Fichiers attendus                 |
|---------|-----------------|-----------------------------------|
| P-01    | 2               | P-01-1.webp, P-01-2.webp         |
| P-02    | 1               | P-02-1.webp                       |
| P-03    | 1               | P-03-1.webp                       |
| P-04    | 1               | P-04-1.webp                       |
| P-05    | 1               | P-05-1.webp                       |
| P-06    | 2               | P-06-1.webp, P-06-2.webp         |
| P-07    | 1               | P-07-1.webp                       |
| P-08    | 1               | P-08-1.webp                       |
| P-09    | 2               | P-09-1.webp, P-09-2.webp         |
| P-10    | 1               | P-10-1.webp                       |
| P-11    | 1               | P-11-1.webp                       |
| P-12    | 1               | P-12-1.webp                       |

### Règles

- Format : WebP, ≤ 200 Ko par image.
- Dimensions recommandées : 800×800 px (carré).
- Chaque produit possède **au minimum 1 image** (validation DEP-0277).
- Les images de démo peuvent être des placeholders générés.

---

## DEP-0274 — Jeu de synonymes initial pour la démonstration

### Objectif

Alimenter le moteur de recherche avec des synonymes courants pour améliorer la
pertinence des résultats dès la démonstration.

### Synonymes retenus

| Terme principal          | Synonymes                                      |
|--------------------------|-------------------------------------------------|
| plaquettes frein         | plaquettes de frein, garnitures, pads           |
| disque frein             | disque de frein, rotor                          |
| filtre à huile           | filtre huile                                    |
| filtre à air             | filtre air, filtre admission                    |
| ampoule                  | lampe, bulbe                                    |
| huile moteur             | huile 5W-30, lubrifiant moteur                  |
| liquide de refroidissement | liquide refroidissement, antigel, coolant     |
| batterie                 | accumulateur, batterie auto                     |
| pneu                     | pneumatique, gomme                              |
| balai essuie-glace       | essuie-glace, wiper                             |
| démarreur                | starter, moteur de démarrage                    |

### Règles

- Les synonymes sont insensibles à la casse.
- Un terme principal peut avoir 1 à 5 synonymes.
- Les synonymes ne doivent pas créer de collision entre catégories différentes.

---

## DEP-0275 — Jeu de produits les plus commandés fictifs pour la démonstration

### Objectif

Définir un classement fictif des produits les plus populaires pour valider
l'affichage du bloc « les plus commandés » sur la page d'accueil.

### Classement retenu

| Rang | Produit (ID) | Nom court                    | Commandes fictives |
|------|-------------|------------------------------|--------------------|
| 1    | P-01        | Plaquettes frein avant       | 342                |
| 2    | P-07        | Huile moteur 5W-30 5L        | 287                |
| 3    | P-03        | Filtre à huile               | 256                |
| 4    | P-10        | Pneu été 205/55 R16          | 198                |
| 5    | P-09        | Batterie 60Ah 540A           | 176                |

### Règles

- Le classement affiche les **5 premiers** produits.
- Les compteurs sont purement fictifs et servent uniquement à la démo.
- Chaque produit du classement doit exister dans le jeu DEP-0272.

---

## DEP-0276 — Vérification : chaque produit a une catégorie valide

### Règle de validation

Avant tout chargement, vérifier que le champ `categorie` de chaque produit
correspond à un `slug` existant dans le jeu de catégories (DEP-0271).

### Critères

- Le slug de catégorie ne doit pas être vide.
- Le slug de catégorie doit correspondre exactement à une entrée de DEP-0271.
- Un produit avec une catégorie invalide **bloque** le chargement.

### Cas d'erreur attendus

| Cas                          | Résultat attendu            |
|------------------------------|------------------------------|
| Catégorie vide               | ❌ Rejet — champ obligatoire |
| Catégorie inexistante        | ❌ Rejet — slug inconnu      |
| Catégorie valide             | ✅ Accepté                   |

---

## DEP-0277 — Vérification : chaque produit a au moins une image valide

### Règle de validation

Chaque produit du catalogue doit être associé à **au moins une image** dont le
chemin respecte la convention DEP-0273.

### Critères

- Le produit possède ≥ 1 entrée image.
- Le fichier image référencé respecte le format `/images/products/{id}/{id}-{n}.webp`.
- L'extension doit être `.webp`.
- Un produit sans image **bloque** le chargement.

### Cas d'erreur attendus

| Cas                          | Résultat attendu            |
|------------------------------|------------------------------|
| Aucune image associée        | ❌ Rejet — image obligatoire |
| Chemin image mal formaté     | ❌ Rejet — format invalide   |
| Au moins 1 image valide      | ✅ Accepté                   |

---

## DEP-0278 — Vérification : chaque produit a un nom court valide

### Règle de validation

Le champ `nom_court` de chaque produit doit être présent et respecter les
contraintes de longueur.

### Critères

- Le nom court ne doit pas être vide.
- Le nom court ne doit pas dépasser **80 caractères**.
- Le nom court ne doit pas contenir de balises HTML.
- Un nom court invalide **bloque** le chargement.

### Cas d'erreur attendus

| Cas                          | Résultat attendu              |
|------------------------------|--------------------------------|
| Nom vide                     | ❌ Rejet — champ obligatoire   |
| Nom > 80 caractères          | ❌ Rejet — trop long           |
| Nom contenant du HTML        | ❌ Rejet — contenu non autorisé|
| Nom valide ≤ 80 caractères   | ✅ Accepté                     |

---

## DEP-0279 — Vérification : chaque produit a un état de disponibilité valide

### Règle de validation

Le champ `dispo` de chaque produit doit correspondre à l'un des états autorisés.

### États autorisés

| Valeur         | Signification                                |
|----------------|----------------------------------------------|
| `en_stock`     | Disponible immédiatement                     |
| `rupture`      | Temporairement indisponible                  |
| `sur_commande` | Disponible sur commande (délai fournisseur)  |

### Critères

- Le champ ne doit pas être vide.
- La valeur doit être l'une des trois valeurs autorisées ci-dessus.
- Un état invalide **bloque** le chargement.

### Cas d'erreur attendus

| Cas                          | Résultat attendu              |
|------------------------------|--------------------------------|
| Champ vide                   | ❌ Rejet — champ obligatoire   |
| Valeur inconnue              | ❌ Rejet — état non reconnu    |
| Valeur autorisée             | ✅ Accepté                     |

---

## DEP-0280 — Premier chargement de catalogue de test

### Objectif

Décrire la procédure de premier chargement qui utilisera les données de démo
(DEP-0271 à DEP-0275) en appliquant toutes les validations (DEP-0276 à DEP-0279).

### Étapes du chargement

1. **Charger les catégories** — insérer les 8 catégories de DEP-0271.
2. **Charger les produits** — insérer les 12 produits de DEP-0272.
3. **Associer les images** — lier les 15 images de DEP-0273.
4. **Charger les synonymes** — insérer les 11 groupes de DEP-0274.
5. **Charger le classement** — insérer le top 5 de DEP-0275.

### Validations appliquées à chaque étape

| Étape          | Validation(s)                  |
|----------------|--------------------------------|
| Produits       | DEP-0276 (catégorie valide)    |
| Produits       | DEP-0278 (nom court valide)    |
| Produits       | DEP-0279 (disponibilité valide)|
| Images         | DEP-0277 (≥ 1 image/produit)  |

### Critères de succès

- Toutes les validations DEP-0276 à DEP-0279 passent sans erreur.
- Le catalogue contient 8 catégories, 12 produits, 15 images, 11 groupes de
  synonymes et 1 classement top 5.
- Aucune donnée orpheline (produit sans catégorie, image sans produit).

### Note

Ce chargement sera implémenté ultérieurement via un script de seed.
Le présent document définit uniquement les **spécifications attendues**.
