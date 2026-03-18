# DEP-0815 à DEP-0834 — Tests unitaires, d'intégration et de bout en bout

## Périmètre

Ce document couvre trois sous-blocs distincts mais contigus :

1. **DEP-0815–DEP-0819** : Les **tests unitaires** — téléphonie, commandes,
   livraisons, multi-tenant et multilingue.

2. **DEP-0820–DEP-0824** : Les **tests d'intégration** — front vers API,
   assistant vers fonctions du site, téléphonie vers API, dépanneur vers
   commande, livreur vers livraison.

3. **DEP-0825–DEP-0834** : Les **tests de bout en bout et de régression** —
   parcours manuel, parcours assisté texte, parcours voix web, parcours
   téléphone, parcours dépanneur, parcours livreur, régression du panier,
   régression des suggestions, régression des états de commande, et tests
   de charge basiques.

Ces décisions s'appuient sur les fonctionnalités définies dans les blocs
précédents (assistant texte DEP-0361–0400, assistant vocal DEP-0401–0440,
téléphonie DEP-0441–0480, commandes DEP-0321–0360, multi-tenant DEP-0661–0680,
multilingue DEP-0681–0694) et préparent la stratégie de qualité avant pilote.

Il s'agit exclusivement de **documentation** : aucun code de test réel,
aucune implémentation. Les spécifications décrites ici serviront de référence
pour la future écriture des tests.

---

## DEP-0815 — Tests unitaires de la téléphonie

### Objectif

Définir les tests unitaires pour vérifier le bon fonctionnement des
composants téléphoniques isolés : gestion des appels entrants, parsing
des énoncés vocaux, génération des réponses audio, et gestion des états
de session téléphonique.

### Composants testés

| Composant                          | Responsabilité                                    |
|------------------------------------|---------------------------------------------------|
| `IncomingCallHandler`              | Réception et routage d'un appel Twilio entrant    |
| `VoiceSessionManager`              | Création et maintenance de la session vocale      |
| `SpeechToTextParser`               | Conversion audio → texte structuré                |
| `TextToSpeechGenerator`            | Conversion réponse système → audio Twilio         |
| `OrderIntentExtractor`             | Extraction des produits depuis énoncés vocaux     |
| `PhoneNumberValidator`             | Validation et normalisation des numéros           |
| `CallerRecognitionService`         | Reconnaissance client connu/inconnu               |
| `VoiceGreetingBuilder`             | Construction des salutations téléphoniques        |

### Scénarios de test

#### Test 1 : Appel entrant valide

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Appel depuis `+33612345678`        | Session créée avec ID unique                      |
| Tenant ID = `tenant-demo`          | Langue détectée = `fr` (langue par défaut tenant) |
| Aucun client connu                 | État session = `greeting_new_customer`            |

**Assertions :**
- `session.callerId` === `+33612345678`
- `session.tenantId` === `tenant-demo`
- `session.state` === `greeting_new_customer`
- `session.createdAt` est défini
- `session.language` === `fr`

#### Test 2 : Reconnaissance d'un client connu

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Appel depuis `+33698765432`        | Client reconnu via numéro                         |
| Client ID = `client-123`           | Session liée au client                            |
| Nom du client = `Jean Dupont`      | Salutation personnalisée                          |

**Assertions :**
- `session.customerId` === `client-123`
- `session.state` === `greeting_returning_customer`
- `greeting.message` contient `Jean`

#### Test 3 : Parsing d'énoncé vocal simple

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Énoncé = `"Je veux des freins"`    | Intent = `order_product`                          |
| Langue = `fr`                      | Produits extraits = `["freins"]`                  |

**Assertions :**
- `intent.type` === `order_product`
- `intent.products.length` === 1
- `intent.products[0].keyword` === `freins`
- `intent.confidence` >= 0.8

#### Test 4 : Parsing d'énoncé vocal complexe

| Entrée                                                    | Sortie attendue                          |
|-----------------------------------------------------------|------------------------------------------|
| Énoncé = `"Deux plaquettes de frein et une batterie"`    | Intent = `order_product`                 |
| Langue = `fr`                                             | 2 produits extraits                      |

**Assertions :**
- `intent.products.length` === 2
- `intent.products[0].keyword` === `plaquettes de frein`
- `intent.products[0].quantity` === 2
- `intent.products[1].keyword` === `batterie`
- `intent.products[1].quantity` === 1

#### Test 5 : Validation de numéro de téléphone

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| `"0612345678"`                     | Normalisé = `+33612345678`                        |
| `"+33698765432"`                   | Normalisé = `+33698765432`                        |
| `"06 12 34 56 78"`                 | Normalisé = `+33612345678`                        |
| `"123"`                            | Erreur = `invalid_phone_number`                   |

**Assertions :**
- Les numéros valides sont normalisés au format international
- Les numéros invalides déclenchent une erreur avec code explicite

#### Test 6 : Construction de salutation

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Client connu = `true`              | `"Bonjour Jean, que puis-je faire pour vous ?"`   |
| Client connu = `false`             | `"Bonjour, bienvenue chez DépannVite..."`         |
| Langue = `en`                      | `"Hello, welcome to DépannVite..."`               |

**Assertions :**
- Les salutations respectent la langue active
- Les clients connus sont salués par leur prénom
- Les nouveaux clients reçoivent la salutation standard

### Règles de validation

- Tous les tests unitaires doivent être indépendants (pas de dépendance
  entre tests).
- Aucun appel réseau réel vers Twilio ou OpenAI — utilisation de mocks.
- Les tests doivent passer en moins de 50ms par test en moyenne.
- Couverture minimale attendue : 85% du code des services téléphoniques.

### Critère de succès

- Tous les tests unitaires passent de manière fiable.
- Les services téléphoniques peuvent être testés en isolation sans
  dépendances externes.
- Les erreurs de parsing et de validation sont détectées et explicites.

---

## DEP-0816 — Tests unitaires des commandes

### Objectif

Définir les tests unitaires pour vérifier le bon fonctionnement de la
gestion des commandes : création, validation, transitions d'état,
annulation, et calcul des totaux.

### Composants testés

| Composant                          | Responsabilité                                    |
|------------------------------------|---------------------------------------------------|
| `OrderBuilder`                     | Construction d'une commande depuis un panier      |
| `OrderValidator`                   | Validation des données de commande                |
| `OrderStateMachine`                | Gestion des transitions d'état                    |
| `OrderTotalCalculator`             | Calcul du total, taxes, frais de livraison        |
| `OrderCancellationService`         | Annulation et remboursement                       |
| `OrderItemValidator`               | Validation des articles (disponibilité, quantité) |
| `DeliveryAddressValidator`         | Validation de l'adresse de livraison              |
| `PaymentMethodValidator`           | Validation du mode de paiement                    |

### Scénarios de test

#### Test 1 : Création de commande valide

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Panier avec 3 articles             | Commande créée avec statut `en_preparation`       |
| Adresse valide                     | Adresse liée à la commande                        |
| Client ID = `client-123`           | Client lié à la commande                          |
| Tenant ID = `tenant-demo`          | Tenant lié à la commande                          |

**Assertions :**
- `order.id` est défini et unique
- `order.status` === `en_preparation`
- `order.items.length` === 3
- `order.customerId` === `client-123`
- `order.tenantId` === `tenant-demo`
- `order.createdAt` est défini

#### Test 2 : Validation d'adresse de livraison

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Adresse complète et valide         | Validation réussie                                |
| Adresse sans numéro de rue         | Erreur = `incomplete_address`                     |
| Adresse hors zone desservie        | Erreur = `zone_non_desservie`                     |

**Assertions :**
- Les adresses complètes passent la validation
- Les adresses incomplètes ou hors zone déclenchent des erreurs explicites

#### Test 3 : Calcul du total de commande

| Entrée                             | Sortie attendu                                    |
|------------------------------------|---------------------------------------------------|
| 2 articles à 10€ + 1 à 15€         | Sous-total = 35€                                  |
| Frais de livraison = 5€            | Total = 40€                                       |
| Pas de taxes en V1                 | Total TTC = Total HT                              |

**Assertions :**
- `order.subtotal` === 35.00
- `order.deliveryFee` === 5.00
- `order.total` === 40.00
- Les montants sont arrondis à 2 décimales

#### Test 4 : Transition d'état valide

| État initial                       | Action                    | État final attendu          |
|------------------------------------|---------------------------|-----------------------------|
| `en_preparation`                   | `markAsReady()`           | `prete`                     |
| `prete`                            | `markAsDelivered()`       | `livree`                    |
| `en_preparation`                   | `cancel()`                | `annulee`                   |

**Assertions :**
- Les transitions valides modifient l'état
- Les horodatages correspondants sont définis (`readyAt`, `deliveredAt`, etc.)
- Un événement est enregistré dans le journal d'activité

#### Test 5 : Transition d'état invalide

| État initial                       | Action                    | Résultat attendu            |
|------------------------------------|---------------------------|-----------------------------|
| `livree`                           | `markAsReady()`           | Erreur = `invalid_transition`|
| `annulee`                          | `markAsDelivered()`       | Erreur = `invalid_transition`|

**Assertions :**
- Les transitions invalides déclenchent une erreur
- L'état de la commande ne change pas
- Aucun événement n'est enregistré

#### Test 6 : Annulation de commande

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Commande en état `en_preparation`  | Annulation réussie                                |
| Raison = `customer_request`        | Raison enregistrée dans la commande               |

**Assertions :**
- `order.status` === `annulee`
- `order.cancelledAt` est défini
- `order.cancellationReason` === `customer_request`
- Un événement d'annulation est enregistré

#### Test 7 : Validation des articles

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Produit disponible, quantité = 2   | Validation réussie                                |
| Produit en rupture                 | Erreur = `product_out_of_stock`                   |
| Quantité = 0                       | Erreur = `invalid_quantity`                       |
| Quantité = -1                      | Erreur = `invalid_quantity`                       |

**Assertions :**
- Les articles valides passent la validation
- Les articles indisponibles ou avec quantité invalide déclenchent des erreurs

### Règles de validation

- Tous les tests unitaires doivent être indépendants.
- Utilisation de données de test en mémoire (pas de base de données).
- Les tests doivent passer en moins de 30ms par test en moyenne.
- Couverture minimale attendue : 90% du code de gestion des commandes.

### Critère de succès

- Tous les tests unitaires passent de manière fiable.
- Les règles métier de commande sont vérifiées et respectées.
- Les erreurs de validation sont détectées avant la création de commande.

---

## DEP-0817 — Tests unitaires des livraisons

### Objectif

Définir les tests unitaires pour vérifier le bon fonctionnement de la
gestion des livraisons : assignation au livreur, transitions d'état,
calcul de distance, et validation des actions livreur.

### Composants testés

| Composant                          | Responsabilité                                    |
|------------------------------------|---------------------------------------------------|
| `DeliveryAssignmentService`        | Assignation d'une commande à un livreur           |
| `DeliveryStateMachine`             | Gestion des transitions d'état de livraison       |
| `DeliveryDistanceCalculator`       | Calcul de distance et temps estimé                |
| `DeliveryValidator`                | Validation des données de livraison               |
| `DeliveryActionLogger`             | Enregistrement des actions du livreur             |
| `DeliveryNotificationService`      | Envoi des notifications de livraison              |

### Scénarios de test

#### Test 1 : Assignation de livraison

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Commande prête = `order-456`       | Livraison créée                                   |
| Livreur disponible = `driver-789`  | Livreur assigné                                   |
| Tenant ID = `tenant-demo`          | Tenant lié à la livraison                         |

**Assertions :**
- `delivery.id` est défini et unique
- `delivery.orderId` === `order-456`
- `delivery.driverId` === `driver-789`
- `delivery.status` === `assigned`
- `delivery.assignedAt` est défini

#### Test 2 : Refus d'assignation

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Livreur déjà assigné à 3 livraisons| Erreur = `driver_unavailable`                     |
| Livreur en dehors de la zone       | Erreur = `driver_out_of_zone`                     |

**Assertions :**
- Les assignations invalides déclenchent des erreurs explicites
- Aucune livraison n'est créée en cas d'erreur

#### Test 3 : Transition d'état valide

| État initial                       | Action                    | État final attendu          |
|------------------------------------|---------------------------|-----------------------------|
| `assigned`                         | `acceptDelivery()`        | `accepted`                  |
| `accepted`                         | `startDelivery()`         | `en_route`                  |
| `en_route`                         | `markAsDelivered()`       | `delivered`                 |
| `assigned`                         | `rejectDelivery()`        | `rejected`                  |

**Assertions :**
- Les transitions valides modifient l'état
- Les horodatages correspondants sont définis
- Un événement est enregistré pour chaque transition

#### Test 4 : Transition d'état invalide

| État initial                       | Action                    | Résultat attendu            |
|------------------------------------|---------------------------|-----------------------------|
| `delivered`                        | `acceptDelivery()`        | Erreur = `invalid_transition`|
| `rejected`                         | `startDelivery()`         | Erreur = `invalid_transition`|

**Assertions :**
- Les transitions invalides déclenchent une erreur
- L'état de la livraison ne change pas

#### Test 5 : Calcul de distance

| Entrée                                      | Sortie attendue                      |
|---------------------------------------------|--------------------------------------|
| Dépanneur = `48.8566, 2.3522` (Paris)       | Distance calculée                    |
| Client = `48.8606, 2.3376` (Paris proche)   | Distance ≈ 1.5 km                    |
| Temps estimé = distance / vitesse moyenne   | Temps ≈ 5 minutes                    |

**Assertions :**
- `delivery.distanceKm` est défini et > 0
- `delivery.estimatedMinutes` est défini et > 0
- Les calculs sont cohérents avec les coordonnées fournies

#### Test 6 : Enregistrement des actions livreur

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Action = `accepted`                | Événement enregistré avec horodatage              |
| Acteur = `driver-789`              | Acteur lié à l'événement                          |

**Assertions :**
- `event.action` === `accepted`
- `event.actorId` === `driver-789`
- `event.actorType` === `driver`
- `event.timestamp` est défini

### Règles de validation

- Tous les tests unitaires doivent être indépendants.
- Utilisation de données de test en mémoire.
- Les tests doivent passer en moins de 30ms par test en moyenne.
- Couverture minimale attendue : 85% du code de gestion des livraisons.

### Critère de succès

- Tous les tests unitaires passent de manière fiable.
- Les règles métier de livraison sont vérifiées et respectées.
- Les transitions d'état sont validées correctement.

---

## DEP-0818 — Tests unitaires du multi-tenant

### Objectif

Définir les tests unitaires pour vérifier l'isolation des données entre
tenants, la validation des identifiants tenant, et le bon fonctionnement
des surcharges par tenant.

### Composants testés

| Composant                          | Responsabilité                                    |
|------------------------------------|---------------------------------------------------|
| `TenantResolver`                   | Résolution du tenant depuis requête/session       |
| `TenantValidator`                  | Validation de l'identifiant tenant                |
| `TenantDataIsolation`              | Garantie d'isolation des données                  |
| `TenantConfigProvider`             | Fourniture de configuration par tenant            |
| `TenantOverrideService`            | Gestion des surcharges produit/catégorie          |

### Scénarios de test

#### Test 1 : Résolution de tenant depuis sous-domaine

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Host = `demo.depannvite.com`       | Tenant ID = `tenant-demo`                         |
| Host = `garage-martin.depannvite.com` | Tenant ID = `tenant-garage-martin`             |
| Host = `unknown.depannvite.com`    | Erreur = `tenant_not_found`                       |

**Assertions :**
- Les sous-domaines valides sont résolus en tenant ID
- Les sous-domaines inconnus déclenchent une erreur

#### Test 2 : Isolation des données de commande

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Requête tenant A pour commande tenant B | Erreur = `access_denied`                      |
| Requête tenant A pour commande tenant A | Commande retournée                            |

**Assertions :**
- Un tenant ne peut jamais accéder aux données d'un autre tenant
- Les requêtes valides retournent les données du tenant demandeur

#### Test 3 : Isolation des données client

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Requête tenant A pour client tenant B | Erreur = `access_denied`                       |
| Requête tenant A pour client tenant A | Client retourné                                |

**Assertions :**
- Les clients sont isolés par tenant
- Aucune fuite de données entre tenants

#### Test 4 : Surcharge de produit par tenant

| Entrée                                  | Sortie attendue                              |
|-----------------------------------------|----------------------------------------------|
| Produit global = `freins`, prix = 50€   | Produit visible                              |
| Surcharge tenant A = prix = 45€         | Prix affiché pour tenant A = 45€             |
| Surcharge tenant B = indisponible       | Produit masqué pour tenant B                 |

**Assertions :**
- Les surcharges par tenant sont appliquées correctement
- Les produits non surchargés affichent les valeurs par défaut

#### Test 5 : Configuration par tenant

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Tenant A = langue par défaut `fr`  | `config.defaultLanguage` === `fr`                 |
| Tenant B = langue par défaut `en`  | `config.defaultLanguage` === `en`                 |
| Tenant A = frais livraison 5€      | `config.deliveryFee` === 5.00                     |

**Assertions :**
- Chaque tenant a sa propre configuration
- Les configurations sont indépendantes entre tenants

### Règles de validation

- Tous les tests unitaires doivent être indépendants.
- Les tests doivent vérifier l'isolation stricte des données.
- Les tests doivent passer en moins de 30ms par test en moyenne.
- Couverture minimale attendue : 90% du code multi-tenant.

### Critère de succès

- Tous les tests unitaires passent de manière fiable.
- Aucune fuite de données entre tenants n'est possible.
- Les surcharges et configurations par tenant fonctionnent correctement.

---

## DEP-0819 — Tests unitaires du multilingue

### Objectif

Définir les tests unitaires pour vérifier le bon fonctionnement du système
multilingue : détection de langue, changement de langue, traduction des
clés, et gestion des langues de secours.

### Composants testés

| Composant                          | Responsabilité                                    |
|------------------------------------|---------------------------------------------------|
| `LanguageDetector`                 | Détection de langue depuis en-tête HTTP           |
| `LanguageSwitcher`                 | Changement de langue active                       |
| `TranslationService`               | Traduction des clés depuis dictionnaires          |
| `FallbackLanguageResolver`         | Résolution de la langue de secours                |
| `TranslationKeyValidator`          | Validation des clés de traduction                 |

### Scénarios de test

#### Test 1 : Détection de langue depuis en-tête

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| `Accept-Language: fr-FR,fr;q=0.9`  | Langue détectée = `fr`                            |
| `Accept-Language: en-US,en;q=0.9`  | Langue détectée = `en`                            |
| `Accept-Language: es-ES`           | Langue détectée = `fr` (langue par défaut tenant) |

**Assertions :**
- Les langues supportées sont détectées correctement
- Les langues non supportées retournent la langue par défaut du tenant

#### Test 2 : Changement de langue

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Langue active = `fr`               | Interface en français                             |
| Changement vers `en`               | Langue active = `en`                              |
| Interface mise à jour              | Textes affichés en anglais                        |

**Assertions :**
- `session.preferredLanguage` est mis à jour
- Les clés de traduction sont résolues dans la nouvelle langue

#### Test 3 : Traduction de clés

| Entrée                                  | Sortie attendue                              |
|-----------------------------------------|----------------------------------------------|
| Clé = `cart.add_to_cart`, langue = `fr` | `"Ajouter au panier"`                        |
| Clé = `cart.add_to_cart`, langue = `en` | `"Add to cart"`                              |
| Clé = `order.status.en_preparation`, `fr` | `"En préparation"`                         |
| Clé = `order.status.en_preparation`, `en` | `"In Preparation"`                         |

**Assertions :**
- Les clés de traduction sont résolues correctement
- Les traductions respectent la langue active

#### Test 4 : Langue de secours

| Entrée                                  | Sortie attendue                              |
|-----------------------------------------|----------------------------------------------|
| Clé = `cart.add_to_cart`, langue = `fr` | Traduction française                         |
| Clé manquante en `fr`, existe en `en`   | Traduction anglaise (fallback)               |
| Clé manquante partout                   | Clé retournée telle quelle                   |

**Assertions :**
- Si une traduction manque, la langue de secours est utilisée
- Si aucune traduction n'existe, la clé est retournée

#### Test 5 : Validation des clés

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Clé = `cart.add_to_cart`           | Validation réussie (format valide)                |
| Clé = `cart.add-to-cart`           | Erreur = `invalid_key_format` (tiret interdit)    |
| Clé = `Cart.AddToCart`             | Erreur = `invalid_key_format` (majuscules)        |

**Assertions :**
- Les clés respectent le format `snake_case` en minuscules
- Les clés invalides déclenchent des erreurs explicites

### Règles de validation

- Tous les tests unitaires doivent être indépendants.
- Les tests doivent vérifier les deux langues supportées (`fr` et `en`).
- Les tests doivent passer en moins de 20ms par test en moyenne.
- Couverture minimale attendue : 85% du code multilingue.

### Critère de succès

- Tous les tests unitaires passent de manière fiable.
- Les traductions fonctionnent correctement dans les deux langues.
- Les langues de secours sont appliquées correctement.

---

## DEP-0820 — Tests d'intégration front vers API

### Objectif

Définir les tests d'intégration pour vérifier la communication entre le
front-end et l'API : authentification, requêtes CRUD, gestion des erreurs,
et cohérence des réponses.

### Endpoints testés

| Endpoint                           | Méthode | Responsabilité                                |
|------------------------------------|---------|-----------------------------------------------|
| `/api/v1/auth/login`               | POST    | Connexion client avec OTP                     |
| `/api/v1/auth/verify-otp`          | POST    | Vérification du code OTP                      |
| `/api/v1/products`                 | GET     | Liste des produits du catalogue               |
| `/api/v1/cart`                     | GET     | Récupération du panier client                 |
| `/api/v1/cart/items`               | POST    | Ajout d'un article au panier                  |
| `/api/v1/orders`                   | POST    | Création d'une commande                       |
| `/api/v1/orders/:id`               | GET     | Détails d'une commande                        |

### Scénarios de test

#### Test 1 : Authentification réussie

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | POST `/api/v1/auth/login` avec téléphone valide  | Code 200, session créée                   |
| 2     | POST `/api/v1/auth/verify-otp` avec code valide  | Code 200, token JWT retourné              |
| 3     | GET `/api/v1/cart` avec token                    | Code 200, panier retourné                 |

**Assertions :**
- Le token JWT est valide et contient l'ID client
- Les requêtes authentifiées retournent les données du client

#### Test 2 : Authentification échouée

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | POST `/api/v1/auth/login` avec téléphone invalide | Code 400, erreur explicite               |
| 2     | POST `/api/v1/auth/verify-otp` avec code invalide | Code 401, erreur explicite               |

**Assertions :**
- Les erreurs retournent des codes HTTP appropriés
- Les messages d'erreur sont explicites

#### Test 3 : Récupération du catalogue

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | GET `/api/v1/products?category=freins`           | Code 200, liste de produits              |
| 2     | Vérifier les champs de chaque produit            | `id`, `name`, `price`, `imageUrl` présents|

**Assertions :**
- Les produits retournés appartiennent à la catégorie demandée
- Tous les champs obligatoires sont présents

#### Test 4 : Ajout au panier

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | POST `/api/v1/cart/items` avec produit valide    | Code 201, article ajouté                  |
| 2     | GET `/api/v1/cart`                               | Panier contient l'article ajouté          |

**Assertions :**
- L'article est ajouté au panier
- La quantité et le produit sont corrects

#### Test 5 : Création de commande

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | POST `/api/v1/orders` avec panier valide         | Code 201, commande créée                  |
| 2     | GET `/api/v1/orders/:id`                         | Commande retournée avec détails           |

**Assertions :**
- La commande est créée avec le bon statut
- Les articles de commande correspondent au panier

#### Test 6 : Gestion des erreurs réseau

| Entrée                             | Sortie attendue                                   |
|------------------------------------|---------------------------------------------------|
| Timeout de requête après 10s       | Erreur = `network_timeout`                        |
| Serveur retourne 500               | Erreur = `server_error`                           |

**Assertions :**
- Les erreurs réseau sont gérées proprement
- L'interface affiche un message d'erreur approprié

### Règles de validation

- Les tests utilisent un environnement de staging isolé.
- Les tests doivent nettoyer les données créées après exécution.
- Les tests doivent passer en moins de 5s par test en moyenne.
- Couverture minimale attendue : 80% des endpoints API.

### Critère de succès

- Tous les tests d'intégration passent de manière fiable.
- La communication front-API est fonctionnelle et robuste.
- Les erreurs sont gérées correctement côté front.

---

## DEP-0821 — Tests d'intégration assistant vers fonctions du site

### Objectif

Définir les tests d'intégration pour vérifier l'interaction entre
l'assistant texte/vocal et les fonctions du site : ajout au panier,
création de commande, modification d'adresse, etc.

### Fonctions testées

| Fonction                           | Responsabilité                                    |
|------------------------------------|---------------------------------------------------|
| `addToCartFromAssistant()`         | Ajout au panier depuis suggestion assistant       |
| `createOrderFromAssistant()`       | Création de commande depuis conversation          |
| `updateAddressFromAssistant()`     | Modification d'adresse via assistant              |
| `searchProductsFromAssistant()`    | Recherche de produits via assistant               |
| `getOrderStatusFromAssistant()`    | Consultation statut commande via assistant        |

### Scénarios de test

#### Test 1 : Ajout au panier depuis assistant

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Client envoie `"Je veux des freins"`             | Assistant reconnaît intent `order_product`|
| 2     | Assistant appelle `searchProductsFromAssistant("freins")` | Produits trouvés                    |
| 3     | Client confirme `"Oui le premier"`               | Assistant appelle `addToCartFromAssistant(productId)` |
| 4     | Vérifier panier via API                          | Article présent dans le panier            |

**Assertions :**
- Le produit est ajouté au panier
- La conversation reflète l'ajout réussi

#### Test 2 : Création de commande depuis assistant

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Panier contient 2 articles                       | Panier prêt                               |
| 2     | Client envoie `"Je veux commander"`              | Assistant reconnaît intent `create_order` |
| 3     | Assistant vérifie adresse client                 | Adresse valide                            |
| 4     | Assistant appelle `createOrderFromAssistant()`   | Commande créée                            |
| 5     | Vérifier commande via API                        | Commande en statut `en_preparation`       |

**Assertions :**
- La commande est créée avec les bons articles
- Le panier est vidé après création de commande

#### Test 3 : Modification d'adresse via assistant

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Client envoie `"Je veux changer mon adresse"`    | Assistant reconnaît intent `update_address`|
| 2     | Client fournit nouvelle adresse                  | Assistant valide l'adresse                |
| 3     | Assistant appelle `updateAddressFromAssistant()` | Adresse mise à jour                       |
| 4     | Vérifier adresse via API                         | Nouvelle adresse enregistrée              |

**Assertions :**
- L'adresse est mise à jour
- Les futures commandes utilisent la nouvelle adresse

#### Test 4 : Consultation de statut de commande

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Client envoie `"Où en est ma commande ?"`        | Assistant reconnaît intent `order_status` |
| 2     | Assistant appelle `getOrderStatusFromAssistant()`| Statut récupéré                           |
| 3     | Assistant répond avec statut                     | `"Votre commande est en préparation"`     |

**Assertions :**
- Le statut retourné est correct
- La réponse est formulée dans la langue du client

### Règles de validation

- Les tests utilisent un environnement de staging.
- Les tests doivent simuler des conversations réelles.
- Les tests doivent passer en moins de 10s par test en moyenne.
- Couverture minimale attendue : 75% des fonctions assistant.

### Critère de succès

- Tous les tests d'intégration passent de manière fiable.
- L'assistant peut déclencher les actions du site correctement.
- Les conversations aboutissent aux résultats attendus.

---

## DEP-0822 — Tests d'intégration téléphonie vers API

### Objectif

Définir les tests d'intégration pour vérifier l'interaction entre le système
téléphonique (Twilio + OpenAI) et l'API backend : reconnaissance vocale,
création de commande par téléphone, et mise à jour des données client.

### Flux testés

| Flux                               | Responsabilité                                    |
|------------------------------------|---------------------------------------------------|
| `Appel entrant → reconnaissance client` | Vérification si client connu via numéro      |
| `Commande vocale → API`            | Création de commande depuis énoncés vocaux        |
| `Mise à jour adresse vocale → API` | Modification d'adresse via téléphone              |
| `Consultation statut → API`        | Récupération de statut de commande par téléphone  |

### Scénarios de test

#### Test 1 : Reconnaissance client par téléphone

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Appel entrant depuis `+33612345678`              | Système interroge API pour client         |
| 2     | API retourne client connu                        | Session liée au client                    |
| 3     | Système salue client par son prénom              | `"Bonjour Jean"`                          |

**Assertions :**
- Le client est reconnu via son numéro
- La session téléphonique est liée au compte client

#### Test 2 : Création de commande par téléphone

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Client énonce `"Je veux deux freins et une batterie"` | Système extrait produits             |
| 2     | Système recherche produits via API               | Produits trouvés                          |
| 3     | Système confirme avec client                     | `"J'ai trouvé..."`                        |
| 4     | Client confirme `"Oui c'est ça"`                 | Système crée commande via API             |
| 5     | Vérifier commande via API                        | Commande en statut `en_preparation`       |

**Assertions :**
- Les produits énoncés sont reconnus
- La commande est créée avec les bons articles

#### Test 3 : Mise à jour d'adresse par téléphone

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Client énonce nouvelle adresse                   | Système extrait adresse                   |
| 2     | Système valide adresse via API                   | Adresse valide                            |
| 3     | Système enregistre adresse via API               | Adresse mise à jour                       |
| 4     | Vérifier adresse via API                         | Nouvelle adresse enregistrée              |

**Assertions :**
- L'adresse énoncée est correctement extraite
- La mise à jour est effectuée via API

### Règles de validation

- Les tests utilisent des enregistrements audio de test (pas d'appels réels).
- Les tests doivent vérifier la cohérence entre téléphonie et API.
- Les tests doivent passer en moins de 15s par test en moyenne.
- Couverture minimale attendue : 70% des flux téléphoniques.

### Critère de succès

- Tous les tests d'intégration passent de manière fiable.
- La téléphonie peut interagir avec l'API correctement.
- Les données sont synchronisées entre téléphone et backend.

---

## DEP-0823 — Tests d'intégration dépanneur vers commande

### Objectif

Définir les tests d'intégration pour vérifier l'interaction entre l'interface
dépanneur et le système de gestion des commandes : réception, acceptation,
marquage prête, et annulation.

### Actions testées

| Action                             | Responsabilité                                    |
|------------------------------------|---------------------------------------------------|
| `Accepter une commande`            | Dépanneur accepte une nouvelle commande           |
| `Refuser une commande`             | Dépanneur refuse une commande                     |
| `Marquer prête`                    | Dépanneur marque commande prête pour livraison    |
| `Signaler article manquant`        | Dépanneur signale article indisponible            |
| `Annuler commande`                 | Dépanneur annule commande avant livraison         |

### Scénarios de test

#### Test 1 : Acceptation de commande

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Nouvelle commande reçue                          | Commande visible dans tableau dépanneur   |
| 2     | Dépanneur clique `Accepter`                      | Commande passe en statut `en_preparation` |
| 3     | Vérifier via API                                 | `acceptedAt` défini, `acceptedBy` = dépanneur ID |

**Assertions :**
- La commande change d'état
- L'horodatage et l'acteur sont enregistrés

#### Test 2 : Refus de commande

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Nouvelle commande reçue                          | Commande visible                          |
| 2     | Dépanneur clique `Refuser`                       | Popup de raison s'affiche                 |
| 3     | Dépanneur saisit raison                          | Commande annulée                          |
| 4     | Vérifier via API                                 | Statut = `annulee`, raison enregistrée    |

**Assertions :**
- La commande est annulée
- La raison est enregistrée

#### Test 3 : Marquage prête

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Commande en statut `en_preparation`              | Commande en cours                         |
| 2     | Dépanneur clique `Marquer prête`                 | Commande passe en statut `prete`          |
| 3     | Vérifier via API                                 | `readyAt` défini                          |
| 4     | Notification envoyée au livreur                  | Livreur notifié                           |

**Assertions :**
- La commande devient disponible pour livraison
- Les notifications sont envoyées

#### Test 4 : Signalement article manquant

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Commande en préparation                          | Articles visibles                         |
| 2     | Dépanneur signale article manquant               | Popup de remplacement s'affiche           |
| 3     | Dépanneur propose remplacement                   | Article remplacé dans commande            |
| 4     | Client notifié du changement                     | Notification envoyée                      |

**Assertions :**
- L'article manquant est marqué
- Le remplacement est proposé et enregistré

### Règles de validation

- Les tests utilisent un environnement de staging.
- Les tests doivent simuler des actions dépanneur réelles.
- Les tests doivent passer en moins de 8s par test en moyenne.
- Couverture minimale attendue : 75% des actions dépanneur.

### Critère de succès

- Tous les tests d'intégration passent de manière fiable.
- Les actions dépanneur modifient correctement l'état des commandes.
- Les notifications sont envoyées aux bons acteurs.

---

## DEP-0824 — Tests d'intégration livreur vers livraison

### Objectif

Définir les tests d'intégration pour vérifier l'interaction entre l'interface
livreur et le système de gestion des livraisons : acceptation, départ,
arrivée, et marquage livré.

### Actions testées

| Action                             | Responsabilité                                    |
|------------------------------------|---------------------------------------------------|
| `Accepter livraison`               | Livreur accepte une livraison assignée            |
| `Refuser livraison`                | Livreur refuse une livraison                      |
| `Marquer en route`                 | Livreur démarre la livraison                      |
| `Marquer arrivé`                   | Livreur arrive chez le client                     |
| `Marquer livrée`                   | Livreur confirme livraison effectuée              |

### Scénarios de test

#### Test 1 : Acceptation de livraison

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Livraison assignée au livreur                    | Visible dans liste `Assignées`            |
| 2     | Livreur clique `Accepter`                        | Livraison passe en statut `accepted`      |
| 3     | Vérifier via API                                 | `acceptedAt` défini                       |

**Assertions :**
- La livraison change d'état
- Le livreur peut démarrer la livraison

#### Test 2 : Refus de livraison

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Livraison assignée                               | Visible                                   |
| 2     | Livreur clique `Refuser`                         | Popup de raison s'affiche                 |
| 3     | Livreur saisit raison                            | Livraison passe en statut `rejected`      |
| 4     | Livraison réassignée automatiquement             | Autre livreur notifié                     |

**Assertions :**
- La livraison est refusée
- La raison est enregistrée
- La réassignation est déclenchée

#### Test 3 : Départ en livraison

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Livraison acceptée                               | Bouton `Partir` visible                   |
| 2     | Livreur clique `Partir`                          | Livraison passe en statut `en_route`      |
| 3     | Vérifier via API                                 | `departedAt` défini                       |
| 4     | Client notifié                                   | Notification envoyée                      |

**Assertions :**
- La livraison passe en route
- Le client est informé du départ

#### Test 4 : Marquage livré

| Étape | Action                                           | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Livraison en route                               | Bouton `Livré` visible                    |
| 2     | Livreur clique `Livré`                           | Livraison passe en statut `delivered`     |
| 3     | Vérifier via API                                 | `deliveredAt` défini                      |
| 4     | Commande passe en statut `livree`                | Statut commande mis à jour                |

**Assertions :**
- La livraison est marquée livrée
- La commande associée est mise à jour

### Règles de validation

- Les tests utilisent un environnement de staging.
- Les tests doivent simuler des actions livreur réelles.
- Les tests doivent passer en moins de 8s par test en moyenne.
- Couverture minimale attendue : 75% des actions livreur.

### Critère de succès

- Tous les tests d'intégration passent de manière fiable.
- Les actions livreur modifient correctement l'état des livraisons.
- Les notifications sont envoyées au client et au dépanneur.

---

## DEP-0825 — Tests de bout en bout du parcours manuel

### Objectif

Définir les tests E2E pour vérifier le parcours complet d'un client
naviguant manuellement sur le site : recherche de produits, ajout au panier,
et commande sans assistance.

### Parcours testé

| Étape | Action client                                    | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Client ouvre la page d'accueil                   | Catalogue visible                         |
| 2     | Client sélectionne catégorie `Freins`            | Produits de la catégorie affichés         |
| 3     | Client clique sur un produit                     | Page produit affichée                     |
| 4     | Client ajoute produit au panier                  | Panier mis à jour                         |
| 5     | Client consulte le panier                        | Article visible dans panier               |
| 6     | Client clique `Commander`                        | Page de commande affichée                 |
| 7     | Client saisit adresse de livraison               | Adresse validée                           |
| 8     | Client confirme commande                         | Commande créée, page de confirmation affichée |
| 9     | Client consulte suivi de commande                | Commande visible avec statut `en_preparation` |

### Assertions E2E

- Le catalogue est affiché correctement
- Les produits peuvent être ajoutés au panier
- Le panier est persisté entre les pages
- La commande est créée avec les bons articles et adresse
- Le statut de commande est visible dans l'interface de suivi

### Critère de succès

- Le parcours complet peut être effectué sans erreur
- Toutes les pages se chargent en moins de 2 secondes
- Le parcours prend moins de 3 minutes à compléter

---

## DEP-0826 — Tests de bout en bout du parcours assisté texte

### Objectif

Définir les tests E2E pour vérifier le parcours complet d'un client utilisant
l'assistant texte : demande de produits, suggestions, ajout au panier via
assistant, et commande.

### Parcours testé

| Étape | Action client                                    | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Client ouvre le chat assistant                   | Assistant salue client                    |
| 2     | Client envoie `"Je cherche des freins"`          | Assistant propose des produits            |
| 3     | Client clique sur suggestion produit             | Produit ajouté au panier                  |
| 4     | Client envoie `"Je veux aussi une batterie"`     | Assistant propose batteries               |
| 5     | Client confirme choix                            | Batterie ajoutée au panier                |
| 6     | Client envoie `"Je veux commander"`              | Assistant vérifie adresse                 |
| 7     | Client confirme adresse                          | Commande créée                            |
| 8     | Assistant affiche confirmation                   | Numéro de commande affiché                |

### Assertions E2E

- L'assistant comprend les demandes en langage naturel
- Les suggestions de produits sont pertinentes
- Les produits peuvent être ajoutés au panier via suggestions
- La commande est créée via conversation
- La confirmation est affichée dans le chat

### Critère de succès

- Le parcours complet peut être effectué via assistant uniquement
- Les réponses de l'assistant arrivent en moins de 3 secondes
- Le parcours prend moins de 5 minutes à compléter

---

## DEP-0827 — Tests de bout en bout du parcours voix web

### Objectif

Définir les tests E2E pour vérifier le parcours complet d'un client utilisant
l'assistant vocal web : commande vocale depuis le navigateur, suggestions,
et confirmation.

### Parcours testé

| Étape | Action client                                    | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Client clique sur bouton micro                   | Écoute activée                            |
| 2     | Client énonce `"Je veux des freins"`             | Énoncé converti en texte                  |
| 3     | Assistant vocal répond                           | Réponse audio jouée                       |
| 4     | Client énonce confirmation                       | Produit ajouté au panier                  |
| 5     | Client énonce `"Je veux commander"`              | Assistant demande confirmation adresse    |
| 6     | Client confirme vocalement                       | Commande créée                            |
| 7     | Assistant lit numéro de commande                 | Confirmation vocale jouée                 |

### Assertions E2E

- Le micro capture correctement la voix
- Les énoncés sont transcrits correctement
- L'assistant répond vocalement
- Les produits peuvent être commandés par voix
- La commande est créée et confirmée vocalement

### Critère de succès

- Le parcours complet peut être effectué en mode vocal
- La reconnaissance vocale fonctionne avec un taux de succès > 90%
- Le parcours prend moins de 6 minutes à compléter

---

## DEP-0828 — Tests de bout en bout du parcours téléphone

### Objectif

Définir les tests E2E pour vérifier le parcours complet d'un client appelant
par téléphone : appel, commande vocale, et confirmation.

### Parcours testé

| Étape | Action client                                    | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Client appelle le numéro du dépanneur            | Système répond et salue                   |
| 2     | Client énonce son besoin                         | Système reconnaît produits demandés       |
| 3     | Système propose produits trouvés                 | Client entend les options                 |
| 4     | Client confirme choix                            | Système demande adresse                   |
| 5     | Client énonce adresse                            | Système valide adresse                    |
| 6     | Système récapitule commande                      | Client entend récapitulatif               |
| 7     | Client confirme                                  | Commande créée                            |
| 8     | Système lit numéro de commande                   | Client reçoit confirmation                |

### Assertions E2E

- L'appel est reçu et traité
- Le système reconnaît les énoncés téléphoniques
- Les produits sont identifiés correctement
- L'adresse est validée
- La commande est créée via téléphone

### Critère de succès

- Le parcours complet peut être effectué par téléphone
- Le taux de reconnaissance vocale téléphonique > 85%
- Le parcours prend moins de 8 minutes à compléter

---

## DEP-0829 — Tests de bout en bout du parcours dépanneur

### Objectif

Définir les tests E2E pour vérifier le parcours complet d'un dépanneur :
réception de commande, préparation, signalement d'article manquant, et
marquage prête.

### Parcours testé

| Étape | Action dépanneur                                 | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Dépanneur se connecte                            | Tableau de bord affiché                   |
| 2     | Nouvelle commande arrive                         | Notification sonore et visuelle           |
| 3     | Dépanneur clique sur commande                    | Détails de commande affichés              |
| 4     | Dépanneur clique `Accepter`                      | Commande en préparation                   |
| 5     | Dépanneur prépare articles                       | Articles cochés un par un                 |
| 6     | Un article manque                                | Dépanneur clique `Signaler manquant`      |
| 7     | Dépanneur propose remplacement                   | Remplacement enregistré                   |
| 8     | Dépanneur clique `Marquer prête`                 | Commande prête pour livraison             |
| 9     | Notification envoyée au livreur                  | Livreur notifié                           |

### Assertions E2E

- Le dépanneur reçoit les notifications
- Les commandes peuvent être acceptées
- Les articles manquants peuvent être signalés
- Les remplacements peuvent être proposés
- Les commandes peuvent être marquées prêtes

### Critère de succès

- Le parcours complet peut être effectué par le dépanneur
- Les notifications arrivent en temps réel
- Le parcours prend moins de 10 minutes à compléter

---

## DEP-0830 — Tests de bout en bout du parcours livreur

### Objectif

Définir les tests E2E pour vérifier le parcours complet d'un livreur :
réception de livraison, acceptation, départ, livraison, et confirmation.

### Parcours testé

| Étape | Action livreur                                   | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Livreur se connecte                              | Liste des livraisons disponibles affichée |
| 2     | Nouvelle livraison assignée                      | Notification reçue                        |
| 3     | Livreur clique sur livraison                     | Détails de livraison affichés             |
| 4     | Livreur clique `Accepter`                        | Livraison acceptée                        |
| 5     | Livreur clique `Partir`                          | Livraison en route                        |
| 6     | Client notifié du départ                         | Notification envoyée                      |
| 7     | Livreur arrive chez client                       | Livreur clique `Arrivé`                   |
| 8     | Livreur livre la commande                        | Livreur clique `Livré`                    |
| 9     | Commande passe en statut `livree`                | Statut mis à jour                         |

### Assertions E2E

- Le livreur reçoit les assignations
- Les livraisons peuvent être acceptées
- Les états de livraison sont mis à jour
- Les notifications sont envoyées au client
- La commande passe en statut livré

### Critère de succès

- Le parcours complet peut être effectué par le livreur
- Les notifications arrivent en temps réel
- Le parcours prend moins de 30 minutes à compléter (avec déplacement simulé)

---

## DEP-0831 — Tests de régression du panier

### Objectif

Définir les tests de régression pour vérifier que les fonctionnalités du
panier ne régressent pas après des changements de code : ajout, suppression,
modification de quantité, vidage, et persistance.

### Fonctionnalités testées

| Fonctionnalité                     | Scénario de régression                            |
|------------------------------------|---------------------------------------------------|
| Ajout au panier                    | Ajouter 5 produits différents                     |
| Suppression d'article              | Supprimer le 3e article                           |
| Modification de quantité           | Augmenter quantité de 1 à 3                       |
| Vidage du panier                   | Vider tout le panier                              |
| Persistance du panier              | Recharger la page, panier intact                  |
| Calcul du total                    | Vérifier total après ajout/suppression            |

### Scénarios de régression

#### Test 1 : Ajout multiple au panier

| Action                             | Résultat attendu                                  |
|------------------------------------|---------------------------------------------------|
| Ajouter 5 produits différents      | Panier contient 5 articles                        |
| Total calculé correctement         | Somme des prix = total affiché                    |

**Assertions :**
- `cart.items.length` === 5
- `cart.total` === somme des prix

#### Test 2 : Suppression d'article

| Action                             | Résultat attendu                                  |
|------------------------------------|---------------------------------------------------|
| Supprimer 1 article sur 5          | Panier contient 4 articles                        |
| Total recalculé                    | Total diminué du prix de l'article supprimé       |

**Assertions :**
- `cart.items.length` === 4
- Total mis à jour

#### Test 3 : Modification de quantité

| Action                             | Résultat attendu                                  |
|------------------------------------|---------------------------------------------------|
| Augmenter quantité de 1 à 3        | Quantité = 3                                      |
| Total recalculé                    | Total augmenté en conséquence                     |

**Assertions :**
- `cart.items[0].quantity` === 3
- Total mis à jour

#### Test 4 : Vidage du panier

| Action                             | Résultat attendu                                  |
|------------------------------------|---------------------------------------------------|
| Vider le panier                    | Panier vide                                       |
| Total = 0                          | Total affiché = 0€                                |

**Assertions :**
- `cart.items.length` === 0
- `cart.total` === 0

#### Test 5 : Persistance après rechargement

| Action                             | Résultat attendu                                  |
|------------------------------------|---------------------------------------------------|
| Ajouter 3 articles                 | Panier contient 3 articles                        |
| Recharger la page                  | Panier toujours 3 articles                        |

**Assertions :**
- Le panier est persisté en localStorage ou session
- Les articles sont intacts après rechargement

### Critère de succès

- Tous les tests de régression passent
- Aucune fonctionnalité du panier ne régresse
- Les tests s'exécutent en moins de 2 minutes

---

## DEP-0832 — Tests de régression des suggestions

### Objectif

Définir les tests de régression pour vérifier que les suggestions de
l'assistant ne régressent pas : pertinence, affichage, et interactions.

### Fonctionnalités testées

| Fonctionnalité                     | Scénario de régression                            |
|------------------------------------|---------------------------------------------------|
| Suggestions de produits            | Assistant propose produits pertinents             |
| Suggestions de catégories          | Assistant propose catégories pertinentes          |
| Clic sur suggestion                | Ajout au panier ou navigation                     |
| Actualisation des suggestions      | Suggestions mises à jour après ajout              |

### Scénarios de régression

#### Test 1 : Suggestions de produits

| Requête                            | Suggestions attendues                             |
|------------------------------------|---------------------------------------------------|
| `"Je cherche des freins"`          | Produits de catégorie Freins                      |
| `"Batterie"`                       | Produits de catégorie Batteries                   |

**Assertions :**
- Les suggestions sont pertinentes
- Au moins 3 suggestions affichées

#### Test 2 : Clic sur suggestion

| Action                             | Résultat attendu                                  |
|------------------------------------|---------------------------------------------------|
| Clic sur suggestion produit        | Produit ajouté au panier                          |
| Clic sur suggestion catégorie      | Navigation vers catégorie                         |

**Assertions :**
- Les clics déclenchent les bonnes actions
- Les suggestions disparaissent après clic

#### Test 3 : Actualisation des suggestions

| Action                             | Résultat attendu                                  |
|------------------------------------|---------------------------------------------------|
| Ajouter produit au panier          | Suggestions mises à jour                          |
| Nouvelles suggestions affichées    | Produits complémentaires proposés                 |

**Assertions :**
- Les suggestions évoluent après actions
- Produits déjà dans panier non re-suggérés

### Critère de succès

- Tous les tests de régression passent
- Les suggestions restent pertinentes
- Les tests s'exécutent en moins de 3 minutes

---

## DEP-0833 — Tests de régression des états de commande

### Objectif

Définir les tests de régression pour vérifier que les transitions d'état
de commande ne régressent pas : création, préparation, prête, livrée,
annulée.

### États testés

| État                               | Transition testée                                 |
|------------------------------------|---------------------------------------------------|
| `en_preparation`                   | Nouvelle commande → en préparation                |
| `prete`                            | En préparation → prête                            |
| `livree`                           | Prête → livrée                                    |
| `annulee`                          | En préparation → annulée                          |
| `probleme`                         | En route → problème                               |

### Scénarios de régression

#### Test 1 : Transition complète

| Étape | Transition                                       | Résultat attendu                          |
|-------|--------------------------------------------------|-------------------------------------------|
| 1     | Créer commande                                   | Statut = `en_preparation`                 |
| 2     | Marquer prête                                    | Statut = `prete`                          |
| 3     | Assigner livreur                                 | Livraison créée                           |
| 4     | Marquer livrée                                   | Statut = `livree`                         |

**Assertions :**
- Toutes les transitions sont valides
- Les horodatages sont définis
- Les événements sont enregistrés

#### Test 2 : Transition invalide

| Action                             | Résultat attendu                                  |
|------------------------------------|---------------------------------------------------|
| Marquer livrée depuis `en_preparation` | Erreur = `invalid_transition`                 |

**Assertions :**
- Les transitions invalides sont bloquées
- Aucun changement d'état

#### Test 3 : Annulation

| Action                             | Résultat attendu                                  |
|------------------------------------|---------------------------------------------------|
| Annuler depuis `en_preparation`    | Statut = `annulee`                                |
| Annuler depuis `livree`            | Erreur = `invalid_transition`                     |

**Assertions :**
- L'annulation est possible uniquement avant livraison
- La raison d'annulation est enregistrée

### Critère de succès

- Tous les tests de régression passent
- Les transitions d'état restent cohérentes
- Les tests s'exécutent en moins de 2 minutes

---

## DEP-0834 — Tests de charge basiques

### Objectif

Définir les tests de charge pour vérifier que le système supporte un trafic
raisonnable : requêtes API simultanées, appels téléphoniques concurrents,
et conversations assistant parallèles.

### Scénarios de charge

#### Test 1 : Requêtes API simultanées

| Charge                             | Résultat attendu                                  |
|------------------------------------|---------------------------------------------------|
| 50 requêtes GET `/api/v1/products` | Toutes répondent en < 2s                          |
| 20 requêtes POST `/api/v1/orders`  | Toutes répondent en < 3s                          |

**Assertions :**
- Aucune erreur 500
- Temps de réponse acceptable
- Taux de succès > 99%

#### Test 2 : Appels téléphoniques concurrents

| Charge                             | Résultat attendu                                  |
|------------------------------------|---------------------------------------------------|
| 3 appels simultanés par tenant     | Tous les appels sont traités                      |
| 4e appel simultané                 | Message d'indisponibilité                         |

**Assertions :**
- La limite de 3 appels simultanés est respectée
- Les appels excédentaires reçoivent un message d'attente

#### Test 3 : Conversations assistant parallèles

| Charge                             | Résultat attendu                                  |
|------------------------------------|---------------------------------------------------|
| 30 conversations simultanées       | Toutes répondent en < 5s                          |
| 50 messages/minute                 | Tous traités correctement                         |

**Assertions :**
- Aucun message perdu
- Temps de réponse acceptable
- Taux de succès > 95%

#### Test 4 : Création de commandes simultanées

| Charge                             | Résultat attendu                                  |
|------------------------------------|---------------------------------------------------|
| 20 commandes créées simultanément  | Toutes créées correctement                        |
| Aucune collision d'ID              | Tous les IDs sont uniques                         |

**Assertions :**
- Aucune commande perdue
- Aucun doublon d'ID
- Toutes les commandes ont le bon statut

#### Test 5 : Charge soutenue

| Charge                             | Résultat attendu                                  |
|------------------------------------|---------------------------------------------------|
| 100 requêtes/minute pendant 10 min | Système stable                                    |
| CPU < 70%                          | Ressources acceptables                            |
| Mémoire < 80%                      | Pas de fuite mémoire                              |

**Assertions :**
- Le système reste stable
- Aucune dégradation de performance
- Aucune fuite de ressources

### Seuils de performance V1

| Métrique                           | Seuil acceptable                                  |
|------------------------------------|---------------------------------------------------|
| Temps de réponse API (p95)         | < 2 secondes                                      |
| Temps de réponse assistant (p95)   | < 5 secondes                                      |
| Requêtes simultanées supportées    | 50 par tenant                                     |
| Appels téléphoniques simultanés    | 3 par tenant                                      |
| Uptime minimal                     | 99% (hors maintenance)                            |

### Critère de succès

- Tous les tests de charge passent
- Les seuils de performance sont respectés
- Le système reste stable sous charge
- Les tests s'exécutent en moins de 15 minutes

---

## Récapitulatif des DEP-0815 à DEP-0834

| DEP      | Titre                                            | Type           |
|----------|--------------------------------------------------|----------------|
| DEP-0815 | Tests unitaires de la téléphonie                 | Tests unitaires|
| DEP-0816 | Tests unitaires des commandes                    | Tests unitaires|
| DEP-0817 | Tests unitaires des livraisons                   | Tests unitaires|
| DEP-0818 | Tests unitaires du multi-tenant                  | Tests unitaires|
| DEP-0819 | Tests unitaires du multilingue                   | Tests unitaires|
| DEP-0820 | Tests d'intégration front vers API               | Tests intégration|
| DEP-0821 | Tests d'intégration assistant vers fonctions     | Tests intégration|
| DEP-0822 | Tests d'intégration téléphonie vers API          | Tests intégration|
| DEP-0823 | Tests d'intégration dépanneur vers commande      | Tests intégration|
| DEP-0824 | Tests d'intégration livreur vers livraison       | Tests intégration|
| DEP-0825 | Tests E2E du parcours manuel                     | Tests E2E      |
| DEP-0826 | Tests E2E du parcours assisté texte              | Tests E2E      |
| DEP-0827 | Tests E2E du parcours voix web                   | Tests E2E      |
| DEP-0828 | Tests E2E du parcours téléphone                  | Tests E2E      |
| DEP-0829 | Tests E2E du parcours dépanneur                  | Tests E2E      |
| DEP-0830 | Tests E2E du parcours livreur                    | Tests E2E      |
| DEP-0831 | Tests de régression du panier                    | Tests régression|
| DEP-0832 | Tests de régression des suggestions              | Tests régression|
| DEP-0833 | Tests de régression des états de commande        | Tests régression|
| DEP-0834 | Tests de charge basiques                         | Tests charge   |

---

## Gel de la stratégie de tests V1

Les décisions DEP-0815 à DEP-0834 définissent la stratégie de tests V1
pour depaneurIA. Cette stratégie couvre :

- **5 blocs de tests unitaires** — téléphonie, commandes, livraisons,
  multi-tenant, multilingue
- **5 blocs de tests d'intégration** — front-API, assistant-site,
  téléphonie-API, dépanneur-commande, livreur-livraison
- **6 blocs de tests E2E** — parcours manuel, assisté texte, voix web,
  téléphone, dépanneur, livreur
- **3 blocs de tests de régression** — panier, suggestions, états de commande
- **1 bloc de tests de charge** — requêtes API, appels téléphoniques,
  conversations assistant

Cette stratégie sera complétée par :

- **DEP-0835** : Tests de charge des appels simultanés si utile
- **DEP-0836** : Checklist de QA manuelle
- **DEP-0837** : Checklist de QA mobile
- **DEP-0838** : Checklist de QA accessibilité
- **DEP-0839** : Checklist de QA téléphonie
- **DEP-0840** : Gel de la discipline qualité avant pilote

Les tests définis en DEP-0815–0834 sont documentés uniquement. L'implémentation
réelle des tests sera effectuée dans les blocs suivants, en utilisant les
frameworks de test appropriés (Jest, Playwright, k6, etc.).

**Les décisions DEP-0815 à DEP-0834 sont gelées pour V1.**
