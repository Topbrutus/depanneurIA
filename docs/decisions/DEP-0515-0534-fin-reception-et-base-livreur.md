# DEP-0515 à DEP-0534 — Fin de la réception dépanneur et interface livreur de base

## Périmètre

Ce document complète les spécifications de **réception des commandes côté dépanneur** (DEP-0481 à DEP-0514) et définit les **bases de l'interface livreur** : listes de livraisons (disponibles, assignées, terminées), fiche de livraison, informations client essentielles et actions de base du livreur.

Ces décisions s'appuient sur :
- Les statuts de commande définis dans DEP-0192–DEP-0196
- Les actions de base dépanneur définies dans DEP-0481–DEP-0494
- Les tons visuels définis pour le livreur (DEP-0366)

Il s'agit exclusivement de **documentation** : aucun code produit, aucune implémentation. Les spécifications décrites ici serviront de référence pour les futures implémentations front-end et back-end.

**Référence parente** : Blocs DEP-0481 à DEP-0560 (réception dépanneur et livraison)

---

## DEP-0515 — Bouton « prête pour livraison »

### Objectif

Permettre au dépanneur de marquer une commande comme **prête à être livrée**, déclenchant ainsi l'assignation possible à un livreur.

### Emplacement

| Contexte                            | Emplacement du bouton                                          |
|-------------------------------------|----------------------------------------------------------------|
| Fiche détail commande               | Barre d'actions en bas (desktop) ou bouton flottant (mobile)  |
| États de commande compatibles       | « En préparation » uniquement (DEP-0486)                       |

### Comportement

| Moment                              | Action système                                                 |
|-------------------------------------|----------------------------------------------------------------|
| Clic sur le bouton                  | Ouvre une modal de confirmation                                |
| Confirmation                        | Change le statut de la commande en « Prête à livrer »          |
| Annulation                          | Aucun changement, retour à la fiche                            |

### Contenu de la confirmation

> « Marquer la commande #[ID] comme prête pour livraison ? »

| Élément        | Valeur                                                         |
|----------------|----------------------------------------------------------------|
| Titre          | « Commande prête ? »                                           |
| Message        | « Confirmez que la commande #[ID] est prête à être livrée. »  |
| Bouton principal | « Confirmer » (fond vert, action de validation)              |
| Bouton secondaire | « Annuler » (fond neutre)                                   |

### Règles

- Le bouton n'est visible que si la commande est en statut « En préparation ».
- Une fois confirmée, la commande passe dans la file « Prêtes à partir » (DEP-0487).
- Une notification est envoyée au système d'assignation des livreurs.
- Le bouton disparaît après confirmation et est remplacé par « Assigner à un livreur » (DEP-0497).

### Libellé du bouton

« Prête pour livraison »

---

## DEP-0516 — Indicateur d'urgence si commande trop vieille

### Objectif

Afficher visuellement les commandes qui dépassent un délai d'attente critique pour alerter le dépanneur.

### Seuils de déclenchement

| Statut de commande    | Seuil d'urgence                      | Indicateur visuel                   |
|-----------------------|--------------------------------------|-------------------------------------|
| En attente            | > 5 minutes                          | Badge orange « Urgent »             |
| En préparation        | > 15 minutes                         | Badge orange « Urgent »             |
| Prête à livrer        | > 10 minutes sans assignation        | Badge rouge « Très urgent »         |

### Affichage

| Contexte                            | Emplacement de l'indicateur                                    |
|-------------------------------------|----------------------------------------------------------------|
| Liste des commandes                 | Badge coloré à côté de l'heure de création                     |
| Fiche détail commande               | Bandeau en haut de la fiche avec temps écoulé                  |

### Contenu du badge

| Niveau           | Texte badge       | Couleur de fond  | Couleur de texte  |
|------------------|-------------------|------------------|-------------------|
| Urgent           | « Urgent »        | `--color-alert` (orange) | Blanc       |
| Très urgent      | « Très urgent »   | `--color-error` (rouge)  | Blanc       |

### Comportement dynamique

- L'indicateur se met à jour automatiquement toutes les 30 secondes.
- Si la commande change d'état (ex. passe en préparation), le compteur repart à zéro.
- Un son d'alerte supplémentaire (DEP-0517) peut être déclenché au passage en « Très urgent ».

### Règles

- Le badge s'affiche uniquement si le seuil est dépassé.
- Les commandes « Très urgentes » sont automatiquement remontées en haut de leur file.
- Les commandes « Livrées », « Annulées » ou « Problématiques » n'affichent pas d'indicateur d'urgence.

---

## DEP-0517 — Son d'alerte configurable

### Objectif

Permettre au dépanneur de configurer un signal sonore pour les alertes critiques (nouvelle commande, commande urgente).

### Types d'alertes sonores

| Événement                           | Son par défaut                | Configurable    |
|-------------------------------------|-------------------------------|-----------------|
| Nouvelle commande reçue             | Bip court (type caisse)       | Oui             |
| Commande passe en « Très urgent »   | Double bip insistant          | Oui             |
| Alerte technique/système            | Son système natif             | Non             |

### Configuration disponible

| Paramètre                           | Options                                                        |
|-------------------------------------|----------------------------------------------------------------|
| Activation/désactivation            | ON/OFF global pour tous les sons                               |
| Choix du son                        | Liste prédéfinie (5 options : bip, cloche, sirène douce, ding, ping) |
| Volume                              | Curseur 0–100 % (défaut : 75 %)                               |
| Répétition son urgence              | 1 fois, 3 fois, ou continu jusqu'à action                      |

### Accès à la configuration

- Menu du dépanneur > « Paramètres » > « Sons et alertes »
- Possibilité de tester chaque son avant validation.

### Stockage

- Les préférences de son sont enregistrées **par point de vente** (tenant).
- Les préférences sont sauvegardées dans le profil dépanneur et appliquées automatiquement à la connexion.

### Règles

- Les sons ne sont joués que si le navigateur/app est au premier plan ou si les notifications audio sont autorisées.
- Les sons peuvent être désactivés temporairement via un bouton « Mode silencieux » dans le header.
- Le son par défaut est « Bip court » avec volume à 75 %.

---

## DEP-0518 — Configuration d'horaires du dépanneur

### Objectif

Permettre au dépanneur de définir ses **horaires d'ouverture** pour gérer la réception des commandes selon sa disponibilité.

### Structure des horaires

| Élément                             | Description                                                    |
|-------------------------------------|----------------------------------------------------------------|
| Plages horaires hebdomadaires       | Définies par jour (lundi–dimanche)                             |
| Horaires multiples par jour         | Oui (ex. 9h–12h et 14h–19h)                                    |
| Jours fermés                        | Marqués explicitement (aucune plage définie)                   |
| Fermetures exceptionnelles          | Liste de dates spécifiques avec raison (ex. congés, férié)    |

### Configuration disponible

| Champ                               | Format                         | Exemple                          |
|-------------------------------------|--------------------------------|----------------------------------|
| Jour de la semaine                  | Lundi, Mardi, etc.             | Lundi                            |
| Heure d'ouverture                   | HH:MM (24h)                    | 09:00                            |
| Heure de fermeture                  | HH:MM (24h)                    | 19:00                            |
| Pause déjeuner                      | Optionnelle, HH:MM–HH:MM       | 12:00–14:00                      |
| Fermeture exceptionnelle            | Date, raison                   | 2026-12-25, « Noël »             |

### Comportement système

| Contexte                            | Comportement                                                   |
|-------------------------------------|----------------------------------------------------------------|
| En dehors des horaires              | Affichage « Fermé actuellement » sur l'app client              |
| Appels téléphoniques hors horaires  | Message vocal « Fermé, rappeler… » (DEP-0445)                  |
| Commandes déjà en cours             | Traitées normalement même après fermeture                      |

### Accès à la configuration

- Menu du dépanneur > « Paramètres » > « Horaires d'ouverture »
- Modifications en temps réel (effet immédiat après sauvegarde).

### Règles

- Par défaut, aucune plage horaire n'est définie (dépanneur fermé jusqu'à configuration).
- Les horaires sont visibles publiquement sur l'interface client (page d'accueil ou info dépanneur).
- Les changements d'horaires sont journalisés pour audit.

---

## DEP-0519 — Configuration de la zone de livraison du dépanneur

### Objectif

Permettre au dépanneur de définir sa **zone de couverture géographique** pour limiter les commandes aux adresses livrables.

### Structure de la zone

| Élément                             | Description                                                    |
|-------------------------------------|----------------------------------------------------------------|
| Type de zone                        | Liste de codes postaux OU rayon kilométrique                   |
| Codes postaux desservis             | Liste explicite (ex. 75001, 75002, 75003)                      |
| Rayon depuis le dépanneur           | Distance en km depuis l'adresse du point de vente              |
| Adresses exclues                    | Liste d'adresses spécifiques non desservies (optionnel)        |

### Configuration disponible

| Champ                               | Format                         | Exemple                          |
|-------------------------------------|--------------------------------|----------------------------------|
| Mode de zone                        | Codes postaux / Rayon          | Rayon                            |
| Rayon de livraison (km)             | Nombre décimal                 | 5.0                              |
| Liste codes postaux                 | Texte, séparés par virgule     | 75001, 75002, 75003              |
| Adresses exclues                    | Liste (adresse complète)       | « 123 rue Example, 75001 Paris » |

### Comportement système

| Contexte                            | Comportement                                                   |
|-------------------------------------|----------------------------------------------------------------|
| Adresse client hors zone            | Message d'erreur « Zone non desservie » (DEP-0311)             |
| Validation d'adresse (DEP-0285)     | Vérification automatique contre la zone configurée             |
| Appel téléphonique hors zone        | Message vocal « Zone non couverte » (DEP-0446)                 |

### Visualisation

- Carte interactive (OpenStreetMap ou équivalent) affichant la zone de couverture.
- Possibilité de dessiner une zone personnalisée sur la carte (V2).

### Accès à la configuration

- Menu du dépanneur > « Paramètres » > « Zone de livraison »
- Modifications en temps réel (effet immédiat après sauvegarde).

### Règles

- Par défaut, aucune zone n'est définie (aucune commande acceptée jusqu'à configuration).
- Les zones sont validées à la création du compte dépanneur.
- Les changements de zone sont journalisés pour audit.

---

## DEP-0520 — Gel de la réception des commandes V1 côté dépanneur

### Objectif

Marquer la **fermeture fonctionnelle du périmètre de réception des commandes V1** côté dépanneur.

### Périmètre gelé

Ce gel couvre les décisions **DEP-0481 à DEP-0520**, incluant :

| Bloc fonctionnel                    | Décisions couvertes                                            |
|-------------------------------------|----------------------------------------------------------------|
| Interface de réception              | DEP-0481                                                       |
| Alertes nouvelles commandes         | DEP-0482, DEP-0483, DEP-0484                                   |
| Files de commandes                  | DEP-0485, DEP-0486, DEP-0487, DEP-0488, DEP-0489, DEP-0490     |
| Colonnes et fiche détail            | DEP-0491, DEP-0492                                             |
| Actions de base                     | DEP-0493, DEP-0494, DEP-0495, DEP-0496, DEP-0497               |
| Actions avancées                    | DEP-0498 à DEP-0507                                            |
| Logiques métier                     | DEP-0508, DEP-0509, DEP-0510                                   |
| Création des interfaces             | DEP-0511, DEP-0512, DEP-0513, DEP-0514                         |
| Finalisations                       | DEP-0515, DEP-0516, DEP-0517, DEP-0518, DEP-0519               |

### Critères de gel

| Critère                             | Statut requis                                                  |
|-------------------------------------|----------------------------------------------------------------|
| Documentation complète              | ✅ Toutes les décisions DEP-0481–DEP-0520 documentées          |
| Cohérence inter-blocs               | ✅ Références croisées validées avec DEP-0192–DEP-0196         |
| Revue équipe                        | ⏳ À faire avant implémentation                                |
| Tests utilisateur                   | ⏳ À faire après implémentation                                |

### Prochaines étapes

Une fois ce gel validé, les prochains blocs à traiter sont :
- **DEP-0521 à DEP-0560** : Interface livreur complète (listes, fiches, actions, statuts, assignation, livraison).

### Interdictions post-gel

- ❌ Aucune nouvelle fonctionnalité ne doit être ajoutée dans ce périmètre avant validation V1.
- ❌ Modifications uniquement si bug critique ou incohérence majeure détectée.
- ✅ Clarifications et précisions mineures sont autorisées via amendements documentés.

---

## DEP-0521 — Interface minimale du livreur

### Objectif

Définir la page principale depuis laquelle le livreur consulte et gère ses livraisons.

### Structure de la page

| Zone             | Contenu                                                         | Position desktop       | Position mobile          |
|------------------|-----------------------------------------------------------------|------------------------|--------------------------|
| Header           | Logo, nom du livreur, statut actif/inactif, notifications       | Haut — pleine largeur  | Haut — pleine largeur    |
| Barre de statuts | Onglets des listes de livraisons (DEP-0522–DEP-0524)           | Sous le header         | Sous le header (scroll)  |
| Zone principale  | Liste des livraisons de l'onglet actif                          | Corps principal        | Corps principal          |
| Panneau détail   | Fiche détail d'une livraison sélectionnée (DEP-0525)           | Colonne droite (split) | Modal plein écran        |

### Accès

- L'interface livreur est accessible depuis `/livreur/livraisons`.
- Elle est réservée aux utilisateurs avec le rôle `livreur` ou `admin`.
- La page s'affiche en mode **temps réel** : les nouvelles assignations apparaissent sans rechargement manuel.

### Comportement général

- L'onglet actif par défaut à l'ouverture est **« Disponibles »** (DEP-0522).
- Une pastille de comptage affiche le nombre de livraisons dans chaque liste.
- La page est optimisée pour mobile (utilisation terrain en priorité).

### Statut du livreur

| Statut           | Signification                                                  | Action disponible      |
|------------------|----------------------------------------------------------------|------------------------|
| Actif            | Disponible pour recevoir des assignations                      | Peut accepter/refuser  |
| Inactif          | Ne reçoit pas de nouvelles assignations                        | Doit finir livraisons en cours |
| En livraison     | Au moins une livraison en cours                                | Peut gérer livraisons actives |

Le livreur peut basculer entre « Actif » et « Inactif » via un toggle dans le header.

---

## DEP-0522 — Liste des livraisons disponibles

### Objectif

Afficher les livraisons proposées au livreur, qu'il peut accepter ou refuser.

### Contenu de la liste

| Colonne                             | Description                                                    |
|-------------------------------------|----------------------------------------------------------------|
| ID commande                         | Numéro unique (ex. #1234)                                      |
| Heure de création                   | HH:MM ou « il y a X min » si < 60 min                          |
| Adresse de livraison (courte)       | Ville ou quartier (adresse complète dans la fiche)             |
| Distance estimée                    | Depuis la position actuelle du livreur (ex. 2.3 km)            |
| Nombre d'articles                   | Total articles dans la commande                                |
| Mode de paiement                    | Espèces / CB / Prépayé                                         |

### Tri par défaut

- Les livraisons sont triées par **proximité** (distance croissante) par défaut.
- Le livreur peut trier manuellement par heure de création (plus ancien en premier).

### Actions disponibles

| Action           | Déclencheur                       | Effet                                |
|------------------|-----------------------------------|--------------------------------------|
| Voir détails     | Clic sur ligne                    | Ouvre fiche complète (DEP-0525)      |
| Accepter         | Bouton « Accepter »               | Assigne la livraison (DEP-0531)      |
| Refuser          | Bouton « Refuser »                | Retire de la liste (DEP-0532)        |

### Règles

- Seules les livraisons marquées « Prête à livrer » (DEP-0515) et non assignées sont visibles.
- Si le livreur est en statut « Inactif », la liste est vide avec message « Activez votre statut pour recevoir des livraisons ».
- Les livraisons refusées ne réapparaissent pas dans la liste du même livreur pendant 1 heure.

---

## DEP-0523 — Liste des livraisons assignées

### Objectif

Afficher les livraisons que le livreur a acceptées et qui sont en cours de traitement.

### Contenu de la liste

| Colonne                             | Description                                                    |
|-------------------------------------|----------------------------------------------------------------|
| ID commande                         | Numéro unique (ex. #1234)                                      |
| Statut livraison                    | En attente / En route / Arrivé                                 |
| Adresse de livraison (courte)       | Ville ou quartier                                              |
| Heure d'assignation                 | HH:MM                                                          |
| Temps écoulé                        | « il y a X min »                                               |
| Nombre d'articles                   | Total articles dans la commande                                |

### Tri par défaut

- Les livraisons sont triées par **heure d'assignation** (plus anciennes en premier).

### Actions disponibles

| Action           | Déclencheur                       | Effet                                |
|------------------|-----------------------------------|--------------------------------------|
| Voir détails     | Clic sur ligne                    | Ouvre fiche complète (DEP-0525)      |
| Partir           | Bouton « Partir »                 | Change statut en « En route » (DEP-0533) |
| Arrivé           | Bouton « Arrivé »                 | Change statut en « Arrivé » (DEP-0534) |

### Règles

- Une livraison reste dans cette liste tant qu'elle n'est pas marquée « Remise effectuée » (DEP-0535).
- Les livraisons en statut « En route » sont affichées en haut de la liste avec badge vert « En cours ».
- Si aucune livraison n'est assignée, afficher « Aucune livraison en cours ».

---

## DEP-0524 — Liste des livraisons terminées

### Objectif

Afficher l'historique des livraisons terminées par le livreur.

### Contenu de la liste

| Colonne                             | Description                                                    |
|-------------------------------------|----------------------------------------------------------------|
| ID commande                         | Numéro unique (ex. #1234)                                      |
| Date et heure de remise             | JJ/MM/AAAA HH:MM                                               |
| Adresse de livraison (courte)       | Ville ou quartier                                              |
| Statut final                        | Livrée / Client absent / Problème                              |
| Mode de paiement                    | Espèces / CB / Prépayé                                         |

### Tri par défaut

- Les livraisons sont triées par **date de remise décroissante** (plus récentes en premier).

### Actions disponibles

| Action           | Déclencheur                       | Effet                                |
|------------------|-----------------------------------|--------------------------------------|
| Voir détails     | Clic sur ligne                    | Ouvre fiche complète (lecture seule) |

### Règles

- Seules les 50 dernières livraisons terminées sont affichées par défaut.
- Un bouton « Voir plus » charge les 50 suivantes.
- Les livraisons terminées il y a plus de 30 jours sont archivées et non affichées (accès via filtres avancés en V2).

---

## DEP-0525 — Fiche d'une livraison côté livreur

### Objectif

Afficher toutes les informations nécessaires au livreur pour effectuer une livraison.

### Structure de la fiche

| Section                             | Contenu                                                        |
|-------------------------------------|----------------------------------------------------------------|
| Header                              | ID commande, statut, heure de création                         |
| Client                              | Nom, téléphone (DEP-0527), adresse complète (DEP-0526)         |
| Notes de livraison                  | Instructions spécifiques client (DEP-0528)                     |
| Contenu commande                    | Liste détaillée des articles (DEP-0529)                        |
| Paiement                            | Mode de paiement attendu (DEP-0530)                            |
| Actions                             | Boutons selon le statut de la livraison                        |

### Accès

- La fiche s'ouvre au clic sur une livraison depuis les listes (DEP-0522, DEP-0523, DEP-0524).
- En mode desktop, la fiche s'affiche dans un panneau à droite (split view).
- En mode mobile, la fiche s'ouvre en modal plein écran.

### Boutons d'action (selon statut)

| Statut livraison    | Boutons visibles                                               |
|---------------------|----------------------------------------------------------------|
| Disponible          | « Accepter », « Refuser »                                      |
| Assignée (attente)  | « Partir en livraison », « Appeler client »                    |
| En route            | « Arrivé sur place », « Appeler client », « Ouvrir navigation »|
| Arrivé              | « Remise effectuée », « Client absent », « Problème »          |

### Règles

- Les informations sensibles (téléphone, adresse complète) ne sont visibles que si la livraison est assignée au livreur.
- La fiche se met à jour en temps réel si le statut change (ex. commande annulée par le dépanneur).
- Un bouton « Fermer » permet de revenir à la liste.

---

## DEP-0526 — Affichage de l'adresse complète côté livreur

### Objectif

Afficher l'adresse de livraison dans un format clair et utilisable pour la navigation.

### Format d'affichage

| Élément                             | Exemple                                                        |
|-------------------------------------|----------------------------------------------------------------|
| Numéro et voie                      | 123 rue de la République                                       |
| Complément (optionnel)              | Bâtiment B, 3ème étage                                         |
| Code postal et ville                | 75001 Paris                                                    |
| Pays                                | France                                                         |
| Point de repère (optionnel)         | « Face à la boulangerie »                                      |

### Présentation visuelle

```
📍 Adresse de livraison

123 rue de la République
Bâtiment B, 3ème étage
75001 Paris
France

💡 Point de repère : Face à la boulangerie
```

### Actions associées

| Action           | Déclencheur                       | Effet                                |
|------------------|-----------------------------------|--------------------------------------|
| Copier l'adresse | Bouton « Copier »                 | Copie l'adresse complète dans le presse-papiers |
| Ouvrir navigation| Bouton « Itinéraire »             | Ouvre Google Maps/Waze avec l'adresse (DEP-0541) |

### Règles

- L'adresse complète n'est visible que si la livraison est assignée au livreur.
- Si le point de repère n'est pas renseigné, cette ligne n'est pas affichée.
- L'adresse est affichée en gros caractères lisibles (mobile first).

---

## DEP-0527 — Affichage du téléphone client côté livreur

### Objectif

Afficher le numéro de téléphone du client dans un format cliquable pour appel direct.

### Format d'affichage

| Élément                             | Exemple                                                        |
|-------------------------------------|----------------------------------------------------------------|
| Nom du client                       | Jean Dupont                                                    |
| Numéro de téléphone                 | +33 6 12 34 56 78 (format international E.164)                 |

### Présentation visuelle

```
📞 Contact client

Jean Dupont
+33 6 12 34 56 78

[Bouton : Appeler]
```

### Actions associées

| Action           | Déclencheur                       | Effet                                |
|------------------|-----------------------------------|--------------------------------------|
| Appeler          | Bouton « Appeler » ou clic sur numéro | Lance l'appel téléphonique (DEP-0540) |
| Copier numéro    | Appui long sur le numéro          | Copie le numéro dans le presse-papiers |

### Règles

- Le téléphone n'est visible que si la livraison est assignée au livreur.
- Le bouton « Appeler » utilise le protocole `tel:` (compatible mobile).
- Le numéro est affiché en gros caractères lisibles.

---

## DEP-0528 — Affichage des notes de livraison côté livreur

### Objectif

Afficher les instructions spécifiques du client pour faciliter la livraison.

### Contenu

| Élément                             | Description                                                    |
|-------------------------------------|----------------------------------------------------------------|
| Notes de livraison                  | Texte libre saisi par le client (DEP-0291)                     |
| Digicode (si renseigné)             | Affiché séparément, clairement visible                         |
| Étage/Bâtiment (si renseigné)       | Affiché avec l'adresse (DEP-0526)                              |

### Présentation visuelle

```
📝 Notes de livraison

« Sonnez 2 fois, je descends chercher la commande. »

🔢 Digicode : A1234B
```

### Règles

- Si aucune note n'est renseignée, afficher « Aucune note de livraison ».
- Le digicode est affiché en police monospace pour faciliter la lecture.
- Les notes longues (> 200 caractères) sont tronquées avec bouton « Voir plus ».

---

## DEP-0529 — Affichage du contenu de la commande côté livreur

### Objectif

Permettre au livreur de vérifier rapidement le contenu de la commande à livrer.

### Format d'affichage

| Colonne                             | Description                                                    |
|-------------------------------------|----------------------------------------------------------------|
| Nom du produit                      | Libellé court (DEP-0256)                                       |
| Quantité                            | Nombre d'unités                                                |
| Unité                               | Pièce / Litre / Kg / etc.                                      |

### Présentation visuelle

```
📦 Contenu de la commande (5 articles)

• 2× Plaquettes de frein avant
• 1× Filtre à huile
• 4× Ampoules H7
• 1× Liquide lave-glace (5L)
• 1× Balais essuie-glace (paire)
```

### Règles

- Les articles sont listés dans l'ordre du panier client.
- Le nombre total d'articles est affiché dans le titre.
- Les variantes de produits (taille, conditionnement) sont incluses dans le nom.

---

## DEP-0530 — Affichage du mode de paiement attendu côté livreur

### Objectif

Indiquer au livreur le mode de paiement attendu à la livraison.

### Modes de paiement possibles

| Mode                | Signification                                                  | Action livreur         |
|---------------------|----------------------------------------------------------------|------------------------|
| Espèces             | Le client paie en liquide à la livraison                       | Préparer monnaie       |
| CB sur place        | Le client paie par carte bancaire à la livraison (TPE)         | Avoir TPE mobile       |
| Prépayé             | Le client a déjà payé en ligne                                 | Aucun paiement attendu |

### Présentation visuelle

```
💳 Paiement

Mode : Espèces
Montant à encaisser : 45,80 €

⚠️ Prévoir la monnaie
```

### Règles

- Si le mode est « Prépayé », afficher « Aucun paiement à effectuer ».
- Si le mode est « Espèces », afficher le montant exact à encaisser et un rappel de prévoir la monnaie.
- Si le mode est « CB sur place », rappeler de vérifier que le TPE mobile est chargé.

---

## DEP-0531 — Action accepter une livraison

### Objectif

Permettre au livreur d'accepter une livraison proposée.

### Déclencheur

- Bouton « Accepter » dans la liste des livraisons disponibles (DEP-0522).
- Bouton « Accepter » dans la fiche détail d'une livraison disponible (DEP-0525).

### Comportement

| Étape                               | Action système                                                 |
|-------------------------------------|----------------------------------------------------------------|
| Clic sur « Accepter »               | Ouvre une modal de confirmation                                |
| Confirmation                        | Assigne la livraison au livreur et retire de la liste disponible |
| Annulation                          | Aucun changement, retour à la liste                            |

### Contenu de la confirmation

> « Accepter la livraison #[ID] ? »

| Élément        | Valeur                                                         |
|----------------|----------------------------------------------------------------|
| Titre          | « Accepter cette livraison ? »                                 |
| Message        | « Confirmez que vous prenez en charge la livraison #[ID]. »   |
| Détails        | Adresse courte, distance estimée, nombre d'articles            |
| Bouton principal | « Confirmer » (fond vert)                                    |
| Bouton secondaire | « Annuler » (fond neutre)                                   |

### Règles

- Une fois acceptée, la livraison passe dans la liste « Assignées » (DEP-0523).
- Le livreur reçoit une notification de confirmation.
- Le dépanneur est notifié de l'assignation.
- Le statut de la commande passe en « Assignée à un livreur ».

---

## DEP-0532 — Action refuser une livraison

### Objectif

Permettre au livreur de refuser une livraison proposée.

### Déclencheur

- Bouton « Refuser » dans la liste des livraisons disponibles (DEP-0522).
- Bouton « Refuser » dans la fiche détail d'une livraison disponible (DEP-0525).

### Comportement

| Étape                               | Action système                                                 |
|-------------------------------------|----------------------------------------------------------------|
| Clic sur « Refuser »                | Ouvre une modal de confirmation avec raison optionnelle        |
| Confirmation                        | Retire la livraison de la liste et la rend disponible pour d'autres livreurs |
| Annulation                          | Aucun changement, retour à la liste                            |

### Contenu de la confirmation

> « Refuser la livraison #[ID] ? »

| Élément        | Valeur                                                         |
|----------------|----------------------------------------------------------------|
| Titre          | « Refuser cette livraison ? »                                  |
| Message        | « La livraison sera proposée à un autre livreur. »             |
| Raison (optionnel) | Liste déroulante : Trop loin, Indisponible, Autre          |
| Bouton principal | « Confirmer » (fond neutre)                                  |
| Bouton secondaire | « Annuler » (fond neutre)                                   |

### Règles

- Une fois refusée, la livraison ne réapparaît pas dans la liste du livreur pendant 1 heure.
- La livraison reste dans la file « Disponible » pour les autres livreurs.
- Le dépanneur est notifié du refus (sans détail de la raison).
- Si aucun livreur n'accepte dans les 10 minutes, le dépanneur reçoit une alerte « Aucun livreur disponible ».

---

## DEP-0533 — Action partir en livraison

### Objectif

Permettre au livreur de marquer qu'il est en route vers le client.

### Déclencheur

- Bouton « Partir en livraison » dans la fiche détail d'une livraison assignée (DEP-0525).
- Bouton « Partir » dans la liste des livraisons assignées (DEP-0523).

### Comportement

| Étape                               | Action système                                                 |
|-------------------------------------|----------------------------------------------------------------|
| Clic sur « Partir en livraison »    | Change le statut de la livraison en « En route »               |
| Horodatage                          | Enregistre l'heure de départ                                   |
| Notification client                 | Envoie une notification « Votre livreur est en route »         |

### Présentation visuelle

Après le clic, le bouton change :

```
[Bouton : Partir en livraison] → [Badge vert : En route depuis X min]
```

### Règles

- Le bouton n'est visible que si la livraison est en statut « Assignée (attente) ».
- Une fois en route, le livreur ne peut plus annuler la livraison sans contacter le dépanneur.
- Le client reçoit une notification push/SMS selon ses préférences (DEP-0295).
- Le dépanneur voit le statut mis à jour en temps réel.

---

## DEP-0534 — Action arrivé sur place

### Objectif

Permettre au livreur de signaler qu'il est arrivé à l'adresse de livraison.

### Déclencheur

- Bouton « Arrivé sur place » dans la fiche détail d'une livraison en route (DEP-0525).
- Bouton « Arrivé » dans la liste des livraisons assignées (DEP-0523).

### Comportement

| Étape                               | Action système                                                 |
|-------------------------------------|----------------------------------------------------------------|
| Clic sur « Arrivé sur place »       | Change le statut de la livraison en « Arrivé »                 |
| Horodatage                          | Enregistre l'heure d'arrivée                                   |
| Notification client                 | Envoie une notification « Votre livreur est arrivé »           |

### Présentation visuelle

Après le clic, le bouton change et de nouveaux boutons apparaissent :

```
[Bouton : Arrivé sur place] → [Badge bleu : Arrivé depuis X min]

[Bouton : Remise effectuée]  [Bouton : Client absent]  [Bouton : Problème]
```

### Règles

- Le bouton n'est visible que si la livraison est en statut « En route ».
- Une fois arrivé, le livreur doit finaliser la livraison avec une des 3 actions :
  - « Remise effectuée » (DEP-0535)
  - « Client absent » (DEP-0536)
  - « Problème » (DEP-0506)
- Le client reçoit une notification push/SMS selon ses préférences.
- Le dépanneur voit le statut mis à jour en temps réel.

---

## Résumé des décisions

Ce document a défini **20 décisions** couvrant :

### Fin de la réception dépanneur (DEP-0515 à DEP-0520)
- DEP-0515 : Bouton « prête pour livraison »
- DEP-0516 : Indicateur d'urgence si commande trop vieille
- DEP-0517 : Son d'alerte configurable
- DEP-0518 : Configuration d'horaires du dépanneur
- DEP-0519 : Configuration de la zone de livraison du dépanneur
- DEP-0520 : Gel de la réception des commandes V1 côté dépanneur

### Interface livreur de base (DEP-0521 à DEP-0534)
- DEP-0521 : Interface minimale du livreur
- DEP-0522 : Liste des livraisons disponibles
- DEP-0523 : Liste des livraisons assignées
- DEP-0524 : Liste des livraisons terminées
- DEP-0525 : Fiche d'une livraison côté livreur
- DEP-0526 : Affichage de l'adresse complète côté livreur
- DEP-0527 : Affichage du téléphone client côté livreur
- DEP-0528 : Affichage des notes de livraison côté livreur
- DEP-0529 : Affichage du contenu de la commande côté livreur
- DEP-0530 : Affichage du mode de paiement attendu côté livreur
- DEP-0531 : Action accepter une livraison
- DEP-0532 : Action refuser une livraison
- DEP-0533 : Action partir en livraison
- DEP-0534 : Action arrivé sur place

---

## Références

| Bloc                                | Document de décision                                           |
|-------------------------------------|----------------------------------------------------------------|
| DEP-0192–DEP-0196                   | Statuts de commande et transitions                             |
| DEP-0201–DEP-0240                   | Système visuel de base                                         |
| DEP-0291–DEP-0300                   | Notes client et consentements                                  |
| DEP-0365                            | Ton visuel dépanneur                                           |
| DEP-0366                            | Ton visuel livreur                                             |
| DEP-0481–DEP-0494                   | Réception commandes dépanneur (base)                           |

---

## Validation

| Critère                             | Statut                                                         |
|-------------------------------------|----------------------------------------------------------------|
| Documentation complète              | ✅ DEP-0515 à DEP-0534 documentés                              |
| Cohérence avec blocs précédents     | ✅ Références croisées validées                                |
| Format conforme                     | ✅ Structure standard respectée                                |
| Périmètre respecté                  | ✅ Documentation uniquement, aucun code produit                |

---

**Fin du document DEP-0515 à DEP-0534**
