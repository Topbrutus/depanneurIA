# Deployment

Chemin de déploiement de GitHub vers Google Cloud (stratégie CI/CD).

## Stratégie d'Environnement et Secrets

- **Variables locales** : Un fichier \`.env.local\` (non versionné) est utilisé pour le développement local.
- **Variables cloud** : Les configurations par environnement sont stockées dans le cloud.
- **Secrets** : Les clés d'API (Google Cloud, téléphonie, base de données) sont gérées de manière sécurisée (ex. Google Cloud Secret Manager, GitHub Secrets) et ne doivent **jamais** être commitées dans le code source.
- **\`.env.example\`** : Un fichier de modèle contenant la liste exhaustive des variables requises, sans valeurs sensibles. Chaque nouvelle dépendance à une variable d'environnement doit y être documentée.
