# Runbook — depaneurIA

Guide opérationnel pour le projet depaneurIA. Ce document contient les procédures communes pour les opérations, le monitoring et le dépannage.

## Opérations courantes

### Démarrage du projet

**Local:**

```bash
# Terminal 1: API
pnpm dev:api

# Terminal 2: Web
pnpm dev:web
```

**Production:**

```bash
# API
cd apps/api
NODE_ENV=production node dist/server.js

# Web (servir les fichiers statiques via nginx/autre)
```

### Arrêt gracieux

```bash
# Envoyer SIGTERM au processus Node.js
kill -TERM <pid>

# Le serveur terminera les requêtes en cours avant de s'arrêter
```

### Redémarrage

```bash
# Development
# Ctrl+C puis relancer pnpm dev:api

# Production (avec PM2 par exemple)
pm2 restart depaneuria-api
```

## Monitoring

### Health Check

Vérifier que l'API fonctionne :

```bash
curl http://localhost:3001/health

# Réponse attendue:
# {"success":true,"data":{"status":"ok",...}}
```

### Logs

**Development:**
Les logs sont affichés dans la console avec le niveau `debug`.

**Production:**
Les logs sont au format JSON structuré, niveau `info`.

Exemple de log :

```json
{
  "timestamp": "2026-03-13T20:00:00.000Z",
  "level": "info",
  "message": "Server started",
  "port": 3001
}
```

### Métriques clés à surveiller

1. **Uptime API** : `GET /health → data.uptime`
2. **Temps de réponse** : Mesurer le temps de réponse des endpoints critiques
3. **Taux d'erreur** : Surveiller les erreurs 5xx
4. **Utilisation mémoire** : `process.memoryUsage()`
5. **CPU** : Charge processeur du serveur

## Résolution de problèmes courants

### L'API ne démarre pas

**Symptôme:** Erreur au lancement de `pnpm dev:api`

**Diagnostic:**

```bash
# Vérifier les variables d'environnement
cat apps/api/.env

# Vérifier que le port n'est pas déjà utilisé
lsof -i :3001

# Vérifier la base de données
cd apps/api
npx prisma studio
```

**Solution:**

1. Vérifier que `.env` existe et contient les bonnes valeurs
2. Libérer le port 3001 si occupé
3. Régénérer le client Prisma : `npx prisma generate`
4. Réinitialiser la DB si nécessaire : `pnpm db:seed:reset`

### Le build échoue

**Symptôme:** `pnpm build` échoue

**Diagnostic:**

```bash
# Vérifier les erreurs TypeScript
pnpm typecheck

# Vérifier les erreurs de lint
pnpm lint
```

**Solution:**

1. Corriger les erreurs TypeScript
2. Corriger les erreurs ESLint
3. S'assurer que Prisma client est généré : `cd apps/api && npx prisma generate`

### Erreurs CORS

**Symptôme:** Erreurs CORS dans la console du navigateur

**Diagnostic:**

```bash
# Vérifier CORS_ORIGIN dans apps/api/.env
grep CORS_ORIGIN apps/api/.env
```

**Solution:**
Mettre à jour `CORS_ORIGIN` dans `apps/api/.env` pour correspondre à l'URL du frontend :

```bash
CORS_ORIGIN=http://localhost:5173  # Development
CORS_ORIGIN=https://app.depaneuria.com  # Production
```

### Base de données corrompue

**Symptôme:** Erreurs Prisma ou données incohérentes

**Solution:**

```bash
cd apps/api

# Development: réinitialiser complètement
pnpm db:seed:reset

# Production: appliquer les migrations
npx prisma migrate deploy
```

### Problème de performance

**Symptôme:** L'API est lente

**Diagnostic:**

1. Vérifier les logs pour identifier les requêtes lentes
2. Utiliser `/health` pour vérifier l'uptime et la santé générale
3. Vérifier la charge système (CPU, mémoire, I/O)

**Solution:**

1. Optimiser les requêtes base de données (indexes, N+1)
2. Ajouter du cache si nécessaire
3. Augmenter les ressources du serveur

## Maintenance

### Mise à jour des dépendances

```bash
# Vérifier les dépendances obsolètes
pnpm outdated

# Mettre à jour (avec prudence)
pnpm update

# Tester après mise à jour
pnpm lint && pnpm typecheck && pnpm build && pnpm test
```

### Backup de la base de données

**SQLite (development):**

```bash
cp apps/api/dev.db apps/api/dev.db.backup
```

**PostgreSQL (production):**

```bash
pg_dump -h host -U user -d depaneuria_prod > backup_$(date +%Y%m%d).sql
```

### Nettoyage

```bash
# Nettoyer node_modules et builds
pnpm clean  # Si le script existe
# ou
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm -rf apps/*/dist packages/*/dist

# Réinstaller
pnpm install
```

## Escalade

### Niveau 1 : Redémarrage

1. Redémarrer l'API
2. Vérifier le health check
3. Consulter les logs

### Niveau 2 : Investigation

1. Analyser les logs en détail
2. Vérifier la base de données
3. Vérifier les variables d'environnement

### Niveau 3 : Rollback

1. Revenir à la version précédente du code
2. Restaurer un backup de la base de données
3. Ouvrir une issue critique sur GitHub

## Contacts

- **Équipe Dev** : Consulter `docs/CONTRIBUTING.md`
- **Issues GitHub** : https://github.com/Topbrutus/depaneurIA/issues
- **Documentation** : `docs/` directory

## Logs d'incidents

Documenter chaque incident majeur :

```
Date: YYYY-MM-DD
Gravité: Critique / Majeure / Mineure
Symptôme: Description
Cause racine: Cause identifiée
Solution: Action prise
Prévention: Mesures préventives
```

Archiver dans `docs/incidents/` si nécessaire.
