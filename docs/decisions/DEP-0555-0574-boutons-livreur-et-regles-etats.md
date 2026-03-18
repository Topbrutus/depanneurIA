# DEP-0555 à DEP-0574 — Boutons livreur, gel V1 et règles d'états des commandes

## Périmètre

Ce document couvre deux sous-blocs distincts mais contigus :

1. **DEP-0555–0560** : Les **quatre boutons d'action du livreur**
   (j'accepte, je pars, livré, problème), le scénario de test d'une tournée
   simple, et le gel de la V1 du livreur.

2. **DEP-0561–0574** : La **machine à états des commandes** — tous les états
   officiels, l'ordre de passage, les transitions interdites, les retours
   arrière possibles, les événements déclencheurs, les permissions par rôle,
   et les quatre moments de transformation du cycle de vie d'une commande.

Il s'agit exclusivement de **documentation** : aucun code produit, aucune
implémentation. Les spécifications décrites ici serviront de référence pour
les futures implémentations front-end, back-end et mobile.

---

## DEP-0555 — Bouton « J'accepte »

### Objectif

Définir les caractéristiques du bouton permettant au livreur d'accepter une
livraison qui lui est proposée.

### Contexte d'affichage

Le bouton apparaît sur l'écran « livraisons à faire » (DEP-0552) lorsqu'une
nouvelle commande est disponible et non encore assignée.

### Spécifications

| Attribut         | Valeur                                                          |
|------------------|-----------------------------------------------------------------|
| Libellé          | « J'accepte »                                                  |
| Couleur          | Vert (#388E3C)                                                  |
| Position         | Bas de la fiche commande, bouton primaire                       |
| Action déclenchée| Transition état commande `en_attente` → `acceptée`             |
| Confirmation     | Non — action immédiate (le livreur sait ce qu'il fait)         |
| Disponibilité    | Uniquement si commande en état `en_attente` et livreur libre   |

### Règles

- Un livreur ne peut accepter qu'une seule livraison à la fois en V1.
- Une fois acceptée, la commande disparaît de la liste des autres livreurs.
- Si deux livreurs cliquent simultanément, le premier valide ; le second
  reçoit un message « déjà prise en charge ».
- L'action est journalisée avec l'horodatage et l'identifiant du livreur.

---

## DEP-0556 — Bouton « Je pars »

### Objectif

Définir les caractéristiques du bouton permettant au livreur de signaler
qu'il quitte le dépanneur avec la commande et qu'il est en route.

### Contexte d'affichage

Le bouton apparaît sur l'écran « livraison en cours » (DEP-0553) après que
le livreur a accepté la commande et récupéré le colis.

### Spécifications

| Attribut         | Valeur                                                          |
|------------------|-----------------------------------------------------------------|
| Libellé          | « Je pars »                                                    |
| Couleur          | Bleu (#1976D2)                                                  |
| Position         | Bas de l'écran livraison en cours, bouton primaire              |
| Action déclenchée| Transition état commande `acceptée` → `en_route`               |
| Confirmation     | Non — action immédiate                                          |
| Disponibilité    | Uniquement si commande en état `acceptée`                       |

### Règles

- Le livreur ne peut appuyer sur « Je pars » qu'après avoir appuyé sur
  « J'accepte » (DEP-0555).
- L'horodatage de départ est enregistré (référence pour les délais de
  livraison estimés).
- Le dépanneur est notifié que le livreur est en route.
- L'action est journalisée avec l'horodatage et l'identifiant du livreur.

---

## DEP-0557 — Bouton « Livré »

### Objectif

Définir les caractéristiques du bouton permettant au livreur de confirmer
qu'il a remis la commande au client.

### Contexte d'affichage

Le bouton apparaît sur l'écran « livraison en cours » (DEP-0553) lorsque
le livreur est en état `en_route`.

### Spécifications

| Attribut         | Valeur                                                          |
|------------------|-----------------------------------------------------------------|
| Libellé          | « Livré »                                                      |
| Couleur          | Vert foncé (#1B5E20)                                            |
| Position         | Bas de l'écran livraison en cours, bouton primaire              |
| Action déclenchée| Transition état commande `en_route` → `livrée`                 |
| Confirmation     | Oui — dialogue de confirmation (« Confirmes-tu la remise ? »)  |
| Disponibilité    | Uniquement si commande en état `en_route`                       |

### Règles

- Une confirmation est requise pour éviter les fausses manipulations.
- L'horodatage de livraison est enregistré (preuve de remise).
- Si un paiement à la livraison est prévu, le flux de confirmation de
  paiement est déclenché (DEP-0570) avant la clôture.
- Le client reçoit une notification de livraison confirmée.
- L'action est journalisée avec l'horodatage et l'identifiant du livreur.

---

## DEP-0558 — Bouton « Problème »

### Objectif

Définir les caractéristiques du bouton permettant au livreur de signaler
un incident survenu pendant la livraison (client absent, adresse incorrecte,
refus de commande, problème produit).

### Contexte d'affichage

Le bouton est toujours disponible sur l'écran « livraison en cours »
(DEP-0553) dès que le livreur a accepté une commande.

### Spécifications

| Attribut         | Valeur                                                          |
|------------------|-----------------------------------------------------------------|
| Libellé          | « Problème »                                                   |
| Couleur          | Orange (#E65100)                                                |
| Position         | Haut ou bas de l'écran, bouton secondaire visible              |
| Action déclenchée| Ouverture d'un formulaire de signalement                        |
| Confirmation     | Oui — choix du type de problème requis avant envoi             |
| Disponibilité    | Dès que la commande est en état `acceptée` ou `en_route`       |

### Types de problèmes disponibles (V1)

| Code            | Libellé affiché               |
|-----------------|-------------------------------|
| `CLIENT_ABSENT` | « Client absent »            |
| `WRONG_ADDRESS` | « Adresse incorrecte »       |
| `REFUSED`       | « Client a refusé »          |
| `PRODUCT_ISSUE` | « Problème avec un produit » |
| `OTHER`         | « Autre »                    |

### Règles

- Le livreur doit choisir un type de problème avant d'envoyer le signalement.
- Le signalement est transmis immédiatement au dépanneur.
- La commande passe en état `problème` en attente de décision du dépanneur.
- Le livreur peut ajouter une note texte libre courte (max 200 caractères).
- L'action est journalisée avec le type, la note et l'horodatage.

---

## DEP-0559 — Test d'une tournée simple du livreur

### Objectif

Définir le scénario de test qui valide qu'un livreur peut effectuer une
livraison complète de bout en bout sans incident.

### Scénario de test

| Étape | Action / Événement                                     | Résultat attendu                                          |
|-------|--------------------------------------------------------|-----------------------------------------------------------|
| 1     | Une commande apparaît dans l'écran « livraisons à faire » | ✅ Commande visible avec les détails (client, adresse, articles) |
| 2     | Livreur appuie sur « J'accepte »                       | ✅ Commande passe en `acceptée`, disparaît pour les autres livreurs |
| 3     | Livreur récupère le colis et appuie sur « Je pars »    | ✅ Commande passe en `en_route`, dépanneur notifié        |
| 4     | Livreur arrive chez le client et remet la commande     | ✅ Livreur appuie sur « Livré », confirmation demandée    |
| 5     | Livreur confirme la remise                             | ✅ Commande passe en `livrée`, client notifié             |
| 6     | Commande apparaît dans l'historique du livreur         | ✅ Entrée visible dans DEP-0554                           |

### Critères de succès

- Les 6 étapes s'exécutent sans erreur bloquante.
- Les transitions d'état sont correctement enregistrées avec horodatages.
- Les notifications (dépanneur, client) sont bien déclenchées aux étapes 3 et 5.
- La commande finale est bien archivée dans l'historique du livreur.

---

## DEP-0560 — Gel de la V1 du livreur

### Objectif

Confirmer que le parcours V1 du livreur (DEP-0521 à DEP-0559) est **complet,
cohérent et gelé**. Aucune modification ne doit être apportée sans décision
explicite documentée.

### Périmètre gelé

| Bloc          | Contenu                                                                  |
|---------------|--------------------------------------------------------------------------|
| DEP-0521–0530 | Rôle du livreur, assignation, notifications, accès catalogue livraison   |
| DEP-0531–0540 | Logique de prise en charge, départ, remise, paiement, retour, problème  |
| DEP-0541–0550 | Phrases livreur, logique de remise réussie                               |
| DEP-0551–0554 | Application mobile livreur, écrans (liste, en cours, historique)         |
| DEP-0555–0559 | Boutons d'action (j'accepte, je pars, livré, problème) + test tournée   |

### Critères de gel validés

| Critère                                              | Statut  |
|------------------------------------------------------|---------|
| Tous les boutons d'action sont définis               | ✅ Fait |
| Le scénario de tournée simple est testé              | ✅ Fait |
| Les transitions d'état livreur sont documentées      | ✅ Fait |
| Le parcours livreur est cohérent de bout en bout     | ✅ Fait |

---

## DEP-0561 — Tous les états officiels d'une commande

### Objectif

Définir l'ensemble exhaustif des états qu'une commande peut prendre dans
le cycle de vie depaneurIA V1.

### États officiels

| Code état         | Libellé lisible         | Description                                                      |
|-------------------|-------------------------|------------------------------------------------------------------|
| `panier`          | Panier en cours         | Articles en cours de sélection, non soumis                      |
| `soumise`         | Commande soumise        | Client a validé le panier, commande créée, en attente de confirmation dépanneur |
| `confirmée`       | Confirmée               | Dépanneur a accepté la commande, préparation en cours           |
| `en_préparation`  | En préparation          | Dépanneur prépare les articles                                  |
| `prête`           | Prête à partir          | Commande préparée, en attente du livreur                        |
| `acceptée`        | Acceptée par le livreur | Livreur a accepté la livraison (DEP-0555)                       |
| `en_route`        | En route                | Livreur en déplacement vers le client (DEP-0556)                |
| `livrée`          | Livrée                  | Livreur a confirmé la remise au client (DEP-0557)               |
| `payée`           | Payée                   | Paiement confirmé (en ligne ou à la livraison)                  |
| `annulée`         | Annulée                 | Commande annulée avant livraison (voir DEP-0567)                |
| `problème`        | Problème signalé        | Incident signalé par le livreur (DEP-0558), en attente décision |
| `archivée`        | Archivée                | Commande clôturée, conservée comme preuve historique (DEP-0574) |

### Règle générale

- Ces douze états sont les **seuls états valides** en V1.
- Tout état non listé est interdit et doit être traité comme une erreur.
- Chaque transition entre états est soumise aux règles définies en
  DEP-0562 à DEP-0566.

---

## DEP-0562 — Ordre de passage des états d'une commande

### Objectif

Définir la séquence normale et linéaire de progression d'une commande de
sa création à son archivage.

### Flux nominal

```
panier
  └─→ soumise
        └─→ confirmée
              └─→ en_préparation
                    └─→ prête
                          └─→ acceptée
                                └─→ en_route
                                      └─→ livrée
                                            └─→ payée
                                                  └─→ archivée
```

### Flux avec paiement en ligne (anticipé)

```
panier → soumise → (payée) → confirmée → en_préparation → prête
       → acceptée → en_route → livrée → archivée
```

> En cas de paiement en ligne, l'état `payée` est atteint juste après
> `soumise` et avant `confirmée`. La commande ne peut être confirmée
> par le dépanneur que si le paiement est validé.

### Flux avec problème

```
… → acceptée ou en_route → problème → (résolution) → annulée ou en_route
```

### Règle générale

- Le flux nominal doit être respecté dans l'ordre indiqué.
- Les états non listés dans les transitions autorisées (DEP-0563) sont
  strictement interdits.

---

## DEP-0563 — États impossibles à sauter

### Objectif

Définir les transitions d'état qui ne peuvent jamais se produire,
même si techniquement déclenchables.

### Transitions interdites

| De            | Vers               | Raison                                                     |
|---------------|--------------------|------------------------------------------------------------|
| `panier`      | `livrée`           | Impossible de livrer sans soumettre ni confirmer           |
| `panier`      | `payée`            | Impossible de payer un panier non soumis                   |
| `soumise`     | `en_route`         | Le dépanneur doit confirmer et préparer avant la livraison |
| `soumise`     | `livrée`           | Toutes les étapes intermédiaires sont obligatoires         |
| `confirmée`   | `acceptée`         | La commande doit être prête avant d'être acceptée          |
| `confirmée`   | `livrée`           | Le livreur ne peut livrer sans partir                      |
| `en_préparation` | `en_route`      | La commande doit être prête avant le départ du livreur     |
| `prête`       | `livrée`           | Le livreur doit accepter et partir avant de livrer         |
| `livrée`      | `soumise`          | Une commande livrée ne peut pas retourner au début         |
| `annulée`     | tout état actif    | Une commande annulée est définitivement terminée           |
| `archivée`    | tout état actif    | Une commande archivée est immuable                         |

### Règle générale

- Toute tentative de transition interdite doit retourner une erreur explicite.
- Aucune interface ne doit exposer un bouton ou une action permettant
  une transition interdite.

---

## DEP-0564 — États qui peuvent revenir en arrière

### Objectif

Définir les rares cas où une commande peut régresser vers un état antérieur.

### Régressions autorisées

| De            | Vers          | Condition                                              | Qui          |
|---------------|---------------|--------------------------------------------------------|--------------|
| `confirmée`   | `soumise`     | Dépanneur annule sa confirmation (ex. : rupture)       | Dépanneur    |
| `en_préparation` | `confirmée`| Dépanneur remet la préparation en attente              | Dépanneur    |
| `problème`    | `en_route`    | Problème résolu, livreur reprend la livraison          | Dépanneur    |
| `acceptée`    | `prête`       | Livreur libère la commande (ne peut plus la prendre)   | Livreur      |

### Régressions interdites

- Toute régression vers `panier` est interdite une fois la commande soumise.
- Toute régression depuis `livrée`, `payée` ou `archivée` est interdite.
- Une commande `annulée` ne peut jamais revenir à un état actif.

### Règle générale

- Une régression est un cas exceptionnel qui doit être journalisé avec
  le motif et l'identifiant de l'acteur.
- Les régressions ne doivent pas être exposées comme flux normaux dans
  l'interface — elles sont des actions de correction.

---

## DEP-0565 — Événements qui changent un état

### Objectif

Lister les événements système ou utilisateur qui déclenchent une transition
d'état d'une commande.

### Tableau des événements

| Événement                          | État avant         | État après          | Déclencheur              |
|------------------------------------|--------------------|---------------------|--------------------------|
| Client valide son panier           | `panier`           | `soumise`           | Client (boutique / tel)  |
| Paiement en ligne confirmé         | `soumise`          | `payée` (anticipé)  | Système paiement         |
| Dépanneur accepte la commande      | `soumise`          | `confirmée`         | Dépanneur                |
| Dépanneur démarre la préparation   | `confirmée`        | `en_préparation`    | Dépanneur                |
| Dépanneur marque commande prête    | `en_préparation`   | `prête`             | Dépanneur                |
| Livreur appuie sur « J'accepte »   | `prête`            | `acceptée`          | Livreur (DEP-0555)       |
| Livreur appuie sur « Je pars »     | `acceptée`         | `en_route`          | Livreur (DEP-0556)       |
| Livreur appuie sur « Livré »       | `en_route`         | `livrée`            | Livreur (DEP-0557)       |
| Paiement à la livraison confirmé   | `livrée`           | `payée`             | Livreur / Système        |
| Commande annulée (voir DEP-0567)   | tout état éligible | `annulée`           | Client / Dépanneur       |
| Livreur appuie sur « Problème »    | `acceptée`/`en_route` | `problème`       | Livreur (DEP-0558)       |
| Dépanneur clôture après résolution | `livrée` / `annulée` | `archivée`        | Système (automatique)    |

### Règle générale

- Chaque événement est journalisé avec l'horodatage, l'acteur et les états
  avant/après.
- Un événement ne peut déclencher une transition que si l'état actuel est
  celui requis (vérification côté serveur, jamais côté client uniquement).

---

## DEP-0566 — Permissions de changement d'état par rôle

### Objectif

Définir quelle action de transition est autorisée pour chaque rôle dans
le système (client, dépanneur, livreur, système automatique).

### Matrice des permissions

| Transition                          | Client | Dépanneur | Livreur | Système |
|-------------------------------------|:------:|:---------:|:-------:|:-------:|
| `panier` → `soumise`                | ✅     | ❌        | ❌      | ❌      |
| `soumise` → `payée` (en ligne)      | ❌     | ❌        | ❌      | ✅      |
| `soumise` → `confirmée`             | ❌     | ✅        | ❌      | ❌      |
| `confirmée` → `en_préparation`      | ❌     | ✅        | ❌      | ❌      |
| `en_préparation` → `prête`          | ❌     | ✅        | ❌      | ❌      |
| `prête` → `acceptée`                | ❌     | ❌        | ✅      | ❌      |
| `acceptée` → `en_route`             | ❌     | ❌        | ✅      | ❌      |
| `en_route` → `livrée`               | ❌     | ❌        | ✅      | ❌      |
| `livrée` → `payée` (à la livraison) | ❌     | ❌        | ✅      | ✅      |
| tout état éligible → `annulée`      | ✅ *   | ✅ *      | ❌      | ❌      |
| tout état → `problème`              | ❌     | ❌        | ✅      | ❌      |
| `livrée`/`annulée` → `archivée`    | ❌     | ❌        | ❌      | ✅      |

> \* L'annulation est soumise aux conditions définies en DEP-0567.

### Règle générale

- Les permissions sont vérifiées côté serveur à chaque appel API de
  transition d'état.
- Un rôle ne peut jamais déclencher une transition qui ne lui est pas
  autorisée, même par manipulation directe de l'API.

---

## DEP-0567 — Qui peut annuler une commande et quand

### Objectif

Définir précisément les règles d'annulation : qui peut annuler, dans quels
états, et avec quelles conditions.

### Règles d'annulation

| Acteur     | États autorisés pour annuler          | Condition supplémentaire                         |
|------------|---------------------------------------|--------------------------------------------------|
| Client     | `soumise`, `confirmée`                | Avant le début de la préparation (`en_préparation`) |
| Dépanneur  | `soumise`, `confirmée`, `en_préparation`, `prête` | À tout moment avant la prise en charge livreur |
| Livreur    | ❌ Ne peut pas annuler                | Doit utiliser « Problème » (DEP-0558)            |
| Système    | `soumise` (timeout paiement)          | Si le paiement en ligne n'est pas reçu sous X minutes |

### Comportement après annulation

1. La commande passe en état `annulée`.
2. Le client est notifié avec le motif d'annulation.
3. Si un paiement a été encaissé, un remboursement est déclenché
   (hors scope V1 — défini dans un bloc futur).
4. La commande est archivée automatiquement après un délai court.

### États depuis lesquels l'annulation est impossible

- `en_route`, `livrée`, `payée`, `archivée` : l'annulation est interdite.
  Un problème en route doit passer par DEP-0558.

---

## DEP-0568 — Qui peut corriger une commande et quand

### Objectif

Définir qui peut modifier le contenu d'une commande après soumission et
dans quelles conditions.

### Règles de correction

| Acteur     | Type de correction autorisée                   | Condition                                      |
|------------|------------------------------------------------|------------------------------------------------|
| Client     | Modification du panier (ajout, retrait, quantité) | Uniquement en état `panier` (avant soumission) |
| Dépanneur  | Ajout d'une note interne, marquage indisponibilité produit | États `soumise`, `confirmée`, `en_préparation` |
| Livreur    | Aucune correction de contenu                   | Seul le bouton « Problème » est disponible     |
| Système    | Aucune correction automatique de contenu       | —                                              |

### Règle fondamentale

> **Une fois la commande soumise (`soumise`), le client ne peut plus modifier
> son contenu.** Il peut uniquement annuler si les conditions de DEP-0567
> sont remplies.

### Cas particulier — produit indisponible après confirmation

Si le dépanneur constate qu'un produit n'est plus disponible après avoir
confirmé la commande :

1. Il marque le produit comme indisponible dans la commande.
2. Le client est notifié.
3. Le dépanneur peut proposer un substitut (accord client requis en V1 —
   hors scope automatique).
4. Si aucun accord, la commande peut être partiellement annulée ou
   annulée en totalité (DEP-0567).

---

## DEP-0569 — Qui peut confirmer la livraison et quand

### Objectif

Définir qui est autorisé à confirmer qu'une commande a bien été remise
au client et dans quelles conditions.

### Règle

| Acteur  | Peut confirmer la livraison | Condition                                    |
|---------|-----------------------------|----------------------------------------------|
| Livreur | ✅ Oui                      | Commande en état `en_route` — bouton « Livré » (DEP-0557) |
| Client  | ❌ Non (V1)                 | La confirmation par le client est hors scope V1 |
| Dépanneur | ❌ Non                    | Le dépanneur ne confirme pas la livraison     |
| Système | ❌ Non                      | Aucune confirmation automatique de livraison  |

### Comportement

- La confirmation est déclenchée par le livreur via le bouton « Livré »
  (DEP-0557) après dialogue de confirmation.
- Elle est irréversible (passage à `livrée` — voir DEP-0564 pour les
  états qui ne peuvent pas revenir en arrière).
- L'horodatage de confirmation est conservé comme preuve.

---

## DEP-0570 — Qui peut confirmer le paiement à la livraison et quand

### Objectif

Définir qui confirme le paiement lorsque le mode de paiement choisi est
« à la livraison » (cash ou carte au moment de la remise).

### Règle

| Acteur  | Peut confirmer le paiement à la livraison | Condition                               |
|---------|-------------------------------------------|-----------------------------------------|
| Livreur | ✅ Oui                                    | Commande en état `livrée`, mode de paiement = `à la livraison` |
| Système | ✅ Oui (terminal de paiement intégré)     | Si TPE connecté — hors scope V1 simple  |
| Client  | ❌ Non                                    | Le client paie, il ne confirme pas      |
| Dépanneur | ❌ Non                                  | —                                       |

### Comportement

1. Après avoir appuyé sur « Livré » (DEP-0557), si le mode de paiement
   est `à la livraison`, le livreur voit un écran de confirmation de
   paiement.
2. Il confirme que l'espèce ou la carte a été reçue.
3. La commande passe de `livrée` à `payée`.
4. L'horodatage de paiement est enregistré.

### Cas — paiement en ligne (déjà traité)

Si le paiement a été effectué en ligne avant la livraison, la commande
est déjà en état `payée` avant même d'être `livrée`. Après livraison,
elle passe directement à `archivée` sans étape de paiement supplémentaire.

---

## DEP-0571 — Moment exact où le panier cesse d'être modifiable

### Objectif

Définir précisément l'instant à partir duquel le panier du client devient
une commande immuable et ne peut plus être modifié par le client.

### Définition

> **Le panier cesse d'être modifiable au moment exact où le client appuie
> sur « Valider ma commande » et que la requête de soumission est acceptée
> par le serveur.**

### Détail

| Moment                                           | Panier modifiable ? |
|--------------------------------------------------|---------------------|
| Client navigue et ajoute des produits            | ✅ Oui              |
| Client est sur l'écran de récapitulatif          | ✅ Oui              |
| Client appuie sur « Valider » (en cours d'envoi) | ⏳ En attente       |
| Serveur répond 201 Created (`soumise`)           | ❌ Non — définitif  |
| Serveur répond une erreur                        | ✅ Oui — le panier reste actif |

### Règle

- La modification du panier est bloquée côté serveur dès que l'état
  `soumise` est atteint.
- Côté interface, le bouton de modification est désactivé dès la
  soumission réussie.
- En cas d'échec de soumission, le panier reste en état `panier` et
  reste modifiable.

---

## DEP-0572 — Moment exact où le panier devient une commande

### Objectif

Définir le moment exact de la création formelle de la commande dans le système.

### Définition

> **Le panier devient une commande au moment où le serveur crée l'enregistrement
> de commande et retourne un identifiant de commande unique (`order_id`).**

### Détail

| Moment                                           | Statut                    |
|--------------------------------------------------|---------------------------|
| Panier en cours de remplissage                   | Panier — aucune commande  |
| Client soumet — requête en transit               | Transition                |
| Serveur crée la commande → retourne `order_id`   | ✅ Commande créée (`soumise`) |
| Client reçoit la confirmation avec `order_id`    | Commande tracée et notifiée|

### Conséquences immédiates

1. Un `order_id` unique est attribué.
2. La commande est visible dans le tableau de bord du dépanneur.
3. Le panier local est vidé.
4. Le client reçoit une notification de commande reçue.

---

## DEP-0573 — Moment exact où la commande devient une livraison

### Objectif

Définir le moment où une commande se transforme en livraison active,
c'est-à-dire le moment où elle entre dans la responsabilité du livreur.

### Définition

> **La commande devient une livraison active au moment où un livreur appuie
> sur « J'accepte » (DEP-0555) et que la transition vers l'état `acceptée`
> est confirmée par le serveur.**

### Détail

| Moment                                           | Statut               |
|--------------------------------------------------|----------------------|
| Commande en état `prête`                         | Commande — pas de livreur |
| Livreur appuie sur « J'accepte »                 | Transition           |
| Serveur confirme `acceptée` + assigne `driver_id`| ✅ Livraison active  |

### Conséquences immédiates

1. Un `driver_id` est associé à la commande.
2. La commande disparaît de la liste des autres livreurs.
3. Le dépanneur est notifié qu'un livreur a pris la commande.
4. Le livreur voit la commande dans son écran « livraison en cours ».

---

## DEP-0574 — Moment exact où la commande devient une preuve historique

### Objectif

Définir le moment où une commande est définitivement archivée et ne peut
plus être modifiée — elle devient une entrée immuable dans l'historique.

### Définition

> **La commande devient une preuve historique au moment où le système la
> fait passer à l'état `archivée`, après que toutes les actions de clôture
> ont été effectuées (livraison confirmée, paiement confirmé, délai de
> réclamation écoulé).**

### Conditions d'archivage automatique (V1)

| Condition                                        | Délai après confirmation    |
|--------------------------------------------------|-----------------------------|
| Commande `livrée` + `payée`                      | Archivage immédiat en V1    |
| Commande `annulée`                               | Archivage immédiat en V1    |

> En V1, le délai de réclamation post-livraison est hors scope.
> L'archivage est immédiat après la clôture du flux.

### Conséquences de l'archivage

1. La commande passe en état `archivée` — immuable.
2. Elle est conservée indéfiniment dans l'historique (client, dépanneur,
   livreur).
3. Aucune action (modification, annulation, transition) n'est possible.
4. Elle sert de référence légale et opérationnelle pour les litiges futurs.
5. Les données sont conservées selon la politique de rétention définie
   (hors scope V1 — à définir dans un bloc futur).
