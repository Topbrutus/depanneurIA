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

## Bloc actif recommandé

- Blocs GitHub de fondation (`DEP-0084` à `DEP-0120`) terminés
- Prochain bloc recommandé : `DEP-0121` à `DEP-0130` (choix stack, outils de qualité, règles de code)

## Observation importante

Le bloc 0001 (DEP-0001 à DEP-0010) reste complet. Le bloc GitHub de fondation (DEP-0084 à DEP-0120) est maintenant achevé : README, LICENSE, .gitignore, dossiers structurants, CONTRIBUTING, CODEOWNERS, modèles d'issues/PR, branche `develop`, protection `main`, projet `DépannVite` (Board) et labels personnalisés sont en place. Les règles de nommage des branches, commits et tags de version sont documentées dans CONTRIBUTING.md.

## État Réel Vérifié (2026-03-13)

**Terminé concrètement :**
- DEP-0084 à DEP-0120 — fondation GitHub complète
- Structure de dossiers de base : `apps/`, `packages/`, `scripts/`, `infra/`, `assets/`, `docs/`

**Non commencé (aucun fichier concret) :**
- DEP-0121 à DEP-0127 — décisions techniques (pas de documentation des choix stack)
- DEP-0128 à DEP-0133 — formatage, lint, qualité (aucun fichier tsconfig.json, .eslintrc, .prettierrc, package.json)
- DEP-0134 à DEP-0141 — configuration monorepo, env, scripts (dossiers créés mais vides, aucune config)

## Manques publics actuels

- DEP-0121 à DEP-0127 — documenter officiellement les choix de stack (TypeScript, React, Node.js, monorepo, npm workspaces)
- DEP-0128 à DEP-0133 — créer les fichiers de configuration qualité (Prettier, ESLint, TypeScript)
- DEP-0134 à DEP-0141 — définir et implémenter la structure monorepo concrète

## Prochaines actions suggérées

**Bloc prioritaire : DEP-0121 à DEP-0130**

1. **DEP-0121 à DEP-0127** — Documenter les décisions techniques :
   - Créer `docs/decisions/DEP-0121-DEP-0127.md` pour acter les choix de stack
   - Documenter : TypeScript (langage principal), React (frontend), Node.js (backend)
   - Documenter : monorepo npm workspaces, versions minimales requises

2. **DEP-0128 à DEP-0130** — Définir les outils qualité :
   - Documenter : Prettier pour formatage, ESLint pour lint, règles TypeScript strictes
   - Ces décisions serviront de base pour DEP-0131 à DEP-0133 (création des configs)

3. **DEP-0131 à DEP-0133** — Créer les configurations :
   - Créer tsconfig.json, .prettierrc, .eslintrc.json
   - Implémenter les décisions prises en DEP-0128 à DEP-0130

4. **DEP-0134 à DEP-0141** — Structurer le monorepo :
   - Créer package.json racine avec workspaces
   - Définir scripts npm pour dev, build, lint, format
   - Définir stratégie .env et secrets

## Vérifications à faire dans GitHub UI (admin requis)

- DEP-0107 — Règle de protection `main` active avec interdiction de suppression
- DEP-0108 — Au moins 1 revue obligatoire avant fusion sur `main`
- DEP-0109 — Status checks requis et branche à jour avant fusion

## Consignes GitHub UI

### DEP-0107 — Protection de la branche principale
- Aller dans `Settings > Branches > Branch protection rules`
- Cliquer sur `Add rule`
- Dans `Branch name pattern` : saisir `main`
- Cocher `Restrict deletions`
- Cocher `Require a pull request before merging`
- Enregistrer (`Create`)

### DEP-0108 — Revues obligatoires
- Dans la même règle de protection de `main`
- Cocher `Require a pull request before merging`
- Sous cette option, cocher `Require approvals`
- Définir le nombre minimal de revues à `1`
- (Optionnel) Cocher `Dismiss stale pull request approvals when new commits are pushed`
- Enregistrer

### DEP-0109 — Checks obligatoires
- Dans la même règle de protection de `main`
- Cocher `Require status checks to pass before merging`
- Cocher `Require branches to be up to date before merging`
- Ajouter les checks existants s'il y en a (aucun workflow CI n'est encore créé à ce stade)
- Enregistrer

### DEP-0110 — GitHub Projects
- Aller dans l'onglet `Projects` du dépôt
- Cliquer sur `Link a project` ou `New project`
- Choisir le template `Board` (tableau Kanban)
- Nommer le projet `DépannVite`
- Créer les colonnes : `À faire`, `En cours`, `En revue`, `Terminé`, `Bloqué`

## Dernière tâche terminée

- DEP-0084 à DEP-0120 — gouvernance GitHub finalisée (README, LICENSE, .gitignore, structure de dossiers, CONTRIBUTING, CODEOWNERS, templates, protection `main`, revues/checks requis, projet `DépannVite`, labels personnalisés, premier commit propre)

## En cours

- Aucune tâche actuellement en cours
- Prochaine étape : DEP-0121 à DEP-0130 (documenter et définir les décisions techniques et outils qualité)

## Bloqueurs

- Aucun bloqueur technique identifié
- Les blocs DEP-0121 à DEP-0141 peuvent être réalisés entièrement via documentation et fichiers de configuration

## Convention d'ID

- Format affiché : `DEP-0001`
