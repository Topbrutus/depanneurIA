# DEP-0348 à DEP-0360 — Suivi commande et gel du mode manuel

## Périmètre

Ce document définit les **écrans de confirmation et de suivi de commande**
(confirmation d'envoi, suivi en cours, échec d'envoi), les **sections de
raccourcis boutique** (dernière commande, top 10, recommandations), les
**vérifications de cohérence du panier** à travers les trois modes
d'interaction, et le **gel du mode manuel** comme base de vérité visuelle.

Il conclut le macro-bloc DEP-0321–0360 en **gelant le mode manuel de la
boutique** avant toute extension future (assistant texte, assistant vocal).

Il s'agit exclusivement de **documentation** : aucun code produit, aucune
implémentation. Les spécifications décrites ici serviront de référence pour
les futures implémentations front-end et back-end.

---

## DEP-0348 — Écran confirmation de commande envoyée

### Objectif

Définir l'écran de confirmation affiché immédiatement après l'envoi réussi
d'une commande.

### Contenu de l'écran

| Élément              | Valeur                                                                      |
|----------------------|-----------------------------------------------------------------------------|
| Titre principal      | « Commande envoyée »                                                        |
| Message principal    | « Ta commande a bien été envoyée au dépanneur. »                           |
| Numéro de commande   | Affiché clairement au format `#CMD-XXXX-YYYY` (ex. : `#CMD-2026-0001`)     |
| État de la commande  | « En attente de prise en charge »                                           |
| Temps estimé         | « Le dépanneur prendra ta commande en charge dans les prochaines minutes. » |
| Bouton principal     | « Voir le suivi » (redirige vers DEP-0349)                                  |
| Bouton secondaire    | « Retour à la boutique » (retour à la grille de produits)                   |

### Comportement

- L'écran s'affiche **immédiatement** après l'envoi réussi de la commande.
- Le panier est **vidé automatiquement** après l'envoi.
- Le numéro de commande est **copié automatiquement** dans le presse-papiers.
- L'écran reste affiché tant que le client ne clique pas sur l'un des boutons.
- Un lien vers l'écran de suivi (DEP-0349) est disponible depuis cet écran.

### Design visuel

| Élément               | Spécification                                |
|-----------------------|----------------------------------------------|
| Couleur de fond       | Blanc (#FFFFFF)                              |
| Couleur d'accent      | Vert succès (#10B981)                        |
| Icône principale      | Icône de coche (check) verte                 |
| Typographie titre     | Inter Bold 28px                              |
| Typographie corps     | Inter Regular 16px                           |
| Espacement            | Vertical centré, padding 32px                |

### Accessibilité

- Le titre de la page doit être « Commande envoyée ».
- Le numéro de commande doit être lu par les lecteurs d'écran.
- Le focus clavier doit se placer automatiquement sur le bouton « Voir le suivi ».

---

## DEP-0349 — Écran suivi de commande

### Objectif

Définir l'écran permettant au client de suivre l'état de sa commande en
temps réel.

### Contenu de l'écran

| Élément              | Valeur                                                                      |
|----------------------|-----------------------------------------------------------------------------|
| Titre principal      | « Suivi de commande »                                                       |
| Numéro de commande   | Affiché en haut de l'écran au format `#CMD-XXXX-YYYY`                      |
| État actuel          | « En attente », « Acceptée », « En préparation », « En livraison », « Livrée » |
| Barre de progression | Indicateur visuel de l'avancement (5 étapes)                                |
| Heure de création    | Format `HH:MM` (ex. : « 14:32 »)                                            |
| Produits commandés   | Liste des produits avec quantités                                           |
| Total de la commande | Affiché si le prix est disponible (optionnel V1)                            |
| Bouton principal     | « Retour à la boutique »                                                    |

### Comportement

- L'écran est **accessible à tout moment** depuis le menu principal.
- L'écran affiche uniquement **la dernière commande en cours**.
- Si aucune commande n'est en cours, un message « Aucune commande en cours » est affiché.
- Le client peut **rafraîchir manuellement** l'état en tirant vers le bas (mobile) ou via un bouton « Actualiser » (desktop).
- L'état de la commande est **mis à jour automatiquement** toutes les 30 secondes (polling ou WebSocket).

### Design visuel

| Élément               | Spécification                                |
|-----------------------|----------------------------------------------|
| Couleur de fond       | Blanc (#FFFFFF)                              |
| Couleur d'accent      | Bleu principal (#2563EB)                     |
| Barre de progression  | 5 étapes avec indicateur de position actuel  |
| Typographie titre     | Inter Bold 24px                              |
| Typographie corps     | Inter Regular 14px                           |
| Espacement            | Vertical padding 24px                        |

### États de la commande

| État              | Couleur        | Description                                    |
|-------------------|----------------|------------------------------------------------|
| En attente        | Orange #F59E0B | La commande a été envoyée, en attente du dépanneur |
| Acceptée          | Vert #10B981   | Le dépanneur a accepté la commande              |
| En préparation    | Bleu #2563EB   | Le dépanneur prépare la commande                |
| En livraison      | Indigo #4F46E5 | Le livreur est en route                         |
| Livrée            | Vert #10B981   | La commande a été livrée avec succès            |

### Accessibilité

- Le titre de la page doit être « Suivi de commande ».
- L'état de la commande doit être annoncé par les lecteurs d'écran.
- La barre de progression doit avoir un attribut `aria-valuenow` indiquant l'étape actuelle.

---

## DEP-0350 — Écran échec d'envoi de commande

### Objectif

Définir l'écran affiché lorsque l'envoi d'une commande échoue (erreur réseau,
erreur serveur, validation échouée).

### Contenu de l'écran

| Élément              | Valeur                                                                      |
|----------------------|-----------------------------------------------------------------------------|
| Titre principal      | « Échec d'envoi de commande »                                               |
| Message principal    | « Ta commande n'a pas pu être envoyée. Réessaie dans quelques instants. »  |
| Code erreur          | Affiché si disponible (ex. : `ERR_NETWORK`, `ERR_SERVER_UNAVAILABLE`)      |
| Détails techniques   | Affichés uniquement si utiles (optionnel)                                   |
| Bouton principal     | « Réessayer » (tente de renvoyer la commande)                               |
| Bouton secondaire    | « Annuler » (retour au panier)                                              |

### Comportement

- L'écran s'affiche **immédiatement** après l'échec de l'envoi.
- Le panier **n'est pas vidé** (le client peut réessayer ou modifier sa commande).
- Le bouton « Réessayer » tente de renvoyer la commande avec les mêmes données.
- Si le réessai échoue, l'écran est affiché à nouveau.
- Après 3 tentatives échouées, un message invite le client à contacter le support.

### Design visuel

| Élément               | Spécification                                |
|-----------------------|----------------------------------------------|
| Couleur de fond       | Blanc (#FFFFFF)                              |
| Couleur d'accent      | Rouge erreur (#EF4444)                       |
| Icône principale      | Icône d'alerte (triangle) rouge             |
| Typographie titre     | Inter Bold 24px                              |
| Typographie corps     | Inter Regular 16px                           |
| Espacement            | Vertical centré, padding 32px                |

### Messages d'erreur

| Code erreur              | Message affiché                                                                |
|--------------------------|--------------------------------------------------------------------------------|
| `ERR_NETWORK`            | « Problème de connexion. Vérifie ta connexion internet et réessaie. »         |
| `ERR_SERVER_UNAVAILABLE` | « Le serveur est temporairement indisponible. Réessaie dans quelques instants. » |
| `ERR_ACCOUNT_INCOMPLETE` | « Ton compte est incomplet. Complète tes informations pour continuer. »       |
| `ERR_ZONE_NOT_SERVED`    | « Ton adresse de livraison se trouve hors de notre zone de livraison. »       |
| Autre                    | « Une erreur inattendue s'est produite. Réessaie ou contacte le support. »    |

### Accessibilité

- Le titre de la page doit être « Échec d'envoi de commande ».
- Le message d'erreur doit être annoncé par les lecteurs d'écran avec un rôle `alert`.
- Le focus clavier doit se placer automatiquement sur le bouton « Réessayer ».

---

## DEP-0351 — Section « Dernière commande »

### Objectif

Définir la section affichant les produits de la dernière commande du client
pour faciliter les commandes récurrentes.

### Contenu de la section

| Élément              | Valeur                                                                      |
|----------------------|-----------------------------------------------------------------------------|
| Titre de la section  | « Dernière commande »                                                       |
| Affichage            | Carrousel horizontal de cartes produits                                     |
| Nombre de produits   | Jusqu'à 10 produits de la dernière commande                                 |
| Action par produit   | Bouton « Ajouter au panier »                                                |
| Action globale       | Bouton « Tout recommander » (ajoute tous les produits au panier)            |

### Comportement

- La section est affichée **uniquement si le client a déjà passé au moins une commande**.
- Les produits affichés sont ceux de **la dernière commande terminée** (état « Livrée »).
- Les produits sont affichés **dans l'ordre de la commande précédente**.
- Si un produit n'est plus disponible, il est **grisé** avec la mention « Indisponible ».
- Le bouton « Tout recommander » ajoute **tous les produits disponibles** au panier en une seule action.

### Design visuel

| Élément               | Spécification                                |
|-----------------------|----------------------------------------------|
| Couleur de fond       | Gris clair (#F3F4F6)                         |
| Typographie titre     | Inter Bold 20px                              |
| Espacement            | Padding 16px, gap 12px                       |
| Hauteur section       | 280px (carrousel horizontal)                 |
| Bouton « Ajouter »    | Bleu principal (#2563EB)                     |
| Bouton « Recommander »| Vert positif (#10B981)                       |

### Emplacement

- La section est affichée **en haut de la page boutique**, juste après le champ de recherche.
- Sur mobile, la section occupe toute la largeur de l'écran.
- Sur desktop, la section occupe la largeur de la grille de produits.

### Accessibilité

- Le titre de la section doit être un `<h2>`.
- Chaque carte produit doit avoir un attribut `alt` pour l'image.
- Le bouton « Tout recommander » doit annoncer le nombre de produits ajoutés.

---

## DEP-0352 — Section « Top 10 des plus commandés »

### Objectif

Définir la section affichant les 10 produits les plus commandés par l'ensemble
des clients pour faciliter la découverte de produits populaires.

### Contenu de la section

| Élément              | Valeur                                                                      |
|----------------------|-----------------------------------------------------------------------------|
| Titre de la section  | « Les plus commandés »                                                      |
| Affichage            | Carrousel horizontal de cartes produits                                     |
| Nombre de produits   | 10 produits les plus commandés (global ou par dépanneur)                    |
| Action par produit   | Bouton « Ajouter au panier »                                                |
| Badge produit        | Badge « Populaire » affiché sur chaque carte                                |

### Comportement

- La section est affichée **pour tous les clients**, même ceux sans commande précédente.
- Les produits affichés sont les 10 produits **les plus commandés globalement** (ou par dépanneur si multi-tenant).
- Les produits sont affichés **par ordre décroissant de popularité** (le plus commandé en premier).
- Si un produit n'est plus disponible, il est **remplacé par le suivant dans le classement**.
- La liste des produits populaires est **mise à jour quotidiennement** (batch nocturne).

### Design visuel

| Élément               | Spécification                                |
|-----------------------|----------------------------------------------|
| Couleur de fond       | Blanc (#FFFFFF)                              |
| Typographie titre     | Inter Bold 20px                              |
| Espacement            | Padding 16px, gap 12px                       |
| Hauteur section       | 280px (carrousel horizontal)                 |
| Badge « Populaire »   | Ambre (#F59E0B), position coin supérieur droit |
| Bouton « Ajouter »    | Bleu principal (#2563EB)                     |

### Emplacement

- La section est affichée **après la section « Dernière commande »** (si elle existe).
- Sur mobile, la section occupe toute la largeur de l'écran.
- Sur desktop, la section occupe la largeur de la grille de produits.

### Accessibilité

- Le titre de la section doit être un `<h2>`.
- Le badge « Populaire » doit être annoncé par les lecteurs d'écran.
- Chaque carte produit doit avoir un attribut `alt` pour l'image.

---

## DEP-0353 — Section « Recommandé pour vous »

### Objectif

Définir la section affichant des recommandations personnalisées pour le client,
**uniquement si la logique de recommandation est simple** (V1).

### Contenu de la section

| Élément              | Valeur                                                                      |
|----------------------|-----------------------------------------------------------------------------|
| Titre de la section  | « Recommandé pour toi »                                                     |
| Affichage            | Carrousel horizontal de cartes produits                                     |
| Nombre de produits   | 5 à 10 produits recommandés                                                 |
| Action par produit   | Bouton « Ajouter au panier »                                                |
| Badge produit        | Badge « Recommandé » affiché sur chaque carte                               |

### Comportement

- La section est affichée **uniquement si le client a déjà passé au moins une commande**.
- Les produits recommandés sont basés sur **la dernière commande du client** (produits complémentaires ou similaires).
- **Logique de recommandation V1 (simple)** :
  - Produits de la même catégorie que ceux de la dernière commande.
  - Produits fréquemment commandés ensemble (règles d'association simples).
  - Produits populaires de la même catégorie.
- Si la logique de recommandation est **trop complexe ou nécessite du ML**, cette section est **reportée à la V2**.
- Les produits sont affichés **par ordre de pertinence décroissante**.

### Design visuel

| Élément               | Spécification                                |
|-----------------------|----------------------------------------------|
| Couleur de fond       | Gris clair (#F3F4F6)                         |
| Typographie titre     | Inter Bold 20px                              |
| Espacement            | Padding 16px, gap 12px                       |
| Hauteur section       | 280px (carrousel horizontal)                 |
| Badge « Recommandé »  | Indigo (#4F46E5), position coin supérieur droit |
| Bouton « Ajouter »    | Bleu principal (#2563EB)                     |

### Emplacement

- La section est affichée **après la section « Top 10 des plus commandés »**.
- Sur mobile, la section occupe toute la largeur de l'écran.
- Sur desktop, la section occupe la largeur de la grille de produits.

### Critère de décision V1 vs V2

| Condition                                      | V1  | V2  |
|------------------------------------------------|-----|-----|
| Recommandations basées sur la même catégorie  | ✅   | ✅   |
| Recommandations basées sur la dernière commande | ✅   | ✅   |
| Règles d'association simples (< 5 règles)     | ✅   | ✅   |
| Algorithme de machine learning                 | ❌   | ✅   |
| Analyse de comportement multi-sessions         | ❌   | ✅   |
| Personnalisation par profil client             | ❌   | ✅   |

### Accessibilité

- Le titre de la section doit être un `<h2>`.
- Le badge « Recommandé » doit être annoncé par les lecteurs d'écran.
- Chaque carte produit doit avoir un attribut `alt` pour l'image.

---

## DEP-0354 — Vérifier que le panier reste visible pendant la navigation principale

### Objectif

Vérifier que le panier reste **visible et accessible** à tout moment pendant
la navigation dans la boutique en mode manuel.

### Critères de validation

| Cas de navigation                         | Résultat attendu                                     |
|-------------------------------------------|------------------------------------------------------|
| Navigation entre catégories               | ✅ Panier visible et synchronisé                     |
| Recherche de produits                     | ✅ Panier visible et synchronisé                     |
| Application de filtres                    | ✅ Panier visible et synchronisé                     |
| Ouverture du détail d'un produit          | ✅ Panier visible et synchronisé                     |
| Ajout d'un produit au panier              | ✅ Panier mis à jour immédiatement                   |
| Modification de quantité dans le panier   | ✅ Panier mis à jour immédiatement                   |
| Retrait d'un produit du panier            | ✅ Panier mis à jour immédiatement                   |
| Rechargement de la page                   | ✅ Panier restauré depuis le stockage local          |

### Comportement attendu

- Le panier est **toujours visible** sur desktop (colonne latérale fixe).
- Le panier est **accessible via un bouton flottant** sur mobile (badge avec nombre d'articles).
- Le panier est **synchronisé en temps réel** avec les actions du client.
- Le panier est **persisté localement** (localStorage) pour survivre aux rechargements de page.

### Test de validation

1. Ouvrir la boutique en mode manuel.
2. Ajouter 3 produits au panier.
3. Naviguer entre catégories.
4. Vérifier que le panier contient toujours les 3 produits.
5. Recharger la page.
6. Vérifier que le panier contient toujours les 3 produits.

---

## DEP-0355 — Vérifier que le panier reste visible pendant l'assistance texte

### Objectif

Vérifier que le panier reste **visible et synchronisé** lorsque le client
interagit avec l'assistant texte (DEP-0361 à DEP-0400).

### Critères de validation

| Cas d'interaction                         | Résultat attendu                                     |
|-------------------------------------------|------------------------------------------------------|
| Ajout de produit via l'assistant texte    | ✅ Panier mis à jour immédiatement                   |
| Retrait de produit via l'assistant texte  | ✅ Panier mis à jour immédiatement                   |
| Modification de quantité via l'assistant  | ✅ Panier mis à jour immédiatement                   |
| Affichage du panier via l'assistant       | ✅ Panier affiché avec contenu synchronisé           |
| Ajout de produit manuel pendant l'assistance | ✅ Panier mis à jour immédiatement                   |

### Comportement attendu

- Le panier est **synchronisé entre le mode manuel et l'assistant texte**.
- Les actions de l'assistant texte (ajout, retrait, modification) mettent à jour le panier **immédiatement**.
- Le client peut **basculer entre le mode manuel et l'assistant texte** sans perdre le contenu du panier.

### Test de validation

1. Ouvrir la boutique en mode manuel.
2. Ajouter 2 produits au panier manuellement.
3. Activer l'assistant texte.
4. Demander à l'assistant d'ajouter un 3e produit.
5. Vérifier que le panier contient 3 produits.
6. Revenir au mode manuel.
7. Vérifier que le panier contient toujours 3 produits.

---

## DEP-0356 — Vérifier que le panier reste visible pendant l'assistance vocale

### Objectif

Vérifier que le panier reste **visible et synchronisé** lorsque le client
interagit avec l'assistant vocal web (DEP-0401 à DEP-0440).

### Critères de validation

| Cas d'interaction                         | Résultat attendu                                     |
|-------------------------------------------|------------------------------------------------------|
| Ajout de produit via l'assistant vocal    | ✅ Panier mis à jour immédiatement                   |
| Retrait de produit via l'assistant vocal  | ✅ Panier mis à jour immédiatement                   |
| Modification de quantité via l'assistant  | ✅ Panier mis à jour immédiatement                   |
| Lecture du panier par l'assistant vocal   | ✅ Panier lu avec contenu synchronisé                |
| Ajout de produit manuel pendant l'assistance | ✅ Panier mis à jour immédiatement                   |

### Comportement attendu

- Le panier est **synchronisé entre le mode manuel et l'assistant vocal**.
- Les actions de l'assistant vocal (ajout, retrait, modification) mettent à jour le panier **immédiatement**.
- Le client peut **basculer entre le mode manuel et l'assistant vocal** sans perdre le contenu du panier.

### Test de validation

1. Ouvrir la boutique en mode manuel.
2. Ajouter 2 produits au panier manuellement.
3. Activer l'assistant vocal web.
4. Demander à l'assistant d'ajouter un 3e produit à voix haute.
5. Vérifier que le panier contient 3 produits.
6. Revenir au mode manuel.
7. Vérifier que le panier contient toujours 3 produits.

---

## DEP-0357 — Vérifier que la boutique fonctionne sans assistant

### Objectif

Vérifier que la boutique en mode manuel **fonctionne de bout en bout** sans
activer l'assistant texte ou vocal.

### Critères de validation

| Parcours utilisateur                      | Résultat attendu                                     |
|-------------------------------------------|------------------------------------------------------|
| Navigation par catégories                 | ✅ Fonctionne sans assistant                         |
| Recherche de produits                     | ✅ Fonctionne sans assistant                         |
| Ajout de produits au panier               | ✅ Fonctionne sans assistant                         |
| Modification du panier                    | ✅ Fonctionne sans assistant                         |
| Confirmation du panier                    | ✅ Fonctionne sans assistant                         |
| Envoi de la commande                      | ✅ Fonctionne sans assistant                         |
| Suivi de la commande                      | ✅ Fonctionne sans assistant                         |

### Comportement attendu

- Le client peut **commander de bout en bout** sans jamais activer l'assistant.
- Tous les boutons, filtres, et actions **fonctionnent sans dépendance à l'assistant**.
- L'assistant est **optionnel** : la boutique reste pleinement fonctionnelle sans lui.

### Test de validation

1. Ouvrir la boutique en mode manuel (assistant désactivé).
2. Naviguer par catégories et ajouter 5 produits au panier.
3. Modifier les quantités et retirer un produit.
4. Confirmer le panier.
5. Envoyer la commande.
6. Vérifier que la commande est bien enregistrée et visible dans le suivi.

---

## DEP-0358 — Vérifier que la boutique fonctionne avec assistant

### Objectif

Vérifier que la boutique **fonctionne de bout en bout** en utilisant l'assistant
texte ou vocal pour toutes les actions.

### Critères de validation

| Parcours utilisateur                      | Résultat attendu                                     |
|-------------------------------------------|------------------------------------------------------|
| Recherche de produits via l'assistant     | ✅ Fonctionne avec assistant                         |
| Ajout de produits via l'assistant         | ✅ Fonctionne avec assistant                         |
| Modification du panier via l'assistant    | ✅ Fonctionne avec assistant                         |
| Confirmation du panier via l'assistant    | ✅ Fonctionne avec assistant                         |
| Envoi de la commande via l'assistant      | ✅ Fonctionne avec assistant                         |
| Suivi de la commande via l'assistant      | ✅ Fonctionne avec assistant                         |

### Comportement attendu

- Le client peut **commander de bout en bout** en utilisant uniquement l'assistant.
- Toutes les actions du mode manuel **ont un équivalent conversationnel** dans l'assistant.
- L'assistant peut **lire le panier**, **ajouter des produits**, **modifier des quantités**, et **envoyer la commande**.

### Test de validation

1. Ouvrir la boutique et activer l'assistant texte ou vocal.
2. Demander à l'assistant de rechercher un produit.
3. Demander à l'assistant d'ajouter 3 produits au panier.
4. Demander à l'assistant de lire le contenu du panier.
5. Demander à l'assistant de modifier une quantité.
6. Demander à l'assistant d'envoyer la commande.
7. Vérifier que la commande est bien enregistrée et visible dans le suivi.

---

## DEP-0359 — Vérifier que le même moteur panier sert les trois modes

### Objectif

Vérifier que le **moteur de panier** (logique d'ajout, retrait, modification,
persistance) est **unique et partagé** entre le mode manuel, l'assistant texte
et l'assistant vocal.

### Critères de validation

| Critère                                   | Résultat attendu                                     |
|-------------------------------------------|------------------------------------------------------|
| Le panier est synchronisé entre les 3 modes | ✅ Synchronisation en temps réel                     |
| Les actions manuelles et assistées partagent la même logique | ✅ Une seule source de vérité (state management)     |
| Le panier persiste lors du changement de mode | ✅ Le contenu du panier est conservé                 |
| Les règles de validation sont identiques  | ✅ Mêmes contraintes (quantité max, disponibilité)   |
| Le panier est persisté localement         | ✅ Même mécanisme de persistance (localStorage)      |

### Comportement attendu

- Le panier utilise **un seul state management** (ex. : React Context, Redux, Zustand).
- Toutes les actions (ajout, retrait, modification) passent par **les mêmes fonctions métier**.
- Le panier est **persisté localement** de manière identique pour tous les modes.
- Le changement de mode **ne recharge pas le panier** (pas de perte de données).

### Test de validation

1. Ouvrir la boutique en mode manuel.
2. Ajouter 2 produits au panier manuellement.
3. Activer l'assistant texte.
4. Demander à l'assistant d'ajouter un 3e produit.
5. Activer l'assistant vocal.
6. Demander à l'assistant vocal de lire le panier.
7. Vérifier que le panier contient 3 produits dans les 3 modes.
8. Recharger la page.
9. Vérifier que le panier contient toujours 3 produits.

---

## DEP-0360 — Geler le mode manuel comme base de vérité visuelle

### Objectif

Déclarer le **mode manuel de la boutique** comme **base de vérité visuelle et
fonctionnelle** pour la V1, et geler son périmètre avant d'ajouter d'autres
modes d'interaction.

### Périmètre gelé

Le mode manuel de la boutique (DEP-0321 à DEP-0360) est **gelé** avec les
fonctionnalités suivantes :

| Fonctionnalité                            | État    |
|-------------------------------------------|---------|
| Page boutique avec grille de produits    | ✅ Gelé |
| Navigation par catégories                 | ✅ Gelé |
| Champ de recherche de produits            | ✅ Gelé |
| Filtres (catégorie, disponibilité, popularité) | ✅ Gelé |
| Tri simple de produits                    | ✅ Gelé |
| Carte produit de base                     | ✅ Gelé |
| Action ajouter au panier                  | ✅ Gelé |
| Action voir détail d'un produit           | ✅ Gelé |
| Vue panier (desktop fixe, mobile repliable) | ✅ Gelé |
| Action modifier quantité dans le panier   | ✅ Gelé |
| Action retirer un produit du panier       | ✅ Gelé |
| Action vider le panier                    | ✅ Gelé |
| Action confirmer le panier                | ✅ Gelé |
| Écran récapitulatif avant envoi           | ✅ Gelé |
| Écran confirmation de commande envoyée    | ✅ Gelé |
| Écran suivi de commande                   | ✅ Gelé |
| Écran échec d'envoi de commande           | ✅ Gelé |
| Section « Dernière commande »             | ✅ Gelé |
| Section « Top 10 des plus commandés »     | ✅ Gelé |
| Section « Recommandé pour vous » (simple) | ✅ Gelé si simple, sinon V2 |

### Définition de « gelé »

Un élément **gelé** signifie :

- ✅ Son comportement et son design sont **définis et documentés**.
- ✅ Son périmètre fonctionnel est **complet pour la V1**.
- ✅ Son implémentation peut commencer **sans attendre d'autres définitions**.
- ❌ Aucune nouvelle fonctionnalité ne sera ajoutée au mode manuel avant la V2.
- ❌ Les évolutions futures (assistant texte, assistant vocal) ne modifient **pas** le mode manuel gelé.

### Critères de validation du gel

| Critère                                   | Résultat attendu                                     |
|-------------------------------------------|------------------------------------------------------|
| Toutes les fonctionnalités sont documentées | ✅ DEP-0321 à DEP-0360 complets                      |
| Le mode manuel fonctionne de bout en bout | ✅ Validé par DEP-0357                               |
| Le panier est synchronisé entre les modes | ✅ Validé par DEP-0359                               |
| Le design visuel est défini               | ✅ Référence : DEP-0201 à DEP-0240                   |
| Les tests de validation sont écrits       | ✅ Critères de validation définis dans DEP-0354 à DEP-0359 |

### Extensions futures (hors gel V1)

Les extensions suivantes sont **hors périmètre du gel V1** et seront traitées
dans des blocs ultérieurs ou en V2 :

| Extension                                 | Bloc concerné    | V1 | V2 |
|-------------------------------------------|------------------|----|-----|
| Assistant texte (chat)                    | DEP-0361 à DEP-0400 | ✅  |     |
| Assistant vocal web (push-to-talk)        | DEP-0401 à DEP-0440 | ✅  |     |
| Agent vocal téléphonique (GPT Call)       | DEP-0441 à DEP-0480 | ✅  |     |
| Recommandations avancées (ML)             | Futur            | ❌  | ✅  |
| Historique de commandes complet           | Futur            | ❌  | ✅  |
| Paiement en ligne                         | Futur            | ❌  | ✅  |
| Programme de fidélité                     | Futur            | ❌  | ✅  |

### Validations finales avant gel

Avant de considérer le mode manuel comme gelé, les validations suivantes
doivent être effectuées :

- ✅ DEP-0321 à DEP-0360 : Toutes les tâches documentées.
- ✅ DEP-0354 à DEP-0359 : Tous les tests de cohérence passés.
- ✅ Design visuel : Références complètes dans DEP-0201 à DEP-0240.
- ✅ Accessibilité : Critères définis pour tous les écrans et composants.

---

## Conclusion

Ce document **gèle le mode manuel de la boutique** (DEP-0321 à DEP-0360) comme
**base de vérité visuelle et fonctionnelle** pour la V1.

Les écrans de confirmation, de suivi et d'échec de commande sont définis (DEP-0348 à DEP-0350).
Les sections de raccourcis boutique (dernière commande, top 10, recommandations) sont définies (DEP-0351 à DEP-0353).
Les vérifications de cohérence du panier à travers les trois modes sont définies (DEP-0354 à DEP-0359).
Le gel du mode manuel est acté (DEP-0360).

Le mode manuel constitue désormais **la fondation stable** sur laquelle l'assistant
texte (DEP-0361 à DEP-0400) et l'assistant vocal (DEP-0401 à DEP-0440) pourront
être ajoutés sans modifier le comportement de base de la boutique.

---

## Références

- **DEP-0201 à DEP-0240** — Système visuel de base (couleurs, typographie, composants)
- **DEP-0241 à DEP-0280** — Structure catalogue et conventions contenu
- **DEP-0281 à DEP-0320** — Inscription, connexion et gestion client
- **DEP-0321 à DEP-0347** — Boutique manuelle, panier, persistance
- **DEP-0348 à DEP-0360** — Suivi commande et gel du mode manuel (ce document)

---

## Historique

| Date       | Auteur      | Description                                      |
|------------|-------------|--------------------------------------------------|
| 2026-03-13 | Claude Code | Création initiale du document DEP-0348 à DEP-0360 |
