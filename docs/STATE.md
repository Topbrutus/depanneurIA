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
- Blocs structure catalogue et conventions (`DEP-0241` à `DEP-0280`) terminés
- Prochain bloc recommandé : `DEP-0281` à `DEP-0320` (inscription, connexion et gestion client)

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
- DEP-0241 à DEP-0255 — modèle catalogue de base : structures catégorie (id, slug, label, hiérarchie), produit (id, catégorie, sku, label, variantes), variante (unité, conditionnement, durée de vie), photo, mot-clé, synonyme, allergie/note, disponibilité (en_stock, rupture, sur_commande), produit vedette, produit populaire, produit archivé, surcharges produit/catégorie par tenant, zones de livraison et prix internes par tenant
- DEP-0256 à DEP-0270 — conventions contenu et médias catalogue : unité de vente, image principale (1:1, CDN, alt obligatoire), images secondaires (≤4), ordre d'affichage catégories et produits, tailles images (thumb 150px, medium 400px, full 800px, hero 1200px), nommage images (`product-<slug>-<variant>-<size>.<ext>`), compression (WebP 75-90%, JPEG fallback), recadrage (produit centré, 70-85%), fond blanc #FFFFFF, textes courts (nom 25-40 car., description 50-80), descriptions longues (150-300 car.), mots-clés recherche (5-15 par produit), synonymes parlés assistant (5-20), synonymes téléphoniques agent vocal (8-25)
- DEP-0271 à DEP-0280 — jeu de démonstration et validations : 8 catégories démo (Freins, Filtres, Éclairage…), 12 produits répartis sur toutes catégories, 15 images WebP 800×800px, synonymes recherche pour 11 produits, top 5 produits populaires, validations (catégorie valide, ≥1 image, nom ≤80 car., état disponibilité valide), procédure de premier chargement catalogue

**Fichiers de configuration créés :**
- `tsconfig.json` — configuration TypeScript 5.3+ strict
- `.eslintrc.json` — configuration ESLint avec règles React et TypeScript
- `.prettierrc` — configuration Prettier pour formatage uniforme
- `package.json` — monorepo avec workspaces pnpm et scripts dev/build/test/lint/format
- `.env.example` — modèle de variables d'environnement
- Docs decisions : DEP-0121-0127, DEP-0136-0140, DEP-0161-0170, DEP-0171-0180, DEP-0181-0200, DEP-0201-0240, DEP-0241-0255, DEP-0256-0270, DEP-0271-0280

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

**Résumé des 3 fichiers de décision DEP-0241 à DEP-0280 :**
- `DEP-0241-0255-modele-catalogue-base.md` — Modèle catalogue de base :
  - Structure catégorie (id, slug, label, hiérarchie parent/enfant)
  - Structure produit (id, catégorie, sku, label, variantes, photos)
  - Structure variante (unité de valeur, conditionnement, durée de vie)
  - Structures complémentaires : photos, mots-clés, synonymes, allergènes/notes
  - Disponibilité produit (en_stock, rupture, sur_commande), vedettes et populaires
  - Produits archivés, surcharges tenant (produit, catégorie), zones de livraison, prix internes
- `DEP-0256-0270-conventions-contenu-catalogue.md` — Conventions contenu et médias :
  - Unités de vente (type, quantité, volume, libellé)
  - Images : principale 1:1 CDN avec alt obligatoire, secondaires ≤4 angles différents
  - Ordre d'affichage catégories (global, visibilité) et produits (par catégorie, épinglage, boost)
  - Tailles images (thumb 150px, medium 400px, full 800px, hero 1200px)
  - Nommage images (`product-<slug>-<variant>-<size>.<ext>`), compression WebP 75-90%
  - Recadrage (produit centré 70-85%), fond blanc #FFFFFF
  - Textes courts (nom 25-40 car., description 50-80), descriptions longues (150-300 car.)
  - Mots-clés recherche (5-15 par produit, minuscules), synonymes parlés (5-20), synonymes téléphoniques (8-25)
- `DEP-0271-0280-demo-catalogue-et-validations.md` — Jeu de démonstration et validations :
  - 8 catégories démo (Freins, Filtres, Éclairage, Batteries, Pneus, Huiles, Bougies, Essuie-glaces)
  - 12 produits répartis sur toutes catégories, 15 images WebP 800×800px
  - Synonymes recherche pour 11 produits, top 5 produits populaires
  - Validations : catégorie valide, ≥1 image, nom ≤80 car., état disponibilité valide
  - Procédure de premier chargement catalogue avec toutes validations appliquées

**Non commencé :**
- DEP-0281 à DEP-0320 — inscription, connexion et gestion client

## Manques publics actuels

Aucun manque identifié dans les blocs DEP-0084 à DEP-0160. La fondation technique est complète.

## Prochaines actions suggérées

**Bloc prioritaire : DEP-0281 à DEP-0320**

1. **DEP-0281 à DEP-0300** — Définir les parcours d'inscription et connexion client :
   - Inscription (champs obligatoires/optionnels), vérification téléphone et adresse
   - Connexion, reconnexion, réinitialisation d'accès
   - Gestion multi-adresses

2. **DEP-0301 à DEP-0320** — Définir les parcours de commande client :
   - Recherche produit, ajout au panier, validation commande
   - Suivi de commande et notifications

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

- DEP-0241 à DEP-0280 — structure catalogue produits et conventions : modèle catalogue de base (catégories, produits, variantes, photos, mots-clés, synonymes, disponibilité, vedettes, populaires, archivés, surcharges tenant, zones de livraison, prix internes), conventions contenu et médias (unités de vente, images principale/secondaires, ordre d'affichage, tailles/nommage/compression/recadrage images, textes courts/longs, mots-clés recherche, synonymes parlés/téléphoniques), jeu de démonstration (8 catégories, 12 produits, 15 images, synonymes, top 5 populaires), validations catalogue (catégorie valide, ≥1 image, nom ≤80 car., état disponibilité valide, procédure de chargement)

## En cours

- Aucune tâche actuellement en cours
- Prochaine étape : DEP-0281 à DEP-0320 (inscription, connexion et gestion client)

## Bloqueurs

- Aucun bloqueur technique identifié
- Les blocs DEP-0181+ peuvent être réalisés en se concentrant sur les comportements UX et les dispositions desktop/mobile

## Convention d'ID

- Format affiché : `DEP-0001`
