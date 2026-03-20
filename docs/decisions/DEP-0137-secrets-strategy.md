# DEP-0137 — Stratégie des secrets

## Principe

Un secret est une donnée confidentielle dont la divulgation compromettrait la sécurité
du système : clé API, mot de passe de base de données, clé JWT, token d'accès tiers.

## Règles absolues

1. **Aucun secret dans le dépôt Git** — ni dans le code, ni dans les fichiers de config,
   ni dans l'historique des commits.
2. **Aucun secret en clair dans les logs** — les outils de journalisation masquent
   automatiquement les valeurs sensibles connues.
3. **Rotation régulière** — les secrets de production sont rotés au minimum annuellement
   ou immédiatement après suspicion de fuite.
4. **Principe du moindre privilège** — chaque application ne reçoit que les secrets
   dont elle a strictement besoin.

## Sources autorisées par environnement

| Environnement | Source autorisée                           |
| ------------- | ------------------------------------------ |
| Local         | Fichier `.env.local` (jamais commité)      |
| CI            | GitHub Actions Secrets (chiffrés)          |
| Staging       | Variables d'environnement de la plateforme |
| Production    | Variables d'environnement de la plateforme |

## En cas de fuite suspectée

1. Révoquer immédiatement le secret concerné.
2. Générer un nouveau secret.
3. Mettre à jour tous les environnements concernés.
4. Inspecter l'historique Git avec `git log -p` pour confirmer l'absence de trace.
5. Si commité par erreur : purger l'historique avec `git filter-repo` et forcer le push.

## Références croisées

- DEP-0136 — stratégie générale des variables d'environnement
- DEP-0138 — stratégie des fichiers `.env` locaux
- DEP-0139 — stratégie des fichiers `.env` cloud
