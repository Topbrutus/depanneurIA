# DEP-0181 à DEP-0200 — Dispositions et comportements UX

## Périmètre

Définir les dispositions (layouts) desktop et mobile, les emplacements des composants
clés (panier, chat, suggestions), les comportements de la grille produits, du panier
selon les états de commande, et les comportements de l'assistant selon différents
contextes utilisateur.

---

## DEP-0181 — Disposition ordinateur à trois sections

### Vue d'ensemble

Sur ordinateur (écran ≥ 1024px), l'interface utilise une disposition à trois sections
horizontales pour maximiser l'efficacité et éviter les défilements excessifs.

### Structure

```
┌────────────────────────────────────────────────────────────────────┐
│  Header : Logo | Navigation | Mode (manuel/assisté) | Profil       │
├──────────────┬──────────────────────────────────────┬──────────────┤
│              │                                      │              │
│  Section 1   │        Section 2                     │  Section 3   │
│              │                                      │              │
│  Catégories  │     Grille produits                  │   Panier     │
│              │                                      │   + Chat     │
│  Filtres     │     + Recherche                      │   + Sugg.    │
│              │                                      │              │
│  Raccourcis  │     Contenu principal                │   Toujours   │
│              │                                      │   visible    │
│              │                                      │              │
│              │                                      │              │
└──────────────┴──────────────────────────────────────┴──────────────┘
```

### Répartition de l'espace

- **Section 1 (gauche)** : 20% de la largeur, minimum 200px, maximum 280px.
  Navigation par catégories, filtres rapides, raccourcis (dernière commande,
  produits populaires).

- **Section 2 (centre)** : 50-55% de la largeur, occupe l'espace disponible restant.
  Contenu principal : grille de produits, barre de recherche, barre de tri.

- **Section 3 (droite)** : 25-30% de la largeur, minimum 320px, maximum 400px.
  Zone fixe (sticky) contenant le panier, le chat assistant (si mode assisté actif)
  et les suggestions (si pertinent).

### Comportement responsive

- Entre 768px et 1024px : Section 1 réduite à 180px, Section 3 réduite à 300px.
- < 768px : bascule vers disposition mobile empilée (DEP-0182).

---

## DEP-0182 — Disposition téléphone empilée

### Vue d'ensemble

Sur téléphone et tablette portrait (< 768px), l'interface bascule en disposition
empilée verticale pour faciliter la navigation tactile et la lecture.

### Structure

```
┌─────────────────────────────────┐
│  Header compact                 │
│  Logo | Menu burger | Panier    │
├─────────────────────────────────┤
│                                 │
│  Barre de recherche             │
│                                 │
├─────────────────────────────────┤
│                                 │
│  Filtres horizontaux défilables │
│                                 │
├─────────────────────────────────┤
│                                 │
│  Grille produits                │
│  (2 colonnes ou liste)          │
│                                 │
│         ...                     │
│                                 │
├─────────────────────────────────┤
│  Bouton panier flottant         │
│  (sticky en bas)                │
└─────────────────────────────────┘
```

### Sections empilées

1. **Header** : compact, menu burger pour accéder aux catégories et filtres,
   icône panier avec badge de quantité.

2. **Recherche** : barre fixe sous le header (sticky), toujours accessible.

3. **Filtres** : bandeau horizontal avec défilement horizontal, affichage de
   filtres rapides (catégories, disponibilité, populaires).

4. **Grille produits** : grille à 2 colonnes ou liste verticale selon préférence
   utilisateur. Défilement vertical infini ou paginé.

5. **Panier flottant** : bouton fixe en bas de l'écran affichant le total et le
   nombre d'articles. Clic → ouverture du panier en modal ou slide-up.

6. **Chat assistant** : icône flottante en bas à droite (si mode assisté actif).
   Clic → ouverture du chat en plein écran ou modal.

### Comportement responsive

- Entre 480px et 768px : grille 2 colonnes.
- < 480px : grille 2 colonnes compactes ou basculement en liste verticale.

---

## DEP-0183 — Emplacement exact du panier sur ordinateur

### Position

- **Section 3 (droite)**, en haut de la zone.
- Position `sticky` : reste visible lors du défilement de la section centrale.

### Contenu

```
┌─────────────────────────────────────┐
│  🛒 Mon panier          (3 articles) │
├─────────────────────────────────────┤
│                                     │
│  Coca-Cola 355ml       x2    5,00 $ │
│  [−] [+] [✕]                         │
│                                     │
│  Chips BBQ             x1    3,50 $ │
│  [−] [+] [✕]                         │
│                                     │
├─────────────────────────────────────┤
│  Sous-total estimé :         8,50 $ │
│                                     │
│  [Vider le panier]                   │
│  [Commander maintenant]              │
└─────────────────────────────────────┘
```

### Hauteur maximale

- Maximum 60% de la hauteur de viewport.
- Défilement interne (scrollable) si le panier contient plus de 5 articles.

### Ordre visuel dans la Section 3

1. Panier (priorité 1, toujours en haut).
2. Chat assistant (si mode assisté actif, en dessous du panier).
3. Suggestions (en dessous du chat, si pertinent).

---

## DEP-0184 — Emplacement exact du chat sur ordinateur

### Position

- **Section 3 (droite)**, immédiatement sous le panier.
- Position `sticky` : reste visible lors du défilement.
- Visible uniquement en **mode assisté**.

### Contenu

```
┌─────────────────────────────────────┐
│  💬 Assistant                        │
├─────────────────────────────────────┤
│  Assistant : Bonjour ! Comment      │
│  puis-je vous aider aujourd'hui ?   │
│                                     │
│  Vous : Je cherche du Pepsi         │
│                                     │
│  Assistant : J'ai trouvé 2 options. │
│  Voir les suggestions ci-dessous.   │
│                                     │
├─────────────────────────────────────┤
│  [Votre message...]          [Envoyer]│
│  🎤                                  │
└─────────────────────────────────────┘
```

### Hauteur

- Minimum 200px, maximum 400px.
- Défilement interne si l'historique de conversation dépasse la hauteur allouée.
- Hauteur ajustable par l'utilisateur (resize handle optionnel en V1).

### Comportement

- En mode **manuel** : le chat est caché ou réduit à une icône « Passer en mode
  assisté ».
- En mode **assisté** : le chat est toujours visible et interactif.

---

## DEP-0185 — Emplacement exact des suggestions sur ordinateur

### Position

- **Section 3 (droite)**, immédiatement sous le chat assistant (si actif) ou
  sous le panier (si mode manuel).
- Position `sticky` : reste visible lors du défilement.

### Contenu

```
┌─────────────────────────────────────┐
│  ✨ Suggestions                      │
├─────────────────────────────────────┤
│  [Image] Pepsi 355ml         2,50 $ │
│  En stock    [+ Ajouter]             │
│                                     │
│  [Image] Pepsi 2L            4,00 $ │
│  En stock    [+ Ajouter]             │
│                                     │
└─────────────────────────────────────┘
```

### Affichage conditionnel

- Affichées **uniquement** si :
  - L'assistant a proposé des produits en réponse à une demande client, OU
  - Le client a recherché un terme dans la barre de recherche, OU
  - Le système suggère des produits complémentaires (ex. après ajout au panier).

- **Non affichées** par défaut si aucune interaction pertinente.

### Hauteur

- Variable selon le nombre de suggestions (2 à 5 produits maximum affichés).
- Défilement interne si plus de 5 suggestions.

---

## DEP-0186 — Emplacement exact du panier sur téléphone

### Position

- **Bouton flottant fixe en bas de l'écran** (sticky bottom bar).
- Toujours visible, même lors du défilement de la grille produits.

### Contenu du bouton

```
┌─────────────────────────────────────┐
│  🛒 3 articles — 8,50 $ [Voir le panier] │
└─────────────────────────────────────┘
```

### Ouverture du panier

- **Clic sur le bouton** → ouverture en **slide-up modal** (occupe 70-80% de
  l'écran).
- **Contenu du modal** :
  - Liste des articles avec quantités et prix.
  - Actions : modifier quantité, retirer article, vider panier.
  - Bouton « Commander maintenant » (sticky en bas du modal).
  - Bouton « Continuer mes achats » (ferme le modal).

### Comportement

- Le modal est **semi-transparent** en arrière-plan (overlay grisé).
- Glissement vers le bas → fermeture du modal.
- Badge de quantité sur l'icône panier du header (synchronisé).

---

## DEP-0187 — Emplacement exact du chat sur téléphone

### Position

- **Icône flottante en bas à droite de l'écran**, au-dessus du bouton panier.
- Visible uniquement en **mode assisté**.

### Icône

```
┌─────┐
│ 💬  │
└─────┘
```

### Ouverture du chat

- **Clic sur l'icône** → ouverture en **plein écran** (modal full-screen).
- **Contenu du modal** :
  - Header : « Assistant » avec bouton de fermeture [✕].
  - Zone de conversation (scrollable).
  - Champ de saisie texte + bouton micro en bas (sticky).

### Comportement

- Le chat **occupe 100% de l'écran** pour faciliter la lecture et l'interaction.
- Bouton de fermeture [✕] en haut à droite → retour à la boutique.
- L'historique de conversation est **persisté** même après fermeture.

---

## DEP-0188 — Emplacement exact des suggestions sur téléphone

### Position

- **Bandeau horizontal défilable** immédiatement sous la barre de recherche.
- Apparaît **uniquement** si des suggestions sont pertinentes (même logique que
  DEP-0185).

### Contenu

```
┌─────────────────────────────────────────────────────────┐
│  ✨ Suggestions :  [Pepsi 355ml] [Pepsi 2L] [Coca 355ml] │
│                    [← →]                                 │
└─────────────────────────────────────────────────────────┘
```

### Comportement

- **Défilement horizontal** : l'utilisateur peut faire défiler les suggestions
  en glissant horizontalement.
- **Clic sur une suggestion** → ouverture de la fiche produit en modal ou ajout
  direct au panier (selon préférence V1).
- Le bandeau est **masqué automatiquement** après ajout au panier ou après 30
  secondes d'inactivité (peut être ré-ouvert via l'assistant).

---

## DEP-0189 — Comportement de la grille produits au clic

### Interactions principales

#### 1. Clic sur une carte produit

- **Action** : ouverture d'un **modal de détail produit** (overlay).
- **Contenu du modal** :
  - Photo en grand format.
  - Nom du produit, description courte.
  - Prix (si affiché).
  - Indicateur de disponibilité (en stock / rupture).
  - Sélecteur de quantité [−] [Quantité] [+].
  - Bouton « Ajouter au panier ».
  - Bouton « Fermer » [✕].

#### 2. Clic sur le bouton « Ajouter au panier » (depuis la carte)

- **Action** : ajout direct au panier sans ouvrir le modal.
- **Animation** : translation visuelle de la carte produit vers l'icône panier
  (effet flyout).
- **Feedback** : badge de quantité du panier incrémenté, micro-animation de
  pulsation.

#### 3. Recherche de produit

- **Action** : saisie dans la barre de recherche → filtrage en temps réel de
  la grille (ou soumission avec touche Entrée).
- **Résultats** : grille mise à jour avec les produits correspondants.
- **Si aucun résultat** : message « Aucun produit trouvé. Essayez un autre
  terme ou demandez à l'assistant. »

#### 4. Filtrage par catégorie

- **Action** : clic sur une catégorie dans la navigation gauche (desktop) ou
  dans le menu burger (mobile).
- **Résultat** : grille mise à jour pour afficher uniquement les produits de
  cette catégorie.
- **Indicateur visuel** : catégorie active soulignée ou mise en surbrillance.

---

## DEP-0190 — Comportement de la grille produits à la voix

### Interactions principales

#### 1. Recherche vocale

- **Activation** : clic sur l'icône micro 🎤 dans la barre de recherche ou dans
  le chat assistant.
- **Action** :
  1. Capture audio de la demande utilisateur.
  2. Transcription en texte (ex. « Pepsi 355 millilitres »).
  3. Envoi de la demande à l'assistant.
  4. L'assistant interprète la demande et filtre/suggère des produits.

#### 2. Ajout au panier par la voix

- **Exemple de commande** : « Ajoute deux Pepsi au panier ».
- **Action** :
  1. L'assistant identifie le produit « Pepsi ».
  2. Si **un seul produit correspond** : ajout direct au panier avec confirmation
     vocale (« J'ai ajouté deux Pepsi 355ml au panier »).
  3. Si **plusieurs produits correspondent** : affichage des suggestions dans
     la section suggestions (DEP-0185/DEP-0188) + demande de clarification
     (« J'ai trouvé deux options : Pepsi 355ml et Pepsi 2L. Lequel préférez-vous ? »).

#### 3. Navigation par catégorie à la voix

- **Exemple de commande** : « Montre-moi les boissons ».
- **Action** : grille mise à jour pour afficher la catégorie « Boissons » +
  confirmation vocale (« Voici les boissons disponibles »).

#### 4. Correction vocale

- **Exemple** : « Non, je voulais du Coca, pas du Pepsi ».
- **Action** : l'assistant retire le dernier ajout et recherche « Coca ».

### Règles de désambiguïsation (voir aussi DEP-0199)

- Si la demande est **ambiguë** (ex. « du lait » avec plusieurs marques), l'assistant
  propose les options et attend une clarification.
- Si la demande est **trop vague** (ex. « quelque chose de bon »), l'assistant
  demande une précision (voir DEP-0200).

---

## DEP-0191 — Comportement du panier au clic

### Interactions principales

#### 1. Modifier la quantité

- **Action** : clic sur [−] ou [+] à côté d'un article.
- **Résultat** :
  - [+] : incrémente la quantité de 1.
  - [−] : décrémente la quantité de 1. Si quantité = 1 et clic sur [−], affiche
    une confirmation « Retirer cet article ? [Oui] [Non] ».

#### 2. Retirer un article

- **Action** : clic sur l'icône [✕] à côté d'un article.
- **Résultat** : retrait immédiat de l'article + animation de disparition (fade-out).
- **Confirmation** : aucune confirmation si l'action est explicite (clic sur [✕]).

#### 3. Vider le panier

- **Action** : clic sur « Vider le panier ».
- **Confirmation** : modal de confirmation « Êtes-vous sûr de vouloir vider le
  panier ? [Oui] [Non] ».
- **Résultat** : tous les articles sont retirés, panier affiché vide avec
  message « Votre panier est vide. Ajoutez des produits pour commencer. »

#### 4. Commander maintenant

- **Action** : clic sur « Commander maintenant ».
- **Vérifications préalables** :
  1. Le panier **n'est pas vide**.
  2. L'utilisateur **est connecté** (sinon → redirection vers `/connexion`).
  3. L'utilisateur a une **adresse enregistrée** (sinon → redirection vers
     `/profil/adresses`).
- **Résultat** : redirection vers la page de récapitulatif de commande
  (ex. `/commande/recapitulatif`).

---

## DEP-0192 — Comportement du panier après validation de commande

### Transformation du panier

- **Avant validation** : le panier est un **objet local modifiable** (state
  côté client, synchronisé avec le backend si l'utilisateur est connecté).

- **Après validation** : le panier devient une **commande officielle** (entity
  côté backend) avec un ID unique et un état initial « Reçue ».

### Actions possibles

- Le panier **est vidé automatiquement** après validation.
- Un **nouveau panier vide** est initialisé pour permettre une nouvelle commande.
- L'utilisateur reçoit une **confirmation visuelle** : « Commande envoyée ! »
  avec un lien vers `/commandes/:id` pour suivre la commande.

### Retour arrière impossible

- Une fois validée, la commande **ne peut plus être modifiée par le client**.
- Le client peut **annuler la commande** via la page de suivi, mais pas modifier
  les articles ou quantités.

---

## DEP-0193 — Comportement du panier pendant la préparation

### État de la commande

- Statut : **« En préparation »**.
- Le panier d'origine **n'existe plus** (transformé en commande).

### Affichage pour le client

- Sur la page de suivi (`/commandes/:id`) : timeline affichant l'état actuel
  « En préparation ».
- **Aucune action possible** pour le client (lecture seule).
- Message : « Votre commande est en cours de préparation par le dépanneur. »

### Notifications

- **Optionnel V1** : notification push ou SMS au client « Votre commande est en
  préparation ».

### Interaction dépanneur

- Le dépanneur peut **signaler une indisponibilité** ou **proposer un remplacement**.
- Si un remplacement est proposé, le client reçoit une notification et peut
  accepter ou refuser via la page de suivi.

---

## DEP-0194 — Comportement du panier pendant la livraison

### État de la commande

- Statut : **« En route »** (livraison) ou **« Prête »** (enlèvement).
- Le panier d'origine **n'existe plus** (transformé en commande).

### Affichage pour le client

- Sur la page de suivi (`/commandes/:id`) : timeline affichant l'état actuel
  « En route » ou « Prête pour enlèvement ».
- **Aucune action possible** pour le client (lecture seule).
- Message (livraison) : « Votre commande est en route. Le livreur arrivera
  bientôt. »
- Message (enlèvement) : « Votre commande est prête. Vous pouvez la récupérer
  au dépanneur. »

### Notifications

- **Optionnel V1** : notification push ou SMS au client « Votre commande est en
  route » ou « Votre commande est prête ».

### Suivi livreur (optionnel V1)

- Affichage du **nom du livreur** (si assigné).
- **Pas de suivi GPS** en V1 (prévu pour V2).

---

## DEP-0195 — Comportement du panier après livraison

### État de la commande

- Statut : **« Remise »** (ou « Livrée »).
- La commande est **terminée** et archivée dans l'historique.

### Affichage pour le client

- Sur la page de suivi (`/commandes/:id`) : timeline affichant l'état final
  « Remise ».
- Message : « Votre commande a été livrée avec succès. Merci d'avoir utilisé
  [Nom du dépanneur] ! »

### Actions possibles

- **Recommander les mêmes articles** : bouton pour pré-remplir un nouveau panier
  avec les articles de cette commande.
- **Contacter le dépanneur** : lien vers `/contact` (si problème post-livraison).
- **Évaluer la commande (optionnel V1)** : système de notation simple (1-5 étoiles)
  pour améliorer le service.

### Historique

- La commande est **visible dans l'historique** (`/commandes`) avec le statut
  « Remise ».

---

## DEP-0196 — Comportement du panier si la commande échoue

### Scénarios d'échec

1. **Refusée par le dépanneur** : le dépanneur ne peut pas honorer la commande
   (ex. trop d'indisponibilités, fermeture imprévue).
2. **Annulée par le client** : le client annule la commande avant préparation.
3. **Échec de livraison** : le livreur ne peut pas livrer (ex. client absent,
   adresse incorrecte).
4. **Retour au dépanneur** : après échec de livraison, la commande retourne au
   dépanneur sans remise.

### État de la commande

- Statut : **« Refusée »**, **« Annulée »**, ou **« Échec de livraison »**.

### Affichage pour le client

- Sur la page de suivi (`/commandes/:id`) : timeline affichant l'état final avec
  explication.
- Message (refusée) : « Le dépanneur n'a pas pu honorer votre commande. Veuillez
  réessayer ou contacter le dépanneur. »
- Message (annulée) : « Votre commande a été annulée. »
- Message (échec livraison) : « La livraison a échoué. Veuillez vérifier votre
  adresse ou contacter le dépanneur. »

### Actions possibles

- **Recommander les mêmes articles** : bouton pour pré-remplir un nouveau panier.
- **Contacter le dépanneur** : lien vers `/contact`.
- **Modifier l'adresse** : lien vers `/profil/adresses` (si échec de livraison).

### Restauration du panier (optionnel V1)

- **Si la commande est refusée ou échouée** avant préparation, le système peut
  proposer de **restaurer les articles dans un nouveau panier** pour faciliter
  une nouvelle tentative.

---

## DEP-0197 — Comportement de l'assistant si le client dit seulement une catégorie

### Exemple de demande

- Client : « Boissons »
- Client : « Montre-moi les snacks »
- Client : « Je veux voir les produits laitiers »

### Comportement de l'assistant

1. **Interprétation** : l'assistant identifie la demande comme une navigation
   par catégorie.

2. **Action** :
   - Filtre la grille produits pour afficher uniquement la catégorie demandée.
   - Met à jour la navigation visuelle (catégorie active soulignée).

3. **Réponse vocale/textuelle** :
   - « Voici les boissons disponibles. »
   - « J'affiche tous les snacks. »

4. **Suggestions** :
   - Si la catégorie contient beaucoup de produits, l'assistant peut proposer
     des filtres supplémentaires : « Il y a 24 boissons. Souhaitez-vous voir
     seulement les boissons gazeuses ou toutes ? »

### Pas d'ajout automatique

- **L'assistant ne suppose pas** que le client veut acheter toute la catégorie.
- Il **attend une précision** sur un produit spécifique.

---

## DEP-0198 — Comportement de l'assistant si le client dit une marque

### Exemple de demande

- Client : « Pepsi »
- Client : « Je veux du Coca-Cola »
- Client : « Montrez-moi les produits Lays »

### Comportement de l'assistant

1. **Interprétation** : l'assistant identifie la demande comme une recherche de
   marque.

2. **Action** :
   - Recherche tous les produits contenant la marque dans leur nom ou métadonnées.
   - Si **un seul produit correspond** : affiche le produit et demande confirmation
     (« J'ai trouvé Pepsi 355ml. Souhaitez-vous l'ajouter au panier ? »).
   - Si **plusieurs produits correspondent** : affiche les suggestions dans la
     section suggestions (DEP-0185/DEP-0188) et demande de préciser (« J'ai
     trouvé 3 produits Pepsi : 355ml, 2L, et Diet 355ml. Lequel préférez-vous ? »).

3. **Réponse vocale/textuelle** :
   - « Voici les produits [Marque] disponibles. »
   - « J'ai trouvé [X] options [Marque]. Laquelle vous intéresse ? »

4. **Ajout au panier** :
   - L'assistant **ne peut pas ajouter automatiquement** un produit sans
     confirmation explicite du client.
   - Il **attend une précision** (taille, format) ou une confirmation.

---

## DEP-0199 — Comportement de l'assistant si le client dit un produit ambigu

### Exemple de demande

- Client : « Du lait » (plusieurs marques, plusieurs formats).
- Client : « Des chips » (plusieurs saveurs, plusieurs marques).
- Client : « Un Pepsi » (355ml, 2L, Diet, etc.).

### Comportement de l'assistant

1. **Interprétation** : l'assistant identifie que la demande correspond à
   plusieurs produits distincts.

2. **Action de désambiguïsation** :
   - **Étape 1** : affichage des suggestions dans la section suggestions
     (DEP-0185/DEP-0188).
   - **Étape 2** : demande de clarification vocale/textuelle :
     - « J'ai trouvé 3 options de lait : 2% Natrel 1L, 3,25% Natrel 2L, et
       Lactose-free 1L. Lequel préférez-vous ? »

3. **Réponse vocale/textuelle** :
   - « Il y a plusieurs options. Pouvez-vous préciser ? »
   - « J'ai trouvé [X] produits correspondants. Voir les suggestions. »

4. **Attente de clarification** :
   - L'assistant **attend une réponse du client** avant d'ajouter au panier.
   - Si le client précise (« Le 2% »), l'assistant ajoute le produit correspondant.
   - Si le client clique sur une suggestion, ajout direct au panier.

### Stratégie de désambiguïsation V1

- **Prioriser les produits populaires** : si un produit est significativement
  plus commandé, l'assistant peut le suggérer en premier (« Le plus populaire
  est [Produit]. Est-ce celui-ci ? »).
- **Limiter à 5 suggestions maximum** : éviter de submerger le client.

---

## DEP-0200 — Comportement de l'assistant si le client ne sait pas quoi choisir

### Exemple de demande

- Client : « Je ne sais pas quoi prendre. »
- Client : « Qu'est-ce que vous me conseillez ? »
- Client : « Aidez-moi à choisir. »
- Client : « Je veux quelque chose de bon. »

### Comportement de l'assistant

1. **Interprétation** : l'assistant identifie que le client cherche de l'aide
   ou une recommandation générale.

2. **Action** :
   - **Étape 1** : poser des questions de précision pour affiner la demande :
     - « Cherchez-vous quelque chose de sucré, salé, ou une boisson ? »
     - « Voulez-vous voir les produits populaires ou reprendre votre dernière
       commande ? »

3. **Réponse vocale/textuelle** :
   - « Voici nos produits les plus populaires cette semaine. »
   - « Que diriez-vous de recommander votre dernière commande ? »
   - « Cherchez-vous quelque chose en particulier, comme une collation ou une
     boisson ? »

4. **Suggestions proactives** :
   - Afficher dans la section suggestions :
     - Les **produits populaires** (top 5).
     - La **dernière commande** du client (si disponible).
     - Les **promotions en cours** (si applicable).

5. **Redirection vers la navigation** :
   - « Vous pouvez aussi parcourir nos catégories : Boissons, Snacks, Produits
     laitiers, etc. »

### Stratégie V1

- **Éviter les recommandations trop génériques** : l'assistant ne doit pas dire
  « Tout est bon ! » sans proposer d'action concrète.
- **Proposer des choix limités** : maximum 3-5 suggestions pour ne pas submerger
  le client.
- **Encourager l'exploration** : rappeler que le client peut parcourir la
  boutique manuellement.

---

## Résumé des décisions

### Dispositions (layouts)

- **DEP-0181** : Desktop → 3 sections (catégories | grille | panier+chat+sugg.).
- **DEP-0182** : Mobile → empilée verticale (header | recherche | filtres | grille | panier flottant).

### Emplacements desktop

- **DEP-0183** : Panier → Section 3, en haut, sticky.
- **DEP-0184** : Chat → Section 3, sous le panier, sticky, visible en mode assisté.
- **DEP-0185** : Suggestions → Section 3, sous le chat, sticky, conditionnelles.

### Emplacements mobile

- **DEP-0186** : Panier → bouton flottant en bas, ouverture en slide-up modal.
- **DEP-0187** : Chat → icône flottante bas droite, ouverture en plein écran.
- **DEP-0188** : Suggestions → bandeau horizontal défilable sous la recherche.

### Comportements de la grille produits

- **DEP-0189** : Clic → modal détail, ajout au panier, recherche, filtrage.
- **DEP-0190** : Voix → recherche vocale, ajout au panier, navigation, correction.

### Comportements du panier

- **DEP-0191** : Clic → modifier quantité, retirer, vider, commander.
- **DEP-0192** : Après validation → panier vidé, commande créée, confirmation.
- **DEP-0193** : Pendant préparation → lecture seule, notifications, remplacements.
- **DEP-0194** : Pendant livraison → lecture seule, notifications, suivi livreur.
- **DEP-0195** : Après livraison → terminée, recommander, contacter, évaluer.
- **DEP-0196** : Échec → refusée/annulée/échec livraison, restauration panier.

### Comportements de l'assistant

- **DEP-0197** : Catégorie → filtre grille, confirmation, pas d'ajout auto.
- **DEP-0198** : Marque → recherche, suggestions si plusieurs, confirmation.
- **DEP-0199** : Ambigu → désambiguïsation, suggestions, attente de clarification.
- **DEP-0200** : Indécis → questions de précision, suggestions proactives, redirection.

---

## Cohérence et révisions

### Incohérences corrigées

- **Aucune incohérence majeure détectée** dans les documents existants.
- Alignement avec les décisions précédentes (DEP-0161 à DEP-0180).

### Prochaines étapes recommandées

- **Bloc suivant** : DEP-0201 à DEP-0210 (couleurs et typographie).
- **Validation** : faire valider ce document avant de commencer le bloc suivant.
- **Prototypage** : créer des maquettes basse fidélité pour visualiser les
  dispositions définies.

---

## Références

- **DEP-0161 à DEP-0170** : Cartes du site et pages principales.
- **DEP-0171 à DEP-0180** : Pages secondaires.
- **DEP-0153** : Règles de nommage des routes (kebab-case).
