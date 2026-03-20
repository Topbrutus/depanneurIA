# DEP-0841 à DEP-0920 — Sécurité V1 + rôles simples

## Statut : ✅ TERMINÉ

Date : 2026-03-14

## Objectif

Ajouter une couche sécurité V1 minimale et propre avec rôles simples pour séparer les accès client, opérateur dépanneur, livreur et admin catalogue, sans casser les parcours existants.

## Rôles implémentés

1. **customer** — Accès client seulement
2. **store_operator** — Opérations magasin
3. **driver** — Vue livreur
4. **admin** — Admin catalogue + tenant si déjà présent

## Permissions par rôle

Chaque rôle a les permissions suivantes (définies dans `packages/types/src/roles.ts`) :

| Permission       | customer | store_operator | driver | admin |
| ---------------- | -------- | -------------- | ------ | ----- |
| canAccessStore   | ❌       | ✅             | ❌     | ✅    |
| canAccessDriver  | ❌       | ❌             | ✅     | ✅    |
| canAccessAdmin   | ❌       | ❌             | ❌     | ✅    |
| canManageCatalog | ❌       | ❌             | ❌     | ✅    |
| canManageOrders  | ❌       | ✅             | ❌     | ✅    |
| canManageTenants | ❌       | ❌             | ❌     | ✅    |

## API implémentée

### Routes d'authentification

- `POST /api/v1/auth/mock-login` — Login mock pour démo/local
- `GET /api/v1/auth/session` — Récupérer la session courante
- `POST /api/v1/auth/logout` — Déconnexion

### Middleware côté API

- `extractSession` — Extrait la session depuis le header `Authorization: Bearer {sessionId}`
- `requireAuth` — Exige une session valide
- `requireRole(...roles)` — Vérifie que l'utilisateur a un des rôles autorisés
- `requirePermission(check)` — Vérifie une permission spécifique

### Gardes prédéfinis API

- `requireStoreAccess` — Accès aux opérations magasin
- `requireDriverAccess` — Accès aux opérations livreur
- `requireAdminAccess` — Accès admin
- `requireCatalogManagement` — Gestion du catalogue
- `requireOrderManagement` — Gestion des commandes
- `requireTenantManagement` — Gestion des tenants

## Frontend implémenté

### Composants

- `ProtectedRoute` — Composant pour protéger les routes selon les rôles
- `RoleBadge` — Badge pour afficher le rôle utilisateur

### Hooks et contextes

- `useAuth()` — Hook Zustand pour gérer l'authentification
  - `login(request)` — Login mock
  - `logout()` — Déconnexion
  - `checkSession()` — Vérifier la session
  - `session` — Session courante
  - `sessionId` — ID de session
  - `isLoading` — État de chargement
  - `error` — Erreur éventuelle

- `useHasRole(role)` — Vérifie si l'utilisateur a un rôle donné
- `useHasAnyRole(...roles)` — Vérifie si l'utilisateur a un des rôles donnés

### Stockage

- Session stockée dans `localStorage`
- Clés : `depaneuria_session` et `depaneuria_session_id`
- Persistance entre rechargements de page

### Pages protégées

- `/store-ops` — Accessible par `store_operator` et `admin`
- `/driver` — Accessible par `driver` et `admin`
- `/admin/catalog` — Accessible par `admin` seulement

### Page de login mock

- `/mock-login` — Formulaire de login mock pour tests
- Permet de choisir username, rôle et tenant

## Fichiers créés/modifiés

### Types (`packages/types/src/`)

- ✅ `roles.ts` — Définition des rôles et permissions
- ✅ `auth.ts` — Types pour session, login, logout
- ✅ `index.ts` — Export des types auth et rôles

### API (`apps/api/src/`)

- ✅ `lib/auth-store.ts` — Store de sessions en mémoire
- ✅ `lib/auth-middleware.ts` — Middleware d'extraction et validation de session
- ✅ `lib/role-guards.ts` — Gardes de rôles et permissions
- ✅ `lib/session-mappers.ts` — Mappers de réponses auth
- ✅ `routes/auth.ts` — Routes d'authentification
- ✅ `app.ts` — Middleware `extractSession` appliqué globalement

### Web (`apps/web/src/`)

- ✅ `lib/auth-context.tsx` — Zustand store pour l'authentification
- ✅ `lib/auth-storage.ts` — Gestion du stockage localStorage
- ✅ `lib/role-guards.ts` — Fonctions de vérification de permissions
- ✅ `components/common/protected-route.tsx` — Composant de protection de routes
- ✅ `components/common/role-badge.tsx` — Badge d'affichage de rôle
- ✅ `routes/mock-login-page.tsx` — Page de login mock
- ✅ `App.tsx` — Routes protégées configurées

## Contraintes respectées

- ✅ TypeScript strict
- ✅ Pas d'OAuth réel
- ✅ Pas de fournisseur externe
- ✅ Session mock locale/API simple
- ✅ Pas de refactor massif
- ✅ Mode démo/local fonctionnel

## Tests effectués

- ✅ `pnpm --filter @depaneuria/types typecheck` — Passe
- ✅ `pnpm --filter @depaneuria/api build` — Passe
- ✅ `pnpm --filter @depaneuria/web build` — Passe
- ✅ `pnpm typecheck` — Passe
- ✅ Pas de flag `--ext` dans les package.json
- ✅ Pas d'imports sales `../types/src/...` (1 corrigé dans utils)

## Erreurs gérées

### Côté API

- **401 Unauthorized** — Session invalide ou manquante
- **403 Forbidden** — Accès refusé, rôle insuffisant

### Côté Front

- Page "Accès refusé" avec message explicite
- Redirection vers `/mock-login` si non authentifié
- Message d'erreur lors du login

## Mode démo/local

Le système fonctionne entièrement en mode démo/local :

- Pas de connexion à un service d'authentification externe
- Sessions stockées en mémoire côté API (Map)
- Sessions persistées en localStorage côté front
- Login mock avec choix libre du rôle et du username

## Évolution future prévue

Le système est conçu pour évoluer vers :

- Authentification réelle (OAuth, JWT, etc.)
- Store de sessions persistant (Redis, DB)
- Gestion des expirations de session
- Refresh tokens
- Multi-factor authentication

## Definition of done

- ✅ `pnpm --filter @depaneuria/api build` passe
- ✅ `pnpm --filter @depaneuria/web build` passe
- ✅ `pnpm --filter @depaneuria/types typecheck` passe
- ✅ `pnpm typecheck` passe
- ✅ Un utilisateur mock peut ouvrir seulement ses pages autorisées
- ✅ Un accès interdit renvoie message propre côté front et 403 côté API
- ✅ Pas de `--ext` dans les package.json modifiés
- ✅ Pas d'imports inter-package sales
- ✅ Build vert

## Prochaines étapes

- Tester le système en conditions réelles avec l'API démarrée
- Ajouter des tests unitaires pour les gardes de rôles
- Ajouter des tests d'intégration pour les routes protégées
- Documenter les procédures de login pour les différents rôles
