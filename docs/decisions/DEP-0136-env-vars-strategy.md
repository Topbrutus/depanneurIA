# DEP-0136 — Stratégie de variables d'environnement

## Principe

Toutes les valeurs qui changent selon l'environnement (local, staging, production) sont
définies comme variables d'environnement. Aucune valeur sensible ou dépendante du contexte
n'est codée en dur dans le code source.

## Règles

1. **Jamais de valeur réelle committée** — seuls les fichiers `.env.example` sont versionnés.
2. **Préfixe par application** :
   - Variables front-end (exposées au navigateur) : `NEXT_PUBLIC_*`
   - Variables back-end uniquement : sans préfixe public
3. **Validation au démarrage** — chaque application valide ses variables requises au lancement
   et échoue explicitement si une variable obligatoire est absente.
4. **Documentation systématique** — chaque variable est documentée dans le `.env.example`
   de l'application concernée avec sa description et une valeur d'exemple.

## Niveaux d'environnement

| Environnement | Source des variables               |
| ------------- | ---------------------------------- |
| Local         | Fichier `.env.local` (non commité) |
| CI            | Secrets GitHub Actions             |
| Staging       | Variables de la plateforme cloud   |
| Production    | Variables de la plateforme cloud   |

## Fichiers concernés

- `.env.example` — racine du monorepo (variables globales)
- `apps/web/.env.example` — variables spécifiques au front-end
- `apps/api/.env.example` — variables spécifiques à l'API

## Références croisées

- DEP-0137 — stratégie des secrets
- DEP-0138 — stratégie des fichiers `.env` locaux
- DEP-0139 — stratégie des fichiers `.env` cloud
