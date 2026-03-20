# DEP-0139 — Stratégie des fichiers .env cloud

## Principe

En environnement cloud (staging, production, CI), les variables d'environnement sont
injectées directement par la plateforme d'hébergement ou le système CI/CD.
Aucun fichier `.env` n'est présent sur les serveurs de production.

## Règles

1. **Pas de fichier `.env` sur les serveurs cloud** — les variables sont configurées
   directement dans l'interface ou l'API de la plateforme.
2. **Variables CI distinctes des variables de production** — les secrets de CI
   (ex. GitHub Actions) n'ont pas accès aux secrets de production.
3. **Audit des variables cloud** — la liste des variables requises par environnement
   est documentée et révisée à chaque changement de dépendance.
4. **Séparation staging / production** — les deux environnements ont leurs propres
   valeurs, jamais partagées.

## Sources par plateforme

| Plateforme       | Mécanisme de configuration                    |
| ---------------- | --------------------------------------------- |
| GitHub Actions   | `Settings > Secrets and variables > Actions`  |
| Vercel (web)     | `Project > Settings > Environment Variables`  |
| Railway / Render | Interface web ou CLI de la plateforme         |
| Docker / K8s     | `env:` dans le manifest ou secrets Kubernetes |

## Variables requises par environnement (à compléter)

Les variables exactes seront documentées dans les fichiers `.env.example` de chaque
application au fur et à mesure du développement.

### Variables globales attendues

| Variable         | Environnement | Description                              |
| ---------------- | ------------- | ---------------------------------------- |
| `NODE_ENV`       | Tous          | `development`, `staging` ou `production` |
| `DATABASE_URL`   | API           | URL de connexion PostgreSQL              |
| `JWT_SECRET`     | API           | Clé de signature des tokens JWT          |
| `OPENAI_API_KEY` | API           | Clé API OpenAI pour l'assistant          |

## Références croisées

- DEP-0136 — stratégie générale des variables d'environnement
- DEP-0137 — stratégie des secrets
- DEP-0138 — stratégie des fichiers `.env` locaux
