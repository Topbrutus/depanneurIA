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
- Blocs parcours utilisateur et pages (`DEP-0161` à `DEP-0180`) terminés
- Blocs comportements UX et dispositions (`DEP-0181` à `DEP-0200`) terminés
- Blocs système visuel de base (`DEP-0201` à `DEP-0240`) terminés
- Prochain bloc recommandé : `DEP-0241` à `DEP-0260` (structure catalogue produits)

## Observation importante

Le bloc 0001 (DEP-0001 à DEP-0010) reste complet. Le bloc GitHub de fondation (DEP-0084 à DEP-0120) est maintenant achevé : README, LICENSE, .gitignore, dossiers structurants, CONTRIBUTING, CODEOWNERS, modèles d'issues/PR, branche `develop`, protection `main`, projet `DépannVite` (Board) et labels personnalisés sont en place. Les règles de nommage des branches, commits et tags de version sont documentées dans CONTRIBUTING.md.

## État Réel Vérifié (2026-03-13)

**Terminé concrètement :**
- DEP-0001 à DEP-0010 — vision et cadrage initial
- DEP-0084 à DEP-0120 — fondation GitHub complète
- DEP-0121 à DEP-0127 — décisions techniques stack documentées (TypeScript, React, Node.js, monorepo pnpm)
- DEP-0128 à DEP-0133 — outils qualité configurés (Prettier, ESLint, TypeScript strict)
- DEP-0134 à DEP-0135 — structure monorepo définie (`apps/`, `packages/` avec workspaces)
- DEP-0136 à DEP-0140 — stratégies env et scripts documentées et implémentées
- DEP-0141 à DEP-0160 — scripts npm/pnpm créés, règles de nommage établies, ossature locale stabilisée
- DEP-0161 à DEP-0170 — cartes du site (client, dépanneur, livreur, admin) et pages principales définies
- DEP-0171 à DEP-0180 — pages secondaires définies (adresses, historique, suivi, contact, légal, accessibilité, aide vocale)
- DEP-0181 à DEP-0200 — dispositions desktop/mobile (3 sections vs empilée), emplacements composants (panier, chat, suggestions), comportements grille produits, panier et assistant
- DEP-0201 à DEP-0240 — système visuel de base complet : couleurs (principales, secondaires, états, accessibilité), typographie (Inter, échelles complètes), styles visuels des composants, icônes (Lucide), animations (7 clés), spécifications de 12 composants de base

**Fichiers de configuration créés :**
- `tsconfig.json` — configuration TypeScript 5.3+ strict
- `.eslintrc.json` — configuration ESLint avec règles React et TypeScript
- `.prettierrc` — configuration Prettier pour formatage uniforme
- `package.json` — monorepo avec workspaces pnpm et scripts dev/build/test/lint/format
- `.env.example` — modèle de variables d'environnement
- Docs decisions : DEP-0121-0127, DEP-0136-0140, DEP-0161-0170, DEP-0171-0180, DEP-0181-0200, DEP-0201-0240

**Résumé des 3 fichiers de décision DEP-0201 à DEP-0240 :**
- `DEP-0201-0210-systeme-visuel-couleurs-typo.md` — Palette de couleurs et typographie :
  - Couleurs principales (primaire `#2563EB`, positive `#10B981`, accent ambre, neutres)
  - Couleurs secondaires (indigo, cyan, violet, rose)
  - Couleurs d'état (succès, alerte, erreur, attente) et mode contraste élevé AAA ≥7:1
  - Typographie Inter sans-serif (4 graisses) + JetBrains Mono monospace
  - Échelles : titres H1–H5, corps 12–18 px, boutons 3 tailles, cartes produits
- `DEP-0211-0227-styles-et-animations.md` — Styles visuels et animations :
  - Styles de 8 composants clés : cartes produits, panier, chat assistant, suggestions, badges d'état commande, alertes dépanneur, alertes livreur, écrans de chargement
  - Bibliothèque d'icônes Lucide (DEP-0219)
  - 7 animations : ajout/retrait panier, ouverture/fermeture suggestions, changement d'état commande, alerte nouvelle commande, alerte assignation livreur
- `DEP-0228-0240-composants-ui-de-base.md` — 12 composants UI de base :
  - Bouton principal, bouton secondaire, champ de recherche, carte produit
  - Miniature panier, message assistant, message client, tuile suggestion
  - Indicateur d'état livraison, carte dernière commande, carte top 10, modal de confirmation
  - Chaque composant : variantes, tailles, états, accessibilité
  - Critères de validation avant implémentation (DEP-0240)

**Non commencé :**
- DEP-0241 à DEP-0280 — structure catalogue produits et conventions

## Manques publics actuels

Aucun manque identifié dans les blocs DEP-0084 à DEP-0160. La fondation technique est complète.

## Prochaines actions suggérées

**Bloc prioritaire : DEP-0241 à DEP-0280**

1. **DEP-0241 à DEP-0260** — Définir la structure des données du catalogue :
   - Structure des catégories, produits, variantes, photos, mots-clés
   - Structure multi-tenant et disponibilité
   - Ordre d'affichage et produits vedettes

2. **DEP-0261 à DEP-0280** — Définir les conventions du catalogue :
   - Conventions images (taille, nommage, compression, recadrage)
   - Conventions textes (descriptions, mots-clés, synonymes)
   - Jeu de données de démonstration initial

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

- DEP-0201 à DEP-0240 — système visuel de base complet : palette de couleurs complète (primaire, secondaire, états, accessibilité WCAG AA/AAA), typographie Inter avec échelles complètes (titres, corps, boutons, cartes), styles visuels de 8 composants clés, bibliothèque d'icônes Lucide, 7 animations critiques (ajout panier, suggestions, états), spécifications détaillées de 12 composants de base, checkpoint de validation avant implémentation

## En cours

- Aucune tâche actuellement en cours
- Prochaine étape : DEP-0241 à DEP-0280 (structure catalogue et conventions produits)

## Bloqueurs

- Aucun bloqueur technique identifié
- Les blocs DEP-0181+ peuvent être réalisés en se concentrant sur les comportements UX et les dispositions desktop/mobile

## Convention d'ID

- Format affiché : `DEP-0001`
