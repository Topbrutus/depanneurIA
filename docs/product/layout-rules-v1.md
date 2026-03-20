# Règles de Layout V1

Le responsive est essentiel. L'interface s'adapte à deux contextes principaux.

## Disposition Ordinateur (Desktop - > 1024px)

Disposition en 3 colonnes ou 2 colonnes larges.

```text
+-------------------+-----------------------------------+-------------------+
|                   |                                   |                   |
|  NAVIGATION GAUCHE|         CONTENU PRINCIPAL         |   PANIER DROITE   |
|  (Catégories,     |         (Grille Produits          |   (Toujours       |
|   Menu profil)    |          ou Chat Assisté)         |    visible)       |
|                   |                                   |                   |
+-------------------+-----------------------------------+-------------------+
```

- **Panier** : Toujours visible à droite. Ne cache pas le contenu.
- **Chat Assisté** : Remplace le contenu principal s'il est activé. Les suggestions apparaissent sous les messages.

## Disposition Téléphone (Mobile - < 768px)

Disposition empilée. Priorité à la grille ou au chat.

```text
+-----------------------------------+
| HEADER (Logo + Menu burger)       |
+-----------------------------------+
|                                   |
|         CONTENU PRINCIPAL         |
|         (Grille ou Chat)          |
|                                   |
+-----------------------------------+
| BOTTOM BAR (Panier flottant/Micro)|
+-----------------------------------+
```

- **Panier** : Remplacé par une Bottom Bar flottante indiquant le total et le nombre d'articles. Ouvre un modal pleine page au clic.
- **Chat / Micro** : Le bouton micro remplace ou côtoie le panier dans la Bottom Bar en mode assisté.
- **Suggestions** : En mode chat mobile, elles s'affichent en boutons chips juste au-dessus de la zone de saisie texte/micro.

## Règles de Priorité Visuelle

1. L'action principale (Ajouter, Valider, Parler) doit toujours être au-dessus de la ligne de flottaison.
2. Le panier mobile ne doit jamais masquer le bouton de paiement.
3. Les erreurs (ex: hors zone) s'affichent en bannières collées en haut de l'écran (toast/alert).
