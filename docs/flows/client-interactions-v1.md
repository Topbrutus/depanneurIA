# Comportements Clés Client V1

## 1. Grille Produits

- **Au clic sur "Ajouter"** : Animation légère (feedback visuel), incrément du compteur du panier flottant ou mise à jour immédiate du panneau latéral. Aucun rechargement de page.

## 2. Assistant Vocal / Texte

- **Client dit une catégorie ("Je veux des chips")** : L'assistant affiche les chips les plus populaires en chips/suggestions cliquables et demande de préciser.
- **Client dit une marque ("Un Pepsi")** : L'assistant ajoute le format standard (ex: 2L ou canette selon historique) et confirme : "J'ai ajouté un Pepsi 2L, c'est bon ?".
- **Client ambigu ("À boire")** : L'assistant propose des sous-catégories (Eau, Jus, Soda, Bière).
- **Client perdu ("Je ne sais pas")** : L'assistant propose le "Top 3 des ventes du moment".

## 3. Comportement du Panier

- **Clic (Mobile)** : Ouvre en pleine page (modal glissant du bas).
- **Après validation** : Redirection vers `/order/:id` avec animation de succès. Panier vidé.
- **Pendant préparation/livraison** : Panier verrouillé pour cette commande (lecture seule sur l'écran de suivi).
- **Si commande échoue (Refus)** : Le panier initial est restauré pour permettre au client de modifier (ex: retirer l'article manquant) et renvoyer.
