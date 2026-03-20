# Catalogue de Composants V1

Liste des composants UI réutilisables à implémenter dans `packages/ui`.

## Boutons

- **ButtonPrimary** : Fond couleur Primary, texte blanc. Rôle : Action principale (Commander, Valider).
- **ButtonSecondary** : Fond transparent, bordure grise, texte gris. Rôle : Action d'annulation, retour.
- **VoiceButton** : Forme circulaire, icône Micro. États : Repos, Écoute (pulsation), Traitement (spinner).

## Entrées (Inputs)

- **SearchInput** : Champ texte avec icône loupe. Clearable (croix pour vider).
- **AddressInput** : Champ auto-complété pour adresse de livraison.

## Affichage Données

- **ProductCard** : Affiche image, nom, prix, et bouton ajout/quantité.
- **CartItem** : Ligne compacte affichant nom, quantité (ajustable), prix total de la ligne.
- **SuggestionTile** : Bouton ovale (chip) affichant un choix proposé par l'assistant.
- **OrderStatusBadge** : Petit badge coloré (Vert=Confirmé, Orange=Préparation).

## Layout & Retours

- **ConfirmModal** : Boîte de dialogue centrée (Titre, Message, 2 boutons).
- **ToastNotification** : Message éphémère en bas ou haut de l'écran (Succès/Erreur).

## Validation avant implémentation

_L'équipe de développement doit s'assurer que chaque composant développé dans `@depaneuria/ui` correspond exactement à ces définitions, sans ajouter de variantes non listées pour la V1 afin de garantir un TTM (Time To Market) rapide._
