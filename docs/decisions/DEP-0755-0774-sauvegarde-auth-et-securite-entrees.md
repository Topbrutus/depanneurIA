# DEP-0755 à DEP-0774 — Sauvegarde, authentification et sécurité des entrées

## Périmètre

Ce fichier couvre deux sous-blocs consécutifs de la checklist :

| Plage               | Thème                                                                      |
| ------------------- | -------------------------------------------------------------------------- |
| DEP-0755 à DEP-0760 | Stratégies de sauvegarde, journaux, coûts et gel infrastructure cloud V1   |
| DEP-0761 à DEP-0774 | Authentification par rôle, sessions, autorisations et sécurité des entrées |

Contrainte absolue : documentation décisionnelle uniquement — aucun code, aucun secret réel.

---

## DEP-0755 — Stratégie de sauvegarde de base de données

### Objectif

Définir quand, comment et combien de temps les données de la base de données principale sont sauvegardées.

### Décisions

| Paramètre           | Valeur retenue                                                        |
| ------------------- | --------------------------------------------------------------------- |
| Fréquence           | Sauvegarde automatique quotidienne (heure creuse, ex. 03h00 UTC)      |
| Type                | Snapshot complet + journaux WAL/oplog pour restauration point-in-time |
| Rétention           | 7 jours en développement, 30 jours en production                      |
| Stockage            | Bucket Cloud Storage séparé du bucket opérationnel, chiffré au repos  |
| Restauration testée | Au moins une restauration de test par trimestre                       |
| Alerte              | Notification Slack/email si aucune sauvegarde détectée dans les 26 h  |

### Règles

- La sauvegarde ne doit jamais être dans le même projet GCP que les données de production.
- Le compte de service de sauvegarde n'a que les droits `read` sur la base et `write` sur le bucket de destination.
- Aucune donnée client en clair dans les noms de fichiers de sauvegarde.

### Cas attendus

| Scénario               | Résultat attendu                                               |
| ---------------------- | -------------------------------------------------------------- |
| Sauvegarde quotidienne | Fichier snapshot créé dans le bucket, horodaté                 |
| Restauration d'urgence | Base restaurée à J-1 max en moins de 1 heure (objectif RTO V1) |
| Sauvegarde manquée     | Alerte déclenchée dans les 2 h suivantes                       |

---

## DEP-0756 — Stratégie de rétention des journaux

### Objectif

Définir combien de temps les journaux applicatifs et système sont conservés, et comment ils sont archivés.

### Décisions

| Type de journal                              | Rétention active            | Archivage froid             |
| -------------------------------------------- | --------------------------- | --------------------------- |
| Journaux applicatifs (backend)               | 30 jours dans Cloud Logging | 90 jours dans Cloud Storage |
| Journaux d'accès API                         | 14 jours                    | 30 jours                    |
| Journaux d'erreur                            | 60 jours                    | 180 jours                   |
| Journaux d'audit (actions admin/super admin) | 90 jours actifs             | 1 an archivé                |
| Journaux téléphonie                          | 30 jours                    | 90 jours                    |

### Règles

- Les journaux contenant des données personnelles (numéro de téléphone, adresse) sont masqués avant archivage (voir DEP-0778).
- Aucun journal ne doit contenir de mot de passe, token ou secret en clair.
- La suppression d'un journal avant sa date de rétention requiert une action super admin tracée.

### Cas attendus

| Scénario                    | Résultat attendu                                     |
| --------------------------- | ---------------------------------------------------- |
| Journal de 35 jours d'API   | Supprimé de la vue active, accessible via archive    |
| Audit admin de 91 jours     | Accessible uniquement en archive, non modifiable     |
| Recherche dans les journaux | Possible via Cloud Logging sur les 30 derniers jours |

---

## DEP-0757 — Stratégie de coût maximum de tests

### Objectif

Plafonner les dépenses engendrées par les tests automatisés (CI/CD, tests d'intégration, tests de charge).

### Décisions

| Type de test                 | Environnement          | Plafond mensuel estimé                           |
| ---------------------------- | ---------------------- | ------------------------------------------------ |
| Tests unitaires              | Local / GitHub Actions | 0 $ (runners gratuits)                           |
| Tests d'intégration          | Cloud Run dev          | Moins de 5 $ par mois                            |
| Tests de charge (si activés) | Cloud Run dev isolé    | Moins de 20 $ par mois, arrêt automatique        |
| Tests téléphonie (webhooks)  | Dev avec numéro test   | Moins de 10 $ par mois                           |
| Total toléré                 | Toutes catégories      | Moins de 50 $ par mois en phase de développement |

### Règles

- Les jobs de test ne tournent jamais en production sans validation explicite.
- Une alerte de facturation GCP se déclenche à 40 $ cumulés sur le mois.
- Les tests lourds (load testing) sont désactivés par défaut, activés uniquement sur demande manuelle.
- Les images Docker de test sont supprimées d'Artifact Registry après 7 jours.

### Cas attendus

| Scénario                        | Résultat attendu                        |
| ------------------------------- | --------------------------------------- |
| CI tourne 50 fois dans le mois  | Coût inférieur à 5 $                    |
| Test de charge accidentel lancé | Alerte à 40 $ avant dépassement de 50 $ |
| Image Docker de test de 8 jours | Supprimée automatiquement               |

---

## DEP-0758 — Déployer un premier service "hello world" sur Cloud Run

### Objectif

Valider que le pipeline de déploiement de base fonctionne de bout en bout avant de déployer du code métier.

### Décisions

| Élément     | Valeur                                                        |
| ----------- | ------------------------------------------------------------- |
| Service     | Cloud Run `depanneur-hello` (environnement dev uniquement)    |
| Image       | Image minimaliste retournant `{"status": "ok"}` en HTTP 200   |
| Déclencheur | Manuel (pas en CI automatique)                                |
| URL         | URL Cloud Run générée automatiquement (pas de domaine custom) |
| Suppression | Service supprimé après validation (pas laissé actif)          |

### Règles

- Ce service ne contient aucune logique métier ni donnée.
- Il sert uniquement à valider les droits IAM et la configuration Cloud Run.
- La validation est considérée réussie si l'URL répond HTTP 200 depuis l'extérieur.

### Cas attendus

| Scénario                 | Résultat attendu                         |
| ------------------------ | ---------------------------------------- |
| Déploiement manuel       | Service actif en moins de 3 minutes      |
| Appel HTTP GET sur l'URL | Réponse `{"status": "ok"}` HTTP 200      |
| Vérification des logs    | Entrée de log visible dans Cloud Logging |

---

## DEP-0759 — Vérifier un premier déploiement GitHub vers Google Cloud

### Objectif

Valider le workflow GitHub Actions vers Google Cloud end-to-end avant de l'utiliser pour du code de production.

### Décisions

| Étape              | Détail                                                                          |
| ------------------ | ------------------------------------------------------------------------------- |
| Déclencheur        | Push sur branche `infra/hello-world` ou workflow dispatch manuel                |
| Authentification   | Workload Identity Federation (pas de clé JSON dans les secrets)                 |
| Étapes du workflow | Checkout → Build image → Push vers Artifact Registry → Deploy sur Cloud Run dev |
| Validation         | Smoke test HTTP GET après déploiement                                           |
| Nettoyage          | Suppression du service après validation réussie                                 |

### Règles

- Le compte de service utilisé par GitHub Actions n'a que les droits minimaux nécessaires.
- Aucun secret n'est logué dans les outputs du workflow.
- Ce workflow est supprimé ou désactivé une fois la validation confirmée.

### Cas attendus

| Scénario           | Résultat attendu                                         |
| ------------------ | -------------------------------------------------------- |
| Workflow déclenché | Build, push et deploy en moins de 10 minutes             |
| Smoke test HTTP    | HTTP 200 reçu automatiquement                            |
| Workflow échoue    | Erreur lisible dans GitHub Actions, pas de secret exposé |

---

## DEP-0760 — Gel de la base d'infrastructure cloud V1

### Objectif

Figer les décisions d'infrastructure cloud (DEP-0721 à DEP-0759) pour éviter toute dérive avant le lancement V1.

### Décisions

| Élément gelé             | Valeur V1                                                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Fournisseur cloud        | Google Cloud Platform uniquement                                                                                                   |
| Services activés         | Cloud Run, Artifact Registry, Cloud Build, Secret Manager, Cloud Logging, Cloud Monitoring, base de données choisie, Cloud Storage |
| Environnements           | dev, preprod, prod                                                                                                                 |
| Stratégie de déploiement | GitHub Actions vers Cloud Run via Workload Identity                                                                                |
| Domaines                 | Définis et validés avant la mise en production                                                                                     |
| Stratégie de sauvegarde  | Quotidienne, rétention 30 jours prod                                                                                               |
| Stratégie de journaux    | Rétention 30 jours actifs                                                                                                          |
| Plafond tests            | Moins de 50 $ par mois                                                                                                             |

### Règles

- Toute modification de l'infrastructure V1 après ce gel doit faire l'objet d'un nouveau DEP documenté.
- Les services non listés ci-dessus ne peuvent pas être activés sans approbation explicite.
- Ce gel ne s'applique pas aux configurations applicatives (variables d'env, secrets).

---

## DEP-0761 — Modèle d'authentification des clients

### Objectif

Définir comment un client final (acheteur) s'identifie sur la boutique d'un dépanneur.

### Décisions

| Paramètre           | Valeur retenue                                       |
| ------------------- | ---------------------------------------------------- |
| Méthode principale  | Numéro de téléphone + code OTP SMS                   |
| Méthode alternative | Lien magique par email (si email fourni)             |
| Pas de mot de passe | Aucun mot de passe permanent pour les clients en V1  |
| Identifiant interne | UUID client, isolé par tenant                        |
| Persistance         | Session JWT courte durée (voir DEP-0766)             |
| Première visite     | Création de compte automatique au premier OTP validé |

### Règles

- Le numéro de téléphone est le seul identifiant fiable en V1.
- Un client du tenant A ne peut pas accéder au tenant B.
- La création de compte ne nécessite pas d'email (optionnel).

### Cas attendus

| Scénario                   | Résultat attendu                             |
| -------------------------- | -------------------------------------------- |
| Client entre son numéro    | OTP SMS envoyé dans les 30 secondes          |
| OTP validé                 | Session créée, client connecté               |
| OTP expiré (plus de 5 min) | Erreur claire, nouvel OTP proposé            |
| Numéro inconnu             | Compte créé automatiquement, session ouverte |

---

## DEP-0762 — Modèle d'authentification des employés dépanneur

### Objectif

Définir comment un employé (caissier, gérant) s'identifie sur l'interface d'administration du dépanneur.

### Décisions

| Paramètre          | Valeur retenue                                      |
| ------------------ | --------------------------------------------------- |
| Méthode principale | Email + mot de passe fort                           |
| 2FA                | Optionnel en V1, obligatoire pour les gérants en V2 |
| Rôles              | `admin_store` (gérant) / `employee_store` (employé) |
| Isolation          | Accès limité au seul tenant de l'employé            |
| Création de compte | Par le gérant ou le super admin uniquement          |
| Réinitialisation   | Lien par email valide 1 heure                       |

### Règles

- Un employé ne peut pas créer un autre compte employé (sauf `admin_store`).
- Un `employee_store` ne voit pas les rapports financiers (réservés à `admin_store`).
- Le mot de passe est hashé avec bcrypt (factor 12 minimum).

### Cas attendus

| Scénario                        | Résultat attendu                                      |
| ------------------------------- | ----------------------------------------------------- |
| Connexion valide                | Session JWT ouverte, redirection vers tableau de bord |
| Mauvais mot de passe 5 fois     | Compte verrouillé 15 minutes, alerte email            |
| Lien de réinitialisation expiré | Erreur explicite, nouveau lien proposé                |

---

## DEP-0763 — Modèle d'authentification des livreurs

### Objectif

Définir comment un livreur s'identifie sur l'application mobile/web livreur.

### Décisions

| Paramètre          | Valeur retenue                                        |
| ------------------ | ----------------------------------------------------- |
| Méthode principale | Numéro de téléphone + OTP SMS (identique au client)   |
| Rôle               | `driver`                                              |
| Liaison            | Le compte livreur est lié à un seul tenant dépanneur  |
| Création de compte | Par le `admin_store` uniquement                       |
| Session            | JWT courte durée, renouvelée automatiquement si actif |

### Règles

- Un livreur ne peut voir que ses propres livraisons assignées.
- Un livreur ne peut pas accéder aux données du catalogue ou aux commandes non assignées.
- La session livreur est révoquée immédiatement si son compte est désactivé.

### Cas attendus

| Scénario                          | Résultat attendu                                   |
| --------------------------------- | -------------------------------------------------- |
| Connexion livreur                 | OTP validé, accès à la liste de livraisons du jour |
| Accès à une commande non assignée | Accès refusé HTTP 403                              |
| Compte désactivé par admin        | Session expirée immédiatement                      |

---

## DEP-0764 — Modèle d'authentification du super administrateur

### Objectif

Définir comment le super administrateur de la plateforme (propriétaire du SaaS) s'identifie.

### Décisions

| Paramètre          | Valeur retenue                                                   |
| ------------------ | ---------------------------------------------------------------- |
| Méthode principale | Email + mot de passe très fort                                   |
| 2FA                | Obligatoire (TOTP via application authentificateur)              |
| Accès              | Depuis une IP de confiance ou VPN uniquement (recommandation V1) |
| Rôle               | `super_admin`                                                    |
| Nombre de comptes  | 1 à 3 maximum en V1                                              |
| Audit              | Toutes les actions super admin sont journalisées (voir DEP-0787) |

### Règles

- Le compte super admin ne peut pas être créé via l'interface publique.
- La désactivation du 2FA est impossible sans procédure d'urgence documentée.
- Le super admin ne peut pas passer commande ou agir comme client.

### Cas attendus

| Scénario             | Résultat attendu                            |
| -------------------- | ------------------------------------------- |
| Connexion sans 2FA   | Accès refusé même avec mot de passe correct |
| Connexion 2FA valide | Accès au tableau de bord super admin        |
| Action super admin   | Entrée d'audit créée automatiquement        |

---

## DEP-0765 — Stratégie de mots de passe ou d'accès magique

### Objectif

Définir les règles applicables aux mots de passe (employés, super admin) et aux accès sans mot de passe (clients, livreurs).

### Décisions

| Utilisateur | Méthode                 | Règle                                     |
| ----------- | ----------------------- | ----------------------------------------- |
| Client      | OTP SMS ou lien magique | Pas de mot de passe                       |
| Livreur     | OTP SMS                 | Pas de mot de passe                       |
| Employé     | Mot de passe + email    | Min 10 caractères, 1 majuscule, 1 chiffre |
| Super admin | Mot de passe + TOTP     | Min 16 caractères, entropie élevée        |

### Règles

- Les OTP sont à usage unique et expirent après 5 minutes.
- Les liens magiques expirent après 1 heure.
- Les mots de passe ne sont jamais stockés en clair (bcrypt, 12 rounds minimum).
- Les mots de passe ne sont jamais transmis en clair dans les emails ou logs.
- Aucune "question secrète" n'est utilisée.

### Cas attendus

| Scénario                     | Résultat attendu                    |
| ---------------------------- | ----------------------------------- |
| OTP réutilisé                | Erreur : OTP déjà utilisé ou expiré |
| Lien magique de 65 minutes   | Erreur : lien expiré                |
| Mot de passe de 8 caractères | Refus à la création : trop court    |

---

## DEP-0766 — Stratégie de sessions sécurisées

### Objectif

Définir comment les sessions utilisateurs sont créées, stockées et protégées.

### Décisions

| Paramètre           | Valeur                                                                      |
| ------------------- | --------------------------------------------------------------------------- |
| Format              | JWT signé (RS256 ou HS256 avec clé secrète rotative)                        |
| Transport           | Cookie HttpOnly + SameSite=Strict (web) / header Authorization (API mobile) |
| Durée access token  | 15 minutes (clients/livreurs) / 8 heures (employés)                         |
| Durée refresh token | 7 jours (clients) / 30 jours (employés)                                     |
| Stockage            | Refresh token en base (révocable), access token stateless                   |
| Rotation            | Refresh token tourné à chaque utilisation                                   |

### Règles

- Les tokens ne contiennent jamais de mot de passe ni de données personnelles sensibles.
- Le payload JWT contient uniquement : `user_id`, `role`, `tenant_id`, `exp`, `iat`.
- Les tokens ne sont pas loggués dans leur intégralité.
- HTTPS obligatoire sur tous les endpoints qui reçoivent ou retournent un token.

### Cas attendus

| Scénario                | Résultat attendu                             |
| ----------------------- | -------------------------------------------- |
| Access token expiré     | Renouvellement automatique via refresh token |
| Refresh token révoqué   | Déconnexion immédiate à la prochaine requête |
| Requête HTTP sans HTTPS | Redirigée vers HTTPS ou refusée              |

---

## DEP-0767 — Stratégie de renouvellement de session

### Objectif

Définir comment et quand un access token expiré est renouvelé sans forcer l'utilisateur à se reconnecter.

### Décisions

| Paramètre                  | Valeur                                                                  |
| -------------------------- | ----------------------------------------------------------------------- |
| Endpoint de renouvellement | `POST /auth/refresh`                                                    |
| Déclencheur                | Automatique côté front si l'access token expire dans moins de 2 minutes |
| Validation                 | Refresh token présent + valide en base + non révoqué                    |
| Résultat                   | Nouveau access token + nouveau refresh token (rotation)                 |
| Limite de renouvellements  | Illimité tant que le refresh token est valide et non révoqué            |

### Règles

- Le renouvellement est silencieux pour l'utilisateur (transparent).
- En cas d'échec du renouvellement, l'utilisateur est redirigé vers la page de connexion.
- Un refresh token ne peut être utilisé qu'une seule fois (rotation obligatoire).
- La rotation empêche la réutilisation d'un token volé.

### Cas attendus

| Scénario                                | Résultat attendu                                     |
| --------------------------------------- | ---------------------------------------------------- |
| Access token expire pendant navigation  | Renouvellement automatique, utilisateur ne voit rien |
| Refresh token expiré                    | Déconnexion propre, page de connexion                |
| Refresh token réutilisé (vol potentiel) | Tous les tokens de la session révoqués               |

---

## DEP-0768 — Stratégie de déconnexion forcée

### Objectif

Définir qui peut forcer la déconnexion d'un utilisateur et comment cela se matérialise.

### Décisions

| Déclencheur                | Qui                            | Effet                                                           |
| -------------------------- | ------------------------------ | --------------------------------------------------------------- |
| Désactivation de compte    | `admin_store` ou `super_admin` | Tous les refresh tokens de l'utilisateur révoqués immédiatement |
| Changement de mot de passe | L'utilisateur lui-même         | Sessions actives révoquées sauf la session courante             |
| Inactivité prolongée       | Système automatique            | Session expirée naturellement (refresh token TTL atteint)       |
| Incident de sécurité       | `super_admin`                  | Révocation globale possible pour un tenant entier               |
| Suppression de compte      | `super_admin`                  | Tous les tokens révoqués, compte marqué supprimé                |

### Règles

- La révocation est effective immédiatement (les refresh tokens sont vérifiés en base).
- L'utilisateur reçoit une notification (email ou SMS) si sa session est révoquée par un admin.
- La révocation globale d'un tenant est une action irréversible sans restauration manuelle.

### Cas attendus

| Scénario                            | Résultat attendu                               |
| ----------------------------------- | ---------------------------------------------- |
| Admin désactive un livreur          | Prochaine requête du livreur retourne HTTP 401 |
| Utilisateur change son mot de passe | Autres appareils déconnectés dans les 15 min   |
| Super admin révoque tenant          | Tous les utilisateurs du tenant déconnectés    |

---

## DEP-0769 — Stratégie d'autorisation par rôle

### Objectif

Définir quelles actions chaque rôle peut effectuer dans le système.

### Matrice des rôles

| Action                  | client |      driver       |  employee_store  | admin_store | super_admin |
| ----------------------- | :----: | :---------------: | :--------------: | :---------: | :---------: |
| Passer commande         |  oui   |        non        |       non        |     non     |     non     |
| Voir son panier         |  oui   |        non        | oui (pour aider) |     oui     |     oui     |
| Modifier catalogue      |  non   |        non        |       non        |     oui     |     oui     |
| Voir commandes du store |  non   | oui (les siennes) |       oui        |     oui     |     oui     |
| Gérer employés          |  non   |        non        |       non        |     oui     |     oui     |
| Créer un tenant         |  non   |        non        |       non        |     non     |     oui     |
| Voir tous les tenants   |  non   |        non        |       non        |     non     |     oui     |

### Règles

- Les rôles sont validés côté serveur à chaque requête, jamais côté client uniquement.
- Un rôle ne peut pas être auto-promu (un `employee_store` ne peut pas devenir `admin_store`).
- Les endpoints sensibles retournent HTTP 403 (pas 404) en cas de rôle insuffisant.

---

## DEP-0770 — Stratégie d'autorisation par tenant

### Objectif

Garantir qu'aucun utilisateur d'un tenant ne peut accéder aux données d'un autre tenant.

### Décisions

| Paramètre                | Valeur                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------ |
| Isolation                | Le `tenant_id` est extrait du JWT et validé à chaque requête de données              |
| Requêtes base de données | Toutes les requêtes incluent un filtre sur tenant_id                                 |
| URL                      | Les routes contiennent le tenant (`/api/tenants/:id/...`) mais le JWT prime          |
| Test d'isolation         | Tests automatisés vérifiant qu'un token tenant A ne retourne pas de données tenant B |

### Règles

- L'isolation par tenant est une règle non-négociable, appliquée au niveau de la couche service.
- Aucun endpoint ne retourne des données multi-tenants sauf les endpoints `super_admin`.
- En cas de doute sur le tenant, la requête est refusée (fail-closed).

### Cas attendus

| Scénario                                    | Résultat attendu                           |
| ------------------------------------------- | ------------------------------------------ |
| Client tenant A appelle `/api/products`     | Voit uniquement les produits de son tenant |
| Token tenant A avec ID commande de tenant B | HTTP 403 ou 404                            |
| Super admin liste tous les tenants          | Données de tous les tenants retournées     |

---

## DEP-0771 — Stratégie de validation des entrées utilisateur

### Objectif

Définir comment les données envoyées par les utilisateurs sont validées avant traitement.

### Décisions

| Type d'entrée           | Validation                                                |
| ----------------------- | --------------------------------------------------------- |
| Numéro de téléphone     | Format E.164, longueur 10 à 15 chiffres, pas de lettres   |
| Email                   | Format RFC 5322 simplifié, longueur max 254               |
| Adresse                 | Longueur max 200 caractères, caractères autorisés définis |
| Texte libre (assistant) | Longueur max 500 caractères, HTML/script stripé           |
| Quantité produit        | Entier positif, max 99 par produit                        |
| Montant                 | Nombre décimal positif, max 2 décimales, max 9999.99 $    |
| ID produit              | UUID v4 uniquement                                        |
| JSON entrant            | Schéma validé (ex. Zod, Joi ou équivalent)                |

### Règles

- La validation se fait côté serveur, toujours, même si le front valide aussi.
- Tout champ non attendu dans une requête est ignoré silencieusement (pas d'erreur, mais pas traité).
- Les erreurs de validation retournent HTTP 400 avec un message clair, jamais un stack trace.
- Aucune entrée utilisateur n'est jamais insérée directement dans une requête SQL (requêtes paramétrées obligatoires).

### Cas attendus

| Scénario                     | Résultat attendu                      |
| ---------------------------- | ------------------------------------- |
| Numéro de téléphone invalide | HTTP 400, message "numéro invalide"   |
| Script injecté dans le texte | HTML stripé, texte nettoyé stocké     |
| Quantité négative            | HTTP 400, message "quantité invalide" |
| Champ inattendu dans JSON    | Ignoré silencieusement                |

---

## DEP-0772 — Stratégie anti-spam des formulaires

### Objectif

Protéger les formulaires publics (commande, inscription, contact) contre les soumissions automatisées abusives.

### Décisions

| Mesure                          | Application                                                               |
| ------------------------------- | ------------------------------------------------------------------------- |
| Rate limiting par IP            | Max 10 soumissions par minute par IP (voir DEP-0774)                      |
| Rate limiting par numéro        | Max 3 OTP par heure par numéro de téléphone                               |
| Délai minimum entre soumissions | 2 secondes (rejeté si plus rapide)                                        |
| Honeypot field                  | Champ caché dans les formulaires HTML ; si rempli, rejeté silencieusement |
| Validation stricte              | Tout champ manquant ou malformé est rejeté avant traitement               |

### Règles

- Les erreurs anti-spam retournent HTTP 429 (pas de message détaillant pourquoi).
- Le blocage est temporaire (15 à 60 minutes), pas permanent, pour éviter les faux positifs.
- Les IPs bloquées sont journalisées pour analyse.

### Cas attendus

| Scénario                                     | Résultat attendu                                  |
| -------------------------------------------- | ------------------------------------------------- |
| 11 soumissions en 1 minute depuis la même IP | 11e soumission retourne HTTP 429                  |
| 4e OTP en 1 heure pour le même numéro        | HTTP 429, message "trop de tentatives"            |
| Honeypot rempli                              | Requête rejetée silencieusement (HTTP 200 simulé) |

---

## DEP-0773 — Stratégie anti-abus des appels téléphoniques

### Objectif

Protéger le système de commande vocale contre les appels frauduleux ou répétitifs abusifs.

### Décisions

| Mesure                              | Valeur                                                 |
| ----------------------------------- | ------------------------------------------------------ |
| Max appels par numéro               | 5 appels par heure par numéro entrant                  |
| Max appels simultanés par dépanneur | Limité par les ressources du plan (3 simultanés en V1) |
| Détection de numéro masqué          | Appel rejeté ou marqué pour surveillance manuelle      |
| Durée max d'appel                   | 10 minutes (raccrochage automatique au-delà)           |
| Numéros blacklistés                 | Liste configurable par tenant et par super admin       |

### Règles

- Les numéros blacklistés entendent un message d'erreur poli avant la déconnexion.
- Les appels entrant au-delà du quota ne sont pas mis en attente indéfiniment (délai max 2 min).
- Tout abus répété sur 24h peut entraîner un blocage de 24h du numéro.

### Cas attendus

| Scénario               | Résultat attendu                     |
| ---------------------- | ------------------------------------ |
| 6e appel dans l'heure  | Message d'erreur + fin d'appel       |
| Appel de numéro masqué | Rejeté ou message d'avertissement    |
| Appel de 11 minutes    | Raccrochage automatique à 10 minutes |

---

## DEP-0774 — Stratégie de limitation de débit API

### Objectif

Définir les quotas de requêtes API pour protéger les ressources serveur contre la surcharge et les abus.

### Décisions

| Endpoint                                  | Limite                                     | Fenêtre         |
| ----------------------------------------- | ------------------------------------------ | --------------- |
| Endpoints publics (catalogue, produits)   | 60 req par min                             | Par IP          |
| Endpoints authentifiés (commande, panier) | 30 req par min                             | Par user_id     |
| Endpoints OTP / auth                      | 5 req par min                              | Par IP + numéro |
| Endpoints admin store                     | 60 req par min                             | Par user_id     |
| Endpoints super admin                     | 120 req par min                            | Par user_id     |
| Endpoints assistant texte                 | 20 req par min                             | Par user_id     |
| Webhooks téléphonie entrants              | Illimité (protégé par secret de signature) | —               |

### Règles

- Le dépassement de quota retourne HTTP 429 avec un header `Retry-After` indiquant quand réessayer.
- Les quotas sont implémentés avec un algorithme de type "token bucket" ou "sliding window".
- Les quotas sont configurables par tenant pour les plans futurs (V1 : valeurs fixes).
- Les quotas ne s'appliquent pas aux appels internes service-à-service (réseau privé).

### Cas attendus

| Scénario                           | Résultat attendu                    |
| ---------------------------------- | ----------------------------------- |
| 31e requête panier dans la minute  | HTTP 429 + header `Retry-After: 30` |
| 6e tentative OTP dans la minute    | HTTP 429, aucun OTP envoyé          |
| Appel interne backend vers backend | Pas de rate limiting appliqué       |
| Webhook téléphonie signé           | Traité normalement, pas limité      |
