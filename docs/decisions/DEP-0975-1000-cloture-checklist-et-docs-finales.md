# DEP-0975 à DEP-1000 — Clôture, évaluations futures et documents finaux

## Périmètre

Ce document est le **dernier bloc de la checklist depaneurIA V1**. Il couvre
deux sous-blocs :

1. **DEP-0975–DEP-0993** : L'**évaluation prospective** de fonctionnalités
   hors périmètre V1 — intégrations matérielles (POS, scan, code-barres, GPS,
   photo), canaux avancés (centre d'appels, push, SMS), modes et interfaces
   additionnels (hors ligne, natif, tablette, avatar), intelligence augmentée
   (substitution, base de connaissances, marketplace), et outils opérationnels
   (console de support).

2. **DEP-0994–DEP-1000** : Les **quatre documents finaux** d'exploitation,
   la revue de la checklist, la transformation en backlog, et la décision de
   démarrage officiel du projet.

Ces évaluations ne constituent pas des décisions d'implémentation. Elles
positionnent chaque fonctionnalité dans le futur, avec les conditions de
déclenchement et les risques à anticiper.

Il s'agit exclusivement de **documentation** : aucun code produit, aucun
backlog GitHub réel à créer dans ce bloc.

---

## DEP-0975 — Évaluer l'ajout futur d'intégrations POS ou caisse

### Contexte

Un système POS (Point of Sale / caisse enregistreuse) gère l'inventaire et
les ventes en magasin. Une intégration permettrait de synchroniser le catalogue
depaneurIA avec l'inventaire réel du dépanneur en temps réel.

### Valeur potentielle

- Disponibilité des produits toujours à jour sans saisie manuelle.
- Synchronisation automatique des prix.
- Réduction du risque de commande d'un produit épuisé.

### Complexité et risques

- Grande diversité de systèmes POS sur le marché (Lightspeed, Square,
  systèmes propriétaires).
- Chaque intégration nécessite un travail sur mesure par système.
- Dépendance à des API tierces pouvant changer sans préavis.

### Condition de déclenchement

À évaluer après le pilote, si au moins 3 dépanneurs en font la demande
explicite et utilisent le même système POS.

### Statut V1

**Hors périmètre** — catalogue saisi manuellement en V1.

---

## DEP-0976 — Évaluer l'ajout futur de scan de produits

### Contexte

Le scan de produits permettrait au dépanneur d'ajouter ou de mettre à jour
un produit dans le catalogue en scannant son code-barres avec un téléphone
ou une douchette.

### Valeur potentielle

- Accélération de la saisie du catalogue (vs saisie manuelle).
- Réduction des erreurs de nom ou de prix.
- Utilisation d'une base de données produits existante (via code-barres UPC).

### Complexité et risques

- Nécessite une base de données de produits UPC fiable et à jour.
- Couverture incomplète pour les produits locaux ou non codifiés.
- Dépendance à une API externe de reconnaissance produit.

### Condition de déclenchement

À évaluer si le temps de saisie du catalogue devient un frein à l'onboarding
de nouveaux dépanneurs.

### Statut V1

**Hors périmètre** — saisie manuelle en V1.

---

## DEP-0977 — Évaluer l'ajout futur de lecture de code-barres

### Contexte

La lecture de code-barres côté client permettrait au client d'ajouter un
produit au panier en scannant son code-barres depuis l'interface web ou
mobile, sans passer par l'assistant.

### Valeur potentielle

- Expérience rapide pour les clients qui connaissent exactement le produit.
- Complémentaire à l'assistant texte et vocal.

### Complexité et risques

- Nécessite l'accès à la caméra du téléphone (permission explicite).
- Le produit scanné doit être dans le catalogue du tenant — pas de
  correspondance garantie.
- Expérience dégradée sur navigateur vs application native.

### Condition de déclenchement

À évaluer si une application mobile native est développée (DEP-0987).

### Statut V1

**Hors périmètre.**

---

## DEP-0978 — Évaluer l'ajout futur de suivi GPS complet du livreur

### Contexte

Un suivi GPS temps réel du livreur permettrait au client et au dépanneur de
voir la position du livreur sur une carte pendant la livraison.

### Valeur potentielle

- Réduction des appels « où est ma commande ? ».
- Amélioration de la satisfaction client.
- Aide au dépanneur pour estimer les délais.

### Complexité et risques

- Nécessite le consentement explicite du livreur (vie privée).
- Consommation de batterie et de données mobiles sur l'appareil du livreur.
- Coût d'une API cartographique (Google Maps, Mapbox, etc.).
- Complexité d'affichage temps réel côté client.

### Condition de déclenchement

À évaluer après le pilote, si les délais de livraison incertains génèrent
des plaintes clients mesurables.

### Statut V1

**Hors périmètre** — ETA estimé seulement en V1 (DEP-0591).

---

## DEP-0979 — Évaluer l'ajout futur de preuve photo de livraison

### Contexte

La preuve photo permet au livreur de prendre une photo au moment de la
livraison (colis déposé, client présent) pour documenter la remise de la
commande.

### Valeur potentielle

- Protection du livreur et du dépanneur en cas de litige.
- Preuve horodatée et géolocalisée de la livraison.

### Complexité et risques

- Vie privée du client (photo de son domicile).
- Stockage des photos (coût, durée de conservation).
- Cadre légal à vérifier au Québec (consentement implicite ou explicite).

### Condition de déclenchement

À évaluer si les litiges de livraison (« jamais reçu ») dépassent 5 % des
commandes après le pilote.

### Statut V1

**Hors périmètre.**

---

## DEP-0980 — Évaluer l'ajout futur d'un vrai centre d'appels multi-clients

### Contexte

Un centre d'appels permettrait à un agent humain de prendre en charge les
appels lorsque l'assistant vocal ne comprend pas la demande, ou pour gérer
des situations complexes pour plusieurs tenants à la fois.

### Valeur potentielle

- Taux de conversion téléphonique amélioré.
- Gestion des cas hors catalogue ou hors script.
- Expérience client supérieure pour les personnes peu à l'aise avec les IVR.

### Complexité et risques

- Coût opérationnel élevé (agents humains).
- Complexité logistique (multi-tenants, horaires, formation des agents).
- Confidentialité des commandes et des données clients.

### Condition de déclenchement

À évaluer si le taux de conversion téléphonique reste sous 50 % après 3 mois
de pilote et que l'amélioration de l'assistant ne suffit pas.

### Statut V1

**Hors périmètre** — assistant vocal automatique uniquement en V1.

---

## DEP-0981 — Évaluer l'ajout futur d'un tableau de bord financier

### Contexte

Un tableau de bord financier fournirait au dépanneur des données sur ses
revenus, ses ventes par produit, ses marges et ses tendances financières.

### Valeur potentielle

- Aide à la décision pour le dépanneur (quels produits sont rentables).
- Justification de la valeur de la plateforme pour le dépanneur.
- Base pour une éventuelle facturation à la commission.

### Complexité et risques

- Nécessite la connaissance du prix d'achat des produits (donnée sensible
  que le dépanneur ne voudra peut-être pas saisir).
- Calcul de marge = prix vente - prix achat — donnée non collectée en V1.

### Condition de déclenchement

À évaluer si des dépanneurs demandent explicitement des données financières
après le pilote.

### Statut V1

**Hors périmètre** — statistiques simples (DEP-0875–0877) uniquement.

---

## DEP-0982 — Évaluer l'ajout futur d'un tableau de bord marketing

### Contexte

Un tableau de bord marketing permettrait au dépanneur de suivre le
comportement de ses clients (produits vus, paniers abandonnés, sources de
trafic) pour piloter des actions promotionnelles.

### Valeur potentielle

- Identification des produits populaires vs abandonnés.
- Mesure de l'efficacité des promotions.
- Segmentation simple des clients.

### Complexité et risques

- Vie privée et conformité RGPD/Loi 25 (traçage comportemental).
- Consentement explicite requis pour certaines données.
- Complexité d'affichage et d'interprétation pour un petit dépanneur.

### Condition de déclenchement

À évaluer en V2 si la plateforme atteint 10 tenants actifs.

### Statut V1

**Hors périmètre.**

---

## DEP-0983 — Évaluer l'ajout futur d'un tableau de bord fidélité

### Contexte

Un programme de fidélité permettrait aux clients d'accumuler des points ou
des récompenses sur leurs achats chez un dépanneur.

### Valeur potentielle

- Augmentation de la fréquence de commande.
- Différenciation par rapport aux concurrents.
- Rétention des clients réguliers.

### Complexité et risques

- Complexité de gestion des points (expiration, fraude, échanges).
- Chaque tenant aurait un programme différent — complexité multi-tenant.
- Réglementation possible sur les programmes de récompenses au Québec.

### Condition de déclenchement

À évaluer si la rétention client devient un enjeu mesurable après 6 mois
de pilote multi-tenants.

### Statut V1

**Hors périmètre.**

---

## DEP-0984 — Évaluer l'ajout futur de notifications push avancées

### Contexte

Les notifications push avancées incluraient des campagnes promotionnelles,
des rappels de panier abandonné enrichis, et des messages personnalisés
basés sur l'historique d'achat.

### Valeur potentielle

- Réactivation des clients inactifs.
- Promotion de nouveaux produits ou offres spéciales.

### Complexité et risques

- Consentement explicite obligatoire (CASL au Canada, Loi 25 au Québec).
- Risque de saturation et désabonnement si mal dosé.
- Nécessite une infrastructure de segmentation et de planification d'envois.

### Condition de déclenchement

À évaluer après le pilote si le taux de réachat spontané est inférieur à
30 % sur 30 jours.

### Statut V1

**Hors périmètre** — notifications transactionnelles uniquement en V1.

---

## DEP-0985 — Évaluer l'ajout futur de notifications SMS avancées

### Contexte

Les SMS avancés incluraient des confirmations de commande par SMS, des
rappels, et des campagnes promotionnelles ciblées.

### Valeur potentielle

- Taux d'ouverture supérieur à l'email.
- Utile pour les clients sans application ou sans email actif.

### Complexité et risques

- Coût par SMS (non négligeable à grande échelle).
- Conformité CASL stricte (opt-in obligatoire, désinscription simple).
- Personnalisation limitée par le format court du SMS.

### Condition de déclenchement

À évaluer si le taux de lecture des notifications email est inférieur à
20 % après 3 mois de pilote.

### Statut V1

**Hors périmètre** — SMS de confirmation de commande uniquement si déjà
implémenté, pas de campagnes.

---

## DEP-0986 — Évaluer l'ajout futur d'un mode hors ligne partiel

### Contexte

Un mode hors ligne permettrait à l'interface du dépanneur ou du livreur de
fonctionner partiellement sans connexion réseau (ex. : consulter les commandes
en cours, marquer une livraison comme complétée).

### Valeur potentielle

- Continuité de service dans les zones à faible connectivité.
- Fiabilité perçue supérieure par le livreur.

### Complexité et risques

- Synchronisation des données lors du retour en ligne (conflits).
- Complexité de l'architecture (Service Workers, cache local, queue de
  synchronisation).
- Risque de données obsolètes affichées.

### Condition de déclenchement

À évaluer si des livraisons sont perdues ou retardées à cause de problèmes
de réseau constatés pendant le pilote.

### Statut V1

**Hors périmètre** — connexion réseau requise en V1.

---

## DEP-0987 — Évaluer l'ajout futur d'une application mobile native

### Contexte

Une application mobile native (iOS et/ou Android) remplacerait ou compléterait
l'interface web responsive actuelle pour les clients et les livreurs.

### Valeur potentielle

- Accès à la caméra, GPS, notifications push natives.
- Expérience utilisateur plus fluide sur mobile.
- Fidélisation via la présence sur l'écran d'accueil.

### Complexité et risques

- Coût de développement × 2 (iOS + Android) ou investissement dans un
  framework cross-platform (React Native, Flutter).
- Maintenance d'une version supplémentaire à chaque évolution.
- Validation et délais de publication sur les stores (App Store, Google Play).

### Condition de déclenchement

À évaluer si l'interface web responsive est insuffisante pour les livreurs
après 3 mois de pilote, ou si 50 % des clients accèdent via mobile et
signalent des problèmes d'expérience.

### Statut V1

**Hors périmètre** — web responsive uniquement en V1.

---

## DEP-0988 — Évaluer l'ajout futur d'une application tablette dépanneur

### Contexte

Une application dédiée sur tablette permettrait au dépanneur de gérer ses
commandes depuis un écran fixe posé sur le comptoir, avec une interface
optimisée pour les grands écrans.

### Valeur potentielle

- Interface permanente visible au dépanneur sans déverrouiller un téléphone.
- Alertes visuelles grandes et lisibles (nouvelle commande).
- Expérience optimisée pour la gestion de files de commandes.

### Complexité et risques

- Matériel supplémentaire à gérer (achat, configuration, mise à jour).
- Application native ou PWA installable à évaluer.
- Support d'une surface d'écran différente.

### Condition de déclenchement

À évaluer si le dépanneur pilote utilise déjà une tablette pour sa caisse
ou si plusieurs dépanneurs en font la demande.

### Statut V1

**Hors périmètre** — interface web responsive sur mobile ou ordinateur en V1.

---

## DEP-0989 — Évaluer l'ajout futur d'un assistant avatar visuel

### Contexte

Un assistant avatar visuel remplacerait ou compléterait l'assistant texte
par un personnage animé (2D ou 3D) qui parle et réagit aux interactions
du client.

### Valeur potentielle

- Expérience client plus engageante et mémorable.
- Différenciation forte par rapport aux concurrents.
- Adapté à une clientèle peu à l'aise avec le texte ou le clavier.

### Complexité et risques

- Coût de production élevé (design, animation, voix).
- Performance (rendu 3D sur mobile bas de gamme).
- Risque de perception négative (effet "vallée dérangeante").
- Cohérence avec le ton défini en DEP-0364–DEP-0366.

### Condition de déclenchement

À évaluer uniquement si la plateforme atteint une maturité V3+ et que
des partenaires de contenu sont disponibles.

### Statut V1

**Hors périmètre.**

---

## DEP-0990 — Évaluer l'ajout futur d'un moteur de substitution automatique intelligent

### Contexte

Un moteur de substitution proposerait automatiquement un produit similaire
lorsqu'un produit demandé est indisponible, sans intervention humaine.

### Valeur potentielle

- Réduction des commandes abandonnées pour cause de produit manquant.
- Meilleure expérience client (« désolé, voici une alternative »).
- Augmentation du panier moyen.

### Complexité et risques

- Nécessite des données de similarité entre produits (apprentissage ou
  saisie manuelle).
- Risque de proposer une substitution inappropriée (allergènes, goûts).
- Le client doit toujours avoir le choix final.

### Condition de déclenchement

À évaluer si le taux de refus produit (DEP-0370) dépasse 20 % des interactions
assistant après le pilote.

### Statut V1

**Hors périmètre** — refus simple en V1 (DEP-0370).

---

## DEP-0991 — Évaluer l'ajout futur d'une base de connaissances par client

### Contexte

Une base de connaissances par client permettrait à l'assistant de mémoriser
les préférences, habitudes et historique long terme de chaque client pour
personnaliser ses réponses.

### Valeur potentielle

- Réponses plus pertinentes dès la première phrase (« comme d'habitude ? »).
- Fidélisation par la personnalisation.
- Réduction du temps de commande pour les clients réguliers.

### Complexité et risques

- Volume de données à stocker par client × nombre de tenants.
- Conformité Loi 25 / RGPD sur la mémorisation des habitudes d'achat.
- Risque de biais ou d'erreur si les habitudes changent.
- Consentement explicite requis.

### Condition de déclenchement

À évaluer si la personnalisation devient un argument de vente différenciant
après 6 mois de pilote multi-tenants.

### Statut V1

**Hors périmètre** — historique de dernière commande uniquement (DEP-0576).

---

## DEP-0992 — Évaluer l'ajout futur d'une marketplace de plusieurs dépanneurs

### Contexte

Une marketplace permettrait à un client de voir et commander chez plusieurs
dépanneurs depuis une seule interface, avec un panier unifié ou séparé.

### Valeur potentielle

- Acquisition client facilitée (un seul point d'entrée).
- Visibilité accrue pour les petits dépanneurs.
- Économies d'échelle sur le marketing.

### Complexité et risques

- Changement fondamental de modèle d'affaires (B2B → B2C marketplace).
- Complexité légale (responsabilité, paiements, remboursements).
- Concurrence directe avec les acteurs déjà établis (Uber Eats, DoorDash).
- Perte du positionnement « outil du dépanneur » au profit d'un
  positionnement « plateforme client ».

### Condition de déclenchement

À évaluer uniquement si la demande émane des dépanneurs eux-mêmes et si
une étude de marché valide la différenciation possible.

### Statut V1

**Hors périmètre** — chaque dépanneur a sa propre boutique isolée (DEP-0680).

---

## DEP-0993 — Évaluer l'ajout futur d'une console de support interne

### Contexte

Une console de support permettrait à l'équipe technique de diagnostiquer
les problèmes d'un tenant en temps réel : consulter les logs, rejouer des
événements, simuler des commandes, et accompagner un dépanneur en difficulté.

### Valeur potentielle

- Réduction du temps de résolution des incidents.
- Support proactif sans accès direct à la base de données de production.
- Traçabilité des actions de support (audit DEP-0787).

### Complexité et risques

- Risque d'accès non autorisé aux données si mal sécurisée.
- Doit respecter les mêmes règles d'audit que les actions super admin.
- Nécessite une interface séparée bien contrôlée.

### Condition de déclenchement

À évaluer si le temps de résolution des incidents dépasse 2 heures en
moyenne après 3 mois de pilote.

### Statut V1

**Hors périmètre** — accès direct aux logs via super admin en V1 (DEP-0787).

---

## DEP-0994 — Document final : comment ouvrir un nouveau client de A à Z

### Objectif

Ce document constitue la **procédure opérationnelle standard (SOP)** pour
l'onboarding complet d'un nouveau dépanneur sur la plateforme.

### Structure du document

Le document à rédiger (séparément, hors ce bloc DEP) devra couvrir :

| Étape | Contenu                                                       |
| ----- | ------------------------------------------------------------- |
| 1     | Signature de l'accord client (hors plateforme)                |
| 2     | Création du tenant (DEP-0676) et du sous-domaine (DEP-0887)   |
| 3     | Branding initial (DEP-0888)                                   |
| 4     | Saisie des catégories (DEP-0889)                              |
| 5     | Saisie des produits, photos, synonymes (DEP-0890, 0891, 0892) |
| 6     | Configuration de la zone de livraison (DEP-0893)              |
| 7     | Configuration des horaires (DEP-0894)                         |
| 8     | Création des comptes dépanneur et livreur                     |
| 9     | Test de commande de bout en bout                              |
| 10    | Remise des accès et formation rapide                          |
| 11    | Surveillance active pendant les 7 premiers jours              |

### Règle

Ce document SOP est un livrable opérationnel distinct — il sera rédigé et
tenu à jour en dehors du dépôt `docs/decisions/`.

---

## DEP-0995 — Document final : comment exploiter un client au quotidien

### Objectif

Ce document constitue le **guide d'exploitation quotidienne** pour l'équipe
qui gère la plateforme en production.

### Structure du document

Le document à rédiger devra couvrir :

| Thème        | Contenu                                                   |
| ------------ | --------------------------------------------------------- |
| Surveillance | Vérification quotidienne des alertes (DEP-0878, DEP-0879) |
| Coûts        | Lecture du tableau de bord coûts (DEP-0875–0877)          |
| Commandes    | Traitement des commandes bloquées ou problématiques       |
| Catalogue    | Mise à jour de produits, prix, disponibilité à la demande |
| Sauvegardes  | Vérification de la sauvegarde quotidienne (DEP-0785)      |
| Support      | Réponse aux demandes du dépanneur et des livreurs         |
| Incidents    | Première réponse selon les alertes reçues (voir DEP-0996) |

### Règle

Ce guide est un livrable opérationnel distinct, maintenu à jour après
chaque évolution majeure de la plateforme.

---

## DEP-0996 — Document final : comment gérer les incidents

### Objectif

Ce document constitue le **runbook d'incident** : que faire quand quelque
chose ne fonctionne pas.

### Structure du document

Le document à rédiger devra couvrir :

| Type d'incident               | Procédure                                                    |
| ----------------------------- | ------------------------------------------------------------ |
| Plateforme inaccessible       | Vérification des services, rollback si besoin, communication |
| Commande bloquée              | Diagnostic via logs (DEP-0789), correction manuelle          |
| Livreur injoignable           | Contact dépanneur, annulation ou réassignation               |
| Données personnelles exposées | Arrêt immédiat, notification, post-mortem (DEP-0885)         |
| Coûts anormaux                | Identification de la source, coupure si nécessaire           |
| Panne d'un service tiers      | Procédure de fallback ou de communication client             |

### Niveaux de gravité

| Niveau | Définition                            | Délai de réponse |
| ------ | ------------------------------------- | ---------------- |
| P1     | Plateforme totalement hors service    | < 15 minutes     |
| P2     | Fonctionnalité majeure dégradée       | < 1 heure        |
| P3     | Anomalie mineure sans impact critique | < 24 heures      |

### Règle

Le runbook d'incident est un document vivant, mis à jour après chaque
incident P1 ou P2.

---

## DEP-0997 — Document final : comment faire évoluer le produit sans casser la base

### Objectif

Ce document constitue le **guide d'évolution contrôlée** de la plateforme —
comment ajouter de nouvelles fonctionnalités sans régresser sur l'existant.

### Principes fondamentaux

| Principe                | Description                                                        |
| ----------------------- | ------------------------------------------------------------------ |
| Décision avant code     | Toute nouvelle fonctionnalité nécessite une décision DEP numérotée |
| Gel avant extension     | Chaque bloc V1 doit être gelé avant d'y ajouter des éléments V2    |
| Tests de non-régression | Tout déploiement inclut les tests de permissions (DEP-0793, 0794)  |
| Isolation multi-tenant  | Toute nouvelle donnée porte un `tenant_id`                         |
| Rétrocompatibilité API  | Les routes existantes ne changent jamais de contrat en V1          |
| Changelog               | Chaque déploiement est documenté dans un CHANGELOG                 |

### Structure du document à rédiger

- Comment numéroter et écrire une décision DEP
- Comment passer d'une décision à un ticket GitHub
- Comment déployer en production en toute sécurité
- Comment rollback si nécessaire
- Comment communiquer les changements aux dépanneurs pilotes

### Règle

Ce guide est le document de référence pour toute l'équipe technique dès le
début de la V2.

---

## DEP-0998 — Faire une revue complète de la checklist et barrer les doublons

### Objectif

Définir la procédure de revue finale de la checklist `docs/1000-checklist.md`
pour identifier les doublons, les redondances et les tâches obsolètes.

### Procédure de revue

| Étape | Action                                                                       |
| ----- | ---------------------------------------------------------------------------- |
| 1     | Lire la checklist complète de DEP-0001 à DEP-1000                            |
| 2     | Identifier les tâches couvertes par plusieurs DEP différents                 |
| 3     | Identifier les tâches rendues obsolètes par des décisions postérieures       |
| 4     | Identifier les tâches hors périmètre V1 déjà documentées comme futures       |
| 5     | Marquer les doublons dans un document de revue séparé (hors ce dépôt)        |
| 6     | Ne pas modifier `docs/1000-checklist.md` — la checklist est en lecture seule |

### Règle

La checklist `docs/1000-checklist.md` ne doit jamais être modifiée — elle
est le document de référence historique. Les doublons sont gérés dans le
backlog GitHub (DEP-0999), pas dans la checklist elle-même.

---

## DEP-0999 — Transformer les lignes cochées en backlog réel GitHub

### Objectif

Définir le processus de transformation des décisions DEP documentées en
tickets GitHub actionnables, au fur et à mesure de la mise en œuvre.

### Processus

| Étape | Action                                                                                        |
| ----- | --------------------------------------------------------------------------------------------- |
| 1     | Pour chaque bloc DEP documenté et gelé, créer un ticket GitHub par DEP ou par groupe cohérent |
| 2     | Associer chaque ticket à un milestone correspondant (ex. V1 — Pilote)                         |
| 3     | Affecter les labels appropriés (front, back, mobile, doc, infra)                              |
| 4     | Lier chaque ticket au fichier de décision correspondant dans `docs/decisions/`                |
| 5     | Prioriser selon l'ordre naturel de la checklist                                               |
| 6     | Ne créer les tickets que pour les blocs entièrement documentés                                |

### Règles

- **Aucun ticket GitHub n'est créé dans ce bloc DEP** — ce DEP définit
  uniquement la procédure.
- La création effective du backlog débute après le gel de l'observabilité
  (DEP-0880).
- Le backlog est la traduction opérationnelle des décisions — pas leur
  remplacement.

---

## DEP-1000 — Démarrer officiellement le projet en suivant cette liste dans l'ordre, sans revenir en arrière inutilement

### Objectif

Marquer la fin de la phase de documentation initiale et le début de la
phase d'implémentation du projet depaneurIA V1.

### Ce que signifie « démarrer officiellement »

| Condition                                  | État attendu                               |
| ------------------------------------------ | ------------------------------------------ |
| Les 1000 DEP sont documentés ou évalués    | ✅ Accompli par ce document                |
| L'observabilité minimum est opérationnelle | Requis avant pilote (DEP-0880)             |
| Le tenant pilote est préparé               | Requis avant pilote (DEP-0886)             |
| Le backlog GitHub est initialisé           | Requis pour suivre l'avancement (DEP-0999) |
| L'équipe a lu les 4 documents finaux       | DEP-0994, 0995, 0996, 0997                 |

### Principe directeur

> L'assistant pilote la boutique, il ne remplace pas la boutique.
> La documentation pilote le code, elle ne le remplace pas.
> Ce projet avance dans l'ordre, sans revenir en arrière inutilement.

### Règle de clôture

Ce document DEP-1000 est le **dernier document de décision** de la phase
de planification. À partir de ce point, chaque nouvelle décision prend
un numéro DEP supérieur à 1000, ou s'inscrit dans un nouveau cycle de
planification V2.

La checklist `docs/1000-checklist.md` reste intacte comme archive. Le
backlog GitHub devient l'outil de pilotage actif du projet.

**depaneurIA V1 — Documentation complète. Le reste est à construire.**

---

## Synthèse

| DEP  | Titre                                                         | Statut           |
| ---- | ------------------------------------------------------------- | ---------------- |
| 0975 | Intégrations POS ou caisse                                    | Évalué — V2+     |
| 0976 | Scan de produits                                              | Évalué — V2+     |
| 0977 | Lecture de code-barres                                        | Évalué — V2+     |
| 0978 | Suivi GPS complet du livreur                                  | Évalué — V2+     |
| 0979 | Preuve photo de livraison                                     | Évalué — V2+     |
| 0980 | Centre d'appels multi-clients                                 | Évalué — V2+     |
| 0981 | Tableau de bord financier                                     | Évalué — V2+     |
| 0982 | Tableau de bord marketing                                     | Évalué — V2+     |
| 0983 | Tableau de bord fidélité                                      | Évalué — V2+     |
| 0984 | Notifications push avancées                                   | Évalué — V2+     |
| 0985 | Notifications SMS avancées                                    | Évalué — V2+     |
| 0986 | Mode hors ligne partiel                                       | Évalué — V2+     |
| 0987 | Application mobile native                                     | Évalué — V2+     |
| 0988 | Application tablette dépanneur                                | Évalué — V2+     |
| 0989 | Assistant avatar visuel                                       | Évalué — V3+     |
| 0990 | Moteur de substitution automatique intelligent                | Évalué — V2+     |
| 0991 | Base de connaissances par client                              | Évalué — V2+     |
| 0992 | Marketplace de plusieurs dépanneurs                           | Évalué — V2+     |
| 0993 | Console de support interne                                    | Évalué — V2+     |
| 0994 | Document final : ouvrir un nouveau client de A à Z            | Défini — SOP     |
| 0995 | Document final : exploiter un client au quotidien             | Défini — Guide   |
| 0996 | Document final : gérer les incidents                          | Défini — Runbook |
| 0997 | Document final : faire évoluer le produit sans casser la base | Défini — Guide   |
| 0998 | Revue complète de la checklist                                | Défini           |
| 0999 | Transformer les lignes cochées en backlog GitHub              | Défini           |
| 1000 | Démarrer officiellement le projet                             | ✅ Clôturé       |
