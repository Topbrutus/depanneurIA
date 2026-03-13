# DEP-0377 à DEP-0400 — Compréhension, UI et validations de l'assistant texte

## Périmètre

Ce document définit les **logiques de compréhension des intents clients**
(catégorie, marque, parfum, quantité, correction, retrait, remplacement,
commande incomplète, ambiguïtés), les **composants UI du chat** (boîte,
entrée texte, bouton envoi, bouton micro, suggestions) et les **garde-fous
comportementaux** de l'assistant texte en V1.

Il conclut le macro-bloc DEP-0361–0400 en **gelant le comportement V1 complet
de l'assistant texte** avant toute extension future.

Principe directeur : **l'assistant ne devine jamais seul.** Quand il ne comprend
pas, il demande. Quand il y a ambiguïté, il propose un choix. Il ne crée ni ne
modifie aucune donnée sans action explicite et validée du client.

Il s'agit exclusivement de **documentation** : aucun code produit, aucune
implémentation. Les spécifications décrites ici serviront de référence pour les
futures implémentations front-end et back-end.

---

## DEP-0377 — Logique de compréhension d'une catégorie simple

### Objectif

Définir comment l'assistant reconnaît et mappe un mot désignant une catégorie
de produits dans un message client.

### Mécanisme

1. L'assistant reçoit un message texte du client.
2. Il tente de faire correspondre les tokens du message à la liste des
   **catégories disponibles dans le catalogue**.
3. Si une correspondance directe ou proche est trouvée (synonymes courants),
   il déclenche `ACTION_FILTER` avec la catégorie identifiée.
4. Si aucune correspondance n'est trouvée, il demande une clarification.

### Correspondances acceptées

| Token client       | Catégorie mappée  | Type de correspondance |
|--------------------|-------------------|------------------------|
| « chips »          | Chips & snacks    | Directe                |
| « snacks »         | Chips & snacks    | Synonyme               |
| « boissons »       | Boissons          | Directe                |
| « lait »           | Produits laitiers | Directe                |
| « café »           | Épicerie          | Directe                |

> La liste exhaustive des catégories et synonymes est définie dans le catalogue
> (DEP-0241–0255). Ce document fixe uniquement la logique de mappage.

### Règles

- La correspondance est insensible à la casse et aux accents.
- Un seul token peut identifier une catégorie (pas besoin de phrase complète).
- En cas de doute entre deux catégories proches, l'assistant propose les deux.
- L'assistant n'invente jamais une catégorie absente du catalogue.

### Cas attendus

| Message client             | Résultat attendu                                  |
|----------------------------|---------------------------------------------------|
| « chips »                  | ✅ Filtre catégorie Chips & snacks déclenché      |
| « quelque chose à boire »  | ✅ Filtre catégorie Boissons déclenché            |
| « des trucs »              | ❌ Catégorie non identifiée — demande clarification|

---

## DEP-0378 — Logique de compréhension d'une marque simple

### Objectif

Définir comment l'assistant reconnaît et mappe un mot désignant une marque
de produits présente dans le catalogue.

### Mécanisme

1. L'assistant reçoit un message contenant le nom d'une marque.
2. Il tente de faire correspondre le token à la liste des **marques disponibles
   dans le catalogue**.
3. Si une correspondance directe ou proche est trouvée, il déclenche
   `ACTION_FILTER` avec la marque identifiée.
4. Si aucune correspondance, il informe le client que cette marque n'est pas
   disponible et propose les marques proches si elles existent.

### Règles

- La correspondance est insensible à la casse et aux accents.
- Les abréviations courantes sont acceptées (ex. : « MC » pour une marque
  dont c'est l'abréviation reconnue dans le catalogue).
- L'assistant n'invente jamais une marque absente du catalogue.
- Si la marque existe mais qu'aucun produit n'est disponible, il le signale.

### Cas attendus

| Message client   | Résultat attendu                                    |
|------------------|-----------------------------------------------------|
| « Lay's »        | ✅ Filtre marque Lay's déclenché                    |
| « Pepsi »        | ✅ Filtre marque Pepsi déclenché                    |
| « MarcheXYZ »    | ❌ Marque inconnue — assistant informe le client    |

---

## DEP-0379 — Logique de compréhension d'un parfum simple

### Objectif

Définir comment l'assistant reconnaît et mappe un mot désignant un parfum
ou une variante de produit (goût, arôme, saveur).

### Mécanisme

1. L'assistant reçoit un message contenant un parfum (ex. : « ketchup »,
   « nature », « barbecue »).
2. Il tente de faire correspondre le token à la liste des **variantes disponibles**
   pour les produits ou catégories déjà identifiés dans la session.
3. Si une correspondance est trouvée, il affine le filtre ou la sélection.
4. Si aucune correspondance, il informe le client que ce parfum n'est pas
   disponible dans la sélection actuelle.

### Règles

- Le parfum est toujours contextualisé : il affine une sélection existante
  (catégorie ou marque déjà identifiée).
- L'assistant n'applique pas un filtre parfum sans contexte de produit ou
  catégorie préalable.
- L'assistant n'invente jamais un parfum absent du catalogue.

### Cas attendus

| Contexte                | Message client    | Résultat attendu                          |
|-------------------------|-------------------|-------------------------------------------|
| Catégorie chips filtrée | « ketchup »       | ✅ Variante ketchup sélectionnée          |
| Catégorie chips filtrée | « pizza »         | ❌ Parfum indisponible — client informé   |
| Aucun contexte          | « ketchup »       | ❌ Contexte manquant — demande de précision|

---

## DEP-0380 — Logique de compréhension d'une quantité simple

### Objectif

Définir comment l'assistant extrait et applique une quantité mentionnée par
le client dans son message.

### Mécanisme

1. L'assistant détecte la présence d'un nombre ou d'une expression numérique
   dans le message (chiffre, mot numéral, expression courante).
2. Il associe cette quantité au produit identifié dans le même message ou
   dans le contexte immédiat de la session.
3. Il déclenche `ACTION_ADD_TO_CART` ou `ACTION_UPDATE_QTY` avec la quantité
   extraite.

### Expressions acceptées

| Expression client         | Quantité extraite |
|---------------------------|-------------------|
| « 2 », « deux »           | 2                 |
| « trois »                 | 3                 |
| « une bouteille »         | 1                 |
| « un paquet »             | 1                 |
| « quelques-uns »          | → demande précision|

### Règles

- La quantité minimale est 1 ; la quantité maximale en V1 est définie par le
  catalogue (limite stock ou limite panier).
- Si la quantité est ambiguë (ex. : « quelques »), l'assistant demande une
  précision avant d'agir.
- Si aucune quantité n'est mentionnée, la valeur par défaut est 1.
- L'assistant ne dépasse jamais le stock disponible.

### Cas attendus

| Message client                  | Résultat attendu                           |
|---------------------------------|--------------------------------------------|
| « 3 Pepsi »                     | ✅ Quantité 3 extraite, produit ajouté     |
| « deux paquets de chips Lay's » | ✅ Quantité 2 extraite, produit ajouté     |
| « quelques chips »              | ❌ Ambiguïté — demande de précision        |

---

## DEP-0381 — Logique de compréhension d'une correction client

### Objectif

Définir comment l'assistant détecte et applique une correction apportée par
le client sur un choix précédemment fait dans la session.

### Mécanisme

1. L'assistant détecte un **signal de correction** dans le message client
   (négation, reformulation, mot de correction explicite).
2. Il identifie l'élément corrigé (produit, quantité, marque, parfum).
3. Il annule ou modifie l'action précédente et applique la nouvelle valeur.
4. Il confirme la correction au client avant de poursuivre.

### Signaux de correction reconnus

| Signal                         | Type          |
|--------------------------------|---------------|
| « non », « non pas ça »        | Annulation    |
| « plutôt », « en fait »        | Remplacement  |
| « pas ça, mais… »              | Remplacement  |
| « retire », « enlève »         | Retrait (→ DEP-0382) |
| « change », « modifie »        | Modification  |

### Règles

- L'assistant confirme toujours la correction avant d'appliquer le changement.
- En cas de doute sur l'élément corrigé, il demande une clarification.
- La correction s'applique **uniquement à la session en cours**.
- Une correction ne peut pas s'appliquer à une commande déjà validée et envoyée.

### Cas attendus

| Message client           | Résultat attendu                                    |
|--------------------------|-----------------------------------------------------|
| « non, plutôt Pepsi »    | ✅ Produit précédent remplacé par Pepsi, confirmé   |
| « en fait, 2 et non 3 »  | ✅ Quantité mise à jour à 2, confirmé               |
| « non »                  | ❌ Ambiguïté — l'assistant demande ce qu'il faut corriger|

---

## DEP-0382 — Logique de compréhension d'un retrait de produit

### Objectif

Définir comment l'assistant reconnaît et exécute une demande de retrait d'un
produit du panier.

### Mécanisme

1. L'assistant détecte un **signal de retrait** dans le message client.
2. Il identifie le produit ciblé (par nom, marque, parfum ou position dans
   le panier si mentionné).
3. Il déclenche `ACTION_UPDATE_QTY` à 0 (ou une action de suppression dédiée)
   sur le produit identifié.
4. Il confirme le retrait au client.

### Signaux de retrait reconnus

| Signal                              | Exemple                          |
|-------------------------------------|----------------------------------|
| « retire », « enlève »              | « Enlève les chips »             |
| « supprime », « efface »            | « Supprime le Pepsi »            |
| « je ne veux plus »                 | « Je ne veux plus le lait »      |
| « annule »                          | « Annule le dernier ajout »      |

### Règles

- Si plusieurs produits correspondent à la description, l'assistant affiche
  les candidats et demande lequel retirer.
- Le retrait est confirmé avant d'être appliqué.
- Si le panier est vide, l'assistant informe le client qu'il n'y a rien à retirer.

### Cas attendus

| Message client               | Résultat attendu                                  |
|------------------------------|---------------------------------------------------|
| « Enlève les chips Lay's »   | ✅ Chips Lay's retirées du panier, confirmé       |
| « Retire le Pepsi »          | ✅ Pepsi retiré du panier, confirmé               |
| « Retire les chips » (2 réf.)| ❌ Ambiguïté — assistant affiche les candidats    |

---

## DEP-0383 — Logique de compréhension d'un remplacement de produit

### Objectif

Définir comment l'assistant reconnaît et exécute une demande de remplacement
d'un produit par un autre dans le panier.

### Mécanisme

1. L'assistant détecte un **signal de remplacement** dans le message client.
2. Il identifie le **produit source** (à remplacer) et le **produit cible**
   (le nouveau produit).
3. Il retire le produit source du panier et ajoute le produit cible avec la
   même quantité.
4. Il confirme le remplacement au client.

### Signaux de remplacement reconnus

| Signal                           | Exemple                                     |
|----------------------------------|---------------------------------------------|
| « remplace … par … »             | « Remplace le Pepsi par du Coca »           |
| « plutôt … à la place de … »     | « Plutôt du lait entier à la place du lait »|
| « change … pour … »              | « Change les Lay's pour des Pringles »      |

### Règles

- Le produit cible doit exister dans le catalogue. Sinon, l'assistant informe
  le client et conserve le produit source.
- Si le produit source n'est pas dans le panier, l'assistant le signale.
- Le remplacement est confirmé avant d'être appliqué.
- La quantité est conservée à l'identique sauf indication contraire du client.

### Cas attendus

| Message client                        | Résultat attendu                                |
|---------------------------------------|-------------------------------------------------|
| « Remplace le Pepsi par du Coca »     | ✅ Pepsi retiré, Coca ajouté (même quantité)    |
| « Remplace le Pepsi par du ZYX »      | ❌ Produit ZYX introuvable — source conservé    |
| « Remplace le Pepsi » (sans cible)    | ❌ Cible manquante — demande de précision       |

---

## DEP-0384 — Logique de compréhension d'une commande incomplète

### Objectif

Définir comment l'assistant détecte qu'un message client contient une demande
incomplète (produit identifié mais quantité, marque ou parfum manquant) et
comment il demande les informations manquantes.

### Mécanisme

1. L'assistant reçoit un message où un produit est identifié mais des
   informations nécessaires manquent.
2. Il identifie les **champs manquants** (quantité par défaut = 1 si absent,
   marque ou parfum requis si plusieurs options existent).
3. Il pose une question ciblée pour compléter la demande avant d'agir.

### Règles de complétude

| Champ     | Comportement si absent                                             |
|-----------|--------------------------------------------------------------------|
| Quantité  | Valeur par défaut : 1 — pas de demande de précision               |
| Marque    | Si une seule marque disponible : appliquée directement            |
| Marque    | Si plusieurs marques disponibles : demande de précision (→ DEP-0385)|
| Parfum    | Si un seul parfum disponible : appliqué directement               |
| Parfum    | Si plusieurs parfums disponibles : demande de précision           |
| Produit   | Non identifiable : demande de précision sur le produit            |

### Règles générales

- L'assistant ne bloque jamais inutilement : si la valeur par défaut est
  suffisante, il l'applique sans demander.
- Il ne pose qu'une seule question à la fois pour éviter la surcharge.
- Une demande incomplète ne génère aucune action avant d'être complétée.

### Cas attendus

| Message client      | Résultat attendu                                     |
|---------------------|------------------------------------------------------|
| « des chips »       | ✅ Si 1 marque dispo : ajout direct avec quantité 1  |
| « des chips »       | ❌ Si N marques dispo : demande de marque (→ DEP-0385)|
| « du Pepsi »        | ✅ Si 1 format dispo : ajout direct avec quantité 1  |
| « quelque chose »   | ❌ Produit non identifiable — demande de précision   |

---

## DEP-0385 — Logique d'ambiguïté « chips ketchup » avec plusieurs marques

### Objectif

Définir la stratégie de résolution lorsque le client demande un produit
identifiable par catégorie + parfum mais pour lequel plusieurs marques sont
disponibles dans le catalogue.

### Exemple de référence

> Client : « des chips ketchup »
> → Catégorie : Chips & snacks ✅
> → Parfum : Ketchup ✅
> → Marque : Lay's Ketchup ET Pringles Ketchup ET Marque X Ketchup ← ambiguïté

### Mécanisme

1. L'assistant identifie la catégorie et le parfum.
2. Il détecte qu'il existe **plusieurs produits correspondants** de marques
   différentes.
3. Il affiche les options disponibles sous forme de liste de suggestions
   cliquables.
4. Le client sélectionne une option ou précise sa préférence par texte.
5. L'assistant applique le choix et confirme l'ajout.

### Format de la question posée

> « J'ai trouvé plusieurs chips ketchup. Laquelle veux-tu ? »
> → [Lay's Ketchup 200g — X,XX €]
> → [Pringles Ketchup 165g — X,XX €]
> → [Autre marque…]

### Règles

- L'assistant n'ajoute **jamais** un produit arbitrairement en cas d'ambiguïté
  de marque.
- Les options sont tirées exclusivement du catalogue en temps réel.
- Si une seule option est disponible après filtrage, elle est proposée
  directement sans question.
- Les prix affichés sont ceux du catalogue (aucun prix inventé — DEP-0397).

### Cas attendus

| Situation                                    | Résultat attendu                               |
|----------------------------------------------|------------------------------------------------|
| 3 marques de chips ketchup disponibles       | ✅ Liste des 3 options affichée                |
| 1 seule marque de chips ketchup disponible   | ✅ Produit proposé directement sans ambiguïté  |
| 0 marque de chips ketchup disponible         | ❌ Client informé de l'indisponibilité         |

---

## DEP-0386 — Logique d'ambiguïté « Pepsi » avec plusieurs formats (si un jour il y en a)

### Objectif

Définir la stratégie de résolution lorsque le client demande « Pepsi » et que
plusieurs formats (33 cl, 50 cl, 1,5 L, canette, bouteille) sont disponibles
dans le catalogue.

### Statut V1

> **En V1, un seul format de Pepsi est disponible dans le catalogue.** Cette
> logique est **définie mais non active**. Elle s'activera automatiquement dès
> qu'un second format sera ajouté au catalogue sans modification de code.

### Mécanisme (si ambiguïté détectée)

1. L'assistant identifie le produit « Pepsi » sans format précisé.
2. Il détecte que plusieurs formats sont disponibles.
3. Il affiche les options de format disponibles sous forme de suggestions.
4. Le client sélectionne son format.
5. L'assistant confirme l'ajout.

### Format de la question posée (si activée)

> « Quel format de Pepsi veux-tu ? »
> → [Pepsi 33 cl — X,XX €]
> → [Pepsi 1,5 L — X,XX €]

### Règles

- En V1 (un seul format) : le produit est ajouté directement sans question.
- Dès qu'un second format existe : la question est posée automatiquement.
- L'assistant n'invente jamais un format absent du catalogue.
- Les prix affichés sont ceux du catalogue (aucun prix inventé — DEP-0397).

### Cas attendus

| Situation                          | Résultat attendu                                 |
|------------------------------------|--------------------------------------------------|
| 1 seul format Pepsi (V1)           | ✅ Ajout direct, pas de question de format       |
| 2+ formats Pepsi (futur)           | ✅ Liste des formats affichée, choix demandé     |
| Pepsi absent du catalogue          | ❌ Client informé de l'indisponibilité           |

---

## DEP-0387 — Logique d'ambiguïté « du lait » avec plusieurs sortes (si un jour il y en a)

### Objectif

Définir la stratégie de résolution lorsque le client demande « du lait » et que
plusieurs sortes (entier, demi-écrémé, écrémé, végétal…) sont disponibles dans
le catalogue.

### Statut V1

> **En V1, une seule sorte de lait est disponible dans le catalogue.** Cette
> logique est **définie mais non active**. Elle s'activera automatiquement dès
> qu'une seconde sorte sera ajoutée au catalogue sans modification de code.

### Mécanisme (si ambiguïté détectée)

1. L'assistant identifie le produit « lait » sans sorte précisée.
2. Il détecte que plusieurs sortes sont disponibles.
3. Il affiche les options de sortes disponibles sous forme de suggestions.
4. Le client sélectionne sa sorte.
5. L'assistant confirme l'ajout.

### Format de la question posée (si activée)

> « Quelle sorte de lait veux-tu ? »
> → [Lait entier 1 L — X,XX €]
> → [Lait demi-écrémé 1 L — X,XX €]

### Règles

- En V1 (une seule sorte) : le produit est ajouté directement sans question.
- Dès qu'une seconde sorte existe : la question est posée automatiquement.
- L'assistant n'invente jamais une sorte absente du catalogue.
- Les prix affichés sont ceux du catalogue (aucun prix inventé — DEP-0397).

### Cas attendus

| Situation                        | Résultat attendu                                 |
|----------------------------------|--------------------------------------------------|
| 1 seule sorte de lait (V1)       | ✅ Ajout direct, pas de question de sorte        |
| 2+ sortes de lait (futur)        | ✅ Liste des sortes affichée, choix demandé      |
| Lait absent du catalogue         | ❌ Client informé de l'indisponibilité           |

---

## DEP-0388 — Boîte de chat de l'assistant

### Objectif

Définir les caractéristiques de la boîte de chat qui contient l'interface
conversationnelle de l'assistant texte.

### Spécifications

| Attribut               | Valeur                                                        |
|------------------------|---------------------------------------------------------------|
| Emplacement            | Partie droite ou basse de l'écran boutique (selon breakpoint) |
| État par défaut        | Réduit (icône ou bandeau discret) — non intrusif              |
| État ouvert            | Panneau latéral ou overlay flottant selon la taille d'écran   |
| Déclencheur d'ouverture| Clic sur l'icône assistant ou le bouton « Aide »              |
| Déclencheur de fermeture| Clic sur la croix, touche Échap, ou clic hors du panneau     |
| Hauteur visible (ouvert)| 60 % de la hauteur de l'écran (desktop), plein écran (mobile)|
| Scrollable             | Oui — historique de la session visible et scrollable          |
| Persistance affichage  | La boîte reste ouverte si le client navigue dans la boutique  |

### Règles

- La boîte de chat n'obstrue jamais le bouton de validation du panier.
- Elle est accessible au clavier (focus trap quand ouverte).
- Elle ne s'ouvre pas automatiquement sans action du client.
- Sur mobile, elle prend tout l'écran une fois ouverte pour faciliter la saisie.

---

## DEP-0389 — Entrée texte du client

### Objectif

Définir les caractéristiques du champ de saisie dans lequel le client tape
son message à destination de l'assistant.

### Spécifications

| Attribut              | Valeur                                                         |
|-----------------------|----------------------------------------------------------------|
| Type                  | Zone de texte mono-ligne (extensible si message long)          |
| Placeholder           | « Que cherches-tu ? (ex. : 2 Pepsi, des chips ketchup…) »     |
| Taille maximale       | 500 caractères                                                 |
| Soumission clavier    | Touche Entrée (sans Shift) envoie le message                  |
| Soumission mobile     | Bouton « Envoyer » du clavier natif ou bouton UI (DEP-0390)   |
| Auto-focus            | Oui — dès que la boîte de chat est ouverte                    |
| Accessibilité         | Label ARIA : « Message à l'assistant »                        |

### Règles

- Le champ est vidé après chaque envoi réussi.
- Shift + Entrée insère un saut de ligne sans envoyer.
- Le champ est désactivé pendant le traitement de la réponse de l'assistant
  (indicateur de chargement visible).
- Les emojis sont acceptés mais non interprétés sémantiquement en V1.

---

## DEP-0390 — Bouton d'envoi texte

### Objectif

Définir les caractéristiques du bouton qui permet au client d'envoyer son
message à l'assistant.

### Spécifications

| Attribut              | Valeur                                                     |
|-----------------------|------------------------------------------------------------|
| Libellé               | Icône « envoyer » (flèche) + label ARIA « Envoyer »        |
| Position              | À droite du champ de saisie (DEP-0389)                     |
| État actif            | Quand le champ de saisie contient au moins un caractère    |
| État désactivé        | Quand le champ est vide ou pendant le traitement           |
| Feedback visuel       | Indicateur de chargement pendant le traitement de l'envoi  |

### Règles

- Le bouton est désactivé si le champ est vide (pas d'envoi de message vide).
- Le même comportement que la touche Entrée (DEP-0389).
- Le bouton est accessible au clavier (focusable, activable via Espace/Entrée).

---

## DEP-0391 — Bouton micro du mode assisté écran

### Objectif

Définir les caractéristiques du bouton micro permettant au client d'activer
la dictée vocale dans le mode assisté écran (saisie vocale → texte).

### Statut V1

> Ce bouton est **présent dans l'interface** mais son activation dépend de
> la disponibilité de l'API Web Speech du navigateur. Il est visible et
> fonctionnel sur les navigateurs compatibles ; il est masqué ou désactivé
> sur les navigateurs non compatibles.

### Spécifications

| Attribut              | Valeur                                                        |
|-----------------------|---------------------------------------------------------------|
| Icône                 | Microphone                                                    |
| Position              | À gauche du champ de saisie ou à droite du bouton d'envoi    |
| Label ARIA            | « Dicter un message »                                        |
| État actif (écoute)   | Icône animée (pulsation) + fond coloré                       |
| État inactif          | Icône statique, fond neutre                                  |
| Comportement          | Clic → active la dictée ; dictée terminée → texte injecté dans le champ |

### Règles

- La dictée vocale remplace la saisie clavier : le texte dicté apparaît
  dans le champ de saisie (DEP-0389) et peut être modifié avant envoi.
- L'envoi n'est **pas automatique** après dictée : le client valide toujours.
- Si le navigateur ne supporte pas la dictée, le bouton n'est pas affiché.
- Aucune donnée vocale n'est stockée par l'assistant en V1.

---

## DEP-0392 — Affichage des suggestions produits de l'assistant

### Objectif

Définir comment l'assistant affiche les suggestions de produits dans la boîte
de chat lorsqu'il propose des options au client.

### Format d'affichage

Chaque suggestion produit affichée par l'assistant contient :

| Élément           | Description                                         |
|-------------------|-----------------------------------------------------|
| Nom du produit    | Nom complet tel qu'il apparaît dans le catalogue    |
| Format / contenance | Ex. : 200 g, 33 cl, 1 L                           |
| Prix TTC          | Prix exact issu du catalogue (aucun prix inventé)   |
| Image miniature   | Si disponible dans le catalogue (optionnel en V1)   |
| Bouton d'action   | « Ajouter » ou « Choisir »                         |

### Règles de présentation

- Maximum **4 suggestions** affichées simultanément en V1.
- Si plus de 4 résultats existent, l'assistant indique qu'il peut affiner
  et invite le client à préciser.
- Les suggestions sont des **boutons cliquables** (→ DEP-0393).
- Les données (nom, prix) sont issues du catalogue en temps réel.
- L'assistant n'affiche jamais un produit absent du catalogue.

### Règles d'accessibilité

- Chaque suggestion est focusable au clavier.
- Le nom du produit et le prix sont lus par les lecteurs d'écran.

---

## DEP-0393 — Action de clic sur une suggestion proposée par l'assistant

### Objectif

Définir ce qui se passe lorsque le client clique sur une suggestion de produit
affichée par l'assistant (DEP-0392).

### Comportement

1. Le client clique sur une suggestion (ou l'active au clavier).
2. L'assistant déclenche `ACTION_ADD_TO_CART` pour ce produit avec quantité 1
   (ou la quantité précédemment mentionnée dans la session si applicable).
3. Le panier est mis à jour (→ DEP-0395 pour la fermeture des suggestions).
4. L'assistant confirme l'ajout dans la boîte de chat avec un message court.
5. Les autres suggestions sont réduites (→ DEP-0394).

### Message de confirmation

> « ✅ [Nom du produit] ajouté à ton panier. »

### Règles

- Un seul clic suffit — pas de double confirmation requise.
- Si le produit n'est plus disponible au moment du clic (rupture de stock
  survenue entre-temps), l'assistant informe le client et retire la suggestion.
- L'action est irréversible sans action explicite du client (mais le client
  peut retirer le produit — DEP-0382).

---

## DEP-0394 — Réduction des suggestions après sélection d'un produit

### Objectif

Définir le comportement de l'affichage des suggestions une fois qu'un produit
a été sélectionné par le client.

### Comportement

1. Le client clique sur une suggestion (DEP-0393).
2. Les suggestions non sélectionnées sont **réduites visuellement** :
   disparaissent ou passent en état réduit/grisé.
3. Seule la suggestion sélectionnée reste visible brièvement, accompagnée
   du message de confirmation.
4. Après 2 secondes, les suggestions disparaissent et la boîte de chat
   revient à l'état conversationnel normal.

### Règles

- La réduction est animée (transition douce, < 300 ms) pour ne pas désorienter.
- Si le client souhaite voir les autres suggestions après sélection, il peut
  reposer sa question.
- Les suggestions disparaissent complètement une fois le panier mis à jour
  (→ DEP-0395).
- La réduction ne vide pas l'historique de conversation.

---

## DEP-0395 — Fermeture des suggestions quand le panier se met à jour

### Objectif

Définir le déclencheur automatique de fermeture des suggestions produits
lorsque le panier est mis à jour.

### Comportement

1. Le panier est mis à jour (ajout, retrait, modification de quantité).
2. Les suggestions actives dans la boîte de chat sont automatiquement fermées.
3. L'assistant affiche le message de confirmation de l'action panier.
4. La boîte de chat reste ouverte et prête pour la prochaine interaction.

### Règles

- La fermeture est déclenchée par **toute mise à jour du panier**, qu'elle
  provienne d'un clic sur une suggestion ou d'une action directe dans la boutique.
- La fermeture est immédiate (sans délai de grâce) une fois le panier confirmé.
- Elle ne ferme pas la boîte de chat elle-même — seulement le bloc de suggestions.
- Si une liste de suggestions est affichée et que le client met à jour le panier
  manuellement (hors clic suggestion), les suggestions se ferment également.

---

## DEP-0396 — Vérifier que l'assistant n'invente jamais un produit absent du catalogue

### Objectif

Définir la règle de garde fondamentale interdisant à l'assistant de proposer,
suggérer ou confirmer un produit qui n'existe pas dans le catalogue actif.

### Règle

> **L'assistant ne peut jamais afficher, proposer, ajouter ou confirmer un
> produit qui n'est pas présent et disponible dans le catalogue en temps réel.**

### Mécanisme de vérification

1. Avant toute suggestion ou action produit, l'assistant interroge le catalogue.
2. Si le produit n'existe pas, il informe le client qu'il n'est pas disponible.
3. Il peut proposer des alternatives existantes si elles sont pertinentes.
4. Il ne génère jamais de nom de produit fictif.

### Cas de violation (interdits)

| Situation                                   | Comportement interdit               |
|---------------------------------------------|-------------------------------------|
| Client demande un produit absent            | ❌ Ne jamais affirmer qu'il existe  |
| Recherche retourne 0 résultat               | ❌ Ne jamais inventer un résultat   |
| Catalogue non disponible (erreur technique) | ❌ Ne jamais utiliser un cache périmé comme vérité |

### Comportement attendu en cas de produit absent

> « Ce produit n'est pas disponible dans notre catalogue pour le moment. »
> (+ proposition d'alternatives si applicable)

---

## DEP-0397 — Vérifier que l'assistant n'invente jamais un prix public non prévu

### Objectif

Définir la règle de garde interdisant à l'assistant d'afficher, de mentionner
ou de confirmer un prix qui n'est pas issu directement du catalogue en temps réel.

### Règle

> **L'assistant ne peut jamais afficher ni mentionner un prix qui n'est pas
> fourni par le catalogue au moment de l'interaction.**

### Mécanisme de vérification

1. Chaque prix affiché dans les suggestions (DEP-0392) est lu depuis le catalogue.
2. L'assistant ne calcule jamais un prix manuellement.
3. L'assistant ne mémorise pas les prix entre sessions.
4. En cas d'absence de prix dans le catalogue, il affiche « Prix non disponible »
   et n'invente pas de valeur.

### Cas de violation (interdits)

| Situation                                   | Comportement interdit                     |
|---------------------------------------------|-------------------------------------------|
| Prix absent dans le catalogue               | ❌ Ne jamais afficher un prix supposé     |
| Calcul de promotion non confirmée           | ❌ Ne jamais appliquer une remise non officielle |
| Cache périmé                                | ❌ Ne jamais afficher un prix expiré comme valide |

### Comportement attendu si prix absent

> Afficher « — » ou « Prix non disponible » à la place du montant.

---

## DEP-0398 — Vérifier que l'assistant pilote la boutique au lieu de la remplacer

### Objectif

Valider que l'assistant respecte son rôle d'interface conversationnelle en
déléguant toujours l'exécution aux composants de la boutique, sans substituer
ses propres réponses à l'état réel de la boutique.

### Principe à valider

> **L'assistant pilote. La boutique exécute. Le client valide.**
> (Référence : DEP-0361)

### Vérifications

| Comportement à valider                                      | Résultat attendu                               |
|-------------------------------------------------------------|------------------------------------------------|
| Ajout au panier via l'assistant                             | ✅ Panier mis à jour dans la boutique réelle   |
| Filtrage via l'assistant                                    | ✅ Filtre appliqué sur la page boutique réelle |
| Affichage d'un produit via l'assistant                      | ✅ Fiche produit ouverte dans la boutique réelle|
| L'assistant affiche son propre inventaire                   | ❌ Interdit — pas de catalogue interne         |
| L'assistant gère son propre panier                          | ❌ Interdit — seul le panier boutique fait foi |
| L'assistant confirme une commande sans passer par la boutique| ❌ Interdit — la boutique valide toujours      |

### Règle de fond

- Toute action visible résultant d'une interaction avec l'assistant doit être
  **reflétée dans les composants visuels de la boutique** en temps réel.
- L'assistant n'a pas d'état propre pour le catalogue, les prix ou le panier.

---

## DEP-0399 — Vérifier que l'assistant appelle les fonctions du site plutôt que du texte libre non contrôlé

### Objectif

Valider que l'assistant déclenche des **actions structurées** (appels de
fonctions définis) pour toute interaction avec la boutique, sans jamais se
contenter de produire du texte libre non actionnable.

### Principe à valider

> **Chaque réponse de l'assistant qui modifie l'état de la boutique passe par
> un appel de fonction structuré, jamais par du texte libre interprété côté client.**

### Actions structurées attendues (référence DEP-0362)

| Action                  | Déclencheur textuel exemple             |
|-------------------------|-----------------------------------------|
| `ACTION_SEARCH`         | « cherche », « trouve »                 |
| `ACTION_FILTER`         | catégorie, marque, parfum identifiés    |
| `ACTION_ADD_TO_CART`    | « ajoute », sélection d'une suggestion  |
| `ACTION_UPDATE_QTY`     | correction de quantité                  |
| `ACTION_SHOW_CART`      | « mon panier », « ce que j'ai »         |
| `ACTION_SHOW_LAST_ORDER`| « ma dernière commande »                |
| `ACTION_SHOW_POPULAR`   | « les plus commandés », « populaires »  |

### Vérifications

| Comportement à valider                                            | Résultat attendu                            |
|-------------------------------------------------------------------|---------------------------------------------|
| Ajout demandé → appel `ACTION_ADD_TO_CART`                       | ✅ Fonction appelée, panier mis à jour      |
| Filtre demandé → appel `ACTION_FILTER`                           | ✅ Fonction appelée, page filtrée           |
| Réponse textuelle sans action si aucune action applicable        | ✅ Texte uniquement, pas de fausse action   |
| Texte libre qui prétend avoir ajouté un produit sans l'ajouter   | ❌ Interdit — action réelle requise         |

---

## DEP-0400 — Geler le comportement V1 de l'assistant texte

### Objectif

Confirmer que le comportement V1 complet de l'assistant texte (DEP-0361 à
DEP-0399) est **complet, cohérent et gelé**. Aucune modification ne doit être
apportée sans une décision explicite documentée par un nouveau DEP.

### Périmètre gelé

| Bloc          | Contenu                                                                  |
|---------------|--------------------------------------------------------------------------|
| DEP-0361–0370 | Rôle, actions autorisées, limites, ton, interlocuteurs                   |
| DEP-0371–0376 | Phrases système canoniques (accueil, refus, relance, confirmation, fin)  |
| DEP-0377–0387 | Logiques de compréhension (intents simples, corrections, ambiguïtés)     |
| DEP-0388–0395 | Composants UI du chat (boîte, saisie, boutons, suggestions, interactions)|
| DEP-0396–0399 | Garde-fous comportementaux (catalogue, prix, pilotage, fonctions)        |

### Règles du gel

- **Aucune modification** des spécifications DEP-0361 à DEP-0399 sans nouveau
  DEP dédié documentant la décision.
- Les implémentations futures doivent respecter ces spécifications telles quelles.
- Les ajouts de comportement (mémoire inter-sessions, mode multilingue,
  suggestions proactives) feront l'objet de nouveaux blocs DEP au-delà de DEP-0400.
- Tout écart constaté lors de l'implémentation doit être signalé et arbitré
  avant modification.

### Critères de gel validés

| Critère                                               | Statut  |
|-------------------------------------------------------|---------|
| Toutes les logiques de compréhension sont définies    | ✅ Fait |
| Tous les composants UI du chat sont spécifiés         | ✅ Fait |
| Tous les garde-fous comportementaux sont documentés   | ✅ Fait |
| Le périmètre gelé est explicitement listé             | ✅ Fait |
| Le lien avec DEP-0361–0376 est établi                 | ✅ Fait |
