# Système Visuel V1 (Design System)

## Couleurs (Tokens)

- **Primary** : Bleu vif ou Vert pro (Couleur de marque, pour les actions principales, ex: `#2563EB`).
- **Secondary** : Gris foncé (Texte principal, ex: `#1F2937`).
- **Background** : Blanc cassé (ex: `#F9FAFB`) pour le fond, Blanc pur (`#FFFFFF`) pour les cartes.
- **États** :
  - Succès : Vert (`#10B981`)
  - Alerte/Warning : Jaune/Orange (`#F59E0B`)
  - Erreur/Refus : Rouge (`#EF4444`)
  - Attente/Info : Bleu clair (`#3B82F6`)

## Typographie

- **Font principale** : Inter ou Roboto (sans-serif, très lisible).
- **Titres (H1/H2)** : Gras (Font-weight: 700), espacement serré.
- **Corps (Body)** : Regular (Font-weight: 400), taille minimale 16px sur mobile pour la lisibilité.

## Échelles et Tailles

- **Boutons** : Hauteur minimum de 44px sur mobile (Touch target standard Apple/Google).
- **Cartes Produits** : Design épuré, image carrée en haut, titre sur 2 lignes max, prix clair, gros bouton d'ajout.

## Style Visuel (Look & Feel)

- **Ombres (Shadows)** : Légères pour décoller les cartes du fond (ex: `box-shadow: 0 4px 6px rgba(0,0,0,0.05)`).
- **Bordures (Radii)** : Coins légèrement arrondis (`8px` à `12px`) pour un look moderne et amical.
- **Assistant** : Bulles de chat distinctes (Gris clair pour l'assistant, Couleur Primary pour le client).

## Animations Minimales

- **Ajout au panier** : Léger "pop" (scale 1.05 puis 1.0) sur le bouton et le badge du panier.
- **Ouverture suggestions** : Slide-up (glissement depuis le bas) ou Fade-in rapide (150ms).
- **Transition d'états (Suivi)** : Remplissage progressif d'une barre de progression.
