# DEP-0855 à DEP-0874 — Journaux et tableaux de bord

## Périmètre

Ce fichier couvre le sous-bloc d'observabilité et d'analyse opérationnelle de la checklist :

| Plage               | Thème                                         |
| ------------------- | --------------------------------------------- |
| DEP-0855            | Journal d'événements téléphoniques            |
| DEP-0856 à DEP-0874 | Tableaux de bord opérationnels et analytiques |

Contrainte absolue : documentation décisionnelle uniquement — aucun dashboard réel, aucun code produit.

---

## DEP-0855 — Journal d'événements téléphoniques

### Objectif

Définir la structure et le contenu du journal qui enregistre chaque événement survenu lors d'un appel téléphonique.

### Structure d'un événement

| Champ              | Type        | Description                                                                                                              |
| ------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| `event_id`         | UUID v4     | Identifiant unique de l'événement                                                                                        |
| `call_id`          | UUID v4     | Identifiant de l'appel parent                                                                                            |
| `tenant_id`        | UUID v4     | Tenant concerné                                                                                                          |
| `event_type`       | enum        | `call_started`, `call_ended`, `dtmf_received`, `speech_recognized`, `order_created`, `order_failed`, `timeout`, `hangup` |
| `timestamp`        | ISO 8601    | Horodatage UTC de l'événement                                                                                            |
| `duration_ms`      | entier      | Durée de l'étape en millisecondes                                                                                        |
| `input_raw`        | texte       | Transcription brute de la commande vocale (si applicable)                                                                |
| `intent_detected`  | texte       | Intention reconnue (si applicable)                                                                                       |
| `confidence_score` | décimal 0–1 | Score de confiance de la reconnaissance                                                                                  |
| `error_code`       | texte       | Code d'erreur si applicable, null sinon                                                                                  |
| `metadata`         | JSON        | Données contextuelles supplémentaires (non PII)                                                                          |

### Règles

- Aucun numéro de téléphone complet en clair dans `input_raw` (masqué si mentionné).
- Les événements sont écrits en append-only (pas de modification, pas de suppression avant TTL).
- Rétention : 30 jours actifs, 90 jours archivés (voir DEP-0756).
- Chaque appel génère au moins 2 événements : `call_started` et `call_ended` ou `hangup`.

### Cas attendus

| Scénario                      | Résultat attendu                                                   |
| ----------------------------- | ------------------------------------------------------------------ |
| Appel complet avec commande   | 4 à 8 événements enregistrés dans l'ordre chronologique            |
| Appel raccroché prématurément | Événement `hangup` en dernier, `order_created` absent              |
| Reconnaissance échouée        | Événement avec `confidence_score` < 0.5 et `error_code` renseigné  |
| Consultation du journal       | Filtrable par `tenant_id`, `call_id`, `event_type`, plage de dates |

---

## DEP-0856 — Tableau de bord : commandes par jour

### Objectif

Permettre au gérant du dépanneur de visualiser le volume quotidien de commandes.

### Métriques affichées

| Métrique                  | Calcul                              | Granularité |
| ------------------------- | ----------------------------------- | ----------- |
| Nombre total de commandes | COUNT commandes par jour calendaire | Quotidienne |
| Commandes complétées      | COUNT statut = `delivered`          | Quotidienne |
| Commandes annulées        | COUNT statut = `cancelled`          | Quotidienne |
| Commandes en cours        | COUNT statut non terminal à J       | Temps réel  |
| Évolution J vs J-7        | Delta en %                          | Quotidienne |

### Règles

- Le tableau de bord est filtrable par plage de dates (défaut : 30 derniers jours).
- Les données sont isolées par tenant (un gérant ne voit que son dépanneur).
- Rafraîchissement : toutes les 5 minutes ou à la demande.
- L'accès est réservé aux rôles `admin_store` et `super_admin`.

### Cas attendus

| Scénario                              | Résultat attendu                                 |
| ------------------------------------- | ------------------------------------------------ |
| Jour avec 0 commande                  | Ligne à 0 visible sur le graphique (pas de trou) |
| Filtre sur 7 jours                    | Affichage uniquement des 7 derniers jours        |
| Gérant consultant son tableau de bord | Données de son tenant uniquement                 |

---

## DEP-0857 — Tableau de bord : produits les plus commandés

### Objectif

Identifier les produits les plus populaires pour aider le gérant à gérer les stocks et le catalogue.

### Métriques affichées

| Métrique               | Calcul                                          | Granularité        |
| ---------------------- | ----------------------------------------------- | ------------------ |
| Top N produits         | Classement par quantité totale commandée        | Par semaine / mois |
| Quantité totale vendue | SUM quantités par produit                       | Par période        |
| Revenu généré          | SUM prix × quantité par produit                 | Par période        |
| Fréquence de commande  | Nb de commandes distinctes contenant le produit | Par période        |

### Règles

- Le top N est configurable (défaut : top 10, max : top 50).
- Filtrable par catégorie de produit.
- Données issues uniquement des commandes avec statut `delivered` ou `confirmed`.
- L'accès est réservé aux rôles `admin_store` et `super_admin`.

### Cas attendus

| Scénario                    | Résultat attendu                                         |
| --------------------------- | -------------------------------------------------------- |
| Produit retiré du catalogue | Apparaît encore dans l'historique avec mention "archivé" |
| Filtre sur une catégorie    | Classement limité à la catégorie sélectionnée            |
| Période sans ventes         | Tableau vide avec message explicite                      |

---

## DEP-0858 — Tableau de bord : temps moyen de préparation

### Objectif

Mesurer le temps écoulé entre la confirmation d'une commande et son départ du dépanneur.

### Métriques affichées

| Métrique                   | Calcul                                                           |
| -------------------------- | ---------------------------------------------------------------- |
| Temps moyen de préparation | MOYENNE (timestamp `ready_for_pickup` − timestamp `confirmed`)   |
| Médiane de préparation     | MÉDIANE de la même différence                                    |
| Distribution par tranche   | Nb commandes par tranche (0–5 min, 5–10 min, 10–20 min, +20 min) |
| Évolution sur 30 jours     | Courbe du temps moyen quotidien                                  |

### Règles

- Seules les commandes avec les deux timestamps renseignés sont incluses.
- Les valeurs aberrantes (préparation > 2 heures) sont exclues du calcul de la moyenne et signalées séparément.
- L'accès est réservé aux rôles `admin_store` et `super_admin`.

### Cas attendus

| Scénario                                   | Résultat attendu                                     |
| ------------------------------------------ | ---------------------------------------------------- |
| Commande sans timestamp `ready_for_pickup` | Exclue du calcul                                     |
| Préparation de 3 heures                    | Exclue de la moyenne, comptée comme valeur aberrante |
| Aucune commande sur la période             | Affichage "Aucune donnée disponible"                 |

---

## DEP-0859 — Tableau de bord : temps moyen de livraison

### Objectif

Mesurer le temps écoulé entre le départ du livreur et la confirmation de livraison.

### Métriques affichées

| Métrique                 | Calcul                                                              |
| ------------------------ | ------------------------------------------------------------------- |
| Temps moyen de livraison | MOYENNE (timestamp `delivered` − timestamp `picked_up`)             |
| Médiane de livraison     | MÉDIANE de la même différence                                       |
| Distribution par tranche | Nb livraisons par tranche (0–10 min, 10–20 min, 20–30 min, +30 min) |
| Par livreur              | Temps moyen individuel (accès `admin_store` uniquement)             |
| Évolution sur 30 jours   | Courbe du temps moyen quotidien                                     |

### Règles

- Seules les livraisons avec statut `delivered` sont incluses.
- Les valeurs aberrantes (livraison > 3 heures) sont exclues et signalées.
- L'accès aux données par livreur est réservé à `admin_store` et `super_admin`.

### Cas attendus

| Scénario                | Résultat attendu                                          |
| ----------------------- | --------------------------------------------------------- |
| Livraison non complétée | Exclue du calcul                                          |
| Livraison de 4 heures   | Exclue de la moyenne, signalée en anomalie                |
| Vue par livreur         | Accessible à `admin_store`, masquée pour `employee_store` |

---

## DEP-0860 — Tableau de bord : taux d'échec de commande

### Objectif

Mesurer la proportion de commandes qui n'aboutissent pas à une livraison réussie.

### Métriques affichées

| Métrique                   | Calcul                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| Taux d'échec global        | (nb commandes annulées ou échouées / nb commandes totales) × 100                                    |
| Motifs d'annulation        | Répartition par motif (`client_cancelled`, `store_cancelled`, `out_of_stock`, `no_driver`, `other`) |
| Évolution sur 30 jours     | Courbe du taux quotidien                                                                            |
| Comparaison avec référence | Taux du mois précédent affiché en regard                                                            |

### Règles

- Un taux supérieur à 15 % déclenche une alerte visuelle sur le tableau de bord.
- Les annulations avant confirmation de la commande ne sont pas comptées comme échecs.
- L'accès est réservé aux rôles `admin_store` et `super_admin`.

### Cas attendus

| Scénario                       | Résultat attendu                 |
| ------------------------------ | -------------------------------- |
| Taux à 20 %                    | Alerte visuelle rouge affichée   |
| Annulation avant confirmation  | Non comptée dans le taux d'échec |
| Aucune commande sur la période | Taux affiché comme "N/A"         |

---

## DEP-0861 — Tableau de bord : taux d'échec de livraison

### Objectif

Mesurer la proportion de livraisons qui n'aboutissent pas (livreur signale un problème, adresse introuvable, client absent).

### Métriques affichées

| Métrique               | Calcul                                                                           |
| ---------------------- | -------------------------------------------------------------------------------- |
| Taux d'échec livraison | (nb livraisons échouées / nb livraisons tentées) × 100                           |
| Motifs d'échec         | Répartition par motif (`address_not_found`, `client_absent`, `refused`, `other`) |
| Par livreur            | Taux individuel (accès `admin_store`)                                            |
| Évolution sur 30 jours | Courbe du taux quotidien                                                         |

### Règles

- Un taux supérieur à 10 % par livreur déclenche une alerte visible pour `admin_store`.
- Une livraison "problème" signalée mais ensuite résolue n'est pas comptée comme échec.
- L'accès est réservé aux rôles `admin_store` et `super_admin`.

### Cas attendus

| Scénario                        | Résultat attendu                       |
| ------------------------------- | -------------------------------------- |
| Livreur avec 15 % d'échec       | Alerte visible dans la vue par livreur |
| Problème signalé puis résolu    | Comptée comme livraison réussie        |
| Aucune livraison sur la période | Affichage "Aucune donnée disponible"   |

---

## DEP-0862 — Tableau de bord : usage du mode manuel

### Objectif

Mesurer la proportion de commandes passées via le mode manuel (navigation classique dans la boutique sans assistant).

### Métriques affichées

| Métrique                      | Calcul                                      |
| ----------------------------- | ------------------------------------------- |
| Nb commandes mode manuel      | COUNT commandes avec `source = manual`      |
| Part relative                 | (nb mode manuel / nb total commandes) × 100 |
| Évolution sur 30 jours        | Courbe quotidienne                          |
| Comparaison avec autres modes | Graphique en secteurs ou barres groupées    |

### Règles

- Chaque commande doit avoir un champ `source` indiquant le mode d'entrée.
- Une commande mixte (commencée en manuel, finalisée en assistant) est attribuée au mode dominant ou au dernier mode utilisé (à définir lors de l'implémentation).
- L'accès est réservé aux rôles `admin_store` et `super_admin`.

### Cas attendus

| Scénario                           | Résultat attendu                          |
| ---------------------------------- | ----------------------------------------- |
| 100 % des commandes en mode manuel | Part relative à 100 %, autres modes à 0 % |
| Comparaison 4 modes                | Graphique avec 4 segments visibles        |

---

## DEP-0863 — Tableau de bord : usage du mode assisté texte

### Objectif

Mesurer la proportion de commandes passées via l'assistant texte (chat).

### Métriques affichées

| Métrique                            | Calcul                                                              |
| ----------------------------------- | ------------------------------------------------------------------- |
| Nb commandes mode assisté texte     | COUNT commandes avec `source = text_assistant`                      |
| Part relative                       | (nb mode texte / nb total) × 100                                    |
| Taux de succès de l'assistant texte | (nb commandes créées via texte / nb sessions assistant texte) × 100 |
| Nb de tours de conversation moyen   | MOYENNE des échanges par session assistant                          |
| Évolution sur 30 jours              | Courbe quotidienne                                                  |

### Règles

- Une "session assistant texte" commence à la première saisie et se termine à la fermeture ou à l'abandon après 10 minutes d'inactivité.
- L'accès est réservé aux rôles `admin_store` et `super_admin`.

### Cas attendus

| Scénario                              | Résultat attendu                           |
| ------------------------------------- | ------------------------------------------ |
| Session assistant sans commande créée | Comptée comme session non convertie        |
| Taux de succès inférieur à 50 %       | Indicateur visible comme point d'attention |

---

## DEP-0864 — Tableau de bord : usage du mode voix web

### Objectif

Mesurer la proportion de commandes passées via la reconnaissance vocale directement dans le navigateur (microphone web).

### Métriques affichées

| Métrique                   | Calcul                                                     |
| -------------------------- | ---------------------------------------------------------- |
| Nb commandes mode voix web | COUNT commandes avec `source = web_voice`                  |
| Part relative              | (nb mode voix web / nb total) × 100                        |
| Taux de succès voix web    | (nb commandes créées / nb sessions voix web) × 100         |
| Taux de reprise en texte   | % de sessions voix web basculées vers le texte après échec |
| Évolution sur 30 jours     | Courbe quotidienne                                         |

### Règles

- Un basculement voix → texte dans la même session est enregistré comme un événement séparé.
- L'accès est réservé aux rôles `admin_store` et `super_admin`.

### Cas attendus

| Scénario                   | Résultat attendu                                            |
| -------------------------- | ----------------------------------------------------------- |
| Session voix sans commande | Comptée comme non convertie                                 |
| Bascule vers texte         | Deux événements enregistrés (voix abandonné, texte démarré) |

---

## DEP-0865 — Tableau de bord : usage du mode téléphone

### Objectif

Mesurer la proportion de commandes passées via le canal téléphonique.

### Métriques affichées

| Métrique                            | Calcul                                |
| ----------------------------------- | ------------------------------------- |
| Nb commandes mode téléphone         | COUNT commandes avec `source = phone` |
| Part relative                       | (nb mode téléphone / nb total) × 100  |
| Nb appels total                     | COUNT événements `call_started`       |
| Taux de conversion appel → commande | (nb commandes / nb appels) × 100      |
| Durée moyenne d'appel               | MOYENNE durée des appels terminés     |
| Évolution sur 30 jours              | Courbe quotidienne                    |

### Règles

- Un appel sans commande créée est comptabilisé comme appel non converti.
- L'accès est réservé aux rôles `admin_store` et `super_admin`.

### Cas attendus

| Scénario                            | Résultat attendu                                 |
| ----------------------------------- | ------------------------------------------------ |
| Appel raccroché avant la fin        | Comptabilisé comme non converti                  |
| Taux de conversion inférieur à 30 % | Point d'attention visible sur le tableau de bord |

---

## DEP-0866 — Tableau de bord : activité par tenant

### Objectif

Permettre au super admin de comparer l'activité de l'ensemble des tenants (dépanneurs) sur la plateforme.

### Métriques affichées

| Métrique                      | Par tenant                  |
| ----------------------------- | --------------------------- |
| Nb commandes sur la période   | Oui                         |
| Revenu estimé (si accessible) | Oui                         |
| Nb clients actifs             | Oui                         |
| Nb livraisons effectuées      | Oui                         |
| Taux d'échec commande         | Oui                         |
| Dernier événement enregistré  | Oui                         |
| Statut du tenant              | Actif / inactif / désactivé |

### Règles

- Ce tableau de bord est accessible uniquement au rôle `super_admin`.
- Les données de chaque tenant restent isolées (pas d'agrégation croisée involontaire).
- Filtrable par statut de tenant (actif / inactif / tous).

### Cas attendus

| Scénario            | Résultat attendu                                              |
| ------------------- | ------------------------------------------------------------- |
| Tenant désactivé    | Affiché avec statut "désactivé", données historiques visibles |
| Tri par revenu      | Tenants classés du plus actif au moins actif                  |
| Accès `admin_store` | Accès refusé, HTTP 403                                        |

---

## DEP-0867 — Tableau de bord : activité par livreur

### Objectif

Permettre au gérant de suivre les performances individuelles de chaque livreur.

### Métriques affichées

| Métrique                      | Par livreur                            |
| ----------------------------- | -------------------------------------- |
| Nb livraisons effectuées      | Oui                                    |
| Temps moyen de livraison      | Oui                                    |
| Taux d'échec                  | Oui                                    |
| Nb de signalements "problème" | Oui                                    |
| Dernière activité             | Oui                                    |
| Statut actuel                 | Disponible / en livraison / hors ligne |

### Règles

- Les données sont isolées par tenant.
- L'accès est réservé aux rôles `admin_store` et `super_admin`.
- Un livreur ne voit que ses propres statistiques (pas celles des autres livreurs).

### Cas attendus

| Scénario                            | Résultat attendu                                  |
| ----------------------------------- | ------------------------------------------------- |
| Livreur consulte son propre tableau | Ses données uniquement                            |
| Admin consulte tous les livreurs    | Tableau comparatif de tous les livreurs du tenant |
| Livreur inactif depuis 30 jours     | Affiché avec statut "inactif"                     |

---

## DEP-0868 — Tableau de bord : activité par catégorie

### Objectif

Mesurer la répartition des ventes par catégorie de produits.

### Métriques affichées

| Métrique                    | Par catégorie                              |
| --------------------------- | ------------------------------------------ |
| Nb d'articles vendus        | Oui                                        |
| Revenu par catégorie        | Oui                                        |
| Part relative des ventes    | (revenu catégorie / revenu total) × 100    |
| Évolution sur 30 jours      | Courbe par catégorie                       |
| Top produit de la catégorie | Produit le plus commandé dans la catégorie |

### Règles

- Basé sur les commandes avec statut `delivered` ou `confirmed`.
- Filtrable par période (7 j, 30 j, personnalisé).
- L'accès est réservé aux rôles `admin_store` et `super_admin`.

### Cas attendus

| Scénario                            | Résultat attendu                                 |
| ----------------------------------- | ------------------------------------------------ |
| Catégorie sans ventes               | Affichée à 0 % (pas masquée)                     |
| Produit reclassé en autre catégorie | Attribué à la catégorie au moment de la commande |

---

## DEP-0869 — Tableau de bord : conversions du panier à la commande

### Objectif

Mesurer le taux de transformation d'un panier initié en commande confirmée.

### Métriques affichées

| Métrique                  | Calcul                                                 |
| ------------------------- | ------------------------------------------------------ |
| Nb paniers créés          | COUNT sessions avec au moins 1 produit ajouté          |
| Nb commandes confirmées   | COUNT commandes avec statut post-`cart`                |
| Taux de conversion        | (nb commandes / nb paniers) × 100                      |
| Taux d'abandon            | 100 % − taux de conversion                             |
| Point d'abandon principal | Étape de l'entonnoir où le plus d'abandons surviennent |
| Évolution sur 30 jours    | Courbe quotidienne du taux                             |

### Règles

- Un panier abandonné est défini comme un panier sans commande créée dans les 2 heures.
- Les paniers vides (ouverts mais aucun produit ajouté) ne sont pas comptabilisés.
- L'accès est réservé aux rôles `admin_store` et `super_admin`.

### Cas attendus

| Scénario                        | Résultat attendu                   |
| ------------------------------- | ---------------------------------- |
| Panier avec 1 article abandonné | Compté dans les abandons après 2 h |
| Panier ouvert mais vide         | Non comptabilisé                   |
| Taux d'abandon supérieur à 60 % | Indicateur affiché en orange       |

---

## DEP-0870 — Tableau de bord : reprise de dernière commande

### Objectif

Mesurer la fréquence d'utilisation de la fonctionnalité "reprendre ma dernière commande".

### Métriques affichées

| Métrique                       | Calcul                                                  |
| ------------------------------ | ------------------------------------------------------- |
| Nb utilisations de la reprise  | COUNT clics sur "reprendre dernière commande"           |
| Taux de conversion reprise     | (nb commandes issues d'une reprise / nb reprises) × 100 |
| Commandes issues d'une reprise | COUNT commandes avec `source_detail = last_order_reuse` |
| Évolution sur 30 jours         | Courbe quotidienne                                      |

### Règles

- Une "reprise" est comptabilisée uniquement si le client clique sur la fonctionnalité et qu'au moins un produit est repris dans le panier.
- L'accès est réservé aux rôles `admin_store` et `super_admin`.

### Cas attendus

| Scénario                            | Résultat attendu                           |
| ----------------------------------- | ------------------------------------------ |
| Reprise sans finalisation           | Comptée comme reprise non convertie        |
| Reprise avec modification du panier | Comptée comme commande issue d'une reprise |

---

## DEP-0871 — Tableau de bord : top 10 dynamique

### Objectif

Afficher en temps quasi-réel les 10 produits les plus commandés sur une fenêtre glissante courte (ex. 7 jours).

### Métriques affichées

| Métrique                        | Description                                          |
| ------------------------------- | ---------------------------------------------------- |
| Classement 1 à 10               | Produits triés par quantité commandée sur la fenêtre |
| Nom et catégorie                | Affichés pour chaque produit                         |
| Quantité vendue                 | Total sur la fenêtre glissante                       |
| Variation vs semaine précédente | Flèche haut/bas + delta en %                         |
| Thumbnail produit               | Image miniature si disponible                        |

### Règles

- La fenêtre glissante est de 7 jours par défaut, configurable en 3 j / 7 j / 30 j.
- Le classement est recalculé toutes les heures.
- L'accès est réservé aux rôles `admin_store` et `super_admin`.
- Les produits désactivés peuvent encore apparaître si commandés dans la fenêtre.

### Cas attendus

| Scénario                    | Résultat attendu                                    |
| --------------------------- | --------------------------------------------------- |
| Fenêtre de 3 jours          | Classement basé sur les 3 derniers jours uniquement |
| Nouveau produit populaire   | Entre dans le top 10 au prochain recalcul (max 1 h) |
| Moins de 10 produits vendus | Top affiché avec le nombre réel (ex. top 4)         |

---

## DEP-0872 — Tableau de bord : qualité de reconnaissance des produits

### Objectif

Mesurer la précision avec laquelle l'assistant (texte ou voix) identifie correctement les produits demandés.

### Métriques affichées

| Métrique                         | Calcul                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------- |
| Taux de reconnaissance correcte  | (nb produits identifiés correctement / nb tentatives d'identification) × 100 |
| Taux d'ambiguïté                 | (nb cas où plusieurs produits sont proposés / nb tentatives) × 100           |
| Taux d'échec d'identification    | (nb cas sans produit trouvé / nb tentatives) × 100                           |
| Top 10 expressions non reconnues | Expressions les plus fréquentes sans correspondance                          |
| Score de confiance moyen         | MOYENNE des `confidence_score` des identifications                           |

### Règles

- Un produit est considéré "identifié correctement" si le client le sélectionne sans correction.
- Un produit est "ambigu" si l'assistant propose plusieurs options et que le client en sélectionne une.
- Un produit est "non trouvé" si l'assistant ne propose aucun résultat.
- L'accès est réservé aux rôles `admin_store` et `super_admin`.

### Cas attendus

| Scénario                                       | Résultat attendu                                      |
| ---------------------------------------------- | ----------------------------------------------------- |
| Client corrige la suggestion                   | Comptée comme identification incorrecte               |
| Client accepte la suggestion sans modification | Comptée comme identification correcte                 |
| Expression inconnue répétée 5 fois             | Apparaît dans le top 10 des expressions non reconnues |

---

## DEP-0873 — Tableau de bord : qualité de reconnaissance vocale

### Objectif

Mesurer la précision de la transcription vocale (voix web et téléphonie) indépendamment de la qualité de l'assistant.

### Métriques affichées

| Métrique                             | Calcul                                                                      |
| ------------------------------------ | --------------------------------------------------------------------------- |
| Score de confiance moyen STT         | MOYENNE des scores de confiance retournés par le moteur de reconnaissance   |
| Taux de transcriptions rejetées      | (nb transcriptions avec confiance < seuil / nb total) × 100                 |
| Taux de corrections manuelles        | (nb fois où le client a corrigé la transcription / nb transcriptions) × 100 |
| Distribution des scores de confiance | Histogramme par tranche (0–0.5, 0.5–0.7, 0.7–0.9, 0.9–1.0)                  |
| Évolution sur 30 jours               | Courbe du score moyen quotidien                                             |

### Règles

- Le seuil de rejet d'une transcription est de 0.5 (configurable, voir DEP de configuration STT).
- Les données sont agrégées par tenant (pas de confusion entre tenants).
- L'accès est réservé aux rôles `admin_store` et `super_admin`.

### Cas attendus

| Scénario                               | Résultat attendu                            |
| -------------------------------------- | ------------------------------------------- |
| Score moyen inférieur à 0.6            | Alerte visible sur le tableau de bord       |
| Pic de corrections manuelles un jour J | Visible sur la courbe d'évolution           |
| Aucune session vocale sur la période   | Affichage "Aucune donnée vocale disponible" |

---

## DEP-0874 — Tableau de bord : qualité de téléphonie

### Objectif

Mesurer la qualité globale du canal téléphonique (disponibilité, latence, taux d'erreur du fournisseur).

### Métriques affichées

| Métrique                               | Calcul                                                               |
| -------------------------------------- | -------------------------------------------------------------------- |
| Taux de disponibilité                  | (nb appels aboutis / nb tentatives d'appel) × 100                    |
| Taux d'erreur fournisseur              | (nb erreurs signalées par le fournisseur / nb appels) × 100          |
| Latence moyenne de réponse             | Temps entre le début de l'appel et le premier message de l'assistant |
| Taux d'appels raccrochés prématurément | (nb `hangup` avant 30 s / nb appels totaux) × 100                    |
| Nb d'incidents signalés                | COUNT événements de type `provider_error` ou `timeout`               |
| Évolution sur 30 jours                 | Courbe de disponibilité quotidienne                                  |

### Règles

- Un taux de disponibilité inférieur à 95 % déclenche une alerte sur le tableau de bord.
- Les incidents fournisseur sont distingués des erreurs applicatives dans les comptages.
- L'accès est réservé aux rôles `admin_store` et `super_admin`.
- Pour le `super_admin`, la vue est agrégée sur tous les tenants avec filtrage possible par tenant.

### Cas attendus

| Scénario                          | Résultat attendu                           |
| --------------------------------- | ------------------------------------------ |
| Disponibilité à 93 %              | Alerte rouge visible                       |
| Incident fournisseur sur 2 heures | Pic visible sur la courbe du jour concerné |
| Aucun appel sur la période        | Disponibilité affichée comme "N/A"         |
