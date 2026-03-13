# STATE — depaneurIA

## Situation actuelle

- Dépôt créé : oui
- Base projet installée : oui
- `.github/copilot-instructions.md` : créé
- Code produit : pas commencé
- Système de suivi à trois : en place
- Problème principal client formulé : commande lente et incertaine (infos répétées, disponibilité inconnue)
- Branche `develop` : absente (création bloquée faute d’accès push GitHub)

## Bloc actif recommandé

- Bloc GitHub de fondation : nommage complété, branche `develop` à créer depuis `main`
- Prochain bloc recommandé : `DEP-0107` à `DEP-0110` (gouvernance GitHub)

## Observation importante

Le bloc 0001 (DEP-0001 à DEP-0010) est maintenant complet. Le bloc GitHub de fondation (DEP-0084 à DEP-0106) est en cours : README, LICENSE, .gitignore, dossier docs, CONTRIBUTING.md, CODEOWNERS, dossiers decisions/diagrams/prompts, modèles d'issue GitHub (bug, task, idée produit) et modèle de PR sont tous en place. Les dossiers de structure (apps, packages, infra, scripts, assets) sont présents. La branche `main` est présente ; la branche `develop` reste à créer (droits push requis). Les règles de nommage des branches, commits et tags de version sont documentées dans CONTRIBUTING.md.

## Manques publics actuels

- DEP-0103 — branche `develop` absente (création bloquée faute d’accès GitHub)
- DEP-0110 — projet GitHub non créé
- DEP-0111 — colonnes du projet non créées
- DEP-0112 à DEP-0119 — labels GitHub personnalisés non créés

## Prochaines actions suggérées

1. Activer la protection de la branche `main` via GitHub UI (DEP-0107)
2. Exiger des revues avant fusion via GitHub UI (DEP-0108)
3. Exiger des vérifications automatiques avant fusion via GitHub UI (DEP-0109)
4. Configurer GitHub Projects via GitHub UI (DEP-0110)
5. Créer les labels manquants (DEP-0111 à DEP-0119) dès que les droits repo sont disponibles

## Vérifications à faire dans GitHub UI (admin requis)

- DEP-0107 — Règle de protection `main` créée avec interdiction de suppression
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

- DEP-0106 — Règle de nommage des tags de version documentée dans CONTRIBUTING.md ; DEP-0102 à DEP-0105 également cochés

## En cours

- Création de la branche `develop` (bloquée par absence d’accès push)

## Bloqueurs

- Droits d’écriture GitHub requis pour créer `develop`, activer la protection de `main`, configurer le projet et créer les labels

## Convention d'ID

- Format affiché : `DEP-0001`
