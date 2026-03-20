# Site Map Client V1

**Objectif** : Permettre au client de commander rapidement via une interface manuelle ou assistée.
**Utilisateurs visés** : Clients finaux du dépanneur.

## Pages Principales (V1)

- **Accueil Public** (`/`) : Choix du mode de commande (Manuel ou Assisté).
- **Boutique Manuelle** (`/shop`) : Catalogue classique, navigation par catégories.
- **Mode Assisté** (`/assistant`) : Interface conversationnelle (texte/voix).
- **Panier & Checkout** (`/cart`) : Révision de la commande, saisie adresse/contact, validation.
- **Suivi de Commande** (`/order/:id`) : État en temps réel de la commande.

## Pages Secondaires (V1)

- **Produits Populaires** (`/shop/popular`) : Top 10 des produits les plus vendus.
- **Dernière Commande** (`/shop/last-order`) : Recommander rapidement (nécessite d'être identifié).
- **Connexion / Inscription** (`/auth`) : Identification simplifiée (téléphone).
- **Profil Client** (`/profile`) : Informations de base.
- **Adresses** (`/profile/addresses`) : Carnet d'adresses de livraison.
- **Historique Commandes** (`/profile/orders`) : Liste des commandes passées.
- **Contact Dépanneur** (`/contact`) : Coordonnées et horaires du dépanneur actif.

## Pages Système (V1)

- **Conditions d'utilisation** (`/terms`)
- **Confidentialité** (`/privacy`)
- **Accessibilité** (`/accessibility`)
- **Aide Vocale** (`/help/voice`)

## Futures pages (Hors V1)

- Paiement en ligne sécurisé
- Programme de fidélité
- Parrainage
