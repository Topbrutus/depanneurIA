# DEP-0140 — Stratégie de scripts npm / pnpm

## Gestionnaire de paquets retenu

**pnpm** — choisi pour sa gestion efficace des dépendances dans un monorepo,
son support natif des workspaces et sa rapidité d'installation.

## Organisation des scripts

### Scripts racine (définis dans `package.json` à la racine)

Les scripts racine orchestrent l'ensemble du monorepo via les workspaces pnpm.  
Ils délèguent l'exécution aux scripts de chaque application ou package.

| Script      | Commande pnpm    | Description                              |
| ----------- | ---------------- | ---------------------------------------- |
| `dev`       | `pnpm dev`       | Lance toutes les apps en développement   |
| `dev:web`   | `pnpm dev:web`   | Lance uniquement le front-end            |
| `dev:api`   | `pnpm dev:api`   | Lance uniquement l'API                   |
| `build`     | `pnpm build`     | Build complet de toutes les apps         |
| `test`      | `pnpm test`      | Exécute tous les tests                   |
| `lint`      | `pnpm lint`      | Lint de tout le code                     |
| `format`    | `pnpm format`    | Formatage de tout le code                |
| `typecheck` | `pnpm typecheck` | Vérification TypeScript sans compilation |

### Scripts d'application (définis dans chaque `apps/*/package.json`)

Chaque application définit ses propres scripts locaux (`dev`, `build`, `test`, `lint`).
Le script racine les invoque via `pnpm --filter <app-name> <script>`.

## Conventions

1. **Préférer `pnpm` à `npm` ou `yarn`** — le fichier `package.json` racine inclut
   un champ `engines` qui impose la version minimale de pnpm.
2. **Scripts idempotents** — un script peut être relancé sans effet de bord
   (ex. `build` supprime `dist/` avant de reconstruire).
3. **Pas de `preinstall` bloquant** — éviter les hooks qui cassent l'installation
   dans les environnements CI.

## Références croisées

- DEP-0141 — script pour lancer tout le projet en local
- DEP-0142 — script pour lancer seulement le front
- DEP-0143 — script pour lancer seulement l'API
