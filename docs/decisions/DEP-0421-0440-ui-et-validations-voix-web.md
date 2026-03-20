# DEP-0421 à DEP-0440 — UI et validations voix web

## Périmètre

Ce document spécifie l'interface et les validations du **mode voix web V1**
(push-to-talk dans le navigateur) : accessibilité, boutons micro, indicateurs
d'état, raccourcis, comportements tactiles, lecture vocale (panier,
suggestions, confirmation), modes silencieux/voix uniquement, scénarios de
tests et gel du périmètre. Il prolonge les consentements (DEP-0296), les
composants UI (DEP-0228–0240) et la synchronisation panier/catalogue
(DEP-0334–0356). Documentation uniquement : aucun code produit.

---

## DEP-0421 — Logique d'accessibilité pour clients ayant des difficultés de lecture

### Objectif

Garantir que le mode voix web reste utilisable sans lecture fluide (dyslexie,
fatigue visuelle, langue seconde) en combinant audio et aides visuelles.

### Règles

- **Double modalité obligatoire** : chaque message vocal de l'assistant est
  affiché en texte en direct (sous-titres synchronisés).
- **Lisibilité renforcée** : taille de police minimale 16px, contraste AA
  (ou AAA si le mode contraste élevé est actif).
- **Focus clavier** : micro, raccourcis et boutons d'état sont tab-focusables
  et annoncés (`aria-label` explicite).
- **Redondance d'icône + texte** : les états vocaux (écoute, traitement,
  parole, erreur) ont une étiquette textuelle visible.
- **Contrôle utilisateur** : bouton « Couper le son » toujours présent pour
  passer en mode silencieux assisté (DEP-0433).

### Validations

- Sous-titres affichés pour 100 % des messages parlés.
- Aucune étape vocale n'est bloquée par une absence de lecture (toutes les
  actions restent réalisables au clavier ou par clic).

---

## DEP-0422 — Bouton micro visible sur ordinateur

### Objectif

Afficher un bouton micro clair sur desktop pour activer/désactiver l'écoute
vocale.

### UI

| État          | Apparence                                                        | Action                |
| ------------- | ---------------------------------------------------------------- | --------------------- |
| Inactif       | Icône `mic` grise, contour discret, tooltip « Activer le micro » | Active l'écoute       |
| Écoute active | Icône `mic` blanche sur fond bleu principal (#2563EB), halo      | Stoppe l'écoute       |
| Traitement    | Icône `mic` bleu + spinner fin autour                            | Attente (disabled)    |
| Erreur        | Icône `mic-off` rouge (#EF4444) + badge « Erreur micro »         | Réessaie / ouvre aide |

### Placement et accès

- Position : à droite du champ de commande/saisie dans le panneau assistant.
- Taille : 40–44px, cercle, suffisamment grand pour clic précis.
- Raccourci accessible : `Ctrl + /` focus le bouton (en plus du raccourci
  d'activation DEP-0428).

---

## DEP-0423 — Bouton micro visible sur téléphone

### Objectif

Offrir un déclencheur vocal lisible et atteignable au pouce sur mobile.

### UI et placement

- Bouton flottant circulaire 56px, coin inférieur droit, marge de 16px.
- États visuels alignés sur DEP-0422 (couleurs et icônes identiques).
- Label textuel court sous le bouton : « Parler » (inactif) / « Écoute… »
  (actif) / « Traitement… » / « Erreur micro ».
- Zone tactile minimale 64px (hitbox).

---

## DEP-0424 — Indicateur visuel « écoute active »

### Objectif

Montrer clairement que le micro capte la voix.

### Règles

- Halo pulsé bleu autour du bouton micro pendant toute la capture.
- Texte adjacent : « J'écoute ».
- Lecteurs d'écran : `aria-live="polite"` + `aria-label="Micro actif, vous pouvez parler"`.
- L'indicateur s'arrête immédiatement quand l'écoute est stoppée (manuel ou
  auto après délai d'inactivité de 6s).

---

## DEP-0425 — Indicateur visuel « traitement en cours »

### Objectif

Signaler la phase de conversion audio → texte ou traitement commande.

### Règles

- Spinner circulaire ambre (#F59E0B) autour du bouton micro.
- Texte : « Traitement… ».
- Bouton micro en lecture seule (clics ignorés) jusqu'à fin de traitement.
- Timeout visuel : si >10s, afficher message « Traitement long, réessaye »
  - bouton « Annuler ».

---

## DEP-0426 — Indicateur visuel « parole de l’assistant »

### Objectif

Indiquer que l'assistant parle (synthèse vocale en cours).

### Règles

- Onde animée violette autour du bloc message assistant ou du bouton micro.
- Texte : « Lecture en cours » + bouton « Couper » pour passer en silencieux
  (DEP-0433).
- À la fin de la lecture, l'indicateur disparaît et le focus revient sur le
  champ ou le bouton micro.

---

## DEP-0427 — Indicateur visuel « erreur audio »

### Objectif

Informer immédiatement d'une erreur vocale et proposer une sortie.

### Règles

- Icône `alert-circle` rouge (#EF4444) + texte « Erreur micro » ou message
  spécifique (permission refusée, aucun son détecté, coupure réseau).
- Boutons affichés : « Réessayer » (relance l'écoute) et « Utiliser le clavier »
  (ramène au champ texte).
- L'indicateur reste visible tant que l'utilisateur n'a pas confirmé un choix.

---

## DEP-0428 — Raccourci clavier pour activer la voix sur ordinateur

### Objectif

Permettre l'activation mains libres rapide en desktop.

### Règles

- Raccourci principal : `Ctrl + Maj + K` (ou `Cmd + Maj + K` sur macOS).
- Comportement push-to-talk : le raccourci bascule l'état d'écoute (on/off).
- Sécurité : ignoré si une saisie texte a le focus sur un champ sensible
  (mot de passe, formulaire externe).
- Indication visuelle : flash court de l'indicateur « écoute active » (DEP-0424)
  lors de l'activation par raccourci.

---

## DEP-0429 — Comportement tactile pour activer la voix sur téléphone

### Objectif

Définir l'interaction tactile intuitive du micro mobile.

### Règles

- **Pression maintenue (push-to-talk)** : appui long (>200ms) → écoute active,
  relâchement → stoppe l'écoute et lance traitement.
- **Tap unique** : toggle d'écoute (utile mains libres) avec timeout auto 6s.
- Retour haptique court à l'activation et à l'erreur (si disponible).
- Prévention : double-tap rapide ignore la seconde activation pour éviter les
  boucles.

---

## DEP-0430 — Lecture du panier par l’assistant vocal

### Objectif

Faire lire le panier sur demande vocale (« Lis mon panier ») de façon concise.

### Règles de lecture

- Ordre : quantité + produit + variante + dispo (« en stock » / « rupture » /
  « sur commande ») + note d'alerte si allergène.
- Limiter à 5 lignes, puis proposer « Je continue ? ».
- Mentionner le total si disponible, sinon « Total non affiché en V1 ».
- Si panier vide : « Ton panier est vide. Je peux te suggérer des produits. »
- Lecture respecte le panier partagé (DEP-0334) et reflète l'état temps réel.

---

## DEP-0431 — Lecture des suggestions par l’assistant vocal

### Objectif

Faire lire les suggestions affichées/pertinentes sans surcharger l'utilisateur.

### Règles

- Top 3 suggestions max, format : rang + nom + raison courte (« car tu as
  pris des plaquettes »).
- Proposer l'action après la lecture : « Tu veux que je l'ajoute ? » avec
  réponse simple oui/non.
- Si aucune suggestion pertinente : message « Pas de suggestion pour l'instant ».

---

## DEP-0432 — Lecture de la confirmation de commande par l’assistant vocal

### Objectif

Confirmer vocalement la commande envoyée.

### Règles

- Contenu minimal : numéro de commande, nombre d'articles, statut initial
  (« en attente de prise en charge ») et rappel du mode de contact si besoin.
- Phrase type : « Commande #CMD-2026-0001 envoyée, 4 articles, en attente de
  prise en charge. »
- Indiquer comment suivre : « Tu peux suivre le statut dans Suivi ou me le
  demander. »
- Ne jamais annoncer de prix si le prix n'est pas disponible.

---

## DEP-0433 — Mode « silencieux mais assisté »

### Objectif

Permettre l'assistance sans sortie audio (environnement calme ou gênant).

### Règles

- Synthèse vocale coupée ; seuls sous-titres + bulles assistant sont visibles.
- Micro reste utilisable (boutons et raccourcis actifs).
- Indicateurs visuels (écoute/traitement/erreur) restent affichés.
- Toggle clair : « Mode silencieux » dans le panneau assistant, avec rappel
  visible tant qu'il est actif.

---

## DEP-0434 — Mode « voix uniquement »

### Objectif

Permettre une utilisation quasi 100 % vocale tout en gardant des repères UI.

### Règles

- Interface réduite aux éléments critiques : bouton micro, indicateurs,
  badge panier (quantité), confirmation visuelle minimale.
- Les instructions de clarification sont vocales **et** visibles en texte
  court (accessibilité).
- Tous les écrans critiques (erreur, confirmation) conservent un bouton de
  sortie tactile/clavier.

---

## DEP-0435 — Test d’une commande simple en voix web

### Scénario

1. Activation micro (desktop ou mobile).
2. Client : « Ajoute deux Pepsi 33 centilitres. »
3. Assistant répète (« J'ajoute 2 Pepsi 33cl »), ajoute au panier partagé,
   lit le panier (DEP-0430).

### Résultat attendu

- Indicateurs corrects (écoute → traitement → parole).
- Panier mis à jour et affiché.
- Aucune erreur audio.

---

## DEP-0436 — Test d’une commande ambiguë en voix web

### Scénario

1. Activation micro.
2. Client : « Ajoute deux filtres. »
3. Assistant détecte ambiguïté (plusieurs filtres) et demande précision
   (catégorie/voiture/huile) sans ajouter.

### Résultat attendu

- Clarification vocale + texte, micro réactivable immédiatement.
- Aucun ajout panier tant que l'ambiguïté n'est pas levée.

---

## DEP-0437 — Test d’une correction de commande en voix web

### Scénario

1. Commande simple ajoutée (DEP-0435).
2. Client : « Non, je voulais du Coca. »
3. Assistant retire le Pepsi, propose Coca, ajoute si confirmé.

### Résultat attendu

- Panier reflète la correction (plus de Pepsi, Coca ajouté si validé).
- Confirmation vocale de la correction.

---

## DEP-0438 — Test d’une annulation de produit en voix web

### Scénario

1. Panier contient un produit.
2. Client : « Annule ce produit » ou « Retire les chips ».
3. Assistant confirme le retrait et lit le panier restant (DEP-0430).

### Résultat attendu

- Produit retiré, panier lu à jour.
- Indicateur erreur non déclenché.

---

## DEP-0439 — Vérification que la voix web partage la même logique panier et catalogue que le texte

### Objectif

Garantir l'unicité des règles métier entre modes texte et voix.

### Règles

- Même source de vérité : mêmes endpoints/catalogue, mêmes validations produit
  (disponibilité, variantes, allergènes) et panier (quantités, cohérence) que
  le mode texte (DEP-0377–0400 et DEP-0334–0356).
- Toute action vocale déclenche les mêmes événements/metriques que le texte
  (ajout, retrait, correction).
- Les deux modes reflètent immédiatement l'état du panier partagé.

---

## DEP-0440 — Gel du mode voix web V1

### Objectif

Geler le périmètre V1 du mode voix web pour stabiliser la suite.

### Règles

- Les comportements définis en DEP-0421 à DEP-0439 sont considérés stables.
- Aucune nouvelle fonctionnalité vocale n'est ajoutée sans nouveau DEP.
- Toute évolution devra préserver la compatibilité avec le panier partagé et
  les règles d'accessibilité établies ici.
