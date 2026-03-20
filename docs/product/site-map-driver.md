# Site Map Driver (Livreur) V1

**Objectif** : Gérer les courses assignées, confirmer les remises et encaissements.
**Utilisateurs visés** : Livreurs (internes ou externes).

## Pages Principales (V1)

- **Livraisons Assignées** (`/`) : Liste des courses à effectuer.
- **Livraison en Cours** (`/delivery/:id`) : Navigation, infos client, montant à encaisser.

## Pages Secondaires (V1)

- **Livraisons Disponibles** (`/deliveries/available`) : Pool de courses si modèle ouvert.
- **Historique Livraisons** (`/history`) : Courses terminées de la journée.
- **État Remise** (`/delivery/:id/complete`) : Confirmation de remise et encaissement.
- **Contact Client** (`/delivery/:id/contact`) : Lien rapide pour appeler le client.

## Futures pages (Hors V1)

- Carte interactive avec optimisation de tournée
- Historique de facturation livreur
