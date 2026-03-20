# DEP-0675 à DEP-0694 — Super admin suspension, scripts multi-tenant et bases multilingues

## Périmètre

Ce document couvre deux sous-blocs distincts mais contigus :

1. **DEP-0675–DEP-0680** : La **page de suspension d'un tenant**, les scripts
   d'initialisation et de clonage d'un tenant, les tests de séparation
   multi-tenant, et le gel de l'architecture multi-tenant V1.

2. **DEP-0681–DEP-0694** : Les **bases multilingues** de la plateforme —
   langues supportées, langue par défaut, logiques de changement de langue par
   rôle et par canal (web, téléphone), logique de langue préférée par compte
   ou navigateur, et conventions de clés, de textes et de catégories
   traduisibles.

Ces décisions s'appuient sur les structures définies en DEP-0641–DEP-0669
(architecture multi-tenant) et sur les rôles définis en DEP-0364–DEP-0366
(ton par rôle) ainsi que DEP-0361 (rôle de l'assistant texte).

Il s'agit exclusivement de **documentation** : aucun code produit, aucune
implémentation.

---

## DEP-0675 — Page super admin suspension de tenant

### Objectif

Définir la page permettant au super administrateur de suspendre un tenant
actif, rendant la boutique inaccessible aux clients tout en conservant les
données intactes.

### Contexte

La suspension est distincte de la désactivation (DEP-0665) et de
l'archivage (DEP-0666). Elle est réversible immédiatement, sans perte de
données ni de configuration.

### Cas d'usage

| Cas                     | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| Non-paiement            | Le tenant n'a pas réglé son abonnement                   |
| Violation de conditions | Contenu interdit détecté ou signalement grave            |
| Demande du dépanneur    | Le dépanneur demande une pause temporaire                |
| Maintenance critique    | Intervention technique urgente sur les données du tenant |

### Éléments de la page

| Élément                    | Description                                               |
| -------------------------- | --------------------------------------------------------- |
| En-tête                    | Nom du tenant, identifiant, domaine, date de création     |
| Statut actuel              | Badge coloré : `actif`, `suspendu`, `archivé`             |
| Bouton « Suspendre »       | Visible uniquement si statut = `actif`                    |
| Bouton « Réactiver »       | Visible uniquement si statut = `suspendu`                 |
| Champ motif de suspension  | Texte libre obligatoire (min. 10 caractères)              |
| Historique des suspensions | Liste horodatée des suspensions passées avec motif        |
| Confirmation modale        | Dialogue de confirmation avant toute action de suspension |

### Comportement lors de la suspension

- La boutique cliente du tenant affiche immédiatement une page d'indisponibilité.
- Le dépanneur et les livreurs de ce tenant ne peuvent plus se connecter.
- Les commandes en cours passent en état `bloqué` (DEP-0581).
- Aucune donnée n'est supprimée.
- Le super admin peut réactiver le tenant à tout moment.

### Règles

- La suspension ne peut pas être déclenchée si une commande est en état
  `en_livraison` — un avertissement bloque l'action jusqu'à résolution.
- Le motif de suspension est journalisé et non modifiable après enregistrement.
- La réactivation restaure tous les accès sans étape supplémentaire.
- L'action est réservée au rôle `super_admin`.

---

## DEP-0676 — Script d'initialisation d'un nouveau tenant

### Objectif

Définir les étapes et les données créées lors de l'initialisation automatique
d'un nouveau tenant, garantissant un état de départ cohérent et minimal.

### Étapes d'initialisation

| Étape | Action                                                                  |
| ----- | ----------------------------------------------------------------------- |
| 1     | Créer l'enregistrement tenant avec `tenant_id` unique (UUID)            |
| 2     | Créer le compte dépanneur principal (email + mot de passe temporaire)   |
| 3     | Créer le catalogue vide (aucun produit, aucune catégorie)               |
| 4     | Créer la configuration de livraison par défaut (zones vides)            |
| 5     | Créer la configuration de paiement par défaut (cash uniquement en V1)   |
| 6     | Créer la configuration visuelle par défaut (thème neutre)               |
| 7     | Créer les paramètres de langue par défaut (FR pour le Québec, DEP-0683) |
| 8     | Initialiser les files de commandes vides (DEP-0485–DEP-0490)            |
| 9     | Initialiser les journaux d'activité vides                               |
| 10    | Marquer le tenant en statut `actif`                                     |

### Données NON créées lors de l'initialisation

- Produits et catégories (le dépanneur les ajoute manuellement).
- Livreurs (le dépanneur les invite séparément).
- Clients (les clients s'inscrivent ou commandent librement).
- Numéro de téléphone vocal (configuré séparément).

### Règles

- Chaque tenant a un `tenant_id` unique, immuable, jamais recyclé.
- L'email du dépanneur principal est unique sur toute la plateforme.
- Le mot de passe temporaire est envoyé par email sécurisé ; le dépanneur
  doit le changer à la première connexion.
- Toutes les tables créées portent le `tenant_id` comme clé d'isolation.

---

## DEP-0677 — Script de clonage d'un tenant modèle

### Objectif

Définir les données copiées et les données exclues lors du clonage d'un
tenant source (modèle ou démonstration) vers un nouveau tenant cible.

### Données clonées

| Données                    | Notes                                                       |
| -------------------------- | ----------------------------------------------------------- |
| Structure des catégories   | Arborescence complète, sans les produits si désiré          |
| Catalogue de produits      | Produits, descriptions, images, prix — `tenant_id` remplacé |
| Configuration visuelle     | Thème, couleurs, logo par défaut (remplaçable ensuite)      |
| Configuration de livraison | Zones, frais, délais — à adapter par le dépanneur           |
| Configuration de langue    | Langue par défaut copiée depuis le modèle                   |
| Catégories traduisibles    | Clés de traduction copiées (DEP-0694)                       |

### Données NON clonées

| Données exclues                    | Raison                                                   |
| ---------------------------------- | -------------------------------------------------------- |
| Commandes historiques              | Appartiennent au tenant source — séparation stricte      |
| Comptes clients                    | Appartiennent au tenant source — séparation stricte      |
| Comptes livreurs                   | Doivent être créés spécifiquement pour le nouveau tenant |
| Journaux d'activité                | Non transférables                                        |
| Numéro de téléphone vocal          | Chaque tenant a le sien                                  |
| Identifiants internes des produits | Remplacés par de nouveaux UUIDs pour le tenant cible     |

### Règles

- Le clonage ne crée aucun lien persistant entre la source et la cible.
- Toute modification sur le tenant cible n'affecte jamais le modèle source.
- Le `tenant_id` cible est généré à la volée — jamais copié depuis la source.
- Le script de clonage appelle le script d'initialisation (DEP-0676) en
  premier, puis surcharge les données par celles du modèle.

---

## DEP-0678 — Test de séparation complète entre deux dépanneurs fictifs

### Objectif

Définir le scénario de test validant qu'aucune donnée d'un tenant A ne peut
être vue, modifiée ou accédée depuis un tenant B.

### Scénario de test

| Étape | Action de test                                                    |
| ----- | ----------------------------------------------------------------- |
| 1     | Créer le tenant A avec un catalogue de 5 produits distincts       |
| 2     | Créer le tenant B avec un catalogue de 5 produits distincts       |
| 3     | Créer un client CA sur le tenant A, passer une commande           |
| 4     | Créer un client CB sur le tenant B, passer une commande           |
| 5     | Vérifier que CA ne voit pas les produits de B                     |
| 6     | Vérifier que CB ne voit pas les produits de A                     |
| 7     | Vérifier que le dépanneur A ne voit pas les commandes de B        |
| 8     | Vérifier que le dépanneur B ne voit pas les commandes de A        |
| 9     | Vérifier que le livreur A ne peut pas accepter une livraison de B |
| 10    | Vérifier que les journaux A et B sont totalement séparés          |

### Critères de réussite

- Aucune donnée du tenant A n'est retournée dans une requête du tenant B, et
  vice versa.
- Un appel API authentifié avec un token tenant A ne retourne jamais une
  ressource tenant B (réponse 403 ou 404, jamais les données de l'autre).
- Les commandes, paniers, clients, produits et journaux restent strictement
  cloisonnés.

---

## DEP-0679 — Test qu'aucune commande ne fuit d'un client à l'autre

### Objectif

Définir le scénario de test ciblant spécifiquement les commandes, pour
s'assurer qu'une commande créée sur le tenant A n'apparaît jamais dans
l'interface ou l'API du tenant B.

### Scénario de test

| Étape | Action de test                                                            |
| ----- | ------------------------------------------------------------------------- |
| 1     | Créer 10 commandes sur le tenant A avec des clients distincts             |
| 2     | Créer 10 commandes sur le tenant B avec des clients distincts             |
| 3     | Lister toutes les commandes depuis l'interface dépanneur B → 10 seulement |
| 4     | Lister toutes les commandes depuis l'interface dépanneur A → 10 seulement |
| 5     | Tenter d'accéder à l'ID d'une commande A depuis un token tenant B         |
| 6     | Vérifier que la réponse est 403 ou 404 — jamais les données de A          |
| 7     | Tenter de modifier l'état d'une commande A depuis le dépanneur B          |
| 8     | Vérifier que la modification est refusée                                  |

### Critères de réussite

- La liste des commandes de chaque dépanneur est exactement limitée à ses
  propres commandes.
- Aucune requête cross-tenant ne retourne de données — même avec un token
  valide d'un autre tenant.
- Le compteur de commandes en attente de chaque dépanneur ne reflète que ses
  propres commandes.

---

## DEP-0680 — Geler l'architecture multi-tenant V1

### Objectif

Fixer définitivement l'architecture multi-tenant valide pour la V1, empêcher
toute dérive future non planifiée, et définir ce qui est hors périmètre V1.

### Architecture multi-tenant V1 gelée

| Dimension              | Décision gelée                                                |
| ---------------------- | ------------------------------------------------------------- |
| Isolation des données  | Par `tenant_id` dans chaque table — pas de base séparée en V1 |
| Isolation des API      | Chaque route filtre systématiquement sur `tenant_id` du token |
| Isolation des médias   | Chaque tenant a un répertoire de stockage distinct            |
| Isolation des domaines | Sous-domaine par tenant (ex. `nom.depaneuIA.com`)             |
| Comptes partagés       | Aucun — chaque compte appartient à un seul tenant             |
| Super admin            | Accès cross-tenant en lecture uniquement pour le monitoring   |
| Clonage                | Disponible via script manuel (DEP-0677)                       |
| Facturation            | Hors périmètre V1                                             |

### Hors périmètre V1 (gelé comme exclus)

- Base de données dédiée par tenant (option V2+).
- Portabilité des comptes clients entre tenants.
- Fusionnement de deux tenants.
- Hiérarchie de tenants (franchise / réseau).
- Tableau de bord global multi-tenants pour le super admin (V2+).

### Règle de gel

Toute modification à l'architecture multi-tenant avant la fin de la V1
nécessite une nouvelle décision DEP numérotée et approuvée. Ce document
fait foi pour la V1.

---

## DEP-0681 — Langues supportées au lancement

### Objectif

Définir la liste officielle des langues supportées lors du lancement de la
plateforme en V1.

### Langues supportées en V1

| Code | Langue   | Interface disponible | Téléphone vocal disponible |
| ---- | -------- | -------------------- | -------------------------- |
| `fr` | Français | Oui                  | Oui                        |
| `en` | Anglais  | Oui                  | Non (V2+)                  |

### Règles

- Toute traduction manquante pour `en` affiche le texte en `fr` par défaut.
- L'ajout d'une nouvelle langue nécessite une décision DEP dédiée.
- Les langues sont identifiées par leur code ISO 639-1 à deux lettres.
- En V1, les langues supportées sont `fr` et `en` uniquement.

---

## DEP-0682 — Langue par défaut de la plateforme

### Décision

La langue par défaut de la plateforme depaneurIA est **le français (`fr`)**.

### Raisons

- Marché cible initial : le Québec (DEP-0683).
- Obligations légales liées à la Loi sur la langue officielle et commune du
  Québec (loi 96).
- L'ensemble de la documentation, des décisions DEP et des libellés système
  est rédigé en français.

### Application

- Tout texte sans traduction disponible dans la langue demandée s'affiche
  en `fr`.
- Le tableau de bord super admin est toujours en `fr` en V1.
- Les emails système sont générés en `fr` par défaut.

---

## DEP-0683 — Langue par défaut pour le Québec si cible initiale

### Décision

Pour le marché québécois, la langue par défaut est **le français canadien**,
représenté par le code `fr` (et optionnellement `fr-CA` pour les variantes
régionales futures).

### Variantes terminologiques québécoises retenues

| Terme standard FR  | Terme québécois retenu | Contexte d'utilisation  |
| ------------------ | ---------------------- | ----------------------- |
| Épicerie / Magasin | Dépanneur              | Nom du type de commerce |
| Panier             | Panier                 | Identique — conservé    |
| Livraison          | Livraison              | Identique — conservé    |
| Commandé           | Commandé               | Identique — conservé    |
| Confirmation       | Confirmation           | Identique — conservé    |

### Règle

- Les textes affichés aux utilisateurs québécois utilisent le registre `fr`
  avec les variantes québécoises ci-dessus.
- Le code de langue reste `fr` (pas `fr-CA`) en V1 pour la simplicité.
- Une migration vers `fr-CA` pourrait être décidée en V2.

---

## DEP-0684 — Logique de changement de langue côté client

### Objectif

Définir comment un client change la langue de l'interface boutique.

### Logique

| Étape | Action                                                                                 |
| ----- | -------------------------------------------------------------------------------------- |
| 1     | Un sélecteur de langue est visible dans l'en-tête de la boutique                       |
| 2     | Le client choisit une langue parmi celles supportées (DEP-0681)                        |
| 3     | La langue choisie est appliquée immédiatement sans rechargement de page                |
| 4     | Si le client est connecté, la préférence est sauvegardée sur son compte                |
| 5     | Si le client n'est pas connecté, la langue est mémorisée dans le navigateur (DEP-0690) |

### Règles

- Le changement de langue n'affecte pas la session de commande en cours.
- Les noms de produits et catégories s'affichent dans la langue du tenant
  si une traduction est disponible (DEP-0694), sinon en langue par défaut.
- Le sélecteur affiche uniquement les langues activées par le tenant.

---

## DEP-0685 — Logique de changement de langue côté dépanneur

### Objectif

Définir comment un dépanneur change la langue de son interface d'administration.

### Logique

| Étape | Action                                                              |
| ----- | ------------------------------------------------------------------- |
| 1     | Un sélecteur de langue est disponible dans les paramètres du compte |
| 2     | La langue choisie s'applique à toute l'interface dépanneur          |
| 3     | La préférence est sauvegardée sur le compte dépanneur               |
| 4     | La langue du dépanneur n'affecte pas la langue affichée aux clients |

### Règles

- En V1, le dépanneur choisit entre `fr` et `en`.
- La langue du dépanneur est indépendante de la langue par défaut du tenant
  (DEP-0682).
- Les notifications internes du dépanneur (nouvelles commandes, alertes) sont
  envoyées dans la langue du compte dépanneur.

---

## DEP-0686 — Logique de changement de langue côté livreur

### Objectif

Définir comment un livreur change la langue de son interface mobile.

### Logique

| Étape | Action                                                                             |
| ----- | ---------------------------------------------------------------------------------- |
| 1     | Un sélecteur de langue est disponible dans les paramètres de l'application livreur |
| 2     | La langue choisie s'applique à toute l'interface livreur                           |
| 3     | La préférence est sauvegardée sur le compte livreur                                |
| 4     | La langue du livreur n'affecte pas la langue des clients ni du dépanneur           |

### Règles

- En V1, le livreur choisit entre `fr` et `en`.
- Les instructions de livraison (adresse, notes) s'affichent dans la langue
  du livreur si une traduction est disponible, sinon dans la langue du tenant.
- La langue des notifications push du livreur suit la préférence de son compte.

---

## DEP-0687 — Logique de changement de langue côté téléphone vocal

### Objectif

Définir comment la langue est sélectionnée lors d'une interaction via le
canal téléphonique vocal (IVR / assistant vocal).

### Logique V1

| Étape | Action                                                            |
| ----- | ----------------------------------------------------------------- |
| 1     | Le système détecte la langue configurée pour le tenant appelé     |
| 2     | La langue du tenant est utilisée pour l'ensemble de l'appel en V1 |
| 3     | Aucun menu de sélection de langue n'est proposé en V1             |

### Règles

- En V1, la langue du téléphone vocal est **fixée par le tenant**, non
  choisie par l'appelant.
- La langue par défaut d'un tenant est `fr` (DEP-0683).
- La gestion d'une sélection de langue en début d'appel est réservée à V2+.
- Le code de langue utilisé pour les prompts vocaux suit le code ISO 639-1.

---

## DEP-0688 — Logique de changement de langue par tenant client

### Objectif

Définir comment un tenant configure la ou les langues disponibles pour ses
clients.

### Logique

| Étape | Action                                                                    |
| ----- | ------------------------------------------------------------------------- |
| 1     | Le dépanneur accède aux paramètres de langue de sa boutique               |
| 2     | Il active ou désactive les langues disponibles parmi celles supportées    |
| 3     | Seules les langues activées apparaissent dans le sélecteur client         |
| 4     | La langue par défaut du tenant est configurable parmi les langues actives |

### Règles

- Un tenant doit avoir au moins une langue active à tout moment.
- La langue par défaut du tenant ne peut pas être désactivée.
- En V1, la plupart des tenants n'activent que `fr`.
- Un tenant qui active `en` doit s'assurer que ses noms de produits sont
  traduits (DEP-0695, hors périmètre de ce bloc).

---

## DEP-0689 — Logique de langue préférée par compte

### Objectif

Définir comment la langue préférée d'un compte utilisateur est stockée et
appliquée.

### Structure de la préférence

| Champ                | Valeur                          | Notes                           |
| -------------------- | ------------------------------- | ------------------------------- |
| `preferred_language` | Code ISO 639-1 (ex. `fr`, `en`) | Sauvegardé sur le profil compte |
| `tenant_id`          | Identifiant du tenant concerné  | La préférence est par tenant    |

### Ordre de priorité d'application

1. Langue préférée du compte (si connecté et définie)
2. Langue mémorisée dans le navigateur (DEP-0690)
3. Langue configurée par le tenant (DEP-0688)
4. Langue par défaut de la plateforme : `fr` (DEP-0682)

### Règles

- La préférence de langue est sauvegardée à chaque changement manuel.
- Si la langue préférée n'est plus activée par le tenant, on revient à
  la langue par défaut du tenant.

---

## DEP-0690 — Logique de langue préférée par navigateur

### Objectif

Définir comment la langue préférée est détectée et mémorisée côté navigateur
pour les utilisateurs non connectés.

### Logique

| Étape | Action                                                                                     |
| ----- | ------------------------------------------------------------------------------------------ |
| 1     | Si aucun compte n'est connecté, on lit l'en-tête `Accept-Language` HTTP                    |
| 2     | On extrait le premier code de langue reconnu parmi ceux supportés                          |
| 3     | Si la langue détectée est active sur le tenant, elle est appliquée                         |
| 4     | Le choix manuel du client est mémorisé dans un cookie ou `localStorage`                    |
| 5     | Le cookie/localStorage est lu en priorité sur `Accept-Language` lors des visites suivantes |

### Règles

- Si `Accept-Language` ne correspond à aucune langue active du tenant,
  on utilise la langue par défaut du tenant.
- La durée de rétention du cookie de langue est de 365 jours.
- La clé de stockage est `preferred_language`.

---

## DEP-0691 — Logique de langue préférée par téléphone

### Objectif

Définir comment la langue est déterminée lors d'un appel téléphonique,
en l'absence de sélection manuelle de l'appelant.

### Logique V1

| Source de détection       | Comportement                                       |
| ------------------------- | -------------------------------------------------- |
| Configuration du tenant   | Langue principale utilisée pour les prompts vocaux |
| Numéro de l'appelant      | Non utilisé pour détecter la langue en V1          |
| Sélection manuelle en IVR | Non disponible en V1                               |

### Règles

- En V1, la langue du téléphone est **uniquement déterminée par le tenant**
  (DEP-0687).
- La détection automatique de la langue via le numéro de l'appelant est
  une fonctionnalité V2+.
- Tous les prompts vocaux d'un appel sont dans la même langue du début à la
  fin.

---

## DEP-0692 — Convention de clés de traduction

### Objectif

Définir le format officiel des clés utilisées dans les fichiers de traduction
de la plateforme.

### Format des clés

```
[domaine].[contexte].[element]
```

### Exemples

| Clé                              | Texte FR                                        |
| -------------------------------- | ----------------------------------------------- |
| `ui.cart.add_button`             | « Ajouter au panier »                           |
| `ui.cart.empty_message`          | « Votre panier est vide. »                      |
| `assistant.phrase.welcome`       | « Bonjour ! Qu'est-ce que je vous sers ? »      |
| `assistant.phrase.clarification` | « Pouvez-vous préciser ce que vous cherchez ? » |
| `order.status.pending`           | « En attente »                                  |
| `order.status.in_preparation`    | « En préparation »                              |
| `notification.new_order.title`   | « Nouvelle commande reçue »                     |
| `catalogue.category.beverages`   | « Boissons »                                    |
| `error.product.not_found`        | « Ce produit n'est pas disponible. »            |

### Règles

- Les clés sont en anglais, en minuscules, avec des points comme séparateurs
  et des underscores pour les espaces dans chaque segment.
- Les clés ne changent jamais après leur première utilisation en production.
- La valeur `fr` est obligatoire pour toute clé ajoutée.
- La valeur `en` est optionnelle mais recommandée.
- Une clé sans traduction `en` affiche la valeur `fr` automatiquement.

---

## DEP-0693 — Convention des textes traduisibles

### Objectif

Définir quels textes de l'interface doivent être gérés via le système de
traduction, et lesquels sont hors périmètre.

### Textes traduisibles (obligatoire)

| Type de texte                | Exemples                                      |
| ---------------------------- | --------------------------------------------- |
| Libellés d'interface         | Boutons, titres, labels de champs             |
| Messages système             | Erreurs, confirmations, alertes               |
| Phrases de l'assistant texte | Les 10 phrases canoniques DEP-0367–DEP-0376   |
| Notifications client         | Emails, SMS, push — corps et sujet            |
| États de commande affichés   | « En attente », « En livraison », etc.        |
| Messages d'indisponibilité   | Page suspendue, produit indisponible          |
| Prompts vocaux IVR           | Toutes les phrases audio de l'assistant vocal |

### Textes NON traduisibles en V1

| Type de texte                    | Raison                                             |
| -------------------------------- | -------------------------------------------------- |
| Noms des produits du catalogue   | Gérés par le tenant lui-même (DEP-0695, hors bloc) |
| Descriptions longues de produits | Idem                                               |
| Noms des catégories du catalogue | Couverts en DEP-0694                               |
| Contenu des journaux internes    | Toujours en `fr` pour la traçabilité               |
| Clés de traduction elles-mêmes   | Par définition non traduisibles                    |

### Règles

- Tout nouveau texte visible par un utilisateur final doit avoir une clé de
  traduction (DEP-0692) avant d'être mis en production.
- Les textes codés en dur dans l'interface sans clé de traduction sont
  considérés comme une dette technique à corriger.

---

## DEP-0694 — Convention des catégories traduisibles

### Objectif

Définir comment les noms de catégories du catalogue sont traduits et affichés
selon la langue active.

### Approche

Les catégories du catalogue peuvent avoir des noms traduits dans chaque langue
supportée. La traduction est optionnelle : si elle est absente, le nom dans
la langue par défaut du tenant s'affiche.

### Structure d'une catégorie traduisible

| Champ          | Type   | Description                             |
| -------------- | ------ | --------------------------------------- |
| `category_id`  | UUID   | Identifiant unique de la catégorie      |
| `tenant_id`    | UUID   | Identifiant du tenant propriétaire      |
| `default_name` | string | Nom dans la langue par défaut du tenant |
| `translations` | objet  | Clé = code langue, valeur = nom traduit |

### Exemple de structure de traductions

```
translations: {
  "fr": "Boissons",
  "en": "Beverages"
}
```

### Affichage

| Condition                                           | Texte affiché  |
| --------------------------------------------------- | -------------- |
| Langue du client = `fr`, traduction `fr` disponible | Nom FR         |
| Langue du client = `en`, traduction `en` disponible | Nom EN         |
| Langue du client = `en`, traduction `en` absente    | `default_name` |
| Langue du client = `fr`, `default_name` en `fr`     | `default_name` |

### Règles

- La structure `translations` est un objet clé-valeur, non un tableau.
- Le dépanneur peut saisir les traductions depuis l'interface d'admin catalogue.
- En V1, les traductions de catégories sont optionnelles.
- Les traductions de produits (noms, descriptions) sont hors périmètre de ce
  bloc — couvertes en DEP-0695.

---

## Synthèse

| DEP  | Titre                                       | Statut |
| ---- | ------------------------------------------- | ------ |
| 0675 | Page super admin suspension de tenant       | Défini |
| 0676 | Script d'initialisation d'un nouveau tenant | Défini |
| 0677 | Script de clonage d'un tenant modèle        | Défini |
| 0678 | Test séparation complète entre deux tenants | Défini |
| 0679 | Test aucune commande ne fuit entre tenants  | Défini |
| 0680 | Gel architecture multi-tenant V1            | Défini |
| 0681 | Langues supportées au lancement             | Défini |
| 0682 | Langue par défaut de la plateforme          | Défini |
| 0683 | Langue par défaut pour le Québec            | Défini |
| 0684 | Changement de langue côté client            | Défini |
| 0685 | Changement de langue côté dépanneur         | Défini |
| 0686 | Changement de langue côté livreur           | Défini |
| 0687 | Changement de langue côté téléphone vocal   | Défini |
| 0688 | Changement de langue par tenant client      | Défini |
| 0689 | Langue préférée par compte                  | Défini |
| 0690 | Langue préférée par navigateur              | Défini |
| 0691 | Langue préférée par téléphone               | Défini |
| 0692 | Convention de clés de traduction            | Défini |
| 0693 | Convention des textes traduisibles          | Défini |
| 0694 | Convention des catégories traduisibles      | Défini |
