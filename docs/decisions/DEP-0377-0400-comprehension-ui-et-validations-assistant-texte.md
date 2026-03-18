# DEP-0377 à DEP-0400 — Compréhension, UI et validations de l'assistant texte

## Périmètre

Ce document définit les **logiques de compréhension** de l'assistant texte
(catégorie, marque, parfum, quantité, correction, retrait, remplacement,
commande incomplète, ambiguïtés), les **composants UI** de l'interface de
chat (boîte, entrée texte, bouton envoi, bouton micro, suggestions), et les
**validations comportementales** qui garantissent que l'assistant respecte
les règles fondamentales de depaneurIA.

Il conclut le macro-bloc DEP-0361–DEP-0400 en **gelant le comportement V1
de l'assistant texte**.

Principe directeur : **l'assistant pilote la boutique, il ne remplace pas
la boutique.** Il déclenche des fonctions, ne génère pas de données libres.

Il s'agit exclusivement de **documentation** : aucun code produit, aucune
implémentation.

---

## DEP-0377 — Logique de compréhension d'une catégorie simple

### Objectif

Définir comment l'assistant interprète une demande portant sur une catégorie
de produits exprimée en langage naturel.

### Règles d'interprétation

| Entrée client               | Interprétation                              | Action déclenchée       |
|-----------------------------|---------------------------------------------|-------------------------|
| « Je veux des boissons »    | Catégorie = `boissons`                      | `ACTION_FILTER` catégorie|
| « Montre-moi les snacks »   | Catégorie = `snacks`                        | `ACTION_FILTER` catégorie|
| « Quelque chose à boire »   | Catégorie = `boissons` (synonyme)           | `ACTION_FILTER` catégorie|
| « J'ai faim »               | Trop vague — pas de catégorie identifiable  | Basculer vers DEP-0371  |

### Mécanisme

1. L'assistant compare le terme saisi aux `label`, `tags` et synonymes
   des catégories du catalogue (DEP-0241, DEP-0245, DEP-0246).
2. Si une correspondance unique est trouvée → `ACTION_FILTER` sur cette
   catégorie.
3. Si plusieurs catégories correspondent → clarification (DEP-0368).
4. Si aucune catégorie ne correspond → relance (DEP-0371).

### Règles

- La correspondance n'est pas sensible à la casse ni aux accents.
- L'assistant ne crée jamais une catégorie absente du catalogue.
- La catégorie identifiée doit exister et contenir au moins un produit actif.

---

## DEP-0378 — Logique de compréhension d'une marque simple

### Objectif

Définir comment l'assistant interprète une demande portant sur une marque
de produit spécifique.

### Règles d'interprétation

| Entrée client          | Interprétation                                | Action déclenchée              |
|------------------------|-----------------------------------------------|--------------------------------|
| « Du Pepsi »           | Marque = `Pepsi`                              | `ACTION_SEARCH` marque=Pepsi   |
| « Un Coca »            | Marque = `Coca-Cola` (synonyme)               | `ACTION_SEARCH` marque=Coca-Cola|
| « De la Red Bull »     | Marque = `Red Bull`                           | `ACTION_SEARCH` marque=Red Bull|
| « Une boisson connue » | Marque non identifiable                       | Basculer vers DEP-0371         |

### Mécanisme

1. L'assistant compare le terme au champ `brand` des produits (DEP-0242)
   et aux synonymes de marque (DEP-0246, `context = "marque"`).
2. Si une marque unique est identifiée → `ACTION_SEARCH` avec filtre marque.
3. Si plusieurs marques correspondent → clarification (DEP-0368).
4. Si la marque est introuvable dans le catalogue → DEP-0370 (refus produit
   absent).

### Règles

- L'assistant n'invente pas de marque ni ne suggère une marque absente du
  catalogue.
- Les abréviations et formes orales sont prises en compte via les synonymes
  (DEP-0246).

---

## DEP-0379 — Logique de compréhension d'un parfum simple

### Objectif

Définir comment l'assistant interprète une demande portant sur un parfum,
une saveur ou un goût de produit.

### Règles d'interprétation

| Entrée client              | Interprétation                              | Action déclenchée               |
|----------------------------|---------------------------------------------|---------------------------------|
| « Du Pepsi cerise »        | Marque = Pepsi, parfum = cerise             | `ACTION_SEARCH` marque + parfum |
| « Chips saveur ketchup »   | Catégorie = chips, parfum = ketchup         | `ACTION_SEARCH` catégorie + parfum|
| « Quelque chose de sucré » | Trop vague — parfum non identifiable        | Basculer vers DEP-0371          |

### Mécanisme

1. Le parfum est interprété comme un modificateur du produit ou de la variante
   (champ `label` de la variante, DEP-0243, ou synonymes DEP-0246,
   `context = "gout"`).
2. Si le produit + parfum est identifié sans ambiguïté → `ACTION_SHOW_PRODUCT`.
3. Si plusieurs variantes correspondent → clarification (DEP-0368).
4. Si aucun résultat → DEP-0370.

### Règles

- Le parfum/saveur est toujours traité comme un complément, jamais comme
  critère principal isolé.
- L'assistant ne préjuge pas du parfum si non exprimé — il propose la variante
  par défaut (DEP-0243 `is_default = true`).

---

## DEP-0380 — Logique de compréhension d'une quantité simple

### Objectif

Définir comment l'assistant interprète une quantité exprimée dans une demande
client.

### Règles d'interprétation

| Entrée client                | Quantité extraite | Comportement                               |
|------------------------------|-------------------|--------------------------------------------|
| « Un Pepsi »                 | 1                 | Ajout de 1 unité                           |
| « Deux Pepsi »               | 2                 | Ajout de 2 unités                          |
| « 3 canettes de Coca »       | 3                 | Ajout de 3 unités                          |
| « Beaucoup de chips »        | Non déterminable  | Demander clarification quantité            |
| « Quelques bouteilles »      | Non déterminable  | Demander clarification quantité            |

### Mécanisme

1. L'assistant extrait le nombre exprimé en chiffres ou en lettres (un, deux,
   trois… jusqu'à 99).
2. Si aucune quantité n'est exprimée → quantité = 1 par défaut (DEP-0331).
3. Si la quantité est vague ou non numérique → demander clarification
   (ex. : « Tu en veux combien ? »).
4. La quantité extraite est passée à `ACTION_ADD_TO_CART` (DEP-0362).

### Règles

- Quantité minimale : 1. Quantité maximale en V1 : 99.
- L'assistant n'applique pas de quantité supérieure à celle exprimée
  explicitement.
- La gestion des packs (ex. « un pack de 6 ») est traitée via le champ
  `pack_quantity` de la variante (DEP-0243), pas via la quantité demandée.

---

## DEP-0381 — Logique de compréhension d'une correction client

### Objectif

Définir comment l'assistant interprète une correction apportée par le client
sur une action précédemment réalisée.

### Exemples de corrections

| Entrée client                           | Interprétation                                  |
|-----------------------------------------|-------------------------------------------------|
| « Non, je voulais du Coca, pas Pepsi »  | Retirer Pepsi, chercher Coca                    |
| « Pas ça, l'autre format »              | Afficher les autres variantes du même produit   |
| « Annule ce que tu viens d'ajouter »    | Retirer le dernier produit ajouté               |
| « En fait non »                         | Annuler la dernière action de l'assistant       |

### Mécanisme

1. L'assistant détecte les mots-clés de correction (`non`, `pas ça`, `annule`,
   `en fait`, `plutôt`, `à la place`).
2. Il identifie l'action du tour précédent.
3. Il annule l'action : si un ajout au panier a eu lieu → `ACTION_UPDATE_QTY`
   à 0 (retrait effectif) ou `ACTION_SEARCH` sur le produit corrigé.
4. Il confirme la correction : « Compris ! J'ai retiré [produit]. »

### Règles

- La correction porte uniquement sur l'action **immédiatement précédente**.
- L'assistant ne peut corriger que les actions de la session en cours.
- Si la correction est ambiguë → demander clarification (DEP-0368).

---

## DEP-0382 — Logique de compréhension d'un retrait de produit

### Objectif

Définir comment l'assistant interprète une demande de retrait d'un produit
du panier.

### Exemples

| Entrée client                   | Interprétation                                   |
|---------------------------------|--------------------------------------------------|
| « Retire le Pepsi »             | Retirer Pepsi du panier (quantité → 0)           |
| « Enlève les chips »            | Retirer les chips du panier                      |
| « Je ne veux plus le Coca »     | Retirer Coca du panier                           |
| « Vide mon panier »             | Retirer tous les produits du panier              |

### Mécanisme

1. L'assistant identifie le produit à retirer dans le panier actuel.
2. Si le produit est dans le panier → `ACTION_UPDATE_QTY` à 0.
3. Si le produit n'est pas dans le panier → répondre :
   « Ce produit n'est pas dans ton panier. »
4. Si « vide mon panier » → `ACTION_SHOW_CART` puis confirmation avant
   vidage total.

### Règles

- Le retrait est toujours précédé d'une **confirmation implicite** dans la
  réponse de l'assistant (ex. : « Retiré ! »).
- Le vidage total du panier nécessite une confirmation explicite du client
  avant exécution.
- L'assistant ne peut retirer que des produits présents dans le panier actif.

---

## DEP-0383 — Logique de compréhension d'un remplacement de produit

### Objectif

Définir comment l'assistant interprète une demande de remplacement d'un
produit par un autre dans le panier.

### Exemples

| Entrée client                           | Interprétation                                  |
|-----------------------------------------|-------------------------------------------------|
| « Remplace le Pepsi par du Coca »       | Retirer Pepsi, ajouter Coca (même quantité)     |
| « Change le format, je veux le grand »  | Retirer variante actuelle, ajouter grande variante|
| « Plutôt des chips sel que ketchup »    | Retirer chips ketchup, ajouter chips sel        |

### Mécanisme

1. L'assistant identifie le produit **à retirer** et le produit **à ajouter**.
2. Il vérifie que le produit à retirer est dans le panier.
3. Il vérifie que le produit de remplacement est disponible dans le catalogue.
4. Il exécute dans cet ordre :
   - `ACTION_UPDATE_QTY` à 0 sur le produit retiré.
   - `ACTION_ADD_TO_CART` sur le produit ajouté (même quantité que le retiré).
5. Il confirme : « J'ai remplacé [produit A] par [produit B]. »

### Règles

- Si le produit de remplacement est introuvable → DEP-0370.
- Si le produit à retirer n'est pas dans le panier → signaler l'erreur et
  proposer uniquement l'ajout du nouveau produit.
- La quantité du produit retiré est conservée pour le produit ajouté.

---

## DEP-0384 — Logique de compréhension d'une commande incomplète

### Objectif

Définir comment l'assistant gère une tentative de commande avec un panier
vide ou un compte incomplet.

### Cas couverts

| Situation                        | Réponse de l'assistant                                             |
|----------------------------------|--------------------------------------------------------------------|
| Panier vide + demande commande   | « Ton panier est vide. Ajoute d'abord des articles. »              |
| Client non connecté              | « Pour commander, connecte-toi d'abord à ton compte. »            |
| Adresse de livraison manquante   | « Il manque une adresse de livraison. Ajoute-la dans ton profil. » |
| Compte incomplet (DEP-0313)      | « Ton compte est incomplet. Complète ton profil pour continuer. »  |

### Mécanisme

1. Avant de déclencher `ACTION_CONFIRM_ORDER`, l'assistant vérifie :
   - Panier non vide.
   - Client connecté.
   - Adresse de livraison présente.
2. Si une vérification échoue → message d'erreur adapté + orientation vers
   l'action corrective.
3. L'assistant ne tente pas de déclencher `ACTION_CONFIRM_ORDER` si une
   condition bloquante est identifiée.

### Règles

- Les conditions sont vérifiées dans l'ordre listé ci-dessus (panier en
  premier).
- Une seule condition bloquante est signalée par tour (pas de liste d'erreurs
  simultanées).

---

## DEP-0385 — Logique d'ambiguïté « chips ketchup » avec plusieurs marques

### Objectif

Définir comment l'assistant gère le cas où un produit générique (ex. : chips
ketchup) correspond à plusieurs marques différentes dans le catalogue.

### Scénario

- Le client demande : « Je veux des chips ketchup. »
- Le catalogue contient : Lay's ketchup, Pringles ketchup, Doritos ketchup.

### Mécanisme

1. L'assistant identifie : catégorie = chips, parfum = ketchup, marque =
   indéterminée.
2. Il déclenche `ACTION_SEARCH` avec les critères identifiés.
3. Il affiche les résultats via `ACTION_SHOW_POPULAR` ou liste filtrée et
   déclenche la clarification (DEP-0368) :
   « J'ai trouvé [N] chips ketchup. Tu veux lequel ? »
4. Le client sélectionne → `ACTION_ADD_TO_CART` ou `ACTION_SHOW_PRODUCT`.

### Règles

- Maximum 4 marques proposées en clarification.
- Si plus de 4 résultats → afficher les 4 les mieux classés (popularité ou
  ordre catalogue).
- L'assistant ne choisit jamais une marque sans confirmation du client.

---

## DEP-0386 — Logique d'ambiguïté « Pepsi » avec plusieurs formats

### Objectif

Définir comment l'assistant gère le cas où un produit identifié par sa marque
existe en plusieurs formats (variantes) dans le catalogue.

### Scénario

- Le client demande : « Un Pepsi. »
- Le catalogue contient : Pepsi 355ml, Pepsi 591ml, Pepsi 2L, Pepsi 6× 355ml.

### Mécanisme

1. L'assistant identifie : marque = Pepsi, format = indéterminé.
2. Si la variante par défaut est clairement définie (`is_default = true`,
   DEP-0243) → proposer directement la variante par défaut avec confirmation.
   Ex. : « J'ai trouvé du Pepsi 355ml. C'est bien ça ? »
3. Si aucune variante par défaut n'est définie ou si le catalogue contient
   plusieurs variantes actives → clarification (DEP-0368) :
   « Tu veux quel format ? 355ml, 591ml ou 2L ? »
4. Le client confirme ou choisit → `ACTION_ADD_TO_CART`.

### Règles

- La variante par défaut est toujours proposée en premier.
- Maximum 3 formats proposés en clarification sans scroll.
- En V1, le catalogue Pepsi contient une variante principale — ce cas reste
  préventif pour les évolutions futures.

---

## DEP-0387 — Logique d'ambiguïté « du lait » avec plusieurs sortes

### Objectif

Définir comment l'assistant gère le cas d'un produit générique (ex. : lait)
disponible en plusieurs variétés ou formats.

### Scénario

- Le client demande : « Du lait. »
- Le catalogue contient : lait entier 1L, lait demi-écrémé 1L, lait écrémé 1L,
  lait de soya 946ml.

### Mécanisme

1. L'assistant identifie : catégorie = produits laitiers, produit = lait,
   variété = indéterminée.
2. Il déclenche `ACTION_SEARCH` → plusieurs résultats.
3. Il déclenche la clarification (DEP-0368) en proposant les distinctions
   pertinentes :
   « Tu veux du lait entier, demi-écrémé, écrémé ou végétal ? »
4. Le client répond → affinage ou `ACTION_ADD_TO_CART`.

### Règles

- La clarification porte sur l'axe de distinction le plus significatif
  (type de lait avant format de contenant).
- Maximum 4 options par niveau de clarification.
- Si le client répond par une exclusion (« pas écrémé ») → affiner la liste
  et relancer la clarification.
- En V1, ce cas s'applique à tous les produits dont le catalogue contient
  plus d'une variante active sans variante par défaut claire.

---

## DEP-0388 — Boîte de chat de l'assistant

### Objectif

Définir la structure et le comportement du conteneur principal de l'interface
de chat de l'assistant texte.

### Structure

| Élément              | Description                                                    |
|----------------------|----------------------------------------------------------------|
| Emplacement desktop  | Section 3 (droite), sous le panier (DEP-0184)                  |
| Emplacement mobile   | Panneau déployable depuis l'icône flottante (DEP-0187)         |
| Hauteur desktop      | Fixe — occupe l'espace résiduel sous le panier                 |
| Hauteur mobile       | 70% de la hauteur d'écran en mode déployé                      |
| Structure interne    | Zone messages (scrollable) + zone saisie (fixe en bas)         |
| Ordre des messages   | Chronologique, le plus récent en bas                           |

### Comportement

- La boîte de chat est visible uniquement si le mode assisté est actif
  (DEP-0299).
- En mode manuel, la boîte de chat n'est pas affichée.
- Le scroll de la zone messages est automatique vers le bas à chaque nouveau
  message.
- L'historique de la session est conservé tant que la session est ouverte.
  À la fermeture (DEP-0376), l'historique est effacé.

### États

| État             | Description visuelle                                          |
|------------------|---------------------------------------------------------------|
| Actif            | Boîte visible, entrée texte active                            |
| Chargement       | Indicateur de frappe animé (trois points) pendant le traitement|
| Fermé            | Boîte masquée ou réduite à l'icône (mobile)                   |

---

## DEP-0389 — Entrée texte du client

### Objectif

Définir le champ de saisie texte dans lequel le client tape ses demandes à
l'assistant.

### Structure

| Attribut           | Valeur                                                         |
|--------------------|----------------------------------------------------------------|
| Type               | Champ texte mono-ligne (extensible à 3 lignes si long texte)  |
| Placeholder        | « Écris ta demande… »                                          |
| Longueur max       | 280 caractères                                                 |
| Emplacement        | Bas de la boîte de chat, à gauche du bouton envoi              |
| Largeur            | Pleine largeur disponible (hors bouton envoi et micro)         |

### Comportement

| Action                   | Résultat                                                     |
|--------------------------|--------------------------------------------------------------|
| Saisie libre             | Affichage en temps réel dans le champ                        |
| Touche Entrée            | Envoi du message (équivalent bouton envoi)                   |
| Maj + Entrée             | Saut de ligne (si multi-ligne activé)                        |
| Champ vide + Entrée      | Aucune action — bouton envoi désactivé                       |
| Après envoi              | Champ vidé automatiquement, focus maintenu                   |

### Règles

- Le champ est toujours actif tant que la session est ouverte.
- Aucune auto-complétion ni suggestion de frappe prédictive en V1.
- La saisie est désactivée pendant le traitement de la réponse (indicateur
  de chargement actif, DEP-0388).

---

## DEP-0390 — Bouton d'envoi texte

### Objectif

Définir le bouton permettant au client d'envoyer son message à l'assistant.

### Structure

| Attribut     | Valeur                                                          |
|--------------|-----------------------------------------------------------------|
| Forme        | Bouton carré compact, icône flèche envoi (→ ou ↑)              |
| Emplacement  | À droite du champ de saisie, dans la zone saisie               |
| Couleur      | `--color-primary` (actif) / grisé (inactif)                    |
| Label        | Icône uniquement (pas de texte), `aria-label="Envoyer"`        |

### États

| État        | Condition                        | Apparence                    |
|-------------|----------------------------------|------------------------------|
| Actif       | Champ de saisie non vide         | Couleur primaire, cliquable  |
| Inactif     | Champ de saisie vide             | Grisé, non cliquable         |
| Chargement  | Réponse en cours de traitement   | Spinner ou désactivé          |

### Comportement

- Clic → envoi du message → vidage du champ → indicateur de chargement.
- Le bouton est désactivé tant que la réponse précédente n'est pas reçue.

---

## DEP-0391 — Bouton micro du mode assisté écran

### Objectif

Définir le bouton micro permettant au client d'activer la saisie vocale dans
le mode assisté (réservé au mode assisté, absent du mode manuel).

### Structure

| Attribut     | Valeur                                                          |
|--------------|-----------------------------------------------------------------|
| Forme        | Bouton carré compact, icône micro 🎤                            |
| Emplacement  | À droite du bouton envoi, dans la zone saisie                  |
| Couleur      | `--color-neutral` (inactif) / `--color-accent` (en écoute)     |
| Label        | Icône uniquement, `aria-label="Activer le micro"`              |

### États

| État        | Condition                  | Apparence                             |
|-------------|----------------------------|---------------------------------------|
| Disponible  | Micro non actif            | Icône neutre, cliquable               |
| En écoute   | Micro actif (enregistrement)| Icône colorée + animation pulse       |
| Traitement  | Audio en cours de traitement| Spinner, désactivé                   |
| Indisponible| Permissions micro refusées | Icône grisée + tooltip explicatif     |

### Comportement

- Clic → demande de permission micro (si non accordée).
- Permission accordée → démarrage de l'enregistrement.
- Fin de l'énoncé détectée (silence > 1,5s) → arrêt automatique + transcription.
- La transcription est injectée dans le champ de saisie (DEP-0389) avant envoi.
- Le client peut modifier la transcription avant d'envoyer.

### Règles

- Ce bouton est **absent en mode manuel** (DEP-0321).
- Pas d'envoi automatique de la transcription sans action du client.

---

## DEP-0392 — Affichage des suggestions produits de l'assistant

### Objectif

Définir comment l'assistant affiche les produits qu'il suggère en réponse
à une demande ou une clarification.

### Structure des suggestions

| Attribut            | Valeur                                                        |
|---------------------|---------------------------------------------------------------|
| Emplacement desktop | Section suggestions (DEP-0185), sous le panier               |
| Emplacement mobile  | Bandeau horizontal scrollable au-dessus de la zone saisie    |
| Format              | Cartes produits compactes (mini-version de DEP-0330)          |
| Nombre affiché      | 2 à 4 suggestions maximum                                     |
| Contenu d'une carte | Photo, nom, prix, bouton « Ajouter »                         |

### Comportement

- Les suggestions apparaissent après une réponse de l'assistant qui identifie
  des produits (recherche, clarification, populaires).
- Elles remplacent les suggestions précédentes à chaque nouveau résultat.
- Elles sont effacées après sélection (DEP-0394) ou mise à jour du panier
  (DEP-0395).

### Règles

- Les suggestions affichées sont exclusivement des produits du catalogue actif.
- L'assistant n'affiche jamais un produit sans `id` valide dans le catalogue.
- Les produits en rupture peuvent apparaître dans les suggestions mais leur
  bouton « Ajouter » est désactivé (DEP-0326).

---

## DEP-0393 — Action de clic sur une suggestion proposée par l'assistant

### Objectif

Définir le comportement déclenché quand le client clique sur une carte
de suggestion.

### Zones de clic

| Zone cliquée           | Action déclenchée                                  |
|------------------------|----------------------------------------------------|
| Corps de la carte      | `ACTION_SHOW_PRODUCT` — ouverture du détail        |
| Bouton « Ajouter »     | `ACTION_ADD_TO_CART` — ajout direct au panier      |

### Comportement après clic « Ajouter »

1. Ajout de 1 unité au panier.
2. Animation flyout vers l'icône panier.
3. Badge panier incrémenté.
4. Réduction des suggestions (DEP-0394).
5. L'assistant confirme dans le chat (DEP-0369).

### Règles

- Le comportement est identique à un ajout depuis la grille produits
  (DEP-0331).
- Le client n'est pas obligé de cliquer sur une suggestion — il peut continuer
  à taper dans le chat.

---

## DEP-0394 — Réduction des suggestions après sélection d'un produit

### Objectif

Définir ce qui se passe avec la zone de suggestions après qu'un produit a
été sélectionné ou ajouté.

### Comportement

| Action du client                    | Résultat sur les suggestions                              |
|-------------------------------------|-----------------------------------------------------------|
| Clic « Ajouter » sur une suggestion | La suggestion cliquée disparaît, les autres restent       |
| Ajout de tous les produits suggérés | Zone de suggestions vidée                                 |
| Nouvelle demande dans le chat       | Zone de suggestions remplacée par les nouveaux résultats  |
| Clic sur le corps (voir détail)     | Suggestions maintenues pendant l'ouverture du modal       |

### Règles

- La réduction est animée (fade-out 150ms sur la carte retirée).
- Si une seule suggestion reste après réduction, elle reste affichée.
- La zone de suggestions n'est jamais vide avec un contenu partiel — si
  toutes les suggestions sont sélectionnées, la zone disparaît complètement.

---

## DEP-0395 — Fermeture des suggestions quand le panier se met à jour

### Objectif

Définir les conditions dans lesquelles la zone de suggestions se ferme
automatiquement suite à une mise à jour du panier.

### Déclencheurs de fermeture automatique

| Déclencheur                              | Résultat                              |
|------------------------------------------|---------------------------------------|
| Ajout d'un produit via l'assistant       | Fermeture après animation flyout      |
| Ajout d'un produit via la grille         | Fermeture immédiate des suggestions   |
| Retrait d'un produit du panier           | Les suggestions restent affichées     |
| Vidage complet du panier                 | Les suggestions restent affichées     |
| Validation de la commande               | Fermeture + réinitialisation des suggestions |

### Animation de fermeture

- Fade-out de la zone de suggestions (200ms).
- La zone disparaît visuellement avant que le bandeau s'effondre (collapse
  animé 150ms).

### Règles

- La fermeture n'efface pas l'historique du chat.
- Le client peut demander à nouveau des suggestions en tapant une nouvelle
  demande.

---

## DEP-0396 — Vérifier que l'assistant n'invente jamais un produit absent du catalogue

### Objectif

Valider que l'assistant texte ne génère jamais le nom, la description ou
les caractéristiques d'un produit non présent dans le catalogue actif du
tenant.

### Règle fondamentale

> L'assistant ne connaît que ce que le catalogue lui fournit. Il ne complète
> pas, n'invente pas, ne génère pas de données produit.

### Vérifications

| Vérification                                         | Résultat attendu                               |
|------------------------------------------------------|------------------------------------------------|
| Produit demandé présent dans le catalogue            | ✅ Affiché via `ACTION_SHOW_PRODUCT`           |
| Produit demandé absent du catalogue                  | ✅ DEP-0370 — refus + alternative proposée     |
| Produit demandé retiré (archivé, DEP-0251)           | ✅ Traité comme absent — DEP-0370              |
| Assistant invente un produit non référencé           | ❌ Comportement interdit — violation DEP-0363  |
| Assistant décrit un produit avec des données erronées| ❌ Comportement interdit — violation DEP-0363  |

### Mécanisme de contrôle

- Toute référence à un produit dans une réponse de l'assistant doit provenir
  d'un `id` de produit ou de variante valide dans le catalogue (DEP-0242,
  DEP-0243).
- L'assistant ne génère pas de texte libre décrivant un produit — il utilise
  les champs `label`, `brand`, `description` du catalogue.

---

## DEP-0397 — Vérifier que l'assistant n'invente jamais un prix public non prévu

### Objectif

Valider que l'assistant texte n'affiche ni ne suggère jamais un prix qui ne
provient pas directement de la boutique.

### Règle fondamentale

> Les prix affichés dans l'interface de l'assistant sont toujours ceux de
> la boutique. L'assistant ne calcule pas, n'estime pas, ne génère pas de prix.

### Vérifications

| Vérification                                       | Résultat attendu                                   |
|----------------------------------------------------|----------------------------------------------------|
| Prix affiché dans une suggestion                   | ✅ Provient de la variante du catalogue (DEP-0255)  |
| Assistant cite un prix en réponse textuelle        | ❌ Comportement interdit — le prix est sur la carte |
| Prix affiché après changement de variante          | ✅ Mis à jour depuis la boutique                    |
| Prix calculé par l'assistant (total panier, etc.)  | ❌ Comportement interdit — le total est dans le panier|

### Règles

- L'assistant ne mentionne jamais un montant en euros ou en dollars dans ses
  phrases texte.
- Le prix est exclusivement affiché dans les composants visuels de la boutique
  (carte produit, modal détail, panier).
- En cas de doute, l'assistant oriente vers la carte produit ou le panier.

---

## DEP-0398 — Vérifier que l'assistant pilote la boutique au lieu de la remplacer

### Objectif

Valider que l'assistant texte agit toujours comme un pilote de l'interface
existante, et ne substitue jamais ses propres réponses textuelles à des
composants de la boutique.

### Principe

> L'assistant **déclenche** des actions dans la boutique.
> Il ne **simule** pas la boutique par du texte.

### Vérifications

| Comportement attendu                                     | Résultat attendu                              |
|----------------------------------------------------------|-----------------------------------------------|
| Afficher un produit → déclenche `ACTION_SHOW_PRODUCT`    | ✅ Fiche produit affichée dans la boutique    |
| Ajouter au panier → déclenche `ACTION_ADD_TO_CART`       | ✅ Panier mis à jour dans la boutique         |
| Montrer le panier → déclenche `ACTION_SHOW_CART`         | ✅ Panier ouvert dans la boutique             |
| Assistant décrit le panier en texte libre                | ❌ Comportement interdit                      |
| Assistant liste les produits en texte libre              | ❌ Comportement interdit                      |
| Assistant confirme une commande sans passer par l'écran  | ❌ Comportement interdit                      |

### Règles

- Chaque réponse de l'assistant qui concerne un produit, un prix ou le panier
  doit être accompagnée d'une action sur la boutique (DEP-0362).
- Le texte de l'assistant complète l'action — il ne la remplace pas.

---

## DEP-0399 — Vérifier que l'assistant appelle les fonctions du site plutôt que du texte libre non contrôlé

### Objectif

Valider que les réponses de l'assistant déclenchent systématiquement des
fonctions structurées de la boutique, et non du texte libre sans effet sur
l'interface.

### Principe

> Chaque intention identifiée par l'assistant produit une action codifiée
> (DEP-0362), jamais une réponse narrative sans effet.

### Vérifications

| Intention détectée           | Réponse attendue                                             |
|------------------------------|--------------------------------------------------------------|
| Chercher un produit          | `ACTION_SEARCH` + résultats dans la grille                   |
| Ajouter un produit           | `ACTION_ADD_TO_CART` + feedback visuel                       |
| Voir le panier               | `ACTION_SHOW_CART` + panier ouvert                           |
| Afficher les populaires      | `ACTION_SHOW_POPULAR` + grille filtrée                       |
| Confirmer la commande        | `ACTION_CONFIRM_ORDER` + redirection récapitulatif           |
| Demande hors périmètre       | Phrase DEP-0371 + aucune action déclenchée                   |

### Règles

- Toute intention reconnue déclenche une action listée dans DEP-0362.
- Les phrases de l'assistant (DEP-0367–DEP-0376) accompagnent les actions —
  elles ne les remplacent pas.
- Si aucune action n'est disponible pour une intention → l'assistant l'indique
  explicitement et ne tente pas de simuler un résultat.

---

## DEP-0400 — Gel du comportement V1 de l'assistant texte

### Objectif

Confirmer que l'ensemble du comportement de l'assistant texte (DEP-0361 à
DEP-0399) est **complet, cohérent et gelé**. Aucune modification ne doit
être apportée sans une décision explicite documentée.

### Périmètre gelé

| Bloc           | Contenu                                                             |
|----------------|---------------------------------------------------------------------|
| DEP-0361–0366  | Rôle, actions autorisées/interdites, tons par interlocuteur         |
| DEP-0367–0376  | Phrases système canoniques (bienvenue → fin de conversation)        |
| DEP-0377–0387  | Logiques de compréhension (catégorie, marque, parfum, quantité, corrections, ambiguïtés) |
| DEP-0388–0395  | Composants UI (boîte chat, saisie, envoi, micro, suggestions)       |
| DEP-0396–0399  | Validations comportementales (pas d'invention, pilotage boutique)   |

### Règles du gel

- **Aucune modification** des spécifications DEP-0361 à DEP-0399 sans nouvelle
  décision documentée (nouveau DEP dédié).
- Les implémentations futures doivent respecter ces spécifications telles
  quelles.
- Toute extension (nouvelles logiques de compréhension, nouveaux composants UI,
  support multilingue, historique persistant) fera l'objet de nouveaux blocs
  DEP au-delà de DEP-0400.
- Tout écart constaté lors de l'implémentation doit être signalé et arbitré
  avant toute modification.

### Critères de gel validés

| Critère                                                   | Statut   |
|-----------------------------------------------------------|----------|
| Rôle et périmètre de l'assistant définis                  | ✅ Fait   |
| Actions autorisées et interdites listées exhaustivement   | ✅ Fait   |
| Tons par interlocuteur définis                            | ✅ Fait   |
| Phrases système canoniques définies                       | ✅ Fait   |
| Logiques de compréhension définies                        | ✅ Fait   |
| Logiques d'ambiguïté définies                             | ✅ Fait   |
| Composants UI de l'assistant définis                      | ✅ Fait   |
| Validations comportementales documentées                  | ✅ Fait   |
| Périmètre gelé explicitement listé                        | ✅ Fait   |

---

## Synthèse du bloc DEP-0377–DEP-0400

| DEP      | Sujet                                   | Décision clé                                               |
|----------|-----------------------------------------|------------------------------------------------------------|
| DEP-0377 | Compréhension catégorie                 | Match sur label/tags/synonymes, une catégorie active       |
| DEP-0378 | Compréhension marque                    | Match sur brand/synonymes, aucune invention de marque      |
| DEP-0379 | Compréhension parfum                    | Modificateur de variante, variante par défaut si absent    |
| DEP-0380 | Compréhension quantité                  | 1 par défaut, vague → clarification, max 99 en V1          |
| DEP-0381 | Compréhension correction                | Mots-clés de correction, annule action précédente seulement|
| DEP-0382 | Compréhension retrait                   | ACTION_UPDATE_QTY à 0, vidage total avec confirmation      |
| DEP-0383 | Compréhension remplacement              | Retrait puis ajout, même quantité, produit dispo requis    |
| DEP-0384 | Commande incomplète                     | 3 vérifications avant ACTION_CONFIRM_ORDER, une à la fois  |
| DEP-0385 | Ambiguïté chips ketchup / multi-marques | Max 4 marques proposées, client choisit toujours           |
| DEP-0386 | Ambiguïté Pepsi / multi-formats         | Variante par défaut proposée en premier, max 3 formats     |
| DEP-0387 | Ambiguïté lait / multi-sortes           | Axe de distinction le plus significatif d'abord            |
| DEP-0388 | Boîte de chat                           | Section droite desktop, panneau mobile, historique session |
| DEP-0389 | Entrée texte                            | 280 chars max, Entrée = envoi, désactivée pendant traitement|
| DEP-0390 | Bouton envoi                            | Inactif si champ vide, désactivé pendant traitement        |
| DEP-0391 | Bouton micro                            | Mode assisté uniquement, transcription → champ saisie      |
| DEP-0392 | Affichage suggestions                   | 2–4 cartes compactes, produits catalogue exclusivement     |
| DEP-0393 | Clic sur suggestion                     | Corps → détail, bouton → ajout direct, même logique grille |
| DEP-0394 | Réduction suggestions après sélection   | Carte cliquée retire, autres restent, zone vide disparaît  |
| DEP-0395 | Fermeture suggestions / panier          | Auto après ajout assistant, manuelle après ajout grille    |
| DEP-0396 | Validation — pas d'invention produit    | Tout produit = id valide du catalogue, jamais de texte libre|
| DEP-0397 | Validation — pas d'invention prix       | Prix toujours de la boutique, jamais cité en texte         |
| DEP-0398 | Validation — pilote la boutique         | Chaque réponse → action boutique, pas de simulation texte  |
| DEP-0399 | Validation — fonctions structurées      | Toute intention → action DEP-0362, pas de narratif libre   |
| DEP-0400 | Gel comportement V1 assistant texte     | DEP-0361–0399 gelés, toute extension = nouveau bloc DEP    |
