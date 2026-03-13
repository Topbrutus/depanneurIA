# DEP-0715 à DEP-0734 — Tests multilingues et base Google Cloud

## Périmètre

Ce document couvre deux sous-blocs distincts mais contigus :

1. **DEP-0715–DEP-0720** : Les **tests de validation multilingue** — basculement
   de langue sans perte de données (panier, conversation, commande), reconnaissance
   des synonymes dans les deux langues, cohérence multilingue sur téléphone, et gel
   de la stratégie multilingue V1.

2. **DEP-0721–DEP-0734** : La **base Google Cloud** du projet — création et
   configuration du projet Google Cloud, activation de la facturation, gestion des
   crédits, création des comptes IAM et comptes de service, activation des services
   Cloud (Cloud Run, Artifact Registry, Cloud Build, Secret Manager).

Ces décisions s'appuient sur les bases multilingues définies en DEP-0681–DEP-0694
(langues supportées, changement de langue, clés de traduction) et préparent le
terrain pour le déploiement cloud futur.

Il s'agit exclusivement de **documentation** : aucun code produit, aucune
implémentation, aucun provisionnement réel cloud. Les spécifications décrites ici
serviront de référence pour les futurs tests et le futur déploiement.

---

## DEP-0715 — Test du basculement de langue sans perdre le panier

### Objectif

Vérifier que le client peut changer de langue d'affichage (DEP-0684) sans que
le contenu du panier soit perdu ou corrompu.

### Scénario de test

| Étape | Action                                                       | Résultat attendu                          |
|-------|--------------------------------------------------------------|-------------------------------------------|
| 1     | Le client est connecté, langue active = `fr`                 | Interface en français                     |
| 2     | Le client ajoute 3 produits au panier                        | Panier contient 3 articles                |
| 3     | Le client change la langue vers `en` depuis les paramètres   | Interface passe en anglais                |
| 4     | Le client consulte le panier                                 | Les 3 articles sont toujours présents     |
| 5     | Les noms des produits s'affichent dans la langue active (`en`) | Noms traduits si disponibles, sinon nom par défaut |
| 6     | Le client change à nouveau vers `fr`                         | Panier intact, noms en français           |

### Règles de validation

- Le contenu du panier (IDs produit, quantités, variantes) ne change jamais lors
  d'un changement de langue.
- Seul l'affichage textuel (noms, descriptions) est adapté à la langue active.
- Si une traduction de produit est absente, le nom dans la langue par défaut du
  tenant s'affiche (DEP-0694).

### Critère de succès

- Le panier reste identique après un ou plusieurs changements de langue.
- Aucun article n'est perdu, dupliqué ou modifié.
- L'interface affiche correctement les textes dans la langue active.

---

## DEP-0716 — Test du basculement de langue sans perdre la conversation

### Objectif

Vérifier que l'historique de conversation avec l'assistant texte (DEP-0361–0400)
est conservé lorsque le client change de langue.

### Scénario de test

| Étape | Action                                                       | Résultat attendu                          |
|-------|--------------------------------------------------------------|-------------------------------------------|
| 1     | Le client est connecté, langue active = `fr`                 | Interface en français                     |
| 2     | Le client engage une conversation avec l'assistant texte     | 5 messages échangés en français           |
| 3     | Le client change la langue vers `en`                         | Interface passe en anglais                |
| 4     | Le client rouvre la fenêtre de conversation                  | Les 5 messages précédents sont affichés   |
| 5     | Les messages du client restent dans leur langue d'origine    | Messages clients en français              |
| 6     | Le client envoie un nouveau message en anglais               | L'assistant répond en anglais             |
| 7     | Le client revient en `fr`                                    | Tous les messages sont conservés          |

### Règles de validation

- L'historique de conversation est conservé indépendamment de la langue active.
- Les messages déjà envoyés ne sont jamais retraduits automatiquement.
- L'assistant adapte la langue de ses **nouvelles réponses** à la langue active
  du client au moment de l'envoi (DEP-0684).

### Critère de succès

- Aucun message n'est perdu lors d'un changement de langue.
- Les messages passés restent dans leur langue d'origine.
- Les nouveaux messages de l'assistant respectent la langue active actuelle.

---

## DEP-0717 — Test du basculement de langue sans perdre la commande

### Objectif

Vérifier qu'une commande en cours de préparation ou de livraison reste accessible
et cohérente lorsque le client change de langue.

### Scénario de test

| Étape | Action                                                       | Résultat attendu                          |
|-------|--------------------------------------------------------------|-------------------------------------------|
| 1     | Le client passe une commande en français                     | Commande confirmée, statut `en_preparation`|
| 2     | Le client change la langue vers `en`                         | Interface passe en anglais                |
| 3     | Le client consulte l'écran de suivi de commande              | Commande affichée avec tous ses détails   |
| 4     | Les noms de produits s'affichent dans la langue active (`en`) | Traductions affichées si disponibles      |
| 5     | Les statuts de commande sont traduits (DEP-0693)             | `en_preparation` → "In Preparation"       |
| 6     | Le client reçoit une notification de changement de statut    | Notification en anglais (langue active)   |
| 7     | Le client revient en `fr`                                    | Commande toujours présente et cohérente   |

### Règles de validation

- Les données de commande (produits, quantités, adresse, téléphone) ne changent
  jamais lors d'un changement de langue.
- Seuls les textes d'affichage (noms, statuts, messages système) sont traduits.
- Les notifications push/SMS respectent la langue préférée du compte (DEP-0689).

### Critère de succès

- La commande reste accessible et cohérente dans toutes les langues.
- Les changements de langue n'affectent ni le contenu ni le traitement de la commande.
- Les notifications respectent la langue active au moment de leur envoi.

---

## DEP-0718 — Test de reconnaissance des synonymes dans les deux langues

### Objectif

Vérifier que l'assistant texte et l'agent vocal téléphonique (DEP-0441–0456)
reconnaissent correctement les synonymes des produits dans les deux langues
supportées (`fr` et `en`).

### Scénario de test pour l'assistant texte

| Langue | Requête client                  | Produit attendu reconnu      |
|--------|---------------------------------|------------------------------|
| `fr`   | « Je veux des freins »          | Produit catégorie Freins     |
| `fr`   | « J'ai besoin de plaquettes »   | Synonyme → Freins            |
| `en`   | « I need brake pads »           | Synonyme → Freins            |
| `en`   | « Do you have brakes? »         | Produit catégorie Freins     |
| `fr`   | « Huile moteur »                | Produit catégorie Huiles     |
| `en`   | « Engine oil »                  | Produit catégorie Huiles     |

### Scénario de test pour l'agent vocal téléphonique

| Langue | Énoncé client                     | Produit attendu reconnu      |
|--------|-----------------------------------|------------------------------|
| `fr`   | « Je voudrais des essuie-glaces » | Produit catégorie Essuie-glaces |
| `fr`   | « Des balais d'essuie-glace »     | Synonyme → Essuie-glaces     |
| `en`   | « I need wiper blades »           | Synonyme → Essuie-glaces     |
| `en`   | « Windshield wipers »             | Synonyme → Essuie-glaces     |

### Règles de validation

- Chaque produit doit avoir des synonymes définis dans les deux langues (DEP-0256–0270).
- Les synonymes sont normalisés (minuscules, sans accents) avant comparaison.
- L'assistant et l'agent vocal utilisent le même référentiel de synonymes.
- Si aucun synonyme ne correspond, le système demande une clarification.

### Critère de succès

- Les synonymes français et anglais des produits sont reconnus correctement.
- Aucune confusion entre produits similaires de langues différentes.
- Les taux de reconnaissance sont équivalents dans les deux langues (±5%).

---

## DEP-0719 — Vérification de la cohérence multilingue sur téléphone

### Objectif

Vérifier que l'agent vocal téléphonique (DEP-0441–0456, DEP-0687) respecte
la langue choisie tout au long de l'appel et maintient la cohérence avec le
compte client si celui-ci est connu.

### Scénario de test 1 : Client connu avec langue préférée

| Étape | Action                                                       | Résultat attendu                          |
|-------|--------------------------------------------------------------|-------------------------------------------|
| 1     | Le client appelle depuis un numéro enregistré               | Système reconnaît le client               |
| 2     | La langue préférée du compte est `en` (DEP-0689)             | Salutation en anglais                     |
| 3     | Le client demande un produit en anglais                      | Agent vocal répond en anglais             |
| 4     | Le client termine l'appel et se connecte sur le site         | Interface affichée en anglais             |
| 5     | La commande téléphonique apparaît dans l'historique          | Détails affichés en anglais               |

### Scénario de test 2 : Client inconnu avec choix de langue initial

| Étape | Action                                                       | Résultat attendu                          |
|-------|--------------------------------------------------------------|-------------------------------------------|
| 1     | Le client appelle depuis un numéro inconnu                   | Salutation multilingue (DEP-0687)         |
| 2     | Le client répond « English » ou « Anglais »                  | Système bascule en anglais                |
| 3     | Le client passe une commande en anglais                      | Commande enregistrée, langue = `en`       |
| 4     | Le client crée un compte plus tard avec ce téléphone         | Langue préférée du compte = `en`          |

### Règles de validation

- La langue choisie au téléphone reste stable pendant tout l'appel.
- Si le client est connu, sa langue préférée (DEP-0689) est appliquée dès le début.
- Si le client est inconnu, le système propose un choix de langue (DEP-0687).
- Les commandes passées au téléphone respectent la langue de l'appel dans les
  confirmations SMS et l'historique web.

### Critère de succès

- Aucune incohérence de langue entre le téléphone, le site web et les notifications.
- La langue préférée du client est respectée sur tous les canaux (DEP-0691).
- Les transitions entre téléphone et web sont fluides et cohérentes.

---

## DEP-0720 — Gel de la stratégie multilingue V1

### Objectif

Figer la portée et les limitations de la stratégie multilingue pour la version 1
de depaneurIA, avant toute extension future.

### Langues supportées en V1

| Code langue | Nom complet       | Statut         | Référence   |
|-------------|-------------------|----------------|-------------|
| `fr`        | Français          | Supporté       | DEP-0681    |
| `en`        | Anglais           | Supporté       | DEP-0681    |

**Aucune autre langue n'est supportée en V1.**

### Fonctionnalités multilingues en V1

| Fonctionnalité                                | Incluse en V1 | Référence    |
|-----------------------------------------------|---------------|--------------|
| Interface client bilingue (fr/en)             | ✅ Oui        | DEP-0684     |
| Interface dépanneur bilingue (fr/en)          | ✅ Oui        | DEP-0685     |
| Interface livreur bilingue (fr/en)            | ✅ Oui        | DEP-0686     |
| Agent vocal téléphonique bilingue (fr/en)     | ✅ Oui        | DEP-0687     |
| Changement de langue à tout moment            | ✅ Oui        | DEP-0684–0687|
| Langue préférée par compte                    | ✅ Oui        | DEP-0689     |
| Langue préférée par navigateur                | ✅ Oui        | DEP-0690     |
| Langue préférée par téléphone                 | ✅ Oui        | DEP-0691     |
| Traduction des noms de catégories             | ✅ Oui        | DEP-0694     |
| Traduction des clés système                   | ✅ Oui        | DEP-0692–0693|

### Fonctionnalités hors périmètre V1

| Fonctionnalité                                | Incluse en V1 | Raison                     |
|-----------------------------------------------|---------------|----------------------------|
| Support d'une 3ᵉ langue (espagnol, etc.)      | ❌ Non        | Périmètre limité           |
| Traduction automatique des produits           | ❌ Non        | Saisie manuelle uniquement |
| Traduction automatique des conversations      | ❌ Non        | Complexité hors scope      |
| Détection automatique de langue par IA        | ❌ Non        | Choix explicite uniquement |
| Traduction des descriptions longues de produits| ❌ Non       | Noms de catégories seulement|

### Règles de stabilité

- Toute demande d'ajout de langue supplémentaire est reportée en V2.
- Les clés de traduction définies en V1 (DEP-0692) ne doivent pas être renommées
  sans migration explicite.
- Les conventions de traduction (DEP-0693) restent figées jusqu'au gel V2.

### Critère de validation

- La documentation de DEP-0681 à DEP-0720 est complète et cohérente.
- Les tests de DEP-0715 à DEP-0719 sont documentés et prêts pour implémentation.
- Aucune dépendance non documentée n'est découverte dans les tests.

---

## DEP-0721 — Création du projet Google Cloud principal

### Objectif

Définir le processus de création du projet Google Cloud principal qui hébergera
l'infrastructure complète de depaneurIA (backend, storage, services).

### Contexte

Google Cloud Platform (GCP) sera le fournisseur cloud principal pour le
déploiement de la V1. Le projet GCP est le conteneur de haut niveau pour toutes
les ressources cloud (Cloud Run, Artifact Registry, bases de données, stockage).

### Séquence de création

| Étape | Action                                                       | Responsable      |
|-------|--------------------------------------------------------------|------------------|
| 1     | Se connecter à Google Cloud Console                          | Administrateur   |
| 2     | Cliquer sur « Sélectionner un projet » puis « Nouveau projet »| Administrateur   |
| 3     | Saisir le nom du projet (DEP-0722)                           | Administrateur   |
| 4     | Sélectionner l'organisation (si applicable)                  | Administrateur   |
| 5     | Cliquer sur « Créer »                                        | Administrateur   |
| 6     | Attendre la confirmation de création (30–60 secondes)        | Système          |
| 7     | Noter l'ID du projet généré (format: `nom-projet-123456`)    | Administrateur   |

### Informations requises

| Champ                    | Description                                      | Exemple              |
|--------------------------|--------------------------------------------------|----------------------|
| Nom du projet            | Nom lisible par humain (DEP-0722)                | `depaneurIA-prod`    |
| ID du projet             | Identifiant unique généré automatiquement        | `depaneuia-prod-4562`|
| Organisation (optionnel) | Organisation Google Cloud si applicable          | `depanneur.com`      |

### Règles

- Un seul projet Google Cloud est créé pour toute la plateforme en V1.
- Le projet est créé **manuellement** depuis la console Google Cloud.
- L'ID du projet est immuable une fois généré — le noter immédiatement.
- Aucun provisionnement automatisé (Terraform, gcloud CLI) en V1 — manuel uniquement.

### Validation

- Le projet apparaît dans la liste des projets Google Cloud Console.
- L'ID du projet est documenté dans un fichier sécurisé (ex. : gestionnaire de secrets).
- Le projet est sélectionné comme projet actif dans la console.

---

## DEP-0722 — Donner un nom clair au projet Google Cloud

### Objectif

Définir une convention de nommage claire et cohérente pour le projet Google Cloud
principal de depaneurIA.

### Convention de nommage

| Élément      | Valeur recommandée      | Raison                                      |
|--------------|-------------------------|---------------------------------------------|
| Nom du projet| `depaneurIA-prod`       | Clair, descriptif, environnement identifié  |
| ID du projet | Généré automatiquement  | Google Cloud ajoute un suffixe numérique unique |

### Alternatives selon l'environnement

| Environnement | Nom du projet           | Usage                                       |
|---------------|-------------------------|---------------------------------------------|
| Production    | `depaneurIA-prod`       | Environnement de production réel            |
| Staging       | `depaneurIA-staging`    | Environnement de pré-production             |
| Développement | `depaneurIA-dev`        | Environnement de développement local        |
| Test          | `depaneurIA-test`       | Environnement de tests automatisés          |

**En V1, un seul projet est créé : `depaneurIA-prod`.**

### Règles de nommage

- Le nom doit être court (≤30 caractères), descriptif et sans espaces.
- Utiliser uniquement des lettres minuscules, chiffres et tirets (`-`).
- Toujours inclure l'environnement (`-prod`, `-staging`, etc.).
- Éviter les termes génériques (`app`, `project`, `cloud`).

### Exemples à éviter

| Nom                  | Raison du rejet                              |
|----------------------|----------------------------------------------|
| `my-project`         | Trop générique, pas d'identification claire  |
| `depanneur`          | Pas d'environnement identifié                |
| `DépanneurIA Prod`   | Espaces et majuscules interdits              |
| `projet-123`         | Pas de contexte métier                       |

### Validation

- Le nom est documenté dans `docs/STATE.md` ou un fichier de configuration cloud.
- Le nom respecte les contraintes de Google Cloud (longueur, caractères).
- Le nom est cohérent avec les conventions de nommage du projet (CONTRIBUTING.md).

---

## DEP-0723 — Activation de la facturation du projet Google Cloud

### Objectif

Définir le processus d'activation de la facturation sur le projet Google Cloud
principal pour permettre l'utilisation des services cloud payants (Cloud Run,
Artifact Registry, Secret Manager, etc.).

### Contexte

Google Cloud offre un niveau gratuit limité pour certains services. Cependant,
pour utiliser Cloud Run, Cloud Build et les autres services requis par depaneurIA,
la facturation doit être activée.

### Séquence d'activation

| Étape | Action                                                       | Responsable      |
|-------|--------------------------------------------------------------|------------------|
| 1     | Se connecter à Google Cloud Console                          | Administrateur   |
| 2     | Sélectionner le projet `depaneurIA-prod`                     | Administrateur   |
| 3     | Aller dans « Facturation » depuis le menu principal          | Administrateur   |
| 4     | Cliquer sur « Associer un compte de facturation »            | Administrateur   |
| 5     | Créer un nouveau compte de facturation ou sélectionner existant| Administrateur|
| 6     | Saisir les informations de carte bancaire ou mode de paiement | Administrateur   |
| 7     | Accepter les conditions d'utilisation                        | Administrateur   |
| 8     | Confirmer l'association du compte de facturation au projet   | Administrateur   |

### Informations requises

| Champ                    | Description                                      | Exemple              |
|--------------------------|--------------------------------------------------|----------------------|
| Nom du compte facturation| Nom lisible pour identifier le compte            | `DépanneurIA Billing`|
| Mode de paiement         | Carte bancaire, virement, crédits Google         | Carte Visa           |
| Adresse de facturation   | Adresse légale de l'entreprise                   | Montréal, QC         |
| Devise                   | Devise du compte (CAD pour le Québec)            | CAD                  |

### Règles

- La facturation doit être activée **avant** d'activer les services cloud (DEP-0731–0734).
- Les crédits Google Cloud gratuits (300 $ USD) sont automatiquement appliqués
  lors de la première activation (DEP-0724).
- Les alertes de budget doivent être configurées immédiatement après activation
  (seuils : 50 $, 100 $, 200 $).

### Validation

- Le projet affiche « Facturation activée » dans Google Cloud Console.
- Le compte de facturation est visible dans la section « Facturation ».
- Les crédits gratuits (si applicable) apparaissent dans le solde du compte.

---

## DEP-0724 — Vérification des crédits disponibles pour les tests

### Objectif

Définir le processus de vérification et de suivi des crédits Google Cloud
disponibles (gratuits ou payants) avant de commencer les tests et le déploiement.

### Crédits Google Cloud gratuits

Google Cloud offre **300 $ USD de crédits gratuits** pour tout nouveau compte,
valables pendant **90 jours** après l'activation de la facturation.

### Vérification des crédits

| Étape | Action                                                       | Résultat attendu                          |
|-------|--------------------------------------------------------------|-------------------------------------------|
| 1     | Se connecter à Google Cloud Console                          | Projet sélectionné                        |
| 2     | Aller dans « Facturation » > « Crédits »                     | Liste des crédits disponibles             |
| 3     | Vérifier le solde des crédits gratuits                       | Montant restant (ex. : 300 $ USD)         |
| 4     | Vérifier la date d'expiration des crédits                    | Date limite (ex. : 2026-06-13)            |
| 5     | Vérifier les seuils d'alerte configurés                      | Alertes à 50 $, 100 $, 200 $ configurées  |

### Estimation des coûts pour les tests V1

| Service              | Usage estimé tests     | Coût estimé mensuel  |
|----------------------|------------------------|----------------------|
| Cloud Run (backend)  | 100 heures conteneur   | ~5–10 $ USD          |
| Artifact Registry    | 5 images Docker        | ~1 $ USD             |
| Cloud Build          | 50 builds tests        | ~5 $ USD (gratuit ≤120 min/jour)|
| Secret Manager       | 10 secrets, 500 accès  | ~0,50 $ USD          |
| Cloud Storage        | 1 GB images médias     | ~0,20 $ USD          |
| **Total estimé**     | —                      | **~15 $ USD/mois**   |

### Règles de suivi

- Vérifier le solde des crédits **chaque semaine** pendant les tests.
- Configurer des alertes de budget à 50 %, 75 % et 90 % du solde disponible.
- Si les crédits gratuits expirent, activer le mode payant avec limite de 100 $ CAD/mois.
- Documenter toute dépense imprévue dans les journaux du projet.

### Validation

- Le solde des crédits est visible et documenté.
- Les alertes de budget sont configurées et fonctionnelles.
- Le responsable du projet reçoit les notifications d'alerte par email.

---

## DEP-0725 — Création des comptes IAM principaux

### Objectif

Définir les comptes IAM (Identity and Access Management) principaux nécessaires
pour gérer le projet Google Cloud et déléguer les accès aux membres de l'équipe.

### Contexte

IAM permet de contrôler qui (utilisateur, compte de service) peut faire quoi
(rôle, permissions) sur quelles ressources (projet, service, bucket).

### Comptes IAM principaux en V1

| Compte                    | Type       | Rôle principal           | Usage                        |
|---------------------------|------------|--------------------------|------------------------------|
| Administrateur principal  | Utilisateur| `Owner`                  | Gestion complète du projet   |
| Développeur backend       | Utilisateur| `Editor`                 | Déploiement et développement |
| Compte de service déploiement| Service| `Cloud Run Admin`        | Déploiement automatisé (CI/CD)|
| Compte de service backend | Service    | `Cloud Run Invoker`      | Exécution du backend         |
| Compte de service storage | Service    | `Storage Object Admin`   | Gestion des médias           |

**En V1, un seul utilisateur humain (`Owner`) est requis.**

### Création d'un compte IAM utilisateur

| Étape | Action                                                       | Responsable      |
|-------|--------------------------------------------------------------|------------------|
| 1     | Aller dans « IAM et administration » > « IAM »               | Administrateur   |
| 2     | Cliquer sur « Ajouter »                                      | Administrateur   |
| 3     | Saisir l'email de l'utilisateur à ajouter                    | Administrateur   |
| 4     | Sélectionner le rôle (ex. : `Editor`, `Viewer`)              | Administrateur   |
| 5     | Cliquer sur « Enregistrer »                                  | Administrateur   |
| 6     | L'utilisateur reçoit une invitation par email                | Système          |

### Règles de sécurité

- Le rôle `Owner` est réservé au créateur du projet — limiter à 1 seul compte.
- Ne jamais utiliser de compte de service avec le rôle `Owner`.
- Les comptes de service doivent avoir les permissions minimales nécessaires (DEP-0726).
- Activer l'authentification à deux facteurs (2FA) pour tous les comptes utilisateurs.

### Validation

- Les comptes IAM apparaissent dans la section « IAM et administration ».
- Chaque compte a un rôle clair et documenté.
- Aucun compte de service n'a de permissions excessives.

---

## DEP-0726 — Définition des rôles IAM minimaux nécessaires

### Objectif

Définir les rôles IAM (Identity and Access Management) minimaux nécessaires pour
chaque compte de service, en respectant le principe du moindre privilège.

### Principe du moindre privilège

Chaque compte de service doit avoir **uniquement les permissions nécessaires**
pour accomplir sa tâche, et rien de plus. Cela réduit les risques de sécurité
en cas de compromission d'un compte.

### Matrice des rôles minimaux

| Compte de service             | Rôle IAM minimal             | Permissions incluses                     |
|-------------------------------|------------------------------|------------------------------------------|
| Compte de service déploiement | `Cloud Run Admin`            | Créer/modifier/supprimer des services    |
|                               | `Service Account User`       | Utiliser d'autres comptes de service     |
|                               | `Artifact Registry Writer`   | Pousser des images Docker                |
| Compte de service backend     | `Cloud Run Invoker`          | Invoquer les services Cloud Run          |
|                               | `Secret Manager Secret Accessor`| Lire les secrets (clés API, tokens)   |
|                               | `Storage Object Viewer`      | Lire les objets dans Cloud Storage       |
| Compte de service storage     | `Storage Object Admin`       | Créer/modifier/supprimer des objets      |
|                               | `Storage Bucket User`        | Lire les métadonnées des buckets         |
| Compte de service traitement audio| `Cloud Run Invoker`     | Invoquer les services Cloud Run          |
|                               | `Storage Object Creator`     | Écrire des fichiers audio traités        |

### Règles de définition

- Un rôle prédéfini Google (`Cloud Run Admin`, `Editor`, etc.) est préférable
  à un rôle personnalisé lorsque possible.
- Si un rôle prédéfini accorde trop de permissions, créer un **rôle personnalisé**
  avec uniquement les permissions nécessaires.
- Documenter chaque rôle attribué dans un fichier `docs/cloud/iam-roles.md`.

### Exemples de rôles personnalisés (si nécessaire en V2)

| Nom du rôle personnalisé      | Permissions incluses                             |
|-------------------------------|--------------------------------------------------|
| `depaneurIA.backendRunner`    | `run.services.invoke`, `secretmanager.versions.access`|
| `depaneurIA.mediaManager`     | `storage.objects.create`, `storage.objects.get`, `storage.objects.delete`|

**En V1, seuls les rôles prédéfinis sont utilisés.**

### Validation

- Chaque compte de service a un et un seul rôle IAM.
- Aucun compte de service n'a de permissions inutilisées.
- Les permissions sont documentées et justifiées.

---

## DEP-0727 — Création du compte de service de déploiement

### Objectif

Définir le processus de création du compte de service dédié au déploiement
automatisé du backend (CI/CD, GitHub Actions, Cloud Build).

### Contexte

Le compte de service de déploiement est utilisé par les pipelines CI/CD pour
pousser des images Docker, créer des services Cloud Run et gérer les secrets.

### Séquence de création

| Étape | Action                                                       | Responsable      |
|-------|--------------------------------------------------------------|------------------|
| 1     | Aller dans « IAM et administration » > « Comptes de service »| Administrateur   |
| 2     | Cliquer sur « Créer un compte de service »                   | Administrateur   |
| 3     | Saisir le nom : `depaneurIA-deploy`                          | Administrateur   |
| 4     | Saisir la description : « Compte de service pour déploiement CI/CD »| Administrateur|
| 5     | Cliquer sur « Créer et continuer »                           | Administrateur   |
| 6     | Attribuer les rôles : `Cloud Run Admin`, `Service Account User`, `Artifact Registry Writer`| Administrateur|
| 7     | Cliquer sur « Continuer » puis « Terminé »                   | Administrateur   |
| 8     | Créer une clé JSON pour le compte de service                 | Administrateur   |
| 9     | Télécharger le fichier JSON de clé (ex. : `depaneurIA-deploy-key.json`)| Administrateur|
| 10    | Stocker le fichier JSON dans Secret Manager (DEP-0734)       | Administrateur   |

### Informations du compte de service

| Champ                    | Valeur                                           |
|--------------------------|--------------------------------------------------|
| Nom du compte            | `depaneurIA-deploy`                              |
| Email du compte          | `depaneurIA-deploy@depaneuia-prod-4562.iam.gserviceaccount.com`|
| Rôles attribués          | `Cloud Run Admin`, `Service Account User`, `Artifact Registry Writer`|
| Clé JSON                 | Stockée dans Secret Manager (`GCP_DEPLOY_KEY`)   |

### Règles de sécurité

- Le fichier JSON de clé **ne doit jamais être commité dans Git**.
- Stocker la clé dans GitHub Secrets ou Secret Manager uniquement.
- Renouveler la clé tous les 90 jours ou après toute suspicion de compromission.
- Désactiver immédiatement le compte de service en cas de fuite de clé.

### Validation

- Le compte de service apparaît dans la liste des comptes de service.
- Les rôles attribués sont ceux définis en DEP-0726.
- La clé JSON est stockée en sécurité et accessible uniquement au pipeline CI/CD.

---

## DEP-0728 — Création du compte de service du backend

### Objectif

Définir le processus de création du compte de service utilisé par le backend
de depaneurIA pour accéder aux ressources cloud (Secret Manager, Cloud Storage).

### Contexte

Le compte de service du backend s'exécute dans Cloud Run et a besoin d'accéder
aux secrets (clés API, tokens) et aux objets stockés (images produits, médias).

### Séquence de création

| Étape | Action                                                       | Responsable      |
|-------|--------------------------------------------------------------|------------------|
| 1     | Aller dans « IAM et administration » > « Comptes de service »| Administrateur   |
| 2     | Cliquer sur « Créer un compte de service »                   | Administrateur   |
| 3     | Saisir le nom : `depaneurIA-backend`                         | Administrateur   |
| 4     | Saisir la description : « Compte de service pour le backend Cloud Run »| Administrateur|
| 5     | Cliquer sur « Créer et continuer »                           | Administrateur   |
| 6     | Attribuer les rôles : `Cloud Run Invoker`, `Secret Manager Secret Accessor`, `Storage Object Viewer`| Administrateur|
| 7     | Cliquer sur « Continuer » puis « Terminé »                   | Administrateur   |

### Informations du compte de service

| Champ                    | Valeur                                           |
|--------------------------|--------------------------------------------------|
| Nom du compte            | `depaneurIA-backend`                             |
| Email du compte          | `depaneurIA-backend@depaneuia-prod-4562.iam.gserviceaccount.com`|
| Rôles attribués          | `Cloud Run Invoker`, `Secret Manager Secret Accessor`, `Storage Object Viewer`|
| Utilisé par              | Service Cloud Run `depaneurIA-api`               |

### Configuration dans Cloud Run

Lors du déploiement du service Cloud Run, spécifier ce compte de service dans
la configuration :

```bash
gcloud run deploy depaneurIA-api \
  --service-account=depaneurIA-backend@depaneuia-prod-4562.iam.gserviceaccount.com \
  --region=northamerica-northeast1
```

### Règles de sécurité

- Le compte de service ne doit **jamais avoir de clé JSON téléchargée**.
- L'authentification se fait automatiquement via l'identité du service Cloud Run.
- Limiter les accès aux secrets et buckets uniquement nécessaires (principe du moindre privilège).

### Validation

- Le compte de service apparaît dans la liste des comptes de service.
- Le service Cloud Run utilise ce compte de service comme identité d'exécution.
- Le backend peut accéder aux secrets et objets stockés sans erreur d'autorisation.

---

## DEP-0729 — Création du compte de service du traitement audio si nécessaire

### Objectif

Définir le processus de création du compte de service dédié au traitement audio
pour l'agent vocal téléphonique (Twilio + OpenAI Realtime API, DEP-0441–0456).

### Contexte

Si le traitement audio (transcription, synthèse vocale, enregistrement) nécessite
un service Cloud Run séparé ou des permissions spécifiques, un compte de service
dédié est créé.

**En V1, ce compte de service est optionnel** — si tout le traitement audio est
géré par des services tiers (Twilio, OpenAI), il n'est pas nécessaire.

### Cas d'utilisation

| Cas                                  | Compte de service requis ? | Raison                          |
|--------------------------------------|----------------------------|---------------------------------|
| Traitement audio via Twilio/OpenAI  | ❌ Non                     | Aucun stockage cloud requis     |
| Enregistrement audio côté serveur   | ✅ Oui                     | Besoin d'écrire dans Storage    |
| Transcription audio locale          | ✅ Oui                     | Besoin de lire/écrire fichiers  |
| Génération audio côté serveur       | ✅ Oui                     | Besoin d'écrire dans Storage    |

### Séquence de création (si requis)

| Étape | Action                                                       | Responsable      |
|-------|--------------------------------------------------------------|------------------|
| 1     | Aller dans « IAM et administration » > « Comptes de service »| Administrateur   |
| 2     | Cliquer sur « Créer un compte de service »                   | Administrateur   |
| 3     | Saisir le nom : `depaneurIA-audio`                           | Administrateur   |
| 4     | Saisir la description : « Compte de service pour traitement audio »| Administrateur|
| 5     | Cliquer sur « Créer et continuer »                           | Administrateur   |
| 6     | Attribuer les rôles : `Cloud Run Invoker`, `Storage Object Creator`, `Storage Object Viewer`| Administrateur|
| 7     | Cliquer sur « Continuer » puis « Terminé »                   | Administrateur   |

### Informations du compte de service

| Champ                    | Valeur                                           |
|--------------------------|--------------------------------------------------|
| Nom du compte            | `depaneurIA-audio`                               |
| Email du compte          | `depaneurIA-audio@depaneuia-prod-4562.iam.gserviceaccount.com`|
| Rôles attribués          | `Cloud Run Invoker`, `Storage Object Creator`, `Storage Object Viewer`|
| Utilisé par              | Service Cloud Run `depaneurIA-audio-processor` (si applicable)|

### Règles de sécurité

- Le compte de service ne doit **jamais avoir de clé JSON téléchargée**.
- Limiter les accès au bucket de stockage audio uniquement.
- Les enregistrements audio doivent être chiffrés au repos (DEP-0291).

### Validation

- Si requis, le compte de service apparaît dans la liste des comptes de service.
- Si non requis, aucun compte de service audio n'est créé (éviter la complexité inutile).

---

## DEP-0730 — Création du compte de service du stockage médias

### Objectif

Définir le processus de création du compte de service dédié à la gestion du
stockage des médias (images produits, photos catégories, documents).

### Contexte

Le compte de service du stockage médias est utilisé par le backend pour créer,
lire, modifier et supprimer les objets stockés dans Cloud Storage (images de
produits, médias téléchargés par les dépanneurs).

### Séquence de création

| Étape | Action                                                       | Responsable      |
|-------|--------------------------------------------------------------|------------------|
| 1     | Aller dans « IAM et administration » > « Comptes de service »| Administrateur   |
| 2     | Cliquer sur « Créer un compte de service »                   | Administrateur   |
| 3     | Saisir le nom : `depaneurIA-storage`                         | Administrateur   |
| 4     | Saisir la description : « Compte de service pour gestion du stockage médias »| Administrateur|
| 5     | Cliquer sur « Créer et continuer »                           | Administrateur   |
| 6     | Attribuer les rôles : `Storage Object Admin`, `Storage Bucket User`| Administrateur|
| 7     | Cliquer sur « Continuer » puis « Terminé »                   | Administrateur   |

### Informations du compte de service

| Champ                    | Valeur                                           |
|--------------------------|--------------------------------------------------|
| Nom du compte            | `depaneurIA-storage`                             |
| Email du compte          | `depaneurIA-storage@depaneuia-prod-4562.iam.gserviceaccount.com`|
| Rôles attribués          | `Storage Object Admin`, `Storage Bucket User`    |
| Utilisé par              | Backend API (endpoints upload/delete médias)     |

### Permissions du compte de service

| Permission                 | Action autorisée                                |
|----------------------------|-------------------------------------------------|
| `storage.objects.create`   | Créer de nouveaux objets (upload images)        |
| `storage.objects.get`      | Lire des objets existants                       |
| `storage.objects.delete`   | Supprimer des objets (images supprimées)        |
| `storage.objects.update`   | Modifier les métadonnées des objets             |
| `storage.buckets.get`      | Lire les métadonnées des buckets                |

### Règles de sécurité

- Le compte de service ne doit **jamais avoir de clé JSON téléchargée**.
- Limiter les accès au bucket de médias uniquement (`depaneurIA-media`).
- Activer la journalisation des accès au bucket pour traçabilité.

### Validation

- Le compte de service apparaît dans la liste des comptes de service.
- Le backend peut uploader, lire et supprimer des images sans erreur d'autorisation.
- Les logs d'accès au bucket sont activés et consultables.

---

## DEP-0731 — Activation de Cloud Run

### Objectif

Définir le processus d'activation de Google Cloud Run, le service cloud principal
qui hébergera le backend API de depaneurIA.

### Contexte

Cloud Run est un service de conteneurs entièrement géré (serverless) qui permet
de déployer des applications backend sans gérer de serveurs. Il est idéal pour
depaneurIA car il se scale automatiquement et facture uniquement à l'usage.

### Séquence d'activation

| Étape | Action                                                       | Responsable      |
|-------|--------------------------------------------------------------|------------------|
| 1     | Se connecter à Google Cloud Console                          | Administrateur   |
| 2     | Sélectionner le projet `depaneurIA-prod`                     | Administrateur   |
| 3     | Aller dans « API et services » > « Bibliothèque »            | Administrateur   |
| 4     | Rechercher « Cloud Run »                                     | Administrateur   |
| 5     | Cliquer sur « Cloud Run API »                                | Administrateur   |
| 6     | Cliquer sur « Activer »                                      | Administrateur   |
| 7     | Attendre la confirmation d'activation (30–60 secondes)       | Système          |

### Vérification de l'activation

| Étape | Action                                                       | Résultat attendu                          |
|-------|--------------------------------------------------------------|-------------------------------------------|
| 1     | Aller dans « Cloud Run » depuis le menu principal            | Page Cloud Run accessible                 |
| 2     | Vérifier l'absence d'erreur « API non activée »              | Aucune erreur affichée                    |
| 3     | Cliquer sur « Créer un service »                             | Formulaire de création affiché            |

### Région recommandée en V1

| Région                   | Emplacement           | Raison du choix                          |
|--------------------------|-----------------------|------------------------------------------|
| `northamerica-northeast1`| Montréal, Canada      | Proximité du Québec, conformité RGPD     |

**Toujours déployer dans la même région** pour réduire la latence entre services.

### Règles

- Cloud Run doit être activé **avant** de tenter tout déploiement.
- La facturation doit être activée (DEP-0723) avant d'activer Cloud Run.
- Documenter la région choisie dans `docs/STATE.md` ou un fichier de configuration.

### Validation

- L'API Cloud Run apparaît dans la liste des API activées.
- La page Cloud Run est accessible sans erreur.
- La région `northamerica-northeast1` est sélectionnable lors de la création d'un service.

---

## DEP-0732 — Activation d'Artifact Registry

### Objectif

Définir le processus d'activation de Google Artifact Registry, le service de
stockage et de gestion des images Docker pour depaneurIA.

### Contexte

Artifact Registry remplace l'ancien Container Registry et offre une gestion
centralisée des artefacts (images Docker, packages npm, etc.). C'est le service
requis pour stocker les images Docker avant déploiement sur Cloud Run.

### Séquence d'activation

| Étape | Action                                                       | Responsable      |
|-------|--------------------------------------------------------------|------------------|
| 1     | Se connecter à Google Cloud Console                          | Administrateur   |
| 2     | Sélectionner le projet `depaneurIA-prod`                     | Administrateur   |
| 3     | Aller dans « API et services » > « Bibliothèque »            | Administrateur   |
| 4     | Rechercher « Artifact Registry »                             | Administrateur   |
| 5     | Cliquer sur « Artifact Registry API »                        | Administrateur   |
| 6     | Cliquer sur « Activer »                                      | Administrateur   |
| 7     | Attendre la confirmation d'activation (30–60 secondes)       | Système          |

### Création d'un registre Docker

Après activation de l'API, créer un registre Docker :

| Étape | Action                                                       | Responsable      |
|-------|--------------------------------------------------------------|------------------|
| 1     | Aller dans « Artifact Registry » depuis le menu principal    | Administrateur   |
| 2     | Cliquer sur « Créer un dépôt »                               | Administrateur   |
| 3     | Saisir le nom : `depaneurIA-images`                          | Administrateur   |
| 4     | Sélectionner le format : `Docker`                            | Administrateur   |
| 5     | Sélectionner la région : `northamerica-northeast1`           | Administrateur   |
| 6     | Mode : `Standard`                                            | Administrateur   |
| 7     | Cliquer sur « Créer »                                        | Administrateur   |

### Informations du registre

| Champ                    | Valeur                                           |
|--------------------------|--------------------------------------------------|
| Nom du registre          | `depaneurIA-images`                              |
| Format                   | `Docker`                                         |
| Région                   | `northamerica-northeast1`                        |
| URL du registre          | `northamerica-northeast1-docker.pkg.dev/depaneuia-prod-4562/depaneurIA-images`|

### Règles

- Artifact Registry doit être activé **avant** de pousser des images Docker.
- Utiliser la même région que Cloud Run pour réduire les coûts de transfert.
- Documenter l'URL du registre dans les fichiers de configuration CI/CD.

### Validation

- L'API Artifact Registry apparaît dans la liste des API activées.
- Le registre `depaneurIA-images` apparaît dans la liste des dépôts.
- L'URL du registre est accessible et valide.

---

## DEP-0733 — Activation de Cloud Build

### Objectif

Définir le processus d'activation de Google Cloud Build, le service de CI/CD
automatisé qui construit et déploie les images Docker de depaneurIA.

### Contexte

Cloud Build permet de construire des images Docker automatiquement à partir du
code source, de les pousser dans Artifact Registry et de déclencher des déploiements
sur Cloud Run. C'est l'équivalent cloud de GitHub Actions pour Google Cloud.

### Séquence d'activation

| Étape | Action                                                       | Responsable      |
|-------|--------------------------------------------------------------|------------------|
| 1     | Se connecter à Google Cloud Console                          | Administrateur   |
| 2     | Sélectionner le projet `depaneurIA-prod`                     | Administrateur   |
| 3     | Aller dans « API et services » > « Bibliothèque »            | Administrateur   |
| 4     | Rechercher « Cloud Build »                                   | Administrateur   |
| 5     | Cliquer sur « Cloud Build API »                              | Administrateur   |
| 6     | Cliquer sur « Activer »                                      | Administrateur   |
| 7     | Attendre la confirmation d'activation (30–60 secondes)       | Système          |

### Configuration initiale de Cloud Build

| Étape | Action                                                       | Responsable      |
|-------|--------------------------------------------------------------|------------------|
| 1     | Aller dans « Cloud Build » depuis le menu principal          | Administrateur   |
| 2     | Accepter les conditions d'utilisation si demandé             | Administrateur   |
| 3     | Aller dans « Paramètres »                                    | Administrateur   |
| 4     | Activer « Cloud Run » et « Service Account » dans les permissions| Administrateur|
| 5     | Cliquer sur « Enregistrer »                                  | Administrateur   |

### Niveau gratuit de Cloud Build

Google Cloud offre **120 minutes de build gratuites par jour** (environ 3600 minutes/mois).

| Élément                  | Valeur                                           |
|--------------------------|--------------------------------------------------|
| Minutes gratuites/jour   | 120 minutes                                      |
| Minutes gratuites/mois   | ~3600 minutes                                    |
| Coût après quota gratuit | 0,003 $ USD/minute de build                      |

### Règles

- Cloud Build doit être activé **avant** de configurer les pipelines CI/CD.
- Activer les permissions Cloud Run et Service Account dans les paramètres.
- Surveiller l'usage quotidien pour rester dans le quota gratuit (120 min/jour).

### Validation

- L'API Cloud Build apparaît dans la liste des API activées.
- La page Cloud Build est accessible sans erreur.
- Les permissions Cloud Run et Service Account sont activées.

---

## DEP-0734 — Activation de Secret Manager

### Objectif

Définir le processus d'activation de Google Secret Manager, le service de gestion
sécurisée des secrets (clés API, tokens, mots de passe) pour depaneurIA.

### Contexte

Secret Manager permet de stocker et d'accéder de manière sécurisée aux secrets
sensibles (clés API OpenAI, tokens Twilio, identifiants de base de données) sans
les coder en dur dans le code source ou les variables d'environnement publiques.

### Séquence d'activation

| Étape | Action                                                       | Responsable      |
|-------|--------------------------------------------------------------|------------------|
| 1     | Se connecter à Google Cloud Console                          | Administrateur   |
| 2     | Sélectionner le projet `depaneurIA-prod`                     | Administrateur   |
| 3     | Aller dans « API et services » > « Bibliothèque »            | Administrateur   |
| 4     | Rechercher « Secret Manager »                                | Administrateur   |
| 5     | Cliquer sur « Secret Manager API »                           | Administrateur   |
| 6     | Cliquer sur « Activer »                                      | Administrateur   |
| 7     | Attendre la confirmation d'activation (30–60 secondes)       | Système          |

### Création d'un secret de test

| Étape | Action                                                       | Responsable      |
|-------|--------------------------------------------------------------|------------------|
| 1     | Aller dans « Secret Manager » depuis le menu principal       | Administrateur   |
| 2     | Cliquer sur « Créer un secret »                              | Administrateur   |
| 3     | Saisir le nom : `OPENAI_API_KEY`                             | Administrateur   |
| 4     | Saisir la valeur du secret (clé API OpenAI)                  | Administrateur   |
| 5     | Région : `Automatique` (multirégion pour redondance)         | Administrateur   |
| 6     | Cliquer sur « Créer un secret »                              | Administrateur   |

### Secrets principaux à créer en V1

| Nom du secret            | Description                                      | Utilisé par          |
|--------------------------|--------------------------------------------------|----------------------|
| `OPENAI_API_KEY`         | Clé API OpenAI Realtime (assistant vocal)       | Backend, téléphonie  |
| `TWILIO_ACCOUNT_SID`     | Identifiant de compte Twilio                     | Backend, téléphonie  |
| `TWILIO_AUTH_TOKEN`      | Token d'authentification Twilio                  | Backend, téléphonie  |
| `DATABASE_URL`           | URL de connexion à la base de données            | Backend              |
| `GCP_DEPLOY_KEY`         | Clé JSON du compte de service de déploiement     | CI/CD GitHub Actions |

### Règles de sécurité

- Ne **jamais** coder de secrets en dur dans le code source.
- Ne **jamais** commiter de secrets dans Git.
- Renouveler les secrets tous les 90 jours ou après suspicion de compromission.
- Limiter les accès aux secrets aux comptes de service nécessaires (DEP-0726).

### Validation

- L'API Secret Manager apparaît dans la liste des API activées.
- Le secret de test `OPENAI_API_KEY` apparaît dans la liste des secrets.
- Le compte de service du backend peut accéder au secret sans erreur.

---

## Synthèse

| DEP   | Titre                                                          | Statut  |
|-------|----------------------------------------------------------------|---------|
| 0715  | Test du basculement de langue sans perdre le panier            | Défini  |
| 0716  | Test du basculement de langue sans perdre la conversation      | Défini  |
| 0717  | Test du basculement de langue sans perdre la commande          | Défini  |
| 0718  | Test de reconnaissance des synonymes dans les deux langues     | Défini  |
| 0719  | Vérification de la cohérence multilingue sur téléphone         | Défini  |
| 0720  | Gel de la stratégie multilingue V1                             | Défini  |
| 0721  | Création du projet Google Cloud principal                      | Défini  |
| 0722  | Donner un nom clair au projet Google Cloud                     | Défini  |
| 0723  | Activation de la facturation du projet Google Cloud            | Défini  |
| 0724  | Vérification des crédits disponibles pour les tests            | Défini  |
| 0725  | Création des comptes IAM principaux                            | Défini  |
| 0726  | Définition des rôles IAM minimaux nécessaires                  | Défini  |
| 0727  | Création du compte de service de déploiement                   | Défini  |
| 0728  | Création du compte de service du backend                       | Défini  |
| 0729  | Création du compte de service du traitement audio si nécessaire| Défini  |
| 0730  | Création du compte de service du stockage médias               | Défini  |
| 0731  | Activation de Cloud Run                                        | Défini  |
| 0732  | Activation d'Artifact Registry                                 | Défini  |
| 0733  | Activation de Cloud Build                                      | Défini  |
| 0734  | Activation de Secret Manager                                   | Défini  |
