# DEP-0334 à DEP-0347 — Panier et persistance

## Périmètre

Ce document définit la **vue panier** (affichage desktop et mobile), les **actions panier** (modifier, retirer, vider, confirmer, recommander), l'**animation d'ajout**, les **logiques de persistance** du panier (rechargement, changement de mode, changement de catégorie, micro-coupure réseau) et les **écrans de finalisation** (commande en cours, récapitulatif).

Il s'agit exclusivement de **documentation** : aucun code produit, aucune implémentation. Les spécifications décrites ici serviront de référence pour les développements futurs front-end et back-end.

**Référence parente** : Bloc DEP-0321 à DEP-0360 (boutique manuelle, catalogue et panier)

---

## DEP-0334 — Vue panier toujours visible sur ordinateur

### Objectif

Définir l'affichage permanent du panier sur les écrans desktop (≥1024px de largeur) pour permettre au client de visualiser en continu le contenu de son panier sans masquer la grille de produits.

### Règles d'affichage

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Position             | Colonne fixe à droite de l'écran                              |
| Largeur              | 320px                                                         |
| Hauteur              | 100% de la fenêtre (moins l'en-tête si présent)               |
| Scroll interne       | Activé si le contenu dépasse la hauteur disponible           |
| Visibilité par défaut| Toujours visible (non repliable)                              |
| Fond                 | Blanc #FFFFFF avec ombre portée légère                        |
| Bordure              | Bordure gauche 1px gris clair #E0E0E0                         |

### Contenu affiché

1. **En-tête panier** :
   - Titre : « Mon panier »
   - Nombre d'articles : « 3 articles »
   - Icône panier (Lucide `shopping-cart`)

2. **Liste des produits** :
   - Miniature produit (50×50px)
   - Nom du produit (tronqué à 2 lignes)
   - Quantité (champ modifiable, voir DEP-0336)
   - Prix unitaire
   - Prix total ligne
   - Bouton retirer (voir DEP-0337)

3. **Pied de panier** :
   - Total général : « Total : 42,50 € »
   - Bouton « Vider le panier » (voir DEP-0338)
   - Bouton « Confirmer le panier » (voir DEP-0339)

### États du panier

| État                 | Affichage                                                     |
|----------------------|---------------------------------------------------------------|
| Panier vide          | Message : « Ton panier est vide. »                            |
| Panier avec produits | Liste complète + total + boutons d'action                     |
| Panier en cours      | Indicateur de chargement si synchronisation en cours          |

### Accessibilité

- Région `role="complementary"` ou `role="region"` avec `aria-label="Panier"`
- Navigation clavier complète (Tab, Enter, Escape)
- Annonce des modifications de quantité et de total par lecteur d'écran

---

## DEP-0335 — Vue panier repliable sur téléphone

### Objectif

Définir l'affichage du panier sur les écrans mobiles (<1024px) sous forme d'un panneau repliable pour maximiser l'espace de navigation dans le catalogue.

### Règles d'affichage

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Position par défaut  | Masqué, accessible via bouton flottant en bas à droite       |
| Position déployée    | Panneau en overlay couvrant 100% de l'écran                  |
| Animation ouverture  | Slide up depuis le bas (300ms, ease-out)                      |
| Animation fermeture  | Slide down vers le bas (200ms, ease-in)                       |
| Fond overlay         | Semi-transparent noir #000000 à 40% d'opacité                 |
| Fond panneau         | Blanc #FFFFFF                                                 |
| Hauteur panneau      | 80% de la hauteur d'écran (ajustable par glissement)         |

### Bouton d'accès (panier replié)

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Position             | Fixe en bas à droite, 16px de marge                           |
| Forme                | Cercle de 64px de diamètre                                    |
| Couleur fond         | Primaire #2563EB                                              |
| Icône                | Panier (Lucide `shopping-cart`) en blanc                      |
| Badge quantité       | Pastille rouge #EF4444 affichant le nombre d'articles         |
| État au survol       | Légère élévation (box-shadow plus prononcée)                  |

### Contenu du panneau déployé

Identique à la vue desktop (DEP-0334) :
- En-tête panier avec titre et nombre d'articles
- Liste des produits avec miniatures, quantités, prix
- Pied de panier avec total et boutons d'action

### Interactions

| Action               | Comportement                                                  |
|----------------------|---------------------------------------------------------------|
| Tap sur bouton       | Ouvre le panneau panier (slide up)                            |
| Tap sur overlay      | Ferme le panneau panier (slide down)                          |
| Glissement vers bas  | Ferme le panneau panier                                       |
| Bouton fermer (×)    | En haut à droite du panneau, ferme le panneau                 |

### Accessibilité

- Bouton flottant : `role="button"`, `aria-label="Ouvrir le panier (3 articles)"`
- Panneau : `role="dialog"`, `aria-modal="true"`, focus piégé dans le panneau
- Fermeture au clavier : Escape

---

## DEP-0336 — Action modifier quantité dans le panier

### Objectif

Permettre au client de modifier la quantité d'un produit déjà ajouté au panier, depuis la vue panier (desktop ou mobile).

### Interface

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Type de contrôle     | Champ numérique avec boutons + et −                           |
| Largeur              | 80px                                                          |
| Hauteur              | 32px                                                          |
| Valeur minimale      | 1                                                             |
| Valeur maximale      | 99 (ou limite définie par le stock disponible)                |
| Bouton −             | Icône `minus` (Lucide), désactivé si quantité = 1             |
| Bouton +             | Icône `plus` (Lucide), désactivé si quantité = max            |
| Champ central        | Affiche la quantité actuelle, éditable au clavier             |

### Comportements

| Action               | Comportement                                                  |
|----------------------|---------------------------------------------------------------|
| Clic sur −           | Décrémente la quantité de 1 (minimum 1)                       |
| Clic sur +           | Incrémente la quantité de 1 (maximum défini ou 99)            |
| Saisie clavier       | Accepte uniquement les chiffres, valide à la perte de focus   |
| Quantité = 0         | Impossible : minimum 1 (pour retirer, voir DEP-0337)          |
| Quantité > stock     | Message d'alerte : « Stock disponible : X unités »            |

### Mise à jour du panier

- **Temps réel** : le total ligne et le total général sont recalculés immédiatement.
- **Persistance** : la modification est sauvegardée localement (localStorage/sessionStorage) et synchronisée avec le serveur si le client est connecté.
- **Feedback visuel** : animation rapide de mise à jour du total (fade in/out 200ms).

### Accessibilité

- Boutons − et + : `role="button"`, `aria-label="Diminuer la quantité"` / `"Augmenter la quantité"`
- Champ numérique : `type="number"`, `aria-label="Quantité"`
- Annonce lecteur d'écran : « Quantité modifiée : X unités. Total ligne : Y €. »

---

## DEP-0337 — Action retirer un produit du panier

### Objectif

Permettre au client de supprimer un produit du panier en un seul clic, sans confirmation intermédiaire (retrait rapide).

### Interface

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Type de contrôle     | Bouton icône (Lucide `x` ou `trash-2`)                        |
| Position             | À droite de chaque ligne produit dans le panier               |
| Taille               | 24×24px                                                       |
| Couleur icône        | Gris neutre #6B7280                                           |
| Couleur au survol    | Rouge #EF4444                                                 |
| Libellé accessible   | `aria-label="Retirer [Nom du produit] du panier"`            |

### Comportements

| Action               | Comportement                                                  |
|----------------------|---------------------------------------------------------------|
| Clic sur bouton      | Retire immédiatement le produit du panier                     |
| Animation de retrait | Slide out vers la droite + fade out (300ms)                   |
| Mise à jour totaux   | Recalcul instantané du total général                          |
| Feedback utilisateur | Message temporaire (toast) : « [Produit] retiré du panier. » |
| Undo possible        | Bouton « Annuler » dans le toast (5 secondes) pour restaurer  |

### Persistance

- **Synchronisation locale** : suppression immédiate du localStorage/sessionStorage.
- **Synchronisation serveur** : si client connecté, envoi d'une requête API pour mettre à jour le panier côté serveur.

### Accessibilité

- Bouton : `role="button"`, focus clavier visible
- Annonce lecteur d'écran : « [Nom du produit] retiré du panier. »

---

## DEP-0338 — Action vider le panier

### Objectif

Permettre au client de supprimer tous les produits du panier en une seule action, avec confirmation pour éviter les erreurs.

### Interface

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Type de contrôle     | Bouton secondaire (style outline)                             |
| Position             | Pied de panier, au-dessus du bouton « Confirmer le panier »  |
| Libellé              | « Vider le panier »                                           |
| Icône                | Lucide `trash-2`                                              |
| Couleur              | Gris neutre #6B7280                                           |
| Couleur au survol    | Rouge #EF4444                                                 |

### Comportements

| Action               | Comportement                                                  |
|----------------------|---------------------------------------------------------------|
| Clic sur bouton      | Affiche une modale de confirmation (voir ci-dessous)          |
| Confirmation         | Vide complètement le panier                                   |
| Annulation           | Ferme la modale, aucun changement                             |
| Feedback utilisateur | Message temporaire (toast) : « Panier vidé. »                 |

### Modale de confirmation

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Titre                | « Vider le panier ? »                                         |
| Message              | « Tous les produits seront retirés. Cette action ne peut pas être annulée. » |
| Bouton principal     | « Vider » (rouge #EF4444)                                     |
| Bouton secondaire    | « Annuler » (gris neutre #6B7280)                             |
| Fermeture            | Clic sur « Annuler », Escape, ou clic sur overlay             |

### Persistance

- **Synchronisation locale** : suppression complète du panier dans localStorage/sessionStorage.
- **Synchronisation serveur** : si client connecté, envoi d'une requête API pour vider le panier côté serveur.

### Accessibilité

- Bouton : `role="button"`, `aria-label="Vider le panier"`
- Modale : `role="dialog"`, `aria-modal="true"`, focus piégé

---

## DEP-0339 — Action confirmer le panier

### Objectif

Permettre au client de valider le contenu de son panier et de passer à l'écran récapitulatif avant envoi de commande (DEP-0347).

### Interface

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Type de contrôle     | Bouton principal (style filled)                               |
| Position             | Pied de panier, en bas de la colonne/panneau                  |
| Libellé              | « Confirmer le panier » ou « Passer commande »                |
| Icône                | Lucide `arrow-right` ou `check-circle`                        |
| Couleur fond         | Primaire #2563EB                                              |
| Couleur texte        | Blanc #FFFFFF                                                 |
| État désactivé       | Si panier vide, bouton grisé et non cliquable                 |

### Comportements

| Action               | Comportement                                                  |
|----------------------|---------------------------------------------------------------|
| Clic sur bouton      | Redirige vers l'écran récapitulatif (DEP-0347)                |
| Panier vide          | Bouton désactivé, tooltip : « Ajoute des produits pour continuer. » |
| Client non connecté  | Demande de connexion ou d'inscription avant de continuer      |
| Vérification stock   | Avant redirection, vérification de la disponibilité des produits |
| Stock insuffisant    | Message d'alerte : « Certains produits ne sont plus disponibles. » |

### Vérifications avant confirmation

1. **Panier non vide** : au moins 1 produit dans le panier.
2. **Client identifié** : client connecté ou ayant fourni téléphone/adresse (selon logique d'inscription DEP-0281).
3. **Stock disponible** : tous les produits du panier sont en stock ou disponibles sur commande.
4. **Adresse de livraison** : une adresse de livraison valide est enregistrée (voir DEP-0289).

### Accessibilité

- Bouton : `role="button"`, `aria-label="Confirmer le panier et passer commande"`
- État désactivé : `aria-disabled="true"`, explication via `aria-describedby`

---

## DEP-0340 — Action recommander la dernière commande

### Objectif

Permettre au client de recréer rapidement le panier à partir des produits de sa dernière commande, sans avoir à rechercher et ajouter chaque produit individuellement.

### Interface

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Type de contrôle     | Bouton secondaire (style outline)                             |
| Position             | Au-dessus du panier (dans la section « Dernière commande », voir DEP-0351) ou dans le panier vide |
| Libellé              | « Recommander » ou « Ajouter au panier »                      |
| Icône                | Lucide `repeat` ou `refresh-cw`                               |
| Couleur              | Primaire #2563EB (outline)                                    |

### Comportements

| Action               | Comportement                                                  |
|----------------------|---------------------------------------------------------------|
| Clic sur bouton      | Ajoute tous les produits de la dernière commande au panier    |
| Panier non vide      | Affiche une modale de confirmation : « Ajouter au panier existant ou remplacer ? » |
| Produits indisponibles | Affiche un message d'alerte listant les produits non disponibles |
| Quantités            | Reprend les quantités de la dernière commande                 |
| Feedback utilisateur | Message temporaire (toast) : « Dernière commande ajoutée au panier. » |

### Modale de confirmation (si panier non vide)

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Titre                | « Recommander la dernière commande ? »                        |
| Message              | « Ton panier contient déjà des produits. Souhaites-tu les conserver ? » |
| Bouton principal     | « Ajouter » (primaire #2563EB) — Fusionne avec panier existant |
| Bouton secondaire    | « Remplacer » (rouge #EF4444) — Vide et remplace              |
| Bouton tertiaire     | « Annuler » (gris neutre #6B7280)                             |

### Conditions d'affichage

- **Client connecté** : le client doit être identifié (voir DEP-0286).
- **Historique existant** : le client a passé au moins une commande précédente (voir DEP-0316).
- **Dernière commande récente** : commande de moins de 30 jours (paramétrable).

### Persistance

- Le panier reconstitué suit les mêmes règles de persistance que le panier classique (DEP-0342 à DEP-0345).

### Accessibilité

- Bouton : `role="button"`, `aria-label="Recommander la dernière commande"`
- Modale : `role="dialog"`, `aria-modal="true"`

---

## DEP-0341 — Animation de translation d'un produit vers le panier

### Objectif

Fournir un feedback visuel clair et fluide lors de l'ajout d'un produit au panier, en animant une copie de la miniature produit depuis la carte produit vers l'icône du panier.

### Animation

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Déclencheur          | Clic sur le bouton « Ajouter au panier » (DEP-0331)           |
| Élément animé        | Clone de la miniature produit (50×50px ou 64×64px)            |
| Point de départ      | Position de la carte produit dans la grille                   |
| Point d'arrivée      | Icône du panier (desktop : colonne droite, mobile : bouton flottant) |
| Durée                | 600ms                                                         |
| Courbe d'animation   | ease-in-out (accélération puis décélération)                  |
| Échelle              | Réduction progressive de 100% à 50% pendant la translation    |
| Opacité              | Réduction progressive de 100% à 0% dans les 100ms finales     |

### Étapes de l'animation

1. **Création du clone** : au clic, un clone de la miniature produit est créé en position absolue.
2. **Translation** : le clone se déplace de la carte produit vers l'icône du panier en suivant une courbe de Bézier.
3. **Réduction d'échelle** : pendant la translation, le clone se réduit progressivement.
4. **Disparition** : dans les 100ms finales, le clone disparaît (fade out).
5. **Mise à jour panier** : à la fin de l'animation, le panier se met à jour (nombre d'articles, total).

### Feedback supplémentaire

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Badge panier         | Animation pulse sur le badge de quantité (200ms)              |
| Son (optionnel)      | Petit son de confirmation (désactivable dans les préférences) |
| Message toast        | « [Nom du produit] ajouté au panier. »                        |

### Accessibilité

- L'animation est purement décorative et ne transmet pas d'information essentielle.
- Le feedback textuel (toast) et l'annonce par lecteur d'écran suffisent pour les utilisateurs sans vision.
- L'animation respecte la préférence `prefers-reduced-motion` : si activée, l'animation est désactivée et remplacée par un simple fade in/out du badge.

---

## DEP-0342 — Persistance du panier au rechargement de la page

### Objectif

Garantir que le contenu du panier est conservé lorsque le client recharge la page (F5, Ctrl+R) ou ferme puis rouvre le navigateur/l'application.

### Stratégie de persistance

| Scénario             | Stratégie                                                     |
|----------------------|---------------------------------------------------------------|
| Client connecté      | Panier stocké côté serveur + copie locale (localStorage)      |
| Client non connecté  | Panier stocké uniquement en local (localStorage)              |
| Expiration           | Panier local expire après 7 jours d'inactivité                |
| Conflits             | Priorité au panier serveur si client connecté                 |

### Mécanisme technique

1. **Sauvegarde locale** :
   - Clé : `depaneurIA_cart` (localStorage)
   - Format : JSON `{ items: [{ productId, variantId, quantity, unitPrice, currency, addedAt }], updatedAt: timestamp }` (permet de reconstruire les totaux sans requête réseau)
   - Mise à jour : à chaque modification du panier (ajout, retrait, modification quantité)

2. **Synchronisation serveur** (client connecté) :
   - Requête API : `POST /api/cart/sync` à chaque modification
   - Payload : liste complète des produits et quantités
   - Réponse : panier validé côté serveur (vérification stock, prix)

3. **Rechargement de la page** :
   - Au démarrage de l'application, lecture de `depaneurIA_cart` (localStorage)
   - Si client connecté, récupération du panier serveur via `GET /api/cart`
   - Fusion : si divergence entre local et serveur, priorité au serveur

### Gestion des conflits

| Cas                  | Résolution                                                    |
|----------------------|---------------------------------------------------------------|
| Produit supprimé     | Retrait automatique du panier, notification utilisateur       |
| Stock insuffisant    | Ajustement automatique de la quantité, notification utilisateur |
| Prix modifié         | Mise à jour automatique du prix, notification utilisateur     |

### Accessibilité

- Message d'information si panier restauré : « Ton panier a été restauré. »
- Message d'alerte si produit retiré : « Certains produits ne sont plus disponibles et ont été retirés. »

---

## DEP-0343 — Persistance du panier au changement de mode

### Objectif

Garantir que le contenu du panier est conservé lorsque le client passe d'un mode d'interaction à un autre (manuel → assisté, assisté → téléphone).

### Règles de persistance

| Transition           | Comportement                                                  |
|----------------------|---------------------------------------------------------------|
| Manuel → Assisté     | Panier conservé intégralement, visible dans le mode assisté   |
| Assisté → Manuel     | Panier conservé intégralement, visible dans le mode manuel    |
| Manuel/Assisté → Téléphone | Panier conservé, récupérable par l'agent vocal (lecture du panier existant) |
| Téléphone → Manuel/Assisté | Panier mis à jour avec les produits ajoutés par téléphone |

### Mécanisme technique

- **Panier unique** : un seul panier partagé entre tous les modes, stocké dans l'état global de l'application (ex. : Redux, Zustand).
- **Synchronisation** : identique à DEP-0342 (localStorage + serveur si connecté).
- **Pas de duplication** : aucun panier spécifique à un mode.

### Feedback utilisateur

| Cas                  | Message affiché                                               |
|----------------------|---------------------------------------------------------------|
| Changement de mode   | Aucun message (comportement transparent)                      |
| Premier passage mode assisté | Message d'accueil : « Ton panier est toujours disponible. Tu peux continuer ta commande. » |

---

## DEP-0344 — Persistance du panier au changement de catégorie

### Objectif

Garantir que le contenu du panier est conservé lorsque le client navigue entre différentes catégories de produits.

### Règles de persistance

| Action               | Comportement                                                  |
|----------------------|---------------------------------------------------------------|
| Clic sur catégorie   | Panier reste visible (desktop) ou accessible (mobile)         |
| Panier affiché       | Contenu inchangé, total inchangé                              |
| Produits de différentes catégories | Tous conservés dans le panier, indépendamment de la catégorie active |

### Mécanisme technique

- **Navigation client-side** : la navigation entre catégories ne provoque pas de rechargement complet de la page (SPA).
- **État global** : le panier est stocké dans l'état global de l'application, indépendant de la catégorie affichée.
- **Pas de réinitialisation** : aucun changement de route ou de filtre ne vide ou modifie le panier.

### Feedback utilisateur

- Aucun message particulier : comportement transparent et attendu.

---

## DEP-0345 — Persistance du panier pendant une micro-coupure réseau

### Objectif

Garantir que le contenu du panier n'est pas perdu en cas de perte temporaire de connexion réseau (< 30 secondes).

### Règles de persistance

| Cas                  | Comportement                                                  |
|----------------------|---------------------------------------------------------------|
| Coupure réseau courte (<30s) | Panier conservé en local, modifications possibles en mode offline |
| Retour connexion     | Synchronisation automatique avec le serveur                   |
| Coupure longue (>30s)| Panier conservé en local, message d'information affiché       |
| Modifications offline| Sauvegardées en local, synchronisées dès le retour réseau     |

### Mécanisme technique

1. **Détection de coupure** :
   - Écoute de l'événement `offline` du navigateur
   - Détection de requêtes échouées (erreur réseau, timeout)

2. **Mode offline** :
   - Affichage d'un indicateur visuel : bannière « Connexion perdue. Modifications sauvegardées en local. »
   - Toutes les modifications du panier sont enregistrées en localStorage
   - File d'attente des opérations : chaque action (ajout, retrait, modification) est horodatée et rejouée dans l'ordre à la reconnexion
   - Désactivation des actions nécessitant le serveur (confirmation panier, validation stock)

3. **Retour connexion** :
   - Écoute de l'événement `online` du navigateur
   - Synchronisation automatique du panier local avec le serveur
   - Vérification de la disponibilité des produits et des prix
   - Message de confirmation : « Connexion rétablie. Panier synchronisé. »

### Gestion des conflits

| Cas                  | Résolution                                                    |
|----------------------|---------------------------------------------------------------|
| Produit supprimé pendant coupure | Retrait automatique, notification utilisateur          |
| Stock épuisé pendant coupure | Ajustement quantité, notification utilisateur              |
| Prix modifié pendant coupure | Mise à jour automatique, notification utilisateur          |

### Accessibilité

- Bannière d'information : `role="alert"`, annoncée par les lecteurs d'écran
- Message de retour connexion : `role="status"`

---

## DEP-0346 — Logique "commande en cours de traitement"

### Objectif

Définir le comportement de l'application lorsque le client a confirmé son panier et que la commande est en cours de traitement côté serveur (envoi, validation, paiement).

### États de la commande

| État                 | Description                                                   |
|----------------------|---------------------------------------------------------------|
| `draft`              | Panier non confirmé, modifications possibles                  |
| `pending`            | Panier confirmé, commande en cours de traitement              |
| `validated`          | Commande validée, en attente de préparation                   |
| `failed`             | Échec de traitement (paiement refusé, stock épuisé, erreur serveur) |

### Comportements par état

#### État `pending` (en cours de traitement)

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Écran affiché        | Écran de chargement avec message : « Traitement de ta commande en cours… » |
| Indicateur visuel    | Spinner ou barre de progression indéterminée                  |
| Panier               | Non modifiable, lecture seule                                 |
| Bouton retour        | Désactivé (impossible de revenir en arrière)                  |
| Durée attendue       | 5 à 15 secondes (paramétrable)                                |
| Persistance          | État `pending` conservé localement pour éviter tout double envoi après rechargement |
| Timeout              | Si > 30 secondes, affichage message d'erreur (voir `failed`)  |

#### État `validated` (commande validée)

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Redirection          | Vers l'écran de confirmation (DEP-0348)                       |
| Panier               | Vidé automatiquement                                          |
| Notification         | Message de succès : « Commande validée ! »                    |

#### État `failed` (échec)

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Redirection          | Vers l'écran d'échec (DEP-0350)                               |
| Panier               | Conservé, modifications possibles                             |
| Message d'erreur     | Explication claire de la raison de l'échec                    |
| Action proposée      | Bouton « Réessayer » ou « Modifier le panier »                |

### Gestion des erreurs

| Type d'erreur        | Message affiché                                               |
|----------------------|---------------------------------------------------------------|
| Stock épuisé         | « Certains produits ne sont plus disponibles. Vérifie ton panier. » |
| Paiement refusé      | « Le paiement a échoué. Vérifie tes informations bancaires. » |
| Erreur serveur       | « Une erreur est survenue. Réessaie dans quelques instants. » |
| Timeout              | « Le traitement prend plus de temps que prévu. Réessaie plus tard. » |

### Accessibilité

- Écran de chargement : `role="status"`, `aria-live="polite"`, message annoncé par lecteur d'écran
- Écran d'échec : `role="alert"`, focus automatique sur le message d'erreur

---

## DEP-0347 — Écran récapitulatif avant envoi de commande

### Objectif

Afficher un écran récapitulatif permettant au client de vérifier le contenu de son panier, son adresse de livraison et le total de sa commande avant de confirmer l'envoi définitif.

### Contenu de l'écran

#### 1. En-tête

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Titre                | « Récapitulatif de ta commande »                              |
| Sous-titre           | « Vérifie les informations avant de confirmer. »              |

#### 2. Section Panier

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Liste des produits   | Miniature, nom, quantité, prix unitaire, prix total ligne     |
| Total produits       | « Total produits : 38,50 € »                                  |
| Frais de livraison   | « Livraison : 4,00 € » (ou « Gratuite » si applicable)        |
| Total général        | « Total à payer : 42,50 € » (en gras, police plus grande)     |

#### 3. Section Adresse de livraison

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Adresse affichée     | Rue, code postal, ville                                       |
| Notes de livraison   | Si renseignées (voir DEP-0291)                                |
| Bouton modifier      | Lien « Modifier l'adresse » redirigeant vers écran d'adresses (DEP-0304) |

#### 4. Section Téléphone de contact

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Téléphone affiché    | Numéro de téléphone du client                                 |
| Bouton modifier      | Lien « Modifier le téléphone » redirigeant vers écran profil (DEP-0303) |

#### 5. Boutons d'action

| Élément              | Valeur                                                        |
|----------------------|---------------------------------------------------------------|
| Bouton principal     | « Confirmer et envoyer la commande » (primaire #2563EB)       |
| Bouton secondaire    | « Retour au panier » (gris neutre #6B7280, outline)           |
| Icône bouton principal | Lucide `check-circle` ou `send`                             |

### Comportements

| Action               | Comportement                                                  |
|----------------------|---------------------------------------------------------------|
| Clic « Confirmer »   | Envoie la commande au serveur (état `pending`, voir DEP-0346) |
| Clic « Retour »      | Retour au panier, modifications possibles                     |
| Modification adresse | Redirection vers écran d'adresses, retour automatique après modification |
| Modification téléphone | Redirection vers écran profil, retour automatique après modification |

### Vérifications avant envoi

1. **Panier non vide** : au moins 1 produit.
2. **Adresse valide** : adresse de livraison complète et dans la zone desservie.
3. **Téléphone valide** : numéro de téléphone au format attendu.
4. **Stock disponible** : dernière vérification de la disponibilité des produits.

Si l'une de ces vérifications échoue, affichage d'un message d'erreur et désactivation du bouton « Confirmer ».

### Accessibilité

- Titre de l'écran : `<h1>`
- Sections : `<section>` avec `aria-label`
- Bouton principal : focus automatique, `role="button"`, `aria-label="Confirmer et envoyer la commande"`
- Navigation clavier complète (Tab, Enter, Escape pour retour)

---

## Critères de validation (DEP-0334 à DEP-0347)

- Panier desktop fixé à droite (320px), toujours visible, scroll interne actif.
- Panier mobile repliable : bouton flottant avec badge quantité, panneau plein écran (80%) animé en slide.
- Actions panier : quantité modifiable min 1/max 99, retrait instantané avec toast, vidage via modale de confirmation, confirmation désactivée panier vide, recommander fusionne/remplace selon choix.
- Animation ajout : miniature clonée se translate vers l'icône panier avec pulse sur badge et respect de `prefers-reduced-motion`.
- Persistance : structure de stockage incluant variantId et prix, conservation au reload, changement de mode/catégorie et micro-coupure via file d'attente rejouée.
- Commande en cours : état `pending` verrouille le panier et reste actif après rechargement jusqu'à validation/échec, puis récapitulatif avant envoi affiche panier, adresse et téléphone.

---

## Résumé — Panier et persistance

Ce document a défini l'ensemble des spécifications du **panier client** et de sa **persistance** :

1. **Affichage** : panier toujours visible sur desktop, repliable sur mobile.
2. **Actions panier** : modifier quantité, retirer produit, vider panier, confirmer panier, recommander dernière commande.
3. **Animation** : translation animée d'un produit vers le panier.
4. **Persistance** : rechargement page, changement de mode, changement de catégorie, micro-coupure réseau.
5. **Finalisation** : logique « commande en cours de traitement » et écran récapitulatif avant envoi.

Ces spécifications serviront de référence pour les développements futurs front-end et back-end.
