# DEP-0795 à DEP-0814 — Messages d'erreur et base CI/qualité

## Périmètre

Ce document fige les décisions pour 20 items contigus :

- DEP-0795 à DEP-0797 : messages d'erreur (accès refusé, session expirée, trop de tentatives)
- DEP-0798 à DEP-0800 : contrôles d'isolement des données et gel sécurité V1
- DEP-0801 à DEP-0806 : intentions de workflows GitHub Actions (lint, tests, build, déploiements dev/staging/production)
- DEP-0807 à DEP-0810 : authentification OIDC GitHub → Google Cloud, absence de clés longue durée, pipeline qualité avant fusion, pipeline de publication de version
- DEP-0811 à DEP-0814 : exigences minimales de tests unitaires (panier, catalogue, assistant texte, assistant voix web)

Contrainte absolue : documentation uniquement — aucun workflow ou code n'est créé ou modifié ici.

---

## DEP-0795 — Messages d'erreur d'accès refusé

### Objectif

Définir un message unique et cohérent lorsque l'utilisateur n'a pas les droits requis.

### Message canonique

| Surface         | Message utilisateur (FR)                                                                              | Clé i18n (EN)                   | Comportement technique                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Web / mobile    | « Accès refusé. Vous n'avez pas les droits pour cette action. »                                       | `auth.error.access_denied`      | HTTP 403 ; ne pas divulguer l'existence ou l'état de la ressource ; proposer un lien retour ou contact support |
| API             | Payload JSON `{ "error": "access_denied", "message": "Access denied" }`                               | `auth.error.access_denied`      | HTTP 403 ; pas de détail sur la ressource ni sur les rôles manquants                                           |
| Assistant texte | « Je ne peux pas faire cette action pour vous. Essayez une autre demande ou contactez le dépanneur. » | `assistant.error.access_denied` | Conversation clôturée proprement, event de refus journalisé                                                    |

### Règles

- Le message est identique quel que soit le rôle (client, dépanneur, livreur, admin, super admin) pour éviter de révéler des permissions internes.
- L'événement est journalisé au niveau `warn` avec l'ID utilisateur, le rôle et l'ID de tenant (masqué si nécessaire).
- Aucun retry automatique : l'utilisateur doit changer d'action ou demander une permission différente.

---

## DEP-0796 — Messages d'erreur session expirée

### Objectif

Informer clairement de l'expiration de session sans perte de contexte utile pour l'utilisateur.

### Message canonique

| Surface         | Message utilisateur (FR)                                              | Clé i18n (EN)                     | Comportement technique                                                                                             |
| --------------- | --------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Web / mobile    | « Votre session a expiré. Merci de vous reconnecter pour continuer. » | `auth.error.session_expired`      | HTTP 401 ; redirection vers la page de connexion ; conserver le panier et les brouillons en stockage local chiffré |
| API             | `{ "error": "session_expired", "message": "Session expired" }`        | `auth.error.session_expired`      | HTTP 401 ; pas de réauth automatique ; header `WWW-Authenticate` absent pour éviter fuite de stack                 |
| Assistant texte | « Votre session est terminée. Reconnectez-vous pour reprendre. »      | `assistant.error.session_expired` | Demande explicite de reconnexion, pas de poursuite des actions en attente                                          |

### Règles

- Effacer les tokens expirés mais conserver le panier, la conversation locale et les brouillons non envoyés tant qu'ils ne contiennent pas de secrets.
- Journaliser l'événement au niveau `info` avec horodatage et tenant.
- Ne jamais réexposer un refresh token expiré ou rejeté.

---

## DEP-0797 — Messages d'erreur trop de tentatives

### Objectif

Informer l'utilisateur qu'une limite de tentatives est atteinte tout en indiquant le délai avant nouvel essai.

### Message canonique

| Surface         | Message utilisateur (FR)                                                      | Clé i18n (EN)                       | Comportement technique                                                                              |
| --------------- | ----------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| Web / mobile    | « Trop de tentatives. Réessayez dans {{delay}}. »                             | `auth.error.too_many_attempts`      | HTTP 429 ; afficher le temps restant (format mm:ss) ; désactiver temporairement les champs d'action |
| API             | `{ "error": "too_many_attempts", "retry_after": <seconds> }`                  | `auth.error.too_many_attempts`      | HTTP 429 ; header `Retry-After` renseigné ; pas de détail sur le type exact de tentative            |
| Assistant texte | « Je dois faire une pause après plusieurs essais. Réessayez dans {{delay}}. » | `assistant.error.too_many_attempts` | Bloquer l'action concernée jusqu'à expiration de la fenêtre ; ne pas clore la conversation          |

### Règles

- Les limites suivent les stratégies DEP-0775 (assistant) et DEP-0776 (téléphonie) et les tentatives d'authentification standards (5 échecs login/OTP sur 10 minutes → blocage 15 minutes).
- Les horodatages de blocage sont propres à chaque tenant et au type d'action (auth, assistant, appel).
- Un compteur est réinitialisé automatiquement à la fin de la fenêtre ; aucun blocage permanent en V1.

---

## DEP-0798 — Vérifier qu’un dépanneur ne voit jamais les données d’un autre

### Objectif

Garantir l'étanchéité des données multi-tenant pour le rôle dépanneur.

### Règles et contrôles

- Toutes les requêtes dépanneur portent un `tenant_id` obligatoire (provenant du token) qui filtre les données en base et en cache.
- Aucune jointure ou agrégation trans-tenant n'est autorisée côté dépanneur ; les statistiques et journaux sont scindés par tenant.
- Les URL, identifiants et horodatages affichés ne doivent pas révéler d'ID d'un autre tenant (même haché).
- Les exports, téléchargements et logs déclenchés par un dépanneur sont tagués par `tenant_id` et rejetés si le scope ne correspond pas.

### Vérifications attendues

- Tests automatisés d'accès croisé : un token dépanneur tenant A ne peut pas lister, lire, modifier ni exporter des données du tenant B (réponse 403 générique).
- Tests UI : changement d'onglet ou d'URL ne permet pas de charger les données d'un autre tenant (routeur protège et API filtre).
- Audit logging : toute tentative croisée déclenche un log `warn` avec hash de session, pas de données sensibles.

---

## DEP-0799 — Vérifier qu’un livreur ne voit que ses livraisons autorisées

### Objectif

Limiter la visibilité du livreur aux livraisons qui lui sont assignées ou rendues explicitement disponibles par son tenant.

### Règles et contrôles

- Le scope du token livreur inclut `tenant_id` et la liste des livraisons éligibles (assignées ou disponibles).
- La liste des livraisons affichées est filtrée par tenant + statut + affectation ; aucune livraison d'un autre livreur n'est visible.
- Les actions (accepter, refuser, partir, arrivée) valident que la livraison est toujours éligible pour ce livreur juste avant l'écriture.
- Les pièces jointes (preuves, photos) ne sont consultables que pour les livraisons autorisées.

### Vérifications attendues

- Tests API : lecture ou mutation d'une livraison non éligible renvoie HTTP 403 avec message DEP-0795.
- Tests UI : rafraîchir ou manipuler l'URL directe d'une livraison non assignée affiche l'erreur d'accès refusé sans fuite de métadonnées.
- Journaux : tentative non autorisée notée en `warn` avec `delivery_id` pseudonymisé et `tenant_id`.

---

## DEP-0800 — Geler la sécurité V1 raisonnable

### Objectif

Figer l'ensemble des décisions sécurité V1 pour éviter toute dérive avant lancement.

### Portée du gel

- Authentification et sessions : DEP-0761 à DEP-0774.
- Limitations et logs : DEP-0775 à DEP-0794.
- Messages d'erreur : DEP-0795 à DEP-0797.
- Isolation multi-tenant : DEP-0635 à DEP-0654 et contrôles DEP-0798 à DEP-0799.
- Secrets et déploiements : OIDC (DEP-0807), absence de clés longue durée (DEP-0808), pipelines CI/CD décrits en DEP-0801 à DEP-0806.

### Règles

- Toute modification de portée ou de mécanisme nécessite un nouveau DEP ou une révision explicite.
- Les audits internes vérifient trimestriellement la conformité aux gels V1 (permissions, journaux, OIDC, absence de clés statiques).
- Aucun service ou port non listé dans les décisions gelées ne peut être exposé en V1.

---

## DEP-0801 — GitHub Actions pour le lint

### Intention de workflow

- Déclencheurs : `pull_request` vers `main` et `push` sur `main`.
- Environnement : Node.js 20.x, pnpm 9, cache pnpm/Node activé.
- Étapes : checkout → install (pnpm install) → `pnpm lint`.
- Sortie attendue : status check bloquant avant merge ; rapports linters dans les logs, pas d'artifacts sensibles.

### Règles

- Le workflow ne déploie rien et ne touche aucun secret GCP.
- Exécution obligatoire sur chaque PR ; échec = merge bloqué (voir DEP-0809).

---

## DEP-0802 — GitHub Actions pour les tests

### Intention de workflow

- Déclencheurs : `pull_request` vers `main` et `push` sur `main`.
- Environnement : Node.js 20.x, pnpm 9.
- Étapes : checkout → install → `pnpm test` (packages + apps) → publication des rapports de couverture si existants (sans données sensibles).
- Sortie attendue : status check bloquant ; temps cible < 10 minutes.

### Règles

- Les tests ne doivent jamais appeler des services externes en production ; utiliser des doubles/mocks.
- Les logs de test ne doivent pas contenir de secrets ou tokens.

---

## DEP-0803 — GitHub Actions pour le build

### Intention de workflow

- Déclencheurs : `pull_request` vers `main`, `push` sur `main`, et sur tag de version (`v*.*.*`) pour préparer la publication.
- Environnement : Node.js 20.x, pnpm 9.
- Étapes : checkout → install → `pnpm build` → artefacts de build stockés comme artefacts chiffrés si besoin d'inspection.
- Sortie attendue : status check bloquant ; échec si typecheck ou build TS/Web échoue.

### Règles

- Aucune publication d'image ou de binaire dans ce workflow (build sec).
- Doit dépendre du succès des workflows lint et tests dans la même exécution de pipeline.

---

## DEP-0804 — GitHub Actions pour le déploiement développement

### Intention de workflow

- Déclencheurs : `push` sur une branche dédiée `dev` ou déclencheur manuel `workflow_dispatch`.
- Conditions préalables : lint/tests/build réussis (DEP-0801 à DEP-0803) sur le même commit.
- Étapes : checkout → install → build → authentification OIDC (DEP-0807) → build/push image vers Artifact Registry `dev` → déploiement Cloud Run env `dev` → smoke test HTTP 200.
- Environnement GitHub : `dev` avec approbation requise si activée.

### Règles

- Aucun secret statique ; seuls les identifiants OIDC sont utilisés.
- Nettoyage optionnel des révisions Cloud Run obsolètes après déploiement.

---

## DEP-0805 — GitHub Actions pour le déploiement préproduction (staging)

### Intention de workflow

- Déclencheurs : `push` sur branche `main` avec label `release:staging` ou `workflow_dispatch` depuis un commit déjà déployé en dev.
- Conditions préalables : lint/tests/build verts et déploiement dev réussi.
- Étapes : checkout → install → build → authentification OIDC → déploiement Cloud Run env `staging` (alias préproduction) → smoke test HTTP 200 + vérification des variables d'env sensibles présentes.
- Environnement GitHub : `staging` protégé avec approbation manuelle obligatoire.

### Règles

- Aucun accès en écriture aux données de production.
- Les URLs et logs de staging ne doivent pas être publiques ; masquage des données de test conservé.

---

## DEP-0806 — GitHub Actions pour le déploiement production

### Intention de workflow

- Déclencheurs : tag `v*.*.*` créé depuis `main` ou `workflow_dispatch` explicite approuvé.
- Conditions préalables : pipelines lint/tests/build verts, déploiement staging réussi et validé.
- Étapes : checkout → install → build → authentification OIDC → déploiement Cloud Run env `production` → smoke test HTTP 200 → notification (Slack/email) avec lien de révision déployée.
- Environnement GitHub : `production` avec approbation manuelle et restrictions d'exécution.

### Règles

- Rollback documenté : possibilité de revenir à la révision précédente Cloud Run en < 10 minutes.
- Aucune variable de test en production ; vérification stricte des secrets requis avant déploiement.

---

## DEP-0807 — Authentification OIDC entre GitHub et Google Cloud

### Objectif

Éliminer les clés longue durée en utilisant Workload Identity Federation (WIF) entre GitHub Actions et GCP.

### Décisions

- Création d'un provider OIDC GitHub dans GCP lié au repo `Topbrutus/depaneurIA`, audience restreinte.
- Service accounts dédiés par environnement (`sa-ci-dev`, `sa-ci-staging`, `sa-ci-prod`) avec rôles minimaux (Artifact Registry Writer, Cloud Run Admin limité, Service Account User).
- Les workflows utilisent `gcloud auth login --cred-file` ou actions officielles configurées pour WIF ; aucun secret JSON n'est stocké.
- Durée des tokens OIDC limitée (≤1 h) ; pas de réutilisation entre jobs.

### Règles

- Les claims `repository`, `ref`, `environment` sont vérifiées côté GCP pour réduire la surface.
- Toute tentative d'utilisation hors repo ou hors branche attendue est rejetée.

---

## DEP-0808 — Vérifier qu’aucune clé longue durée n’est stockée inutilement dans GitHub

### Objectif

Empêcher la présence et l'usage de secrets statiques longs dans GitHub.

### Règles

- Aucun JSON de clé de compte de service GCP n'est stocké dans `Actions secrets` ou `Dependabot secrets`.
- Les PAT GitHub doivent être évités ; si indispensables, durée maximale 30 jours et périmètre minimal.
- Audit mensuel des secrets GitHub : suppression automatique des secrets non utilisés et rotation des secrets résiduels.
- Les workflows CI utilisent exclusivement OIDC (DEP-0807) ; toute nouvelle demande de secret doit être justifiée et datée.

### Vérifications attendues

- Script d'audit interne (hors repo) ou contrôle manuel mensuel listant les secrets et leurs dates de mise à jour.
- Alerte si un secret dépasse 30 jours sans rotation.

---

## DEP-0809 — Pipeline de qualité avant fusion

### Objectif

Bloquer toute fusion sur `main` si la qualité minimale n'est pas atteinte.

### Exigences

- Checks requis : lint (DEP-0801), tests (DEP-0802), build (DEP-0803) doivent être verts sur la PR.
- Couverture minimale : si un rapport est disponible, seuil cible 80 % pour les packages critiques (panier, catalogue, assistants). Alerter mais ne pas bloquer en V1 si seuil non atteint, sauf régression >5 pts.
- Analyse statique TypeScript : échecs typecheck bloquants.
- Règles de revue : au moins une revue approuvée (alignée sur DEP-0108 lorsque activé).

### Règles

- Les workflows de qualité ne publient ni images ni secrets.
- Les artefacts de rapport sont éphémères et chiffrés.

---

## DEP-0810 — Pipeline de publication de version

### Objectif

Industrialiser la création d'une version à partir de `main`.

### Étapes attendues

- Déclencheur : création d'un tag `v*.*.*` ou `workflow_dispatch` avec version cible.
- Vérifications : rejouer lint/tests/build sur le commit tagué ; utiliser les mêmes versions de Node/pnpm que DEP-0801 à DEP-0803.
- Build de release : générer les artefacts prêts à déployer (images Docker, bundles front) mais ne déployer que via DEP-0806.
- Publication : créer une release GitHub avec changelog minimal (issues DEP associées) ; attacher les artefacts si pertinents.

### Règles

- Pas de tag si un check qualité est rouge.
- Les artefacts ne doivent contenir aucune configuration sensible (env, secrets).

---

## DEP-0811 — Tests unitaires du panier

### Objectif

Garantir la fiabilité des opérations panier côté client.

### Couverture minimale

- Ajout, suppression, modification de quantité d'articles (y compris produits avec variantes).
- Calcul des totaux (sous-total, taxes simulées, frais de livraison éventuels) et cohérence des arrondis.
- Conservation du panier entre rafraîchissements (stockage local chiffré) et respect du tenant courant.
- Gestion des états produits (en_stock, rupture, sur_commande) : impossibilité d'ajouter un produit indisponible, message d'erreur cohérent.
- Cas limites : panier vide, quantités maximales, suppression d'un produit vedette ou archivé.

### Règles

- Tests écrits en TypeScript, isolés sans appels réseau.
- Les fixtures utilisent les modèles catalogue documentés (DEP-0241-0255) et les statuts produits (DEP-0481-0494).

---

## DEP-0812 — Tests unitaires du catalogue

### Objectif

Assurer la cohérence des opérations et formats du catalogue.

### Couverture minimale

- Validation des structures catégorie/produit/variante (champs obligatoires, slug, display_order).
- Ordonnancement par catégorie (respect des `display_order` et des produits vedettes/populaires).
- Filtrage par tenant et statut produit (active, draft, archived) avec interdiction de fuite entre tenants.
- Génération des URLs et noms de médias selon les conventions (taille, nommage `product-<slug>-<variant>-<size>`).
- Mappage des synonymes et mots-clés pour la recherche et l'assistant (fr/en) sans duplication.

### Règles

- Tests isolés de la base de données ; utiliser des fixtures en mémoire.
- Pas de dépendance aux services cloud ou aux images réelles.

---

## DEP-0813 — Tests unitaires de l’assistant texte

### Objectif

Valider les comportements de base de l'assistant texte (chat).

### Couverture minimale

- Sélection de langue via `Accept-Language` et clé `preferred_language` (DEP-0675-0694).
- Gestion des messages système (salutation, clarification, confirmations) et transitions d'état simples.
- Respect des limites de débit (DEP-0775) : blocage et message DEP-0797 lorsque le quota est atteint.
- Cohérence des réponses avec le panier et le catalogue mockés (ex. ajout produit valide, refus produit indisponible).
- Résilience : reprise après rafraîchissement ou courte perte réseau sans perte d'historique local.

### Règles

- Tests offline, sans appel API externe.
- Jeux de données bilingues fr/en, clés i18n en anglais.

---

## DEP-0814 — Tests unitaires de l’assistant voix web

### Objectif

Valider l'assistant voix intégré au web (micro client) côté front.

### Couverture minimale

- Capture micro et autorisation navigateur : gestion des refus/erreurs avec message utilisateur clair.
- Détection de langue et transfert vers le pipeline texte (conversion voix→texte mockée) en respectant DEP-0675-0694.
- Respect des limites de tentatives et des erreurs (DEP-0795 à DEP-0797) avec retours audio/textuels cohérents.
- Contrôles d'état : démarrage/arrêt de l'écoute, annulation, reprise après coupure réseau courte.
- Intégration UI : indication visuelle d'enregistrement, transcription affichée, blocage du bouton en cas de quota atteint.

### Règles

- Tests unitaires côté front, sans dépendance au micro réel (mocks/stubs).
- Aucun appel réseau réel ; le pipeline STT/TTS est simulé.
