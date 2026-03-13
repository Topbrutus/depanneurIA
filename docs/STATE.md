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
- Blocs fondation technique (`DEP-0121` à `DEP-0160`) terminés
- Prochain bloc recommandé : `DEP-0161` à `DEP-0200` (définition des interfaces et parcours utilisateur)

## Observation importante

Le bloc 0001 (DEP-0001 à DEP-0010) reste complet. Le bloc GitHub de fondation (DEP-0084 à DEP-0120) est maintenant achevé : README, LICENSE, .gitignore, dossiers structurants, CONTRIBUTING, CODEOWNERS, modèles d'issues/PR, branche `develop`, protection `main`, projet `DépannVite` (Board) et labels personnalisés sont en place. Les règles de nommage des branches, commits et tags de version sont documentées dans CONTRIBUTING.md.

## État Réel Vérifié (2026-03-13)

**Terminé concrètement :**
- DEP-0084 à DEP-0120 — fondation GitHub complète
- DEP-0121 à DEP-0127 — décisions techniques stack documentées (TypeScript, React, Node.js, monorepo pnpm)
- DEP-0128 à DEP-0133 — outils qualité configurés (Prettier, ESLint, TypeScript strict)
- DEP-0134 à DEP-0135 — structure monorepo définie (`apps/`, `packages/` avec workspaces)
- DEP-0136 à DEP-0140 — stratégies env et scripts documentées et implémentées
- DEP-0141 à DEP-0160 — scripts npm/pnpm créés, règles de nommage établies, ossature locale stabilisée

**Fichiers de configuration créés :**
- `tsconfig.json` — configuration TypeScript 5.3+ strict
- `.eslintrc.json` — configuration ESLint avec règles React et TypeScript
- `.prettierrc` — configuration Prettier pour formatage uniforme
- `package.json` — monorepo avec workspaces pnpm et scripts dev/build/test/lint/format
- `.env.example` — modèle de variables d'environnement
- Docs decisions : DEP-0121-0127, DEP-0136-0140

**Non commencé :**
- DEP-0161 à DEP-0200 — définition des parcours utilisateur et interfaces

## Manques publics actuels

Aucun manque identifié dans les blocs DEP-0084 à DEP-0160. La fondation technique est complète.

## Prochaines actions suggérées

**Bloc prioritaire : DEP-0161 à DEP-0200**

1. **DEP-0161 à DEP-0170** — Définir les parcours utilisateur :
   - Écrire la carte complète du site côté client
   - Écrire la carte complète du site côté dépanneur
   - Écrire la carte complète du site côté livreur
   - Définir les pages principales (accueil, boutique, mode assisté, connexion, profil)

2. **DEP-0171 à DEP-0180** — Définir les pages secondaires :
   - Pages d'adresses client, historique commandes, suivi de commande
   - Pages de contact, conditions d'utilisation, confidentialité
   - Pages d'aide vocale et d'accessibilité

3. **DEP-0181 à DEP-0200** — Définir les comportements UX :
   - Dispositions desktop et mobile (3 sections vs empilée)
   - Comportements du panier, du chat assistant, des suggestions
   - Comportements de l'assistant selon différents contextes utilisateur

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

- DEP-0121 à DEP-0160 — fondation technique complète (stack TypeScript/React/Node.js, configs qualité, monorepo pnpm, scripts dev/build/test, stratégies env/secrets, règles de nommage, ossature locale stabilisée)

## En cours

- Aucune tâche actuellement en cours
- Prochaine étape : DEP-0161 à DEP-0200 (définition des parcours utilisateur et interfaces)

## Bloqueurs

- Aucun bloqueur technique identifié
- Les blocs DEP-0161+ peuvent être réalisés en se concentrant sur la documentation des interfaces et parcours utilisateur

## Convention d'ID

- Format affiché : `DEP-0001`
