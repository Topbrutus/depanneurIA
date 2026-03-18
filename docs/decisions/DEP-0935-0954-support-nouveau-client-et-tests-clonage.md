# DEP-0935 à DEP-0954 — Support nouveau client et tests de clonage

## Périmètre

Ce document couvre deux sous-blocs contigus :

1. **DEP-0935–DEP-0940** : Les **processus de support d'un nouveau client** —
   validation avant mise en ligne, formation, support des 7 premiers jours,
   support mensuel, facturation et suspension pour non-paiement.

2. **DEP-0941–DEP-0946** : Les **checklists d'onboarding d'un nouveau
   dépanneur** — onboarding général, branding, catalogue, livraison,
   téléphonie et formation.

3. **DEP-0947–DEP-0950** : Les **pages super admin** — onboarding client,
   clonage de configuration, suivi des tenants et santé globale.

4. **DEP-0951–DEP-0954** : Les **tests de clonage** — clonage vers un
   deuxième et un troisième tenant fictif, séparation des domaines et
   séparation des catalogues entre tenants.

Ces décisions s'appuient sur l'architecture multi-tenant gelée en DEP-0680,
sur les bases multi-tenant définies en DEP-0635–DEP-0654, sur la logique de
clonage de configuration téléphonique en DEP-0660, sur les pages super admin
définies en DEP-0675–DEP-0694, et sur les tests d'intégration et E2E définis
en DEP-0815–DEP-0834.

Il s'agit exclusivement de **documentation** : aucun code produit, aucune
implémentation.

---

## DEP-0935 — Définir le processus de validation avant mise en ligne d'un nouveau client

### Objectif

Définir les étapes obligatoires de validation à compléter avant qu'un nouveau
tenant (dépanneur) soit activé et accessible publiquement.

### Étapes de validation

| # | Étape                                      | Responsable   | Critère de réussite                                     |
|---|--------------------------------------------|---------------|---------------------------------------------------------|
| 1 | Vérifier l'identité légale du commerce     | Super admin   | Nom, adresse et numéro d'entreprise confirmés           |
| 2 | Valider le branding (logo, couleurs, nom)  | Super admin   | Logo affiché correctement, couleurs conformes à la charte |
| 3 | Valider le catalogue (≥ 1 catégorie, ≥ 5 produits actifs) | Super admin | Catalogue publié avec prix et images conformes  |
| 4 | Valider la zone de livraison               | Super admin   | Au moins une zone définie avec rayon ou code postal     |
| 5 | Valider la configuration téléphonique      | Super admin   | Numéro attribué, message d'accueil fonctionnel          |
| 6 | Tester un parcours complet (commande test) | Super admin   | Commande créée, reçue par le dépanneur, livrée          |
| 7 | Obtenir l'accord écrit du client           | Super admin   | Confirmation par courriel ou signature électronique      |

### Règles

- Aucun tenant ne peut être mis en ligne sans que toutes les étapes soient
  complétées et cochées.
- Le super admin est le seul rôle autorisé à activer un tenant.
- Un journal d'activation est enregistré avec la date, l'identifiant du super
  admin et l'identifiant du tenant.

### Cas attendus

| Scénario                                | Résultat attendu                              |
|-----------------------------------------|-----------------------------------------------|
| Toutes les étapes sont validées         | Le tenant est activé et accessible publiquement |
| Une étape est manquante                 | Le bouton d'activation est désactivé          |
| Le client refuse de signer              | Le tenant reste en statut « brouillon »       |

---

## DEP-0936 — Définir le processus de formation d'un nouveau client

### Objectif

Définir le processus de formation dispensé à un nouveau dépanneur avant la
mise en ligne de sa boutique.

### Contenu de la formation

| # | Module                                    | Durée estimée | Format           |
|---|-------------------------------------------|---------------|------------------|
| 1 | Présentation générale de la plateforme    | 15 min        | Appel vidéo      |
| 2 | Gestion du catalogue (ajout, édition, tri) | 20 min       | Appel vidéo      |
| 3 | Réception et traitement des commandes     | 15 min        | Appel vidéo      |
| 4 | Gestion des livraisons et livreurs        | 15 min        | Appel vidéo      |
| 5 | Fonctionnement de la téléphonie           | 10 min        | Appel vidéo      |
| 6 | Consultation du tableau de bord           | 10 min        | Appel vidéo      |
| 7 | Questions et réponses                     | 15 min        | Appel vidéo      |

### Règles

- La formation est obligatoire avant la mise en ligne.
- La formation est dispensée par le super admin ou un membre désigné de
  l'équipe.
- Un compte-rendu de formation est enregistré avec la date, la durée et les
  modules couverts.
- Si le client demande une formation supplémentaire, elle est planifiée dans
  les 48 heures ouvrables.

### Cas attendus

| Scénario                                   | Résultat attendu                              |
|--------------------------------------------|-----------------------------------------------|
| Formation complète terminée                | Le client est marqué « formé » dans le système |
| Client absent à la session                 | Nouvelle session planifiée sous 48 h ouvrables |
| Client demande une session complémentaire  | Session additionnelle planifiée sous 48 h ouvrables |

---

## DEP-0937 — Définir le processus de support des 7 premiers jours d'un nouveau client

### Objectif

Définir le niveau de support offert pendant les 7 premiers jours suivant la
mise en ligne d'un nouveau tenant.

### Engagements de support

| Engagement                              | Valeur V1                              |
|-----------------------------------------|----------------------------------------|
| Délai de réponse maximal                | 2 heures ouvrables                     |
| Canal de support principal              | Courriel ou messagerie instantanée     |
| Disponibilité du support                | Lundi à vendredi, 9 h à 18 h (fuseau horaire du client, HE par défaut) |
| Appel de suivi proactif                 | Jour 1, jour 3, jour 7                |
| Rapport de lancement                    | Envoyé au jour 7                       |

### Contenu des appels de suivi

| Jour | Objectif de l'appel                                                |
|------|--------------------------------------------------------------------|
| 1    | Vérifier que les premières commandes sont bien reçues et traitées  |
| 3    | Identifier les difficultés rencontrées et proposer des ajustements |
| 7    | Bilan de la première semaine, recueil de la satisfaction client     |

### Règles

- Le support des 7 premiers jours est inclus dans le forfait d'onboarding.
- Chaque interaction de support est enregistrée dans le journal du tenant.
- Si un problème bloquant est identifié, il est escaladé immédiatement au
  super admin.
- Le rapport de lancement du jour 7 est envoyé au client par courriel.

### Cas attendus

| Scénario                                    | Résultat attendu                            |
|---------------------------------------------|---------------------------------------------|
| Client contacte le support dans les 2 h     | Réponse envoyée dans le délai               |
| Problème bloquant identifié                 | Escalade immédiate au super admin           |
| Aucun problème signalé pendant 7 jours      | Rapport de lancement positif envoyé au jour 7 |

---

## DEP-0938 — Définir le processus de support mensuel d'un nouveau client

### Objectif

Définir le niveau de support offert de manière récurrente après la période
initiale de 7 jours.

### Engagements de support mensuel

| Engagement                              | Valeur V1                              |
|-----------------------------------------|----------------------------------------|
| Délai de réponse maximal                | 24 heures ouvrables                    |
| Canal de support principal              | Courriel                               |
| Disponibilité du support                | Lundi à vendredi, 9 h à 18 h (fuseau horaire du client, HE par défaut) |
| Appel de suivi mensuel                  | 1 appel par mois (facultatif si le client décline) |
| Rapport mensuel                         | Envoyé avant le 5 du mois suivant      |

### Contenu du rapport mensuel

| Élément                                 | Description                            |
|-----------------------------------------|----------------------------------------|
| Nombre de commandes du mois             | Total des commandes créées             |
| Taux de complétion des commandes        | Commandes livrées / commandes créées   |
| Nombre d'appels téléphoniques           | Total des appels entrants via la plateforme |
| Incidents signalés                      | Résumé des tickets de support ouverts  |
| Recommandations                         | Suggestions d'amélioration si pertinent |

### Règles

- Le support mensuel est inclus dans l'abonnement mensuel du client.
- Chaque ticket de support est suivi jusqu'à sa résolution.
- Le rapport mensuel est généré automatiquement si les données sont
  disponibles, sinon manuellement par le super admin.

### Cas attendus

| Scénario                                    | Résultat attendu                            |
|---------------------------------------------|---------------------------------------------|
| Client contacte le support                  | Réponse dans les 24 h ouvrables             |
| Aucun incident dans le mois                 | Rapport mensuel envoyé avec mention « aucun incident » |
| Client décline l'appel mensuel              | Appel annulé, rapport envoyé par courriel uniquement   |

---

## DEP-0939 — Définir le processus de facturation d'un nouveau client

### Objectif

Définir le processus de facturation récurrente pour un client actif sur la
plateforme.

### Éléments de facturation

| Élément                                 | Description                            |
|-----------------------------------------|----------------------------------------|
| Cycle de facturation                    | Mensuel, à date anniversaire de l'activation |
| Mode de paiement                        | Virement bancaire ou prélèvement automatique |
| Devise                                  | Devise locale du client (CAD par défaut) |
| Facture                                 | Envoyée par courriel au format PDF     |
| Délai de paiement                       | 15 jours calendaires après émission    |

### Processus de facturation

| # | Étape                                     | Responsable   | Délai                    |
|---|-------------------------------------------|---------------|--------------------------|
| 1 | Génération de la facture                  | Système       | Jour de la date anniversaire |
| 2 | Envoi de la facture par courriel          | Système       | Jour de la date anniversaire |
| 3 | Suivi du paiement                         | Super admin   | Continu                  |
| 4 | Confirmation de réception du paiement     | Super admin   | Sous 48 h ouvrables après réception |
| 5 | Relance en cas de non-paiement            | Super admin   | Jour 16 après émission   |

### Règles

- La facture est générée automatiquement si le système le permet, sinon
  manuellement par le super admin.
- Un historique de facturation est conservé et accessible au super admin.
- Le client peut consulter ses factures depuis son espace administrateur.
- Toute modification tarifaire est communiquée au client 30 jours avant
  son application.

### Cas attendus

| Scénario                                    | Résultat attendu                            |
|---------------------------------------------|---------------------------------------------|
| Paiement reçu dans les délais              | Confirmation envoyée, aucune action requise |
| Paiement non reçu au jour 15               | Relance envoyée au jour 16                  |
| Client conteste une facture                 | Ticket de support ouvert, traitement sous 5 jours ouvrables |

---

## DEP-0940 — Définir le processus de suspension pour non-paiement si un jour utile

### Objectif

Définir le processus de suspension d'un tenant en cas de non-paiement
prolongé, applicable uniquement un jour ouvrable.

### Processus de suspension

| # | Étape                                       | Délai après émission de la facture | Action                                              |
|---|---------------------------------------------|-------------------------------------|-----------------------------------------------------|
| 1 | Première relance                            | Jour 16                            | Courriel de rappel de paiement                      |
| 2 | Deuxième relance                            | Jour 23                            | Courriel d'avertissement de suspension imminente     |
| 3 | Notification finale                         | Jour 28                            | Courriel indiquant la suspension sous 48 h           |
| 4 | Suspension du tenant                        | Jour 30 (jour ouvrable uniquement) | Tenant désactivé, boutique inaccessible publiquement |
| 5 | Notification de suspension effective        | Jour 30                            | Courriel de confirmation de suspension               |

### Règles

- La suspension ne peut être effectuée qu'un **jour ouvrable** (lundi à
  vendredi, hors jours fériés).
- Si le jour 30 tombe un jour non ouvrable, la suspension est reportée au
  prochain jour ouvrable.
- Le tenant suspendu conserve ses données pendant **90 jours** après la
  suspension.
- Le client peut réactiver son tenant en régularisant le paiement dans le
  délai de conservation.
- Seul le super admin peut exécuter la suspension ou la réactivation.
- Un journal de suspension est enregistré avec la date, la raison et
  l'identifiant du super admin.

### Cas attendus

| Scénario                                           | Résultat attendu                                    |
|----------------------------------------------------|-----------------------------------------------------|
| Non-paiement au jour 30, jour ouvrable             | Tenant suspendu, courriel envoyé                    |
| Non-paiement au jour 30, jour non ouvrable         | Suspension reportée au prochain jour ouvrable       |
| Paiement reçu avant le jour 30                     | Aucune suspension, relances annulées                |
| Paiement reçu après suspension (dans les 90 jours) | Tenant réactivé sous 24 h ouvrables                 |
| Aucun paiement après 90 jours de suspension        | Données supprimées conformément à la politique de rétention |

---

## DEP-0941 — Créer la checklist d'onboarding d'un nouveau dépanneur

### Objectif

Définir la checklist générale d'onboarding regroupant toutes les étapes à
compléter pour intégrer un nouveau dépanneur sur la plateforme.

### Checklist d'onboarding

| # | Tâche                                                | Responsable   | Statut par défaut |
|---|------------------------------------------------------|---------------|-------------------|
| 1 | Créer le tenant dans le système                      | Super admin   | À faire           |
| 2 | Configurer le branding (voir DEP-0942)               | Super admin   | À faire           |
| 3 | Configurer le catalogue (voir DEP-0943)              | Super admin   | À faire           |
| 4 | Configurer la livraison (voir DEP-0944)              | Super admin   | À faire           |
| 5 | Configurer la téléphonie (voir DEP-0945)             | Super admin   | À faire           |
| 6 | Dispenser la formation (voir DEP-0946)               | Super admin   | À faire           |
| 7 | Exécuter la validation avant mise en ligne (DEP-0935) | Super admin  | À faire           |
| 8 | Activer le tenant                                    | Super admin   | À faire           |

### Règles

- Chaque tâche doit être cochée individuellement par le super admin.
- L'ordre des tâches est indicatif mais les étapes 1, 2, 3, 4, 5 doivent
  être complétées avant l'étape 7.
- L'étape 8 ne peut être exécutée que si l'étape 7 est complétée.
- La progression de la checklist est visible dans la page super admin
  d'onboarding (DEP-0947).

---

## DEP-0942 — Créer la checklist de branding d'un nouveau dépanneur

### Objectif

Définir la checklist de configuration du branding pour un nouveau tenant.

### Checklist de branding

| # | Tâche                                        | Critère de réussite                              |
|---|----------------------------------------------|--------------------------------------------------|
| 1 | Téléverser le logo du commerce               | Image au format PNG ou SVG, min 200×200 px       |
| 2 | Définir le nom commercial                    | Nom affiché dans l'en-tête et le pied de page    |
| 3 | Définir la couleur principale                | Code hexadécimal valide                          |
| 4 | Définir la couleur secondaire                | Code hexadécimal valide                          |
| 5 | Configurer le slogan (optionnel)             | Texte de 80 caractères maximum                   |
| 6 | Vérifier l'aperçu de la boutique             | Logo, couleurs et nom affichés correctement       |

### Règles

- Le logo est obligatoire avant la mise en ligne.
- Le nom commercial est obligatoire et unique par tenant.
- Les couleurs doivent respecter un ratio de contraste WCAG 2.1 AA minimum
  (4.5:1 pour le texte).
- L'aperçu doit être validé visuellement par le super admin.

---

## DEP-0943 — Créer la checklist de catalogue d'un nouveau dépanneur

### Objectif

Définir la checklist de configuration du catalogue pour un nouveau tenant.

### Checklist de catalogue

| # | Tâche                                          | Critère de réussite                                |
|---|-------------------------------------------------|----------------------------------------------------|
| 1 | Créer au moins 1 catégorie                     | Catégorie visible dans le catalogue                |
| 2 | Ajouter au moins 5 produits actifs             | Produits avec nom, prix et image                   |
| 3 | Associer chaque produit à une catégorie        | Aucun produit orphelin                             |
| 4 | Vérifier les prix (format et devise)           | Prix > 0 et devise correcte                       |
| 5 | Vérifier les images produits                   | Images affichées correctement, min 300×300 px      |
| 6 | Définir l'ordre d'affichage des catégories     | Ordre logique vérifié visuellement                 |
| 7 | Définir l'ordre d'affichage des produits       | Ordre logique vérifié par catégorie                |
| 8 | Publier le catalogue                           | Statut du catalogue passé à « actif »              |

### Règles

- Le catalogue doit contenir au minimum 1 catégorie et 5 produits actifs
  avant la mise en ligne.
- Les produits en statut `draft` ne sont pas visibles publiquement.
- Les images doivent respecter les formats définis (JPEG, PNG, WebP).
- L'ordre d'affichage utilise le champ `display_order` tel que défini en
  DEP-0260.

---

## DEP-0944 — Créer la checklist de livraison d'un nouveau dépanneur

### Objectif

Définir la checklist de configuration de la livraison pour un nouveau tenant.

### Checklist de livraison

| # | Tâche                                             | Critère de réussite                             |
|---|---------------------------------------------------|-------------------------------------------------|
| 1 | Définir au moins une zone de livraison            | Zone définie par rayon ou codes postaux         |
| 2 | Définir les frais de livraison                    | Montant ≥ 0 configuré                          |
| 3 | Définir les horaires de livraison                 | Plage horaire d'ouverture et de fermeture       |
| 4 | Enregistrer au moins un livreur                   | Livreur avec nom et téléphone                   |
| 5 | Tester une livraison fictive                      | Commande test livrée avec succès                |

### Règles

- Au moins une zone de livraison est obligatoire avant la mise en ligne.
- Les frais de livraison peuvent être à 0 (livraison gratuite).
- Les horaires de livraison doivent être cohérents avec les horaires
  d'ouverture du commerce.
- Au moins un livreur actif est requis avant la mise en ligne.

---

## DEP-0945 — Créer la checklist téléphonique d'un nouveau dépanneur

### Objectif

Définir la checklist de configuration téléphonique pour un nouveau tenant.

### Checklist téléphonique

| # | Tâche                                              | Critère de réussite                             |
|---|----------------------------------------------------|-------------------------------------------------|
| 1 | Attribuer un numéro de téléphone dédié             | Numéro actif et joignable                       |
| 2 | Configurer le message d'accueil                    | Message personnalisé avec le nom du commerce    |
| 3 | Configurer les phrases de l'assistant vocal        | Phrases adaptées au catalogue du tenant         |
| 4 | Tester un appel entrant complet                    | Appel reçu, assistant vocal fonctionnel         |
| 5 | Tester une commande par téléphone                  | Commande créée et reçue par le dépanneur        |
| 6 | Vérifier le journal d'appels                       | Événements enregistrés conformément à DEP-0855  |

### Règles

- Le numéro de téléphone est obligatoire si le canal téléphonique est activé
  pour ce tenant.
- La configuration téléphonique suit la logique de clonage définie en
  DEP-0660 si applicable.
- Le message d'accueil doit mentionner le nom du commerce.
- Les tests d'appel doivent être effectués avant la mise en ligne.

---

## DEP-0946 — Créer la checklist de formation d'un nouveau dépanneur

### Objectif

Définir la checklist de formation à compléter avec le nouveau dépanneur.

### Checklist de formation

| # | Tâche                                                | Critère de réussite                            |
|---|------------------------------------------------------|------------------------------------------------|
| 1 | Planifier la session de formation                    | Date et heure confirmées avec le client        |
| 2 | Présenter la plateforme (module 1, DEP-0936)         | Client comprend la navigation générale         |
| 3 | Former à la gestion du catalogue (module 2)          | Client sait ajouter et modifier un produit     |
| 4 | Former à la réception des commandes (module 3)       | Client sait accepter et traiter une commande   |
| 5 | Former à la gestion des livraisons (module 4)        | Client sait assigner un livreur                |
| 6 | Former à la téléphonie (module 5)                    | Client comprend le fonctionnement de l'assistant vocal |
| 7 | Former au tableau de bord (module 6)                 | Client sait consulter ses statistiques         |
| 8 | Valider la compréhension générale                    | Client confirme être à l'aise avec la plateforme |
| 9 | Marquer la formation comme terminée                  | Statut « formé » enregistré dans le système    |

### Règles

- La formation ne peut être marquée comme terminée que si le client confirme
  sa compréhension.
- Si le client a besoin d'une session supplémentaire, elle est planifiée
  sous 48 heures ouvrables.
- Le compte-rendu de formation est enregistré conformément à DEP-0936.

---

## DEP-0947 — Créer la page super admin d'onboarding client

### Objectif

Définir la page super admin permettant de suivre et de gérer l'onboarding de
chaque nouveau client.

### Éléments de la page

| Élément                                | Description                                         |
|----------------------------------------|-----------------------------------------------------|
| Liste des tenants en onboarding        | Tableau des tenants avec statut d'avancement         |
| Barre de progression par tenant        | Pourcentage des tâches complétées (DEP-0941)        |
| Accès aux checklists détaillées        | Lien vers chaque sous-checklist (DEP-0942 à DEP-0946) |
| Bouton d'activation du tenant          | Actif uniquement si la validation (DEP-0935) est complète |
| Historique des activations             | Journal des tenants activés avec date et super admin |

### Colonnes du tableau des tenants

| Colonne                  | Type     | Description                          |
|--------------------------|----------|--------------------------------------|
| Nom du commerce          | Texte    | Nom commercial du tenant             |
| Date de création         | Date     | Date de création du tenant           |
| Progression              | Barre    | Pourcentage d'avancement             |
| Statut                   | Badge    | Brouillon, En cours, Prêt, Actif    |
| Actions                  | Boutons  | Voir, Activer, Suspendre             |

### Règles

- Seul le rôle `super_admin` a accès à cette page.
- Le bouton « Activer » est désactivé tant que toutes les étapes de
  validation (DEP-0935) ne sont pas complétées.
- Le statut « Prêt » est atteint automatiquement lorsque toutes les
  checklists sont terminées.

---

## DEP-0948 — Créer la page super admin de clonage de configuration

### Objectif

Définir la page super admin permettant de cloner la configuration d'un
tenant existant vers un nouveau tenant.

### Éléments de la page

| Élément                                | Description                                          |
|----------------------------------------|------------------------------------------------------|
| Sélecteur du tenant source             | Liste déroulante des tenants actifs                  |
| Sélecteur du tenant cible              | Liste déroulante des tenants en brouillon            |
| Éléments clonables                     | Cases à cocher pour chaque type de configuration     |
| Bouton de prévisualisation             | Affiche un résumé des éléments à cloner              |
| Bouton de confirmation                 | Lance le clonage après confirmation                  |
| Journal de clonage                     | Historique des opérations de clonage effectuées       |

### Éléments clonables

| Élément                        | Clonable | Référence                |
|--------------------------------|----------|--------------------------|
| Configuration téléphonique     | Oui      | DEP-0660                 |
| Structure du catalogue         | Oui      | DEP-0635–DEP-0654        |
| Branding                       | Non      | Propre à chaque tenant   |
| Données de commandes           | Non      | Propre à chaque tenant   |
| Comptes utilisateurs           | Non      | Propre à chaque tenant   |
| Zone de livraison              | Oui      | Modifiable après clonage |
| Horaires d'ouverture           | Oui      | Modifiable après clonage |

### Règles

- Le clonage ne copie jamais les données transactionnelles (commandes,
  utilisateurs, paiements).
- Le tenant cible doit être en statut « brouillon » pour recevoir un clonage.
- Le super admin doit confirmer l'opération avant exécution.
- Un journal de clonage est enregistré avec la date, les tenants source et
  cible, et les éléments clonés.
- Les éléments clonés sont modifiables indépendamment après le clonage.

---

## DEP-0949 — Créer la page super admin de suivi des tenants

### Objectif

Définir la page super admin offrant une vue d'ensemble de tous les tenants
de la plateforme.

### Colonnes du tableau de suivi

| Colonne                  | Type     | Description                                  |
|--------------------------|----------|----------------------------------------------|
| Nom du commerce          | Texte    | Nom commercial du tenant                     |
| Statut                   | Badge    | Brouillon, Actif, Suspendu                   |
| Date d'activation        | Date     | Date de mise en ligne                        |
| Commandes du mois        | Nombre   | Total des commandes du mois en cours         |
| Dernière activité        | Date     | Date de la dernière commande ou connexion    |
| Paiement                 | Badge    | À jour, En retard, Impayé                   |
| Actions                  | Boutons  | Voir, Suspendre, Réactiver                   |

### Filtres disponibles

| Filtre                   | Options                                       |
|--------------------------|-----------------------------------------------|
| Statut                   | Tous, Brouillon, Actif, Suspendu              |
| Paiement                 | Tous, À jour, En retard, Impayé              |
| Période                  | Ce mois, 3 derniers mois, 6 derniers mois, 1 an |

### Règles

- Seul le rôle `super_admin` a accès à cette page.
- Les données affichées sont isolées par tenant conformément à
  l'architecture multi-tenant (DEP-0680).
- Le tableau est paginé (20 résultats par page par défaut).
- Les actions de suspension et réactivation suivent les processus définis
  en DEP-0940.

---

## DEP-0950 — Créer la page super admin de santé globale

### Objectif

Définir la page super admin affichant l'état de santé global de la
plateforme, tous tenants confondus.

### Indicateurs de santé

| Indicateur                              | Description                                     | Seuil d'alerte         |
|-----------------------------------------|-------------------------------------------------|------------------------|
| Nombre de tenants actifs                | Total des tenants en statut « Actif »           | —                      |
| Commandes totales du jour               | Toutes commandes créées aujourd'hui             | —                      |
| Taux de complétion des commandes        | Commandes livrées / commandes créées (7 jours)  | < 80 %                 |
| Erreurs API (dernières 24 h)            | Nombre de réponses HTTP 5xx                     | > 10                   |
| Disponibilité téléphonie                | Pourcentage d'appels aboutis (24 h)             | < 95 %                 |
| Latence moyenne API                     | Temps de réponse p95 (dernière heure)           | > 3 secondes           |
| Espace de stockage utilisé              | Volume total des images et médias               | > 80 % du quota        |
| Tenants avec paiement en retard         | Nombre de tenants en statut « En retard »       | > 0                    |

### Règles

- Seul le rôle `super_admin` a accès à cette page.
- Les indicateurs sont rafraîchis toutes les 5 minutes conformément à
  DEP-0856.
- Les seuils d'alerte déclenchent un indicateur visuel (badge rouge) sur
  la ligne concernée.
- Cette page ne permet aucune action directe ; elle redirige vers les
  pages de détail correspondantes.

---

## DEP-0951 — Tester le clonage complet vers un deuxième tenant fictif

### Objectif

Définir le scénario de test validant le clonage complet d'une configuration
depuis un tenant source vers un deuxième tenant fictif.

### Prérequis

| Prérequis                               | Description                                    |
|-----------------------------------------|------------------------------------------------|
| Tenant source configuré                 | Tenant actif avec catalogue, téléphonie, livraison |
| Tenant cible créé en brouillon          | Tenant vide, prêt à recevoir le clonage        |
| Super admin connecté                    | Rôle `super_admin` avec accès à la page de clonage |

### Étapes du test

| # | Action                                              | Résultat attendu                                  |
|---|-----------------------------------------------------|---------------------------------------------------|
| 1 | Ouvrir la page de clonage (DEP-0948)                | Page affichée avec les sélecteurs source et cible |
| 2 | Sélectionner le tenant source                       | Éléments clonables affichés                       |
| 3 | Sélectionner le tenant cible (brouillon)            | Confirmation que le tenant cible est vide         |
| 4 | Cocher tous les éléments clonables                  | Tous les éléments sélectionnés                    |
| 5 | Cliquer sur « Prévisualiser »                       | Résumé des éléments à cloner affiché              |
| 6 | Cliquer sur « Confirmer le clonage »                | Clonage exécuté, message de succès affiché        |
| 7 | Vérifier le catalogue du tenant cible               | Catégories et produits identiques au tenant source |
| 8 | Vérifier la configuration téléphonique du tenant cible | Configuration identique au tenant source       |
| 9 | Vérifier que les données transactionnelles sont vides | Aucune commande, aucun utilisateur client        |
| 10 | Vérifier le journal de clonage                     | Entrée enregistrée avec date et détails           |

### Critères de réussite

- Tous les éléments clonables sont copiés correctement.
- Aucune donnée transactionnelle n'est copiée.
- Le tenant cible peut être modifié indépendamment après le clonage.

---

## DEP-0952 — Tester le clonage complet vers un troisième tenant fictif

### Objectif

Définir le scénario de test validant que le clonage fonctionne de manière
répétable vers un troisième tenant fictif distinct.

### Prérequis

| Prérequis                               | Description                                    |
|-----------------------------------------|------------------------------------------------|
| Tenant source configuré                 | Même tenant source que DEP-0951                |
| Troisième tenant créé en brouillon      | Tenant vide, distinct du deuxième tenant       |
| Deuxième tenant déjà cloné (DEP-0951)   | Clonage précédent terminé avec succès          |

### Étapes du test

| # | Action                                              | Résultat attendu                                  |
|---|-----------------------------------------------------|---------------------------------------------------|
| 1 | Répéter les étapes 1 à 6 de DEP-0951 avec le troisième tenant | Clonage exécuté avec succès              |
| 2 | Vérifier le catalogue du troisième tenant           | Identique au tenant source                        |
| 3 | Vérifier que le deuxième tenant n'est pas affecté   | Données du deuxième tenant inchangées             |
| 4 | Modifier le catalogue du troisième tenant           | Modification enregistrée sans impact sur les autres tenants |
| 5 | Vérifier le journal de clonage                      | Deux entrées distinctes (DEP-0951 et DEP-0952)    |

### Critères de réussite

- Le clonage vers un troisième tenant fonctionne de manière identique.
- Les trois tenants sont indépendants les uns des autres.
- Le journal de clonage contient les deux opérations distinctes.

---

## DEP-0953 — Tester la séparation des domaines entre tenants

### Objectif

Définir le scénario de test validant que chaque tenant dispose d'un domaine
ou sous-domaine distinct et que l'accès à un domaine ne permet pas d'accéder
aux données d'un autre tenant.

### Prérequis

| Prérequis                               | Description                                    |
|-----------------------------------------|------------------------------------------------|
| Deux tenants actifs minimum              | Tenants avec domaines ou sous-domaines distincts |
| Domaines configurés                      | Sous-domaines de type `tenant1.example.com`, `tenant2.example.com` |
| Utilisateur test pour chaque tenant      | Comptes distincts par tenant                   |

### Étapes du test

| # | Action                                                   | Résultat attendu                                   |
|---|----------------------------------------------------------|----------------------------------------------------|
| 1 | Accéder au domaine du tenant 1                           | Boutique du tenant 1 affichée (branding, catalogue) |
| 2 | Accéder au domaine du tenant 2                           | Boutique du tenant 2 affichée (branding, catalogue) |
| 3 | Vérifier que le branding est différent                   | Logo, couleurs et nom distincts                    |
| 4 | Se connecter en tant qu'admin du tenant 1                | Accès au tableau de bord du tenant 1 uniquement     |
| 5 | Tenter d'accéder à l'URL d'admin du tenant 2             | Accès refusé ou redirection                        |
| 6 | Vérifier les appels API avec le token du tenant 1        | Seules les données du tenant 1 sont retournées      |
| 7 | Vérifier qu'un appel API croisé est rejeté               | Réponse HTTP 403 ou 404                            |

### Critères de réussite

- Chaque domaine affiche uniquement les données de son tenant.
- Aucun accès croisé n'est possible entre tenants.
- Les tokens d'authentification sont isolés par tenant.

---

## DEP-0954 — Tester la séparation des catalogues entre tenants

### Objectif

Définir le scénario de test validant que les catalogues de chaque tenant
sont strictement isolés et qu'aucune modification dans un catalogue n'affecte
les autres tenants.

### Prérequis

| Prérequis                               | Description                                    |
|-----------------------------------------|------------------------------------------------|
| Deux tenants actifs avec catalogues      | Catalogues distincts, éventuellement clonés    |
| Produits identifiés dans chaque tenant   | Au moins 5 produits par tenant                 |

### Étapes du test

| # | Action                                                     | Résultat attendu                                 |
|---|------------------------------------------------------------|--------------------------------------------------|
| 1 | Lister les produits du tenant 1 via API                    | Seuls les produits du tenant 1 sont retournés    |
| 2 | Lister les produits du tenant 2 via API                    | Seuls les produits du tenant 2 sont retournés    |
| 3 | Ajouter un produit au tenant 1                             | Produit visible uniquement dans le tenant 1      |
| 4 | Vérifier que le tenant 2 n'a pas le nouveau produit        | Liste du tenant 2 inchangée                      |
| 5 | Modifier le prix d'un produit dans le tenant 2             | Prix modifié uniquement dans le tenant 2         |
| 6 | Vérifier que le même produit dans le tenant 1 est inchangé | Prix original conservé dans le tenant 1          |
| 7 | Supprimer un produit du tenant 1                           | Produit supprimé uniquement dans le tenant 1     |
| 8 | Vérifier que le tenant 2 conserve tous ses produits        | Catalogue du tenant 2 intact                     |

### Critères de réussite

- Les opérations CRUD sur le catalogue d'un tenant n'ont aucun impact sur
  les autres tenants.
- Les requêtes API retournent exclusivement les données du tenant appelant.
- L'isolation est garantie au niveau de la base de données (filtrage par
  `tenant_id`).

---

## Conclusion

Ce document définit 20 décisions réparties en quatre sous-blocs :

1. **DEP-0935–DEP-0940** — Processus de support d'un nouveau client :
   validation avant mise en ligne, formation, support des 7 premiers jours,
   support mensuel, facturation et suspension pour non-paiement.

2. **DEP-0941–DEP-0946** — Checklists d'onboarding d'un nouveau dépanneur :
   onboarding général, branding, catalogue, livraison, téléphonie et
   formation.

3. **DEP-0947–DEP-0950** — Pages super admin : onboarding client, clonage de
   configuration, suivi des tenants et santé globale.

4. **DEP-0951–DEP-0954** — Tests de clonage : clonage vers un deuxième et un
   troisième tenant fictif, séparation des domaines et séparation des
   catalogues entre tenants.

Ces décisions sont exclusivement documentaires. L'implémentation sera
effectuée dans les blocs de travail correspondants.
