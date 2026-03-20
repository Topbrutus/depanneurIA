# DEP-0735 à DEP-0754 — Observabilité, services cloud et endpoints

## Périmètre

Ce document couvre trois sous-blocs contigus :

1. **DEP-0735–DEP-0741** : L'**activation des services cloud essentiels** —
   observabilité (logging, monitoring), base de données, stockage de fichiers,
   API pour l'assistant et la téléphonie, et registre d'images conteneur.

2. **DEP-0742–DEP-0748** : La **création des environnements cloud** (développement,
   préproduction, production), la **définition des variables d'environnement**
   propres à chaque environnement et le **stockage des secrets** dans un
   gestionnaire dédié.

3. **DEP-0749–DEP-0754** : La **définition des domaines et sous-domaines**, la
   **stratégie HTTPS**, les **endpoints publics et privés** (front, API,
   administration) et la **stratégie de stockage des images produits**.

Ces décisions s'appuient sur les stratégies définies en DEP-0136 (variables
d'environnement), DEP-0137 (secrets), DEP-0139 (fichiers `.env` cloud) et sur
les choix d'architecture multi-tenant définis en DEP-0641–DEP-0669.

Il s'agit exclusivement de **documentation** : aucun déploiement réel, aucun
code produit, aucune implémentation.

---

## DEP-0735 — Activer Cloud Logging

### Objectif

Définir l'activation du service de journalisation cloud afin que chaque
application et chaque service du projet puissent émettre et centraliser leurs
logs dans un outil unique, consultable et filtrable.

### Contexte

Sans journalisation centralisée, le diagnostic d'incidents en production
requiert un accès SSH à chaque instance, ce qui est lent, non sécurisé et
incompatible avec des plateformes serverless ou conteneurisées.

### Service retenu

| Élément               | Valeur                                                 |
| --------------------- | ------------------------------------------------------ |
| Service               | Google Cloud Logging (ou équivalent managé)            |
| Activation            | Via la console cloud ou `gcloud services enable`       |
| Niveau de log minimal | `INFO` en développement, `WARNING` en production       |
| Rétention par défaut  | 30 jours (ajustable selon les quotas du plan)          |
| Filtrage              | Par service, par environnement, par niveau de sévérité |

### Éléments à configurer

| Élément                         | Description                                            |
| ------------------------------- | ------------------------------------------------------ |
| Activation du service           | Activer Cloud Logging sur le projet cloud              |
| Agent ou SDK                    | Chaque application envoie ses logs via le SDK natif    |
| Filtres de base                 | Un filtre par environnement (dev, preprod, prod)       |
| Exclusion des données sensibles | Aucun secret, aucun token, aucun mot de passe en clair |

### Règles

- Cloud Logging doit être activé avant tout déploiement.
- Les logs applicatifs respectent les niveaux standard : `DEBUG`, `INFO`,
  `WARNING`, `ERROR`, `CRITICAL`.
- Les données personnelles (noms, adresses, téléphones) ne doivent jamais
  apparaître en clair dans les logs — elles sont masquées ou tronquées.
- La rétention peut être étendue pour la production si un incident nécessite
  une investigation longue.

---

## DEP-0736 — Activer Cloud Monitoring

### Objectif

Définir l'activation du service de surveillance cloud pour suivre la santé
des applications, détecter les anomalies et déclencher des alertes en cas de
dégradation.

### Contexte

Le monitoring complète le logging : les logs expliquent _pourquoi_ un
incident se produit, le monitoring détecte _quand_ il se produit. Sans
monitoring, les incidents ne sont découverts que par les utilisateurs.

### Service retenu

| Élément           | Valeur                                           |
| ----------------- | ------------------------------------------------ |
| Service           | Google Cloud Monitoring (ou équivalent managé)   |
| Activation        | Via la console cloud ou `gcloud services enable` |
| Métriques de base | CPU, mémoire, latence HTTP, taux d'erreurs 5xx   |
| Tableau de bord   | Un tableau par environnement                     |

### Alertes de base

| Alerte                   | Seuil                            | Canal         |
| ------------------------ | -------------------------------- | ------------- |
| Taux d'erreurs 5xx > 5 % | Fenêtre de 5 minutes             | E-mail, Slack |
| Latence P95 > 2 secondes | Fenêtre de 10 minutes            | E-mail        |
| CPU > 80 % soutenu       | Fenêtre de 15 minutes            | E-mail        |
| Service indisponible     | Aucune réponse pendant 2 minutes | E-mail, Slack |

### Règles

- Cloud Monitoring doit être activé en même temps que Cloud Logging.
- Les alertes de production sont configurées dès le premier déploiement.
- Les alertes de développement sont optionnelles en V1.
- Les tableaux de bord sont documentés et partagés avec l'équipe.

---

## DEP-0737 — Activer la base de données choisie

### Objectif

Définir l'activation du service de base de données managée qui hébergera les
données de l'application (comptes, commandes, catalogues, tenants).

### Contexte

Le choix de la base de données est cohérent avec les variables définies en
DEP-0139 (`DATABASE_URL` → PostgreSQL). Le service managé évite la gestion
manuelle des sauvegardes, des mises à jour et de la haute disponibilité.

### Service retenu

| Élément             | Valeur                                             |
| ------------------- | -------------------------------------------------- |
| Base de données     | PostgreSQL (version ≥ 15)                          |
| Service managé      | Cloud SQL for PostgreSQL (ou équivalent managé)    |
| Activation          | Via la console cloud ou CLI                        |
| Sauvegardes         | Automatiques quotidiennes, rétention 7 jours       |
| Haute disponibilité | Activée en production, désactivée en développement |

### Configuration par environnement

| Environnement | Taille instance | Stockage | HA  | Sauvegardes |
| ------------- | --------------- | -------- | --- | ----------- |
| Développement | Minimale        | 10 Go    | Non | Quotidienne |
| Préproduction | Petite          | 20 Go    | Non | Quotidienne |
| Production    | Moyenne         | 50 Go    | Oui | Quotidienne |

### Règles

- Une instance distincte par environnement — jamais de base partagée entre
  dev et prod.
- Les connexions utilisent SSL/TLS obligatoirement.
- L'accès réseau est restreint aux seules adresses IP ou services autorisés.
- Les sauvegardes sont testées au moins une fois avant la mise en production.

---

## DEP-0738 — Activer le service de stockage de fichiers choisi

### Objectif

Définir l'activation du service de stockage objet cloud pour héberger les
fichiers statiques et les médias de l'application (images produits, logos,
documents).

### Contexte

Les images produits, les logos de tenants et les fichiers statiques ne doivent
pas être stockés dans la base de données ni sur le système de fichiers local
d'un conteneur éphémère. Un service de stockage objet managé garantit la
durabilité, la disponibilité et la distribution via CDN.

### Service retenu

| Élément            | Valeur                                               |
| ------------------ | ---------------------------------------------------- |
| Service            | Google Cloud Storage (ou équivalent S3-compatible)   |
| Activation         | Via la console cloud ou CLI                          |
| Classe de stockage | Standard (accès fréquent)                            |
| Région             | Même région que les services applicatifs             |
| Accès public       | Lecture publique pour les images produits uniquement |

### Buckets prévus

| Bucket                   | Usage                             | Accès        |
| ------------------------ | --------------------------------- | ------------ |
| `{projet}-media-dev`     | Images et médias en développement | Privé + CDN  |
| `{projet}-media-preprod` | Images et médias en préproduction | Privé + CDN  |
| `{projet}-media-prod`    | Images et médias en production    | Public + CDN |

### Règles

- Un bucket distinct par environnement — jamais de bucket partagé entre
  environnements.
- Les fichiers uploadés sont validés côté serveur (type MIME, taille maximale).
- Les fichiers sensibles (documents administratifs) sont dans un bucket privé
  séparé.
- La suppression de fichiers est logique (soft delete) avec rétention de
  30 jours avant suppression définitive.

---

## DEP-0739 — Activer les API nécessaires à l'assistant si choisies

### Objectif

Définir l'activation des API tierces nécessaires au fonctionnement de
l'assistant conversationnel (texte et vocal web) de l'application.

### Contexte

L'assistant texte (DEP-0361) et l'assistant vocal web (DEP-0401) utilisent
des API d'intelligence artificielle pour comprendre les demandes des clients
et générer des réponses. Ces API doivent être activées et configurées dans le
projet cloud.

### API retenues

| API                        | Usage                                   | Obligatoire |
| -------------------------- | --------------------------------------- | ----------- |
| OpenAI API                 | Compréhension et génération de texte    | Oui         |
| OpenAI Realtime API        | Conversation vocale en temps réel (web) | Oui         |
| Speech-to-Text (optionnel) | Transcription de fallback si nécessaire | Non         |

### Éléments à configurer

| Élément                      | Description                                   |
| ---------------------------- | --------------------------------------------- |
| Clé API OpenAI               | Stockée dans Secret Manager (DEP-0748)        |
| Quotas et limites            | Définir les limites de requêtes par minute    |
| Environnement de facturation | Un compte de facturation distinct ou partagé  |
| Monitoring des coûts         | Alerte si les coûts dépassent un seuil défini |

### Règles

- La clé API ne doit jamais apparaître dans le code source ni dans les logs.
- Les quotas sont configurés pour éviter une facturation incontrôlée.
- Un mécanisme de fallback est prévu si l'API est temporairement indisponible
  (message d'erreur clair au client).
- Les appels API sont journalisés (nombre, latence) sans exposer le contenu
  des conversations.

---

## DEP-0740 — Activer les API nécessaires à la téléphonie si besoin de webhook public

### Objectif

Définir l'activation des API et des configurations nécessaires au
fonctionnement de la téléphonie vocale, notamment le webhook public requis
par le fournisseur de téléphonie.

### Contexte

Le système téléphonique (DEP-0441–DEP-0456) utilise Twilio Voice combiné à
OpenAI Realtime API. Twilio envoie les appels entrants vers un webhook HTTP
public hébergé par l'application. Ce webhook doit être accessible sur
Internet avec un certificat HTTPS valide.

### API et services requis

| Service              | Usage                                    | Obligatoire |
| -------------------- | ---------------------------------------- | ----------- |
| Twilio Voice         | Réception et gestion des appels entrants | Oui         |
| Twilio Phone Numbers | Numéro de téléphone dédié par tenant     | Oui         |
| OpenAI Realtime API  | Conversation vocale en temps réel        | Oui         |
| Webhook HTTPS public | Point d'entrée pour les appels Twilio    | Oui         |

### Éléments à configurer

| Élément                       | Description                                            |
| ----------------------------- | ------------------------------------------------------ |
| Numéro Twilio                 | Un numéro par tenant actif                             |
| URL du webhook                | `https://api.{domaine}/webhooks/twilio/voice`          |
| Signature Twilio              | Validation de la signature sur chaque requête entrante |
| Clés Twilio (SID, Auth Token) | Stockées dans Secret Manager (DEP-0748)                |

### Règles

- Le webhook doit valider la signature Twilio sur chaque requête pour éviter
  les appels frauduleux.
- Le webhook est accessible uniquement en HTTPS.
- Les clés Twilio ne doivent jamais apparaître dans le code source ni dans
  les logs.
- En environnement de développement, un tunnel (ex. ngrok) peut remplacer
  le webhook public — cette exception est documentée.

---

## DEP-0741 — Créer le registre d'images du projet

### Objectif

Définir la création d'un registre d'images conteneur (container registry) pour
stocker les images Docker des applications du projet.

### Contexte

Le déploiement des applications (API, workers) repose sur des images
conteneur. Un registre privé garantit que seules les images validées par le
pipeline CI/CD sont déployées, et que les images ne sont pas accessibles
publiquement.

### Service retenu

| Élément | Valeur                                          |
| ------- | ----------------------------------------------- |
| Service | Google Artifact Registry (ou équivalent managé) |
| Format  | Docker (OCI)                                    |
| Région  | Même région que les services applicatifs        |
| Accès   | Privé — authentification requise                |

### Registres prévus

| Registre          | Usage                          |
| ----------------- | ------------------------------ |
| `{projet}-docker` | Images Docker des applications |

### Politique de rétention

| Règle                    | Valeur                     |
| ------------------------ | -------------------------- |
| Images taguées (release) | Conservation illimitée     |
| Images non taguées       | Suppression après 30 jours |
| Images de développement  | Suppression après 7 jours  |

### Règles

- Seul le pipeline CI/CD peut pousser des images dans le registre.
- Les images sont scannées pour les vulnérabilités connues avant déploiement.
- Le tag `latest` n'est jamais utilisé en production — seuls les tags
  versionnés (SemVer) sont autorisés.
- L'accès au registre est restreint aux comptes de service du projet.

---

## DEP-0742 — Créer l'environnement cloud de développement

### Objectif

Définir la création de l'environnement cloud de développement, utilisé par
l'équipe pour tester les fonctionnalités en cours de développement dans un
contexte proche de la production.

### Contexte

L'environnement de développement cloud est distinct de l'environnement local
(DEP-0138). Il permet de valider les intégrations tierces (Twilio, OpenAI),
les déploiements conteneur et les configurations cloud avant de passer en
préproduction.

### Caractéristiques

| Élément                | Valeur                                 |
| ---------------------- | -------------------------------------- |
| Nom                    | `dev`                                  |
| Projet cloud ou espace | Projet ou namespace dédié              |
| Base de données        | Instance Cloud SQL minimale (DEP-0737) |
| Stockage               | Bucket `{projet}-media-dev` (DEP-0738) |
| Registre d'images      | Partagé avec les autres environnements |
| Monitoring             | Optionnel (DEP-0736)                   |
| Logging                | Activé (DEP-0735)                      |

### Règles

- L'environnement de développement peut être détruit et recréé sans impact.
- Les données de développement sont fictives — jamais de données réelles.
- Le déploiement est automatique sur chaque merge dans la branche `develop`.
- Les coûts sont minimisés (instances minimales, pas de haute disponibilité).

---

## DEP-0743 — Créer l'environnement cloud de préproduction

### Objectif

Définir la création de l'environnement cloud de préproduction (staging),
utilisé pour valider les fonctionnalités avant leur mise en production.

### Contexte

La préproduction reproduit la configuration de production aussi fidèlement
que possible, mais avec des données fictives. Elle sert de dernière étape
de validation avant le déploiement en production.

### Caractéristiques

| Élément                | Valeur                                     |
| ---------------------- | ------------------------------------------ |
| Nom                    | `staging`                                  |
| Projet cloud ou espace | Projet ou namespace dédié                  |
| Base de données        | Instance Cloud SQL petite (DEP-0737)       |
| Stockage               | Bucket `{projet}-media-preprod` (DEP-0738) |
| Registre d'images      | Partagé avec les autres environnements     |
| Monitoring             | Activé (DEP-0736)                          |
| Logging                | Activé (DEP-0735)                          |

### Règles

- La préproduction doit reproduire la configuration de production (même
  versions, mêmes services) à l'échelle réduite.
- Les données de préproduction sont fictives — jamais de données réelles.
- Le déploiement est automatique sur chaque merge dans la branche `main`
  (ou sur tag de release candidate).
- Les tests d'intégration et les tests end-to-end sont exécutés en
  préproduction avant promotion en production.

---

## DEP-0744 — Créer l'environnement cloud de production

### Objectif

Définir la création de l'environnement cloud de production, hébergeant
l'application accessible aux utilisateurs finaux.

### Contexte

L'environnement de production est le seul environnement accessible aux
clients réels. Il doit garantir la disponibilité, la performance et la
sécurité des données.

### Caractéristiques

| Élément                | Valeur                                            |
| ---------------------- | ------------------------------------------------- |
| Nom                    | `production`                                      |
| Projet cloud ou espace | Projet ou namespace dédié et isolé                |
| Base de données        | Instance Cloud SQL moyenne, HA activée (DEP-0737) |
| Stockage               | Bucket `{projet}-media-prod` (DEP-0738)           |
| Registre d'images      | Partagé avec les autres environnements            |
| Monitoring             | Activé avec alertes (DEP-0736)                    |
| Logging                | Activé (DEP-0735)                                 |

### Règles

- L'environnement de production est strictement isolé des autres
  environnements — aucun accès croisé.
- La haute disponibilité est activée pour la base de données et les
  services critiques.
- Le déploiement en production est déclenché uniquement par un tag de
  release versionné (SemVer).
- Tout déploiement en production est précédé d'une validation réussie
  en préproduction.
- Les accès administrateurs sont restreints et journalisés.

---

## DEP-0745 — Définir les variables d'environnement cloud de développement

### Objectif

Définir la liste des variables d'environnement nécessaires à l'environnement
cloud de développement.

### Contexte

Les variables d'environnement cloud suivent la stratégie définie en DEP-0136
et DEP-0139. Chaque environnement possède ses propres valeurs — aucune
variable n'est partagée entre environnements.

### Variables requises

| Variable              | Exemple de valeur (dev)                                | Description                   |
| --------------------- | ------------------------------------------------------ | ----------------------------- |
| `NODE_ENV`            | `development`                                          | Environnement Node.js         |
| `DATABASE_URL`        | `postgresql://...@dev-instance/depaneuria`             | URL de connexion PostgreSQL   |
| `STORAGE_BUCKET`      | `depaneuria-media-dev`                                 | Bucket de stockage des médias |
| `NEXT_PUBLIC_API_URL` | `https://api-dev.depaneuria.com`                       | URL publique de l'API         |
| `NEXT_PUBLIC_APP_URL` | `https://dev.depaneuria.com`                           | URL publique du front         |
| `TWILIO_WEBHOOK_URL`  | `https://api-dev.depaneuria.com/webhooks/twilio/voice` | URL du webhook Twilio         |
| `LOG_LEVEL`           | `debug`                                                | Niveau de journalisation      |

### Règles

- Les valeurs réelles ne sont jamais commitées dans le dépôt (DEP-0136).
- Les secrets (clés API, tokens) sont référencés via Secret Manager
  (DEP-0748), pas comme variables en clair.
- Chaque variable est documentée dans le `.env.example` correspondant.
- L'ajout d'une nouvelle variable requiert la mise à jour de tous les
  environnements.

---

## DEP-0746 — Définir les variables d'environnement cloud de préproduction

### Objectif

Définir la liste des variables d'environnement nécessaires à l'environnement
cloud de préproduction.

### Contexte

Les variables de préproduction sont identiques en structure à celles de
production mais pointent vers des ressources de staging. Elles permettent
de valider le comportement de l'application dans un contexte quasi identique
à la production.

### Variables requises

| Variable              | Exemple de valeur (staging)                                | Description                   |
| --------------------- | ---------------------------------------------------------- | ----------------------------- |
| `NODE_ENV`            | `staging`                                                  | Environnement Node.js         |
| `DATABASE_URL`        | `postgresql://...@staging-instance/depaneuria`             | URL de connexion PostgreSQL   |
| `STORAGE_BUCKET`      | `depaneuria-media-preprod`                                 | Bucket de stockage des médias |
| `NEXT_PUBLIC_API_URL` | `https://api-staging.depaneuria.com`                       | URL publique de l'API         |
| `NEXT_PUBLIC_APP_URL` | `https://staging.depaneuria.com`                           | URL publique du front         |
| `TWILIO_WEBHOOK_URL`  | `https://api-staging.depaneuria.com/webhooks/twilio/voice` | URL du webhook Twilio         |
| `LOG_LEVEL`           | `info`                                                     | Niveau de journalisation      |

### Règles

- Les variables de préproduction ne doivent jamais pointer vers des
  ressources de production.
- Les secrets de préproduction sont distincts de ceux de production.
- La structure des variables est identique à celle de production pour
  garantir la parité.
- Toute nouvelle variable ajoutée en production doit être ajoutée en
  préproduction simultanément.

---

## DEP-0747 — Définir les variables d'environnement cloud de production

### Objectif

Définir la liste des variables d'environnement nécessaires à l'environnement
cloud de production.

### Contexte

Les variables de production sont les plus critiques : elles connectent
l'application aux ressources réelles (base de données, stockage, API
tierces). Toute erreur dans ces variables peut entraîner une indisponibilité
ou une fuite de données.

### Variables requises

| Variable              | Exemple de valeur (production)                     | Description                   |
| --------------------- | -------------------------------------------------- | ----------------------------- |
| `NODE_ENV`            | `production`                                       | Environnement Node.js         |
| `DATABASE_URL`        | `postgresql://...@prod-instance/depaneuria`        | URL de connexion PostgreSQL   |
| `STORAGE_BUCKET`      | `depaneuria-media-prod`                            | Bucket de stockage des médias |
| `NEXT_PUBLIC_API_URL` | `https://api.depaneuria.com`                       | URL publique de l'API         |
| `NEXT_PUBLIC_APP_URL` | `https://depaneuria.com`                           | URL publique du front         |
| `TWILIO_WEBHOOK_URL`  | `https://api.depaneuria.com/webhooks/twilio/voice` | URL du webhook Twilio         |
| `LOG_LEVEL`           | `warning`                                          | Niveau de journalisation      |

### Règles

- Les variables de production ne sont modifiables que par un administrateur
  autorisé.
- Toute modification de variable en production est journalisée.
- Les secrets de production sont rotés au minimum annuellement (DEP-0137).
- Un rollback des variables est possible via l'historique de la plateforme
  cloud.

---

## DEP-0748 — Stocker les secrets dans Secret Manager

### Objectif

Définir l'utilisation d'un gestionnaire de secrets cloud pour stocker et
distribuer les secrets de l'application de manière sécurisée.

### Contexte

La stratégie des secrets (DEP-0137) interdit les secrets en clair dans le
code, les fichiers de configuration et les logs. Un gestionnaire de secrets
managé fournit le chiffrement au repos, le contrôle d'accès granulaire et
l'audit des accès.

### Service retenu

| Élément       | Valeur                                                 |
| ------------- | ------------------------------------------------------ |
| Service       | Google Secret Manager (ou équivalent managé)           |
| Chiffrement   | AES-256 au repos, géré par la plateforme               |
| Accès         | IAM — chaque service n'accède qu'à ses propres secrets |
| Versionnement | Chaque secret est versionné automatiquement            |

### Secrets à stocker

| Secret                        | Utilisé par      | Environnements     |
| ----------------------------- | ---------------- | ------------------ |
| `DATABASE_URL`                | API              | dev, staging, prod |
| `JWT_SECRET`                  | API              | dev, staging, prod |
| `OPENAI_API_KEY`              | API (assistant)  | dev, staging, prod |
| `TWILIO_ACCOUNT_SID`          | API (téléphonie) | dev, staging, prod |
| `TWILIO_AUTH_TOKEN`           | API (téléphonie) | dev, staging, prod |
| `STORAGE_SERVICE_ACCOUNT_KEY` | API (stockage)   | dev, staging, prod |

### Règles

- Chaque secret a une version distincte par environnement — jamais de
  secret partagé entre dev et prod.
- L'accès aux secrets est restreint aux comptes de service applicatifs
  (principe du moindre privilège).
- Chaque accès à un secret est journalisé dans Cloud Logging (DEP-0735).
- La rotation des secrets de production est planifiée annuellement ou
  immédiatement après suspicion de fuite (DEP-0137).
- Les secrets supprimés sont conservés en version inactive pendant 30 jours
  avant destruction définitive.

---

## DEP-0749 — Définir les domaines et sous-domaines

### Objectif

Définir la stratégie de nommage des domaines et sous-domaines utilisés par
la plateforme, pour chaque environnement et chaque composant.

### Contexte

La plateforme expose plusieurs composants (front client, API, administration)
et fonctionne en multi-tenant. Chaque environnement et chaque tenant
nécessitent des domaines ou sous-domaines distincts pour le routage et
l'isolation.

### Structure des domaines

| Composant       | Développement               | Préproduction                   | Production              |
| --------------- | --------------------------- | ------------------------------- | ----------------------- |
| Front client    | `dev.depaneuria.com`        | `staging.depaneuria.com`        | `depaneuria.com`        |
| API             | `api-dev.depaneuria.com`    | `api-staging.depaneuria.com`    | `api.depaneuria.com`    |
| Administration  | `admin-dev.depaneuria.com`  | `admin-staging.depaneuria.com`  | `admin.depaneuria.com`  |
| Tenant (client) | `{slug}-dev.depaneuria.com` | `{slug}-staging.depaneuria.com` | `{slug}.depaneuria.com` |

### Règles

- Le domaine principal (`depaneuria.com`) est réservé à la production.
- Les sous-domaines de développement et de préproduction incluent
  obligatoirement le suffixe d'environnement.
- Chaque tenant actif dispose d'un sous-domaine unique basé sur son slug.
- Les domaines personnalisés pour les tenants (ex. `www.mondepanneur.com`)
  sont hors périmètre V1.
- Les enregistrements DNS sont gérés via le fournisseur de domaine
  (Cloudflare, Google Domains ou équivalent).

---

## DEP-0750 — Définir la stratégie HTTPS

### Objectif

Définir la stratégie de chiffrement HTTPS pour l'ensemble de la plateforme,
garantissant que toutes les communications entre les clients et les serveurs
sont sécurisées.

### Contexte

Le protocole HTTPS est obligatoire pour la protection des données en transit,
la confiance des utilisateurs et le bon fonctionnement des webhooks Twilio
(DEP-0740) qui exigent un endpoint HTTPS valide.

### Stratégie retenue

| Élément                  | Valeur                               |
| ------------------------ | ------------------------------------ |
| Certificats              | Let's Encrypt (gratuit, automatique) |
| Renouvellement           | Automatique (90 jours)               |
| Protocole minimum        | TLS 1.2                              |
| Redirection HTTP → HTTPS | Automatique sur tous les domaines    |
| HSTS                     | Activé avec `max-age=31536000`       |

### Configuration par composant

| Composant      | Terminaison TLS                                  |
| -------------- | ------------------------------------------------ |
| Front client   | Au niveau du load balancer ou du CDN             |
| API            | Au niveau du load balancer                       |
| Administration | Au niveau du load balancer                       |
| Webhooks       | Au niveau du load balancer (même certificat API) |

### Règles

- Aucun endpoint public ne doit être accessible en HTTP non chiffré.
- La redirection HTTP → HTTPS est forcée au niveau de l'infrastructure,
  pas de l'application.
- Les certificats sont gérés automatiquement — aucun renouvellement manuel.
- Le header HSTS est présent sur toutes les réponses HTTP des domaines
  de production.
- Les environnements de développement et de préproduction utilisent
  également HTTPS (certificats Let's Encrypt ou auto-signés pour le
  développement local).

---

## DEP-0751 — Définir les endpoints publics du front

### Objectif

Définir les endpoints (URLs) publics accessibles par les clients finaux
via le navigateur web.

### Contexte

Le front client est l'interface principale utilisée par les consommateurs
pour parcourir le catalogue, passer des commandes et suivre leurs livraisons.
Les endpoints publics doivent être cohérents avec la structure des pages
définie en DEP-0161–DEP-0180.

### Endpoints

| Méthode | Chemin              | Description                              |
| ------- | ------------------- | ---------------------------------------- |
| GET     | `/`                 | Page d'accueil de la boutique            |
| GET     | `/catalogue`        | Page du catalogue (liste des catégories) |
| GET     | `/catalogue/{slug}` | Page d'une catégorie spécifique          |
| GET     | `/produit/{slug}`   | Page de détail d'un produit              |
| GET     | `/panier`           | Page du panier                           |
| GET     | `/suivi`            | Page de suivi de commande                |
| GET     | `/connexion`        | Page de connexion                        |
| GET     | `/inscription`      | Page d'inscription                       |
| GET     | `/profil`           | Page du profil client                    |
| GET     | `/assistant`        | Interface de l'assistant texte/vocal     |

### Règles

- Tous les endpoints du front sont accessibles en HTTPS uniquement
  (DEP-0750).
- Les pages protégées (profil, suivi) redirigent vers `/connexion` si
  l'utilisateur n'est pas authentifié.
- Les URLs utilisent des slugs lisibles, jamais des identifiants
  techniques.
- Le routage est géré côté client (SPA) avec rendu serveur pour le SEO
  des pages publiques.

---

## DEP-0752 — Définir les endpoints publics de l'API

### Objectif

Définir les endpoints publics de l'API REST accessibles par le front client
et par les intégrations tierces autorisées.

### Contexte

L'API est le point d'entrée unique pour toutes les opérations de données.
Le front client, l'assistant et les webhooks communiquent exclusivement via
l'API. Les endpoints publics sont ceux qui ne requièrent pas de rôle
administrateur.

### Endpoints

| Méthode | Chemin                          | Auth requise | Description                        |
| ------- | ------------------------------- | ------------ | ---------------------------------- |
| GET     | `/api/v1/catalogue`             | Non          | Liste des catégories et produits   |
| GET     | `/api/v1/catalogue/{slug}`      | Non          | Détail d'une catégorie             |
| GET     | `/api/v1/produits/{slug}`       | Non          | Détail d'un produit                |
| POST    | `/api/v1/auth/inscription`      | Non          | Inscription d'un nouveau client    |
| POST    | `/api/v1/auth/connexion`        | Non          | Connexion (envoi OTP)              |
| POST    | `/api/v1/auth/verification`     | Non          | Vérification du code OTP           |
| GET     | `/api/v1/profil`                | Oui (client) | Profil du client connecté          |
| PUT     | `/api/v1/profil`                | Oui (client) | Mise à jour du profil              |
| GET     | `/api/v1/panier`                | Oui (client) | Contenu du panier                  |
| POST    | `/api/v1/panier/articles`       | Oui (client) | Ajout d'un article au panier       |
| DELETE  | `/api/v1/panier/articles/{id}`  | Oui (client) | Suppression d'un article du panier |
| POST    | `/api/v1/commandes`             | Oui (client) | Création d'une commande            |
| GET     | `/api/v1/commandes/{id}/suivi`  | Oui (client) | Suivi d'une commande               |
| POST    | `/api/v1/webhooks/twilio/voice` | Signature    | Webhook entrant Twilio (DEP-0740)  |

### Règles

- Tous les endpoints sont préfixés par `/api/v1` pour le versionnement.
- Les endpoints non authentifiés sont limités en débit (rate limiting).
- Les endpoints authentifiés utilisent un token JWT (DEP-0139).
- Le webhook Twilio n'utilise pas JWT mais la validation de signature
  Twilio (DEP-0740).
- Les réponses suivent le format JSON avec les codes HTTP standards
  (200, 201, 400, 401, 403, 404, 500).

---

## DEP-0753 — Définir les endpoints privés d'administration

### Objectif

Définir les endpoints de l'API réservés aux rôles d'administration
(dépanneur, livreur, super admin) et inaccessibles aux clients.

### Contexte

Les endpoints d'administration permettent de gérer le catalogue, les
commandes, les tenants et les utilisateurs. Ils sont protégés par
l'authentification et l'autorisation par rôle.

### Endpoints dépanneur

| Méthode | Chemin                                  | Description                         |
| ------- | --------------------------------------- | ----------------------------------- |
| GET     | `/api/v1/admin/commandes`               | Liste des commandes du tenant       |
| PUT     | `/api/v1/admin/commandes/{id}/statut`   | Changement de statut d'une commande |
| GET     | `/api/v1/admin/catalogue`               | Liste des produits du catalogue     |
| POST    | `/api/v1/admin/catalogue/produits`      | Ajout d'un produit                  |
| PUT     | `/api/v1/admin/catalogue/produits/{id}` | Modification d'un produit           |
| DELETE  | `/api/v1/admin/catalogue/produits/{id}` | Suppression d'un produit            |
| GET     | `/api/v1/admin/categories`              | Liste des catégories                |
| POST    | `/api/v1/admin/categories`              | Ajout d'une catégorie               |
| PUT     | `/api/v1/admin/categories/{id}`         | Modification d'une catégorie        |

### Endpoints livreur

| Méthode | Chemin                                     | Description                        |
| ------- | ------------------------------------------ | ---------------------------------- |
| GET     | `/api/v1/livreur/livraisons`               | Liste des livraisons disponibles   |
| PUT     | `/api/v1/livreur/livraisons/{id}/accepter` | Accepter une livraison             |
| PUT     | `/api/v1/livreur/livraisons/{id}/statut`   | Mise à jour du statut de livraison |

### Endpoints super admin

| Méthode | Chemin                                       | Description              |
| ------- | -------------------------------------------- | ------------------------ |
| GET     | `/api/v1/super-admin/tenants`                | Liste des tenants        |
| POST    | `/api/v1/super-admin/tenants`                | Création d'un tenant     |
| PUT     | `/api/v1/super-admin/tenants/{id}`           | Modification d'un tenant |
| PUT     | `/api/v1/super-admin/tenants/{id}/suspendre` | Suspension d'un tenant   |
| PUT     | `/api/v1/super-admin/tenants/{id}/reactiver` | Réactivation d'un tenant |

### Règles

- Tous les endpoints d'administration requièrent une authentification JWT.
- Chaque endpoint vérifie le rôle de l'utilisateur (`depanneur`, `livreur`,
  `super_admin`).
- Les endpoints dépanneur sont scopés au tenant de l'utilisateur connecté
  (isolation multi-tenant, DEP-0644).
- Les endpoints super admin ne sont accessibles qu'au rôle `super_admin`.
- Les actions critiques (suppression, suspension) sont journalisées dans
  Cloud Logging (DEP-0735).

---

## DEP-0754 — Définir la stratégie de stockage des images produits

### Objectif

Définir la stratégie complète de stockage, d'organisation et de distribution
des images produits dans le service de stockage cloud.

### Contexte

Les images produits sont les fichiers les plus consultés de la plateforme.
Leur stockage doit être performant (chargement rapide), économique (taille
optimisée) et organisé (par tenant, par produit) pour faciliter la gestion
et l'isolation multi-tenant.

### Structure de stockage

```
{bucket}/
  {tenant_id}/
    produits/
      {produit_id}/
        original.{ext}
        thumb_300x300.{ext}
        medium_800x800.{ext}
    categories/
      {categorie_id}/
        cover.{ext}
    logo/
      logo.{ext}
```

### Formats et tailles

| Variante  | Dimensions maximales | Format   | Usage                          |
| --------- | -------------------- | -------- | ------------------------------ |
| Original  | Taille originale     | WebP/PNG | Archive, pas servi directement |
| Miniature | 300 × 300 px         | WebP     | Liste catalogue, panier        |
| Moyenne   | 800 × 800 px         | WebP     | Page de détail produit         |

### Pipeline de traitement

1. L'image est uploadée via l'API d'administration (DEP-0753).
2. L'image originale est stockée dans le bucket du tenant.
3. Un traitement asynchrone génère les variantes (miniature, moyenne).
4. Les variantes sont stockées dans le même répertoire que l'original.
5. Les URLs des variantes sont enregistrées dans la base de données.

### Distribution

| Élément              | Valeur                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------- |
| CDN                  | Activé devant le bucket de production                                                  |
| Cache                | `Cache-Control: public, max-age=86400` (1 jour)                                        |
| URL publique         | `https://cdn.depaneuria.com/{tenant_slug}/produits/{produit_slug}/medium_800x800.webp` |
| URL interne (bucket) | `{bucket}/{tenant_id}/produits/{produit_id}/medium_800x800.webp`                       |
| Invalidation         | Lors de la mise à jour d'une image produit                                             |

> **Note** : Les URLs publiques exposées aux clients utilisent des slugs
> lisibles (cohérent avec DEP-0751). Un mécanisme de réécriture au niveau
> du CDN ou de l'API traduit les slugs en identifiants internes pour
> localiser le fichier dans le bucket.

### Règles

- Les images sont isolées par tenant — un tenant ne peut jamais accéder
  aux images d'un autre tenant.
- Les images uploadées sont validées : type MIME (`image/webp`, `image/png`,
  `image/jpeg`), taille maximale (5 Mo).
- Le format WebP est privilégié pour les variantes servies aux clients.
- L'image originale est conservée même si elle n'est pas servie directement,
  pour permettre une régénération future des variantes.
- La suppression d'un produit déclenche un soft delete des images associées
  (rétention 30 jours, DEP-0738).

---

## Synthèse

| DEP  | Titre                                                     | Statut |
| ---- | --------------------------------------------------------- | ------ |
| 0735 | Activer Cloud Logging                                     | Défini |
| 0736 | Activer Cloud Monitoring                                  | Défini |
| 0737 | Activer la base de données choisie                        | Défini |
| 0738 | Activer le service de stockage de fichiers choisi         | Défini |
| 0739 | Activer les API nécessaires à l'assistant si choisies     | Défini |
| 0740 | Activer les API nécessaires à la téléphonie               | Défini |
| 0741 | Créer le registre d'images du projet                      | Défini |
| 0742 | Créer l'environnement cloud de développement              | Défini |
| 0743 | Créer l'environnement cloud de préproduction              | Défini |
| 0744 | Créer l'environnement cloud de production                 | Défini |
| 0745 | Définir les variables d'environnement cloud dev           | Défini |
| 0746 | Définir les variables d'environnement cloud préproduction | Défini |
| 0747 | Définir les variables d'environnement cloud production    | Défini |
| 0748 | Stocker les secrets dans Secret Manager                   | Défini |
| 0749 | Définir les domaines et sous-domaines                     | Défini |
| 0750 | Définir la stratégie HTTPS                                | Défini |
| 0751 | Définir les endpoints publics du front                    | Défini |
| 0752 | Définir les endpoints publics de l'API                    | Défini |
| 0753 | Définir les endpoints privés d'administration             | Défini |
| 0754 | Définir la stratégie de stockage des images produits      | Défini |
