# DépannVite — Application Web

Application web cliente pour le système depaneurIA de commande et livraison de pièces automobiles.

## Technologies

- React 18
- TypeScript
- Vite
- React Router
- Zustand (state management)
- Lucide React (icons)

## Développement

```bash
# Installation des dépendances
pnpm install

# Démarrage en mode développement
pnpm dev

# Build de production
pnpm build

# Prévisualisation du build
pnpm preview
```

## Structure

- `/src/routes/` - Pages principales de l'application
- `/src/components/shop/` - Composants de la boutique
- `/src/lib/` - Utilitaires et stores
- `/src/styles/` - Styles globaux et thématiques

## Parcours implémentés (DEP-0321 à DEP-0360)

### Mode manuel - Boutique
- Grille de produits avec navigation par catégories
- Recherche et filtres (disponibilité, popularité)
- Carte produit avec ajout au panier
- Panier visible en permanence (desktop) ou repliable (mobile)

### Gestion du panier
- Ajout/retrait de produits
- Modification des quantités
- Vidage du panier avec confirmation
- Persistance locale avec localStorage

### Finalisation de commande
- Page récapitulatif avec adresse et téléphone
- Envoi de commande (simulé)
- Page succès avec numéro de commande
- Page échec avec possibilité de réessayer
- Page suivi en temps réel

### Sections de raccourcis
- Dernière commande (recommander rapidement)
- Top 10 des produits populaires

## Catalogue de démonstration

Le catalogue de démonstration contient :
- 8 catégories (Freins, Filtres, Éclairage, Batteries, Pneus, Huiles, Bougies, Essuie-glaces)
- 12 produits répartis sur toutes les catégories
- 5 produits marqués comme populaires

## Accessibilité

- Navigation clavier complète
- Attributs ARIA appropriés
- Support de `prefers-reduced-motion`
- Labels et descriptions pour lecteurs d'écran

## Design

Basé sur le système visuel défini dans DEP-0201 à DEP-0240 :
- Couleurs principales : #2563EB (primaire), #10B981 (positive)
- Typographie : Inter (sans-serif)
- Espacements et rayons standardisés
- Animations fluides et légères

## DEP concernés

DEP-0321 à DEP-0360
# apps/web — Parcours client local (Vite + React)

Front client minimal pour depaneurIA. Objectif : tester localement l’inscription, la connexion, le profil et les adresses sans dépendance backend.

## Scripts utiles

- `pnpm dev:web` — démarre le front Vite.
- `pnpm --filter @depaneuria/web build` — build + typecheck.
- `pnpm --filter @depaneuria/web lint` — lint.

## Parcours V1 gelé

- Routes : `/signup`, `/login`, `/profile`, `/addresses`, `/` (boutique placeholder), `/404`.
- Stockage local (localStorage) du profil (nom, téléphone, notes) et des adresses multiples avec choix d’adresse par défaut.
- Validations : téléphone 10–15 chiffres, adresse complète, zone desservie (75/92/93/94) + messages d’erreur dédiés.
- Connexion par téléphone avec redirection vers la boutique et session locale réutilisable.
- Réinitialisation locale possible (reset session ou suppression de compte).
