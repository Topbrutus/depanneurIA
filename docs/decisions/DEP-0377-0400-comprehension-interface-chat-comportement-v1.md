# DEP-0377 à DEP-0400 — Compréhension des intents, interface chat et gel du comportement V1 de l'assistant

## Périmètre

Ce document définit la **logique de compréhension des intents clients** (catégorie,
marque, parfum, quantité, corrections, ambiguïtés), les **composants UI du chat**
(boîte, entrée texte, boutons, suggestions) et les **garde-fous de l'assistant**
(pas de produit inventé, pas de prix inventé, pilotage de la boutique). Il
se termine par le **gel du comportement V1** de l'assistant texte.

Principe directeur : **l'assistant ne devine jamais — il confirme, clarifie ou
refuse** avant d'agir. Toute information présentée au client doit être lue dans
le catalogue réel du tenant, jamais générée de manière autonome.

Il s'agit exclusivement de **documentation** : aucun code produit, aucune
implémentation. Les spécifications décrites ici serviront de référence pour les
futures implémentations front-end et back-end.

---

## DEP-0377 — Logique de compréhension d'une catégorie simple

### Objectif

Définir comment l'assistant reconnaît qu'un message client exprime une demande
orientée catégorie de produit (ex. : « chips », « boissons », « bonbons »).

### Signal de reconnaissance

Un intent catégorie simple est détecté lorsque le message correspond — après
normalisation (minuscules, retrait accents) — à l'un des **slug de catégorie**
ou à l'un des **synonymes de catégorie** stockés dans le catalogue du tenant.

### Algorithme de traitement

| Étape | Action                                                                      |
|-------|-----------------------------------------------------------------------------|
| 1     | Normaliser le message : minuscules, suppression ponctuation, retrait accents|
| 2     | Chercher correspondance exacte dans les slugs de catégorie                  |
| 3     | Chercher correspondance dans les synonymes de catégorie (tous confondus)    |
| 4     | Si 1 catégorie trouvée → filtrer la boutique sur cette catégorie            |
| 5     | Si 0 catégorie trouvée → passer en intent inconnu                           |
| 6     | Si plusieurs catégories trouvées → lever une ambiguïté (DEP-0385)           |

### Contraintes V1

- La recherche est **synchrone** et strictement locale au catalogue du tenant.
- Aucune inférence sémantique externe : l'assistant ne consulte pas de modèle
  de langue externe pour deviner la catégorie.
- Si aucune catégorie ne correspond, le message est traité comme un intent
  inconnu (phrase de relance, DEP-0371).

---

## DEP-0378 — Logique de compréhension d'une marque simple

### Objectif

Définir comment l'assistant reconnaît qu'un message client exprime une demande
orientée marque (ex. : « Pepsi », « Lay's », « Tic Tac »).

### Signal de reconnaissance

Un intent marque simple est détecté lorsque le message correspond — après
normalisation — à l'un des **labels de variante de marque** ou à l'un des
**synonymes parlés ou téléphoniques** associés à un produit dans le catalogue.

### Algorithme de traitement

| Étape | Action                                                                        |
|-------|-------------------------------------------------------------------------------|
| 1     | Normaliser le message                                                         |
| 2     | Chercher correspondance dans les labels de produit et variante                |
| 3     | Chercher correspondance dans les synonymes parlés et téléphoniques            |
| 4     | Si 1 produit trouvé → proposer ce produit                                     |
| 5     | Si plusieurs produits trouvés → lever une ambiguïté (DEP-0385 ou DEP-0386)   |
| 6     | Si 0 produit trouvé → passer en intent inconnu                               |

### Contraintes V1

- Priorité à la correspondance exacte sur la correspondance par synonyme.
- Si la marque est reconnue mais le produit est en rupture, l'assistant
  l'annonce et ne substitue pas.

---

## DEP-0379 — Logique de compréhension d'un parfum simple

### Objectif

Définir comment l'assistant reconnaît qu'un message précise un parfum ou
une saveur (ex. : « ketchup », « barbecue », « nature »).

### Signal de reconnaissance

Un intent parfum est détecté lorsque le message contient un terme correspondant
à un **attribut de variante** de type saveur/parfum/arôme dans le catalogue.

### Algorithme de traitement

| Étape | Action                                                                             |
|-------|------------------------------------------------------------------------------------|
| 1     | Normaliser le message                                                              |
| 2     | Chercher correspondance dans les attributs variante (saveur, parfum, arôme)       |
| 3     | Croiser avec le contexte courant (catégorie ou marque déjà sélectionnée)          |
| 4     | Si 1 variante trouvée → proposer cette variante                                   |
| 5     | Si plusieurs variantes trouvées → proposer liste pour choix client                 |
| 6     | Si 0 variante trouvée → phrase de relance                                         |

### Contraintes V1

- Un intent parfum **seul** (sans catégorie ni marque) est traité comme intent
  incomplet (DEP-0384).
- L'assistant ne suppose jamais que « ketchup » désigne automatiquement une
  marque particulière.

---

## DEP-0380 — Logique de compréhension d'une quantité simple

### Objectif

Définir comment l'assistant reconnaît et interprète une quantité exprimée
par le client (ex. : « deux », « 3 », « une caisse », « un pack »).

### Signal de reconnaissance

Un intent quantité est détecté lorsque le message contient un **nombre** (chiffre
ou mot) ou une **unité de conditionnement** reconnue dans le catalogue.

### Algorithme de traitement

| Étape | Action                                                                          |
|-------|---------------------------------------------------------------------------------|
| 1     | Extraire le nombre ou l'unité du message (regex + liste d'unités catalogue)     |
| 2     | Vérifier que le produit courant est déjà identifié dans la session              |
| 3     | Si oui → mettre à jour la quantité dans le panier                               |
| 4     | Si non → mémoriser la quantité en attente d'identification du produit           |
| 5     | Borner la quantité à 1–99 ; toute valeur hors borne → phrase d'erreur douce     |

### Contraintes V1

- Seule la quantité en **unité de vente** du catalogue est acceptée.
- Les conversions (ex. : « une caisse de 24 ») ne sont pas résolues
  automatiquement en V1 : l'assistant demande une clarification.

---

## DEP-0381 — Logique de compréhension d'une correction client

### Objectif

Définir comment l'assistant reconnaît qu'un message client corrige une demande
précédente (ex. : « non, pas ça », « je voulais dire… », « finalement… »).

### Signaux de correction

L'assistant détecte une correction via les **marqueurs linguistiques** suivants :

| Marqueur                  | Exemples                                          |
|---------------------------|---------------------------------------------------|
| Négation + remplacement   | « non, finalement je veux… »                      |
| Signal de retour arrière  | « annule le dernier », « enlève ça »              |
| Signal de remplacement    | « à la place », « plutôt »                        |
| Reformulation directe     | « je voulais dire », « en fait »                  |

### Algorithme de traitement

| Étape | Action                                                                         |
|-------|--------------------------------------------------------------------------------|
| 1     | Détecter un marqueur de correction dans le message                             |
| 2     | Identifier l'action précédente dans la session (dernier produit ajouté)        |
| 3     | Proposer de retirer ou modifier cet élément                                    |
| 4     | Attendre confirmation explicite du client avant d'agir                          |
| 5     | Traiter le reste du message comme un nouvel intent                             |

### Contraintes V1

- Aucune action irréversible sans confirmation explicite.
- Si plusieurs produits ont été ajoutés, l'assistant précise lequel est concerné
  avant d'agir.

---

## DEP-0382 — Logique de compréhension d'un retrait de produit

### Objectif

Définir comment l'assistant reconnaît et traite une demande de retrait d'un
produit du panier (ex. : « enlève le Pepsi », « je ne veux plus les chips »).

### Signaux de retrait

| Marqueur                   | Exemples                                         |
|----------------------------|--------------------------------------------------|
| Verbe de retrait + produit | « enlève », « retire », « supprime » + nom/label |
| Négation + produit         | « je ne veux plus le… »                         |
| Signal panier              | « vide le panier », « retire tout »              |

### Algorithme de traitement

| Étape | Action                                                                          |
|-------|---------------------------------------------------------------------------------|
| 1     | Détecter le signal de retrait                                                   |
| 2     | Identifier le produit concerné dans le panier courant                           |
| 3     | Confirmer le retrait avec le client (« Tu veux que je retire [produit] ? »)     |
| 4     | Appeler la fonction `removeFromCart(productId)` de la boutique                  |
| 5     | Confirmer le retrait effectué                                                   |

### Contraintes V1

- La confirmation est **obligatoire** avant tout retrait.
- Si le produit n'est pas dans le panier, l'assistant le précise sans erreur.

---

## DEP-0383 — Logique de compréhension d'un remplacement de produit

### Objectif

Définir comment l'assistant reconnaît et traite une demande de remplacement
d'un produit par un autre (ex. : « change le Pepsi par une Coke »).

### Signaux de remplacement

| Marqueur                          | Exemples                                      |
|-----------------------------------|-----------------------------------------------|
| Verbe de remplacement + produits  | « remplace X par Y », « change X pour Y »     |
| Retrait + ajout combinés          | « enlève X, mets Y à la place »               |

### Algorithme de traitement

| Étape | Action                                                                           |
|-------|----------------------------------------------------------------------------------|
| 1     | Détecter le signal de remplacement et identifier les deux produits               |
| 2     | Vérifier que le produit à retirer est dans le panier                             |
| 3     | Vérifier que le produit de remplacement existe dans le catalogue                 |
| 4     | Proposer le remplacement avec les deux labels                                    |
| 5     | Confirmer avec le client avant d'agir                                            |
| 6     | Retirer l'ancien, ajouter le nouveau                                             |

### Contraintes V1

- Si le produit de remplacement n'est pas dans le catalogue, l'assistant refuse
  et explique.
- La quantité du produit retiré est conservée pour le produit de remplacement,
  sauf indication contraire.

---

## DEP-0384 — Logique de compréhension d'une commande incomplète

### Objectif

Définir comment l'assistant détecte qu'un message est trop vague pour agir
et sollicite les informations manquantes.

### Critères d'une commande incomplète

Une commande est incomplète si au moins l'un de ces éléments manque :

| Élément manquant    | Exemple de message vague         |
|---------------------|----------------------------------|
| Produit non identifié | « je veux des chips »          |
| Marque non précisée | « donne-moi un Pepsi » + plusieurs formats |
| Quantité absente    | « ajoute des chips ketchup »     |
| Catégorie ambiguë   | « quelque chose à boire »        |

### Algorithme de traitement

| Étape | Action                                                                          |
|-------|---------------------------------------------------------------------------------|
| 1     | Analyser le message et identifier les éléments présents                         |
| 2     | Lister les éléments manquants nécessaires pour agir                             |
| 3     | Poser **une seule question** pour le premier élément manquant                   |
| 4     | Mémoriser les éléments déjà fournis dans la session                             |
| 5     | Répéter jusqu'à ce que tous les éléments nécessaires soient recueillis          |

### Contraintes V1

- Une seule question par tour de parole.
- L'assistant ne pose jamais de questions sur des éléments optionnels en V1.

---

## DEP-0385 — Logique d'ambiguïté « chips ketchup » avec plusieurs marques

### Objectif

Définir la stratégie de résolution lorsqu'une demande (catégorie + parfum)
correspond à plusieurs produits de marques différentes.

### Scénario type

Client : « Je veux des chips ketchup. »
Résultat catalogue : Lay's Ketchup 200g + Old Dutch Ketchup 180g + Pringles
Ketchup 150g.

### Stratégie de résolution

| Étape | Action                                                                         |
|-------|--------------------------------------------------------------------------------|
| 1     | Détecter la correspondance multiple (>1 produit pour catégorie + parfum)       |
| 2     | Extraire les labels de marque distincts                                        |
| 3     | Proposer une liste de choix avec labels clairs (nom + format + prix)           |
| 4     | Attendre le choix du client                                                    |
| 5     | Confirmer et ajouter au panier                                                  |

### Affichage suggéré

> « J'ai trouvé plusieurs chips ketchup :
> 1. Lay's Ketchup 200g — 3,49 $
> 2. Old Dutch Ketchup 180g — 2,99 $
> Lequel veux-tu ? »

### Contraintes V1

- Maximum **5 choix** affichés dans la liste.
- Si plus de 5, afficher les 5 premiers selon l'ordre d'affichage catalogue.
- Jamais de suggestion par défaut sans demande explicite.

---

## DEP-0386 — Logique d'ambiguïté « Pepsi » avec plusieurs formats

### Objectif

Définir la stratégie de résolution lorsqu'une marque connue existe en plusieurs
formats/tailles dans le catalogue.

### Scénario type

Client : « Je veux un Pepsi. »
Résultat catalogue : Pepsi 355 ml + Pepsi 591 ml + Pepsi 2 L.

### Stratégie de résolution

| Étape | Action                                                                        |
|-------|-------------------------------------------------------------------------------|
| 1     | Détecter la correspondance multiple sur la même marque                        |
| 2     | Extraire les variantes (format, contenance, unité)                            |
| 3     | Proposer une liste de formats clairs avec prix                                |
| 4     | Attendre le choix du client                                                   |
| 5     | Confirmer et ajouter au panier                                                 |

### Note V1

En V1, le catalogue pilote ne comprend qu'un seul format de Pepsi. Cette logique
est documentée pour préparer les cas futurs. Si un seul format est présent,
l'ambiguïté ne se déclenche pas.

### Contraintes V1

- Si la marque n'existe qu'en un seul format, ajouter directement sans question.
- Cette logique s'active uniquement si ≥2 variantes sont disponibles et en stock.

---

## DEP-0387 — Logique d'ambiguïté « du lait » avec plusieurs sortes

### Objectif

Définir la stratégie de résolution lorsqu'une catégorie générique (ex. : lait)
existe en plusieurs sous-types dans le catalogue (entier, 2 %, écrémé, végétal).

### Scénario type

Client : « Je veux du lait. »
Résultat catalogue : Lait 3,25 % + Lait 2 % + Lait écrémé.

### Stratégie de résolution

| Étape | Action                                                                        |
|-------|-------------------------------------------------------------------------------|
| 1     | Détecter la catégorie générique                                               |
| 2     | Extraire les sous-types disponibles et en stock                               |
| 3     | Proposer une liste courte avec labels clairs                                  |
| 4     | Attendre le choix du client                                                   |
| 5     | Confirmer et ajouter au panier                                                 |

### Note V1

En V1, le catalogue pilote ne comprend qu'un seul type de lait. Cette logique
est documentée pour préparer les cas futurs.

### Contraintes V1

- Si un seul sous-type est disponible, ajouter directement sans question.
- Cette logique s'active uniquement si ≥2 sous-types sont disponibles et en stock.

---

## DEP-0388 — Boîte de chat de l'assistant

### Objectif

Spécifier les caractéristiques de la boîte de chat principale affichée dans
la section assistant de l'interface.

### Spécifications

| Attribut             | Valeur                                                           |
|----------------------|------------------------------------------------------------------|
| Emplacement          | Section droite (desktop) / bas de page (mobile)                 |
| Hauteur              | 320px desktop, 240px mobile (défilable)                         |
| Largeur              | 100 % de la colonne assistant                                    |
| Fond                 | Blanc `#FFFFFF` avec bordure `#E5E7EB`                          |
| Défilement           | Auto-scroll vers le dernier message                              |
| Message assistant    | Bulle gauche, fond `#EFF6FF`, texte `#1E3A5F`                   |
| Message client       | Bulle droite, fond `#2563EB`, texte blanc `#FFFFFF`             |
| Bordure de bulle     | `border-radius: 16px` (sauf coin intérieur : 4px)               |
| Espacement bulles    | 8px entre messages du même auteur, 16px entre auteurs différents|
| Accessibilité        | `role="log"`, `aria-live="polite"`, `aria-label="Chat assistant"`|

### États

| État          | Description                                          |
|---------------|------------------------------------------------------|
| Vide          | Message de bienvenue de l'assistant visible          |
| Chargement    | Indicateur trois points animés (typing indicator)   |
| Erreur réseau | Bandeau d'alerte en haut de la boîte                |

---

## DEP-0389 — Entrée texte du client

### Objectif

Spécifier le champ de saisie texte dans lequel le client tape ses demandes.

### Spécifications

| Attribut           | Valeur                                                             |
|--------------------|--------------------------------------------------------------------|
| Type HTML          | `<textarea>` monolinéaire (expand si besoin, max 3 lignes)        |
| Placeholder        | « Écris ta demande ici… »                                         |
| Hauteur initiale   | 48px                                                               |
| Hauteur maximum    | 120px (3 lignes)                                                   |
| Largeur            | 100 % moins bouton envoi et bouton micro                           |
| Fond               | Blanc `#FFFFFF`, bordure `#D1D5DB`                                |
| Focus              | Bordure `#2563EB`, `outline: none`                                |
| Erreur             | Bordure `#EF4444`                                                  |
| Police             | Inter 16px / line-height 1.5                                      |
| Accessibilité      | `aria-label="Zone de saisie"`, `autocorrect="on"`, `spellcheck`   |

### Comportement

- La touche **Entrée** soumet le message (sauf si Shift+Entrée : saut de ligne).
- Le champ est vidé automatiquement après envoi.
- Focus automatique à l'ouverture de la page assistée.

---

## DEP-0390 — Bouton d'envoi texte

### Objectif

Spécifier le bouton permettant d'envoyer le message saisi par le client.

### Spécifications

| Attribut        | Valeur                                              |
|-----------------|-----------------------------------------------------|
| Type            | `<button type="submit">`                            |
| Icône           | `Send` (Lucide), 20×20px                            |
| Fond            | `#2563EB`                                           |
| Fond hover      | `#1D4ED8`                                           |
| Fond désactivé  | `#93C5FD`                                           |
| Dimensions      | 48×48px                                             |
| Border-radius   | 12px                                                |
| Accessibilité   | `aria-label="Envoyer"`, `disabled` si champ vide   |

### États

| État       | Description                                              |
|------------|----------------------------------------------------------|
| Activé     | Champ non vide et assistant non en chargement            |
| Désactivé  | Champ vide ou message en cours de traitement             |
| Chargement | Spinner remplace l'icône Send pendant le traitement      |

---

## DEP-0391 — Bouton micro du mode assisté écran

### Objectif

Spécifier le bouton microphone permettant la saisie vocale dans le mode
assisté écran (texte → parole transcrite dans le champ texte).

### Spécifications

| Attribut        | Valeur                                                   |
|-----------------|----------------------------------------------------------|
| Type            | `<button type="button">`                                 |
| Icône repos     | `Mic` (Lucide), 20×20px                                  |
| Icône écoute    | `MicOff` ou `Mic` animé (pulsation rouge)                |
| Fond repos      | `#F3F4F6`                                                |
| Fond écoute     | `#FEF2F2`                                                |
| Dimensions      | 48×48px                                                  |
| Border-radius   | 12px                                                     |
| Accessibilité   | `aria-label="Dicter"` / `aria-pressed` selon état        |

### Comportement

- Appui unique → démarre l'écoute (Web Speech API `SpeechRecognition`).
- Deuxième appui → arrête l'écoute et insère la transcription dans le champ.
- La transcription n'est pas envoyée automatiquement : le client peut relire
  avant de soumettre.
- Si le navigateur ne supporte pas la Web Speech API, le bouton est masqué.

### Contraintes V1

- Le bouton micro est visible uniquement en mode assisté écran (pas en mode
  téléphonique ni manuel).
- Aucun enregistrement audio persistant : la transcription locale uniquement.

---

## DEP-0392 — Affichage des suggestions produits de l'assistant

### Objectif

Spécifier le panneau de suggestions que l'assistant affiche lorsqu'il propose
un ou plusieurs produits correspondant à la demande du client.

### Spécifications

| Attribut              | Valeur                                                        |
|-----------------------|---------------------------------------------------------------|
| Emplacement           | Sous la boîte de chat, au-dessus de l'entrée texte           |
| Nombre max affiché    | 5 tuiles produits (défilables horizontalement sur mobile)    |
| Structure d'une tuile | Image produit + nom + prix + bouton « Ajouter »              |
| Fond tuile            | Blanc `#FFFFFF`, bordure `#E5E7EB`                           |
| Tuile sélectionnée    | Bordure `#2563EB` + fond `#EFF6FF`                           |
| Accessibilité         | `role="listbox"`, chaque tuile `role="option"`               |

### Comportement

- Les suggestions s'affichent uniquement quand l'assistant retourne ≥1 produit.
- Elles restent visibles jusqu'à fermeture (DEP-0395) ou réduction (DEP-0394).
- Le clic sur une tuile déclenche l'action de DEP-0393.

---

## DEP-0393 — Action de clic sur une suggestion proposée par l'assistant

### Objectif

Définir ce qui se passe quand le client clique sur une tuile de suggestion.

### Flux d'action

| Étape | Action                                                                          |
|-------|---------------------------------------------------------------------------------|
| 1     | Le client clique sur la tuile produit                                           |
| 2     | L'assistant appelle `addToCart(productId, quantity)` de la boutique             |
| 3     | Un message de confirmation apparaît dans la boîte de chat                       |
| 4     | La tuile sélectionnée passe à l'état « sélectionné » (DEP-0392)                |
| 5     | Le panier se met à jour visuellement                                             |

### Message de confirmation (exemple)

> « ✓ Lay's Ketchup 200g ajouté à ton panier. Autre chose ? »

### Contraintes V1

- Un seul produit ajouté par clic.
- La quantité ajoutée est toujours 1 sauf si une quantité a été précisée
  dans la session.

---

## DEP-0394 — Réduction des suggestions après sélection d'un produit

### Objectif

Définir l'état réduit du panneau de suggestions après qu'un produit a été
ajouté via une suggestion.

### Comportement

| Situation                          | Résultat                                              |
|------------------------------------|-------------------------------------------------------|
| 1 seul produit proposé, sélectionné| Panneau fermé automatiquement                        |
| Plusieurs produits, 1 sélectionné  | Tuile sélectionnée reste visible, autres masquées    |
| Sélection annulée                  | Panneau revient à son état complet                   |

### Animation

- Réduction avec transition `height` de 200ms (`ease-in-out`).
- La tuile conservée reste cliquable pour désélectionner.

### Contraintes V1

- La réduction est visuelle uniquement : les autres produits restent en mémoire
  tant que la session est active.

---

## DEP-0395 — Fermeture des suggestions quand le panier se met à jour

### Objectif

Définir quand et comment le panneau de suggestions se ferme automatiquement.

### Déclencheurs de fermeture automatique

| Déclencheur                                       | Comportement                   |
|---------------------------------------------------|--------------------------------|
| Mise à jour du panier (ajout via suggestion)      | Fermeture après 1 200ms        |
| Nouveau message client envoyé                     | Fermeture immédiate            |
| Clic en dehors du panneau                         | Fermeture immédiate            |
| Navigation vers une autre page                    | Fermeture immédiate            |

### Animation de fermeture

- Fermeture avec `opacity` 1→0 + `height` vers 0 sur 300ms (`ease-in`).
- Après fermeture, le panneau est retiré du DOM (pas seulement masqué).

### Contraintes V1

- Les suggestions ne se rouvrent que si l'assistant reçoit une nouvelle réponse
  contenant des produits.
- Aucune réouverture automatique basée sur des événements internes.

---

## DEP-0396 — L'assistant n'invente jamais un produit absent du catalogue

### Objectif

Garantir que l'assistant ne peut pas suggérer, nommer ou ajouter un produit
qui n'existe pas dans le catalogue actif du tenant.

### Règle fondamentale

> **Zéro produit fictif.** Chaque produit nommé ou proposé par l'assistant
> doit avoir un `productId` valide dans le catalogue du tenant au moment de
> l'interaction.

### Mécanismes de garantie

| Mécanisme                     | Description                                                    |
|-------------------------------|----------------------------------------------------------------|
| Lookup obligatoire            | Toute mention de produit déclenche une recherche catalogue     |
| Pas de génération de label    | L'assistant utilise le label exact du catalogue, jamais généré |
| Validation avant proposition  | Un produit n'est proposé que si son ID est résolu dans le catalogue |
| Refus documenté               | Si aucun produit ne correspond, phrase de refus (DEP-0370)    |

### Test de validation

- Scénario : le client demande un produit inexistant (ex. : « RedBull »).
- Résultat attendu : phrase de refus, aucun produit inventé dans le chat.

---

## DEP-0397 — L'assistant n'invente jamais un prix public non prévu

### Objectif

Garantir que l'assistant ne peut pas afficher, mentionner ou calculer un
prix qui ne provient pas directement du catalogue.

### Règle fondamentale

> **Zéro prix fictif.** Chaque prix affiché dans le chat ou les suggestions
> doit être lu directement depuis le champ `price` de la variante produit
> dans le catalogue, sans calcul ni interpolation.

### Mécanismes de garantie

| Mécanisme                    | Description                                                         |
|------------------------------|---------------------------------------------------------------------|
| Prix lu depuis catalogue     | L'assistant lit `variant.price` — jamais calculé ni estimé         |
| Aucune extrapolation         | Si un prix est manquant, l'assistant ne l'affiche pas               |
| Prix manquant                | Afficher « Prix non disponible » plutôt qu'un prix inventé         |
| Aucune promotion spontanée   | Les remises éventuelles sont gérées par la boutique, pas l'assistant|

### Test de validation

- Scénario : variante avec champ `price` vide.
- Résultat attendu : l'assistant écrit « Prix non disponible » et ne propose
  pas de valeur.

---

## DEP-0398 — L'assistant pilote la boutique au lieu de remplacer la boutique

### Objectif

Garantir que toutes les actions visibles (panier, navigation, affichage) passent
par les composants et fonctions officiels de la boutique.

### Règle fondamentale

> **L'assistant ne rend pas lui-même.** Il appelle des fonctions ; la boutique
> affiche. Le client voit toujours la boutique, pas l'assistant.

### Séparation des responsabilités

| Responsabilité        | Acteur          | Exemples                                          |
|-----------------------|-----------------|---------------------------------------------------|
| Interpréter l'intent  | Assistant       | Identifier produit, quantité, action              |
| Agir sur la boutique  | Boutique        | `addToCart`, `filterByCategory`, `updateQuantity` |
| Afficher le résultat  | Boutique        | Mise à jour panier, liste produits filtrée        |
| Confirmer l'action    | Assistant (chat)| Message texte de confirmation                    |

### Contraintes V1

- L'assistant **ne rend jamais** de liste produits en HTML dans le chat.
- L'assistant **ne gère jamais** le state du panier directement.
- L'assistant **ne fait jamais** de requêtes directes à la base de données.

---

## DEP-0399 — L'assistant appelle les fonctions du site plutôt que du texte libre non contrôlé

### Objectif

Garantir que chaque action de l'assistant se traduit par un appel à une
fonction typée de la boutique, jamais par du texte libre interprétable de
manière ambiguë.

### Catalogue des fonctions V1

| Fonction                         | Signature simplifiée                                |
|----------------------------------|-----------------------------------------------------|
| Ajouter au panier                | `addToCart(productId: string, qty: number)`         |
| Retirer du panier                | `removeFromCart(productId: string)`                 |
| Modifier la quantité             | `updateCartQty(productId: string, qty: number)`     |
| Filtrer par catégorie            | `filterByCategory(categoryId: string)`              |
| Vider le panier                  | `clearCart()`                                       |
| Naviguer vers une page           | `navigateTo(route: string)`                         |
| Afficher suggestions             | `showSuggestions(productIds: string[])`             |
| Fermer suggestions               | `hideSuggestions()`                                 |

### Règle fondamentale

> **Zéro action par texte libre.** Chaque action connue de l'assistant est
> mappée à une fonction. Si aucune fonction ne correspond, l'assistant répond
> par du texte uniquement (clarification, refus) sans déclencher d'action.

### Contraintes V1

- Les fonctions sont appelées côté client (browser) par l'interface chat.
- Aucune fonction n'accepte une chaîne non typée comme identifiant de produit.
- L'ajout d'une nouvelle fonction requiert une mise à jour de ce document.

---

## DEP-0400 — Gel du comportement V1 de l'assistant texte

### Objectif

Figer définitivement le périmètre du comportement de l'assistant texte en V1
pour clore ce bloc et empêcher toute dérive de portée.

### Inventaire complet du comportement V1

**Intents reconnus :**

| Intent                  | Statut V1  |
|-------------------------|-----------|
| Catégorie simple        | ✅ inclus |
| Marque simple           | ✅ inclus |
| Parfum/saveur           | ✅ inclus |
| Quantité                | ✅ inclus |
| Correction              | ✅ inclus |
| Retrait                 | ✅ inclus |
| Remplacement            | ✅ inclus |
| Commande incomplète     | ✅ inclus |
| Ambiguïté plusieurs marques | ✅ inclus |
| Ambiguïté plusieurs formats | ✅ inclus |
| Ambiguïté plusieurs sortes  | ✅ inclus |

**Composants UI :**

| Composant               | Statut V1  |
|-------------------------|-----------|
| Boîte de chat           | ✅ inclus |
| Entrée texte            | ✅ inclus |
| Bouton envoi            | ✅ inclus |
| Bouton micro            | ✅ inclus |
| Suggestions produits    | ✅ inclus |
| Clic sur suggestion     | ✅ inclus |
| Réduction suggestions   | ✅ inclus |
| Fermeture suggestions   | ✅ inclus |

**Garde-fous :**

| Garde-fou                                  | Statut V1  |
|--------------------------------------------|-----------|
| Zéro produit inventé                       | ✅ inclus |
| Zéro prix inventé                          | ✅ inclus |
| Assistant pilote, boutique exécute         | ✅ inclus |
| Appels de fonctions typées uniquement      | ✅ inclus |

### Comportements explicitement exclus de la V1

| Comportement exclu                                | Raison                           |
|---------------------------------------------------|----------------------------------|
| Recommandation proactive sans demande client      | Hors portée V1                   |
| Mémoire inter-sessions                            | Non implémentée en V1            |
| Multilinguisme                                    | Français uniquement en V1        |
| Suggestions basées sur l'historique de commandes  | Hors portée V1                   |
| Génération de réponses par LLM externe            | Hors portée V1                   |
| Substitution automatique sans confirmation        | Interdit                         |
| Calcul de promotions ou remises                   | Géré par la boutique, pas l'assistant|

### Déclaration de gel

> Ce document représente la **définition complète et figée** du comportement
> de l'assistant texte pour la V1 de depaneurIA. Aucun comportement
> supplémentaire ne peut être ajouté à ce bloc sans créer une nouvelle entrée
> dans la checklist et ouvrir un bloc dédié (V1.1 ou V2).
>
> Toute modification de ce document après acceptation de cette PR requiert
> une issue GitHub dédiée et un nouveau numéro DEP.

### Critères de validation avant implémentation

- [ ] Tous les intents de DEP-0377 à DEP-0387 sont documentés avec algorithme.
- [ ] Tous les composants UI de DEP-0388 à DEP-0395 sont spécifiés.
- [ ] Les 4 garde-fous de DEP-0396 à DEP-0399 sont vérifiables par test.
- [ ] Ce document a été relu et accepté via PR avant implémentation.
