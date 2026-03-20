# DEP-0151 à DEP-0158 — Conventions de nommage

## Périmètre

Définir les règles de nommage pour les fichiers, composants, routes, tables,
événements, tenants, langues et médias du projet depaneurIA V1.

---

## DEP-0151 — Nommage des fichiers

| Catégorie             | Convention                 | Exemple                           |
| --------------------- | -------------------------- | --------------------------------- |
| Composants React      | PascalCase                 | `OrderCard.tsx`                   |
| Hooks React           | camelCase, préfixe `use`   | `useOrderStatus.ts`               |
| Utilitaires / helpers | camelCase                  | `formatPrice.ts`                  |
| Types / interfaces    | camelCase                  | `order.types.ts`                  |
| Tests                 | même nom + `.test.ts`      | `formatPrice.test.ts`             |
| Fichiers de config    | kebab-case ou nom standard | `tsconfig.json`, `.eslintrc.json` |
| Dossiers              | kebab-case                 | `order-details/`                  |

## DEP-0152 — Nommage des composants React

- **Convention** : PascalCase, un composant par fichier.
- **Nom du fichier = nom du composant** : `OrderCard.tsx` exporte `OrderCard`.
- **Composants internes** : préfixe `_` interdit ; découper en sous-composants dans un dossier.
- **Composants de page** : suffixe `Page` — `OrderPage.tsx`.
- **Composants de layout** : suffixe `Layout` — `DashboardLayout.tsx`.

```
components/
├── OrderCard.tsx
├── OrderCard.test.tsx
├── ProductGrid/
│   ├── ProductGrid.tsx
│   ├── ProductGridItem.tsx
│   └── index.ts
```

## DEP-0153 — Nommage des routes

### Routes front-end (URL)

- **Convention** : kebab-case, tout en minuscules, pas de trailing slash.
- **Paramètres dynamiques** : `:id` ou `[id]` selon le framework.

| Route              | Description                   |
| ------------------ | ----------------------------- |
| `/`                | Accueil public                |
| `/boutique`        | Page boutique                 |
| `/commande/:id`    | Détail d'une commande         |
| `/connexion`       | Page de connexion             |
| `/inscription`     | Page d'inscription            |
| `/tableau-de-bord` | Dashboard (dépanneur/livreur) |
| `/admin/commandes` | Liste des commandes (admin)   |

### Routes API (endpoints)

- **Convention** : kebab-case, préfixe `/api/v1/`, noms au pluriel.

| Endpoint             | Méthode | Description                |
| -------------------- | ------- | -------------------------- |
| `/api/v1/orders`     | GET     | Liste des commandes        |
| `/api/v1/orders/:id` | GET     | Détail d'une commande      |
| `/api/v1/orders`     | POST    | Créer une commande         |
| `/api/v1/products`   | GET     | Liste des produits         |
| `/api/v1/users/me`   | GET     | Profil utilisateur courant |

## DEP-0154 — Nommage des tables de données

- **Convention** : snake_case, pluriel anglais.
- **Préfixe interdit** : pas de `tbl_`, `t_` ou autre préfixe technique.
- **Clé primaire** : `id` (UUID ou serial).
- **Clés étrangères** : `<table_singulier>_id` — ex. `order_id`, `user_id`.
- **Timestamps** : `created_at`, `updated_at`, `deleted_at` (soft delete).

| Table            | Description                                          |
| ---------------- | ---------------------------------------------------- |
| `users`          | Utilisateurs (clients, dépanneurs, livreurs, admins) |
| `orders`         | Commandes                                            |
| `order_items`    | Lignes de commande                                   |
| `products`       | Produits disponibles                                 |
| `addresses`      | Adresses de livraison                                |
| `delivery_zones` | Zones de livraison                                   |

## DEP-0155 — Nommage des événements de commande

- **Convention** : UPPER_SNAKE_CASE, verbe au passé.
- **Préfixe** : domaine de l'événement.

| Événement          | Description                         |
| ------------------ | ----------------------------------- |
| `ORDER_CREATED`    | Commande créée par le client        |
| `ORDER_CONFIRMED`  | Commande confirmée par le dépanneur |
| `ORDER_ASSIGNED`   | Commande assignée à un livreur      |
| `ORDER_PICKED_UP`  | Commande récupérée par le livreur   |
| `ORDER_DELIVERED`  | Commande livrée au client           |
| `ORDER_CANCELLED`  | Commande annulée                    |
| `PAYMENT_RECEIVED` | Paiement reçu                       |
| `PAYMENT_FAILED`   | Paiement échoué                     |

## DEP-0156 — Nommage des tenants clients

- **Convention** : slug kebab-case, unique, dérivé du nom de l'entreprise.
- **Longueur** : 3 à 50 caractères.
- **Caractères autorisés** : `[a-z0-9-]`, pas de tiret en début ou fin.

| Nom affiché        | Slug tenant          |
| ------------------ | -------------------- |
| Dépanneur Laval    | `depanneur-laval`    |
| Marché Express Mtl | `marche-express-mtl` |

## DEP-0157 — Nommage des langues

- **Convention** : codes ISO 639-1 + région ISO 3166-1 alpha-2 si nécessaire.
- **Langue par défaut** : `fr-CA` (français canadien).
- **Langues V1** : `fr-CA`, `en-CA`.

| Code    | Langue            |
| ------- | ----------------- |
| `fr-CA` | Français (Canada) |
| `en-CA` | English (Canada)  |

## DEP-0158 — Nommage des médias produits

- **Convention** : kebab-case, préfixe par type, suffixe par taille.
- **Format** : `<type>-<slug-produit>-<variante>.<ext>`

| Exemple de fichier                   | Description                  |
| ------------------------------------ | ---------------------------- |
| `product-coca-cola-355ml-thumb.webp` | Vignette du Coca-Cola 355 ml |
| `product-coca-cola-355ml-full.webp`  | Image pleine taille          |
| `hero-promo-ete-2025.webp`           | Bannière promotionnelle      |

### Règles médias

1. **Format recommandé** : WebP (fallback PNG/JPEG si nécessaire).
2. **Tailles** : `thumb` (150×150), `medium` (400×400), `full` (800×800).
3. **Pas d'espace ni de caractères spéciaux** dans les noms de fichiers.
4. **Stockage** : dossier `assets/` en dev, CDN/bucket S3 en production.

---

## Résumé des conventions

| Domaine          | Convention             | Exemple                              |
| ---------------- | ---------------------- | ------------------------------------ |
| Fichiers TS/TSX  | PascalCase / camelCase | `OrderCard.tsx`, `formatPrice.ts`    |
| Dossiers         | kebab-case             | `order-details/`                     |
| Composants React | PascalCase             | `OrderCard`                          |
| Routes URL       | kebab-case             | `/tableau-de-bord`                   |
| Routes API       | kebab-case, pluriel    | `/api/v1/orders`                     |
| Tables SQL       | snake_case, pluriel    | `order_items`                        |
| Événements       | UPPER_SNAKE_CASE       | `ORDER_CREATED`                      |
| Tenants          | kebab-case slug        | `depanneur-laval`                    |
| Langues          | ISO 639-1 + région     | `fr-CA`                              |
| Médias           | kebab-case             | `product-coca-cola-355ml-thumb.webp` |
