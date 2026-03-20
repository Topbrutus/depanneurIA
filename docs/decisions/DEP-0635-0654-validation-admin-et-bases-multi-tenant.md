# DEP-0635 à DEP-0654 — Validation admin catalogue et bases multi-tenant

## Périmètre

Ce document définit les **validations de l'administration du catalogue** (champs
catégorie, aperçu avant publication, scénarios de test ajout/édition/tri,
gel V1) et les **bases de l'architecture multi-tenant** (tenant client dans les
tables, routes, interfaces, notifications, connexions téléphoniques, adresses,
commandes, statistiques, médias, séparation des données, mutualisation et
clonage de modèles).

Ces décisions s'appuient sur les structures définies en DEP-0241–DEP-0255
(modèle catalogue), DEP-0256–DEP-0270 (conventions contenu catalogue),
DEP-0271–DEP-0280 (démo catalogue et validations), DEP-0252–DEP-0253
(surcharges par tenant), DEP-0473–DEP-0480 (rattachement API et téléphonie,
résolution du tenant) et DEP-0575–DEP-0594 (logiques métier et suivi).

Il s'agit exclusivement de **documentation** : aucun code produit, aucune
implémentation.

---

## DEP-0635 — Validation des champs catégorie

### Objectif

Définir les règles de validation appliquées à chaque champ d'une catégorie
lors de la création ou de la modification dans l'interface d'administration du
catalogue.

### Règles de validation

| Champ           | Type    | Obligatoire | Règle                                                                |
| --------------- | ------- | ----------- | -------------------------------------------------------------------- |
| `label`         | string  | ✅ Oui      | 2–60 caractères, pas de caractères spéciaux hors tirets              |
| `slug`          | string  | ✅ Oui      | Généré automatiquement depuis `label`, kebab-case, unique par tenant |
| `description`   | string  | ❌ Non      | 0–200 caractères                                                     |
| `parent_id`     | uuid    | ❌ Non      | Doit référencer une catégorie existante du même tenant               |
| `depth`         | integer | ✅ Oui      | Calculé automatiquement, maximum 3 niveaux                           |
| `path`          | string  | ✅ Oui      | Calculé automatiquement depuis la hiérarchie parent                  |
| `display_order` | integer | ✅ Oui      | ≥ 0, unique au sein du même parent et du même tenant                 |
| `is_active`     | boolean | ✅ Oui      | Par défaut `true` à la création                                      |
| `icon`          | string  | ❌ Non      | Emoji ou référence icône valide, 1 seul caractère ou slug            |

### Règles

- Un `slug` en doublon au sein du même tenant déclenche l'erreur
  « Ce slug existe déjà pour ce dépanneur. »
- La suppression d'une catégorie parent est bloquée si elle possède des
  catégories enfants actives.
- La profondeur maximale est **3** (catégorie → sous-catégorie → sous-sous-catégorie).
- Le champ `display_order` est réaffecté automatiquement si une valeur
  conflictuelle est détectée.

---

## DEP-0636 — Aperçu avant publication du catalogue

### Objectif

Permettre à l'administrateur de prévisualiser l'état du catalogue tel qu'il
sera visible par le client final, avant de publier les modifications.

### Fonctionnement

| Étape | Action                   | Résultat attendu                                                         |
| ----- | ------------------------ | ------------------------------------------------------------------------ |
| 1     | Cliquer sur « Aperçu »   | Ouverture d'un panneau ou d'une modale pleine largeur                    |
| 2     | Navigation dans l'aperçu | Catégories, produits, prix et images affichés tels que vus par le client |
| 3     | Vérification             | L'administrateur identifie les anomalies visuelles                       |
| 4     | Fermer l'aperçu          | Retour à l'interface d'administration sans modification                  |
| 5     | Publier                  | Les modifications sont appliquées et visibles côté client                |

### Règles

- L'aperçu est en **lecture seule** — aucune modification depuis cette vue.
- L'aperçu affiche les données **du tenant actif** uniquement.
- Les produits avec le statut `brouillon` sont affichés avec un badge
  « Brouillon » dans l'aperçu mais restent invisibles côté client.
- L'aperçu inclut les images dans leur format final (DEP-0258–DEP-0260).
- Un produit sans image affiche un placeholder avec le message
  « Image manquante ».

---

## DEP-0637 — Test de l'ajout d'un produit complet

### Objectif

Définir le scénario de test fonctionnel validant l'ajout d'un produit complet
via l'interface d'administration du catalogue.

### Scénario

| Étape | Action                                          | Résultat attendu                                        |
| ----- | ----------------------------------------------- | ------------------------------------------------------- |
| 1     | Ouvrir l'écran d'ajout de produit               | Formulaire vide avec tous les champs requis visibles    |
| 2     | Renseigner le nom court (25–40 caractères)      | Champ accepté, compteur de caractères affiché           |
| 3     | Sélectionner une catégorie                      | Liste des catégories actives du tenant affichée         |
| 4     | Renseigner le SKU                               | Format validé (alphanumérique, tirets autorisés)        |
| 5     | Renseigner le prix par défaut (DEP-0255)        | Montant décimal positif accepté                         |
| 6     | Ajouter au moins une image (DEP-0258)           | Upload réussi, vignette affichée                        |
| 7     | Renseigner la description courte (50–80 car.)   | Champ accepté                                           |
| 8     | Renseigner la description longue (150–300 car.) | Champ accepté                                           |
| 9     | Ajouter des mots-clés (5–15)                    | Tags ajoutés un par un, affichés sous forme de badges   |
| 10    | Enregistrer                                     | Produit créé avec statut `brouillon`, message de succès |
| 11    | Vérifier dans la liste des produits             | Le nouveau produit apparaît avec ses données correctes  |

### Critères de réussite

- Tous les champs obligatoires sont renseignés et validés.
- Le produit est visible dans la liste d'administration avec le statut
  `brouillon`.
- Les images sont correctement redimensionnées selon DEP-0258–DEP-0260.
- Le `slug` est généré automatiquement depuis le nom court.

---

## DEP-0638 — Test de l'édition d'un produit complet

### Objectif

Définir le scénario de test fonctionnel validant l'édition d'un produit
existant via l'interface d'administration du catalogue.

### Scénario

| Étape | Action                              | Résultat attendu                                            |
| ----- | ----------------------------------- | ----------------------------------------------------------- |
| 1     | Sélectionner un produit existant    | Formulaire pré-rempli avec les données actuelles            |
| 2     | Modifier le nom court               | Ancien nom remplacé, `slug` recalculé automatiquement       |
| 3     | Changer la catégorie                | Nouvelle catégorie assignée, ancienne catégorie libérée     |
| 4     | Modifier le prix                    | Nouveau montant accepté, ancien prix conservé en historique |
| 5     | Remplacer une image                 | Nouvelle image uploadée, ancienne supprimée                 |
| 6     | Modifier les mots-clés              | Tags ajoutés ou retirés                                     |
| 7     | Enregistrer                         | Produit mis à jour, message de succès                       |
| 8     | Vérifier dans la liste des produits | Les modifications sont reflétées                            |
| 9     | Vérifier dans l'aperçu (DEP-0636)   | Le produit modifié apparaît avec les nouvelles données      |

### Critères de réussite

- Toutes les modifications sont persistées correctement.
- Le `slug` est recalculé si le nom court change.
- L'historique des prix est conservé (DEP-0255).
- Aucune donnée orpheline n'est créée (images, tags).

---

## DEP-0639 — Test de l'ordre d'affichage par glisser-déposer

### Objectif

Définir le scénario de test fonctionnel validant le réarrangement de l'ordre
d'affichage des catégories et des produits via glisser-déposer dans l'interface
d'administration.

### Scénario — Catégories

| Étape | Action                                        | Résultat attendu                                                    |
| ----- | --------------------------------------------- | ------------------------------------------------------------------- |
| 1     | Ouvrir la liste des catégories                | Catégories affichées dans l'ordre actuel (`display_order`)          |
| 2     | Glisser une catégorie vers une autre position | Indicateur visuel de la position cible                              |
| 3     | Déposer la catégorie                          | `display_order` recalculé pour toutes les catégories du même niveau |
| 4     | Vérifier l'aperçu (DEP-0636)                  | Nouvel ordre reflété côté client                                    |

### Scénario — Produits

| Étape | Action                                       | Résultat attendu                                               |
| ----- | -------------------------------------------- | -------------------------------------------------------------- |
| 1     | Ouvrir la liste des produits d'une catégorie | Produits affichés dans l'ordre actuel (`sort_weight`)          |
| 2     | Glisser un produit vers une autre position   | Indicateur visuel de la position cible                         |
| 3     | Déposer le produit                           | `sort_weight` recalculé pour tous les produits de la catégorie |
| 4     | Vérifier l'aperçu (DEP-0636)                 | Nouvel ordre reflété côté client                               |

### Règles

- Le glisser-déposer est **par tenant** — il ne modifie que le `display_order`
  ou `sort_weight` du tenant actif (DEP-0252, DEP-0253).
- La sauvegarde de l'ordre est **automatique** après chaque déplacement.
- Un retour visuel immédiat confirme le déplacement (animation fluide).
- En cas d'erreur réseau, l'ordre précédent est restauré avec un message
  d'avertissement.

---

## DEP-0640 — Geler l'admin catalogue V1

### Objectif

Figer le périmètre fonctionnel de l'administration du catalogue pour la
version 1 de depaneurIA.

### Périmètre gelé V1

| Fonctionnalité               | Incluse V1 | Référence     |
| ---------------------------- | ---------- | ------------- |
| CRUD catégories              | ✅ Oui     | DEP-0241      |
| Validation champs catégorie  | ✅ Oui     | DEP-0635      |
| CRUD produits + variantes    | ✅ Oui     | DEP-0242–0244 |
| Gestion des images produit   | ✅ Oui     | DEP-0258–0260 |
| Gestion des prix par tenant  | ✅ Oui     | DEP-0255      |
| Aperçu avant publication     | ✅ Oui     | DEP-0636      |
| Glisser-déposer pour l'ordre | ✅ Oui     | DEP-0639      |
| Mots-clés et synonymes       | ✅ Oui     | DEP-0265–0267 |
| Import CSV en masse          | ❌ Non     | Reporté V2    |
| Gestion de promotions        | ❌ Non     | Reporté V2    |
| Historique des modifications | ❌ Non     | Reporté V2    |
| Duplication de produit       | ❌ Non     | Reporté V2    |

### Règles

- Aucune fonctionnalité hors de ce périmètre ne doit être développée pour V1.
- Les éléments reportés à V2 sont documentés mais non implémentés.
- Le gel s'applique à l'ensemble des DEP-0635 à DEP-0639.

---

## DEP-0641 — Architecture multi-tenant officielle

### Objectif

Officialiser l'architecture multi-tenant de depaneurIA en définissant les
principes fondamentaux de séparation des données par tenant client (dépanneur
abonné).

### Définition du tenant

Un **tenant client** est un dépanneur abonné à depaneurIA qui dispose de son
propre catalogue, de ses propres commandes, de ses propres livreurs et de ses
propres clients. Chaque tenant est identifié par un `tenant_id` unique (uuid).

### Principes fondamentaux

| Principe                    | Description                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Isolation des données       | Un tenant ne peut jamais accéder aux données d'un autre tenant                                                |
| Identification systématique | Toute entité liée à un tenant porte un champ `tenant_id`                                                      |
| Résolution automatique      | Le tenant est résolu automatiquement depuis le contexte (URL, token, numéro de téléphone)                     |
| Base de données partagée    | Tous les tenants partagent la même base de données physique (schéma partagé, données isolées par `tenant_id`) |
| Filtrage par défaut         | Toute requête est **toujours** filtrée par `tenant_id` — aucune requête globale non autorisée                 |
| Super administrateur        | Seul le rôle super administrateur peut consulter les données de plusieurs tenants                             |

### Règles

- Le `tenant_id` est **immuable** une fois attribué.
- La suppression d'un tenant est un **soft delete** — les données sont
  désactivées, jamais supprimées physiquement.
- Chaque tenant possède un `tenant_name` (string, 2–100 caractères) et un
  `tenant_slug` (kebab-case, unique).
- La création d'un tenant est réservée au super administrateur.

---

## DEP-0642 — Notion de tenant client dans toutes les tables

### Objectif

Garantir que chaque table de la base de données portant des données métier
inclut un champ `tenant_id` permettant l'isolation des données par tenant.

### Tables concernées

| Table                | Champ ajouté | Type | Contrainte             | Référence |
| -------------------- | ------------ | ---- | ---------------------- | --------- |
| `categories`         | `tenant_id`  | uuid | NOT NULL, FK → tenants | DEP-0253  |
| `products`           | `tenant_id`  | uuid | NOT NULL, FK → tenants | DEP-0252  |
| `product_variants`   | `tenant_id`  | uuid | NOT NULL, FK → tenants | DEP-0244  |
| `product_images`     | `tenant_id`  | uuid | NOT NULL, FK → tenants | DEP-0258  |
| `orders`             | `tenant_id`  | uuid | NOT NULL, FK → tenants | DEP-0648  |
| `order_items`        | `tenant_id`  | uuid | NOT NULL, FK → tenants | DEP-0648  |
| `delivery_addresses` | `tenant_id`  | uuid | NOT NULL, FK → tenants | DEP-0647  |
| `delivery_zones`     | `tenant_id`  | uuid | NOT NULL, FK → tenants | DEP-0254  |
| `customers`          | `tenant_id`  | uuid | NOT NULL, FK → tenants | DEP-0281  |
| `carts`              | `tenant_id`  | uuid | NOT NULL, FK → tenants | DEP-0334  |
| `notifications`      | `tenant_id`  | uuid | NOT NULL, FK → tenants | DEP-0645  |
| `phone_connections`  | `tenant_id`  | uuid | NOT NULL, FK → tenants | DEP-0646  |
| `statistics`         | `tenant_id`  | uuid | NOT NULL, FK → tenants | DEP-0649  |
| `media`              | `tenant_id`  | uuid | NOT NULL, FK → tenants | DEP-0650  |
| `prices`             | `tenant_id`  | uuid | NOT NULL, FK → tenants | DEP-0255  |

### Règles

- Chaque table métier possède un **index composé** incluant `tenant_id` comme
  premier élément pour optimiser les requêtes filtrées.
- Les tables de référence partagées (unités, devises, types de paiement) ne
  portent **pas** de `tenant_id` (voir DEP-0652).
- Toute migration ajoutant une table métier doit inclure le champ `tenant_id`
  dès sa création.

---

## DEP-0643 — Notion de tenant client dans toutes les routes API

### Objectif

Garantir que chaque route API est contextualisée par le tenant client, empêchant
tout accès inter-tenant non autorisé.

### Résolution du tenant

| Méthode de résolution | Contexte                      | Exemple                                    |
| --------------------- | ----------------------------- | ------------------------------------------ |
| URL (sous-domaine)    | Interface web                 | `mon-depanneur.depaneuria.com/api/…`       |
| Token JWT             | Authentification API          | Champ `tenant_id` dans le payload du token |
| Numéro de téléphone   | Appel téléphonique (DEP-0473) | Table `tenant_phone_numbers` → `tenant_id` |

### Convention de routage

- Toutes les routes API V1 suivent le préfixe : `/api/v1/tenants/{tenant_id}/…`
- Le middleware d'authentification injecte le `tenant_id` résolu dans le
  contexte de la requête.
- Toute requête sans `tenant_id` résolu retourne une erreur **403 Forbidden**.

### Règles

- Le `tenant_id` du token JWT doit correspondre au `tenant_id` de la route —
  en cas de divergence, la requête est rejetée avec **403 Forbidden**.
- Les routes du super administrateur (`/api/v1/admin/…`) ne sont pas filtrées
  par tenant mais nécessitent une authentification forte (2FA, DEP-0594).
- Aucune route publique ne retourne de données sans résolution préalable du
  tenant.

---

## DEP-0644 — Notion de tenant client dans toutes les interfaces

### Objectif

Garantir que chaque interface utilisateur (client, dépanneur, livreur,
administrateur) affiche uniquement les données du tenant actif.

### Règles par rôle

| Rôle                 | Contexte tenant                                  | Données affichées                        |
| -------------------- | ------------------------------------------------ | ---------------------------------------- |
| Client               | Résolu par URL ou numéro de téléphone            | Catalogue, commandes et profil du tenant |
| Dépanneur            | Résolu par authentification                      | Commandes et catalogue du tenant         |
| Livreur              | Résolu par authentification                      | Livraisons assignées au tenant           |
| Administrateur       | Résolu par authentification + sélection manuelle | Données du tenant sélectionné            |
| Super administrateur | Accès multi-tenant avec sélecteur                | Tous les tenants, un à la fois ou agrégé |

### Affichage

- Le **nom du tenant** est affiché dans l'en-tête de l'interface pour les rôles
  dépanneur, livreur et administrateur.
- Le **logo du tenant** est affiché dans l'interface client si configuré,
  sinon le logo depaneurIA par défaut est utilisé.
- Le sélecteur de tenant du super administrateur est un menu déroulant
  affichant `tenant_name` et `tenant_slug`.

### Règles

- Aucune donnée inter-tenant ne doit être visible dans les interfaces
  non-administrateur.
- Le changement de tenant par le super administrateur déclenche un rechargement
  complet des données affichées.
- Les interfaces client ne doivent jamais exposer le `tenant_id` technique —
  seul le `tenant_name` ou le `tenant_slug` sont visibles.

---

## DEP-0645 — Notion de tenant client dans toutes les notifications

### Objectif

Garantir que chaque notification (push, SMS, e-mail) est envoyée dans le
contexte du bon tenant et ne contient que des données appartenant à ce tenant.

### Types de notifications concernées

| Type              | Canal        | Données tenant incluses                               |
| ----------------- | ------------ | ----------------------------------------------------- |
| Nouvelle commande | Push         | `tenant_name`, numéro de commande, montant            |
| Commande prête    | Push + SMS   | `tenant_name`, numéro de commande, adresse de retrait |
| Livreur en route  | Push         | `tenant_name`, ETA estimé                             |
| Commande livrée   | Push + SMS   | `tenant_name`, numéro de commande, montant final      |
| Panier abandonné  | Push         | `tenant_name`, rappel (DEP-0580)                      |
| Alerte stock      | Push (admin) | `tenant_name`, produit, seuil atteint (DEP-0584)      |

### Règles

- Chaque notification porte le `tenant_id` dans ses métadonnées pour traçabilité.
- Le nom affiché de l'expéditeur est le `tenant_name` (pas « depaneurIA »).
- Les templates de notification sont **par tenant** si personnalisés, sinon le
  template par défaut depaneurIA est utilisé.
- Aucune notification ne doit contenir de données d'un autre tenant.
- Les préférences de notification du client (DEP-0296) sont stockées par tenant.

---

## DEP-0646 — Notion de tenant client dans toutes les connexions téléphoniques

### Objectif

Garantir que chaque connexion téléphonique (appels entrants, agent vocal) est
associée au bon tenant via la résolution du numéro virtuel (DEP-0473).

### Résolution

| Élément                   | Source                       | Résultat                                  |
| ------------------------- | ---------------------------- | ----------------------------------------- |
| Numéro virtuel appelé     | Table `tenant_phone_numbers` | `tenant_id` du dépanneur associé          |
| Configuration agent vocal | Table `tenant_voice_config`  | Salutation, catalogue, horaires du tenant |
| Numéro client appelant    | Table `customers`            | Profil client du tenant (si connu)        |

### Règles

- Chaque numéro virtuel est attribué à **un seul tenant** (relation 1:1).
- L'agent vocal (DEP-0441–DEP-0456) utilise le catalogue et les horaires du
  tenant résolu pour toutes ses réponses.
- Les phrases de salutation incluent le `tenant_name` (ex. : « Bienvenue chez
  _Mon Dépanneur_ »).
- Les enregistrements d'appels sont stockés avec le `tenant_id` et ne sont
  accessibles qu'au tenant propriétaire et au super administrateur.
- Un appel vers un numéro non attribué à un tenant retourne le message d'erreur
  générique depaneurIA.

---

## DEP-0647 — Notion de tenant client dans toutes les adresses de livraison

### Objectif

Garantir que chaque adresse de livraison est associée à un tenant et que la
zone de livraison est validée par rapport aux zones du tenant (DEP-0254).

### Structure

| Champ         | Type    | Description                                 |
| ------------- | ------- | ------------------------------------------- |
| `id`          | uuid    | Identifiant unique                          |
| `tenant_id`   | uuid    | FK → tenants, NOT NULL                      |
| `customer_id` | uuid    | FK → customers                              |
| `label`       | string  | Libellé (ex. : « Maison », « Bureau »)      |
| `street`      | string  | Adresse complète                            |
| `city`        | string  | Ville                                       |
| `postal_code` | string  | Code postal                                 |
| `coordinates` | point   | Latitude / longitude                        |
| `notes`       | string  | Notes de livraison (DEP-0291)               |
| `is_default`  | boolean | Adresse par défaut du client pour ce tenant |

### Règles

- Une adresse de livraison est liée à **un seul tenant** — un client ayant
  plusieurs dépanneurs possède des adresses distinctes par tenant.
- La validation de la zone de livraison utilise les zones du tenant
  (DEP-0254) : si l'adresse est hors zone, l'erreur « Zone non desservie »
  est retournée (DEP-0311).
- Les adresses ne sont **jamais partagées** entre tenants, même pour un même
  client.
- La suppression d'une adresse est un **soft delete** pour conserver
  l'historique des commandes.

---

## DEP-0648 — Notion de tenant client dans toutes les commandes

### Objectif

Garantir que chaque commande et ses lignes sont associées au tenant dans lequel
elles ont été passées.

### Champs tenant dans les commandes

| Table         | Champ       | Contrainte                                                |
| ------------- | ----------- | --------------------------------------------------------- |
| `orders`      | `tenant_id` | NOT NULL, FK → tenants, index composé (tenant_id, status) |
| `order_items` | `tenant_id` | NOT NULL, FK → tenants, cohérent avec `orders.tenant_id`  |

### Règles

- Une commande est **immuablement** liée au tenant dans lequel elle a été créée.
- Le `tenant_id` de chaque `order_item` doit être identique au `tenant_id` de
  la commande parente — toute incohérence est rejetée.
- Les prix appliqués sont ceux du tenant au moment de la commande (DEP-0255).
- Les machines d'état (DEP-0581, DEP-0582, DEP-0583) s'exécutent dans le
  contexte du tenant.
- Le numéro de commande est unique **par tenant** (format : `{tenant_slug}-{séquence}`).
- Le super administrateur peut consulter les commandes de tous les tenants via
  le sélecteur de tenant (DEP-0594).

---

## DEP-0649 — Notion de tenant client dans toutes les statistiques

### Objectif

Garantir que toutes les données statistiques sont calculées et affichées dans
le contexte d'un tenant unique, sauf pour le super administrateur.

### Statistiques par tenant

| Statistique                | Calculée par tenant | Agrégeable (super admin) | Référence     |
| -------------------------- | ------------------- | ------------------------ | ------------- |
| Nombre de commandes        | ✅ Oui              | ✅ Oui                   | DEP-0581      |
| Chiffre d'affaires         | ✅ Oui              | ✅ Oui                   | DEP-0590      |
| Panier moyen               | ✅ Oui              | ✅ Oui                   | DEP-0590      |
| Popularité produits        | ✅ Oui              | ❌ Non                   | DEP-0575      |
| Taux de livraison réussie  | ✅ Oui              | ✅ Oui                   | DEP-0589      |
| Paniers abandonnés         | ✅ Oui              | ✅ Oui                   | DEP-0578      |
| Délai moyen de préparation | ✅ Oui              | ✅ Oui                   | DEP-0587      |
| Délai moyen de livraison   | ✅ Oui              | ✅ Oui                   | DEP-0588–0589 |

### Règles

- Les statistiques sont calculées **exclusivement** sur les données du tenant
  concerné.
- Le super administrateur peut consulter un tableau comparatif entre tenants,
  sans que les tenants eux-mêmes y aient accès.
- La popularité des produits (DEP-0575) n'est **jamais** agrégée entre
  tenants — elle reste locale.
- Les exports de statistiques incluent le `tenant_name` et le `tenant_id` dans
  les métadonnées du fichier.

---

## DEP-0650 — Notion de tenant client dans tous les médias

### Objectif

Garantir que tous les fichiers médias (images produit, logos, documents) sont
stockés et accessibles dans le contexte du tenant propriétaire.

### Organisation du stockage

```
/media/{tenant_id}/products/{product_slug}/…
/media/{tenant_id}/categories/{category_slug}/…
/media/{tenant_id}/branding/logo.{ext}
/media/{tenant_id}/branding/banner.{ext}
```

### Règles

- Chaque média est stocké dans un répertoire préfixé par le `tenant_id`.
- Les URL publiques des médias ne doivent **pas** exposer le `tenant_id`
  technique — un alias basé sur le `tenant_slug` est utilisé.
- Les images produit suivent les conventions de nommage et de format définies
  en DEP-0258–DEP-0260 et DEP-0264.
- Un tenant ne peut **pas** accéder aux médias d'un autre tenant.
- La suppression d'un média est un **soft delete** (le fichier est marqué comme
  supprimé mais conservé pendant 90 jours).
- Le quota de stockage par tenant est configurable par le super administrateur
  (pas de limite en V1).

---

## DEP-0651 — Données totalement séparées par client

### Objectif

Identifier les entités dont les données sont **totalement isolées** par tenant
et ne doivent jamais être partagées ou accessibles entre tenants.

### Entités à isolation totale

| Entité                   | Justification                                        |
| ------------------------ | ---------------------------------------------------- |
| Commandes                | Confidentialité commerciale et financière            |
| Lignes de commande       | Liées aux commandes, même niveau d'isolation         |
| Clients                  | Données personnelles, RGPD                           |
| Adresses de livraison    | Données personnelles, RGPD                           |
| Paniers                  | Données personnelles en cours de transaction         |
| Paiements                | Données financières sensibles                        |
| Enregistrements d'appels | Données vocales personnelles                         |
| Statistiques             | Données commerciales confidentielles                 |
| Notifications envoyées   | Contiennent des données personnelles et commerciales |
| Historique d'état        | Traçabilité interne au tenant (DEP-0585)             |
| Préférences client       | Données personnelles, liées au profil client         |

### Règles

- Ces données ne sont **jamais** exposées en dehors du tenant propriétaire,
  même au super administrateur en mode agrégé (consultation tenant par tenant
  uniquement).
- La suppression d'un tenant déclenche l'anonymisation de ces données
  conformément au RGPD.
- Les sauvegardes sont **par tenant** pour permettre une restauration ciblée.

---

## DEP-0652 — Données pouvant être mutualisées

### Objectif

Identifier les entités dont les données peuvent être partagées entre tenants
car elles ne contiennent pas d'information spécifique à un tenant.

### Entités mutualisables

| Entité                       | Justification                                                 |
| ---------------------------- | ------------------------------------------------------------- |
| Catalogue canonique produits | Référentiel commun de produits automobiles (DEP-0241–0242)    |
| Unités de mesure             | Standardisées (DEP-0256)                                      |
| Devises                      | Référentiel ISO                                               |
| Types de paiement            | Standardisés (espèces, carte, etc.)                           |
| Icônes et emojis catégorie   | Partagés entre tous les tenants                               |
| Formats d'image              | Standardisés (DEP-0258–0260)                                  |
| Templates de notification    | Templates par défaut depaneurIA (personnalisables par tenant) |

### Règles

- Les entités mutualisées ne portent **pas** de `tenant_id`.
- La modification d'une entité mutualisée impacte **tous les tenants** — ces
  modifications sont réservées au super administrateur.
- Un tenant peut **surcharger** une entité mutualisée via sa propre table
  (ex. : `product_tenant` surcharge `product` pour le prix et la visibilité,
  DEP-0252).
- Les surcharges par tenant n'affectent pas le référentiel commun.

---

## DEP-0653 — Modèles clonables d'un client à l'autre

### Objectif

Identifier les modèles de données pouvant être clonés (copiés) d'un tenant
vers un autre pour accélérer la mise en place d'un nouveau dépanneur.

### Modèles clonables

| Modèle                    | Données clonées                                       | Données non clonées         |
| ------------------------- | ----------------------------------------------------- | --------------------------- |
| Structure de catégories   | Hiérarchie, slugs, labels, icônes, `display_order`    | `tenant_id` (remplacé)      |
| Catalogue produits        | Noms, descriptions, SKU, images, mots-clés, synonymes | Prix, stock, visibilité     |
| Zones de livraison        | Nom, géométrie, horaires                              | Frais de livraison, minimum |
| Templates de notification | Contenu, canal, déclencheur                           | Personnalisations tenant    |
| Configuration agent vocal | Flux d'appel, phrases système (DEP-0441–0456)         | Numéro virtuel, salutation  |

### Processus de clonage

| Étape | Action                        | Résultat                                      |
| ----- | ----------------------------- | --------------------------------------------- |
| 1     | Sélectionner le tenant source | Liste des modèles clonables affichée          |
| 2     | Cocher les modèles à cloner   | Sélection multiple possible                   |
| 3     | Sélectionner le tenant cible  | Vérification que le tenant cible existe       |
| 4     | Lancer le clonage             | Copie des données avec nouveau `tenant_id`    |
| 5     | Vérification                  | Rapport de clonage affiché (succès / erreurs) |

### Règles

- Le clonage est réservé au **super administrateur**.
- Le clonage crée des **copies indépendantes** — les modifications ultérieures
  sur le tenant source n'affectent pas le tenant cible.
- Le `tenant_id` des entités clonées est remplacé par celui du tenant cible.
- Les identifiants (`id`) sont régénérés pour éviter les conflits.
- Le clonage ne copie **jamais** de données personnelles (clients, commandes,
  paiements).

---

## DEP-0654 — Modèles non clonables d'un client à l'autre

### Objectif

Identifier les modèles de données qui ne peuvent **pas** être clonés entre
tenants en raison de leur nature unique, personnelle ou confidentielle.

### Modèles non clonables

| Modèle                         | Raison de non-clonabilité                                  |
| ------------------------------ | ---------------------------------------------------------- |
| Clients                        | Données personnelles (RGPD), liées au tenant d'inscription |
| Adresses de livraison          | Données personnelles, géographiquement spécifiques         |
| Commandes                      | Données financières et commerciales uniques                |
| Lignes de commande             | Liées aux commandes, même restriction                      |
| Paiements                      | Données financières sensibles                              |
| Paniers                        | Données de transaction en cours, personnelles              |
| Enregistrements d'appels       | Données vocales personnelles                               |
| Historique d'état              | Traçabilité unique au tenant (DEP-0585)                    |
| Statistiques                   | Calculées à partir de données propres au tenant            |
| Numéros virtuels téléphoniques | Attribution unique par opérateur (Twilio)                  |
| Préférences et consentements   | Données personnelles, RGPD                                 |
| Tokens d'authentification      | Sécurité, liés à l'identité du tenant                      |

### Règles

- Aucune tentative de clonage de ces modèles ne doit être possible dans
  l'interface — les options de clonage sont **masquées** pour ces entités.
- En cas de tentative via API, une erreur **422 Unprocessable Entity** est
  retournée avec le message « Ce modèle ne peut pas être cloné entre tenants. »
- Les données personnelles restent strictement dans le périmètre du tenant
  d'origine conformément au RGPD.
- Les numéros virtuels téléphoniques sont attribués individuellement par
  l'opérateur (DEP-0473) et ne peuvent pas être transférés par clonage.

---

## Synthèse du bloc DEP-0635–DEP-0654

| DEP      | Sujet                         | Décision clé                                                               |
| -------- | ----------------------------- | -------------------------------------------------------------------------- |
| DEP-0635 | Validation champs catégorie   | 9 champs validés, slug unique par tenant, profondeur max 3                 |
| DEP-0636 | Aperçu avant publication      | Lecture seule, données du tenant actif, brouillons visibles avec badge     |
| DEP-0637 | Test ajout produit            | 11 étapes, tous champs obligatoires, statut brouillon à la création        |
| DEP-0638 | Test édition produit          | 9 étapes, slug recalculé, historique prix conservé                         |
| DEP-0639 | Test glisser-déposer          | Réordonnement par tenant, sauvegarde automatique, rollback en cas d'erreur |
| DEP-0640 | Gel admin catalogue V1        | CRUD + validation + aperçu + tri inclus, import CSV et promos reportés V2  |
| DEP-0641 | Architecture multi-tenant     | Schéma partagé, données isolées par `tenant_id`, résolution automatique    |
| DEP-0642 | Tenant dans les tables        | 15 tables avec `tenant_id` NOT NULL, index composé, tables ref exclues     |
| DEP-0643 | Tenant dans les routes API    | Préfixe `/api/v1/tenants/{tenant_id}/…`, middleware JWT, 403 si divergence |
| DEP-0644 | Tenant dans les interfaces    | Affichage par rôle, nom et logo tenant, sélecteur super admin              |
| DEP-0645 | Tenant dans les notifications | Expéditeur = `tenant_name`, templates par tenant, traçabilité              |
| DEP-0646 | Tenant dans la téléphonie     | Numéro virtuel → tenant, agent vocal contextualisé, salutation tenant      |
| DEP-0647 | Tenant dans les adresses      | Adresse par tenant, validation zone, jamais partagée, soft delete          |
| DEP-0648 | Tenant dans les commandes     | Commande immuable au tenant, numéro unique par tenant, prix snapshot       |
| DEP-0649 | Tenant dans les statistiques  | Calcul par tenant, agrégation super admin sauf popularité                  |
| DEP-0650 | Tenant dans les médias        | Stockage préfixé par tenant, URL avec alias slug, soft delete 90 j         |
| DEP-0651 | Données totalement séparées   | 11 entités isolées, anonymisation RGPD, sauvegardes par tenant             |
| DEP-0652 | Données mutualisables         | 7 entités partagées, sans `tenant_id`, surcharge possible par tenant       |
| DEP-0653 | Modèles clonables             | 5 modèles clonables, copies indépendantes, jamais de données personnelles  |
| DEP-0654 | Modèles non clonables         | 12 modèles bloqués, RGPD, 422 si tentative API, options masquées en UI     |
