# STATE — depaneurIA

## Situation actuelle

- Dépôt créé : oui
- Base projet installée : oui
- `.github/copilot-instructions.md` : créé
- Code produit : pas commencé
- Système de suivi à trois : en place
- Problème principal client formulé : commande lente et incertaine (infos répétées, disponibilité inconnue)
- Branche `develop` : créée et alignée sur `main`
- Protection `main` : active (PR obligatoire, suppression interdite, 1 revue, branches à jour, status checks requis)
- Projet GitHub : `DépannVite` (Board) avec colonnes À faire, En cours, En revue, Terminé, Bloqué
- Labels personnalisés créés : DEP-0112 à DEP-0119 (domaines, priorités, risques, V1/V2, blocages)
- Premier commit de base enregistré

## Ossature technique en place

L'ossature technique du monorepo est complète. Fichiers racine vérifiés :

| Fichier / Dossier            | Rôle                                            |
|------------------------------|------------------------------------------------|
| `package.json`               | Monorepo pnpm, scripts dev/build/test/lint/format/typecheck, Node ≥20, pnpm ≥9 |
| `pnpm-workspace.yaml`        | Définition des workspaces (`apps/*`, `packages/*`) |
| `tsconfig.json`              | Configuration TypeScript stricte (ES2022, bundler, React JSX) |
| `.eslintrc.json`             | ESLint + TypeScript + React + Prettier + import order |
| `.eslintignore`              | Exclusions lint                                  |
| `.prettierrc`                | Prettier (single quotes, semi, 100 cols, LF)    |
| `.prettierignore`            | Exclusions formatage                             |
| `.env.example`               | Template des variables d'environnement           |
| `.gitignore`                 | Exclusions Git standard                          |
| `scripts/dev.sh`             | Script shell pour lancer tout le projet en local |
| `apps/web/README.md`         | Structure prévue du front-end (Next.js/React)    |
| `apps/api/README.md`         | Structure prévue de l'API (Node.js/Express)      |
| `packages/types/README.md`   | Types TypeScript partagés                        |
| `packages/ui/README.md`      | Composants React partagés                        |
| `packages/utils/README.md`   | Utilitaires partagés                             |

Décisions documentées dans `docs/decisions/` :
- `DEP-0121-DEP-0127.md` — choix stack (TS, React, Node, monorepo, pnpm, Node 20, TS 5.3)
- `DEP-0136-env-vars-strategy.md` — stratégie variables d'environnement
- `DEP-0137-secrets-strategy.md` — stratégie des secrets
- `DEP-0138-env-local.md` — stratégie .env locaux
- `DEP-0139-env-cloud.md` — stratégie .env cloud
- `DEP-0140-scripts-strategy.md` — stratégie scripts pnpm

## État Réel Vérifié (2026-03-13)

**Terminé concrètement :**
- DEP-0001 à DEP-0010 — vision et cadrage initial
- DEP-0084 à DEP-0120 — fondation GitHub complète
- DEP-0121 à DEP-0141 — décisions techniques, configurations qualité, structure monorepo, stratégie env/scripts

**Preuves par fichier :**
- DEP-0121–0127 → `docs/decisions/DEP-0121-DEP-0127.md`
- DEP-0128 → `.prettierrc`, `.prettierignore`
- DEP-0129 → `.eslintrc.json`, `.eslintignore`
- DEP-0130 → `tsconfig.json` (strict mode complet), `.eslintrc.json` (règles qualité)
- DEP-0131 → `tsconfig.json`
- DEP-0132 → `.prettierrc`
- DEP-0133 → `.eslintrc.json`
- DEP-0134 → `apps/web/README.md`, `apps/api/README.md`
- DEP-0135 → `packages/types/README.md`, `packages/ui/README.md`, `packages/utils/README.md`
- DEP-0136 → `docs/decisions/DEP-0136-env-vars-strategy.md`, `.env.example`
- DEP-0137 → `docs/decisions/DEP-0137-secrets-strategy.md`
- DEP-0138 → `docs/decisions/DEP-0138-env-local.md`
- DEP-0139 → `docs/decisions/DEP-0139-env-cloud.md`
- DEP-0140 → `docs/decisions/DEP-0140-scripts-strategy.md`, `package.json` (scripts)
- DEP-0141 → `scripts/dev.sh`, `package.json` (`pnpm dev`)

## Bloc actif

- **DEP-0142 à DEP-0160** — scripts manquants, règles de nommage, vérification locale, stabilisation

## Dernière tâche terminée

- DEP-0121 à DEP-0141 — ossature technique complète (stack, configs, monorepo, env, scripts)

## En cours

- DEP-0142 à DEP-0160 — compléter scripts, ajouter conventions de nommage, vérifier l'environnement local

## Bloqueurs

- Aucun bloqueur technique identifié

## Prochain bloc recommandé (après DEP-0160)

- **DEP-0161 à DEP-0170** — cartes du site et définition des pages (aucun code produit, uniquement documentation UX)

## Convention d'ID

- Format affiché : `DEP-0001`
