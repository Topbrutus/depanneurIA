# Operations

Runbooks, supervision, gestion des incidents et procédures d'exploitation futures.

## Stack Officielle en production

- L'infrastructure cible utilise **Google Cloud Run** pour le backend (Node.js) et les passerelles.
- Le cycle de déploiement sera orchestré via **GitHub Actions** pour assurer des builds prévisibles depuis notre monorepo **pnpm + Turborepo**.
- La stratégie exacte des conteneurs, les pipelines de métriques et les runbooks détaillés seront ajoutés dans les prochaines itérations.

## Scripts et Environnement Local

- Pour l'installation locale et la vérification de l'environnement, consultez la [Checklist d'installation locale](local-setup-checklist.md).
- Les scripts de développement (migration, seed) se trouvent dans le dossier `scripts/dev/`.
