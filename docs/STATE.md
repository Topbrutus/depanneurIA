# STATE — depaneurIA

## Mise à jour — 2026-03-13 (DEP-0103, DEP-0107 à DEP-0119)

**CI et gardes de merge installés sur `copilot/r5-ci-smoke-guards` :**

- `.github/workflows/ci.yml` — Install → Lint → Typecheck → Test → Build sur chaque PR
- `.github/workflows/smoke.yml` — vérification structure monorepo + scripts + docs sur chaque PR
- `scripts/smoke-local.sh` — validation locale complète avant push
- `scripts/verify-monorepo.sh` — intégrité monorepo (workspaces, scripts, fichiers clés)
- `apps/web/package.json`, `apps/api/package.json` — stubs workspace créés
- `packages/types/package.json`, `packages/ui/package.json`, `packages/utils/package.json` — stubs workspace créés
- `docs/GITHUB-SETUP.md` — checklist manuelle GitHub (branche develop, protection main, labels, project board)
- `docs/RELEASE-CHECKLIST.md` — checklist release et merge

**Reste manuel (voir docs/GITHUB-SETUP.md) :**
- Créer branche `develop`
- Activer protection de `main` avec checks CI obligatoires
- Activer protection de `develop`
- Créer les 16 labels personnalisés
- Créer le project board `DépannVite`

## Situation actuelle

- Dépôt créé : oui
- Base projet installée : oui
- `.github/copilot-instructions.md` : créé
- Code produit : pas commencé
- Système de suivi à trois : en place
- Saisie vocale web V1 : bouton micro start/stop, statuts écoute/transcription/erreur et fallback si non support (branche `copilot/r6-voice-web-v1`)
- Problème principal client formulé : commande lente et incertaine (infos répétées, disponibilité inconnue)
- Branche `develop` : ❌ **absente** (n'existe pas dans le dépôt distant)
- Protection `main` : ❌ **absente** (`main` n'est pas protégée, `protected: false`)
- Projet GitHub `DépannVite` : ❓ **non vérifiable** par API (aucune preuve de son existence)
- Labels personnalisés (DEP-0112 à DEP-0119) : ❌ **absents** (seuls les labels GitHub par défaut existent : `bug`, `enhancement`, `documentation`, `duplicate`)
- Premier commit de base enregistré

## Bloc actif recommandé

- Bloc vision initiale (`DEP-0001` à `DEP-0010`) terminé
- Blocs GitHub de fondation (`DEP-0084` à `DEP-0120`) **partiellement** terminés — fichiers et dossiers créés, mais branche `develop`, protection `main`, projet GitHub et labels personnalisés manquants
- Blocs fondation technique (`DEP-0121` à `DEP-0160`) terminés
- Blocs parcours utilisateur et pages (`DEP-0161` à `DEP-0180`) terminés
- Blocs comportements UX et dispositions (`DEP-0181` à `DEP-0200`) terminés
- Blocs système visuel de base (`DEP-0201` à `DEP-0240`) terminés
- Blocs structure catalogue et conventions (`DEP-0241` à `DEP-0280`) terminés
- Blocs identité client, parcours et panier (`DEP-0281` à `DEP-0360`) terminés
- Blocs assistant texte et voix (`DEP-0361` à `DEP-0440`) terminés
- Blocs téléphonie et rattachement API (`DEP-0441` à `DEP-0480`) terminés
- Bloc réception dépanneur — base (`DEP-0481` à `DEP-0494`) terminé
- Bloc réception dépanneur — actions et tableau de bord (`DEP-0495` à `DEP-0514`) terminé ✅
- Prochain bloc recommandé : **DEP-0601 à DEP-0640** (admin catalogue V1 + inventaire minimal)

## Observation importante

Le bloc 0001 (DEP-0001 à DEP-0010) est complet. Le bloc GitHub de fondation (DEP-0084 à DEP-0120) est **partiellement** achevé : README, LICENSE, .gitignore, dossiers structurants, CONTRIBUTING, CODEOWNERS, modèles d'issues/PR et premier commit sont en place. En revanche, la branche `develop`, la protection de `main`, le projet GitHub `DépannVite` et les labels personnalisés **n'ont pas été vérifiés comme existants** et sont documentés comme manquants. Les règles de nommage des branches, commits et tags de version sont documentées dans CONTRIBUTING.md.

## État Réel Vérifié (2026-03-13)

**Terminé concrètement :**
- DEP-0001 à DEP-0010 — vision et cadrage initial
- DEP-0084 à DEP-0106, DEP-0120 — fondation GitHub partielle (fichiers, dossiers, templates, nommage, premier commit)
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

## Parcours client gelé (DEP-0281 à DEP-0320)

- Front local `apps/web` (Vite + React Router) avec routes `/signup`, `/login`, `/profile`, `/addresses` et 404.
- Stockage local (localStorage) du profil client (nom, téléphone, notes) et des adresses multiples avec sélection d’adresse par défaut et consignes.
- Validations côté front : téléphone 10–15 chiffres, adresse complète, zone desservie (75/92/93/94) avec messages d’erreur dédiés (adresse incomplète, téléphone invalide, zone non desservie, compte incomplet).
- Connexion simple par téléphone avec session locale et redirection immédiate vers la boutique (`/`).
- Réinitialisation locale possible (reset session ou suppression de compte) et persistance du profil/adresses à la réouverture.

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
- DEP-0011 à DEP-0083 — cadrage V1 détaillé, politiques, logique commandes
- DEP-0281 à DEP-0320 — inscription, connexion et gestion client

**Non complété (réglages GitHub manquants) :**
- DEP-0103 — branche `develop` (n'existe pas)
- DEP-0107 — protection de `main` (non active)
- DEP-0108 — revues obligatoires (non actives)
- DEP-0109 — vérifications automatiques (non actives)
- DEP-0110 — projet GitHub `DépannVite` (non vérifiable)
- DEP-0111 — colonnes du projet GitHub (non vérifiable)
- DEP-0112 à DEP-0114 — labels par domaine, priorité, risque (absents)
- DEP-0115 à DEP-0119 — labels V1, V2, Bug critique, Blocage cloud, Blocage téléphonie (absents)

## Manques publics actuels

Les réglages GitHub suivants sont documentés comme manquants (vérification du 2026-03-13) :

| DEP | Élément | État vérifié |
|-----|---------|-------------|
| DEP-0103 | Branche `develop` | ❌ Absente — seules `main` et des branches `copilot/*` existent |
| DEP-0107 | Protection de `main` | ❌ Absente — `main` n'est pas protégée (`protected: false`) |
| DEP-0108 | Revues obligatoires | ❌ Absentes — pas de règle de protection active |
| DEP-0109 | Checks obligatoires | ❌ Absents — pas de règle de protection active |
| DEP-0110 | Projet GitHub `DépannVite` | ❓ Non vérifiable par API |
| DEP-0111 | Colonnes du projet | ❓ Non vérifiable par API |
| DEP-0112–0114 | Labels domaine/priorité/risque | ❌ Absents |
| DEP-0115 | Label V1 | ❌ Absent |
| DEP-0116 | Label V2 | ❌ Absent |
| DEP-0117 | Label Bug critique | ❌ Absent |
| DEP-0118 | Label Blocage cloud | ❌ Absent |
| DEP-0119 | Label Blocage téléphonie | ❌ Absent |

Labels GitHub existants (par défaut uniquement) : `bug`, `enhancement`, `documentation`, `duplicate`.

La fondation technique (DEP-0121 à DEP-0160) est complète. Les blocs de documentation décisionnelle (DEP-0161 à DEP-0280) sont complets.

## Prochaines actions suggérées

**Prochain bloc documentation : DEP-0515 à DEP-0534** (fin réception dépanneur + interface livreur de base)

**Réglages GitHub manquants (admin requis, à compléter quand accès disponible) :**

1. **DEP-0103** — Créer la branche `develop` depuis `main`
2. **DEP-0107 à DEP-0109** — Activer la protection de `main` (PR obligatoire, revues, checks)
3. **DEP-0110 à DEP-0111** — Créer le projet GitHub `DépannVite` avec colonnes
4. **DEP-0112 à DEP-0119** — Créer les labels personnalisés

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

- DEP-0495 à DEP-0514 — actions et tableau de réception dépanneur : 13 actions opérationnelles (marquer en préparation, marquer prête, assigner à un livreur, annuler, modifier avant départ, appeler le client, message automatique, signaler article manquant, proposer remplacement, marquer payé/non payé/problème livraison, rouvrir), logique de priorité (tri par statut + SLA + incidents), logique d'horodatage (12 champs timestamp par événement), journal d'activité (timeline immuable avec acteur/action/statuts avant-après), tableau de bord réception (bandeau KPI, filtres, onglets, split view), vue détaillée commande (chrono, contact, livraison, articles, paiement, journal), boutons acceptation et refus (UI + accessibilité clavier)
- DEP-0601 à DEP-0640 — module admin catalogue V1 : vue admin catalogue, filtres catégorie/disponibilité/popularité/recherche, liste et création/édition produit, activation/désactivation, changement prix, stock et stock minimal, marquage populaire, validations API et stockage Prisma synchronisés avec le catalogue client
- DEP-0641 à DEP-0680 — multi-tenant V1 : système de tenant complet avec store mémoire, middleware de résolution, routes API scoped par tenant, contexte React, sélecteurs UI pour admin/opérateur/livreur, compatibilité rétro avec tenant par défaut
- DEP-0921 à DEP-1000 — cloud deployment V1 : fichiers .env.example (API/web), gestion variables environnement (env.ts), logger structuré JSON (logger.ts), middleware erreurs HTTP (http-errors.ts), endpoint /health pour monitoring, runtime-config.ts pour web, documentation complète (DEPLOY.md, ENVIRONMENTS.md, RUNBOOK.md), CI verte avec toutes corrections ESLint et TypeScript appliquées

## En cours

- Prochaine étape : **DEP-0761 à DEP-0800** (bloc suivant après cloud deployment V1)

## Multi-tenant V1 — DEP-0641 à DEP-0680

Ajouté dans cette PR :
- `packages/types/src/tenant.ts` — type `Tenant` et constante `DEFAULT_TENANT_ID`
- `apps/api/src/lib/tenant-store.ts` — store mémoire avec 2 tenants de démonstration
- `apps/api/src/lib/tenant-context.ts` — middleware de résolution tenant
- `apps/api/src/lib/tenant-mappers.ts` — mappers de réponse tenant
- `apps/api/src/routes/tenants.ts` — routes multi-tenant (GET /tenants, GET/POST scoped par tenant)
- `apps/web/src/lib/tenant-api.ts` — client API tenant côté front
- `apps/web/src/lib/tenant-context.tsx` — React context pour le tenant courant
- `apps/web/src/components/admin/tenant-selector.tsx` — sélecteur tenant pour admin
- `apps/web/src/components/store/tenant-filter.tsx` — filtre tenant pour opérateur
- `apps/web/src/components/driver/tenant-filter.tsx` — filtre tenant pour livreur
- Pages admin, opérateur et livreur mises à jour avec sélection de tenant
- Routes existantes conservées pour compatibilité rétro (tenant par défaut)

## Bloqueurs

- DEP-0103, DEP-0107 à DEP-0119 requièrent un accès admin GitHub pour être complétés
- Aucun bloqueur technique sur les blocs de documentation

## Convention d'ID

- Format affiché : `DEP-0001`
