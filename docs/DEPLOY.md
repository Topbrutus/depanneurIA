# Guide de déploiement — depaneurIA

Ce guide explique comment déployer le projet depaneurIA en local et en production.

## Prérequis

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Accès à une base de données (SQLite en dev, PostgreSQL recommandé en prod)

## Déploiement local

### 1. Installation des dépendances

```bash
pnpm install
```

### 2. Configuration des variables d'environnement

Copier les fichiers d'exemple :

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Éditer `apps/api/.env` et `apps/web/.env` selon vos besoins.

### 3. Initialisation de la base de données

```bash
cd apps/api
npx prisma generate
npx prisma db push
pnpm db:seed  # Optionnel: charger des données de démonstration
cd ../..
```

### 4. Lancement en mode développement

Terminal 1 (API):

```bash
pnpm dev:api
```

Terminal 2 (Web):

```bash
pnpm dev:web
```

L'API sera accessible sur http://localhost:3001
L'application web sera accessible sur http://localhost:5173

## Vérification avant déploiement

Avant tout déploiement, s'assurer que tous les checks passent :

```bash
# Linter
pnpm lint

# Vérification des types
pnpm typecheck

# Build
pnpm build

# Tests
pnpm test
```

## Déploiement en production

### Build de production

```bash
# Build de tous les packages et apps
pnpm build
```

Cela génère :

- `apps/api/dist/` : API compilée
- `apps/web/dist/` : Application web statique

### Variables d'environnement en production

**API (`apps/api/.env`):**

```bash
NODE_ENV=production
PORT=3001
API_HOST=0.0.0.0
DATABASE_URL="postgresql://user:password@host:5432/dbname"
CORS_ORIGIN=https://votre-domaine.com
LOG_LEVEL=info
```

**Web:**

Les variables d'environnement web sont injectées au build-time via Vite.
Configurer dans votre système de build/CI :

```bash
VITE_API_URL=https://api.votre-domaine.com
VITE_API_BASE_PATH=/api/v1
VITE_ENV=production
```

### Lancement de l'API en production

```bash
cd apps/api

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy

# Lancer le serveur
NODE_ENV=production node dist/server.js
```

### Déploiement de l'application web

L'application web est statique. Déployer le contenu de `apps/web/dist/` sur :

- Un CDN (Cloudflare, AWS CloudFront)
- Un serveur web (Nginx, Apache)
- Une plateforme (Vercel, Netlify, GitHub Pages)

Exemple avec Nginx :

```nginx
server {
  listen 80;
  server_name votre-domaine.com;
  root /var/www/depaneuria/web/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## Health Check

L'API expose un endpoint de health check :

```bash
curl http://localhost:3001/health
```

Réponse attendue :

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-03-13T20:00:00.000Z",
    "environment": "production",
    "version": "0.1.0",
    "uptime": 123.45
  }
}
```

## Cloud Run / Docker (optionnel)

Les Dockerfiles pour API et web seront ajoutés dans une version future.
Pour l'instant, le déploiement recommandé est direct (Node.js + serveur web statique).

## Rollback

En cas de problème :

1. **API** : Redémarrer avec la version précédente du code
2. **Web** : Restaurer le contenu de `dist/` précédent
3. **Base de données** : Utiliser les migrations Prisma pour revenir en arrière

## Support

- Consulter `docs/RUNBOOK.md` pour les opérations courantes
- Consulter `docs/ENVIRONMENTS.md` pour la configuration des environnements
- Ouvrir une issue sur GitHub pour tout problème
