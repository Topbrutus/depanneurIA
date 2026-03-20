# DEP-0615 à DEP-0634 — Admin catalogue : actions et pages

## Périmètre

Ce document définit les **actions administratives** disponibles dans l'interface de gestion du catalogue côté dépanneur : suppression d'image, réorganisation par glisser-déposer (produits, catégories), marquage (vedette, indisponible), duplication, clonage, import/export, brouillons et publication.

Il définit également les **pages principales** de l'admin catalogue : liste des produits, ajout/édition de produit, gestion des catégories, ainsi que les **zones d'interaction** (glisser-déposer) et la **validation des champs**.

Ces décisions s'appuient sur le modèle catalogue de base (DEP-0241–0255) et les conventions contenu (DEP-0256–0270).

Il s'agit exclusivement de **documentation** : aucun code produit, aucune implémentation. Les spécifications décrites ici serviront de référence pour les futures implémentations front-end et back-end.

---

## DEP-0615 — Action de suppression d'image

### Objectif

Définir la logique permettant au dépanneur de supprimer une image d'un produit depuis l'interface d'administration.

### Comportement

| Élément             | Description                                                            |
| ------------------- | ---------------------------------------------------------------------- |
| Déclenchement       | Bouton « × » ou icône poubelle sur la miniature de l'image             |
| Confirmation        | Modal de confirmation : « Supprimer cette image ? »                    |
| Actions disponibles | « Annuler » / « Supprimer »                                            |
| Effet               | L'image est retirée de la liste des images du produit                  |
| Image principale    | Si c'était l'image principale, la première restante devient principale |

### Règles

- Un produit doit toujours avoir au moins une image (validation DEP-0634).
- Si une seule image reste, le bouton de suppression est désactivé.
- La suppression est **définitive** (pas de corbeille en V1).
- Le fichier reste en stockage CDN (nettoyage manuel ultérieur).

### Message de confirmation

> « Êtes-vous sûr de vouloir supprimer cette image ? Cette action est irréversible. »

### Validation

- L'action nécessite le rôle `depanneur` ou `admin`.
- L'image supprimée n'apparaît plus dans les écrans client immédiatement.

---

## DEP-0616 — Action de réorganisation des produits par glisser-déposer

### Objectif

Permettre au dépanneur de modifier l'ordre d'affichage des produits dans une catégorie en les glissant-déposant dans la liste.

### Comportement

| Élément             | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| Zone active         | Liste des produits d'une catégorie dans la page d'édition   |
| Interaction         | Clic long (500 ms) + glisser-déposer vertical               |
| Feedback visuel     | Produit en cours de déplacement : ombre portée, opacité 0.8 |
| Indicateur de dépôt | Ligne bleue horizontale entre deux produits                 |
| Sauvegarde          | Automatique dès le relâchement du clic                      |

### Règles

- L'ordre défini ici remplace l'ordre alphabétique par défaut.
- Le champ `display_order` (entier) de chaque produit est mis à jour.
- Sur mobile : maintien tactile long (600 ms) active le mode glisser-déposer.
- Annulation : recharger la page sans sauvegarder annule les modifications non appliquées.

### Accessibilité

- Clavier : `Ctrl+Flèche Haut/Bas` pour déplacer le produit sélectionné.
- Lecteur d'écran : annonce « Produit [nom] déplacé en position [N] ».

### Validation

- L'action nécessite le rôle `depanneur` ou `admin`.
- Les modifications sont visibles côté client immédiatement après sauvegarde.

---

## DEP-0617 — Action de réorganisation des catégories par glisser-déposer

### Objectif

Permettre au dépanneur de modifier l'ordre d'affichage des catégories dans le catalogue en les glissant-déposant.

### Comportement

| Élément             | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| Zone active         | Liste des catégories dans la page « Catégories admin » (DEP-0630) |
| Interaction         | Clic long (500 ms) + glisser-déposer vertical                     |
| Feedback visuel     | Catégorie en cours de déplacement : ombre portée, opacité 0.8     |
| Indicateur de dépôt | Ligne bleue horizontale entre deux catégories                     |
| Sauvegarde          | Automatique dès le relâchement du clic                            |

### Règles

- L'ordre défini ici remplace l'ordre alphabétique par défaut.
- Le champ `display_order` (entier) de chaque catégorie est mis à jour.
- Les catégories enfants suivent leur parent (pas de réorganisation croisée en V1).
- Sur mobile : maintien tactile long (600 ms) active le mode glisser-déposer.

### Accessibilité

- Clavier : `Ctrl+Flèche Haut/Bas` pour déplacer la catégorie sélectionnée.
- Lecteur d'écran : annonce « Catégorie [nom] déplacée en position [N] ».

### Validation

- L'action nécessite le rôle `depanneur` ou `admin`.
- Les modifications sont visibles côté client immédiatement après sauvegarde.

---

## DEP-0618 — Action de marquage « vedette »

### Objectif

Permettre au dépanneur de marquer un produit comme « vedette » pour le mettre en avant sur la page d'accueil ou en tête de catégorie.

### Comportement

| Élément         | Description                                             |
| --------------- | ------------------------------------------------------- |
| Déclenchement   | Icône étoile (vide ou pleine) dans la fiche produit     |
| État initial    | Étoile vide (produit non vedette)                       |
| Action          | Clic sur l'étoile → bascule entre vedette / non vedette |
| Feedback visuel | Étoile pleine (jaune `#F59E0B`) si vedette, vide sinon  |
| Sauvegarde      | Immédiate au clic (pas de confirmation)                 |

### Règles

- Le champ `is_featured` (booléen) du produit est mis à jour.
- Limite recommandée : maximum 5-8 produits vedettes par tenant (non bloquant en V1).
- Les produits vedettes apparaissent en premier dans les listes côté client.
- Un produit peut être vedette ET populaire (indépendant).

### Affichage côté client

- Les produits vedettes ont un badge « Vedette » ou une icône étoile.
- Ils sont listés en tête de la page d'accueil boutique (mode manuel).

### Validation

- L'action nécessite le rôle `depanneur` ou `admin`.
- Les modifications sont visibles côté client immédiatement après sauvegarde.

---

## DEP-0619 — Action de marquage « indisponible »

### Objectif

Permettre au dépanneur de marquer temporairement un produit comme indisponible sans le supprimer du catalogue.

### Comportement

| Élément         | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| Déclenchement   | Interrupteur « Disponible » dans la fiche produit           |
| État initial    | Activé (produit disponible)                                 |
| Action          | Clic sur l'interrupteur → bascule disponible / indisponible |
| Feedback visuel | Interrupteur rouge si indisponible, vert si disponible      |
| Sauvegarde      | Immédiate au clic (pas de confirmation)                     |

### Règles

- Le champ `availability` passe de `en_stock` à `rupture`.
- Un produit indisponible reste visible dans l'admin mais disparaît de la boutique client.
- Alternative : option « Afficher les produits en rupture (grisés) » dans les paramètres tenant (non implémenté V1).
- L'assistant vocal annonce « Ce produit n'est actuellement pas disponible » si demandé.

### Affichage côté client

- Le produit n'apparaît **pas** dans les résultats de recherche.
- S'il est dans un panier existant, un message indique « Ce produit n'est plus disponible ».

### Validation

- L'action nécessite le rôle `depanneur` ou `admin`.
- Les modifications sont visibles côté client immédiatement après sauvegarde.

---

## DEP-0620 — Action de duplication d'un produit

### Objectif

Permettre au dépanneur de créer rapidement une copie d'un produit existant pour gagner du temps lors de l'ajout de produits similaires.

### Comportement

| Élément            | Description                                                   |
| ------------------ | ------------------------------------------------------------- |
| Déclenchement      | Bouton « Dupliquer » dans la fiche produit (admin)            |
| Action             | Création d'une copie du produit avec toutes ses propriétés    |
| Modifications auto | Nom du produit : préfixé par « Copie de »                     |
|                    | SKU : suffixé par `-copy-[timestamp]`                         |
|                    | Slug : régénéré à partir du nouveau nom                       |
| Statut             | Le produit dupliqué est créé en mode « brouillon » (DEP-0625) |

### Propriétés copiées

- Catégorie, description, mots-clés, synonymes
- Prix, variantes, unités de vente
- Images (références copiées, pas de duplication fichier)
- Disponibilité : réinitialisée à `en_stock`
- Marquages : vedette et populaire **non copiés** (réinitialisés)

### Règles

- Le produit dupliqué apparaît immédiatement dans la liste des brouillons.
- Le dépanneur doit modifier et publier le brouillon pour qu'il apparaisse côté client.
- Les surcharges tenant sont copiées si elles existent.

### Validation

- L'action nécessite le rôle `depanneur` ou `admin`.
- Le produit dupliqué a un nouvel `id` unique.

---

## DEP-0621 — Action de duplication d'une catégorie

### Objectif

Permettre au dépanneur de créer rapidement une copie d'une catégorie existante avec tous ses produits associés.

### Comportement

| Élément            | Description                                             |
| ------------------ | ------------------------------------------------------- |
| Déclenchement      | Bouton « Dupliquer » dans la fiche catégorie (admin)    |
| Action             | Création d'une copie de la catégorie                    |
| Modifications auto | Nom de la catégorie : préfixé par « Copie de »          |
|                    | Slug : régénéré à partir du nouveau nom                 |
| Produits associés  | **Non dupliqués en V1** — seule la structure est copiée |

### Propriétés copiées

- Label, hiérarchie (parent/enfant)
- Ordre d'affichage (réinitialisé en fin de liste)
- Surcharges tenant si elles existent

### Règles

- La catégorie dupliquée apparaît immédiatement dans la liste des catégories.
- Le dépanneur doit ajouter manuellement des produits à la nouvelle catégorie.
- En V2 : option « Dupliquer avec les produits » pourrait être ajoutée.

### Validation

- L'action nécessite le rôle `depanneur` ou `admin`.
- La catégorie dupliquée a un nouvel `id` unique.

---

## DEP-0622 — Action de clonage d'un catalogue vers un autre tenant si autorisé

### Objectif

Permettre à un super-administrateur de cloner l'intégralité du catalogue d'un tenant vers un nouveau tenant lors de l'onboarding.

### Comportement

| Élément       | Description                                                           |
| ------------- | --------------------------------------------------------------------- |
| Déclenchement | Bouton « Cloner le catalogue » dans l'interface super-admin           |
| Sélection     | Choix du tenant source et du tenant destination                       |
| Confirmation  | Modal : « Cloner [N] produits et [M] catégories vers [tenant] ? »     |
| Action        | Copie complète du catalogue (catégories + produits)                   |
| Durée estimée | Affichage d'une barre de progression (peut prendre plusieurs minutes) |

### Éléments clonés

- Toutes les catégories (structure hiérarchique)
- Tous les produits (avec variantes, prix, images)
- Mots-clés, synonymes, allergènes
- Ordre d'affichage des catégories et produits

### Éléments non clonés

- Commandes, paniers, clients (données tenant strictement séparées)
- Configurations téléphoniques (clonage séparé DEP-0660)
- Journaux d'activité

### Règles

- L'action nécessite le rôle `super_admin`.
- Le tenant destination doit être vide ou la confirmation doit indiquer « Écraser le catalogue existant ? ».
- Les identifiants internes (`id`, `sku`) sont régénérés pour éviter les collisions.
- Les URLs des images sont copiées (références CDN).

### Validation

- Une fois cloné, les deux catalogues évoluent de manière **indépendante**.
- Le tenant destination peut modifier librement son catalogue cloné.

---

## DEP-0623 — Action d'import massif de produits (plus tard si utile)

### Objectif

Permettre au dépanneur d'importer un grand nombre de produits en une seule opération via un fichier CSV ou Excel.

### Statut V1

**Non implémenté en V1** — fonctionnalité réservée pour V2 ou ultérieur.

### Comportement prévu (V2)

| Élément               | Description                                                     |
| --------------------- | --------------------------------------------------------------- |
| Déclenchement         | Bouton « Importer des produits » dans la page liste produits    |
| Format accepté        | CSV, XLSX                                                       |
| Colonnes requises     | `nom`, `categorie`, `prix`, `image_url`                         |
| Colonnes optionnelles | `description`, `sku`, `mots_cles`, `synonymes`, `disponibilite` |
| Validation            | Vérification des données avant import                           |
| Erreurs               | Liste des lignes en erreur avec raison                          |

### Règles prévues

- Les catégories doivent exister avant l'import (ou être créées automatiquement).
- Les images doivent être hébergées sur CDN ou localement avant import.
- Les produits importés sont créés en mode « brouillon » par défaut.

### Raison du report

- Cas d'usage peu fréquent en V1 (pilote avec un seul dépanneur).
- Ajout manuel plus flexible pour les premiers catalogues.
- Complexité de validation et gestion d'erreurs significative.

---

## DEP-0624 — Action d'export du catalogue

### Objectif

Permettre au dépanneur d'exporter l'intégralité de son catalogue dans un fichier structuré pour sauvegarde ou analyse.

### Comportement

| Élément        | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| Déclenchement  | Bouton « Exporter le catalogue » dans la page liste produits |
| Format proposé | CSV (priorité), JSON (optionnel)                             |
| Contenu        | Toutes les catégories et produits avec leurs propriétés      |
| Nom du fichier | `catalogue-[tenant-slug]-[date].csv`                         |
| Téléchargement | Immédiat (< 1000 produits) ou asynchrone avec notification   |

### Colonnes exportées (CSV)

- `id`, `nom`, `categorie`, `sku`, `description`
- `prix`, `unite`, `conditionnement`
- `disponibilite`, `vedette`, `populaire`
- `image_principale_url`, `images_secondaires_urls` (séparées par `;`)
- `mots_cles`, `synonymes` (séparés par `,`)

### Règles

- L'export inclut uniquement les produits du tenant actuel (isolation stricte).
- Les produits archivés sont inclus avec une colonne `archive: true`.
- Les brouillons ne sont **pas** inclus dans l'export par défaut (option « Inclure les brouillons » disponible).

### Validation

- L'action nécessite le rôle `depanneur` ou `admin`.
- Le fichier exporté peut être utilisé comme base pour un futur import (DEP-0623).

---

## DEP-0625 — Action de sauvegarde brouillon

### Objectif

Permettre au dépanneur de sauvegarder un produit en cours de création ou d'édition sans le publier immédiatement côté client.

### Comportement

| Élément         | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| Déclenchement   | Bouton « Sauvegarder comme brouillon » dans la fiche produit       |
| État du produit | `status: draft`                                                    |
| Visibilité      | Visible uniquement dans l'admin, pas côté client                   |
| Sauvegarde      | Toutes les données sont enregistrées (même incomplètes)            |
| Validation      | Les validations obligatoires (DEP-0634) **ne sont pas** appliquées |

### Affichage dans l'admin

- Les brouillons apparaissent dans un onglet « Brouillons » séparé dans la liste des produits.
- Badge « Brouillon » visible sur la miniature du produit.
- Filtre : « Afficher uniquement les brouillons » disponible.

### Règles

- Un brouillon peut être édité et sauvegardé autant de fois que nécessaire.
- Il peut être publié ultérieurement via l'action « Publier » (DEP-0626).
- Un brouillon non publié pendant 90 jours déclenche une notification (non bloquant).

### Validation

- L'action nécessite le rôle `depanneur` ou `admin`.
- Les brouillons ne consomment **pas** de quota produits si un quota existe (futur).

---

## DEP-0626 — Action de publication d'un produit

### Objectif

Permettre au dépanneur de publier un brouillon ou un nouveau produit pour le rendre visible et commandable côté client.

### Comportement

| Élément           | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| Déclenchement     | Bouton « Publier » dans la fiche produit                     |
| État du produit   | `status: published`                                          |
| Validation        | Les validations obligatoires (DEP-0634) **sont appliquées**  |
| Blocage si erreur | Si validation échoue, affichage des erreurs sans publication |
| Visibilité        | Le produit apparaît immédiatement côté client                |

### Validations obligatoires avant publication (DEP-0634)

- Au moins une image présente
- Nom du produit renseigné (≤ 80 caractères)
- Catégorie valide assignée
- Prix > 0 (si applicable)
- Disponibilité définie (`en_stock`, `rupture`, `sur_commande`)

### Affichage dans l'admin

- Le produit passe de l'onglet « Brouillons » à l'onglet « Publiés ».
- Badge « Publié » (vert) visible sur la miniature.

### Règles

- Un produit publié peut être dépublié (retour en brouillon) via le bouton « Retirer de la vente ».
- Dépublier un produit le rend invisible côté client mais conserve toutes ses données.
- Dépublier n'affecte pas les commandes passées incluant ce produit.

### Validation

- L'action nécessite le rôle `depanneur` ou `admin`.
- Les modifications sur un produit publié sont visibles immédiatement côté client après sauvegarde.

---

## DEP-0627 — Page liste des produits admin

### Objectif

Définir la page principale de consultation et gestion des produits dans l'interface d'administration du catalogue.

### Structure de la page

| Zone             | Contenu                                                          | Position desktop          | Position mobile         |
| ---------------- | ---------------------------------------------------------------- | ------------------------- | ----------------------- |
| Header           | Titre « Gestion des produits », bouton « Ajouter un produit »    | Haut — pleine largeur     | Haut — pleine largeur   |
| Barre de filtres | Recherche, filtre catégorie, filtre statut, filtre disponibilité | Sous le header            | Sous le header (empilé) |
| Onglets          | « Tous », « Publiés », « Brouillons », « Indisponibles »         | Sous la barre de filtres  | Scroll horizontal       |
| Zone principale  | Grille ou liste des produits (cartes avec miniature + infos)     | Corps principal           | Corps principal (liste) |
| Pagination       | « Précédent » / « Suivant », indicateur page actuelle            | Bas de la zone principale | Bas (flottant)          |

### Accès

- Interface accessible depuis `/depanneur/catalogue/produits`.
- Rôles autorisés : `depanneur`, `admin`.

### Comportement de la liste

| Élément            | Description                                           |
| ------------------ | ----------------------------------------------------- |
| Tri par défaut     | Ordre d'affichage défini (DEP-0616) puis alphabétique |
| Recherche          | Recherche par nom, SKU, mots-clés, synonymes          |
| Filtres            | Catégorie, statut (publié/brouillon), disponibilité   |
| Actions par carte  | « Modifier », « Dupliquer », « Supprimer »            |
| Sélection multiple | Cases à cocher pour actions groupées (V2)             |

### Affichage des cartes produits

Chaque carte affiche :

- Miniature image principale (150×150 px)
- Nom du produit (tronqué après 40 caractères)
- Catégorie (label)
- Prix (avec unité)
- Badge statut : « Publié », « Brouillon », « Indisponible »
- Badge « Vedette » si applicable

### Actions globales

- « Ajouter un produit » → redirige vers DEP-0628.
- « Exporter le catalogue » → déclenche DEP-0624.
- « Réorganiser » → active le mode glisser-déposer (DEP-0616).

### Validation

- La liste se recharge automatiquement après création, modification ou suppression.
- Les brouillons ont un badge « Brouillon » et un fond légèrement grisé.

---

## DEP-0628 — Page ajout produit admin

### Objectif

Définir la page dédiée à la création d'un nouveau produit dans l'interface d'administration.

### Structure de la page

| Zone                 | Contenu                                              | Position desktop         | Position mobile       |
| -------------------- | ---------------------------------------------------- | ------------------------ | --------------------- |
| Header               | Titre « Ajouter un produit », bouton « Annuler »     | Haut — pleine largeur    | Haut — pleine largeur |
| Formulaire principal | Tous les champs du produit (voir détails ci-dessous) | Colonne principale (70%) | Empilé pleine largeur |
| Panneau actions      | Boutons « Sauvegarder comme brouillon », « Publier » | Colonne droite (30%)     | Flottant en bas       |
| Zone glisser-déposer | Upload des images (DEP-0631)                         | En haut du formulaire    | En haut du formulaire |

### Champs du formulaire

| Champ                   | Type             | Obligatoire | Validation (DEP-0634)                  |
| ----------------------- | ---------------- | ----------- | -------------------------------------- |
| Nom du produit          | Texte            | Oui         | ≤ 80 caractères                        |
| Catégorie               | Liste déroulante | Oui         | Catégorie valide existante             |
| SKU                     | Texte            | Non         | Unique dans le tenant, ≤ 50 caractères |
| Description courte      | Texte            | Non         | 50-80 caractères recommandés           |
| Description longue      | Textarea         | Non         | 150-300 caractères recommandés         |
| Prix                    | Nombre décimal   | Oui         | > 0                                    |
| Unité de vente          | Liste déroulante | Oui         | `piece`, `litre`, `kg`, etc.           |
| Conditionnement         | Texte            | Non         | Ex : « Bouteille 1L », « Paquet de 4 » |
| Disponibilité           | Liste déroulante | Oui         | `en_stock`, `rupture`, `sur_commande`  |
| Mots-clés               | Tags             | Non         | 5-15 mots-clés séparés par `,`         |
| Synonymes parlés        | Tags             | Non         | 5-20 synonymes séparés par `,`         |
| Synonymes téléphoniques | Tags             | Non         | 8-25 synonymes séparés par `,`         |
| Allergènes/notes        | Textarea         | Non         | Texte libre                            |
| Vedette                 | Interrupteur     | Non         | Booléen                                |

### Actions disponibles

- « Annuler » → retour à la liste sans sauvegarder (confirmation si champs remplis).
- « Sauvegarder comme brouillon » → sauvegarde sans validation stricte (DEP-0625).
- « Publier » → validation complète (DEP-0634) puis publication (DEP-0626).

### Règles

- Le formulaire affiche des messages d'aide contextuels (bulles d'info `?`).
- Les champs obligatoires sont marqués d'un astérisque `*`.
- La sauvegarde automatique (brouillon) se déclenche toutes les 2 minutes si modifications.

### Validation

- L'accès nécessite le rôle `depanneur` ou `admin`.
- Après publication, redirection vers la page d'édition du produit (DEP-0629).

---

## DEP-0629 — Page édition produit admin

### Objectif

Définir la page dédiée à la modification d'un produit existant dans l'interface d'administration.

### Structure de la page

Identique à la page d'ajout (DEP-0628) avec les différences suivantes :

| Zone            | Différence par rapport à l'ajout                                            |
| --------------- | --------------------------------------------------------------------------- |
| Header          | Titre « Modifier : [nom du produit] »                                       |
| Formulaire      | Tous les champs pré-remplis avec les valeurs actuelles                      |
| Panneau actions | Boutons « Enregistrer les modifications », « Supprimer »                    |
| Historique      | Section optionnelle : « Dernière modification le [date] par [utilisateur] » |

### Actions disponibles

- « Annuler » → retour à la liste sans sauvegarder les modifications (confirmation si modifié).
- « Enregistrer les modifications » → sauvegarde avec validation stricte si produit publié (DEP-0634).
- « Dupliquer » → crée une copie (DEP-0620).
- « Supprimer » → suppression définitive avec confirmation (modal).
- « Retirer de la vente » → dépublier le produit (retour en brouillon).
- « Publier » → publier le brouillon (DEP-0626) si non publié.

### Règles

- Les modifications sur un produit publié sont appliquées immédiatement côté client.
- Les brouillons peuvent être modifiés sans contraintes de validation strictes.
- La suppression d'un produit est irréversible (modal de confirmation double clic).

### Message de suppression

> « Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible. Les commandes passées incluant ce produit ne seront pas affectées. »

### Validation

- L'accès nécessite le rôle `depanneur` ou `admin`.
- Après enregistrement, message de confirmation : « Produit mis à jour avec succès ».

---

## DEP-0630 — Page catégories admin

### Objectif

Définir la page dédiée à la gestion des catégories du catalogue dans l'interface d'administration.

### Structure de la page

| Zone             | Contenu                                                            | Position desktop      | Position mobile       |
| ---------------- | ------------------------------------------------------------------ | --------------------- | --------------------- |
| Header           | Titre « Gestion des catégories », bouton « Ajouter une catégorie » | Haut — pleine largeur | Haut — pleine largeur |
| Barre de filtres | Recherche par nom de catégorie                                     | Sous le header        | Sous le header        |
| Zone principale  | Liste hiérarchique des catégories (arborescence)                   | Corps principal       | Liste empilée         |
| Panneau détail   | Formulaire d'édition de la catégorie sélectionnée                  | Colonne droite (30%)  | Modal plein écran     |

### Accès

- Interface accessible depuis `/depanneur/catalogue/categories`.
- Rôles autorisés : `depanneur`, `admin`.

### Affichage de la liste

| Élément             | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| Tri par défaut      | Ordre d'affichage défini (DEP-0617) puis alphabétique       |
| Hiérarchie          | Catégories parentes en gras, enfants en retrait (indent)    |
| Actions par ligne   | « Modifier », « Dupliquer », « Supprimer »                  |
| Mode réorganisation | Bouton « Réorganiser » active le glisser-déposer (DEP-0617) |

### Formulaire d'ajout/édition catégorie

| Champ               | Type             | Obligatoire | Validation                            |
| ------------------- | ---------------- | ----------- | ------------------------------------- |
| Nom de la catégorie | Texte            | Oui         | ≤ 60 caractères                       |
| Slug                | Texte            | Oui         | Auto-généré, modifiable, unique       |
| Catégorie parente   | Liste déroulante | Non         | Catégorie existante (pour hiérarchie) |
| Description         | Textarea         | Non         | ≤ 200 caractères                      |
| Icône               | Sélecteur        | Non         | Choix d'icône Lucide ou image         |

### Actions disponibles

- « Ajouter une catégorie » → ouvre le formulaire vide.
- « Modifier » → ouvre le formulaire pré-rempli.
- « Dupliquer » → crée une copie (DEP-0621).
- « Supprimer » → suppression avec confirmation (impossible si des produits y sont associés).
- « Réorganiser » → active le mode glisser-déposer (DEP-0617).

### Règles

- Une catégorie ne peut pas être supprimée si elle contient des produits.
- Option « Déplacer les produits vers… » avant suppression (V2).
- Les catégories enfants suivent automatiquement leur parent lors du glisser-déposer.

### Validation

- L'accès nécessite le rôle `depanneur` ou `admin`.
- Après création/modification, message de confirmation : « Catégorie enregistrée avec succès ».

---

## DEP-0631 — Zone glisser-déposer des images

### Objectif

Définir la zone d'interaction permettant au dépanneur de téléverser et organiser les images des produits.

### Comportement

| Élément              | Description                                                              |
| -------------------- | ------------------------------------------------------------------------ |
| Position             | En haut de la fiche produit (ajout/édition)                              |
| Zone de dépôt        | Rectangle pointillé avec icône « + » et texte « Glisser les images ici » |
| Interaction          | Clic → ouvre l'explorateur de fichiers                                   |
|                      | Glisser-déposer → upload direct des fichiers                             |
| Formats acceptés     | `.jpg`, `.jpeg`, `.png`, `.webp`                                         |
| Taille max par image | 5 Mo                                                                     |
| Nombre max d'images  | 5 images par produit (1 principale + 4 secondaires)                      |

### Affichage après upload

- Les images apparaissent sous forme de miniatures (150×150 px).
- La première image uploadée devient l'image principale (badge « Principale »).
- Les images peuvent être réorganisées par glisser-déposer horizontal.
- Bouton « × » sur chaque miniature pour suppression (DEP-0615).

### Feedback visuel

| Événement            | Feedback                                                                               |
| -------------------- | -------------------------------------------------------------------------------------- |
| Survol zone de dépôt | Bordure bleue animée                                                                   |
| Upload en cours      | Barre de progression par image                                                         |
| Upload réussi        | Miniature apparaît avec animation fade-in                                              |
| Erreur               | Message d'erreur sous la zone : « Format non supporté » ou « Fichier trop volumineux » |

### Règles

- Les images sont uploadées vers le CDN dès le dépôt (pas de sauvegarde manuelle).
- Les URLs des images sont générées automatiquement selon DEP-0261.
- Les images sont optimisées automatiquement (compression WebP 75-90%).

### Accessibilité

- Bouton « Parcourir » visible pour l'upload clavier/lecteur d'écran.
- Annonce : « [N] images uploadées sur 5 maximum ».

### Validation

- Au moins une image est **obligatoire** pour publier un produit (DEP-0634).
- Le rôle `depanneur` ou `admin` est requis.

---

## DEP-0632 — Zone glisser-déposer des produits

### Objectif

Définir la zone d'interaction permettant au dépanneur de réorganiser les produits dans une catégorie par glisser-déposer.

### Comportement

Référence complète : **DEP-0616 — Action de réorganisation des produits par glisser-déposer**.

### Zone active

- Liste des produits dans la page d'édition d'une catégorie ou dans la liste produits filtrée par catégorie.
- Bouton « Mode réorganisation » active/désactive le glisser-déposer.

### Feedback visuel

| Élément              | Description                                               |
| -------------------- | --------------------------------------------------------- |
| Curseur              | Icône « main ouverte » au survol, « main fermée » au clic |
| Produit en mouvement | Ombre portée, opacité 0.8, suit le curseur                |
| Indicateur de dépôt  | Ligne bleue horizontale entre deux produits               |
| Désactivation        | Produits non déplaçables ont un curseur « interdit »      |

### Règles

- L'ordre défini ici remplace l'ordre alphabétique par défaut.
- Sauvegarde automatique dès le relâchement du clic.
- Sur mobile : maintien tactile long (600 ms) active le glisser-déposer.

### Accessibilité

- Clavier : `Ctrl+Flèche Haut/Bas` pour déplacer le produit sélectionné.
- Lecteur d'écran : annonce « Produit [nom] déplacé en position [N] sur [total] ».

### Validation

- L'accès nécessite le rôle `depanneur` ou `admin`.
- Les modifications sont visibles côté client immédiatement après sauvegarde.

---

## DEP-0633 — Zone glisser-déposer des catégories

### Objectif

Définir la zone d'interaction permettant au dépanneur de réorganiser les catégories dans le catalogue par glisser-déposer.

### Comportement

Référence complète : **DEP-0617 — Action de réorganisation des catégories par glisser-déposer**.

### Zone active

- Liste hiérarchique des catégories dans la page « Catégories admin » (DEP-0630).
- Bouton « Mode réorganisation » active/désactive le glisser-déposer.

### Feedback visuel

| Élément                | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| Curseur                | Icône « main ouverte » au survol, « main fermée » au clic  |
| Catégorie en mouvement | Ombre portée, opacité 0.8, suit le curseur                 |
| Indicateur de dépôt    | Ligne bleue horizontale entre deux catégories              |
| Hiérarchie             | Les catégories enfants suivent leur parent automatiquement |

### Règles

- L'ordre défini ici remplace l'ordre alphabétique par défaut.
- Sauvegarde automatique dès le relâchement du clic.
- Les catégories enfants ne peuvent pas être déplacées indépendamment de leur parent en V1.
- Sur mobile : maintien tactile long (600 ms) active le glisser-déposer.

### Accessibilité

- Clavier : `Ctrl+Flèche Haut/Bas` pour déplacer la catégorie sélectionnée.
- Lecteur d'écran : annonce « Catégorie [nom] déplacée en position [N] sur [total] ».

### Validation

- L'accès nécessite le rôle `depanneur` ou `admin`.
- Les modifications sont visibles côté client immédiatement après sauvegarde.

---

## DEP-0634 — Validation des champs produit

### Objectif

Définir les règles de validation appliquées lors de la publication d'un produit pour garantir la cohérence et la qualité du catalogue côté client.

### Validations obligatoires (bloquantes pour publication)

| Champ          | Règle                                               | Message d'erreur                                    |
| -------------- | --------------------------------------------------- | --------------------------------------------------- |
| Nom du produit | Non vide, ≤ 80 caractères                           | « Le nom du produit est obligatoire (max 80 car.) » |
| Catégorie      | Catégorie valide assignée                           | « Veuillez sélectionner une catégorie »             |
| Prix           | Nombre > 0 (si produit payant)                      | « Le prix doit être supérieur à 0 »                 |
| Unité de vente | Valeur définie (`piece`, `litre`, `kg`, etc.)       | « Veuillez sélectionner une unité de vente »        |
| Disponibilité  | État défini (`en_stock`, `rupture`, `sur_commande`) | « Veuillez définir la disponibilité »               |
| Images         | Au moins une image présente                         | « Au moins une image est requise »                  |

### Validations recommandées (avertissements, non bloquantes)

| Champ              | Règle                   | Message d'avertissement                                   |
| ------------------ | ----------------------- | --------------------------------------------------------- |
| Description courte | 50-80 caractères        | « Description courte recommandée : 50-80 car. »           |
| Description longue | 150-300 caractères      | « Description longue recommandée : 150-300 car. »         |
| Mots-clés          | 5-15 mots-clés          | « Ajoutez 5-15 mots-clés pour améliorer la recherche »    |
| Synonymes parlés   | 5-20 synonymes          | « Ajoutez des synonymes pour l'assistant vocal »          |
| Images secondaires | 2-4 images recommandées | « Ajoutez plus d'images pour une meilleure présentation » |

### Validations techniques

| Règle               | Description                                             | Traitement                                          |
| ------------------- | ------------------------------------------------------- | --------------------------------------------------- |
| SKU unique          | Le SKU doit être unique dans le tenant                  | Erreur : « SKU déjà utilisé pour un autre produit » |
| Slug unique         | Le slug doit être unique dans le tenant                 | Erreur : « URL déjà utilisée, modifiez le nom »     |
| Catégorie existante | La catégorie assignée doit exister                      | Erreur : « Catégorie invalide »                     |
| Prix numérique      | Le prix doit être un nombre décimal valide              | Erreur : « Prix invalide »                          |
| Images accessibles  | Les URLs des images doivent être accessibles (HTTP 200) | Avertissement : « Une image est inaccessible »      |

### Affichage des erreurs

- Les erreurs bloquantes apparaissent en rouge sous le champ concerné.
- Les avertissements apparaissent en orange et n'empêchent pas la publication.
- Un résumé des erreurs est affiché en haut du formulaire : « [N] erreurs à corriger avant publication ».

### Comportement

- Les validations sont exécutées au clic sur « Publier » (DEP-0626).
- Les validations **ne sont pas** appliquées lors de la sauvegarde en brouillon (DEP-0625).
- Les validations en temps réel (au remplissage) affichent des indices visuels (bordure verte si valide, rouge si invalide).

### Règles

- Les brouillons peuvent contenir des champs incomplets ou invalides.
- Seuls les produits respectant toutes les validations obligatoires peuvent être publiés.
- Les modifications d'un produit déjà publié appliquent les mêmes validations à l'enregistrement.

### Validation

- Les règles de validation sont cohérentes avec le modèle catalogue (DEP-0241–0255).
- Les conventions contenu (DEP-0256–0270) sont rappelées via des messages d'aide contextuels.

---

## Gel des décisions

Les décisions DEP-0615 à DEP-0634 définissent la base complète de l'administration du catalogue pour la V1. Elles couvrent :

- Les **actions administratives** : suppression, réorganisation, marquage, duplication, clonage, export, brouillons, publication.
- Les **pages principales** : liste produits, ajout produit, édition produit, gestion catégories.
- Les **zones d'interaction** : glisser-déposer images, produits, catégories.
- La **validation** : règles strictes avant publication, flexibilité pour les brouillons.

Ces spécifications serviront de référence pour l'implémentation des interfaces d'administration dans les futures itérations du projet.

---

## Validation finale

- ✅ **DEP-0615** — Action de suppression d'image définie
- ✅ **DEP-0616** — Action de réorganisation des produits définie
- ✅ **DEP-0617** — Action de réorganisation des catégories définie
- ✅ **DEP-0618** — Action de marquage « vedette » définie
- ✅ **DEP-0619** — Action de marquage « indisponible » définie
- ✅ **DEP-0620** — Action de duplication d'un produit définie
- ✅ **DEP-0621** — Action de duplication d'une catégorie définie
- ✅ **DEP-0622** — Action de clonage d'un catalogue définie
- ✅ **DEP-0623** — Action d'import massif (reportée en V2)
- ✅ **DEP-0624** — Action d'export du catalogue définie
- ✅ **DEP-0625** — Action de sauvegarde brouillon définie
- ✅ **DEP-0626** — Action de publication d'un produit définie
- ✅ **DEP-0627** — Page liste des produits admin définie
- ✅ **DEP-0628** — Page ajout produit admin définie
- ✅ **DEP-0629** — Page édition produit admin définie
- ✅ **DEP-0630** — Page catégories admin définie
- ✅ **DEP-0631** — Zone glisser-déposer des images définie
- ✅ **DEP-0632** — Zone glisser-déposer des produits définie
- ✅ **DEP-0633** — Zone glisser-déposer des catégories définie
- ✅ **DEP-0634** — Validation des champs produit définie

**Statut du bloc DEP-0615–0634 : documenté et gelé pour implémentation.**
