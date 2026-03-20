# DEP-0575 à DEP-0594 — Logiques métier et affichages de suivi

## Périmètre

Ce document définit les **logiques métier** liées à la popularité des produits,
à la dernière commande, aux recommandations, aux paniers abandonnés, ainsi que
les **machines d'état** des entités principales (commandes, livraisons,
paiement, disponibilité produit), les **horodatages** clés du cycle de vie
d'une commande, et les **affichages de suivi** adaptés à chaque rôle (client,
dépanneur, livreur, super administrateur).

Ces décisions s'appuient sur les structures définies en DEP-0241–DEP-0255
(catalogue), DEP-0314–DEP-0316 (persistance panier et dernière commande),
DEP-0481–DEP-0494 (réception commandes dépanneur) et DEP-0192–DEP-0196
(comportement du panier et statuts de commande).

Il s'agit exclusivement de **documentation** : aucun code produit, aucune
implémentation.

---

## DEP-0575 — Logique de calcul de popularité des produits

### Objectif

Définir comment le score de popularité d'un produit est calculé et mis à jour,
servant de base au filtre « Populaires » (DEP-0327), aux suggestions de
l'assistant (DEP-0392) et au tri (DEP-0329).

### Critères de calcul

| Critère                      | Poids | Période                            |
| ---------------------------- | ----- | ---------------------------------- |
| Nombre de commandes validées | ×3    | 30 derniers jours                  |
| Nombre de commandes validées | ×1    | 7 derniers jours (bonus fraîcheur) |
| Nombre d'ajouts au panier    | ×1    | 30 derniers jours                  |

### Formule

```
score = (commandes_30j × 3) + (commandes_7j × 1) + (ajouts_panier_30j × 1)
rank  = classement par score décroissant au sein du tenant
```

### Structure du résultat (DEP-0250)

- `period` : `"30j"`
- `order_count` : nombre de commandes validées sur 30 jours
- `rank` : position dans le classement (1 = plus populaire)
- `last_order_at` : horodatage de la dernière commande incluant ce produit

### Fréquence de mise à jour

- Recalcul complet : **une fois par heure** en V1.
- En cas d'absence de commande sur 30 jours : le produit sort du classement
  populaire (rank nul, badge « Populaire » masqué).

### Règles

- Le calcul est **par tenant** — la popularité d'un tenant n'influence pas
  celle d'un autre.
- Les commandes annulées ou refusées ne comptent pas dans le score.
- Les produits archivés (DEP-0251) sont exclus du calcul.
- Le rank maximum affiché dans les suggestions est **10** (top 10 seulement).

---

## DEP-0576 — Logique de calcul de la dernière commande

### Objectif

Définir comment la « dernière commande » d'un client est identifiée et mise
à jour, servant au filtre DEP-0328, à la phrase DEP-0373 et au raccourci
de recommande (DEP-0316).

### Définition

La dernière commande est la commande ayant le `created_at` le plus récent
pour un client donné, avec un statut terminal positif (`livree`).

### Statuts pris en compte

| Statut           | Compte comme dernière commande |
| ---------------- | ------------------------------ |
| `livree`         | ✅ Oui                         |
| `en_attente`     | ❌ Non — en cours              |
| `en_preparation` | ❌ Non — en cours              |
| `prete`          | ❌ Non — en cours              |
| `annulee`        | ❌ Non — non aboutie           |
| `probleme`       | ❌ Non — non aboutie           |

### Mise à jour

- Déclenchée **à chaque confirmation de livraison** (horodatage DEP-0589).
- Si la commande livrée est plus récente que la dernière commande enregistrée
  → elle remplace la précédente.
- Les données stockées sont celles définies en DEP-0316
  (ID, date, statut, nb articles, montant TTC).

### Règles

- Un client sans commande livrée n'a pas de « dernière commande » — le filtre
  DEP-0328 et la phrase DEP-0373 sont masqués.
- La dernière commande est liée au compte client (non accessible sans
  connexion).

---

## DEP-0577 — Logique de recommandation simple basée sur l'historique

### Objectif

Définir la logique de recommandation de produits proposée au client à partir
de son historique de commandes, sans moteur d'IA complexe en V1.

### Algorithme V1 (simple, déterministe)

1. Récupérer les **10 dernières commandes livrées** du client.
2. Extraire la liste des variantes commandées avec leur fréquence.
3. Trier par fréquence décroissante.
4. Conserver les **5 variantes les plus fréquentes** encore disponibles
   en stock (`en_stock` ou `faible_stock`, DEP-0248).
5. Si moins de 5 résultats disponibles → compléter avec les produits
   populaires du tenant (DEP-0575, top populaires).

### Résultat

- Liste de 3 à 5 produits recommandés.
- Utilisée dans la phrase de bienvenue (DEP-0367, variante client connecté)
  et dans le filtre « Dernière commande » (DEP-0328).

### Règles

- Les recommandations sont **par client et par tenant**.
- Un produit archivé (DEP-0251) est exclu des recommandations même s'il
  figure dans l'historique.
- En V1, aucun filtre collaboratif (« les clients comme vous ont aussi
  commandé ») — recommandation strictement personnelle.
- Recalcul déclenché à chaque nouvelle commande livrée.

---

## DEP-0578 — Logique de rétention du panier abandonné

### Objectif

Définir les conditions dans lesquelles un panier est considéré comme
abandonné et les règles de conservation avant nettoyage.

### Définition d'un panier abandonné

Un panier est **abandonné** si les conditions suivantes sont toutes réunies :

| Condition                                      | Valeur seuil     |
| ---------------------------------------------- | ---------------- |
| Le panier contient au moins 1 article          | Oui              |
| Aucune commande n'a été validée depuis         | —                |
| Aucune activité (ajout, retrait, modification) | > **30 minutes** |
| Le client ne s'est pas reconnecté depuis       | > **24 heures**  |

### Durées de rétention

| Situation client                   | Durée de rétention du panier  |
| ---------------------------------- | ----------------------------- |
| Client connecté, panier actif      | 30 jours (DEP-0314)           |
| Client connecté, panier abandonné  | 7 jours avant nettoyage       |
| Client non connecté (localStorage) | Session navigateur uniquement |

### Règles

- Un panier vide n'est jamais considéré comme abandonné.
- La rétention s'applique **par compte client** pour les paniers serveur.
- Les articles en rupture dans un panier retenu sont marqués comme
  indisponibles lors de la reprise, non supprimés automatiquement.

---

## DEP-0579 — Logique de nettoyage des paniers abandonnés

### Objectif

Définir le processus de suppression des paniers abandonnés après expiration
de leur durée de rétention (DEP-0578).

### Déclenchement du nettoyage

- Processus automatique planifié : **une fois par jour** (hors heures de pointe).
- Cible : tous les paniers serveur inactifs depuis plus de **7 jours**
  (client connecté, panier abandonné) ou **30 jours** (panier actif non
  converti).

### Processus de nettoyage

| Étape | Action                                                             |
| ----- | ------------------------------------------------------------------ |
| 1     | Identifier les paniers correspondant aux critères d'expiration     |
| 2     | Vérifier qu'aucune commande n'est en cours pour ce client          |
| 3     | Supprimer les articles du panier (soft delete en V1)               |
| 4     | Marquer le panier comme `expire` dans le système                   |
| 5     | Journaliser la suppression (tenant, client anonymisé, nb articles) |

### Règles

- Le nettoyage ne supprime jamais un panier avec une commande `en_attente`
  ou `en_preparation` associée.
- La suppression est un **soft delete** en V1 — les données sont conservées
  30 jours supplémentaires pour audit avant suppression définitive.
- Aucune notification n'est envoyée au client lors du nettoyage automatique
  (sauf si une relance douce a été envoyée, DEP-0580).

---

## DEP-0580 — Logique de relance douce si panier abandonné

### Objectif

Définir le mécanisme de relance passive envoyée au client lorsqu'un panier
actif est abandonné, pour l'inciter à finaliser sa commande.

### Conditions d'envoi

| Condition                                     | Valeur         |
| --------------------------------------------- | -------------- |
| Panier contient au moins 1 article disponible | Oui            |
| Délai depuis dernière activité                | > **2 heures** |
| Client connecté avec e-mail ou téléphone      | Oui            |
| Relance déjà envoyée pour ce panier           | Non (1 seule)  |

### Canal de relance V1

| Canal                                | Contenu                                                          |
| ------------------------------------ | ---------------------------------------------------------------- |
| Notification push (si PWA installée) | « Tu as des articles dans ton panier. Commande quand tu veux ! » |
| Aucun SMS en V1                      | Réservé V2                                                       |
| Aucun e-mail en V1                   | Réservé V2                                                       |

### Contenu de la notification push

> « Tu as [N] article(s) dans ton panier. Ils t'attendent ! »

- Clic → redirection vers `/boutique` avec panier restauré.

### Règles

- **Une seule relance** par panier abandonné — pas de relance répétée.
- La relance n'est pas envoyée si le client a désactivé les notifications
  (DEP-0484, paramètres).
- La relance est annulée si le client commande ou vide son panier avant
  l'envoi.
- La relance ne mentionne pas les prix — elle ne fait que rappeler l'existence
  du panier.

---

## DEP-0581 — Machine d'état des commandes

### Objectif

Définir tous les états possibles d'une commande, les transitions autorisées
et les acteurs déclenchant chaque transition.

### États

| État           | Identifiant      | Description                                        |
| -------------- | ---------------- | -------------------------------------------------- |
| En attente     | `en_attente`     | Commande reçue, non traitée par le dépanneur       |
| En préparation | `en_preparation` | Acceptée par le dépanneur, en cours de préparation |
| Prête          | `prete`          | Préparée, en attente de livreur                    |
| En livraison   | `en_livraison`   | Prise en charge par le livreur                     |
| Livrée         | `livree`         | Remise au client avec succès                       |
| Annulée        | `annulee`        | Annulée (client, dépanneur ou système)             |
| Problème       | `probleme`       | Incident survenu après acceptation                 |

### Transitions autorisées

| De               | Vers             | Déclencheur                                   | Référence        |
| ---------------- | ---------------- | --------------------------------------------- | ---------------- |
| `en_attente`     | `en_preparation` | Dépanneur accepte                             | DEP-0493         |
| `en_attente`     | `annulee`        | Dépanneur refuse / client annule / expiration | DEP-0494         |
| `en_preparation` | `prete`          | Dépanneur marque prête                        | DEP-0496 (futur) |
| `en_preparation` | `probleme`       | Incident signalé                              | DEP-0490         |
| `en_preparation` | `annulee`        | Dépanneur annule                              | DEP-0498 (futur) |
| `prete`          | `en_livraison`   | Livreur prend en charge                       | DEP-0497 (futur) |
| `prete`          | `probleme`       | Incident signalé                              | DEP-0490         |
| `en_livraison`   | `livree`         | Livreur confirme remise                       | DEP-0589         |
| `en_livraison`   | `probleme`       | Incident livraison                            | DEP-0490         |
| `probleme`       | `livree`         | Résolution positive                           | Manuel dépanneur |
| `probleme`       | `annulee`        | Résolution négative                           | Manuel dépanneur |

### Règles

- Aucune transition non listée ci-dessus n'est autorisée.
- Un état terminal (`livree`, `annulee`) est **irréversible**.
- Chaque transition est horodatée (DEP-0586–DEP-0590) et journalisée
  (DEP-0585).

---

## DEP-0582 — Machine d'état des livraisons

### Objectif

Définir tous les états possibles d'une livraison (entité distincte de la
commande), les transitions autorisées et les acteurs déclenchants.

### États

| État         | Identifiant    | Description                           |
| ------------ | -------------- | ------------------------------------- |
| Non assignée | `non_assignee` | Commande prête, aucun livreur désigné |
| Assignée     | `assignee`     | Livreur désigné, pas encore parti     |
| En route     | `en_route`     | Livreur parti du dépanneur            |
| Arrivée      | `arrivee`      | Livreur à l'adresse du client         |
| Livrée       | `livree`       | Remise confirmée                      |
| Échec        | `echec`        | Tentative de livraison échouée        |
| Retournée    | `retournee`    | Retour au dépanneur après échec       |

### Transitions autorisées

| De             | Vers           | Déclencheur                    |
| -------------- | -------------- | ------------------------------ |
| `non_assignee` | `assignee`     | Dépanneur assigne un livreur   |
| `assignee`     | `en_route`     | Livreur confirme le départ     |
| `assignee`     | `non_assignee` | Réassignation (livreur annule) |
| `en_route`     | `arrivee`      | Livreur signale arrivée        |
| `en_route`     | `echec`        | Incident en route              |
| `arrivee`      | `livree`       | Livreur confirme la remise     |
| `arrivee`      | `echec`        | Client absent ou refus         |
| `echec`        | `retournee`    | Livreur retourne au dépanneur  |
| `echec`        | `assignee`     | Nouvelle tentative (V2)        |

### Règles

- La livraison est créée automatiquement quand la commande passe en `prete`.
- Les états `livree` et `retournee` sont terminaux et irréversibles.
- Chaque transition est horodatée et journalisée (DEP-0585, DEP-0588–DEP-0589).

---

## DEP-0583 — Machine d'état du paiement à la livraison

### Objectif

Définir les états du paiement dans le modèle depaneurIA V1 où le paiement
se fait **à la livraison** (pas de pré-paiement en ligne en V1).

### États

| État         | Identifiant             | Description                                     |
| ------------ | ----------------------- | ----------------------------------------------- |
| En attente   | `paiement_attente`      | Commande acceptée, paiement non encore collecté |
| Collecté     | `paiement_collecte`     | Livreur a collecté le paiement                  |
| Non collecté | `paiement_non_collecte` | Livraison échouée, paiement non collecté        |
| Litige       | `paiement_litige`       | Montant contesté ou incident signalé            |

### Transitions autorisées

| De                      | Vers                    | Déclencheur                          |
| ----------------------- | ----------------------- | ------------------------------------ |
| `paiement_attente`      | `paiement_collecte`     | Livreur confirme remise + paiement   |
| `paiement_attente`      | `paiement_non_collecte` | Livraison échouée (DEP-0582 `echec`) |
| `paiement_collecte`     | `paiement_litige`       | Signalement incident montant         |
| `paiement_non_collecte` | `paiement_litige`       | Signalement incident                 |

### Modes de paiement acceptés V1

| Mode            | Identifiant |
| --------------- | ----------- |
| Espèces         | `especes`   |
| Carte sur place | `carte_tpe` |

### Règles

- En V1, il n'existe pas de pré-paiement en ligne — le paiement est toujours
  collecté à la livraison.
- Le mode de paiement est sélectionné par le client lors de la commande et
  confirmé par le livreur.
- L'état `paiement_litige` est traité manuellement par le super administrateur
  (DEP-0594).

---

## DEP-0584 — Machine d'état de disponibilité des produits

### Objectif

Définir les états de disponibilité d'une variante de produit, les transitions
autorisées et les déclencheurs.

### États (DEP-0248)

| État         | Identifiant    | Description                                    |
| ------------ | -------------- | ---------------------------------------------- |
| En stock     | `en_stock`     | Quantité disponible normale                    |
| Faible stock | `faible_stock` | Quantité basse (seuil configurable par tenant) |
| Rupture      | `rupture`      | Aucune unité disponible                        |
| Archivé      | `archive`      | Retiré du catalogue actif (DEP-0251)           |

### Transitions autorisées

| De             | Vers           | Déclencheur                            |
| -------------- | -------------- | -------------------------------------- |
| `en_stock`     | `faible_stock` | Quantité descend sous le seuil bas     |
| `en_stock`     | `rupture`      | Quantité atteint 0                     |
| `faible_stock` | `en_stock`     | Réapprovisionnement                    |
| `faible_stock` | `rupture`      | Quantité atteint 0                     |
| `rupture`      | `en_stock`     | Réapprovisionnement                    |
| `rupture`      | `faible_stock` | Réapprovisionnement partiel            |
| Tout état      | `archive`      | Décision dépanneur (retrait catalogue) |
| `archive`      | `en_stock`     | Réactivation par le dépanneur          |

### Seuil de faible stock

- Valeur par défaut : **5 unités** par variante.
- Configurable par tenant dans les paramètres catalogue (V2).

### Règles

- La mise à jour de disponibilité est déclenchée par : vente validée,
  réapprovisionnement manuel, import (DEP-0248 `source`).
- Un produit `archive` n'est jamais affiché dans la boutique ni proposé par
  l'assistant.
- Les transitions vers `archive` nécessitent une action explicite du dépanneur.

---

## DEP-0585 — Historique détaillé des changements d'état

### Objectif

Définir la structure de l'historique des transitions d'état enregistrées
pour chaque entité (commande, livraison, paiement, disponibilité produit).

### Structure d'une entrée d'historique

| Champ          | Type     | Description                                                    |
| -------------- | -------- | -------------------------------------------------------------- |
| `id`           | uuid     | Identifiant unique de l'entrée                                 |
| `entity_type`  | string   | Type d'entité (`commande`, `livraison`, `paiement`, `produit`) |
| `entity_id`    | uuid     | Identifiant de l'entité concernée                              |
| `from_state`   | string   | État avant la transition (null si création)                    |
| `to_state`     | string   | État après la transition                                       |
| `triggered_by` | string   | Rôle de l'acteur (`client`, `depanneur`, `livreur`, `systeme`) |
| `actor_id`     | uuid     | Identifiant de l'acteur (null si système)                      |
| `timestamp`    | datetime | Horodatage exact (UTC)                                         |
| `note`         | string   | Commentaire optionnel (motif, incident, etc.)                  |

### Règles

- **Toute transition d'état** d'une commande, livraison ou paiement génère une
  entrée dans cet historique.
- L'historique est **immuable** : aucune entrée ne peut être modifiée ni
  supprimée.
- L'historique est accessible en lecture seule par le super administrateur
  (DEP-0594) et partiellement par le dépanneur (DEP-0592).
- Rétention : **2 ans** pour les commandes, **6 mois** pour la disponibilité
  produit.

---

## DEP-0586 — Horodatage de création de commande

### Objectif

Définir le moment exact et la structure de l'horodatage enregistré lors de
la création d'une commande.

### Moment de déclenchement

La commande est créée — et l'horodatage enregistré — au moment où le client
clique sur « Commander » et que la validation côté serveur réussit
(DEP-0192, passage panier → commande).

### Structure

| Champ          | Valeur                                      |
| -------------- | ------------------------------------------- |
| `created_at`   | datetime UTC (ex. : `2026-03-13T14:32:00Z`) |
| `entity_type`  | `commande`                                  |
| `from_state`   | `null`                                      |
| `to_state`     | `en_attente`                                |
| `triggered_by` | `client`                                    |

### Règles

- L'horodatage de création est **immuable** après enregistrement.
- Il sert de référence pour le calcul du délai d'acceptation (DEP-0493,
  expiration à 10 min) et pour le tri FIFO des files (DEP-0485).

---

## DEP-0587 — Horodatage d'acceptation de commande

### Objectif

Définir le moment exact enregistré lorsque le dépanneur accepte une commande.

### Moment de déclenchement

Enregistré au moment où l'action « Accepter » (DEP-0493) est confirmée côté
serveur : transition `en_attente` → `en_preparation`.

### Structure

| Champ          | Valeur           |
| -------------- | ---------------- |
| `accepted_at`  | datetime UTC     |
| `entity_type`  | `commande`       |
| `from_state`   | `en_attente`     |
| `to_state`     | `en_preparation` |
| `triggered_by` | `depanneur`      |

### Règles

- Utilisé pour calculer le **délai de préparation** (affiché dans la fiche
  commande, DEP-0492).
- Si la commande expire (non acceptée dans les 10 min), l'horodatage
  d'expiration est enregistré à la place, avec `triggered_by = "systeme"`.

---

## DEP-0588 — Horodatage de départ livreur

### Objectif

Définir le moment exact enregistré lorsque le livreur quitte le dépanneur
avec la commande.

### Moment de déclenchement

Enregistré lorsque le livreur confirme son départ depuis son interface :
transition livraison `assignee` → `en_route`.

### Structure

| Champ          | Valeur       |
| -------------- | ------------ |
| `departed_at`  | datetime UTC |
| `entity_type`  | `livraison`  |
| `from_state`   | `assignee`   |
| `to_state`     | `en_route`   |
| `triggered_by` | `livreur`    |

### Règles

- Sert à calculer le **temps de trajet estimé** affiché au client (DEP-0591).
- Si le livreur ne confirme pas son départ, l'horodatage reste nul et une
  alerte est générée dans la file « Prêtes à partir » (DEP-0487).

---

## DEP-0589 — Horodatage de livraison

### Objectif

Définir le moment exact enregistré lorsque la livraison est confirmée par
le livreur.

### Moment de déclenchement

Enregistré lorsque le livreur confirme la remise au client depuis son
interface : transition livraison `arrivee` → `livree` et commande
`en_livraison` → `livree`.

### Structure

| Champ          | Valeur       |
| -------------- | ------------ |
| `delivered_at` | datetime UTC |
| `entity_type`  | `livraison`  |
| `from_state`   | `arrivee`    |
| `to_state`     | `livree`     |
| `triggered_by` | `livreur`    |

### Règles

- Déclenche la mise à jour de la « dernière commande » (DEP-0576).
- Déclenche la mise à jour du score de popularité des produits (DEP-0575).
- Déclenche le passage du paiement à `paiement_collecte` si collecté
  simultanément (DEP-0583).
- Horodatage immuable après enregistrement.

---

## DEP-0590 — Horodatage de paiement à la livraison

### Objectif

Définir le moment exact enregistré lors de la collecte du paiement par le
livreur.

### Moment de déclenchement

Enregistré simultanément ou immédiatement après la confirmation de livraison
(DEP-0589) lorsque le livreur confirme avoir collecté le paiement.

### Structure

| Champ          | Valeur                     |
| -------------- | -------------------------- |
| `paid_at`      | datetime UTC               |
| `entity_type`  | `paiement`                 |
| `from_state`   | `paiement_attente`         |
| `to_state`     | `paiement_collecte`        |
| `triggered_by` | `livreur`                  |
| `mode`         | `especes` ou `carte_tpe`   |
| `amount`       | Montant collecté (decimal) |

### Règles

- Si le livreur collecte le paiement sans confirmer la livraison →
  séquence invalide : la livraison doit être confirmée en premier.
- Le montant collecté doit correspondre au montant total TTC de la commande.
  Tout écart déclenche un état `paiement_litige` (DEP-0583).

---

## DEP-0591 — Affichage de suivi pour le client

### Objectif

Définir la vue de suivi de commande accessible au client sur sa page de
suivi (`/commandes/:id`).

### Structure de la timeline

| Étape          | Icône | Condition d'affichage           |
| -------------- | ----- | ------------------------------- |
| Commande reçue | ✅    | Toujours (dès création)         |
| Acceptée       | ✅    | Après `accepted_at` (DEP-0587)  |
| En préparation | 🔄    | État `en_preparation`           |
| Prête          | 📦    | État `prete`                    |
| En route       | 🚗    | Après `departed_at` (DEP-0588)  |
| Livrée         | 🎉    | Après `delivered_at` (DEP-0589) |

### Informations affichées

| Information                | Condition                              |
| -------------------------- | -------------------------------------- |
| Statut actuel (texte)      | Toujours                               |
| Horodatage de chaque étape | Une fois l'étape franchie              |
| Nom du livreur             | Après assignation (optionnel V1)       |
| Temps estimé restant       | Après `departed_at`, si ETA calculable |
| Montant total TTC          | Toujours                               |
| Mode de paiement attendu   | Toujours                               |

### Règles

- La vue est accessible sans rechargement (temps réel via polling ou
  websocket en V2).
- En cas d'annulation, la timeline s'arrête à l'étape atteinte avec un
  message explicatif (DEP-0196).
- En cas d'incident, le client voit : « Votre commande rencontre un problème.
  Nous vous tenons informé. »
- Aucun détail interne (motif dépanneur, note livreur) n'est exposé au client.

---

## DEP-0592 — Affichage de suivi pour le dépanneur

### Objectif

Définir la vue de suivi d'une commande accessible au dépanneur depuis sa
fiche détail (DEP-0492).

### Informations affichées

| Information                  | Détail                                     |
| ---------------------------- | ------------------------------------------ |
| Statut actuel + badge coloré | Selon machine d'état DEP-0581              |
| Timeline des transitions     | Chaque étape avec horodatage et acteur     |
| Chronomètre de préparation   | Temps écoulé depuis `accepted_at`          |
| Disponibilité des articles   | Temps réel (DEP-0584)                      |
| Informations client          | Nom, téléphone, adresse, note livraison    |
| Livreur assigné              | Nom + statut livraison (DEP-0582)          |
| Récapitulatif financier      | Sous-total, taxes, frais, total TTC        |
| Historique de la commande    | Transitions DEP-0585 (acteur + horodatage) |

### Règles

- L'historique complet (DEP-0585) est visible par le dépanneur pour sa
  propre boutique uniquement.
- Le dépanneur ne voit pas les commandes des autres tenants.
- La vue est actualisée en temps réel (polling 30s en V1).

---

## DEP-0593 — Affichage de suivi pour le livreur

### Objectif

Définir la vue de suivi accessible au livreur depuis son interface mobile,
orientée action et lisibilité terrain.

### Informations affichées (par commande assignée)

| Information            | Format                                          |
| ---------------------- | ----------------------------------------------- |
| Nom du client          | Prénom + initiale nom                           |
| Adresse de livraison   | Adresse complète, cliquable → navigation GPS    |
| Téléphone client       | Cliquable → appel direct                        |
| Note de livraison      | Affichée si présente (DEP-0291)                 |
| Liste des articles     | Nom + quantité (lecture seule)                  |
| Montant à collecter    | Total TTC + mode de paiement attendu            |
| Statut de la livraison | Badge selon machine d'état DEP-0582             |
| Actions disponibles    | Selon état : Partir / Arrivé / Livré / Incident |

### Actions disponibles par état

| État livraison | Actions                                            |
| -------------- | -------------------------------------------------- |
| `assignee`     | « Confirmer le départ » (DEP-0588)                 |
| `en_route`     | « Signaler arrivée »                               |
| `arrivee`      | « Confirmer la livraison » + « Signaler incident » |
| `echec`        | « Retourner au dépanneur »                         |

### Règles

- L'interface livreur est **mobile-first** — optimisée pour une utilisation
  en déplacement (boutons larges, info essentielle en premier).
- Le livreur ne voit que ses commandes assignées — pas les autres.
- Aucune donnée financière détaillée (sous-totaux, taxes) — uniquement le
  **montant total à collecter**.

---

## DEP-0594 — Affichage de suivi pour le super administrateur

### Objectif

Définir la vue de suivi globale accessible au super administrateur, couvrant
l'ensemble des tenants, commandes et incidents.

### Périmètre d'accès

Le super administrateur a accès en lecture à **toutes les commandes, tous les
tenants, tous les livreurs et tous les historiques**.

### Tableau de bord principal

| Métrique                      | Granularité             |
| ----------------------------- | ----------------------- |
| Commandes reçues              | Jour / semaine / mois   |
| Commandes livrées             | Par tenant, par livreur |
| Commandes annulées / refusées | Par tenant, motif       |
| Commandes en problème actives | Temps réel              |
| Délai moyen d'acceptation     | Par tenant              |
| Délai moyen de livraison      | Par tenant, par livreur |
| Taux de succès livraison      | Par tenant, global      |
| Litiges paiement en cours     | Temps réel              |

### Vue détail par commande

| Information                   | Détail                                |
| ----------------------------- | ------------------------------------- |
| Historique complet (DEP-0585) | Toutes les transitions, tous acteurs  |
| Données client                | Complètes (accès administrateur)      |
| Données dépanneur             | Complètes                             |
| Données livreur               | Complètes                             |
| État paiement (DEP-0583)      | Complet, incluant litiges             |
| Journaux système              | Transitions automatiques, expirations |

### Actions disponibles

| Action                                     | Condition                          |
| ------------------------------------------ | ---------------------------------- |
| Résoudre un litige paiement                | État `paiement_litige`             |
| Forcer le changement d'état d'une commande | Cas exceptionnels documentés       |
| Réassigner un livreur                      | Livraison `assignee` ou `en_route` |
| Exporter l'historique d'une commande       | Toujours disponible                |

### Règles

- Toute action du super administrateur est **journalisée** dans DEP-0585
  (`triggered_by = "admin"`).
- Le forçage d'état est une action exceptionnelle — elle nécessite une note
  obligatoire enregistrée dans l'historique.
- L'accès au super administrateur est protégé par une authentification forte
  (2FA requis en V1).

---

## Synthèse du bloc DEP-0575–DEP-0594

| DEP      | Sujet                         | Décision clé                                                       |
| -------- | ----------------------------- | ------------------------------------------------------------------ |
| DEP-0575 | Popularité produits           | Score pondéré 30j, recalcul horaire, top 10, par tenant            |
| DEP-0576 | Dernière commande             | Seules commandes `livree` comptent, mis à jour à DEP-0589          |
| DEP-0577 | Recommandation historique     | Top 5 variantes fréquentes, complété par populaires, déterministe  |
| DEP-0578 | Rétention panier abandonné    | 7 j si abandonné, 30 j si actif non converti                       |
| DEP-0579 | Nettoyage paniers             | Quotidien, soft delete, jamais si commande en cours                |
| DEP-0580 | Relance douce panier          | 1 seule push après 2h, jamais de prix mentionné                    |
| DEP-0581 | Machine d'état commandes      | 7 états, transitions strictes, états terminaux irréversibles       |
| DEP-0582 | Machine d'état livraisons     | 7 états, déclencheurs par acteur, terminaux irréversibles          |
| DEP-0583 | Machine d'état paiement       | 4 états, paiement à la livraison uniquement en V1                  |
| DEP-0584 | Machine d'état disponibilité  | 4 états, seuil faible stock = 5 unités par défaut                  |
| DEP-0585 | Historique changements d'état | Immuable, tous acteurs, rétention 2 ans commandes                  |
| DEP-0586 | Horodatage création commande  | `created_at` UTC, déclenche délai acceptation 10 min               |
| DEP-0587 | Horodatage acceptation        | `accepted_at` UTC, démarre chrono préparation                      |
| DEP-0588 | Horodatage départ livreur     | `departed_at` UTC, base ETA client                                 |
| DEP-0589 | Horodatage livraison          | `delivered_at` UTC, déclenche popularité + dernière commande       |
| DEP-0590 | Horodatage paiement           | `paid_at` UTC + mode + montant, après livraison                    |
| DEP-0591 | Suivi client                  | Timeline 6 étapes, temps réel, aucun détail interne exposé         |
| DEP-0592 | Suivi dépanneur               | Timeline complète + chrono + dispo temps réel + financier          |
| DEP-0593 | Suivi livreur                 | Mobile-first, actions par état, montant total uniquement           |
| DEP-0594 | Suivi super administrateur    | Dashboard global, historique complet, actions forcées journalisées |
