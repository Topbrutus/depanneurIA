# DEP-0535 à DEP-0554 — Actions et écrans du livreur

## Périmètre

Ce document définit les **actions disponibles côté livreur** lors de la
remise d'une commande (DEP-0535–DEP-0542), les **logiques métier** liées
au statut, à la disponibilité et à l'assignation du livreur
(DEP-0543–DEP-0550), ainsi que les **écrans de l'application mobile du
livreur** (DEP-0551–DEP-0554).

Ces décisions s'appuient sur les interfaces et fiches livreur définies dans
les blocs précédents (DEP-0521–DEP-0534), les statuts de commande
(DEP-0192–DEP-0196) et le modèle de rôle utilisateur.

Il s'agit exclusivement de **documentation** : aucun code produit, aucune
implémentation. Les spécifications décrites ici serviront de référence pour
les futures implémentations front-end et back-end.

> **Convention** : les noms de champs de base de données (horodatages,
> montants) sont en anglais snake_case (`delivered_at`, `paid_at`, etc.)
> conformément aux pratiques standard des ORM et aux conventions SQL
> courantes. Les identifiants de statut métier sont en français snake_case
> (`en_livraison`, `paiement_a_la_livraison`, etc.).

---

## DEP-0535 — Action remise effectuée

### Objectif

Définir le comportement de l'action que le livreur déclenche lorsqu'il a
remis la commande en mains propres au client.

### Déclencheur

Bouton « Remise effectuée » dans l'écran « Livraison en cours »
(DEP-0553), disponible uniquement lorsque le statut de la livraison est
`en_cours_de_livraison`.

### Comportement

| Étape | Action                                                                              |
|-------|-------------------------------------------------------------------------------------|
| 1     | Clic sur « Remise effectuée »                                                       |
| 2     | Toast de confirmation non bloquant : « Livraison confirmée »                        |
| 3     | Statut de la livraison passe à `livree`                                             |
| 4     | Statut de la commande passe à `livree` (DEP-0194)                                  |
| 5     | Notification envoyée au client : « Votre commande a bien été livrée »              |
| 6     | La livraison quitte l'écran « En cours » et bascule vers « Historique »            |
| 7     | Si paiement à la livraison non encore marqué → invite à confirmer le paiement       |

### Conditions

- L'action est disponible **uniquement** si le statut est
  `en_cours_de_livraison`.
- Si le livreur n'a pas encore confirmé le paiement (DEP-0538), une invite
  s'affiche avant de finaliser.
- L'action est **irréversible** en V1.

### Feedback visuel

| Moment                | Feedback                                             |
|-----------------------|------------------------------------------------------|
| Clic                  | Bouton en état chargement (spinner, 500 ms max)      |
| Succès                | Toast vert « Livraison #[ID] confirmée »             |
| Erreur réseau         | Toast rouge « Erreur — réessaie »                    |

### Règles

- La remise effectuée déclenche le calcul de la rémunération du livreur
  pour cette livraison (V2).
- L'heure exacte de la remise est enregistrée en base comme
  `delivered_at`.

---

## DEP-0536 — Action client absent

### Objectif

Définir le comportement de l'action que le livreur déclenche lorsqu'il
arrive à l'adresse de livraison et que le client ne répond pas.

### Déclencheur

Bouton « Client absent » dans l'écran « Livraison en cours » (DEP-0553),
disponible lorsque le statut est `en_cours_de_livraison`.

### Comportement

| Étape | Action                                                                              |
|-------|-------------------------------------------------------------------------------------|
| 1     | Clic sur « Client absent »                                                          |
| 2     | Modal de confirmation avec indication du temps d'attente recommandé (2 min)         |
| 3     | Confirmation → statut passe à `client_absent`                                       |
| 4     | Notification automatique envoyée au client : « Votre livreur est à votre porte »   |
| 5     | Chronomètre d'attente affiché (2 minutes par défaut)                               |
| 6     | Après expiration → nouvelles options proposées au livreur (retour ou second essai) |

### Options après le délai d'attente

| Option                  | Action                                              |
|-------------------------|-----------------------------------------------------|
| Retenter la sonnette    | Réinitialise le chronomètre, envoie un second SMS   |
| Retour au dépanneur     | Déclenche DEP-0537                                  |

### Feedback visuel

| Moment          | Feedback                                                   |
|-----------------|------------------------------------------------------------|
| Confirmation    | Chronomètre visible dans l'écran, notification client     |
| Fin du délai    | Alerte sonore discrète + options présentées au livreur    |

### Règles

- Le nombre maximum de tentatives est de **2** avant que le retour soit
  obligatoire.
- L'événement `client_absent` est horodaté et enregistré dans le journal
  de la commande.

---

## DEP-0537 — Action retour au dépanneur

### Objectif

Définir le comportement de l'action que le livreur déclenche pour indiquer
qu'il retourne au dépanneur avec la commande non remise.

### Déclencheur

Bouton « Retour au dépanneur » dans l'écran « Livraison en cours »
(DEP-0553), disponible après l'action « Client absent » (DEP-0536) ou
depuis le menu contextuel de la fiche livraison.

### Comportement

| Étape | Action                                                                              |
|-------|-------------------------------------------------------------------------------------|
| 1     | Clic sur « Retour au dépanneur »                                                    |
| 2     | Modal de confirmation : « Confirmer le retour avec la commande ? »                  |
| 3     | Confirmation → statut passe à `retour_en_cours`                                     |
| 4     | Notification envoyée au client : « Nous n'avons pas pu vous livrer… »              |
| 5     | Notification envoyée au dépanneur : « Retour en cours — commande #[ID] »           |
| 6     | La fiche livraison passe en mode « retour » dans l'écran en cours                  |

### Conditions

- L'action est disponible uniquement après au moins une tentative de
  livraison.
- Elle est irréversible une fois confirmée — la commande passe en logique
  de retour (DEP-0549).

### Feedback visuel

| Moment          | Feedback                                              |
|-----------------|-------------------------------------------------------|
| Confirmation    | Toast orange « Retour enregistré »                    |
| Erreur réseau   | Toast rouge « Erreur — réessaie »                     |

### Règles

- L'heure de déclenchement du retour est enregistrée comme `return_at`.
- Le motif (client absent, refus du client, adresse introuvable) peut être
  sélectionné dans le modal (optionnel en V1).

---

## DEP-0538 — Action marquer payé à la livraison

### Objectif

Définir l'action que le livreur effectue pour confirmer qu'il a encaissé
le paiement en espèces (ou autre mode de paiement à la livraison) auprès
du client.

### Déclencheur

Bouton « Marquer payé » dans l'écran « Livraison en cours » (DEP-0553),
visible uniquement si le mode de paiement de la commande est
`paiement_a_la_livraison`.

### Comportement

| Étape | Action                                                                              |
|-------|-------------------------------------------------------------------------------------|
| 1     | Clic sur « Marquer payé »                                                           |
| 2     | Confirmation rapide : affichage du montant total à encaisser                        |
| 3     | Confirmation → statut paiement passe à `payé`                                      |
| 4     | Enregistrement de l'heure et du montant encaissé                                   |
| 5     | Invitation à finaliser la remise (DEP-0535) si ce n'est pas encore fait            |

### Conditions

- Action disponible **uniquement** si le mode de paiement est
  `paiement_a_la_livraison`.
- Le montant affiché est le total TTC de la commande (DEP-0492).
- En V1, pas de saisie de montant libre — le livreur confirme uniquement
  avoir reçu la somme exacte.

### Feedback visuel

| Moment        | Feedback                                         |
|---------------|--------------------------------------------------|
| Confirmation  | Indicateur vert « Paiement confirmé »            |
| Erreur réseau | Toast rouge « Erreur — réessaie »                |

### Règles

- L'action de marquage du paiement est indépendante de la remise effectuée
  (DEP-0535), mais les deux doivent être complètes pour clôturer la
  livraison.
- L'événement est enregistré dans le journal de la commande avec
  `paid_at` et `paid_amount`.

---

## DEP-0539 — Action marquer problème de paiement

### Objectif

Définir l'action que le livreur déclenche lorsqu'il ne parvient pas à
encaisser le paiement (client sans espèces, refus de payer, montant
insuffisant).

### Déclencheur

Bouton « Problème de paiement » dans l'écran « Livraison en cours »
(DEP-0553), visible uniquement si le mode de paiement est
`paiement_a_la_livraison`.

### Comportement

| Étape | Action                                                                              |
|-------|-------------------------------------------------------------------------------------|
| 1     | Clic sur « Problème de paiement »                                                   |
| 2     | Modal avec sélection du motif (obligatoire)                                         |
| 3     | Confirmation → statut paiement passe à `incident_paiement`                         |
| 4     | Notification envoyée au dépanneur : « Incident paiement — commande #[ID] »         |
| 5     | Le livreur peut choisir de retourner au dépanneur (DEP-0537)                       |

### Motifs disponibles

| Motif                       | Identifiant               |
|-----------------------------|---------------------------|
| Client sans espèces         | `client_sans_especes`     |
| Montant insuffisant         | `montant_insuffisant`     |
| Refus de payer              | `refus_paiement`          |
| Autre                       | `autre` + texte libre     |

### Feedback visuel

| Moment          | Feedback                                               |
|-----------------|--------------------------------------------------------|
| Confirmation    | Toast orange « Incident paiement enregistré »          |
| Erreur réseau   | Toast rouge « Erreur — réessaie »                      |

### Règles

- Le motif est obligatoire — le bouton de confirmation est désactivé tant
  qu'aucun motif n'est sélectionné.
- L'incident est horodaté et enregistré dans le journal de la commande.
- En V1, la résolution de l'incident (remboursement, relance) est gérée
  hors de l'application.

---

## DEP-0540 — Action appeler le client

### Objectif

Définir l'action permettant au livreur de contacter le client par téléphone
directement depuis son interface, sans avoir à mémoriser le numéro.

### Déclencheur

Bouton « Appeler » (icône téléphone) dans la fiche livraison ou dans
l'écran « Livraison en cours » (DEP-0553).

### Comportement

| Étape | Action                                                                       |
|-------|------------------------------------------------------------------------------|
| 1     | Clic sur le bouton « Appeler »                                               |
| 2     | L'application ouvre l'application téléphone native avec le numéro pré-rempli |
| 3     | Le livreur confirme l'appel depuis l'application téléphone native            |

### Conditions

- Le numéro de téléphone client est masqué partiellement dans l'affichage
  (ex. : `+1 514 XXX-4567`) mais composé en intégralité lors du clic.
- L'action est disponible **pour toutes les livraisons actives**, quel que
  soit le statut.

### Règles

- En V1, l'appel est direct (non masqué). Un proxy téléphonique (numéro
  intermédiaire) pourra être envisagé en V2 pour protéger la vie privée des
  deux parties.
- L'événement « appel initié » peut être enregistré dans le journal de la
  commande à titre informatif (optionnel en V1).

---

## DEP-0541 — Action ouvrir la navigation externe

### Objectif

Définir l'action permettant au livreur d'ouvrir l'application de navigation
GPS de son choix avec l'adresse de livraison pré-remplie.

### Déclencheur

Bouton « Naviguer » (icône carte / GPS) dans la fiche livraison ou dans
l'écran « Livraison en cours » (DEP-0553).

### Comportement

| Étape | Action                                                                              |
|-------|-------------------------------------------------------------------------------------|
| 1     | Clic sur « Naviguer »                                                               |
| 2     | Sélecteur d'application GPS si plusieurs applications détectées (Google Maps,       |
|       | Apple Plans, Waze, etc.), sinon ouverture directe dans l'application par défaut    |
| 3     | L'adresse complète de livraison est passée en paramètre de l'URL de navigation     |

### Format d'URL

| Plateforme  | URL de navigation                                        |
|-------------|----------------------------------------------------------|
| Universel   | `https://maps.google.com/?q=[adresse encodée]`           |
| iOS natif   | `maps://?q=[adresse encodée]`                            |
| Android     | `geo:0,0?q=[adresse encodée]`                            |

### Conditions

- L'adresse utilisée est l'adresse de livraison principale de la commande
  (numéro, rue, ville, code postal).
- L'action est disponible pour toutes les livraisons actives.

### Règles

- L'application depaneurIA n'intègre **pas** de navigation interne en V1.
- L'adresse est encodée en URL avant d'être passée à l'application externe
  (remplacement des espaces par `+` ou `%20`).

---

## DEP-0542 — Action prendre une preuve simple si utile

### Objectif

Définir l'action optionnelle permettant au livreur de photographier la
preuve de dépôt ou de remise d'une commande (boîte aux lettres, seuil de
porte, remise en mains propres avec signature).

### Déclencheur

Bouton « Preuve » (icône appareil photo) dans l'écran « Livraison en
cours » (DEP-0553). L'action est **optionnelle** en V1.

### Comportement

| Étape | Action                                                                       |
|-------|------------------------------------------------------------------------------|
| 1     | Clic sur « Preuve »                                                          |
| 2     | Ouverture de l'appareil photo natif du téléphone                             |
| 3     | Prise de photo ou sélection depuis la galerie                                |
| 4     | Miniature de confirmation affichée dans la fiche                             |
| 5     | Photo liée à la livraison et enregistrée côté serveur (stockage sécurisé)   |

### Conditions

- La photo est compressée côté client avant envoi (qualité maximale : 80 %,
  largeur maximale : 1 200 px) pour limiter la consommation de données
  mobiles.
- La prise de preuve est **optionnelle** : elle n'est pas requise pour
  finaliser la remise (DEP-0535) en V1.

### Règles

- La photo est associée à l'ID de la livraison et à l'horodatage.
- En cas de litige, la preuve est consultable par le dépanneur depuis la
  fiche détail de la commande.
- La rétention des photos est de **30 jours** par défaut.
- La fonctionnalité est activable/désactivable par le dépanneur dans ses
  paramètres.

---

## DEP-0543 — Logique de suivi temps réel du livreur (si utile plus tard)

### Objectif

Documenter la logique de géolocalisation en temps réel du livreur, à
activer en V2 si le besoin opérationnel est confirmé.

### Statut en V1

**Non implémentée.** La géolocalisation temps réel du livreur est hors
périmètre V1. Ce DEP documente les prérequis et contraintes pour une
activation future.

### Principes retenus pour V2

| Aspect                 | Principe                                                              |
|------------------------|-----------------------------------------------------------------------|
| Signal GPS             | Position GPS du téléphone du livreur, mise à jour toutes les 10–30 s |
| Visibilité             | Position visible par le dépanneur, optionnellement par le client      |
| Consentement           | Le livreur doit consentir explicitement à la géolocalisation          |
| Désactivation          | Le livreur peut désactiver la géolocalisation entre les livraisons    |
| Stockage               | Coordonnées horodatées, rétention limitée (24 h après livraison)      |

### Contraintes techniques

- Nécessite une connexion WebSocket ou un canal de mise à jour en temps
  réel (ex. : Supabase Realtime, Firebase RTDB).
- Consommation batterie à minimiser : utiliser la précision « low power »
  quand le livreur n'est pas en déplacement actif.
- Les données de géolocalisation sont des données personnelles sensibles
  (RGPD / Loi 25 Québec) — traitement et rétention encadrés.

### Règle

Ce DEP ne génère **aucun code** en V1. Il servira de référence dès que
la géolocalisation sera priorisée dans la feuille de route.

---

## DEP-0544 — Logique de statut du livreur

### Objectif

Définir les statuts possibles d'un livreur et les transitions entre ces
statuts.

### Statuts

| Statut             | Identifiant          | Description                                          |
|--------------------|----------------------|------------------------------------------------------|
| Disponible         | `disponible`         | Connecté, prêt à recevoir une livraison              |
| En livraison       | `en_livraison`       | Actuellement en train d'effectuer une livraison      |
| Indisponible       | `indisponible`       | Connecté mais ne souhaite pas recevoir de livraison  |
| Déconnecté         | `deconnecte`         | Hors ligne ou session expirée                        |

### Transitions de statut

```
disponible ──── assignation ───→ en_livraison
en_livraison ── remise/retour ──→ disponible
disponible ──── pause manuelle ─→ indisponible
indisponible ── reprise ────────→ disponible
[tout statut] ─ déconnexion ────→ deconnecte
```

### Règles

- Le livreur peut passer manuellement entre `disponible` et
  `indisponible` depuis son tableau de bord.
- Le passage à `en_livraison` est automatique lors de l'assignation
  d'une livraison.
- Le retour à `disponible` est automatique après confirmation de la
  remise (DEP-0535) ou du retour (DEP-0537).
- Un livreur en statut `deconnecte` ne reçoit aucune assignation.
- En V1, un seul livreur peut être `en_livraison` sur une même commande.

---

## DEP-0545 — Logique de disponibilité du livreur

### Objectif

Définir comment le système détermine et met à jour la disponibilité d'un
livreur.

### Sources de disponibilité

| Source                        | Effet                                               |
|-------------------------------|-----------------------------------------------------|
| Connexion active à l'app      | Passe à `disponible` (si pas déjà `indisponible`)   |
| Déconnexion ou session expirée| Passe à `deconnecte`                                |
| Pause manuelle du livreur     | Passe à `indisponible`                              |
| Reprise manuelle              | Passe à `disponible`                                |
| Assignation automatique       | Passe à `en_livraison`                              |
| Fin de livraison              | Passe à `disponible`                                |

### Règles

- La disponibilité est **recalculée** à chaque changement d'état de la
  session du livreur ou d'une livraison.
- Un livreur `indisponible` n'est **pas** proposé à l'algorithme
  d'assignation automatique (DEP-0546).
- En V1, la disponibilité est **booléenne** : disponible ou non disponible.
  Des plages horaires de disponibilité pourront être définies en V2.
- La disponibilité est **visible** par le dépanneur dans le tableau de bord
  des livreurs.

---

## DEP-0546 — Logique d'assignation automatique simple

### Objectif

Définir l'algorithme simple d'assignation automatique d'une commande à
un livreur disponible.

### Déclencheur

Une commande passe au statut `prete_pour_livraison` (DEP-0487) et au
moins un livreur est disponible.

### Algorithme V1

| Priorité | Critère                                             |
|----------|-----------------------------------------------------|
| 1        | Livreur en statut `disponible`                      |
| 2        | Livreur avec le moins de livraisons en cours (= 0) |
| 3        | Premier connecté (FIFO sur la disponibilité)        |

### Comportement

| Étape | Action                                                                              |
|-------|-------------------------------------------------------------------------------------|
| 1     | Système identifie les livreurs `disponibles`                                        |
| 2     | Sélection selon l'algorithme ci-dessus                                              |
| 3     | Proposition de livraison envoyée au livreur sélectionné (notification push)         |
| 4     | Le livreur a **2 minutes** pour accepter ou refuser                                 |
| 5     | Si refus ou délai dépassé → passage au livreur suivant dans la liste                |
| 6     | Si aucun livreur disponible → la commande reste dans la file (DEP-0487)             |

### Conditions

- En V1, l'algorithme **ne tient pas compte** de la distance géographique
  (nécessiterait la géolocalisation — DEP-0543).
- L'assignation automatique est **désactivable** par le dépanneur au profit
  de l'assignation manuelle (DEP-0547).

### Règles

- La tentative d'assignation est enregistrée dans le journal de la
  commande (livreur ciblé, heure, résultat).
- Si l'assignation échoue après avoir épuisé tous les livreurs disponibles,
  le dépanneur est notifié.

---

## DEP-0547 — Logique d'assignation manuelle simple

### Objectif

Définir le processus par lequel le dépanneur assigne manuellement une
commande à un livreur.

### Déclencheur

Le dépanneur clique sur « Assigner un livreur » dans la fiche commande
(statut `prete_pour_livraison`).

### Comportement

| Étape | Action                                                                              |
|-------|-------------------------------------------------------------------------------------|
| 1     | Le dépanneur ouvre le sélecteur de livreur dans la fiche commande                  |
| 2     | Liste des livreurs disponibles affichée (nom, statut, livraisons en cours)         |
| 3     | Sélection d'un livreur dans la liste                                                |
| 4     | Confirmation → assignation enregistrée                                              |
| 5     | Notification envoyée au livreur sélectionné                                         |
| 6     | Statut de la commande passe à `en_livraison`                                        |
| 7     | Statut du livreur passe à `en_livraison`                                            |

### Conditions

- Le dépanneur peut assigner **n'importe quel livreur** dans la liste,
  qu'il soit `disponible` ou `indisponible` (avec avertissement si
  `indisponible`).
- L'assignation manuelle **prend le pas** sur l'algorithme automatique.

### Affichage du sélecteur

| Colonne      | Contenu                                                         |
|--------------|-----------------------------------------------------------------|
| Nom          | Prénom + nom du livreur                                         |
| Statut       | Badge coloré (disponible / indisponible / en livraison)         |
| En cours     | Nombre de livraisons actives                                    |

### Règles

- L'assignation manuelle est enregistrée avec le nom du dépanneur qui l'a
  effectuée et l'heure d'assignation.
- Si le livreur refuse la livraison assignée manuellement, le dépanneur
  est notifié pour réassigner.

---

## DEP-0548 — Logique d'échec de livraison

### Objectif

Définir le processus métier déclenché lorsqu'une livraison ne peut pas
être finalisée (client absent, refus de payer, adresse introuvable, etc.).

### Déclencheur

Le livreur déclenche « Client absent » (DEP-0536), « Problème de
paiement » (DEP-0539) ou « Retour au dépanneur » (DEP-0537).

### Statuts d'échec

| Situation                  | Statut livraison         | Statut commande   |
|----------------------------|--------------------------|-------------------|
| Client absent (timeout)    | `echec_client_absent`    | `probleme`        |
| Problème de paiement       | `echec_paiement`         | `probleme`        |
| Adresse introuvable        | `echec_adresse`          | `probleme`        |
| Retour déclenché           | `retour_en_cours`        | `retour_en_cours` |

### Comportement après l'échec

| Étape | Action                                                                              |
|-------|-------------------------------------------------------------------------------------|
| 1     | Statut de livraison mis à jour                                                      |
| 2     | Notification au dépanneur avec le motif d'échec                                    |
| 3     | Notification au client (message adapté au motif, DEP-0196)                         |
| 4     | La commande passe dans la file « Problèmes » (DEP-0490) côté dépanneur             |
| 5     | Livreur revient à `disponible` après dépôt de la commande si retour               |

### Règles

- En V1, la résolution d'un échec de livraison est gérée manuellement
  par le dépanneur.
- L'incident est enregistré dans le journal de la commande avec le motif
  et l'heure.
- Un historique des incidents de livraison est conservé par livreur
  (accessible en V2 dans les statistiques).

---

## DEP-0549 — Logique de retour de commande

### Objectif

Définir le flux métier complet lorsqu'un livreur retourne une commande non
remise au dépanneur.

### Déclencheur

Action « Retour au dépanneur » (DEP-0537) confirmée.

### Flux de retour

| Étape | Action                                                                              |
|-------|-------------------------------------------------------------------------------------|
| 1     | Statut livraison passe à `retour_en_cours`                                          |
| 2     | Le livreur transporte la commande vers le dépanneur                                 |
| 3     | À l'arrivée, le livreur clique sur « Retour déposé »                               |
| 4     | Statut livraison passe à `retour_depose`                                            |
| 5     | Statut commande passe à `retournee`                                                 |
| 6     | Notification au dépanneur : « Retour déposé — commande #[ID] »                     |
| 7     | Statut livreur repasse à `disponible`                                               |

### Conditions

- Le bouton « Retour déposé » n'est disponible qu'après confirmation du
  retour (DEP-0537).
- En V1, le dépanneur gère manuellement le remboursement ou la
  replanification de la commande retournée.

### Règles

- L'heure de dépôt du retour est enregistrée comme `returned_at`.
- Le motif du retour (issu de DEP-0537) est conservé dans le journal de
  la commande.
- Le dépanneur visualise les retours dans la file « Problèmes » (DEP-0490).

---

## DEP-0550 — Logique de remise réussie

### Objectif

Définir le flux métier complet déclenché lorsqu'une livraison est finalisée
avec succès.

### Déclencheur

Action « Remise effectuée » (DEP-0535) confirmée.

### Flux de clôture

| Étape | Action                                                                              |
|-------|-------------------------------------------------------------------------------------|
| 1     | Statut livraison passe à `livree`                                                   |
| 2     | Statut commande passe à `livree` (DEP-0194)                                         |
| 3     | Heure de remise enregistrée (`delivered_at`)                                        |
| 4     | Notification client : « Votre commande a bien été livrée »                         |
| 5     | Si paiement à la livraison → vérification du marquage paiement (DEP-0538)          |
| 6     | Livreur repassé à `disponible` (DEP-0544)                                           |
| 7     | La livraison bascule dans l'historique du livreur (DEP-0554)                       |
| 8     | Statistiques de livraison mises à jour (durée totale, distance si V2)              |

### Règles

- Une commande en statut `livree` est en **lecture seule** — aucune action
  supplémentaire n'est possible sauf consultation.
- Les données de la livraison réussie sont conservées **30 jours** dans
  l'historique actif, puis archivées.
- La remise réussie est le seul chemin qui déclenche la rémunération du
  livreur pour cette livraison (V2).

---

## DEP-0551 — Application ou vue mobile du livreur

### Objectif

Définir l'application ou la vue dédiée au livreur, accessible sur téléphone
mobile, depuis laquelle il gère l'ensemble de son activité de livraison.

### Format technique

En V1, il s'agit d'une **PWA (Progressive Web App)** accessible depuis le
navigateur mobile du livreur, sans installation sur les stores. Une
application native (iOS / Android) pourra être envisagée en V2.

### Points d'entrée

| Chemin              | Description                                              |
|---------------------|----------------------------------------------------------|
| `/livreur`          | Tableau de bord principal du livreur (redirige selon statut) |
| `/livreur/livraisons` | Écran « Livraisons à faire » (DEP-0552)              |
| `/livreur/en-cours` | Écran « Livraison en cours » (DEP-0553)                  |
| `/livreur/historique` | Écran « Historique du livreur » (DEP-0554)           |

### Accès et authentification

- L'accès est réservé aux utilisateurs avec le rôle `livreur` ou `admin`.
- La session est maintenue active tant que le livreur est connecté.
- Déconnexion automatique après **4 heures** d'inactivité.

### Caractéristiques générales de l'interface

| Aspect             | Valeur                                                         |
|--------------------|----------------------------------------------------------------|
| Orientation        | Portrait (principale), paysage supporté                        |
| Navigation         | Barre de navigation basse (tabs) : À faire / En cours / Historique |
| Thème              | Identique au design system V1 (DEP-0201–DEP-0210)             |
| Taille des cibles  | Boutons d'action ≥ 48 × 48 px (accessibilité mobile)          |
| Notifications push | Activées via la PWA pour les nouvelles assignations            |

### Règles

- Toutes les actions critiques (remise, retour, paiement) doivent être
  réalisables **en une à deux interactions maximum** depuis l'écran
  principal.
- L'interface doit fonctionner avec une connectivité réseau limitée
  (3G) ; les dégradations de service sont signalées clairement.

---

## DEP-0552 — Écran « Livraisons à faire »

### Objectif

Définir le contenu et le comportement de l'écran listant les livraisons
disponibles ou assignées que le livreur doit effectuer.

### Structure de l'écran

| Zone          | Contenu                                                              |
|---------------|----------------------------------------------------------------------|
| Header        | Logo, nom du livreur, indicateur de statut (disponible / indisponible) |
| Bascule statut| Toggle « Disponible / Indisponible » (DEP-0545)                     |
| Liste         | Cartes de livraison à effectuer, triées par heure de préparation     |
| Vide          | Message « Aucune livraison en attente » si la liste est vide         |

### Carte de livraison

| Élément          | Contenu                                                       |
|------------------|---------------------------------------------------------------|
| ID commande      | `#CMD-AAAAMMJJ-NNN`                                           |
| Adresse          | Rue + ville (adresse complète au clic)                        |
| Nombre d'articles| N article(s)                                                  |
| Mode de paiement | Icône paiement + libellé (à la livraison / prépayé)           |
| Temps écoulé     | Durée depuis préparation (mis à jour en temps réel)           |
| Actions rapides  | Bouton « Accepter » / « Refuser » si assignation automatique  |

### Comportement

- La liste est actualisée en temps réel (nouvelle assignation → carte
  apparaît automatiquement).
- Un clic sur une carte ouvre la fiche détail de la livraison.
- Le livreur peut accepter ou refuser une livraison directement depuis
  la carte (DEP-0531, DEP-0532).

### Règles

- En V1, un livreur ne peut traiter qu'**une livraison à la fois**.
- Si le livreur est `indisponible`, la liste affiche un bandeau
  « Vous êtes indisponible — activez votre disponibilité pour recevoir
  des livraisons ».

---

## DEP-0553 — Écran « Livraison en cours »

### Objectif

Définir le contenu et le comportement de l'écran principal du livreur
pendant qu'il effectue une livraison active.

### Structure de l'écran

| Zone           | Contenu                                                               |
|----------------|-----------------------------------------------------------------------|
| Header         | ID commande + statut courant (badge coloré)                           |
| Fiche client   | Nom, adresse de livraison, notes de livraison, téléphone (clic = appel) |
| Résumé commande| Liste abrégée des articles (N articles — total TTC)                   |
| Mode paiement  | Libellé + montant à encaisser si paiement à la livraison              |
| Zone d'actions | Boutons d'action contextuels (voir tableau ci-dessous)                |
| Navigation     | Bouton « Naviguer » (DEP-0541) toujours visible                       |

### Actions contextuelles par statut

| Statut courant         | Actions disponibles                                                 |
|------------------------|---------------------------------------------------------------------|
| `en_livraison`         | Appeler (DEP-0540), Naviguer (DEP-0541), Client absent (DEP-0536)  |
| `en_livraison`         | Remise effectuée (DEP-0535), Marquer payé (DEP-0538) si applicable |
| `client_absent`        | Retenter, Retour au dépanneur (DEP-0537)                           |
| `retour_en_cours`      | Retour déposé (DEP-0549)                                           |

### Bouton de preuve

Bouton « Preuve » (DEP-0542) disponible à tout moment pendant la
livraison active.

### Règles

- Cet écran est **uniquement accessible** lorsqu'une livraison est en
  statut actif (`en_livraison`, `client_absent`, `retour_en_cours`).
- Les boutons d'action critiques (« Remise effectuée », « Retour ») sont
  dimensionnés pour une utilisation aisée sur téléphone (`min-height: 56px`).
- Si aucune livraison n'est en cours, l'écran redirige automatiquement
  vers « Livraisons à faire » (DEP-0552).

---

## DEP-0554 — Écran « Historique du livreur »

### Objectif

Définir le contenu et le comportement de l'écran permettant au livreur
de consulter l'historique de ses livraisons passées.

### Structure de l'écran

| Zone       | Contenu                                                                    |
|------------|----------------------------------------------------------------------------|
| Header     | Titre « Historique » + filtre par période (aujourd'hui / 7 j / 30 j)      |
| Résumé     | Nombre de livraisons effectuées + total remis pour la période sélectionnée |
| Liste      | Cartes de livraisons passées, triées par date décroissante                 |
| Vide       | Message « Aucune livraison pour cette période » si la liste est vide       |

### Carte de livraison passée

| Élément            | Contenu                                                     |
|--------------------|-------------------------------------------------------------|
| ID commande        | `#CMD-AAAAMMJJ-NNN`                                         |
| Date et heure      | Date + heure de remise                                      |
| Adresse            | Rue + ville                                                 |
| Statut final       | Badge : « Livrée », « Retournée », « Incident »             |
| Paiement           | Montant encaissé (si paiement à la livraison)               |

### Comportement

- Un clic sur une carte ouvre la fiche détail de la livraison (lecture
  seule).
- Les livraisons en statut `retournee` ou `incident_*` sont affichées
  avec un badge coloré distinctif (orange ou rouge).
- La période peut être filtrée via un sélecteur en haut de l'écran.

### Règles

- L'historique est en **lecture seule** — aucune action n'est possible
  depuis cet écran.
- Les données sont conservées **30 jours** dans la vue active ; au-delà,
  elles sont archivées et non visibles par le livreur en V1.
- En V2, un export CSV de l'historique pourra être proposé.

---

## Synthèse du bloc DEP-0535–DEP-0554

| DEP      | Sujet                              | Décision clé                                                              |
|----------|------------------------------------|---------------------------------------------------------------------------|
| DEP-0535 | Action remise effectuée            | Irréversible, clôture livraison, notifie client, vérifie paiement         |
| DEP-0536 | Action client absent               | Modal + chrono 2 min, 2 tentatives max, options retenter/retour           |
| DEP-0537 | Action retour au dépanneur         | Modal obligatoire, motif optionnel V1, notifie dépanneur et client        |
| DEP-0538 | Action marquer payé à la livraison | Confirmation du montant exact, événement `paid_at` enregistré             |
| DEP-0539 | Action marquer problème paiement   | Motif obligatoire, notifie dépanneur, incident enregistré                 |
| DEP-0540 | Action appeler le client           | Ouverture app téléphone native, numéro masqué à l'affichage               |
| DEP-0541 | Action navigation externe          | Deep link vers GPS natif (Google Maps / Apple Plans / Waze)               |
| DEP-0542 | Action preuve simple               | Photo optionnelle, compression 80 %, rétention 30 j, liée à la livraison  |
| DEP-0543 | Suivi temps réel livreur           | Hors périmètre V1 — prérequis documentés pour activation V2              |
| DEP-0544 | Statut du livreur                  | 4 statuts (disponible / en_livraison / indisponible / deconnecte)         |
| DEP-0545 | Disponibilité du livreur           | Calculée dynamiquement selon session et état des livraisons               |
| DEP-0546 | Assignation automatique simple     | FIFO sur disponibilité, délai 2 min pour accepter, rotation si refus      |
| DEP-0547 | Assignation manuelle simple        | Sélecteur dépanneur, avertissement si livreur indisponible                |
| DEP-0548 | Logique d'échec de livraison       | Statuts distincts selon motif, file Problèmes côté dépanneur              |
| DEP-0549 | Logique de retour de commande      | Flux retour_en_cours → retour_depose, bouton « Retour déposé »            |
| DEP-0550 | Logique de remise réussie          | Clôture complète : statuts, notifications, disponibilité livreur          |
| DEP-0551 | App/vue mobile livreur             | PWA V1, 4 routes, tabs basse navigation, session 4 h                     |
| DEP-0552 | Écran « Livraisons à faire »       | Liste temps réel, toggle disponibilité, cartes accept/refus rapide        |
| DEP-0553 | Écran « Livraison en cours »       | Actions contextuelles par statut, navigation toujours visible             |
| DEP-0554 | Écran « Historique du livreur »    | Lecture seule, filtres période, rétention 30 j, badge statut final        |
