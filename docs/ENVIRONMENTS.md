# Environnements — depaneurIA

Ce document décrit la configuration des différents environnements du projet.

## Environnements disponibles

### Development (local)

Environnement de développement local sur la machine du développeur.

**Caractéristiques :**
- Base de données SQLite locale (`dev.db`)
- Hot reload activé (API et web)
- Logs en mode verbose (debug)
- CORS permissif (localhost)
- Pas d'optimisation du build

**Variables d'environnement :**

`apps/api/.env`:
```bash
NODE_ENV=development
PORT=3001
API_HOST=0.0.0.0
DATABASE_URL="file:./dev.db"
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

`apps/web/.env`:
```bash
VITE_API_URL=http://localhost:3001
VITE_API_BASE_PATH=/api/v1
VITE_ENV=development
```

### Test

Environnement pour l'exécution des tests automatisés (CI/CD).

**Caractéristiques :**
- Base de données SQLite en mémoire
- Pas de hot reload
- Logs minimaux
- Seed de données de test

**Variables d'environnement :**

`apps/api/.env.test`:
```bash
NODE_ENV=test
PORT=3002
DATABASE_URL="file::memory:?cache=shared"
LOG_LEVEL=error
```

### Production

Environnement de production accessible aux utilisateurs finaux.

**Caractéristiques :**
- Base de données PostgreSQL (recommandé)
- Build optimisé et minifié
- Logs en mode info/warn/error uniquement
- CORS restreint au domaine de production
- Monitoring et observabilité activés

**Variables d'environnement :**

`apps/api/.env.production`:
```bash
NODE_ENV=production
PORT=3001
API_HOST=0.0.0.0
DATABASE_URL="postgresql://user:password@host:5432/depaneuria_prod"
CORS_ORIGIN=https://app.depaneuria.com
LOG_LEVEL=info
```

Variables d'environnement web (injectées au build) :
```bash
VITE_API_URL=https://api.depaneuria.com
VITE_API_BASE_PATH=/api/v1
VITE_ENV=production
```

## Séparation des environnements

### Données

- **Development** : Données de démonstration, peut être réinitialisé
- **Test** : Données éphémères, générées par les tests
- **Production** : Données réelles, backups quotidiens requis

### Secrets

- **Development** : Pas de secrets réels, valeurs par défaut
- **Test** : Secrets de test, non sensibles
- **Production** : Secrets réels, stockés de manière sécurisée (variables d'environnement, secret manager)

## Bonnes pratiques

1. **Ne jamais committer de fichiers .env** : Utiliser `.env.example` comme template
2. **Séparer les secrets** : Ne pas partager les secrets de production
3. **Valider les variables** : Utiliser `validateEnv()` au démarrage de l'API
4. **Documenter les changements** : Mettre à jour `.env.example` quand de nouvelles variables sont ajoutées
5. **Tester avant de déployer** : Toujours valider dans un environnement de test avant la production

## Migration entre environnements

### De development vers test

```bash
# Copier la structure, pas les données
pnpm --filter @depaneuria/api db:push
```

### De test vers production

```bash
# Appliquer les migrations uniquement
cd apps/api
npx prisma migrate deploy
```

## Variables d'environnement requises

### API

| Variable | Type | Défaut | Description |
|----------|------|--------|-------------|
| `NODE_ENV` | string | development | Environnement (development/test/production) |
| `PORT` | number | 3001 | Port d'écoute de l'API |
| `API_HOST` | string | 0.0.0.0 | Adresse d'écoute de l'API |
| `DATABASE_URL` | string | file:./dev.db | URL de connexion à la base de données |
| `CORS_ORIGIN` | string | http://localhost:5173 | Origine autorisée pour CORS |
| `LOG_LEVEL` | string | info | Niveau de log (error/warn/info/debug) |

### Web

| Variable | Type | Défaut | Description |
|----------|------|--------|-------------|
| `VITE_API_URL` | string | http://localhost:3001 | URL de l'API |
| `VITE_API_BASE_PATH` | string | /api/v1 | Chemin de base de l'API |
| `VITE_ENV` | string | development | Environnement (development/production) |

## Vérification de la configuration

Avant de lancer l'application, vérifier que toutes les variables requises sont définies :

```bash
# API
cd apps/api
node -e "require('./dist/lib/env.js').validateEnv()"

# Web (vérifier au build)
cd apps/web
pnpm build
```

## Support

Pour toute question sur la configuration des environnements, consulter `docs/DEPLOY.md` ou ouvrir une issue.
