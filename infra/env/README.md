# Environment Variables & Secrets Strategy

## Stratégie des environnements

- **.env.example** : Modèle listant toutes les variables nécessaires. Doit être commité. Ne contient pas de valeurs sensibles.
- **.env.local** : Fichier local (ignoré par Git) contenant les vraies valeurs pour le développement.
- **Google Cloud / GitHub Secrets** : Pour les environnements de staging et production, les secrets sont injectés au build ou à l'exécution (ex: Secret Manager).

## Règles d'or

1. Ne **jamais** committer un fichier contenant des clés secrètes (API, DB, etc.).
2. Toute nouvelle variable requise par le code doit être ajoutée (vide ou avec une valeur mock) dans `.env.example`.
