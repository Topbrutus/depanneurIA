# DEP-0481 à DEP-0494 — Réception des commandes côté dépanneur (base)

## Périmètre

Ce document définit l'**interface de réception des commandes** du dépanneur :
les alertes (visuelles, sonores, mobile), les **files de commandes** selon
leur statut, les **colonnes de la liste**, la **fiche détail d'une commande**
et les **actions de base** disponibles (accepter, refuser).

Ces décisions s'appuient sur les statuts de commande définis dans les
comportements du panier (DEP-0192–DEP-0196) et les tons définis pour le
dépanneur (DEP-0365).

Il s'agit exclusivement de **documentation** : aucun code produit, aucune
implémentation. Les spécifications décrites ici serviront de référence pour
les futures implémentations front-end et back-end.

---

## DEP-0481 — Interface de réception des commandes du dépanneur

### Objectif

Définir la page principale depuis laquelle le dépanneur consulte et gère
les commandes entrantes et en cours.

### Structure de la page

| Zone             | Contenu                                                         | Position desktop       | Position mobile         |
| ---------------- | --------------------------------------------------------------- | ---------------------- | ----------------------- |
| Header           | Logo, nom du point de vente, statut ouvert/fermé, notifications | Haut — pleine largeur  | Haut — pleine largeur   |
| Barre de statuts | Onglets des files de commandes (DEP-0485–DEP-0490)              | Sous le header         | Sous le header (scroll) |
| Zone principale  | Liste des commandes de la file active (DEP-0491)                | Corps principal        | Corps principal         |
| Panneau détail   | Fiche détail d'une commande sélectionnée (DEP-0492)             | Colonne droite (split) | Modal plein écran       |

### Accès

- L'interface dépanneur est accessible depuis `/depanneur/commandes`.
- Elle est réservée aux utilisateurs avec le rôle `depanneur` ou `admin`.
- La page s'affiche en mode **temps réel** : les nouvelles commandes
  apparaissent sans rechargement manuel.

### Comportement général

- La file active par défaut à l'ouverture est **« En attente »** (DEP-0485).
- Une pastille de comptage affiche le nombre de commandes dans chaque file.
- La page reste accessible et fonctionnelle sur tablette et mobile (priorité
  opérationnelle terrain).

---

## DEP-0482 — Alerte visuelle nouvelle commande

### Objectif

Définir l'alerte visuelle affichée lorsqu'une nouvelle commande arrive sur
l'interface du dépanneur.

### Comportement

| Moment                            | Alerte visuelle                                          |
| --------------------------------- | -------------------------------------------------------- |
| Nouvelle commande reçue           | Bannière de notification en haut de l'écran (slide-down) |
| File « En attente » non active    | Pastille rouge clignotante sur l'onglet « En attente »   |
| Onglet navigateur en arrière-plan | Titre de l'onglet préfixé par « (1) Nouvelle commande »  |

### Contenu de la bannière

> « Nouvelle commande #[ID] — [N] article(s) — [Heure] »

| Attribut       | Valeur                                                          |
| -------------- | --------------------------------------------------------------- |
| Fond           | `--color-accent` (orange vif)                                   |
| Texte          | Blanc, gras                                                     |
| Durée          | Persistante jusqu'à clic ou action sur la commande              |
| Action au clic | Redirige vers la file « En attente » et sélectionne la commande |

### Règles

- Si plusieurs commandes arrivent simultanément, une bannière par commande
  est empilée (max 3 visibles, les suivantes en file d'attente).
- La bannière disparaît automatiquement si le dépanneur ouvre la commande.
- La pastille clignotante s'arrête dès que l'onglet « En attente » est ouvert.

---

## DEP-0483 — Alerte sonore nouvelle commande

### Objectif

Définir le signal sonore déclenché à l'arrivée d'une nouvelle commande pour
attirer l'attention du dépanneur même si l'écran n'est pas consulté.

### Signal sonore

| Attribut    | Valeur                                                       |
| ----------- | ------------------------------------------------------------ |
| Type        | Son court et distinctif (type caisse enregistreuse ou bip)   |
| Durée       | 1 à 2 secondes                                               |
| Répétitions | 3 fois si la commande n'est pas ouverte dans les 30 secondes |
| Volume      | Niveau système — non modifiable depuis l'interface en V1     |

### Déclenchement

- Le son se déclenche à chaque nouvelle commande reçue.
- Il ne se déclenche **pas** si le dépanneur a la fiche de la commande ouverte
  au moment de la réception.
- Il cesse définitivement dès que la commande est acceptée ou refusée.

### Activation / désactivation

- Le son est **activé par défaut**.
- Le dépanneur peut le désactiver via un interrupteur dans les paramètres de
  l'interface (`/depanneur/parametres`).
- La désactivation est persistante (stockée côté compte).

### Règles

- Le son nécessite une interaction préalable de l'utilisateur avec la page
  (contrainte navigateur — autoplay policy).
- Sur mobile, le son suit le mode sonnerie/silencieux de l'appareil.

---

## DEP-0484 — Alerte nouvelle commande sur téléphone du dépanneur

### Objectif

Définir les mécanismes d'alerte pour les commandes reçues sur le téléphone
mobile du dépanneur lorsqu'il n'est pas devant l'écran principal.

### Canaux d'alerte mobile

| Canal                   | Condition d'envoi                             | Contenu                                         |
| ----------------------- | --------------------------------------------- | ----------------------------------------------- |
| Notification push web   | Application ouverte en arrière-plan (PWA)     | « Nouvelle commande #[ID] — [N] article(s) »    |
| SMS                     | Optionnel V1 — si numéro configuré            | « depaneurIA — Nouvelle commande #[ID] reçue. » |
| Notification navigateur | Permission accordée dans le navigateur mobile | Même contenu que push web                       |

### Comportement au clic sur la notification

- Clic sur la notification push → ouverture de l'interface dépanneur sur la
  file « En attente », commande concernée sélectionnée.
- Si l'application est fermée → redémarrage de l'application puis navigation
  vers la commande.

### Règles

- Les notifications push nécessitent une permission accordée par le dépanneur
  (demande à la première connexion).
- En V1, le SMS est optionnel et configuré manuellement dans les paramètres.
- La notification est envoyée **une seule fois** par commande — pas de
  répétition sur mobile.

---

## DEP-0485 — File des commandes en attente

### Objectif

Définir la file contenant les commandes reçues mais pas encore traitées
par le dépanneur.

### Définition

Une commande est **en attente** dès sa réception et jusqu'à ce que le
dépanneur l'accepte (DEP-0493) ou la refuse (DEP-0494).

### Statut

| Attribut         | Valeur                                  |
| ---------------- | --------------------------------------- |
| Identifiant      | `en_attente`                            |
| Label onglet     | « En attente »                          |
| Couleur pastille | Orange (`--color-accent`)               |
| Tri par défaut   | Plus ancienne en haut (FIFO)            |
| Urgence          | Commandes > 5 min en surbrillance rouge |

### Comportement

- Une commande entre dans cette file **immédiatement** à la réception.
- La file est triée par ordre d'arrivée (la plus ancienne en premier) pour
  garantir le traitement FIFO.
- Les commandes en attente depuis plus de **5 minutes** sont signalées
  visuellement (bordure rouge sur la ligne).
- Le dépanneur ne peut pas modifier une commande depuis cette file — il peut
  uniquement accepter ou refuser.

---

## DEP-0486 — File des commandes en préparation

### Objectif

Définir la file contenant les commandes acceptées et en cours de préparation.

### Définition

Une commande passe **en préparation** après que le dépanneur l'a acceptée
(DEP-0493). Elle reste dans cette file jusqu'à ce qu'elle soit marquée
« prête à partir » (DEP-0487).

### Statut

| Attribut         | Valeur                                    |
| ---------------- | ----------------------------------------- |
| Identifiant      | `en_preparation`                          |
| Label onglet     | « En préparation »                        |
| Couleur pastille | Bleu (`--color-info`)                     |
| Tri par défaut   | Plus ancienne en haut (FIFO)              |
| Urgence          | Commandes > 15 min en surbrillance orange |

### Comportement

- Le dépanneur peut consulter le détail de la commande et marquer des articles
  comme préparés (fonctionnalité future, hors V1 de base).
- En V1, l'action disponible est uniquement « Marquer prête » (DEP-0496,
  hors périmètre de ce document).
- Le client voit le statut « En préparation » sur sa page de suivi (DEP-0193).

---

## DEP-0487 — File des commandes prêtes à partir

### Objectif

Définir la file contenant les commandes préparées et en attente d'un livreur
ou de la prise en charge finale.

### Définition

Une commande est **prête à partir** lorsque le dépanneur l'a marquée comme
préparée. Elle attend l'assignation à un livreur ou la confirmation de départ.

### Statut

| Attribut         | Valeur                                                 |
| ---------------- | ------------------------------------------------------ |
| Identifiant      | `prete`                                                |
| Label onglet     | « Prêtes à partir »                                    |
| Couleur pastille | Vert (`--color-success`)                               |
| Tri par défaut   | Plus ancienne en haut                                  |
| Urgence          | Commandes > 10 min sans livreur en surbrillance orange |

### Comportement

- L'action disponible depuis cette file est « Assigner à un livreur »
  (DEP-0497, hors périmètre de ce document).
- Le client voit le statut « Commande prête — en attente du livreur » sur sa
  page de suivi.

---

## DEP-0488 — File des commandes livrées

### Objectif

Définir la file contenant les commandes remises au client avec succès.

### Définition

Une commande est **livrée** lorsque le livreur confirme la remise au client.

### Statut

| Attribut         | Valeur                            |
| ---------------- | --------------------------------- |
| Identifiant      | `livree`                          |
| Label onglet     | « Livrées »                       |
| Couleur pastille | Gris neutre (`--color-neutral`)   |
| Tri par défaut   | Plus récente en haut              |
| Rétention        | 30 jours visibles dans cette file |

### Comportement

- Les commandes livrées sont en **lecture seule**.
- Le dépanneur peut consulter le détail mais ne peut plus agir sur la commande.
- Aucune alerte n'est associée à cette file.
- Après 30 jours, les commandes sont archivées (non supprimées, non visibles
  dans cette file).

---

## DEP-0489 — File des commandes annulées

### Objectif

Définir la file contenant les commandes annulées, quelle qu'en soit l'origine
(client, dépanneur, système).

### Définition

Une commande est **annulée** si elle est annulée par le client avant
préparation, refusée par le dépanneur (DEP-0494), ou annulée automatiquement
après expiration du délai d'acceptation.

### Statut

| Attribut         | Valeur                                |
| ---------------- | ------------------------------------- |
| Identifiant      | `annulee`                             |
| Label onglet     | « Annulées »                          |
| Couleur pastille | Rouge atténué (`--color-error-light`) |
| Tri par défaut   | Plus récente en haut                  |
| Rétention        | 30 jours visibles dans cette file     |

### Comportement

- Les commandes annulées sont en **lecture seule**.
- Le motif d'annulation est visible dans la fiche détail (DEP-0492).
- Aucune action n'est disponible depuis cette file en V1.

### Sources d'annulation

| Source                         | Motif affiché                             |
| ------------------------------ | ----------------------------------------- |
| Refus dépanneur (DEP-0494)     | « Refusée par le dépanneur »              |
| Annulation client              | « Annulée par le client »                 |
| Expiration délai d'acceptation | « Expirée — non traitée dans les délais » |
| Annulation système             | « Annulée automatiquement »               |

---

## DEP-0490 — File des commandes problématiques

### Objectif

Définir la file contenant les commandes nécessitant une attention particulière
du dépanneur en raison d'une anomalie ou d'un incident.

### Définition

Une commande est **problématique** lorsqu'un incident survient après
l'acceptation : article manquant signalé, livreur injoignable, client absent,
adresse incorrecte, ou tout autre anomalie empêchant la livraison normale.

### Statut

| Attribut         | Valeur                                |
| ---------------- | ------------------------------------- |
| Identifiant      | `probleme`                            |
| Label onglet     | « Problèmes »                         |
| Couleur pastille | Rouge vif (`--color-error`)           |
| Tri par défaut   | Plus récente en haut                  |
| Alerte           | Pastille clignotante si file non vide |

### Comportement

- Une commande entre dans cette file lorsqu'un incident est signalé (par le
  livreur, le client ou le système).
- Le dépanneur voit le motif de l'incident dans la fiche détail (DEP-0492).
- Les actions disponibles depuis cette file sont définies dans des blocs DEP
  ultérieurs (modification, réassignation livreur, annulation).

### Motifs d'entrée dans cette file

| Motif                           | Déclencheur                    |
| ------------------------------- | ------------------------------ |
| Article introuvable en stock    | Signalement dépanneur          |
| Livreur injoignable             | Signalement système ou livreur |
| Client absent à la livraison    | Signalement livreur            |
| Adresse de livraison incorrecte | Signalement livreur            |
| Autre incident                  | Signalement manuel dépanneur   |

---

## DEP-0491 — Colonnes visibles dans la liste de commandes

### Objectif

Définir les colonnes affichées dans la liste de commandes pour chaque file,
permettant au dépanneur d'identifier rapidement les informations essentielles.

### Colonnes standard (toutes files)

| Colonne         | Contenu                                    | Largeur desktop | Mobile           |
| --------------- | ------------------------------------------ | --------------- | ---------------- |
| ID commande     | `#CMD-AAAAMMJJ-NNN`                        | 120px           | Masquée          |
| Heure           | Heure de réception (ex. : 14h32)           | 80px            | Visible          |
| Client          | Prénom + initiale du nom (ex. : Sophie M.) | 160px           | Visible          |
| Nb articles     | Nombre total d'articles                    | 80px            | Visible          |
| Montant TTC     | Total de la commande en dollars            | 100px           | Visible          |
| Statut          | Badge coloré selon la file active          | 120px           | Visible          |
| Temps écoulé    | Durée depuis réception (ex. : « 3 min »)   | 100px           | Visible          |
| Actions rapides | Boutons contextuels (accepter/refuser)     | 160px           | Icônes compactes |

### Colonnes spécifiques par file

| File            | Colonne supplémentaire               |
| --------------- | ------------------------------------ |
| En préparation  | Temps depuis acceptation             |
| Prêtes à partir | Livreur assigné (ou « Non assigné ») |
| Livrées         | Heure de livraison confirmée         |
| Annulées        | Motif d'annulation (résumé court)    |
| Problèmes       | Motif de l'incident (résumé court)   |

### Règles d'affichage

- Sur mobile, seules les colonnes « Heure », « Client », « Nb articles »,
  « Montant TTC » et « Actions rapides » sont affichées.
- Un clic sur une ligne ouvre la fiche détail (DEP-0492).
- Les colonnes ne sont pas réordonnables en V1.

---

## DEP-0492 — Fiche détail d'une commande côté dépanneur

### Objectif

Définir le contenu et le comportement de la fiche détail d'une commande,
accessible depuis la liste des commandes.

### Structure de la fiche

#### En-tête

| Élément            | Contenu                                            |
| ------------------ | -------------------------------------------------- |
| ID commande        | `#CMD-AAAAMMJJ-NNN`                                |
| Statut             | Badge coloré selon la file (DEP-0485–DEP-0490)     |
| Heure de réception | Date et heure complètes                            |
| Temps écoulé       | Durée depuis réception (mise à jour en temps réel) |

#### Informations client

| Élément           | Contenu                                        |
| ----------------- | ---------------------------------------------- |
| Nom du client     | Prénom + nom complet                           |
| Téléphone         | Numéro de téléphone (cliquable sur mobile)     |
| Adresse           | Adresse de livraison complète                  |
| Note de livraison | Note libre du client (si renseignée, DEP-0291) |

#### Liste des articles

| Colonne       | Contenu                                              |
| ------------- | ---------------------------------------------------- |
| Quantité      | Nombre d'unités commandées                           |
| Nom produit   | Label + variante (ex. : Pepsi 355ml)                 |
| Disponibilité | Indicateur en stock / rupture (temps réel, DEP-0248) |
| Prix unitaire | Prix de la variante                                  |
| Sous-total    | Quantité × prix unitaire                             |

#### Récapitulatif financier

| Ligne           | Valeur                        |
| --------------- | ----------------------------- |
| Sous-total HT   | Somme des sous-totaux         |
| Taxes           | Montant taxes applicables     |
| Frais livraison | Montant frais (DEP-0254)      |
| **Total TTC**   | **Montant total à percevoir** |

#### Zone d'actions

Actions disponibles selon la file active (voir DEP-0493, DEP-0494 et blocs
ultérieurs). Placées en bas de la fiche, toujours visibles sans scroll.

### Affichage

| Format    | Comportement                                          |
| --------- | ----------------------------------------------------- |
| Desktop   | Panneau latéral droit (split view, largeur 40%)       |
| Mobile    | Modal plein écran avec scroll vertical interne        |
| Fermeture | Bouton [✕] en haut à droite, ou retour arrière mobile |

### Règles

- La fiche est en lecture seule pour les commandes livrées et annulées.
- Les données client (nom, téléphone, adresse) sont masquables si le
  dépanneur l'indique dans ses paramètres (confidentialité).
- La disponibilité des articles est actualisée en temps réel.

---

## DEP-0493 — Action accepter une commande

### Objectif

Définir le comportement exact du dépanneur lorsqu'il accepte une commande
en attente.

### Déclencheur

Bouton « Accepter » dans la fiche détail (DEP-0492) ou dans les actions
rapides de la liste (DEP-0491), depuis la file « En attente » (DEP-0485).

### Comportement

| Étape | Action                                                                                     |
| ----- | ------------------------------------------------------------------------------------------ |
| 1     | Clic sur « Accepter »                                                                      |
| 2     | Confirmation optionnelle (toast non bloquant : « Commande acceptée »)                      |
| 3     | Statut de la commande passe de `en_attente` → `en_preparation`                             |
| 4     | La commande quitte la file « En attente » et apparaît dans « En préparation »              |
| 5     | Notification envoyée au client : « Votre commande est en cours de préparation » (DEP-0193) |
| 6     | Chronomètre de préparation démarre (affiché dans la fiche)                                 |

### Conditions

- L'action est disponible **uniquement** pour les commandes en statut
  `en_attente`.
- Aucune confirmation modale bloquante — l'acceptation est immédiate.
- Si la connexion est perdue au moment du clic → message d'erreur discret,
  action non enregistrée, possibilité de réessayer.

### Feedback visuel

| Moment            | Feedback                                       |
| ----------------- | ---------------------------------------------- |
| Clic « Accepter » | Bouton en état chargement (spinner, 500ms max) |
| Succès            | Toast vert « Commande #[ID] acceptée »         |
| Erreur réseau     | Toast rouge « Erreur — réessaie »              |

### Règles

- L'acceptation est **irréversible** en V1 — une commande acceptée ne peut
  pas être remise en attente. Elle peut uniquement être annulée (DEP-0498,
  hors périmètre de ce document).
- Le délai maximum d'acceptation avant expiration automatique est défini à
  **10 minutes** à partir de la réception (configurable par tenant en V2).

---

## DEP-0494 — Action refuser une commande

### Objectif

Définir le comportement exact du dépanneur lorsqu'il refuse une commande
en attente.

### Déclencheur

Bouton « Refuser » dans la fiche détail (DEP-0492) ou dans les actions
rapides de la liste (DEP-0491), depuis la file « En attente » (DEP-0485).

### Comportement

| Étape | Action                                                                       |
| ----- | ---------------------------------------------------------------------------- |
| 1     | Clic sur « Refuser »                                                         |
| 2     | Modal de confirmation avec sélection du motif (obligatoire)                  |
| 3     | Confirmation → statut passe de `en_attente` → `annulee`                      |
| 4     | La commande quitte la file « En attente » et apparaît dans « Annulées »      |
| 5     | Notification envoyée au client : « Votre commande a été refusée » (DEP-0196) |
| 6     | Le motif est enregistré dans l'historique de la commande                     |

### Motifs de refus disponibles

| Motif                          | Identifiant                                 |
| ------------------------------ | ------------------------------------------- |
| Trop d'articles indisponibles  | `stock_insuffisant`                         |
| Fermeture imprévue             | `fermeture`                                 |
| Zone de livraison non couverte | `zone_non_couverte`                         |
| Autre raison                   | `autre` + champ texte libre (140 chars max) |

### Confirmation modale

| Élément          | Contenu                                                         |
| ---------------- | --------------------------------------------------------------- |
| Titre            | « Refuser la commande #[ID] ? »                                 |
| Corps            | Sélecteur de motif (obligatoire) + champ texte si motif = autre |
| Bouton confirmer | « Confirmer le refus » — rouge (`--color-error`)                |
| Bouton annuler   | « Annuler » — secondaire                                        |

### Conditions

- L'action est disponible **uniquement** pour les commandes en statut
  `en_attente`.
- Le motif de refus est **obligatoire** — le bouton de confirmation est
  désactivé tant qu'aucun motif n'est sélectionné.
- Le refus est **irréversible** en V1.

### Feedback visuel

| Moment             | Feedback                                              |
| ------------------ | ----------------------------------------------------- |
| Clic « Confirmer » | Bouton en état chargement (spinner)                   |
| Succès             | Modal fermé + toast orange « Commande #[ID] refusée » |
| Erreur réseau      | Toast rouge « Erreur — réessaie »                     |

### Règles

- Le client reçoit une notification de refus avec le motif (version simplifiée,
  sans détail interne).
- Le motif `autre` avec texte libre n'est **pas** transmis au client — seul
  le message standard DEP-0196 lui est envoyé.
- Une commande refusée peut être re-commandée par le client depuis son
  historique (DEP-0196).

---

## Synthèse du bloc DEP-0481–DEP-0494

| DEP      | Sujet                         | Décision clé                                                    |
| -------- | ----------------------------- | --------------------------------------------------------------- |
| DEP-0481 | Interface réception commandes | Split view desktop, modal mobile, temps réel, FIFO              |
| DEP-0482 | Alerte visuelle               | Bannière persistante + pastille clignotante + titre onglet      |
| DEP-0483 | Alerte sonore                 | Son court, 3 répétitions si ignoré, désactivable                |
| DEP-0484 | Alerte mobile                 | Push web (PWA) + SMS optionnel, clic → commande directe         |
| DEP-0485 | File en attente               | FIFO, urgence > 5 min en rouge, accept/refus uniquement         |
| DEP-0486 | File en préparation           | Urgence > 15 min en orange, lecture seule V1 de base            |
| DEP-0487 | File prête à partir           | Urgence > 10 min sans livreur, assignation livreur suivante     |
| DEP-0488 | File livrées                  | Lecture seule, rétention 30 jours                               |
| DEP-0489 | File annulées                 | Lecture seule, motif visible, rétention 30 jours                |
| DEP-0490 | File problèmes                | Pastille clignotante, motif d'incident, actions à définir       |
| DEP-0491 | Colonnes liste commandes      | 8 colonnes standard, colonnes spécifiques par file              |
| DEP-0492 | Fiche détail commande         | En-tête + client + articles + récapitulatif + actions           |
| DEP-0493 | Action accepter               | Immédiat, irréversible, notification client, chrono démarre     |
| DEP-0494 | Action refuser                | Modal obligatoire avec motif, irréversible, notification client |
