# DEP-0595 à DEP-0614 — Cycles complets et admin produits (base)

## Périmètre

Ce document couvre deux volets :

- Les **tests de bout en bout** des quatre chemins de commande V1 (manuel, assisté texte, assisté voix web, téléphonique) en s'assurant qu'ils reposent tous sur le **même moteur d'état** des commandes, livraisons, paiements et disponibilités (DEP-0581 à DEP-0584).
- La définition de l'**interface admin produits** du dépanneur et des champs/actions minimums pour gérer les produits (ajout, édition, archivage, catégorisation, médias, disponibilité, prix internes, mots-clés, synonymes).

Il s'agit exclusivement de **documentation** : aucun code produit, aucune implémentation.

---

## DEP-0595 — Test d'un cycle complet de commande manuelle

### Objectif

Valider qu'une commande passée en mode **manuel** suit correctement tout le cycle V1 : création, préparation, livraison et clôture dans la machine d'état des commandes (DEP-0581) et des livraisons (DEP-0582).

### Pré-requis

- Catalogue démo chargé (DEP-0271 à DEP-0280).
- Client connecté (profil complet) et dépanneur connecté à l'interface `/depanneur/commandes`.
- Au moins un livreur disponible pour la prise en charge.

### Scénario de test nominal

| Étape | Acteur    | Action                                          | Attendu                                                                        |
| ----- | --------- | ----------------------------------------------- | ------------------------------------------------------------------------------ |
| 1     | Client    | Ajoute 2 produits au panier, clique "Commander" | Création commande `en_attente` + horodatage `created_at` (DEP-0586)            |
| 2     | Dépanneur | Accepte la commande                             | Transition `en_attente` -> `en_preparation` + `accepted_at` (DEP-0587)         |
| 3     | Dépanneur | Marque la commande prête                        | Transition `en_preparation` -> `prete` + création livraison `non_assignee`     |
| 4     | Dépanneur | Assigne un livreur                              | Livraison `assignee`, commande reste `prete`                                   |
| 5     | Livreur   | Confirme départ                                 | Livraison `en_route`, commande `en_livraison`                                  |
| 6     | Livreur   | Confirme remise + paiement collecté             | Livraison `livree`, commande `livree`, paiement `paiement_collecte` (DEP-0583) |
| 7     | Système   | Journalise l'historique complet                 | Entrées DEP-0585 présentes, aucune transition interdite                        |

### Critères de réussite

- Aucune divergence d'état : la commande termine en `livree` et la livraison en `livree`.
- Les badges et suivis affichent les mêmes statuts côté client et dépanneur (DEP-0575, DEP-0592).
- Les horodatages `created_at`, `accepted_at`, `delivered_at` sont renseignés.

---

## DEP-0596 — Test d'un cycle complet de commande assistée texte

### Objectif

Valider le parcours complet via l'**assistant texte** (chat) en garantissant l'alignement sur la même machine d'état que le mode manuel.

### Pré-requis

- Assistant texte actif (DEP-0361 à DEP-0400).
- Consentements client ok (notifications, cookies).

### Scénario de test nominal

| Étape | Acteur    | Action                                                       | Attendu                                                                            |
| ----- | --------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| 1     | Client    | Demande un produit via l'assistant, confirme les suggestions | Panier rempli, création commande `en_attente`                                      |
| 2     | Assistant | Affiche récapitulatif et demande confirmation                | Confirmation enregistrée, pas de paiement en ligne                                 |
| 3     | Dépanneur | Accepte puis prépare                                         | Transitions `en_attente` -> `en_preparation` -> `prete`                            |
| 4     | Livreur   | Prend en charge puis livre                                   | Livraison `en_route` -> `arrivee` -> `livree`, commande `en_livraison` -> `livree` |
| 5     | Assistant | Notifie le client de chaque changement                       | Messages reflètent les mêmes statuts que l'interface dépanneur                     |

### Critères de réussite

- Même historique de transitions que le mode manuel (DEP-0585).
- Les messages assistant utilisent les labels et badges définis pour chaque état (DEP-0377 à DEP-0400).
- Aucun état intermédiaire spécifique à l'assistant n'est créé.

---

## DEP-0597 — Test d'un cycle complet de commande assistée voix web

### Objectif

Valider le parcours complet via l'**assistant voix web** (micro navigateur) en réutilisant exactement la même machine d'état et les mêmes validations.

### Pré-requis

- Micro autorisé, assistant voix web actif (DEP-0421 à DEP-0440).
- Connexion client établie ou capture d'identité minimale (nom + téléphone).

### Scénario de test nominal

| Étape | Acteur         | Action                                              | Attendu                                                          |
| ----- | -------------- | --------------------------------------------------- | ---------------------------------------------------------------- |
| 1     | Client         | Dicte la liste d'articles, confirme vocalement      | Commande `en_attente` créée, transcription sauvegardée           |
| 2     | Assistant voix | Lit le récapitulatif et demande confirmation finale | Aucun prix public obligatoire (paiement à la livraison)          |
| 3     | Dépanneur      | Accepte, prépare, marque prête                      | Transitions identiques au mode manuel                            |
| 4     | Livreur        | Confirme départ puis livraison                      | Livraison `en_route` -> `arrivee` -> `livree`, commande `livree` |
| 5     | Système        | Historise audio/transcription liée à la commande    | Trace associée sans créer d'état spécifique                      |

### Critères de réussite

- Les statuts et horodatages correspondent à ceux du mode manuel (DEP-0586 à DEP-0589).
- Les notifications push/voix respectent les mêmes points de déclenchement (DEP-0484).
- Aucune variation d'état ou de badge côté suivi client.

---

## DEP-0598 — Test d'un cycle complet de commande téléphonique

### Objectif

Valider le cycle complet via l'**agent téléphonique** (DEP-0441 à DEP-0456) avec la même machine d'état.

### Pré-requis

- Numéro téléphonique opérationnel et routé vers l'agent vocal.
- Identité minimale collectée (nom + téléphone + adresse) avant validation.

### Scénario de test nominal

| Étape | Acteur      | Action                                                         | Attendu                                             |
| ----- | ----------- | -------------------------------------------------------------- | --------------------------------------------------- |
| 1     | Agent vocal | Accueille, collecte identité et commande, lit le récapitulatif | Commande `en_attente` créée dès validation orale    |
| 2     | Dépanneur   | Accepte depuis l'interface réception                           | Passage `en_attente` -> `en_preparation`            |
| 3     | Dépanneur   | Marque prête puis assigne un livreur                           | Commande `prete`, livraison `assignee`              |
| 4     | Livreur     | Confirme départ puis livraison                                 | Livraison `en_route` -> `livree`, commande `livree` |
| 5     | Agent vocal | Envoie SMS de confirmation finale (optionnel V1)               | Message utilise les mêmes statuts et IDs            |

### Critères de réussite

- La commande suit exactement les états DEP-0581, sans état téléphonie spécifique.
- L'historique de transitions inclut l'acteur `systeme` ou `agent_vocal` comme déclencheur quand approprié (DEP-0585).
- Les temps d'attente/acceptation sont conformes aux règles de réception (DEP-0485, DEP-0493).

---

## DEP-0599 — Vérifier que tous les chemins convergent sur le même moteur d'état

### Objectif

Garantir que les quatre modes d'entrée (manuel, assisté texte, voix web, téléphonique) utilisent **les mêmes états, transitions et journaux** pour commande, livraison, paiement et disponibilité.

### Points de contrôle

- **États commandes (DEP-0581)** : seuls `en_attente`, `en_preparation`, `prete`, `en_livraison`, `livree`, `annulee`, `probleme` sont utilisés.
- **États livraisons (DEP-0582)** : seuls `non_assignee`, `assignee`, `en_route`, `arrivee`, `livree`, `echec`, `retournee` sont utilisés.
- **Paiement (DEP-0583)** : `paiement_attente`, `paiement_collecte`, `paiement_non_collecte`, `paiement_litige` uniquement.
- **Disponibilité (DEP-0584)** : `en_stock`, `faible_stock`, `rupture`, `archive`.
- **Horodatages** : `created_at`, `accepted_at`, `ready_at`, `pickup_at`, `delivered_at`, `cancelled_at` selon DEP-0586 à DEP-0590.
- **Journal** : chaque transition génère une entrée DEP-0585 avec l'acteur (`client`, `depanneur`, `livreur`, `systeme`, `agent_vocal`).

### Critères de validation

- Aucun état ou transition supplémentaire n'apparaît dans les logs quelle que soit la source d'entrée.
- Les écrans de suivi (client, dépanneur, livreur) affichent les mêmes libellés et couleurs pour un même état (DEP-0575, DEP-0592).
- Les tests automatisables de bout en bout comparent les matrices de transitions attendues vs observées sur les quatre parcours.

---

## DEP-0600 — Geler le moteur d'état V1

### Objectif

Stabiliser la machine d'état V1 avant implémentation : **aucun nouvel état ni transition** ne sera ajouté sans ouverture du bloc V2.

### Décisions

- États figés : commandes (DEP-0581), livraisons (DEP-0582), paiement (DEP-0583), disponibilité produits (DEP-0584).
- Transitions figées : uniquement celles listées dans les tableaux correspondants.
- Toute demande d'ajout/modification d'état ou de transition requiert un **change request V2** documenté et un nouveau DEP.
- Les noms techniques (`en_attente`, `livree`, etc.) sont définitifs pour la V1 et utilisés dans les bases et APIs.

### Critères de clôture V1

- L'intégralité des tests DEP-0595 à DEP-0598 passe sans divergence d'état.
- Les journaux DEP-0585 couvrent toutes les transitions des tests.
- Les écrans de suivi (DEP-0575 à DEP-0594) ne nécessitent plus de changement de mapping.

---

## DEP-0601 — Interface admin produits du dépanneur

### Objectif

Définir l'interface de base permettant au dépanneur (rôle `depanneur` ou `admin`) de gérer les produits du catalogue.

### Structure de page

| Zone                  | Contenu                                                                                                                                                     | Position            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Header                | Titre "Produits", bouton "Ajouter un produit", filtre tenant (si multi-tenant)                                                                              | Haut                |
| Filtres               | Recherche par nom/sku, filtre catégorie, filtre disponibilité (`en_stock`, `faible_stock`, `rupture`, `archive`), filtre vedette/populaire                  | Bandeau sous header |
| Liste                 | Tableau produits avec colonnes : image principale, nom, sku, catégorie, disponibilité, prix interne, badges mots-clés/synonymes, actions (éditer, archiver) | Corps               |
| Panneau latéral/modal | Formulaire d'ajout/édition (champs DEP-0602 à DEP-0610)                                                                                                     | Droite ou modal     |

### Règles d'accès et d'usage

- Page accessible via `/depanneur/admin/produits`.
- Actions limitées aux rôles autorisés, auditées (journal simple : utilisateur, action, horodatage).
- Les modifications respectent immédiatement les contraintes du catalogue (DEP-0241 à DEP-0255).

---

## DEP-0602 — Champs d'ajout d'un produit

### Objectif

Définir les champs minimums pour créer un produit dans l'interface admin.

### Champs

| Champ               | Type                 | Obligatoire | Règles                                                   |
| ------------------- | -------------------- | ----------- | -------------------------------------------------------- |
| Nom produit         | Texte                | Oui         | 25-80 caractères (DEP-0256)                              |
| SKU                 | Texte                | Oui         | Unique par tenant, alphanumérique simple                 |
| Slug                | Texte (auto)         | Oui         | Généré depuis le nom, éditable avant création uniquement |
| Catégorie           | Sélecteur (DEP-0605) | Oui         | Catégorie active obligatoire                             |
| Description courte  | Texte                | Oui         | 50-80 caractères recommandés (DEP-0256)                  |
| Description longue  | Texte                | Non         | 150-300 caractères recommandés (DEP-0256)                |
| Variante par défaut | Select               | Oui         | Unité/conditionnement (DEP-0244)                         |
| Disponibilité       | Select (DEP-0607)    | Oui         | Valeur initiale `en_stock` ou `faible_stock`             |
| Prix interne        | Numérique (DEP-0608) | Oui         | Montant TTC interne par variante ou par produit          |
| Images              | Bloc (DEP-0606)      | Oui         | Image principale requise avant enregistrement            |
| Mots-clés           | Liste (DEP-0609)     | Oui         | 5 à 15 mots-clés                                         |
| Synonymes           | Liste (DEP-0610)     | Non         | 5 à 20 synonymes conseillés                              |

### Règles

- Validation blocante si image principale ou catégorie manquantes.
- Les valeurs par défaut reprennent les conventions DEP-0256 (images 1:1, alt obligatoire).
- Enregistrement crée l'état disponibilité initiale (DEP-0584) et journalise la création.

---

## DEP-0603 — Champs d'édition d'un produit

### Objectif

Définir ce qui est éditable après création et comment l'interface doit le présenter.

### Éditable vs non éditable

| Élément                   | Éditable ?         | Détail                                                |
| ------------------------- | ------------------ | ----------------------------------------------------- |
| Nom produit               | Oui                | Re-génération optionnelle du slug (avec confirmation) |
| SKU                       | Non                | Immobile pour éviter la rupture de traçabilité        |
| Slug                      | Non après création | Modifiable uniquement lors de l'ajout                 |
| Catégorie                 | Oui                | Changement avec avertissement sur SEO interne         |
| Description courte/longue | Oui                | Avec comptage de caractères                           |
| Variantes                 | Oui                | Ajout/suppression/édition sous-reserve de stock       |
| Disponibilité             | Oui                | Via champ DEP-0607                                    |
| Prix interne              | Oui                | Via champ DEP-0608                                    |
| Images                    | Oui                | Via actions DEP-0611 à DEP-0614                       |
| Mots-clés/Synonymes       | Oui                | Via champs DEP-0609/DEP-0610                          |

### Règles

- Toute modification significative (nom, catégorie, disponibilité) déclenche un log d'audit.
- Les champs non éditables sont grisées et accompagnés d'un texte "verrouillé après création".

---

## DEP-0604 — Champs d'archivage d'un produit

### Objectif

Définir les informations demandées lorsqu'un produit est **archivé** (passage à l'état `archive` DEP-0584).

### Champs

| Champ               | Type              | Obligatoire | Règles                              |
| ------------------- | ----------------- | ----------- | ----------------------------------- |
| Motif d'archivage   | Texte court       | Oui         | Ex : rupture longue, fin de gamme   |
| Date d'effet        | Date              | Oui         | Par défaut aujourd'hui              |
| Remplaçant éventuel | Sélecteur produit | Non         | Option pour suggérer un substitut   |
| Note interne        | Texte libre       | Non         | Visible équipe dépanneur uniquement |

### Règles

- L'archivage masque le produit dans la boutique et l'assistant immédiatement.
- Aucune suppression définitive en V1 : état réversible vers `en_stock` via édition.
- L'historique DEP-0585 enregistre la transition avec l'acteur.

---

## DEP-0605 — Champs de catégorie d'un produit

### Objectif

Préciser les champs de catégorisation dans le formulaire produit.

### Champs

| Champ                | Type                   | Obligatoire | Règles                                             |
| -------------------- | ---------------------- | ----------- | -------------------------------------------------- |
| Catégorie principale | Sélecteur hiérarchique | Oui         | Liste des catégories actives (DEP-0241)            |
| Sous-catégorie       | Sélecteur hiérarchique | Non         | Visible si la catégorie sélectionnée a des enfants |
| Ordre d'affichage    | Numérique              | Non         | Valeur par défaut issue de DEP-0256, éditable      |

### Règles

- Le sélecteur est filtré pour masquer les catégories archivées.
- Le couple catégorie/sous-catégorie est enregistré dans la structure produit (DEP-0241).
- Modification de catégorie met à jour les parcours de navigation client (DEP-0321).

---

## DEP-0606 — Champs d'image d'un produit

### Objectif

Définir les champs de gestion des images produit dans l'interface admin.

### Champs

| Champ                      | Type        | Obligatoire | Règles                                              |
| -------------------------- | ----------- | ----------- | --------------------------------------------------- |
| Image principale           | Upload      | Oui         | Format WebP/JPEG, ratio 1:1, min 800x800 (DEP-0256) |
| Images secondaires (max 4) | Upload/drag | Non         | Angles différents, ordre éditable                   |
| Texte alternatif           | Texte       | Oui         | Obligatoire pour chaque image                       |
| Ordre d'affichage          | Numérique   | Oui         | 1 pour image principale                             |
| Type d'image               | Sélecteur   | Non         | `main`, `thumb`, `hero` pour préparer les tailles   |

### Règles

- L'image principale doit être marquée `main` et placée en position 1.
- Les actions DEP-0611 à DEP-0614 s'appliquent à chaque image uploadée.
- Les validations de taille et ratio sont appliquées avant enregistrement.

---

## DEP-0607 — Champs de disponibilité d'un produit

### Objectif

Définir les champs permettant de saisir la disponibilité et les quantités associées.

### Champs

| Champ                  | Type      | Obligatoire | Règles                             |
| ---------------------- | --------- | ----------- | ---------------------------------- |
| État de disponibilité  | Select    | Oui         | Valeurs DEP-0584                   |
| Stock actuel           | Numérique | Oui         | >= 0, cohérent avec état           |
| Seuil faible stock     | Numérique | Non         | Par défaut 5 (DEP-0584)            |
| Date de réappro prévue | Date      | Non         | Affichée côté dépanneur uniquement |

### Règles

- Si stock = 0, état forcé à `rupture` sauf décision d'archiver.
- Le passage à `archive` se fait via l'action d'archivage (DEP-0604).
- Mise à jour stock déclenche recalcul popularité (DEP-0575).

---

## DEP-0608 — Champs de prix interne d'un produit

### Objectif

Définir les champs pour saisir le **prix interne** (coût et prix de vente interne) par produit ou variante.

### Champs

| Champ                     | Type      | Obligatoire | Règles                                           |
| ------------------------- | --------- | ----------- | ------------------------------------------------ |
| Prix d'achat TTC          | Numérique | Oui         | Par produit ou par variante selon configuration  |
| Prix de vente interne TTC | Numérique | Oui         | Utilisé pour les totaux internes et remises      |
| Devise                    | Sélecteur | Oui         | Devise du tenant                                 |
| Remise interne active     | Checkbox  | Non         | Si cochée, champ montant ou pourcentage apparaît |
| Date d'effet prix         | Date      | Non         | Par défaut aujourd'hui                           |

### Règles

- Les prix internes ne sont pas affichés au client (paiement à la livraison).
- Les champs sont validés pour être >= 0 et cohérents (vente >= achat).
- Les modifications sont horodatées pour traçabilité interne.

---

## DEP-0609 — Champs de mots-clés d'un produit

### Objectif

Définir la saisie des mots-clés utilisés par la recherche texte (DEP-0327) et les suggestions.

### Champs

| Champ              | Type       | Obligatoire | Règles                                       |
| ------------------ | ---------- | ----------- | -------------------------------------------- |
| Liste de mots-clés | Tags       | Oui         | 5 à 15, minuscules, sans accents si possible |
| Source             | Badge auto | Oui         | `admin` (saisie manuelle) ou `import`        |

### Règles

- Validation sur longueur (3-25 caractères) et unicité dans la liste.
- Les mots-clés sont stockés par produit/variante selon DEP-0241.
- Aucun mot-clé généré automatiquement en V1 : saisie manuelle obligatoire.

---

## DEP-0610 — Champs de synonymes d'un produit

### Objectif

Définir la saisie des synonymes utilisés par l'assistant texte, voix web et téléphonie.

### Champs

| Champ                     | Type | Obligatoire | Règles                                   |
| ------------------------- | ---- | ----------- | ---------------------------------------- |
| Synonymes recherche       | Tags | Non         | 5-15 recommandés, minuscules             |
| Synonymes assistant texte | Tags | Oui         | 5-20, tournures naturelles (DEP-0361)    |
| Synonymes voix web        | Tags | Oui         | 5-20, articulation simple                |
| Synonymes téléphonie      | Tags | Oui         | 8-25, adaptés à l'agent vocal (DEP-0441) |

### Règles

- Pas de caractères spéciaux difficiles à prononcer.
- Les synonymes peuvent différer par canal mais se rattachent au même produit.
- Validation de non-duplication entre les listes pour éviter la surcharge.

---

## DEP-0611 — Action d'ajout d'image par téléversement

### Objectif

Décrire l'action standard d'ajout d'image via bouton d'upload.

### Comportement

- Bouton "Importer une image" ouvre le sélecteur de fichier.
- Formats acceptés : WebP (prioritaire), JPEG (fallback).
- Validation immédiate : taille minimale 800x800, ratio 1:1 ±10%, poids <= 2 Mo.
- Après sélection, l'image passe par la compression simple (DEP-0614) puis est pré-affichée.

---

## DEP-0612 — Action d'ajout d'image par glisser-déposer

### Objectif

Définir le dropzone pour importer des images par glisser-déposer.

### Comportement

- Zone visible "Glissez-déposez vos images (max 4)".
- Supporte dépôt multiple, applique la même validation que DEP-0611.
- Les images sont ordonnées selon l'ordre de dépôt ; l'admin peut réordonner après coup.
- Chaque image passe par compression (DEP-0614) avant enregistrement.

---

## DEP-0613 — Action de recadrage simple des images

### Objectif

Permettre un recadrage rapide pour respecter le ratio 1:1 recommandé.

### Comportement

- Outil de recadrage carré simple (drag/resizing).
- Ratio verrouillé 1:1, avec guide sur la zone centrale 70-85% (DEP-0256).
- Aperçu en temps réel des tailles `thumb` (150px) et `full` (800px).
- Recadrage appliqué avant compression (DEP-0614) et sauvegarde.

---

## DEP-0614 — Action de compression simple des images

### Objectif

Définir la compression appliquée aux images avant stockage.

### Règles

- Format cible par défaut : **WebP qualité 80%** (fourchette 75-90% DEP-0256).
- Fallback JPEG qualité 85% si navigateur ne supporte pas WebP.
- Compression appliquée après recadrage éventuel, avant upload serveur.
- Poids cible : < 300 Ko pour `thumb`, < 800 Ko pour `full`.
