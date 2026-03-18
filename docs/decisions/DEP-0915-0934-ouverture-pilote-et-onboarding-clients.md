# DEP-0915 à DEP-0934 — Ouverture du pilote et onboarding clients

## Périmètre

Ce document définit :
1. Les **étapes du pilote** (DEP-0915 à DEP-0920) : tests voix web, ouverture officielle, suivi incidents, corrections critiques, bilan et décision de passage multi-clients.
2. Les **processus d'onboarding** (DEP-0921 à DEP-0934) : vente, démonstration commerciale, ouverture d'un nouveau client, création de tenant payant, clonage, personnalisation visuelle, import d'inventaire/photos/catégories, configuration de zone de livraison/horaires/téléphonie, création des comptes employés et livreurs.

Ces décisions s'appuient sur :
- Le modèle multi-tenant défini dans DEP-0641–0680
- La stratégie de clonage de tenant (DEP-0656–0660)
- Les bases cloud et déploiements (DEP-0721–0760)
- Les tests V1 (DEP-0811–0840)

Il s'agit exclusivement de **documentation** : aucun code produit, aucune implémentation, aucun onboarding réel. Les spécifications décrites ici serviront de référence pour les futures opérations et implémentations.

**Référence parente** : Blocs DEP-0881 à DEP-0960 (pilote, onboarding et expansion multi-clients)

---

## PARTIE 1 — PILOTE (DEP-0915 à DEP-0920)

---

## DEP-0915 — Tester une commande voix web pendant le pilote

### Objectif

Valider le fonctionnement complet du mode **voix web** (assistant vocal sur le site) dans un contexte réel de commande avec un vrai client du pilote.

### Critères de validation

| Critère                              | Description                                                    |
|--------------------------------------|----------------------------------------------------------------|
| Reconnaissance vocale                | Le client peut ajouter au moins 3 produits en parlant         |
| Compréhension des quantités          | L'assistant comprend les quantités exprimées oralement        |
| Confirmation vocale                  | Le client reçoit une confirmation vocale du panier             |
| Envoi de commande                    | La commande est envoyée avec succès et reçue par le dépanneur  |

### Procédure de test

1. **Préparation** :
   - Choisir un client pilote volontaire
   - Vérifier que le navigateur du client supporte l'API Web Speech (Chrome, Edge)
   - S'assurer que le microphone fonctionne correctement

2. **Déroulement** :
   - Le client accède au site web en mode voix
   - Le client appuie sur le bouton micro et passe une commande complète vocalement
   - L'assistant confirme chaque ajout au panier
   - Le client valide la commande vocalement

3. **Vérification** :
   - Le dépanneur reçoit la commande dans l'interface de réception
   - Les produits et quantités correspondent à la demande vocale
   - L'adresse de livraison est correcte

### Données collectées

- Temps total de la commande voix web
- Nombre d'erreurs de reconnaissance
- Nombre de corrections nécessaires
- Niveau de satisfaction du client (échelle 1-5)

### Actions en cas d'échec

| Type d'échec                         | Action corrective                                              |
|--------------------------------------|----------------------------------------------------------------|
| Reconnaissance vocale défaillante    | Vérifier la qualité audio, ajuster les paramètres de sensibilité |
| Incompréhension de produits          | Enrichir les synonymes vocaux du catalogue (DEP-0270)         |
| Problème de confirmation             | Corriger les phrases de confirmation vocale (DEP-0410)        |

### Validation

- Le test est considéré réussi si au moins 2 commandes voix web complètes sont passées avec succès.
- Les incidents sont documentés dans le suivi des incidents du pilote (DEP-0917).

---

## DEP-0916 — Ouvrir officiellement le pilote à de vrais clients

### Objectif

Démarrer officiellement le **pilote** en permettant à un premier groupe de clients réels de passer des commandes via le système.

### Pré-requis obligatoires

| Pré-requis                           | État attendu                                                   |
|--------------------------------------|----------------------------------------------------------------|
| Catalogue produits                   | Au moins 50 produits actifs avec images (DEP-0271–0280)        |
| Interface client                     | Mode manuel, assisté texte et voix web fonctionnels           |
| Interface dépanneur                  | Réception et préparation de commandes opérationnelles         |
| Interface livreur                    | Acceptation et suivi de livraisons opérationnels               |
| Téléphonie (optionnel V1)            | Agent vocal téléphonique fonctionnel si activé                 |
| Environnement de production          | Déploiement stable sur l'environnement prod (DEP-0735–0754)   |

### Critères d'ouverture

- Au moins **5 clients tests internes** ont validé le parcours complet.
- Aucun bug critique bloquant identifié lors des tests pré-pilote.
- Le dépanneur pilote a été formé à l'interface de réception (DEP-0901).
- Le livreur pilote a été formé à l'interface de livraison (DEP-0900).

### Périmètre du pilote

| Élément                              | Valeur                                                         |
|--------------------------------------|----------------------------------------------------------------|
| Nombre de clients invités            | 10 à 20 clients réels                                          |
| Durée du pilote                      | 2 à 4 semaines                                                 |
| Zone géographique                    | Rayon de livraison du dépanneur pilote uniquement              |
| Modes de commande disponibles        | Manuel, assisté texte, voix web, téléphone (si activé)         |

### Communication au lancement

- Message d'invitation aux clients pilotes expliquant le contexte et les objectifs.
- Mention explicite qu'il s'agit d'un **pilote** et que des ajustements sont possibles.
- Canal de feedback direct (email, téléphone) pour remonter les problèmes.

### Métriques de suivi

| Métrique                             | Objectif                                                       |
|--------------------------------------|----------------------------------------------------------------|
| Nombre de commandes passées          | Au moins 30 commandes sur la période du pilote                 |
| Taux de réussite des commandes       | > 85% de commandes livrées avec succès                         |
| Taux d'utilisation de l'assistant    | > 40% des commandes utilisent l'assistant (texte ou voix)      |
| Satisfaction client                  | Score moyen > 4/5                                              |

### Validation

- Le pilote est officiellement ouvert lorsque le premier client réel externe passe une commande réussie.
- Tous les incidents sont suivis dans le processus DEP-0917.

---

## DEP-0917 — Suivre tous les incidents du pilote

### Objectif

Mettre en place un **processus de suivi rigoureux** de tous les incidents, bugs et problèmes rencontrés pendant le pilote.

### Définition d'un incident

| Type                                 | Description                                                    |
|--------------------------------------|----------------------------------------------------------------|
| Bug bloquant                         | Empêche la passation ou la livraison d'une commande            |
| Bug critique                         | Provoque une erreur importante mais contournable               |
| Bug mineur                           | Provoque une gêne mais n'empêche pas l'utilisation             |
| Problème de performance              | Temps de réponse > 3 secondes, lenteurs perceptibles           |
| Erreur utilisateur                   | Confusion, incompréhension d'une fonctionnalité                |
| Demande d'amélioration               | Suggestion d'un client ou du dépanneur                         |

### Outils de suivi

- **GitHub Issues** avec label `pilote` et `bug critique`, `bug mineur`, ou `amélioration`.
- **Tableau dédié** dans GitHub Projects : colonnes « Nouveau », « En analyse », « En correction », « Résolu », « Reporté post-V1 ».

### Processus de remontée

1. **Détection** : un incident est détecté par un client, le dépanneur, le livreur, ou l'équipe technique.
2. **Création d'une issue** : description précise, étapes de reproduction, impact.
3. **Priorisation** : attribution d'une priorité (P0 = bloquant, P1 = critique, P2 = mineur).
4. **Assignation** : un responsable technique est assigné.
5. **Résolution** : correction et déploiement en production.
6. **Vérification** : test de non-régression sur l'environnement de production.
7. **Clôture** : l'issue est fermée et documentée dans le bilan du pilote (DEP-0919).

### Priorisation des incidents

| Priorité | Délai de traitement       | Exemples                                                       |
|----------|---------------------------|----------------------------------------------------------------|
| P0       | < 4 heures                | Impossible de passer une commande, paiement bloqué             |
| P1       | < 24 heures               | Assistant vocal ne répond pas, panier se vide seul             |
| P2       | < 1 semaine               | Texte mal aligné, icône manquante, suggestion imprécise        |

### Reporting hebdomadaire

- **Réunion hebdomadaire de suivi** : revue des incidents ouverts, résolus et reportés.
- **Synthèse écrite** : nombre d'incidents par type, délai moyen de résolution, tendances.

### Validation

- Tous les incidents P0 et P1 sont résolus avant la fin du pilote.
- Un bilan complet des incidents est rédigé dans DEP-0919.

---

## DEP-0918 — Corriger les blocages critiques du pilote

### Objectif

Définir la procédure de **correction urgente** des bugs critiques et bloquants identifiés pendant le pilote.

### Critères de blocage critique

| Critère                              | Impact                                                         |
|--------------------------------------|----------------------------------------------------------------|
| Impossibilité de passer commande     | Aucun client ne peut commander                                 |
| Commandes non reçues par le dépanneur | Les commandes disparaissent après envoi                       |
| Paiement bloqué                      | Le client ne peut pas valider le paiement à la livraison       |
| Interface dépanneur inaccessible     | Le dépanneur ne peut pas gérer les commandes                   |
| Interface livreur inaccessible       | Le livreur ne peut pas accepter ou livrer                      |

### Processus de correction urgente

1. **Alerte immédiate** : notification de l'équipe technique par tous les canaux (Slack, email, SMS).
2. **Diagnostic rapide** : analyse des logs, reproduction du bug en environnement de staging.
3. **Correction en priorité** : développement d'un correctif (hotfix).
4. **Test accéléré** : validation rapide sur staging.
5. **Déploiement en production** : mise en production immédiate.
6. **Vérification post-déploiement** : test manuel sur production.
7. **Communication** : information du dépanneur, du livreur et des clients impactés.

### Rôles et responsabilités

| Rôle                                 | Responsabilité                                                 |
|--------------------------------------|----------------------------------------------------------------|
| Équipe technique                     | Diagnostic, correction, déploiement                            |
| Product Owner                        | Validation de la priorité, communication clients               |
| Dépanneur pilote                     | Remontée rapide des incidents, test post-correction            |

### Seuil de décision de suspension

| Situation                            | Décision                                                       |
|--------------------------------------|----------------------------------------------------------------|
| Plus de 3 bugs P0 en 24 heures       | Suspension temporaire du pilote jusqu'à stabilisation          |
| Bug non résolu en 48 heures          | Escalade et mobilisation de ressources supplémentaires         |

### Documentation des correctifs

- Chaque correctif critique est documenté dans une issue GitHub dédiée.
- Le commit de correction contient la référence de l'issue (`fix: résolution bug critique #XXX`).
- Un changelog est mis à jour avec la date, le bug et la correction.

### Validation

- Aucun bug critique ne doit rester ouvert plus de 48 heures.
- Tous les correctifs critiques sont testés et validés avant clôture de l'issue.

---

## DEP-0919 — Faire le bilan du pilote

### Objectif

Produire un **bilan complet** du pilote à la fin de la période de test pour décider de la suite du projet.

### Données collectées

| Catégorie                            | Données                                                        |
|--------------------------------------|----------------------------------------------------------------|
| Commandes                            | Nombre total, taux de réussite, taux d'annulation              |
| Modes d'utilisation                  | Répartition manuel / assisté texte / voix web / téléphone      |
| Incidents                            | Nombre total, répartition par priorité, délai moyen de résolution |
| Satisfaction client                  | Score moyen, verbatims, suggestions                            |
| Performance dépanneur                | Temps moyen de préparation, taux d'acceptation                 |
| Performance livreur                  | Temps moyen de livraison, taux de réussite                     |

### Structure du bilan

1. **Résumé exécutif** : synthèse des résultats clés en 1 page.
2. **Métriques quantitatives** : tableaux et graphiques des données collectées.
3. **Retours qualitatifs** : verbatims clients, retours dépanneur et livreur.
4. **Liste des incidents** : synthèse des bugs rencontrés et résolus.
5. **Améliorations identifiées** : liste priorisée des améliorations à apporter.
6. **Recommandations** : décision de passer à l'étape suivante ou de prolonger le pilote.

### Critères de succès du pilote

| Critère                              | Seuil de succès                                                |
|--------------------------------------|----------------------------------------------------------------|
| Nombre de commandes livrées          | > 30 commandes réussies                                        |
| Taux de réussite                     | > 85% de commandes livrées sans incident majeur                |
| Satisfaction client                  | Score moyen > 4/5                                              |
| Incidents critiques non résolus      | 0 bug P0 ou P1 ouvert                                          |

### Décision de passage à la suite

| Résultat                             | Décision                                                       |
|--------------------------------------|----------------------------------------------------------------|
| Tous les critères de succès atteints | Passage à la phase de clonage multi-clients (DEP-0920)         |
| 1 à 2 critères non atteints          | Prolongation du pilote de 1 à 2 semaines supplémentaires       |
| 3 critères ou plus non atteints      | Analyse approfondie, corrections majeures requises             |

### Validation

- Le bilan est rédigé dans un document dédié (ex. `BILAN-PILOTE.md`).
- Une réunion de restitution est organisée avec toutes les parties prenantes.
- Le bilan est archivé pour référence future.

---

## DEP-0920 — Décider si la V1 est prête à être clonée

### Objectif

Prendre la **décision formelle** de passer à l'étape de **clonage multi-clients** en fonction du bilan du pilote et de la stabilité du système.

### Critères de validation de la V1

| Critère                              | État attendu                                                   |
|--------------------------------------|----------------------------------------------------------------|
| Pilote réussi                        | Bilan positif avec critères de succès atteints (DEP-0919)      |
| Bugs critiques résolus               | Aucun bug P0 ou P1 ouvert                                      |
| Performance acceptable               | Temps de chargement < 2 secondes, API < 500 ms                 |
| Sécurité validée                     | Isolation multi-tenant testée, authentification robuste        |
| Documentation à jour                 | Tous les processus d'onboarding documentés (DEP-0921–0934)     |
| Processus de vente défini            | Processus commercial clair et validé (DEP-0921)                |

### Décision formelle

| Option                               | Conditions                                                     |
|--------------------------------------|----------------------------------------------------------------|
| **Oui** : V1 prête à être clonée     | Tous les critères sont validés, bilan pilote positif           |
| **Non** : corrections nécessaires    | Au moins 1 critère non validé, prolongation du pilote requise  |
| **Partiel** : clonage limité         | Critères validés mais ouverture progressive (1 nouveau client max) |

### Actions si validation positive

1. **Figer la V1** : création d'un tag git `v1.0.0` sur la branche `main`.
2. **Documenter la version** : changelog complet, notes de version.
3. **Préparer le tenant modèle** : configuration de référence prête à être clonée (DEP-0925).
4. **Lancer le processus commercial** : activation du processus de vente (DEP-0921).

### Actions si validation négative

1. **Prolonger le pilote** : identifier les points bloquants et les corriger.
2. **Reporter le clonage** : ne pas ouvrir de nouveaux clients tant que la V1 n'est pas stable.
3. **Réviser le planning** : ajuster les délais et les ressources.

### Communication

- **Interne** : annonce à l'équipe technique et commerciale.
- **Externe** : information du dépanneur pilote et des clients pilotes.
- **Stakeholders** : présentation du bilan et de la décision aux parties prenantes.

### Validation

- La décision est prise lors d'une réunion formelle de validation.
- Le compte-rendu de décision est archivé dans `docs/decisions/DECISION-V1-CLONAGE.md`.

---

## PARTIE 2 — ONBOARDING CLIENTS (DEP-0921 à DEP-0934)

---

## DEP-0921 — Définir le processus de vente à un deuxième dépanneur

### Objectif

Documenter le **processus commercial** complet pour vendre la solution à un nouveau dépanneur après le succès du pilote.

### Étapes du processus de vente

| Étape                                | Activités                                                      |
|--------------------------------------|----------------------------------------------------------------|
| 1. **Prospection**                   | Identification de dépanneurs cibles (zone, taille, besoins)    |
| 2. **Premier contact**               | Appel ou email de prise de contact, présentation rapide        |
| 3. **Démonstration commerciale**     | Présentation du système et démonstration live (DEP-0922)       |
| 4. **Qualification**                 | Validation des besoins, de la zone de livraison, du catalogue  |
| 5. **Proposition commerciale**       | Envoi d'une offre tarifaire et contractuelle                   |
| 6. **Négociation**                   | Ajustements tarifaires, conditions de paiement                 |
| 7. **Signature**                     | Signature du contrat, paiement de l'acompte                    |
| 8. **Onboarding**                    | Déclenchement du processus d'ouverture (DEP-0923)              |

### Documents nécessaires

| Document                             | Contenu                                                        |
|--------------------------------------|----------------------------------------------------------------|
| Pitch commercial                     | Présentation PowerPoint ou PDF de 10-15 slides                 |
| Plaquette produit                    | Description fonctionnelle, bénéfices, tarifs                   |
| Contrat de service                   | Conditions générales, SLA, tarification, durée d'engagement    |
| Checklist d'onboarding               | Liste des étapes et documents requis pour le nouveau client   |

### Critères de qualification

| Critère                              | Valeur minimale                                                |
|--------------------------------------|----------------------------------------------------------------|
| Zone de livraison                    | Rayon de 5 km minimum autour du dépanneur                      |
| Catalogue produits                   | Au moins 100 produits disponibles en stock                     |
| Livreur disponible                   | Au moins 1 livreur dédié ou partagé avec le dépanneur          |
| Équipement                           | Smartphone ou tablette pour le dépanneur et le livreur         |

### Tarification indicative V1

| Élément                              | Tarif mensuel                                                  |
|--------------------------------------|----------------------------------------------------------------|
| Abonnement de base                   | 99 € / mois                                                    |
| Par commande traitée                 | 0,50 € / commande                                              |
| Configuration initiale               | 499 € (one-time)                                               |
| Formation dépanneur/livreur          | 199 € (one-time)                                               |

### Validation

- Le processus de vente est validé lorsque le premier contrat avec un deuxième dépanneur est signé.
- Le processus est ajusté en fonction des retours des premières ventes.

---

## DEP-0922 — Définir le processus de démonstration commerciale

### Objectif

Définir la structure et le contenu de la **démonstration commerciale** présentée aux prospects.

### Objectifs de la démonstration

- Montrer la simplicité d'utilisation pour le client final.
- Démontrer l'efficacité de l'interface dépanneur.
- Mettre en avant les différents modes de commande (manuel, assisté, voix, téléphone).
- Rassurer sur la facilité de gestion du catalogue.

### Durée et format

| Élément                              | Valeur                                                         |
|--------------------------------------|----------------------------------------------------------------|
| Durée totale                         | 30 à 45 minutes                                                |
| Format                               | Présentiel ou visioconférence (Google Meet, Zoom)              |
| Support                              | Démonstration live sur l'environnement de staging              |

### Déroulement de la démonstration

| Étape                                | Durée      | Contenu                                                        |
|--------------------------------------|------------|----------------------------------------------------------------|
| 1. Introduction                      | 5 min      | Présentation du problème client et de la solution              |
| 2. Parcours client                   | 10 min     | Démonstration live d'une commande manuelle, puis assistée voix |
| 3. Interface dépanneur               | 10 min     | Réception, préparation et assignation d'une commande           |
| 4. Interface livreur                 | 5 min      | Acceptation et suivi de livraison                              |
| 5. Gestion du catalogue              | 5 min      | Ajout d'un produit, modification d'image                       |
| 6. Questions / Réponses              | 10 min     | Échanges sur les besoins spécifiques du prospect               |

### Scénario de démonstration

1. **Commande manuelle** :
   - Le client parcourt le catalogue et ajoute 3 produits au panier.
   - Validation de l'adresse et de la commande.

2. **Commande vocale** :
   - Le client utilise l'assistant vocal pour ajouter 2 produits.
   - Confirmation vocale et envoi de la commande.

3. **Réception dépanneur** :
   - La commande apparaît dans l'interface de réception.
   - Le dépanneur marque la commande en préparation puis prête à livrer.

4. **Livraison** :
   - Le livreur accepte la livraison.
   - Marque la livraison comme livrée.

### Environnement de démonstration

- **Environnement de staging** : copie de production avec données fictives.
- **Tenant de démonstration** : catalogue de produits variés, commandes factices.
- **Accès rapide** : URL raccourcie (ex. `demo.depanneuria.com/client`).

### Validation

- La démonstration est considérée réussie si le prospect demande une proposition commerciale.
- Le processus de démonstration est ajusté en fonction des retours des premières présentations.

---

## DEP-0923 — Définir le processus d'ouverture d'un nouveau client

### Objectif

Définir le **processus complet** d'ouverture d'un nouveau client (dépanneur) dans le système multi-tenant.

### Étapes du processus d'ouverture

| Étape                                | Responsable        | Délai estimé | Activités                                                      |
|--------------------------------------|--------------------|--------------|----------------------------------------------------------------|
| 1. Signature du contrat              | Commercial         | —            | Contrat signé, acompte reçu                                    |
| 2. Collecte des informations         | Onboarding manager | 1-2 jours    | Questionnaire d'onboarding, identité, catalogue, photos        |
| 3. Création du tenant                | Équipe technique   | 1 jour       | Création du tenant dans le système (DEP-0924)                  |
| 4. Clonage du tenant modèle          | Équipe technique   | 1 jour       | Clonage de la configuration de référence (DEP-0925)            |
| 5. Personnalisation visuelle         | Designer / Tech    | 2-3 jours    | Logo, couleurs, nom commercial (DEP-0926)                      |
| 6. Import d'inventaire               | Équipe technique   | 3-5 jours    | Import des produits et catégories (DEP-0927, DEP-0929)         |
| 7. Import des photos                 | Équipe technique   | 2-3 jours    | Upload et optimisation des images produits (DEP-0928)          |
| 8. Configuration de livraison        | Équipe technique   | 1 jour       | Zone de livraison, horaires (DEP-0930, DEP-0931)               |
| 9. Configuration téléphonie          | Équipe technique   | 1 jour       | Numéro de téléphone, agent vocal (DEP-0932)                    |
| 10. Création des comptes             | Onboarding manager | 1 jour       | Comptes dépanneur, employés, livreurs (DEP-0933, DEP-0934)     |
| 11. Formation                        | Formateur          | 2-3 heures   | Formation dépanneur et livreur                                 |
| 12. Tests d'acceptation              | Client + Tech      | 1 jour       | Validation du tenant par le client                             |
| 13. Mise en production               | Équipe technique   | 1 heure      | Activation du tenant et communication de l'URL                 |

### Délai total estimé

- **Délai moyen** : 10 à 15 jours ouvrés entre la signature et la mise en production.
- **Délai accéléré** : 7 jours si le catalogue est déjà numérisé et les photos disponibles.

### Documents requis du client

| Document                             | Format attendu                                                 |
|--------------------------------------|----------------------------------------------------------------|
| Informations légales                 | Nom commercial, adresse, SIRET, TVA                            |
| Logo et identité visuelle            | Fichiers PNG ou SVG haute résolution                           |
| Catalogue produits                   | Fichier Excel ou CSV (nom, prix, catégorie, description)       |
| Photos des produits                  | Images JPEG ou PNG (min 800×800 px)                            |
| Informations de livraison            | Adresse du dépanneur, rayon de livraison, horaires             |
| Numéro de téléphone                  | Numéro dédié pour la téléphonie (optionnel)                    |

### Validation

- Le processus d'ouverture est validé lorsque le client peut passer sa première commande de test avec succès.
- Un suivi post-lancement de 1 semaine est assuré pour corriger les éventuels problèmes.

---

## DEP-0924 — Définir le processus de création d'un nouveau tenant payant

### Objectif

Définir le **processus technique** de création d'un nouveau tenant payant dans la base de données multi-tenant.

### Pré-requis

- Contrat signé et acompte reçu.
- Informations légales du client collectées (nom commercial, adresse, SIRET).
- Identifiant unique du tenant (slug) choisi (ex. `depanneur-paris-15`).

### Étapes techniques

| Étape                                | Activités                                                      |
|--------------------------------------|----------------------------------------------------------------|
| 1. Création de l'entrée tenant       | Insertion d'un nouveau tenant dans la table `tenants`          |
| 2. Génération du slug                | Génération d'un slug unique (ex. `depanneur-paris-15`)         |
| 3. Initialisation des paramètres     | Configuration des paramètres par défaut (langue, fuseau horaire) |
| 4. Création du sous-domaine          | Configuration DNS pour `<slug>.depanneuria.com` (optionnel)    |
| 5. Provisionnement des ressources    | Création des buckets de stockage pour les images du tenant     |
| 6. Configuration des permissions     | Initialisation des rôles et permissions (dépanneur, livreur)   |

### Champs de la table `tenants`

| Champ                                | Type          | Description                                                    |
|--------------------------------------|---------------|----------------------------------------------------------------|
| `id`                                 | UUID          | Identifiant unique du tenant                                   |
| `slug`                               | String        | Identifiant URL (ex. `depanneur-paris-15`)                     |
| `commercial_name`                    | String        | Nom commercial du dépanneur                                    |
| `legal_name`                         | String        | Raison sociale légale                                          |
| `siret`                              | String        | Numéro SIRET (France)                                          |
| `address`                            | String        | Adresse complète du dépanneur                                  |
| `phone`                              | String        | Numéro de téléphone principal                                  |
| `email`                              | String        | Email de contact                                               |
| `status`                             | Enum          | `active`, `suspended`, `trial`, `closed`                       |
| `plan`                               | String        | `starter`, `pro`, `enterprise`                                 |
| `created_at`                         | Timestamp     | Date de création                                               |
| `activated_at`                       | Timestamp     | Date d'activation                                              |
| `subscription_ends_at`               | Timestamp     | Date de fin d'abonnement (si applicable)                       |

### Génération du slug

- Format : `depanneur-<ville>-<quartier ou code postal>`
- Exemples : `depanneur-paris-15`, `depanneur-lyon-part-dieu`, `depanneur-marseille-13001`
- Validation : unicité garantie, caractères autorisés `[a-z0-9-]`, longueur max 50 caractères.

### Statut du tenant

| Statut                               | Description                                                    |
|--------------------------------------|----------------------------------------------------------------|
| `trial`                              | Période d'essai (7-30 jours)                                   |
| `active`                             | Tenant actif et fonctionnel                                    |
| `suspended`                          | Tenant suspendu (non-paiement, violation des conditions)       |
| `closed`                             | Tenant fermé définitivement                                    |

### Validation

- Le tenant est créé avec le statut `trial` par défaut.
- Le statut passe à `active` après validation des tests d'acceptation (DEP-0923, étape 12).

---

## DEP-0925 — Définir le processus de clonage d'un tenant modèle vers un nouveau client

### Objectif

Définir le **processus de clonage** d'un tenant modèle (tenant de référence) vers un nouveau tenant client pour accélérer l'onboarding.

### Tenant modèle de référence

| Élément                              | Description                                                    |
|--------------------------------------|----------------------------------------------------------------|
| Nom du tenant modèle                 | `tenant-template-v1`                                           |
| Contenu                              | Configuration complète, catalogue de démonstration, workflows  |
| Objectif                             | Servir de base pour tous les nouveaux tenants                  |

### Éléments clonés

| Élément                              | Cloné | Personnalisable | Remarques                                                      |
|--------------------------------------|-------|-----------------|----------------------------------------------------------------|
| Structure des catégories             | Oui   | Oui             | Le client peut ajouter/supprimer des catégories                |
| Produits de démonstration            | Oui   | Oui             | Remplacés par les produits réels du client (DEP-0927)          |
| Configuration des pages              | Oui   | Non             | Pages d'accueil, catalogue, panier, suivi                      |
| Workflows de commande                | Oui   | Non             | Machine d'état des commandes (DEP-0561–0600)                   |
| Rôles et permissions                 | Oui   | Non             | Rôles `client`, `depanneur`, `livreur`, `admin`                |
| Configuration multilingue            | Oui   | Oui             | Français et anglais par défaut, ajustable                      |
| Paramètres de livraison              | Non   | Oui             | Zone et horaires spécifiques au client (DEP-0930, DEP-0931)    |
| Personnalisation visuelle            | Non   | Oui             | Logo, couleurs spécifiques au client (DEP-0926)                |

### Processus de clonage

| Étape                                | Activités                                                      |
|--------------------------------------|----------------------------------------------------------------|
| 1. Création du nouveau tenant        | Insertion dans la table `tenants` (DEP-0924)                   |
| 2. Copie de la structure             | Clonage des tables `categories`, `products`, `roles`           |
| 3. Initialisation des données        | Création de données de test (commandes vides, panier vide)     |
| 4. Configuration des workflows       | Copie des règles de machine d'état                             |
| 5. Attribution du tenant modèle      | Liaison du nouveau tenant avec le tenant modèle de référence   |

### Temps de clonage estimé

- **Automatisé** : < 5 minutes (script de clonage)
- **Manuel** : 1-2 heures si le clonage n'est pas automatisé

### Validation

- Le clonage est validé lorsque le nouveau tenant affiche correctement les catégories et produits de démonstration.
- Les workflows de commande doivent fonctionner sans erreur.

---

## DEP-0926 — Définir le processus de personnalisation visuelle d'un nouveau client

### Objectif

Définir le **processus de personnalisation visuelle** (logo, couleurs, nom commercial) pour chaque nouveau tenant.

### Éléments personnalisables

| Élément                              | Description                                                    | Format attendu                                                 |
|--------------------------------------|----------------------------------------------------------------|----------------------------------------------------------------|
| Logo principal                       | Logo affiché dans l'en-tête du site client                    | PNG ou SVG, fond transparent, 200×200 px min                   |
| Logo alternatif (mobile)             | Version compacte pour mobile                                   | PNG ou SVG, 100×100 px min                                     |
| Couleur primaire                     | Couleur principale de la marque                                | Code hexadécimal (ex. `#FF5733`)                               |
| Couleur secondaire                   | Couleur d'accentuation                                         | Code hexadécimal (ex. `#33C3FF`)                               |
| Nom commercial                       | Nom affiché sur le site                                        | Texte (max 50 caractères)                                      |
| Slogan (optionnel)                   | Phrase d'accroche                                              | Texte (max 80 caractères)                                      |

### Processus de personnalisation

| Étape                                | Responsable        | Activités                                                      |
|--------------------------------------|--------------------|----------------------------------------------------------------|
| 1. Collecte des éléments visuels     | Onboarding manager | Demande au client de fournir logo et couleurs                 |
| 2. Validation des formats            | Designer           | Vérification des formats, résolution, fond transparent         |
| 3. Optimisation des images           | Équipe technique   | Compression et conversion en WebP si nécessaire                |
| 4. Configuration dans le tenant      | Équipe technique   | Upload des fichiers, configuration des couleurs dans la DB    |
| 5. Génération du thème CSS           | Équipe technique   | Génération automatique du thème CSS personnalisé              |
| 6. Validation visuelle               | Client             | Aperçu du site avec la personnalisation appliquée              |

### Champs dans la table `tenants`

| Champ                                | Type          | Description                                                    |
|--------------------------------------|---------------|----------------------------------------------------------------|
| `logo_url`                           | String (URL)  | URL du logo principal (stocké sur CDN)                         |
| `logo_mobile_url`                    | String (URL)  | URL du logo mobile                                             |
| `primary_color`                      | String        | Couleur primaire (hexadécimal)                                 |
| `secondary_color`                    | String        | Couleur secondaire (hexadécimal)                               |
| `commercial_name`                    | String        | Nom commercial affiché sur le site                             |
| `tagline`                            | String        | Slogan (optionnel)                                             |

### Génération automatique du thème CSS

- Utilisation de variables CSS (`--color-primary`, `--color-secondary`) dans les feuilles de style.
- Injection dynamique des couleurs du tenant au chargement de la page.
- Exemple : `<style>:root { --color-primary: #FF5733; }</style>`

### Validation

- La personnalisation est validée lorsque le client approuve l'aperçu visuel.
- Les changements sont appliqués immédiatement sur l'environnement de production.

---

## DEP-0927 — Définir le processus d'import d'inventaire d'un nouveau client

### Objectif

Définir le **processus d'import** du catalogue de produits (inventaire) d'un nouveau client dans le système.

### Format d'import attendu

| Format                               | Description                                                    |
|--------------------------------------|----------------------------------------------------------------|
| CSV                                  | Format recommandé (Excel exporté en CSV UTF-8)                 |
| Excel (.xlsx)                        | Accepté, converti en CSV en interne                            |
| JSON                                 | Accepté pour imports automatisés (API)                         |

### Structure du fichier CSV

| Colonne                              | Obligatoire | Format                          | Exemple                                                        |
|--------------------------------------|-------------|---------------------------------|----------------------------------------------------------------|
| `sku`                                | Oui         | Texte unique                    | `FREIN-001`                                                    |
| `name`                               | Oui         | Texte (max 80 caractères)       | `Plaquettes de frein avant`                                    |
| `category_slug`                      | Oui         | Texte (slug de catégorie)       | `freins`                                                       |
| `description`                        | Non         | Texte (max 300 caractères)      | `Plaquettes haute performance pour voitures compactes`         |
| `price`                              | Oui         | Nombre décimal                  | `29.99`                                                        |
| `unit`                               | Oui         | Texte (`piece`, `liter`, etc.)  | `piece`                                                        |
| `stock_status`                       | Non         | Enum (`in_stock`, `out_of_stock`, `on_order`) | `in_stock`                                                     |
| `is_featured`                        | Non         | Booléen (`true` / `false`)      | `false`                                                        |
| `keywords`                           | Non         | Texte (séparés par des virgules)| `frein, plaquette, avant, sécurité`                            |

### Processus d'import

| Étape                                | Responsable        | Activités                                                      |
|--------------------------------------|--------------------|----------------------------------------------------------------|
| 1. Collecte du fichier               | Onboarding manager | Demande au client de fournir le catalogue au format CSV       |
| 2. Validation du format              | Équipe technique   | Vérification des colonnes obligatoires, formats de données    |
| 3. Nettoyage des données             | Équipe technique   | Suppression des doublons, correction des erreurs              |
| 4. Import dans la base de données    | Équipe technique   | Insertion des produits dans la table `products`                |
| 5. Association des catégories        | Équipe technique   | Liaison des produits aux catégories existantes (DEP-0929)      |
| 6. Vérification post-import          | Client + Tech      | Validation de l'import, vérification des prix et descriptions  |

### Règles de validation

| Règle                                | Description                                                    |
|--------------------------------------|----------------------------------------------------------------|
| SKU unique                           | Chaque SKU doit être unique par tenant                         |
| Catégorie existante                  | La catégorie référencée doit exister dans le système           |
| Prix positif                         | Le prix doit être > 0                                          |
| Nom non vide                         | Le nom du produit ne peut pas être vide                        |

### Gestion des erreurs

- Si une ligne contient une erreur, elle est ignorée et une alerte est générée.
- Un rapport d'import est fourni au client avec le nombre de produits importés et les erreurs rencontrées.

### Validation

- L'import est validé lorsque au moins 80% des produits sont importés sans erreur.
- Le client est informé des produits non importés et des corrections à apporter.

---

## DEP-0928 — Définir le processus d'import de photos d'un nouveau client

### Objectif

Définir le **processus d'import** et d'optimisation des images produits d'un nouveau client.

### Format attendu

| Format                               | Résolution minimale | Poids maximal | Format recommandé                                              |
|--------------------------------------|---------------------|---------------|----------------------------------------------------------------|
| JPEG                                 | 800×800 px          | 2 Mo          | Préféré pour les photos réalistes                              |
| PNG                                  | 800×800 px          | 3 Mo          | Accepté pour les images avec transparence                      |
| WebP                                 | 800×800 px          | 1 Mo          | Format recommandé (conversion automatique si JPEG/PNG)         |

### Nommage des fichiers

| Convention                           | Exemple                                                        |
|--------------------------------------|----------------------------------------------------------------|
| Format recommandé                    | `<sku>-<variant>-<angle>.jpg`                                  |
| Exemple                              | `FREIN-001-avant-principale.jpg`                               |
| Fallback                             | Si le nommage n'est pas respecté, import possible avec avertissement |

### Processus d'import

| Étape                                | Responsable        | Activités                                                      |
|--------------------------------------|--------------------|----------------------------------------------------------------|
| 1. Collecte des images               | Onboarding manager | Demande au client de fournir les images (ZIP ou Google Drive) |
| 2. Validation des formats            | Équipe technique   | Vérification des formats et résolutions                        |
| 3. Optimisation des images           | Équipe technique   | Compression, conversion en WebP, recadrage si nécessaire       |
| 4. Upload vers le CDN                | Équipe technique   | Stockage des images sur Google Cloud Storage ou équivalent    |
| 5. Association aux produits          | Équipe technique   | Liaison des images aux produits via SKU                        |
| 6. Génération des miniatures         | Équipe technique   | Création automatique des tailles `thumb`, `medium`, `full`     |

### Tailles générées automatiquement

| Taille                               | Dimensions        | Usage                                                          |
|--------------------------------------|-------------------|----------------------------------------------------------------|
| `thumb`                              | 150×150 px        | Miniatures dans le panier, listes                              |
| `medium`                             | 400×400 px        | Cartes produits dans la grille                                 |
| `full`                               | 800×800 px        | Affichage détail produit                                       |

### Règles d'association

- Si le nommage respecte la convention `<sku>-...`, l'association est automatique.
- Sinon, une interface d'association manuelle est fournie au client.

### Validation

- L'import est validé lorsque au moins 80% des produits ont une image associée.
- Les produits sans image affichent une image par défaut (`placeholder-product.png`).

---

## DEP-0929 — Définir le processus d'import de catégories d'un nouveau client

### Objectif

Définir le **processus d'import** des catégories de produits d'un nouveau client dans le système.

### Format d'import attendu

| Format                               | Description                                                    |
|--------------------------------------|----------------------------------------------------------------|
| CSV                                  | Format recommandé (Excel exporté en CSV UTF-8)                 |
| JSON                                 | Accepté pour imports automatisés (API)                         |

### Structure du fichier CSV

| Colonne                              | Obligatoire | Format                          | Exemple                                                        |
|--------------------------------------|-------------|---------------------------------|----------------------------------------------------------------|
| `slug`                               | Oui         | Texte unique (kebab-case)       | `freins`                                                       |
| `name`                               | Oui         | Texte (max 50 caractères)       | `Freins`                                                       |
| `parent_slug`                        | Non         | Texte (slug de la catégorie parente) | `pieces-auto`                                                  |
| `display_order`                      | Non         | Nombre entier                   | `1`                                                            |
| `is_visible`                         | Non         | Booléen (`true` / `false`)      | `true`                                                         |

### Processus d'import

| Étape                                | Responsable        | Activités                                                      |
|--------------------------------------|--------------------|----------------------------------------------------------------|
| 1. Collecte du fichier               | Onboarding manager | Demande au client de fournir la liste des catégories au format CSV |
| 2. Validation du format              | Équipe technique   | Vérification des colonnes obligatoires, formats de données    |
| 3. Import dans la base de données    | Équipe technique   | Insertion des catégories dans la table `categories`            |
| 4. Création de la hiérarchie         | Équipe technique   | Liaison des catégories parentes et enfantes                    |
| 5. Vérification post-import          | Client + Tech      | Validation de la hiérarchie et de l'ordre d'affichage          |

### Règles de validation

| Règle                                | Description                                                    |
|--------------------------------------|----------------------------------------------------------------|
| Slug unique                          | Chaque slug doit être unique par tenant                        |
| Parent existant                      | Si `parent_slug` est renseigné, il doit exister dans le système|
| Pas de boucle                        | Une catégorie ne peut pas être son propre parent               |

### Gestion de la hiérarchie

- **Catégorie racine** : `parent_slug` est vide ou `null`.
- **Catégorie enfant** : `parent_slug` référence une catégorie existante.
- **Profondeur maximale** : 2 niveaux (racine → enfant) en V1.

### Validation

- L'import est validé lorsque toutes les catégories sont importées sans erreur.
- Le client est informé des catégories non importées et des corrections à apporter.

---

## DEP-0930 — Définir le processus de configuration de zone de livraison d'un nouveau client

### Objectif

Définir le **processus de configuration** de la zone de livraison géographique pour chaque nouveau tenant.

### Modes de définition de la zone

| Mode                                 | Description                                                    |
|--------------------------------------|----------------------------------------------------------------|
| **Rayon autour d'un point**          | Cercle de X km autour de l'adresse du dépanneur               |
| **Codes postaux**                    | Liste de codes postaux couverts                                |
| **Polygone personnalisé**            | Tracé manuel sur une carte (Google Maps, OpenStreetMap)        |

### Format de configuration

| Champ                                | Type          | Description                                                    |
|--------------------------------------|---------------|----------------------------------------------------------------|
| `delivery_mode`                      | Enum          | `radius`, `postal_codes`, `polygon`                            |
| `delivery_radius_km`                 | Number        | Rayon en kilomètres (si mode `radius`)                         |
| `delivery_postal_codes`              | Array[String] | Liste de codes postaux (si mode `postal_codes`)                |
| `delivery_polygon_coordinates`       | Array[LatLng] | Coordonnées du polygone (si mode `polygon`)                    |

### Processus de configuration

| Étape                                | Responsable        | Activités                                                      |
|--------------------------------------|--------------------|----------------------------------------------------------------|
| 1. Collecte des informations         | Onboarding manager | Demande au client de définir sa zone de livraison              |
| 2. Choix du mode                     | Client + Tech      | Sélection du mode (rayon, codes postaux, polygone)             |
| 3. Saisie des données                | Client + Tech      | Saisie du rayon, des codes postaux ou tracé du polygone        |
| 4. Validation de la zone             | Équipe technique   | Vérification de la cohérence géographique                      |
| 5. Enregistrement dans la DB         | Équipe technique   | Sauvegarde de la configuration dans la table `tenants`         |
| 6. Test de validation d'adresse      | Client + Tech      | Test d'une adresse dans la zone et d'une hors de la zone      |

### Exemple de configuration (rayon)

```json
{
  "delivery_mode": "radius",
  "delivery_radius_km": 5,
  "center_address": "123 Rue de la Paix, 75001 Paris, France",
  "center_lat": 48.8566,
  "center_lng": 2.3522
}
```

### Exemple de configuration (codes postaux)

```json
{
  "delivery_mode": "postal_codes",
  "delivery_postal_codes": ["75001", "75002", "75003", "75004"]
}
```

### Validation

- La zone de livraison est validée lorsque au moins une adresse de test est acceptée et une adresse hors zone est refusée.
- Le client peut modifier la zone de livraison à tout moment via l'interface admin.

---

## DEP-0931 — Définir le processus de configuration des horaires d'un nouveau client

### Objectif

Définir le **processus de configuration** des horaires d'ouverture et de livraison pour chaque nouveau tenant.

### Types d'horaires

| Type                                 | Description                                                    |
|--------------------------------------|----------------------------------------------------------------|
| Horaires d'ouverture du dépanneur    | Plages horaires pendant lesquelles le dépanneur est ouvert    |
| Horaires de livraison                | Plages horaires pendant lesquelles les livraisons sont possibles |
| Horaires de réception de commandes   | Plages horaires pendant lesquelles les commandes sont acceptées |

### Format de configuration

| Champ                                | Type          | Description                                                    |
|--------------------------------------|---------------|----------------------------------------------------------------|
| `timezone`                           | String        | Fuseau horaire (ex. `Europe/Paris`)                            |
| `opening_hours`                      | Array[Object] | Horaires d'ouverture par jour de la semaine                    |
| `delivery_hours`                     | Array[Object] | Horaires de livraison par jour de la semaine                   |
| `order_cutoff_time`                  | Time          | Heure limite de commande pour livraison le jour même          |

### Structure des horaires

```json
{
  "day": "monday",
  "slots": [
    { "start": "08:00", "end": "12:00" },
    { "start": "14:00", "end": "19:00" }
  ]
}
```

### Processus de configuration

| Étape                                | Responsable        | Activités                                                      |
|--------------------------------------|--------------------|----------------------------------------------------------------|
| 1. Collecte des informations         | Onboarding manager | Demande au client de fournir les horaires                     |
| 2. Saisie des horaires               | Client + Tech      | Saisie dans l'interface de configuration                       |
| 3. Validation de la cohérence        | Équipe technique   | Vérification qu'aucune plage ne se chevauche                   |
| 4. Enregistrement dans la DB         | Équipe technique   | Sauvegarde de la configuration dans la table `tenants`         |
| 5. Test de validation                | Client + Tech      | Vérification qu'une commande hors horaires est refusée         |

### Règles de gestion

- Si une commande est passée en dehors des horaires de réception, un message est affiché : « Commandes acceptées de [heure début] à [heure fin] ».
- Si une livraison est demandée en dehors des horaires de livraison, elle est automatiquement reportée au créneau suivant.

### Validation

- La configuration est validée lorsque le client confirme les horaires et qu'un test de commande hors horaires affiche le message attendu.

---

## DEP-0932 — Définir le processus de configuration téléphonique d'un nouveau client

### Objectif

Définir le **processus de configuration** du numéro de téléphone et de l'agent vocal pour chaque nouveau tenant.

### Pré-requis

- Numéro de téléphone dédié fourni par le client ou acheté via Twilio.
- Configuration de l'agent vocal téléphonique (DEP-0441–0480).

### Éléments de configuration

| Élément                              | Description                                                    |
|--------------------------------------|----------------------------------------------------------------|
| Numéro de téléphone principal        | Numéro affiché sur le site et utilisé pour les appels entrants|
| Agent vocal activé                   | Booléen (oui/non)                                              |
| Message de bienvenue                 | Phrase d'accueil personnalisée (DEP-0451)                      |
| Langue par défaut                    | Langue de l'agent vocal (français ou anglais)                  |

### Format de configuration

| Champ                                | Type          | Description                                                    |
|--------------------------------------|---------------|----------------------------------------------------------------|
| `phone_number`                       | String        | Numéro au format international (ex. `+33123456789`)            |
| `voice_agent_enabled`                | Boolean       | `true` si l'agent vocal est activé                             |
| `welcome_message`                    | String        | Message de bienvenue personnalisé                              |
| `voice_language`                     | String        | `fr` ou `en`                                                   |
| `twilio_account_sid`                 | String        | Identifiant du compte Twilio (si applicable)                   |

### Processus de configuration

| Étape                                | Responsable        | Activités                                                      |
|--------------------------------------|--------------------|----------------------------------------------------------------|
| 1. Collecte du numéro                | Onboarding manager | Demande au client de fournir un numéro dédié                   |
| 2. Configuration Twilio              | Équipe technique   | Achat ou configuration du numéro sur Twilio                    |
| 3. Association au tenant             | Équipe technique   | Liaison du numéro au tenant dans la table `tenants`            |
| 4. Personnalisation du message       | Client + Tech      | Saisie du message de bienvenue personnalisé                    |
| 5. Test de l'agent vocal             | Client + Tech      | Appel test pour vérifier le fonctionnement de l'agent vocal    |

### Message de bienvenue par défaut

> « Bonjour et bienvenue chez [Nom Commercial]. Je suis votre assistant vocal. Comment puis-je vous aider aujourd'hui ? »

### Validation

- La configuration est validée lorsque le client confirme le numéro et qu'un appel test fonctionne correctement.
- Le numéro est affiché sur le site client dans l'en-tête et la page de contact.

---

## DEP-0933 — Définir le processus de création des comptes employés d'un nouveau client

### Objectif

Définir le **processus de création** des comptes utilisateurs pour le dépanneur et ses employés.

### Types de comptes

| Type de compte                       | Rôle                 | Permissions                                                    |
|--------------------------------------|----------------------|----------------------------------------------------------------|
| Compte propriétaire (dépanneur)      | `owner`              | Accès complet (admin catalogue, réception, stats, paramètres)  |
| Compte employé (préparateur)         | `employee`           | Accès réception de commandes uniquement                        |
| Compte admin (super-admin)           | `admin`              | Accès complet multi-tenants (réservé à l'équipe technique)     |

### Processus de création

| Étape                                | Responsable        | Activités                                                      |
|--------------------------------------|--------------------|----------------------------------------------------------------|
| 1. Collecte des informations         | Onboarding manager | Demande au client de fournir les noms, emails des employés    |
| 2. Création du compte propriétaire   | Équipe technique   | Création du compte `owner` avec email et mot de passe temporaire |
| 3. Création des comptes employés     | Équipe technique   | Création des comptes `employee` avec email et mot de passe temporaire |
| 4. Envoi des invitations             | Équipe technique   | Envoi d'emails d'invitation avec lien de première connexion    |
| 5. Première connexion                | Employés           | Changement du mot de passe temporaire                          |

### Champs du compte utilisateur

| Champ                                | Type          | Description                                                    |
|--------------------------------------|---------------|----------------------------------------------------------------|
| `id`                                 | UUID          | Identifiant unique                                             |
| `tenant_id`                          | UUID          | Identifiant du tenant (isolation multi-tenant)                 |
| `email`                              | String        | Email de connexion (unique par tenant)                         |
| `password_hash`                      | String        | Hash du mot de passe (bcrypt ou argon2)                        |
| `role`                               | Enum          | `owner`, `employee`, `admin`                                   |
| `first_name`                         | String        | Prénom                                                         |
| `last_name`                          | String        | Nom                                                            |
| `phone`                              | String        | Numéro de téléphone (optionnel)                                |
| `status`                             | Enum          | `active`, `suspended`, `deleted`                               |
| `created_at`                         | Timestamp     | Date de création                                               |
| `last_login_at`                      | Timestamp     | Date de dernière connexion                                     |

### Email d'invitation

**Objet** : Bienvenue chez [Nom Commercial] — Activez votre compte

**Contenu** :

> Bonjour [Prénom],
>
> Votre compte dépanneur a été créé sur depaneurIA. Cliquez sur le lien ci-dessous pour activer votre compte et définir votre mot de passe :
>
> [Lien d'activation]
>
> Ce lien est valide pendant 48 heures.
>
> Cordialement,
> L'équipe depaneurIA

### Validation

- La création est validée lorsque le propriétaire et les employés peuvent se connecter avec succès.

---

## DEP-0934 — Définir le processus de création des comptes livreurs d'un nouveau client

### Objectif

Définir le **processus de création** des comptes utilisateurs pour les livreurs d'un nouveau tenant.

### Types de comptes livreurs

| Type de compte                       | Rôle                 | Permissions                                                    |
|--------------------------------------|----------------------|----------------------------------------------------------------|
| Livreur dédié                        | `driver`             | Accès à l'interface livreur pour le tenant uniquement          |
| Livreur partagé (optionnel V2)       | `driver_shared`      | Accès à plusieurs tenants (non supporté en V1)                 |

### Processus de création

| Étape                                | Responsable        | Activités                                                      |
|--------------------------------------|--------------------|----------------------------------------------------------------|
| 1. Collecte des informations         | Onboarding manager | Demande au client de fournir les noms, emails des livreurs    |
| 2. Création des comptes livreurs     | Équipe technique   | Création des comptes `driver` avec email et mot de passe temporaire |
| 3. Envoi des invitations             | Équipe technique   | Envoi d'emails d'invitation avec lien de première connexion    |
| 4. Première connexion                | Livreurs           | Changement du mot de passe temporaire                          |
| 5. Installation de l'application mobile (optionnel) | Livreurs           | Téléchargement de l'application mobile (si disponible)         |

### Champs du compte livreur

| Champ                                | Type          | Description                                                    |
|--------------------------------------|---------------|----------------------------------------------------------------|
| `id`                                 | UUID          | Identifiant unique                                             |
| `tenant_id`                          | UUID          | Identifiant du tenant (isolation multi-tenant)                 |
| `email`                              | String        | Email de connexion (unique par tenant)                         |
| `password_hash`                      | String        | Hash du mot de passe (bcrypt ou argon2)                        |
| `role`                               | Enum          | `driver`                                                       |
| `first_name`                         | String        | Prénom                                                         |
| `last_name`                          | String        | Nom                                                            |
| `phone`                              | String        | Numéro de téléphone (obligatoire)                              |
| `vehicle_type`                       | String        | Type de véhicule (vélo, scooter, voiture)                      |
| `license_plate`                      | String        | Plaque d'immatriculation (optionnel)                           |
| `status`                             | Enum          | `active`, `suspended`, `deleted`                               |
| `created_at`                         | Timestamp     | Date de création                                               |
| `last_login_at`                      | Timestamp     | Date de dernière connexion                                     |

### Email d'invitation

**Objet** : Bienvenue chez [Nom Commercial] — Activez votre compte livreur

**Contenu** :

> Bonjour [Prénom],
>
> Votre compte livreur a été créé sur depaneurIA. Cliquez sur le lien ci-dessous pour activer votre compte et définir votre mot de passe :
>
> [Lien d'activation]
>
> Ce lien est valide pendant 48 heures.
>
> Après activation, vous pourrez accéder à l'interface de livraison via [URL].
>
> Cordialement,
> L'équipe depaneurIA

### Validation

- La création est validée lorsque les livreurs peuvent se connecter avec succès et accéder à la liste des livraisons disponibles.

---

## Conclusion

Ce document définit les **20 tâches** du bloc DEP-0915 à DEP-0934, couvrant :
1. **Le pilote** (DEP-0915 à DEP-0920) : tests, ouverture, suivi, corrections, bilan et décision de clonage.
2. **L'onboarding** (DEP-0921 à DEP-0934) : processus commercial, technique et opérationnel pour ouvrir de nouveaux clients.

**Prochaine étape** : Implémenter les processus définis dans ce document lors de la phase de déploiement et d'expansion multi-clients.

**Référence parente** : Blocs DEP-0881 à DEP-0960 (pilote, onboarding et expansion multi-clients).
