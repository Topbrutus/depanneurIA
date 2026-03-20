# DEP-0495 à DEP-0514 — Actions et tableau de réception dépanneur

## Périmètre

Ce document complète la réception des commandes côté dépanneur (DEP-0481 à
DEP-0494) en détaillant les **actions opérationnelles** et la **logique du
tableau de bord** pour les commandes en préparation, prêtes, problématiques
ou en livraison. Il couvre les actions de suivi (préparation, assignation,
annulation, modifications, paiement), la logique de priorité, les horodatages
et le journal d’activité. Documentation uniquement, aucun code produit.

---

## DEP-0495 — Action marquer en préparation

### Objectif

Confirmer le démarrage effectif de la préparation et démarrer les métriques de
suivi (SLA, chronos internes).

### Déclencheur

- Bouton « En préparation » visible sur les commandes **acceptées** (statut
  `en_preparation`), depuis la fiche détail (DEP-0492) et la ligne de liste.

### Comportement

| Étape | Action                                                                                 |
| ----- | -------------------------------------------------------------------------------------- |
| 1     | Clic sur « En préparation »                                                            |
| 2     | Statut reste `en_preparation`, mais le champ `preparation_start_at` est posé si absent |
| 3     | Chrono de préparation passe à l’état actif (affiché dans la fiche et la liste)         |
| 4     | Entrée ajoutée au journal d’activité (DEP-0510)                                        |

### Règles

- Action disponible uniquement si la commande est en `en_preparation` et que
  `preparation_start_at` est vide.
- Aucune modal bloquante ; feedback via toast vert « Préparation lancée ».
- Si l’action échoue (perte réseau) : toast rouge, aucune donnée écrite.

---

## DEP-0496 — Action marquer prête

### Objectif

Basculer une commande en fin de préparation vers l’état « prête à partir ».

### Déclencheur

- Bouton « Prête » dans la fiche détail et les actions rapides pour les
  commandes en `en_preparation`.

### Comportement

| Étape | Action                                                                       |
| ----- | ---------------------------------------------------------------------------- |
| 1     | Clic sur « Prête »                                                           |
| 2     | Statut passe de `en_preparation` → `pretes_a_partir`                         |
| 3     | Horodatage `ready_at` enregistré                                             |
| 4     | Notification client : « Votre commande est prête à partir » (canal SMS/push) |
| 5     | Journal d’activité mis à jour (DEP-0510)                                     |

### Règles

- Impossible si des articles manquants non résolus (DEP-0502/DEP-0503).
- Si un livreur est déjà assigné (DEP-0497), il est notifié du passage en prêt.
- Une commande prête n’est modifiable qu’avec l’action dédiée (DEP-0499).

---

## DEP-0497 — Action assigner à un livreur

### Objectif

Assigner formellement un livreur à une commande prête ou en fin de
préparation.

### Déclencheur

- Bouton « Assigner un livreur » visible pour les statuts `en_preparation` et
  `pretes_a_partir`.

### Comportement

| Étape | Action                                                                  |
| ----- | ----------------------------------------------------------------------- |
| 1     | Ouverture d’un sélecteur (liste des livreurs disponibles + ETA)         |
| 2     | Sélection du livreur + option « Pas encore connu »                      |
| 3     | Enregistrement de `livreur_id` et `assigned_at`                         |
| 4     | Notification au livreur (push/SMS si configuré) et pastille « Assigné » |
| 5     | Journal d’activité enrichi (acteur, livreur choisi, canal de notif)     |

### Règles

- Une commande ne peut être assignée qu’à un livreur à la fois. Ré-assigner
  écrase le précédent et logge l’historique.
- Si « Pas encore connu » est choisi, la commande reste dans `pretes_a_partir`
  avec badge « Non assigné ».
- L’assignation ne change pas le statut de préparation ; elle prépare la phase
  de départ.

---

## DEP-0498 — Action annuler une commande

### Objectif

Permettre au dépanneur d’annuler une commande avant départ ou en cas
d’impossibilité de traitement.

### Déclencheur

- Bouton « Annuler » disponible pour les statuts `en_attente` et
  `en_preparation` (hors commandes déjà livrées ou en problème clos).

### Comportement

| Étape | Action                                                                                   |
| ----- | ---------------------------------------------------------------------------------------- |
| 1     | Clic « Annuler »                                                                         |
| 2     | Modal obligatoire avec motif (rupture totale, client injoignable, erreur adresse, autre) |
| 3     | Statut passe vers `annulee` + horodatage `cancelled_at`                                  |
| 4     | Désassignation du livreur éventuel + notification au livreur                             |
| 5     | Notification client avec motif résumé                                                    |
| 6     | Entrée journal d’activité                                                                |

### Règles

- Action irréversible (sauf via DEP-0507).
- Les remboursements éventuels ne sont pas gérés en V1 (paiement à la
  livraison par défaut).
- Une commande annulée disparaît des files actives et reste visible en
  historique.

---

## DEP-0499 — Action modifier une commande avant départ

### Objectif

Autoriser des corrections mineures avant le départ du livreur tout en
traçant les impacts.

### Déclencheur

- Bouton « Modifier » pour statuts `en_preparation` et `pretes_a_partir`
  **tant que `departure_at` est vide**.

### Comportement

| Étape | Action                                                                                         |
| ----- | ---------------------------------------------------------------------------------------------- |
| 1     | Ouverture d’un panneau d’édition (quantités, articles, notes, frais)                           |
| 2     | Validation → recalcul des totaux (TTC, frais, taxes)                                           |
| 3     | Statut conservé ; champ `last_modified_at` mis à jour                                          |
| 4     | Notification client avec résumé des modifications si variation montant > 0 ou articles changés |
| 5     | Entrée journal d’activité détaillant les champs modifiés                                       |

### Règles

- Sur une commande déjà marquée prête, une modification force un badge « Modif
  avant départ » et notifie le livreur assigné.
- Les modifications ne sont plus autorisées après `departure_at` (départ
  livreur).
- Si un article devient indisponible, utiliser DEP-0502/DEP-0503 au lieu d’une
  suppression silencieuse.

---

## DEP-0500 — Action appeler le client si nécessaire

### Objectif

Offrir un raccourci de contact direct avec journalisation du résultat.

### Déclencheur

- Bouton « Appeler le client » accessible depuis toutes les commandes non
  clôturées (`en_attente`, `en_preparation`, `pretes_a_partir`, `problème`).

### Comportement

| Étape | Action                                                                                |
| ----- | ------------------------------------------------------------------------------------- |
| 1     | Clic → ouverture d’un menu « Démarrer l’appel » avec numéro cliquable (`tel:`)        |
| 2     | Après l’appel, micro-formulaire « Résultat » : connecté / pas de réponse / messagerie |
| 3     | Option de consigner une note courte (raison : adresse, remplacement, paiement, autre) |
| 4     | Journal d’activité mis à jour avec résultat et note                                   |

### Règles

- Aucun changement de statut automatique. Si l’appel déclenche une décision
  (annulation, remplacement), l’action correspondante doit être jouée ensuite.
- Historiser chaque tentative pour éviter les appels multiples non coordonnés.
- Afficher le décompte de tentatives dans la fiche détail (section contact).

---

## DEP-0501 — Action envoyer un message automatique au client

### Objectif

Envoyer rapidement un message standardisé (SMS/push) sans saisie manuelle.

### Déclencheur

- Bouton « Envoyer message » avec modèles pré-remplis, accessible pour toutes
  les commandes non clôturées.

### Modèles de message V1

| Modèle               | Contenu                                              | Quand l’utiliser                        |
| -------------------- | ---------------------------------------------------- | --------------------------------------- |
| Préparation lancée   | « Votre commande #[ID] est en préparation. »         | Après DEP-0495 si client non notifié    |
| Commande prête       | « Votre commande #[ID] est prête à partir. »         | Après DEP-0496                          |
| Confirmation adresse | « Merci de confirmer l’adresse : [adresse]. »        | Avant départ si doute                   |
| Article manquant     | « Article [X] indisponible. OK pour remplacement ? » | Avec DEP-0502/DEP-0503                  |
| Départ livreur       | « Votre commande #[ID] est en route. »               | Au départ livreur (hors périmètre code) |

### Règles

- Canal prioritaire : SMS si numéro validé, sinon push web, sinon e-mail si
  disponible.
- Anti-spam : un même modèle ne peut être envoyé plus d’une fois toutes les 5
  minutes pour une même commande.
- Chaque envoi est loggé (horodatage, modèle, canal, statut de remise).

---

## DEP-0502 — Action signaler un article manquant

### Objectif

Permettre de gérer rapidement une rupture partielle pendant la préparation.

### Déclencheur

- Icône « Article manquant » par ligne produit dans la fiche détail, disponible
  en `en_preparation`.

### Comportement

| Étape | Action                                                                       |
| ----- | ---------------------------------------------------------------------------- |
| 1     | Clic sur « Article manquant »                                                |
| 2     | Sélection du ou des articles concernés                                       |
| 3     | Choix immédiat : proposer remplacement (DEP-0503) ou retirer l’article       |
| 4     | Totaux recalculés (si retrait) ; badge « Manquant » sur la ligne             |
| 5     | Statut reste `en_preparation` mais priorité boostée (DEP-0508)               |
| 6     | Message automatique envoyé au client (DEP-0501, modèle « Article manquant ») |
| 7     | Journal d’activité mis à jour                                                |

### Règles

- Une commande avec article manquant ne peut pas être marquée prête tant que
  la décision (remplacement ou suppression) n’est pas appliquée.
- Si tous les articles sont manquants, l’annulation (DEP-0498) est forcée.
- Les lignes marquées manquantes sont visibles dans la fiche détail et le
  tableau (pastille jaune).

---

## DEP-0503 — Action proposer un remplacement au client

### Objectif

Proposer une alternative quand un article est manquant, avec validation
client.

### Déclencheur

- Depuis DEP-0502 ou depuis la fiche détail via le menu « Remplacement » tant
  que la commande est en `en_preparation`.

### Comportement

| Étape | Action                                                                                                                  |
| ----- | ----------------------------------------------------------------------------------------------------------------------- |
| 1     | Sélection de l’article manquant et d’une ou deux alternatives (catalogue filtré)                                        |
| 2     | Envoi automatique d’un message au client avec choix « Accepter » / « Refuser » (DEP-0501)                               |
| 3     | Statut intermédiaire `en_attente_validation_client` jusqu’à réponse                                                     |
| 4     | Si accepté → remplacement appliqué, totaux recalculés, retour à `en_preparation`                                        |
| 5     | Si refusé ou pas de réponse sous 10 minutes → badge « Décision client manquante », le dépanneur doit appeler ou annuler |
| 6     | Journal d’activité mis à jour (proposition, réponse, expiration)                                                        |

### Règles

- Une seule proposition active par article à la fois.
- La réponse du client est horodatée et visible dans la fiche détail.
- Si le client refuse, le dépanneur peut soit retirer l’article (recalcul
  totaux), soit annuler la commande (DEP-0498).

---

## DEP-0504 — Action marquer payé à la livraison

### Objectif

Consigner la confirmation de paiement à la remise de la commande.

### Déclencheur

- Bouton « Payé » disponible pour les commandes livrées (`livree`) ou en
  clôture de livraison.

### Comportement

| Étape | Action                                                                |
| ----- | --------------------------------------------------------------------- |
| 1     | Clic « Payé »                                                         |
| 2     | Sélection du mode (espèces, terminal, autre) + montant encaissé (auto |
|       | pré-rempli par total TTC)                                             |
| 3     | Horodatage `paid_at` + statut de paiement = `paye`                    |
| 4     | Journal d’activité (acteur, mode, montant)                            |

### Règles

- Ne modifie pas le statut de livraison (reste `livree` ou `probleme`), ne
  fait qu’acter le paiement.
- Si un paiement est déjà marqué non payé (DEP-0505), l’action « Payé » le
  remplace et clôt le différend.
- Les données de paiement sont en lecture seule après confirmation.

---

## DEP-0505 — Action marquer non payé

### Objectif

Tracer un échec de paiement à la livraison.

### Déclencheur

- Bouton « Non payé » disponible pour les statuts `livree` ou `probleme`.

### Comportement

| Étape | Action                                                                    |
| ----- | ------------------------------------------------------------------------- |
| 1     | Clic « Non payé »                                                         |
| 2     | Modal motif (client sans fonds, terminal en panne, refus de payer, autre) |
| 3     | Statut paiement = `non_paye`, horodatage `payment_failed_at`              |
| 4     | Commande déplacée dans la file « Problèmes » (DEP-0490) avec badge rouge  |
| 5     | Journal d’activité                                                        |

### Règles

- Tant que le paiement est `non_paye`, aucune fermeture complète ; un suivi
  manuel est requis.
- Une action ultérieure « Payé » (DEP-0504) clôture le problème et retire la
  pastille.

---

## DEP-0506 — Action marquer problème de livraison

### Objectif

Documenter un incident de livraison et router la commande vers la file
« Problèmes ».

### Déclencheur

- Bouton « Problème livraison » pour les statuts `pretes_a_partir`,
  `en_livraison` ou `livree` quand un incident est signalé.

### Comportement

| Étape | Action                                                                            |
| ----- | --------------------------------------------------------------------------------- |
| 1     | Clic « Problème livraison »                                                       |
| 2     | Modal motif (client absent, adresse incorrecte, accident, colis endommagé, autre) |
| 3     | Statut passe à `probleme_livraison`, horodatage `problem_at`                      |
| 4     | Commande visible dans la file « Problèmes » avec pastille rouge                   |
| 5     | Option d’envoyer un message au client (DEP-0501) + journal d’activité             |

### Règles

- Tant que le problème n’est pas résolu, aucune action de paiement ou de
  clôture n’est disponible.
- La résolution d’un problème se fait via DEP-0507 (réouverture) ou un flux de
  clôture ultérieur (hors périmètre).

---

## DEP-0507 — Action rouvrir une commande si erreur

### Objectif

Corriger une annulation ou un incident saisi par erreur en réouvrant la
commande dans le flux opérationnel.

### Déclencheur

- Bouton « Rouvrir » disponible uniquement pour les statuts `annulee` ou
  `probleme_livraison`. Réservé aux rôles `depanneur` ou `admin`.

### Comportement

| Étape | Action                                                                                         |
| ----- | ---------------------------------------------------------------------------------------------- |
| 1     | Clic « Rouvrir » + sélection du statut cible (`en_preparation` ou `pretes_a_partir`)           |
| 2     | Suppression du motif d’annulation actif, création d’un champ `reopened_at`                     |
| 3     | Journal d’activité : acteur, raison de la réouverture, statut précédent → nouveau              |
| 4     | Notifications : aucune automatique au client ; le dépanneur peut envoyer un message (DEP-0501) |

### Règles

- Les timestamps historiques ne sont pas écrasés (on conserve `cancelled_at` /
  `problem_at` pour audit).
- Si un paiement `non_paye` existait, il reste associé jusqu’à résolution.
- Rouvrir réactive les actions disponibles pour le statut cible (0495, 0496,
  0497, 0499).

---

## DEP-0508 — Logique de priorité des commandes

### Objectif

Garantir un tri cohérent des commandes selon l’urgence opérationnelle.

### Règles de tri (du plus prioritaire au moins prioritaire)

1. Statut à traiter en premier : `en_attente` > `en_preparation` >
   `pretes_a_partir` > `en_livraison` > `probleme_livraison` > `annulee` /
   `livree`.
2. SLA temps écoulé : commandes dépassant 5 minutes en `en_attente` ou
   `en_preparation` passent devant, avec surbrillance rouge.
3. Commandes avec articles manquants ou validation client en attente (DEP-0502
   / DEP-0503) sont épinglées en haut de `en_preparation`.
4. Commandes prêtes sans livreur assigné (DEP-0497) sont en haut de
   `pretes_a_partir`.
5. Tri secondaire par heure de réception (plus ancienne en haut).

### Affichage

- Chaque ligne affiche une pastille d’urgence (rouge si SLA dépassé, orange si
  < 3 minutes restants, neutre sinon).
- Les files respectent ce tri automatiquement ; pas de tri manuel en V1.

---

## DEP-0509 — Logique d’horodatage de chaque changement d’état

### Objectif

Assurer une traçabilité précise des transitions de commande.

### Timestamps requis

| Événement                        | Champ                  | Déclencheur                           |
| -------------------------------- | ---------------------- | ------------------------------------- |
| Réception de commande            | `received_at`          | Création de la commande               |
| Acceptation (DEP-0493)           | `accepted_at`          | Bouton « Accepter »                   |
| Démarrage préparation (DEP-0495) | `preparation_start_at` | Bouton « En préparation »             |
| Prête (DEP-0496)                 | `ready_at`             | Bouton « Prête »                      |
| Assignation livreur (DEP-0497)   | `assigned_at`          | Sélection livreur                     |
| Départ livreur                   | `departure_at`         | Départ confirmé (hors périmètre code) |
| Livraison confirmée              | `delivered_at`         | Confirmation livraison                |
| Annulation (DEP-0498)            | `cancelled_at`         | Validation modal                      |
| Problème livraison (DEP-0506)    | `problem_at`           | Validation modal                      |
| Réouverture (DEP-0507)           | `reopened_at`          | Bouton « Rouvrir »                    |
| Paiement confirmé (DEP-0504)     | `paid_at`              | Bouton « Payé »                       |
| Paiement échoué (DEP-0505)       | `payment_failed_at`    | Bouton « Non payé »                   |

### Règles

- Chaque timestamp est immuable une fois posé, sauf réouverture documentée.
- Les actions qui ne posent pas de timestamp explicitement (messages, appels)
  sont loggées via DEP-0510.
- Le fuseau horaire utilisé est celui du point de vente (tenant).

---

## DEP-0510 — Logique de journal d’activité de la commande

### Objectif

Centraliser toutes les actions et événements d’une commande dans un journal
chronologique lisible.

### Contenu d’une entrée

| Champ          | Description                                                         |
| -------------- | ------------------------------------------------------------------- |
| `timestamp`    | Date/heure de l’événement                                           |
| `acteur`       | Utilisateur ou système (dépanneur, livreur, système)                |
| `action`       | Type d’action (acceptation, appel, message, modification, paiement) |
| `details`      | Données structurées (motif, montant, lignes modifiées, livreur id)  |
| `canal`        | Web, mobile, API, SMS, appel, push                                  |
| `statut_avant` | Statut avant l’action                                               |
| `statut_apres` | Statut après l’action                                               |

### Affichage

- Timeline inversée (événements récents en haut) dans la fiche détail.
- Filtres rapides : « Paiement », « Problèmes », « Messages », « Appels ».
- Export CSV non prévu en V1.

### Règles

- Aucune entrée ne peut être supprimée ; corrections passent par une nouvelle
  entrée (ex. réouverture).
- Les entrées système (notifications automatiques) sont clairement taguées
  « Système ».

---

## DEP-0511 — Tableau de bord de réception du dépanneur

### Objectif

Fournir une vue unique temps réel pour prioriser et exécuter les commandes.

### Sections du tableau

| Zone                        | Contenu                                                                        |
| --------------------------- | ------------------------------------------------------------------------------ |
| Bandeau KPI                 | Compteurs par file (en attente, préparation, prêtes, problèmes), SLA en retard |
| Filtres et recherche        | Recherche par ID/client, filtres par statut, livreur, urgence                  |
| Onglets de files            | En attente, En préparation, Prêtes à partir, En livraison, Annulées, Problèmes |
| Liste principale            | Lignes de commandes triées selon DEP-0508, actions rapides contextuelles       |
| Panneau détail (split view) | Fiche DEP-0512 + actions (0495–0507)                                           |

### Règles

- Rafraîchissement temps réel (websocket ou équivalent).
- Sur mobile, la liste est plein écran et le détail s’ouvre en modal.
- Les actions critiques (annuler, refuser) sont protégées par modals.

---

## DEP-0512 — Vue détaillée d’une commande

### Objectif

Étendre la fiche détail (DEP-0492) avec les éléments opérationnels liés aux
actions et au journal.

### Contenu additionnel

- **Chrono** : temps depuis réception + temps depuis début préparation.
- **Contact** : boutons Appeler (DEP-0500) et Envoyer message (DEP-0501) avec
  compteur de tentatives.
- **Livraison** : état d’assignation (DEP-0497), nom du livreur, ETA si connu.
- **Articles** : badges « Manquant » / « Remplacement proposé » par ligne.
- **Paiement** : état payé/non payé, mode, montants.
- **Journal** : timeline DEP-0510 filtrable.

### Règles

- Actions visibles sont contextuelles au statut courant.
- Les données sensibles (téléphone, adresse) restent masquables selon les
  préférences dépanneur (cf. DEP-0492).

---

## DEP-0513 — Bouton d’acceptation de commande

### Objectif

Définir la présentation et l’accessibilité du bouton « Accepter » déjà
défini fonctionnellement (DEP-0493).

### Spécifications UI

| Élément       | Valeur                                                                         |
| ------------- | ------------------------------------------------------------------------------ |
| Label         | « Accepter »                                                                   |
| Style         | Bouton primaire (fond bleu, texte blanc, léger relief)                         |
| Emplacement   | Ligne (actions rapides) + bas de fiche détail                                  |
| États         | Normal, hover, loading (spinner ≤ 700 ms), disabled (si statut ≠ `en_attente`) |
| Accessibilité | Focus visible, raccourci clavier `A` sur desktop                               |

### Règles

- Le clic déclenche directement DEP-0493.
- Sur mobile, le bouton est plein largeur au bas de la fiche.

---

## DEP-0514 — Bouton de refus de commande

### Objectif

Définir la présentation du bouton « Refuser » aligné avec DEP-0494.

### Spécifications UI

| Élément       | Valeur                                                                  |
| ------------- | ----------------------------------------------------------------------- |
| Label         | « Refuser »                                                             |
| Style         | Bouton secondaire danger (fond rouge clair, texte rouge foncé)          |
| Emplacement   | Ligne (actions rapides) + bas de fiche détail, à droite de « Accepter » |
| États         | Normal, hover, disabled (si statut ≠ `en_attente`)                      |
| Modal         | S’ouvre systématiquement au clic pour sélectionner le motif             |
| Accessibilité | Focus visible, raccourci clavier `R` sur desktop                        |

### Règles

- L’action suit le flux DEP-0494 (motif obligatoire, irréversible).
- Sur mobile, la modal de motif est plein écran pour la saisie confortable.

---

## Synthèse du bloc DEP-0495–DEP-0514

| DEP  | Sujet                         | Décision clé                                                   |
| ---- | ----------------------------- | -------------------------------------------------------------- |
| 0495 | Marquer en préparation        | Pose `preparation_start_at`, chrono actif                      |
| 0496 | Marquer prête                 | Statut `pretes_a_partir`, notification client, `ready_at`      |
| 0497 | Assigner à un livreur         | Sélecteur livreur, `assigned_at`, badge « Assigné »            |
| 0498 | Annuler une commande          | Modal motif, statut `annulee`, notifs client/livreur           |
| 0499 | Modifier avant départ         | Éditeur contrôlé, recalcul totaux, notif si montant change     |
| 0500 | Appeler le client             | Raccourci `tel:`, résultat consigné, pas de statut auto        |
| 0501 | Message automatique client    | Modèles SMS/push avec anti-spam et journalisation              |
| 0502 | Signaler article manquant     | Badge, recalcul, priorité boostée, message client              |
| 0503 | Proposer remplacement         | Attente validation client, délai 10 min, retour en préparation |
| 0504 | Marquer payé à la livraison   | Mode paiement, `paid_at`, clôture du statut de paiement        |
| 0505 | Marquer non payé              | `non_paye`, `payment_failed_at`, file Problèmes                |
| 0506 | Marquer problème de livraison | Statut `probleme_livraison`, `problem_at`, pastille rouge      |
| 0507 | Rouvrir une commande          | Rôle restreint, `reopened_at`, choix statut cible              |
| 0508 | Logique de priorité           | Tri par statut, SLA, incidents, puis ordre d’arrivée           |
| 0509 | Horodatage des changements    | Champs timestamp obligatoires par transition                   |
| 0510 | Journal d’activité            | Timeline immuable avec acteur, action, statuts avant/après     |
| 0511 | Tableau de bord réception     | Bandeau KPI, filtres, onglets, liste triée, split view         |
| 0512 | Vue détaillée                 | Chrono, contact, livraison, articles, paiement, journal        |
| 0513 | Bouton d’acceptation          | Bouton primaire, états, raccourci `A`, déclenche DEP-0493      |
| 0514 | Bouton de refus               | Bouton danger + modal motif, raccourci `R`, flux DEP-0494      |
