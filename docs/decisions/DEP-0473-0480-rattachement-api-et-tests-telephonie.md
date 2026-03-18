# DEP-0473 à DEP-0480 — Rattachement, API backend et tests du flux téléphonique V1

## Périmètre

Ce document définit les **logiques de rattachement des appels** (au tenant
client et au dépanneur), les **API backend** nécessaires pour recevoir et
émettre les événements téléphoniques et convertir une commande vocale en
commande système, ainsi que les **scénarios de test bout en bout** (appel
complet et appel incomplet).

Il conclut le macro-bloc DEP-0441–0480 en **gelant le flux téléphonique V1**
avant toute extension future.

Principe directeur : **le téléphone est un canal de commande à part entière.**
Il suit les mêmes règles que la boutique et l'assistant texte — aucun produit
inventé, aucun prix inventé, toutes les actions passent par les fonctions
officielles du système.

Il s'agit exclusivement de **documentation** : aucun code produit, aucune
implémentation. Les spécifications décrites ici serviront de référence pour
les futures implémentations back-end et téléphonie.

---

## DEP-0473 — Logique de rattachement de l'appel au bon tenant client

### Objectif

Définir comment le système identifie, à la réception d'un appel entrant, à
quel **tenant client** (dépanneur abonné à depaneurIA) cet appel est destiné.

### Définition — Tenant client

Un **tenant client** est un dépanneur abonné à depaneurIA qui dispose de son
propre numéro de téléphone dédié, de son catalogue et de ses paramètres. Le
système est multi-tenant : un même back-end sert plusieurs dépanneurs.

### Mécanisme de rattachement

1. L'appel entrant arrive sur un **numéro de téléphone virtuel** géré par le
   fournisseur de téléphonie (ex. : Twilio, Vonage).
2. Ce numéro virtuel est **associé de façon unique** à un tenant dans la base
   de données du système.
3. À la réception de l'événement d'appel entrant (DEP-0475), le système
   extrait le **numéro appelé** (`To`) de la charge utile.
4. Il interroge la table de correspondance `tenant_phone_numbers` pour
   retrouver le `tenant_id` associé.
5. Toutes les actions suivantes de l'appel (catalogue, commandes, phrases
   système) sont contextualisées avec ce `tenant_id`.

### Données nécessaires

| Champ              | Type     | Description                                      |
|--------------------|----------|--------------------------------------------------|
| `phone_number`     | `string` | Numéro virtuel appelé (format E.164)             |
| `tenant_id`        | `uuid`   | Identifiant unique du dépanneur abonné           |
| `tenant_name`      | `string` | Nom du dépanneur (utilisé dans les phrases TTS)  |
| `is_active`        | `bool`   | Numéro actif ou suspendu                         |

### Règles

- Un numéro virtuel ne peut être associé qu'à **un seul tenant** à la fois.
- Si le numéro appelé est inconnu ou inactif, l'appel est rejeté
  avec un message d'erreur vocal générique.
- Le rattachement est résolu **avant** tout traitement de la parole du client.
- Aucune donnée d'un tenant n'est accessible depuis un appel destiné
  à un autre tenant.

### Cas attendus

| Situation                               | Résultat attendu                              |
|-----------------------------------------|-----------------------------------------------|
| Numéro connu et actif                   | ✅ Tenant identifié, appel traité             |
| Numéro connu mais tenant suspendu       | ❌ Message d'indisponibilité, appel terminé   |
| Numéro inconnu                          | ❌ Message générique, appel terminé           |

---

## DEP-0474 — Logique de rattachement de l'appel au bon dépanneur

### Objectif

Définir comment le système rattache un appel entrant au **dépanneur physique**
correct lorsque plusieurs points de vente (ou configurations) existent sous
un même tenant.

### Contexte V1

> **En V1, chaque tenant correspond à un seul dépanneur et un seul point
> de vente.** Cette logique est définie pour anticiper le multi-site, mais
> elle s'applique de façon triviale en V1 (tenant = dépanneur = 1 site).

### Mécanisme de rattachement (V1 et futur)

1. Le `tenant_id` est résolu (DEP-0473).
2. Le système recherche le(s) **point(s) de vente actif(s)** associé(s) à ce
   tenant dans la table `stores`.
3. **En V1 (1 seul site)** : le point de vente est sélectionné directement.
4. **En multi-site (futur)** : le système utilise le numéro d'appel du client
   (`From`) ou une sélection vocale pour choisir le bon site.
5. Le `store_id` est attaché à la session d'appel pour toutes les actions
   suivantes (catalogue, disponibilités, commandes).

### Données nécessaires

| Champ          | Type     | Description                                       |
|----------------|----------|---------------------------------------------------|
| `tenant_id`    | `uuid`   | Identifiant du tenant (résolu en DEP-0473)        |
| `store_id`     | `uuid`   | Identifiant du point de vente actif               |
| `store_name`   | `string` | Nom du point de vente (utilisé dans les phrases)  |
| `is_open`      | `bool`   | Indique si le dépanneur est actuellement ouvert   |

### Règles

- Si le dépanneur est **fermé** au moment de l'appel, un message vocal
  indique les horaires d'ouverture et l'appel est terminé proprement.
- Le `store_id` est propagé à toutes les requêtes catalogue et commande
  de la session.
- En V1, si `is_open` est faux, aucune commande n'est acceptée.

### Cas attendus

| Situation                                     | Résultat attendu                                  |
|-----------------------------------------------|---------------------------------------------------|
| Tenant V1, 1 seul site actif et ouvert        | ✅ `store_id` résolu, appel poursuit              |
| Tenant V1, site fermé                         | ❌ Message horaires, appel terminé                |
| Tenant futur, plusieurs sites                 | ✅ Sélection du site par logique multi-site       |

---

## DEP-0475 — API backend pour recevoir les événements téléphoniques

### Objectif

Définir le point d'entrée HTTP que le fournisseur de téléphonie appelle lorsqu'un
événement survient sur un appel (appel entrant, parole reçue, DTMF, fin d'appel).

### Endpoint

| Attribut   | Valeur                                      |
|------------|---------------------------------------------|
| Méthode    | `POST`                                      |
| Chemin     | `/api/telephony/events`                     |
| Auth       | Signature HMAC du fournisseur (webhook secret) |
| Format     | JSON ou form-encoded selon le fournisseur   |

### Événements reçus

| Type d'événement       | Déclencheur                                    | Action système                              |
|------------------------|------------------------------------------------|---------------------------------------------|
| `call.incoming`        | Appel entrant sur un numéro virtuel            | Résoudre tenant (DEP-0473) + store (DEP-0474), initier session |
| `speech.result`        | Résultat de reconnaissance vocale (STT)        | Traiter l'intent, préparer la réponse       |
| `dtmf.received`        | Touche clavier du client                       | Traiter l'entrée numérique si applicable    |
| `call.ended`           | Appel terminé (raccroché, timeout, erreur)     | Sauvegarder transcription et résumé (DEP-0465–0466), clore session |

### Charge utile minimale attendue (`call.incoming`)

```json
{
  "event":      "call.incoming",
  "call_id":    "CA_xxxx",
  "to":         "+15551234567",
  "from":       "+15559876543",
  "timestamp":  "2026-03-13T09:00:00Z"
}
```

### Règles

- Chaque requête est vérifiée par signature avant traitement (rejet 401 sinon).
- La réponse HTTP doit être renvoyée en **< 5 secondes** pour éviter un timeout
  côté fournisseur.
- En cas d'erreur interne, la réponse est 500 et le fournisseur peut rejouer.
- Les événements sont idempotents : rejouer le même `call_id` + `event`
  ne doit pas créer de doublon.

---

## DEP-0476 — API backend pour envoyer la sortie audio ou texte téléphonique

### Objectif

Définir comment le back-end transmet au fournisseur de téléphonie la réponse
à lire au client (TTS — Text-to-Speech) ou le texte brut selon le canal.

### Mécanisme

Le back-end répond à chaque événement `speech.result` (DEP-0475) avec une
instruction structurée indiquant ce que le fournisseur doit lire ou jouer.

### Format de réponse (TTS)

```json
{
  "action": "speak",
  "text":   "J'ai trouvé des chips ketchup. Veux-tu les Lay's ketchup à 3,49 € ?",
  "voice":  "fr-FR-Standard-A",
  "next":   "listen"
}
```

| Champ    | Description                                                       |
|----------|-------------------------------------------------------------------|
| `action` | `"speak"` (lire), `"play"` (fichier audio), `"hangup"` (terminer)|
| `text`   | Texte à synthétiser (max 500 caractères par réponse)              |
| `voice`  | Code voix TTS (langue et variante — fr-FR V1)                     |
| `next`   | `"listen"` (attendre la parole), `"hangup"`, `"dtmf"`            |

### Règles

- Le texte envoyé en TTS est **toujours issu des phrases système canoniques**
  définies dans DEP-0361–0376 ou construit depuis les données du catalogue.
- Aucun texte libre non contrôlé n'est généré sans passer par les règles
  de compréhension et les phrases canoniques.
- La voix utilisée est en français (fr-FR) en V1.
- Le temps de synthèse + lecture doit rester **< 8 secondes** par réponse
  pour maintenir la fluidité de la conversation.
- Les prix et noms de produits lus sont ceux du catalogue (aucune valeur
  inventée — DEP-0396, DEP-0397).

### Actions spéciales

| Action    | Quand l'utiliser                                           |
|-----------|------------------------------------------------------------|
| `hangup`  | Fin de commande confirmée, timeout, erreur non récupérable |
| `play`    | Lecture d'un fichier audio préenregistré (optionnel V1)    |
| `dtmf`    | Attendre une touche clavier du client                      |

---

## DEP-0477 — API backend pour convertir une commande vocale en commande système

### Objectif

Définir comment le back-end transforme le résultat d'un appel téléphonique
(panier vocal confirmé) en une **commande système formelle** dans depaneurIA,
identique à une commande passée via la boutique web.

### Mécanisme

1. Le client confirme sa commande vocalement en fin d'appel (DEP-0472).
2. Le back-end reconstruit le panier de la session téléphonique (produits,
   quantités, store_id, tenant_id).
3. Il appelle le même endpoint de création de commande que la boutique web :
   `POST /api/orders`.
4. La commande est créée avec la source `"telephony"` pour la traçabilité.
5. Un accusé de réception vocal est lu au client (DEP-0476).
6. La transcription et le résumé d'appel sont sauvegardés (DEP-0465–0466).

### Charge utile envoyée à `POST /api/orders`

```json
{
  "tenant_id":  "uuid-tenant",
  "store_id":   "uuid-store",
  "source":     "telephony",
  "call_id":    "CA_xxxx",
  "customer": {
    "phone":    "+15559876543"
  },
  "items": [
    { "product_id": "P-01", "quantity": 2 },
    { "product_id": "P-07", "quantity": 1 }
  ]
}
```

### Règles

- La commande n'est créée qu'**après confirmation explicite** du client au
  téléphone (pas de création implicite).
- Les `product_id` sont ceux du catalogue réel — aucun produit inventé
  (DEP-0396).
- Les prix sont calculés côté serveur depuis le catalogue au moment de la
  création — aucun prix transmis depuis la session téléphonique.
- En cas d'échec de `POST /api/orders` (ex. : rupture de stock détectée
  à la validation), le client est informé vocalement et l'appel se termine
  proprement.
- La source `"telephony"` permet au dépanneur d'identifier les commandes
  provenant du canal téléphonique dans son tableau de bord.

### Cas attendus

| Situation                                    | Résultat attendu                                     |
|----------------------------------------------|------------------------------------------------------|
| Commande confirmée, produits disponibles     | ✅ Commande créée, numéro communiqué au client       |
| Commande confirmée, rupture détectée         | ❌ Message vocal, commande non créée, appel terminé  |
| Client raccroche avant confirmation          | ❌ Aucune commande créée, session close              |

---

## DEP-0478 — Test d'un appel complet de bout en bout

### Objectif

Définir le scénario de test qui valide qu'un appel téléphonique se déroulant
normalement produit bien une commande système complète et valide.

### Scénario de test

| Étape | Action / Événement                                    | Résultat attendu                                          |
|-------|-------------------------------------------------------|-----------------------------------------------------------|
| 1     | Appel entrant sur le numéro virtuel du tenant         | ✅ Tenant et store identifiés (DEP-0473, DEP-0474)        |
| 2     | Message d'accueil lu au client                        | ✅ Phrase d'accueil canonique jouée (DEP-0371)            |
| 3     | Client dit : « 2 Pepsi et des chips ketchup »         | ✅ Intents reconnus, produits trouvés dans le catalogue    |
| 4     | Assistant lit le panier reconstitué                   | ✅ Lecture correcte du panier (DEP-0470)                  |
| 5     | Client confirme : « Oui c'est bon »                   | ✅ Signal de confirmation reconnu (DEP-0472)              |
| 6     | Commande créée via `POST /api/orders`                 | ✅ Commande enregistrée avec source `"telephony"`         |
| 7     | Phrase de confirmation lue au client                  | ✅ Numéro de commande communiqué                          |
| 8     | Phrase de fin d'appel lue                             | ✅ Appel terminé proprement (DEP-0459)                    |
| 9     | Transcription et résumé sauvegardés                   | ✅ Données disponibles dans le back-end (DEP-0465–0466)   |

### Critères de succès

- Le parcours complet (étapes 1 à 9) s'exécute sans erreur bloquante.
- La commande créée contient les bons produits, quantités, tenant_id,
  store_id et source `"telephony"`.
- Aucun produit inventé, aucun prix inventé dans la commande finale.
- La durée totale de l'appel de test est raisonnable (< 3 minutes pour
  ce scénario simple).

### Données de test minimales requises

- Un tenant actif avec numéro virtuel configuré.
- Un store actif et ouvert.
- Au moins 2 produits actifs dans le catalogue (Pepsi, chips ketchup).

---

## DEP-0479 — Test d'un appel incomplet de bout en bout

### Objectif

Définir le scénario de test qui valide que le système gère correctement un
appel téléphonique se terminant avant la confirmation de commande, sans
créer de commande parasite.

### Scénario de test — Raccroché avant confirmation

| Étape | Action / Événement                                    | Résultat attendu                                          |
|-------|-------------------------------------------------------|-----------------------------------------------------------|
| 1     | Appel entrant sur le numéro virtuel du tenant         | ✅ Tenant et store identifiés                             |
| 2     | Message d'accueil lu au client                        | ✅ Phrase d'accueil jouée                                 |
| 3     | Client dit : « 1 Pepsi »                              | ✅ Intent reconnu, produit trouvé                         |
| 4     | Assistant lit le panier                               | ✅ Lecture correcte du panier                             |
| 5     | Client raccroche sans confirmer                       | ✅ Événement `call.ended` reçu                            |
| 6     | Aucune commande créée                                 | ✅ Pas d'appel à `POST /api/orders`                       |
| 7     | Transcription partielle sauvegardée                   | ✅ Données disponibles (DEP-0465–0466), statut `"abandonné"` |

### Scénario complémentaire — Timeout sans parole

| Étape | Action / Événement                                    | Résultat attendu                                          |
|-------|-------------------------------------------------------|-----------------------------------------------------------|
| 1     | Appel entrant                                         | ✅ Tenant et store identifiés                             |
| 2     | Message d'accueil joué                                | ✅ Phrase d'accueil jouée                                 |
| 3     | Client ne parle pas pendant le délai configuré        | ✅ Message de relance joué (DEP-0460 ou DEP-0371)         |
| 4     | Client toujours silencieux après 2 relances           | ✅ Message de fin d'appel joué, appel terminé             |
| 5     | Aucune commande créée                                 | ✅ Session close, aucun enregistrement parasite           |

### Critères de succès

- **Aucune commande** n'est créée dans les deux scénarios d'appel incomplet.
- La session est correctement close et la transcription est sauvegardée
  avec un statut différencié (`"abandonné"` ou `"timeout"`).
- Le système est dans un état propre et prêt à recevoir un nouvel appel
  immédiatement après.

---

## DEP-0480 — Gel du flux téléphonique V1

### Objectif

Confirmer que le flux téléphonique V1 (DEP-0441 à DEP-0479) est **complet,
cohérent et gelé**. Aucune modification ne doit être apportée à ce flux
sans une décision explicite documentée par un nouveau DEP.

### Périmètre gelé

| Bloc          | Contenu                                                                      |
|---------------|------------------------------------------------------------------------------|
| DEP-0441–0450 | Déclenchement, accueil, identification client, gestion de l'inconnu          |
| DEP-0451–0459 | Phrases système téléphoniques (accueil, guidage, confirmation, fin)          |
| DEP-0460–0464 | Logiques de répétition et de transfert futur                                 |
| DEP-0465–0467 | Sauvegarde transcription, résumé, création commande depuis appel             |
| DEP-0468–0472 | Reconnaissance produits, désambiguïsation, lecture panier, correction, confirmation |
| DEP-0473–0474 | Rattachement appel → tenant et dépanneur                                     |
| DEP-0475–0477 | API backend événements, sortie audio/texte, conversion commande vocale       |
| DEP-0478–0479 | Tests bout en bout (appel complet et appel incomplet)                        |

### Règles du gel

- **Aucune modification** des spécifications DEP-0441 à DEP-0479 sans nouveau
  DEP dédié documentant la décision.
- Les implémentations futures doivent respecter ces spécifications telles quelles.
- Les extensions futures (multi-langue, multi-site, transfert vers humain,
  mémoire inter-appels) feront l'objet de nouveaux blocs DEP au-delà de
  DEP-0480.
- Tout écart constaté lors de l'implémentation doit être signalé et arbitré
  avant modification.

### Critères de gel validés

| Critère                                                         | Statut  |
|-----------------------------------------------------------------|---------|
| Logiques de rattachement tenant et dépanneur définies           | ✅ Fait |
| API réception événements téléphoniques spécifiée                | ✅ Fait |
| API sortie audio/texte spécifiée                                | ✅ Fait |
| API conversion commande vocale → commande système spécifiée     | ✅ Fait |
| Scénario test appel complet documenté                           | ✅ Fait |
| Scénario test appel incomplet documenté                         | ✅ Fait |
| Le lien avec DEP-0441–0472 est établi                           | ✅ Fait |
| Le périmètre gelé est explicitement listé                       | ✅ Fait |
