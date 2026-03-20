# DEP-0775 à DEP-0794 — Sécurité, logs d'audit et tests de permissions

## Périmètre

Ce document couvre deux sous-blocs contigus :

1. **DEP-0775–DEP-0790** : Les **stratégies de sécurité** de la plateforme —
   limitation de débit sur l'assistant et la téléphonie, journalisation
   sécurisée, masquage des données sensibles, chiffrement au repos et en
   transit, protection des numéros et adresses, conservation des données, et
   stratégies d'audit pour chaque rôle et chaque entité critique.

2. **DEP-0791–DEP-0794** : La **spécification des gardes d'accès** et des
   **tests de permissions** — gardes front, gardes API, tests par rôle et
   tests par tenant.

Ces décisions s'appuient sur les rôles définis en DEP-0364–DEP-0366, sur
l'architecture multi-tenant gelée en DEP-0680, sur les machines d'état en
DEP-0581–DEP-0584, et sur les stratégies d'authentification et d'autorisation
établies en DEP-0760–DEP-0774.

Il s'agit exclusivement de **documentation** : aucun code produit, aucune
implémentation.

---

## DEP-0775 — Stratégie de limitation de débit de l'assistant

### Objectif

Définir les limites de fréquence applicables aux messages envoyés à
l'assistant texte (DEP-0388–DEP-0390) afin de prévenir les abus, le spam
et la surcharge du système.

### Limites V1

| Contexte                           | Limite                             | Fenêtre |
| ---------------------------------- | ---------------------------------- | ------- |
| Messages par session cliente       | 60 messages                        | 1 heure |
| Messages par IP non authentifiée   | 20 messages                        | 1 heure |
| Requêtes simultanées par session   | 1 (attente de réponse obligatoire) | —       |
| Tentatives de commande par session | 10                                 | 1 heure |

### Comportement en cas de dépassement

- L'interface affiche le message d'erreur prévu (DEP-0797).
- L'assistant cesse de répondre jusqu'à la fin de la fenêtre de limitation.
- L'événement est journalisé (niveau `warn`) avec l'identifiant de session
  et l'IP source.
- Aucun blocage de compte permanent en V1 — la limite se réinitialise
  automatiquement.

### Règles

- Les limites sont appliquées **par tenant** — un abus sur le tenant A
  n'affecte pas le tenant B.
- Un super admin peut consulter les événements de dépassement depuis le
  tableau de bord de monitoring.
- L'ajustement des limites par tenant est hors périmètre V1.

---

## DEP-0776 — Stratégie de limitation de débit téléphonie

### Objectif

Définir les limites de fréquence applicables aux appels entrants sur le
canal téléphonique vocal (IVR / assistant vocal) afin de prévenir les abus
et les attaques par déni de service.

### Limites V1

| Contexte                         | Limite     | Fenêtre   |
| -------------------------------- | ---------- | --------- |
| Appels par numéro appelant       | 10 appels  | 1 heure   |
| Appels simultanés par tenant     | 3 lignes   | —         |
| Durée maximale d'un appel        | 15 minutes | Par appel |
| Tentatives de commande par appel | 5          | Par appel |

### Comportement en cas de dépassement

- L'appel est redirigé vers un message vocal d'indisponibilité temporaire.
- L'événement est journalisé (niveau `warn`) avec le numéro masqué (DEP-0781)
  et l'horodatage.
- En cas de dépassement répété (>50 appels/heure depuis le même numéro),
  un signalement automatique est envoyé au super admin.

### Règles

- Les limites par tenant sont indépendantes entre tenants.
- Un numéro bloqué peut être débloqué manuellement par le super admin.
- La durée maximale d'appel est configurable par tenant en V2+.

---

## DEP-0777 — Stratégie de journalisation sécurisée

### Objectif

Définir les règles régissant ce qui est journalisé, comment, et avec quelles
garanties de sécurité et de confidentialité.

### Niveaux de journalisation

| Niveau  | Utilisation                                                     |
| ------- | --------------------------------------------------------------- |
| `debug` | Développement uniquement — désactivé en production              |
| `info`  | Événements normaux : connexion, commande créée, état changé     |
| `warn`  | Événements anormaux non critiques : dépassement de débit, retry |
| `error` | Erreurs applicatives : exception non gérée, timeout critique    |
| `fatal` | Défaillance système : perte de connexion base de données        |

### Ce qui est TOUJOURS journalisé

- Connexions et déconnexions (succès et échecs) avec horodatage et IP.
- Création, modification et annulation de commandes.
- Changements d'état de commande (DEP-0585).
- Actions admin et super admin (DEP-0786, DEP-0787).
- Dépassements de limite de débit (DEP-0775, DEP-0776).
- Erreurs d'autorisation (accès refusé, token invalide).

### Ce qui n'est JAMAIS journalisé

- Mots de passe, même hachés.
- Tokens d'authentification complets.
- Numéros de carte bancaire (hors périmètre V1 de toute façon).
- Transcriptions vocales complètes (DEP-0783).
- Données personnelles non masquées (DEP-0778).

### Règles

- Les journaux de production sont en JSON structuré pour faciliter l'analyse.
- La rétention des journaux est de **90 jours** en V1.
- Les journaux ne sont jamais exposés publiquement.
- L'accès aux journaux est réservé au super admin et aux développeurs
  autorisés.

---

## DEP-0778 — Stratégie de masquage des données sensibles dans les logs

### Objectif

Définir quelles données doivent être masquées ou pseudonymisées avant
d'apparaître dans les journaux, afin de protéger la vie privée des utilisateurs
et de se conformer aux obligations légales.

### Règles de masquage

| Donnée sensible               | Règle de masquage                                             |
| ----------------------------- | ------------------------------------------------------------- |
| Numéro de téléphone           | Masqué partiellement : `+1 514 ***-**34`                      |
| Adresse de livraison complète | Rue masquée, ville conservée : `*** Rue Principale, Montréal` |
| Email                         | Masqué partiellement : `ga***@gmail.com`                      |
| Nom complet du client         | Initiales uniquement : `G. B.`                                |
| Token d'authentification      | Remplacé par `[TOKEN_REDACTED]`                               |
| Clé API externe               | Remplacée par `[API_KEY_REDACTED]`                            |
| Contenu du panier             | Journalisé intégralement (pas de donnée sensible)             |
| Montant de commande           | Journalisé intégralement                                      |

### Application

- Le masquage est appliqué **avant** l'écriture dans le journal — jamais
  après coup.
- Les champs masqués sont identifiables dans les logs par leur format
  normalisé (astérisques).
- Le masquage ne s'applique pas aux bases de données de production — uniquement
  aux journaux.
- Un audit de conformité des logs peut être déclenché par le super admin.

---

## DEP-0779 — Stratégie de chiffrement au repos

### Objectif

Définir les règles de chiffrement des données stockées sur les serveurs et
dans les bases de données de la plateforme.

### Données chiffrées au repos

| Données                           | Méthode V1                                                   |
| --------------------------------- | ------------------------------------------------------------ |
| Base de données principale        | Chiffrement au niveau du volume (AES-256 ou équivalent)      |
| Fichiers médias (images produits) | Chiffrement au niveau du stockage objet                      |
| Journaux d'activité archivés      | Chiffrement au niveau du volume                              |
| Sauvegardes (DEP-0785)            | Chiffrement avant transfert et au repos                      |
| Transcriptions vocales            | Chiffrement au niveau du volume si conservées temporairement |

### Données NON chiffrées individuellement en V1

- Chaque champ de la base de données n'est pas chiffré individuellement —
  le chiffrement est au niveau du volume/disque en V1.
- Le chiffrement champ par champ (ex. AES sur les emails) est une option V2+.

### Règles

- Les clés de chiffrement ne sont jamais stockées dans le même système que
  les données chiffrées.
- La rotation des clés est planifiée annuellement en V1.
- Aucun disque non chiffré ne peut héberger des données de production.

---

## DEP-0780 — Stratégie de chiffrement en transit

### Objectif

Définir les règles de chiffrement des données en transit entre les clients,
les serveurs et les services tiers.

### Règles de chiffrement en transit

| Canal                           | Protocole obligatoire                       |
| ------------------------------- | ------------------------------------------- |
| Client web ↔ serveur            | HTTPS (TLS 1.2 minimum, TLS 1.3 recommandé) |
| Application livreur ↔ serveur   | HTTPS (TLS 1.2 minimum)                     |
| Serveur ↔ base de données       | Connexion chiffrée (TLS ou socket sécurisé) |
| Serveur ↔ service de téléphonie | HTTPS + authentification par clé API        |
| Serveur ↔ service SMS/push      | HTTPS + authentification par clé API        |
| Serveur ↔ stockage objet        | HTTPS                                       |
| Inter-services internes         | HTTPS en V1                                 |

### Règles

- Le protocole HTTP non chiffré est **interdit** pour toute communication
  transportant des données utilisateur ou des tokens.
- Les certificats TLS sont renouvelés automatiquement (via Let's Encrypt ou
  équivalent).
- Un certificat expiré doit déclencher une alerte immédiate au super admin.
- La version TLS 1.0 et 1.1 est explicitement désactivée.

---

## DEP-0781 — Stratégie de protection des numéros de téléphone

### Objectif

Définir comment les numéros de téléphone des clients et des dépanneurs sont
protégés à toutes les étapes du cycle de vie de la donnée.

### Règles de protection

| Contexte                         | Règle                                                    |
| -------------------------------- | -------------------------------------------------------- |
| Stockage en base                 | Numéro complet, base chiffrée au repos (DEP-0779)        |
| Affichage dans l'interface admin | Masqué partiellement (DEP-0778) sauf si action explicite |
| Journaux                         | Toujours masqué (DEP-0778)                               |
| Transmission au service tiers    | Via HTTPS uniquement (DEP-0780)                          |
| Export de données                | Masqué par défaut ; non masqué uniquement si export RGPD |
| API réponse                      | Retourné uniquement si le rôle du token le permet        |

### Accès autorisés au numéro complet

| Rôle        | Accès au numéro complet | Contexte                          |
| ----------- | ----------------------- | --------------------------------- |
| Client      | Son propre numéro       | Dans son profil uniquement        |
| Dépanneur   | Numéros de ses clients  | Dans la fiche commande uniquement |
| Livreur     | Numéro du client        | Pour contact lors de la livraison |
| Super admin | Tous                    | À des fins de support ou audit    |

### Règles

- Un livreur n'a accès au numéro du client que pendant la livraison active.
- Le numéro du dépanneur n'est jamais affiché aux clients en V1.
- La suppression d'un compte entraîne l'anonymisation du numéro dans
  l'historique.

---

## DEP-0782 — Stratégie de protection des adresses

### Objectif

Définir comment les adresses de livraison des clients sont protégées à
toutes les étapes.

### Règles de protection

| Contexte                           | Règle                                                      |
| ---------------------------------- | ---------------------------------------------------------- |
| Stockage en base                   | Adresse complète, base chiffrée au repos (DEP-0779)        |
| Affichage dans l'interface admin   | Adresse complète visible pour le dépanneur (nécessaire)    |
| Affichage dans l'interface livreur | Adresse complète visible pendant la livraison              |
| Journaux                           | Rue masquée, ville conservée (DEP-0778)                    |
| API réponse                        | Retournée uniquement au rôle autorisé                      |
| Export de données                  | Masquée par défaut ; non masquée uniquement si export RGPD |

### Accès autorisés à l'adresse complète

| Rôle        | Accès à l'adresse complète | Contexte                         |
| ----------- | -------------------------- | -------------------------------- |
| Client      | Ses propres adresses       | Dans son profil et ses commandes |
| Dépanneur   | Adresses de ses clients    | Dans la fiche commande           |
| Livreur     | Adresse de livraison       | Pendant la livraison active      |
| Super admin | Toutes                     | À des fins de support ou audit   |

### Règles

- L'adresse n'est jamais affichée à un livreur non assigné à la commande.
- La suppression d'un compte entraîne l'anonymisation des adresses dans
  l'historique des commandes.
- Le géocodage (coordonnées GPS) ne remplace pas le stockage de l'adresse
  textuelle.

---

## DEP-0783 — Stratégie de suppression des transcriptions vocales

### Objectif

Définir la durée de conservation, les conditions de suppression et les règles
de confidentialité applicables aux transcriptions des appels vocaux.

### Politique de conservation V1

| Type de transcription                           | Durée de conservation | Condition               |
| ----------------------------------------------- | --------------------- | ----------------------- |
| Transcription d'une commande passée avec succès | 7 jours               | Suppression automatique |
| Transcription d'un appel sans commande          | 24 heures             | Suppression automatique |
| Transcription d'un appel litigieux              | 30 jours              | Sur signalement manuel  |
| Audio brut de l'appel                           | Non conservé en V1    | Jamais stocké           |

### Règles

- La transcription est utilisée uniquement pour alimenter l'assistant vocal
  en temps réel — elle n'est pas archivée à des fins d'analyse en V1.
- Aucune transcription n'est accessible aux clients, dépanneurs ou livreurs.
- Le super admin peut consulter une transcription pendant sa période de
  conservation, uniquement à des fins de support ou litige.
- La suppression est automatique et irréversible.
- Un client peut demander la suppression anticipée de sa transcription
  (exercice du droit à l'effacement).

---

## DEP-0784 — Stratégie de conservation des commandes

### Objectif

Définir la durée de conservation des données de commande, les règles
d'archivage et les conditions de suppression.

### Politique de conservation

| Type de données                     | Durée de conservation      | Action après délai        |
| ----------------------------------- | -------------------------- | ------------------------- |
| Commande complète (livrée, annulée) | 3 ans                      | Archivage anonymisé       |
| Commande en litige                  | 5 ans                      | Conservation intégrale    |
| Panier abandonné                    | 24 heures (DEP-0578)       | Suppression automatique   |
| Historique des états (DEP-0585)     | Même durée que la commande | Archivage anonymisé       |
| Données personnelles dans commandes | Anonymisées après 3 ans    | Adresse, nom → anonymisés |

### Règles

- L'anonymisation remplace les données personnelles (nom, adresse, téléphone)
  par des valeurs neutres (`[ANONYMISÉ]`) sans supprimer la commande elle-même.
- Les données financières agrégées (montants, totaux) sont conservées après
  anonymisation pour les statistiques.
- Un tenant peut demander l'export de ses données avant suppression.
- La suppression de compte client n'efface pas les commandes — elle anonymise
  uniquement les données personnelles.

---

## DEP-0785 — Stratégie de sauvegarde et restauration

### Objectif

Définir la fréquence, les méthodes et les procédures de sauvegarde et de
restauration des données de la plateforme.

### Politique de sauvegarde V1

| Type de sauvegarde               | Fréquence     | Rétention | Chiffrement    |
| -------------------------------- | ------------- | --------- | -------------- |
| Sauvegarde complète de la base   | Quotidienne   | 30 jours  | Oui (DEP-0779) |
| Sauvegarde incrémentale          | Toutes les 6h | 7 jours   | Oui            |
| Sauvegarde des médias (images)   | Hebdomadaire  | 30 jours  | Oui            |
| Sauvegarde des journaux archivés | Hebdomadaire  | 90 jours  | Oui            |

### Procédure de restauration

| Étape | Action                                                             |
| ----- | ------------------------------------------------------------------ |
| 1     | Identifier la sauvegarde cible (date, type)                        |
| 2     | Notifier le super admin de l'opération de restauration             |
| 3     | Effectuer la restauration en environnement de test d'abord         |
| 4     | Valider l'intégrité des données restaurées                         |
| 5     | Appliquer en production avec fenêtre de maintenance planifiée      |
| 6     | Journaliser l'opération complète avec l'identifiant du responsable |

### Règles

- Les sauvegardes sont stockées dans un emplacement géographiquement distinct
  du serveur principal.
- Un test de restauration est effectué mensuellement en V1.
- Aucune sauvegarde non chiffrée ne peut être transférée hors du système.
- L'accès aux sauvegardes est réservé au super admin et à l'équipe technique.

---

## DEP-0786 — Stratégie d'audit des actions admin (dépanneur)

### Objectif

Définir quelles actions effectuées par un compte dépanneur sont enregistrées
dans le journal d'audit, avec quelles informations.

### Actions auditées

| Action                             | Informations enregistrées                                 |
| ---------------------------------- | --------------------------------------------------------- |
| Connexion / déconnexion            | Horodatage, IP, succès ou échec                           |
| Modification du catalogue          | Produit concerné, champ modifié, ancienne/nouvelle valeur |
| Activation / désactivation produit | Produit, état avant/après, horodatage                     |
| Acceptation / refus de commande    | Commande, décision, horodatage (DEP-0493, DEP-0494)       |
| Modification d'état de commande    | Commande, état avant/après, acteur, horodatage            |
| Ajout / suppression de livreur     | Compte livreur concerné, acteur, horodatage               |
| Modification des paramètres        | Paramètre concerné, ancienne/nouvelle valeur              |
| Export de données                  | Type d'export, horodatage, IP                             |

### Règles

- Chaque entrée d'audit est **immuable** — elle ne peut pas être modifiée
  ni supprimée par le dépanneur.
- Le journal d'audit est visible par le dépanneur pour ses propres actions.
- Le super admin peut consulter tous les journaux d'audit de tous les tenants.
- La rétention du journal d'audit est de **1 an** en V1.

---

## DEP-0787 — Stratégie d'audit des actions super admin

### Objectif

Définir quelles actions du super administrateur sont auditées, avec un niveau
de traçabilité renforcé.

### Actions auditées (super admin)

| Action                              | Informations enregistrées                     |
| ----------------------------------- | --------------------------------------------- |
| Connexion / déconnexion             | Horodatage, IP, appareil, succès ou échec     |
| Création de tenant                  | Identifiant tenant, acteur, horodatage        |
| Suspension / réactivation tenant    | Tenant, motif, acteur, horodatage (DEP-0675)  |
| Archivage / suppression tenant      | Tenant, motif, acteur, horodatage             |
| Consultation d'un journal d'audit   | Tenant concerné, portée consultée, horodatage |
| Export de données tenant            | Tenant, type d'export, acteur, horodatage     |
| Modification des paramètres globaux | Paramètre, ancienne/nouvelle valeur, acteur   |
| Déblocage d'un numéro               | Numéro masqué, acteur, motif, horodatage      |

### Règles

- Le journal d'audit du super admin est **distinct** des journaux des tenants.
- Aucun super admin ne peut modifier ou supprimer une entrée d'audit.
- Un second super admin peut consulter le journal du premier (contrôle croisé).
- La rétention est de **3 ans** pour les actions super admin.

---

## DEP-0788 — Stratégie d'audit des changements de catalogue

### Objectif

Définir la traçabilité complète de toutes les modifications apportées au
catalogue de produits d'un tenant.

### Événements audités

| Événement                         | Informations enregistrées                               |
| --------------------------------- | ------------------------------------------------------- |
| Ajout d'un produit                | Nom, catégorie, prix, acteur, horodatage                |
| Modification d'un produit         | Champ modifié, ancienne valeur, nouvelle valeur, acteur |
| Suppression d'un produit          | Nom, raison si renseignée, acteur, horodatage           |
| Modification du prix              | Ancien prix, nouveau prix, acteur, horodatage           |
| Changement de disponibilité       | État avant/après, acteur, horodatage (DEP-0584)         |
| Ajout / modification de catégorie | Nom, acteur, horodatage                                 |
| Import de catalogue               | Nombre de produits, acteur, horodatage                  |

### Règles

- L'historique des prix est conservé indépendamment de la durée de vie du
  produit — utile pour les litiges sur les montants de commandes passées.
- Un produit supprimé reste dans le journal d'audit (il n'est jamais effacé
  du journal).
- La rétention de l'audit catalogue est alignée sur celle des commandes
  (DEP-0784 : 3 ans).

---

## DEP-0789 — Stratégie d'audit des changements de statut de commande

### Objectif

Définir la traçabilité de chaque transition d'état dans le cycle de vie
d'une commande (complément à DEP-0585).

### Informations enregistrées pour chaque transition

| Champ            | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `order_id`       | Identifiant unique de la commande                                  |
| `tenant_id`      | Tenant propriétaire                                                |
| `from_state`     | État avant la transition                                           |
| `to_state`       | État après la transition                                           |
| `actor_role`     | Rôle de l'acteur déclencheur (client, dépanneur, livreur, système) |
| `actor_id`       | Identifiant de l'acteur (anonymisé après 3 ans)                    |
| `timestamp`      | Horodatage ISO 8601                                                |
| `reason`         | Motif si applicable (refus, annulation, problème)                  |
| `source_channel` | Canal déclencheur : web, téléphone, interface admin                |

### Transitions interdites journalisées

- Toute tentative de transition interdite (DEP-0581) est journalisée avec
  le niveau `warn` et l'identifiant de l'acteur.

### Règles

- Le journal de transitions est **immuable** et **complet** — aucune
  transition n'est silencieuse.
- Accessible au dépanneur pour ses propres commandes, au super admin pour
  toutes.
- Conservé pendant la même durée que la commande (DEP-0784).

---

## DEP-0790 — Stratégie d'audit des livraisons

### Objectif

Définir la traçabilité complète du cycle de vie d'une livraison, depuis
l'assignation jusqu'à la confirmation de livraison.

### Événements audités

| Événement                     | Informations enregistrées                                   |
| ----------------------------- | ----------------------------------------------------------- |
| Assignation d'un livreur      | Livreur, commande, acteur, horodatage                       |
| Acceptation par le livreur    | Livreur, commande, horodatage (DEP-0555)                    |
| Départ du dépanneur           | Livreur, commande, horodatage (DEP-0556)                    |
| Arrivée chez le client        | Livreur, commande, horodatage                               |
| Confirmation de livraison     | Livreur, commande, mode confirmation, horodatage (DEP-0557) |
| Signalement d'un problème     | Livreur, commande, description, horodatage (DEP-0559)       |
| Confirmation du paiement cash | Livreur, montant, horodatage (DEP-0590)                     |
| Refus de livraison            | Livreur, motif, horodatage                                  |

### Règles

- Le livreur ne peut pas modifier une entrée d'audit après sa création.
- Le dépanneur voit les audits de livraison de ses propres commandes.
- Le super admin voit tous les audits de livraison de tous les tenants.
- La rétention est alignée sur celle des commandes (DEP-0784 : 3 ans).

---

## DEP-0791 — Gardes d'accès du front

### Objectif

Définir la spécification des gardes de navigation côté front-end, qui
protègent les routes de l'interface selon le rôle et l'état de la session.

### Gardes définis

| Garde                    | Routes protégées            | Condition de passage                      |
| ------------------------ | --------------------------- | ----------------------------------------- |
| `AuthGuard`              | Toutes les routes privées   | Token valide et non expiré                |
| `RoleGuard(client)`      | Boutique, panier, commandes | Rôle = `client`                           |
| `RoleGuard(depanneur)`   | Interface admin dépanneur   | Rôle = `depanneur`                        |
| `RoleGuard(livreur)`     | Interface livreur           | Rôle = `livreur`                          |
| `RoleGuard(super_admin)` | Console super admin         | Rôle = `super_admin`                      |
| `TenantGuard`            | Toutes les routes tenant    | `tenant_id` du token = tenant de la route |
| `SuspendedTenantGuard`   | Boutique cliente            | Tenant en statut `actif`                  |
| `GuestGuard`             | Login, inscription          | Aucun token valide présent                |

### Comportement en cas d'échec

| Type d'échec     | Redirection                                 |
| ---------------- | ------------------------------------------- |
| Non authentifié  | Page de connexion                           |
| Rôle insuffisant | Page d'erreur 403 (DEP-0795)                |
| Session expirée  | Page de reconnexion avec message (DEP-0796) |
| Tenant suspendu  | Page d'indisponibilité tenant               |
| Tenant inconnu   | Page d'erreur 404                           |

### Règles

- Les gardes sont vérifiés **avant** le chargement de chaque composant de route.
- Un utilisateur avec un token expiré est redirigé vers la reconnexion — sa
  session est conservée pour reprise après reconnexion.
- Le `TenantGuard` est appliqué en plus du `RoleGuard` — les deux doivent
  passer.

---

## DEP-0792 — Gardes d'accès de l'API

### Objectif

Définir la spécification des middlewares de sécurité côté API, appliqués
à chaque requête entrante.

### Middlewares définis

| Middleware                  | Rôle                                                          |
| --------------------------- | ------------------------------------------------------------- |
| `AuthMiddleware`            | Valide le token JWT — rejette avec 401 si invalide ou expiré  |
| `TenantMiddleware`          | Extrait et valide le `tenant_id` du token — 403 si incohérent |
| `RoleMiddleware`            | Vérifie que le rôle du token autorise la route — 403 sinon    |
| `RateLimitMiddleware`       | Applique les limites de débit (DEP-0774, DEP-0775)            |
| `InputValidationMiddleware` | Valide le format et le type de chaque entrée (DEP-0771)       |
| `SuspendedTenantMiddleware` | Rejette les requêtes si le tenant est suspendu — 503          |

### Ordre d'application des middlewares

```
RateLimit → Auth → Tenant → SuspendedTenant → Role → InputValidation → Handler
```

### Règles

- Chaque middleware est indépendant et peut rejeter la requête sans exécuter
  les suivants.
- Un échec d'authentification ne révèle jamais si le compte existe ou non
  (message générique).
- Les réponses d'erreur de sécurité ne contiennent jamais de détails
  techniques en production.
- Tous les rejets sont journalisés avec le niveau approprié (DEP-0777).

---

## DEP-0793 — Tests de permissions par rôle

### Objectif

Définir la spécification des tests vérifiant que chaque rôle accède uniquement
aux ressources qui lui sont autorisées.

### Matrice de tests par rôle

| Rôle          | Ce qui doit être accessible                      | Ce qui doit être refusé (403)                                                      |
| ------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `client`      | Boutique, panier, ses commandes                  | Interface admin, interface livreur, console super admin                            |
| `depanneur`   | Interface admin de son tenant                    | Boutique client, interface livreur, console super admin, données d'un autre tenant |
| `livreur`     | Ses livraisons assignées                         | Interface admin, boutique, données d'un autre tenant, livraisons non assignées     |
| `super_admin` | Console super admin, tous les tenants en lecture | Modification directe de données d'un tenant sans journalisation                    |

### Scénarios de test

| Test  | Description                                                            |
| ----- | ---------------------------------------------------------------------- |
| T-R01 | Un client tente d'accéder à `/admin` → 403                             |
| T-R02 | Un dépanneur tente d'accéder à `/livraisons` → 403                     |
| T-R03 | Un livreur tente de modifier un produit du catalogue → 403             |
| T-R04 | Un client tente de changer l'état d'une commande → 403                 |
| T-R05 | Un dépanneur tente d'accéder à la console super admin → 403            |
| T-R06 | Un livreur tente de voir les commandes non assignées → 403             |
| T-R07 | Un super admin consulte les données d'un tenant → 200 + journalisation |
| T-R08 | Un client non connecté tente d'accéder au panier → 401                 |

### Règles

- Ces tests sont exécutés avec des tokens réels correspondant à chaque rôle.
- Un test qui retourne 200 sur une ressource interdite est un échec critique.
- Les tests de permissions sont indépendants des tests fonctionnels.

---

## DEP-0794 — Tests de permissions par tenant

### Objectif

Définir la spécification des tests vérifiant qu'aucun utilisateur d'un tenant
ne peut accéder aux ressources d'un autre tenant, même avec un token valide.

### Scénarios de test

| Test  | Description                                                                 |
| ----- | --------------------------------------------------------------------------- |
| T-T01 | Dépanneur A tente de lire les commandes du tenant B → 403                   |
| T-T02 | Dépanneur A tente de modifier un produit du catalogue B → 403               |
| T-T03 | Client A tente de voir les produits de la boutique B avec son token A → 403 |
| T-T04 | Livreur A tente d'accepter une livraison du tenant B → 403                  |
| T-T05 | Token tenant A envoyé sur une route tenant B → 403                          |
| T-T06 | Super admin consulte les commandes du tenant A → 200 + entrée audit         |
| T-T07 | Super admin consulte les commandes du tenant B → 200 + entrée audit         |
| T-T08 | Requête sans `tenant_id` sur une route protégée → 400 ou 403                |
| T-T09 | Token avec `tenant_id` inexistant → 403                                     |
| T-T10 | Token valide mais tenant suspendu → 503                                     |

### Règles

- Chaque test est exécuté avec deux tenants distincts créés spécifiquement
  pour les tests (non liés aux données de production).
- Un résultat 200 sur un test T-T01 à T-T05 ou T-T08/T-T09 est une
  **défaillance de sécurité critique**.
- Ces tests complètent les tests de séparation définis en DEP-0678 et
  DEP-0679, avec une approche orientée permissions plutôt que données.
- Les tests de permissions par tenant sont exécutés à chaque déploiement en
  production.

---

## Synthèse

| DEP  | Titre                                        | Statut |
| ---- | -------------------------------------------- | ------ |
| 0775 | Limitation de débit assistant                | Défini |
| 0776 | Limitation de débit téléphonie               | Défini |
| 0777 | Journalisation sécurisée                     | Défini |
| 0778 | Masquage des données sensibles dans les logs | Défini |
| 0779 | Chiffrement au repos                         | Défini |
| 0780 | Chiffrement en transit                       | Défini |
| 0781 | Protection des numéros de téléphone          | Défini |
| 0782 | Protection des adresses                      | Défini |
| 0783 | Suppression des transcriptions vocales       | Défini |
| 0784 | Conservation des commandes                   | Défini |
| 0785 | Sauvegarde et restauration                   | Défini |
| 0786 | Audit des actions admin (dépanneur)          | Défini |
| 0787 | Audit des actions super admin                | Défini |
| 0788 | Audit des changements de catalogue           | Défini |
| 0789 | Audit des changements de statut de commande  | Défini |
| 0790 | Audit des livraisons                         | Défini |
| 0791 | Gardes d'accès du front                      | Défini |
| 0792 | Gardes d'accès de l'API                      | Défini |
| 0793 | Tests de permissions par rôle                | Défini |
| 0794 | Tests de permissions par tenant              | Défini |
