# DEP-0321 à DEP-0333 — Boutique manuelle et navigation produits

## Périmètre

Document de décision pour la **boutique en mode manuel** : grille produits,
navigation, recherche, filtres, tri et actions de base sur les cartes. Aucune
implémentation code, uniquement des règles d'interface et de comportement
appuyées sur le modèle catalogue existant (catégories, disponibilités,
popularité, dernière commande).

---

## DEP-0321 — Page boutique manuelle avec grille de produits

### Objectif

Offrir une page boutique claire permettant de parcourir, filtrer, trier et
ajouter des produits au panier en quelques actions.

### Structure (desktop)

- Header compact : logo, barre de recherche, accès panier, switch mode (manuel
  / assisté / téléphone).
- Colonne gauche : navigation par catégories (DEP-0322) avec indicateur actif.
- Bandeau supérieur contenu : filtres rapides (disponibilité, populaires,
  dernière commande), tri (DEP-0329) et rappel du nombre de résultats.
- Zone centrale : grille produits responsive 3–4 colonnes (réutilise la carte
  produit de base DEP-0330).
- État vide : message « Aucun produit trouvé. Essayez une autre catégorie ou
  la recherche. » + lien vers « Voir tout ».

### Structure (mobile)

- Header : logo réduit, barre de recherche pleine largeur, icône panier
  sticky en bas (spécifiée en DEP-0186/DEP-0232).
- Navigation catégories sous forme de carrousel horizontal de chips.
- Bandeau filtres/tri sous la navigation (accordéon).
- Grille 2 colonnes (ou liste verticale si largeur < 360px).
- Les actions ajouter au panier et voir le détail restent accessibles sans
  scroll excessif (CTA visibles dans la partie haute de la carte).

---

## DEP-0322 — Navigation par catégories

- Source des catégories : structure hiérarchique définie en DEP-0241 à
  DEP-0255 (id, slug, label, parent éventuel).
- Desktop : liste verticale cliquable avec état actif, surbrillance et
  scrollable si > 12 catégories.
- Mobile : chips horizontales défilables ; la catégorie active reste visible.
- Sélection : une catégorie active à la fois ; la vue « Toutes » est disponible
  en première position.
- Effets : change le filtre principal de la grille, réinitialise les autres
  filtres sauf disponibilité, conserve la recherche en cours.

---

## DEP-0323 — Navigation par sous-catégories si nécessaire

- Affichée uniquement pour les catégories ayant des enfants (données
  hiérarchiques catalogue).
- Présentation : rangée de chips sous le titre de la catégorie active (desktop
  et mobile), avec option « Toutes les sous-catégories ».
- Sélection unique ; changement de sous-catégorie ne modifie pas la catégorie
  parente active.
- Si aucune sous-catégorie n'est disponible, la zone reste masquée.

---

## DEP-0324 — Champ de recherche de produits

- Emplacement : dans le header de la boutique, largeur suffisante pour 30–40
  caractères.
- Placeholder : « Rechercher un produit, une marque ou un mot-clé ».
- Fonction : filtrage en temps réel de la grille par nom, mots-clés et
  synonymes (voir conventions DEP-0256 à DEP-0270).
- Débouncing : 300 ms pour limiter les rafraîchissements.
- État vide : message « Aucun produit trouvé. » + bouton « Effacer la
  recherche ».
- Compatibilité : la recherche s'additionne aux filtres et au tri, et conserve
  la catégorie active.

---

## DEP-0325 — Filtre par catégorie

- Contrôle secondaire de filtrage (checkboxes ou multiselect) pour combiner
  plusieurs catégories quand nécessaire.
- Par défaut, suit la catégorie active (DEP-0322) ; l'activation d'une
  catégorie via la navigation coche uniquement cette catégorie.
- En sélection multiple, la navigation affiche l'état « Multi » et aucune
  catégorie n'est surlignée comme unique active.
- Réinitialisation rapide : bouton « Réinitialiser catégories » pour revenir à
  la catégorie active seule ou à « Toutes ».

---

## DEP-0326 — Filtre par disponibilité

- États pris en compte : `en_stock`, `sur_commande`, `rupture` (définitions
  catalogue DEP-0241 à DEP-0271).
- Présentation : boutons toggle ou checkboxes « En stock », « Sur commande »,
  « Rupture ».
- Valeur par défaut : « En stock » actif, « Sur commande » activable, « Rupture
  » désactivé par défaut (affichage opt-in).
- Effet : met à jour la grille ; si aucun produit n'est disponible, afficher un
  message dédié et proposer de retirer le filtre.

---

## DEP-0327 — Filtre par produits populaires

- S'appuie sur le flag `populaire` du catalogue (DEP-0241, DEP-0271 à DEP-0279).
- Contrôle toggle « Populaires uniquement ».
- Effet : limite la grille aux produits populaires, en respectant la catégorie,
  la recherche et la disponibilité actives.
- État vide : message « Aucun produit populaire dans cette sélection. »

---

## DEP-0328 — Filtre par dernière commande

- Visible uniquement si le client connecté possède au moins une commande
  passée.
- Contrôle toggle « Dernière commande ».
- Effet : affiche uniquement les produits présents dans la dernière commande
  du client, dans l'ordre original de cette commande.
- Désactivation : revient à la sélection précédente (catégorie, recherche,
  autres filtres).

---

## DEP-0329 — Tri simple de produits

- Contrôle : select ou segmented control, aligné avec les filtres.
- Options V1 :
  1) « Recommandé » (ordre catalogue + boost populaires),
  2) « Nom A → Z »,
  3) « Disponibilité » (en_stock puis sur_commande puis rupture),
  4) « Prix croissant » si le prix est affiché, sinon masquer l'option.
- Le tri s'applique après filtres/recherche ; l'option sélectionnée reste
  persistée pendant la session.

---

## DEP-0330 — Carte produit de base

- Réutilise les spécifications visuelles du composant carte produit (DEP-0231)
  : ratio image 1:1, badges catégorie/disponibilité, CTA ajouter au panier.
- Contenu minimal affiché :
  - Image principale (fallback couleur neutre si absente).
  - Nom produit (2 lignes max) et description courte (1 ligne).
  - Prix si disponible, sinon « Prix sur demande ».
  - Badge disponibilité (vert/orange/rouge) et badge « Populaire » si flag
    actif.
- Interactions :
  - Clic sur l'image ou le titre → voir le détail produit (DEP-0332).
  - Clic sur CTA → ajout direct au panier (DEP-0331).
  - Carte désactivée si disponibilité = rupture (CTA grisé).

---

## DEP-0331 — Action ajouter au panier depuis une carte produit

- CTA principal sur la carte, texte « Ajouter » ou icône +.
- Quantité par défaut : 1 ; si le produit propose des variantes, la sélection
  se fait dans le détail produit (DEP-0332) avant ajout.
- Comportement :
  - Vérifie la disponibilité (`en_stock` ou `sur_commande`) avant ajout.
  - Animation de translation vers l'icône panier (cf. DEP-0189).
  - Mise à jour du badge quantité du panier (DEP-0232) et toast de succès
    « Ajouté au panier ».
- Si le produit est en rupture, CTA désactivé avec tooltip « Indisponible ».

---

## DEP-0332 — Action voir détail d’un produit

- Déclencheurs : clic sur image, titre ou lien « Voir le détail » sur la carte.
- Présentation : modal overlay (desktop) ou panneau plein écran (mobile) avec :
  - Galerie d'images (principale + secondaires si présentes).
  - Nom, description longue, badges, disponibilité.
  - Prix et variantes sélectionnables si applicables.
  - Sélecteur de quantité [−][1][+] et bouton « Ajouter au panier ».
  - Lien « Retour à la boutique ».
- Conserve le scroll de la grille en arrière-plan (pas de reset).

---

## DEP-0333 — Action fermer le détail d’un produit

- Contrôles de fermeture : bouton [✕], clic sur l'overlay, touche Échap, geste
  de glissement vers le bas sur mobile.
- Effets :
  - Restaure le focus sur la carte d'origine pour accessibilité clavier.
  - Conserve la position de scroll et les filtres/recherche/tri actifs.
  - Si une modification de quantité a été faite sans ajout, aucun impact sur le
    panier ; si ajout effectué, le badge panier reste mis à jour.
