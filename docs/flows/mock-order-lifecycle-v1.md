# Mock Order Lifecycle (V1 Demo)

Ce document décrit le cycle de vie mocké d'une commande (Order) à travers les trois applications du prototype V1. Il garantit que les démos partagent une compréhension commune du flux métier, même sans base de données réelle.

## 1. Création (Web Client)

- **Déclencheur**: Le client ajoute des produits au panier et valide (`/cart`).
- **Action**: L'`AppContext` génère une `Order` avec un ID aléatoire et le statut `submitted`.
- **Suivi**: La commande passe par une simulation locale (setInterval) qui fait évoluer son statut : `submitted` -> `preparing` -> `ready_for_delivery` -> `assigned_to_driver` -> `out_for_delivery` -> `delivered`. Ce qui permet de voir la page `OrderTracking` s'animer.

## 2. Réception & Préparation (Web Store)

- **Déclencheur**: La commande mockée `ORD-DEMO-001` (issue du `StoreContext`) apparaît dans le Dashboard (`/`).
- **Statut initial**: `submitted` ou `draft`.
- **Action 1**: Le gérant clique sur "Accepter & Préparer". Le statut passe à `preparing`.
- **Action 2**: Le gérant pointe les articles (`/order/:id/prepare`). Une fois terminé, le statut passe à `ready_for_delivery`.
- **Action 3**: Le gérant assigne un livreur (`/order/:id/assign`). Le statut passe à `assigned_to_driver`.

## 3. Livraison (Web Driver)

- **Déclencheur**: La livraison `DEL-DEMO-001` (liée à `ORD-DEMO-001`) apparaît dans les "Courses Disponibles" (`/deliveries/available`).
- **Statut initial**: `available`.
- **Action 1**: Le livreur accepte. Statut passe à `assigned`.
- **Action 2**: Le livreur récupère le colis au store. Statut passe à `picked_up`.
- **Action 3**: Le livreur part chez le client. Statut passe à `in_transit`.
- **Action 4**: Le livreur remet le colis et encaisse (`/delivery/:id/complete`). Statut passe à `delivered`.

## Correspondance des Modèles (packages/types)

Les trois applications s'appuient sur les types partagés `Order`, `Delivery`, `Product`, `Customer` définis dans `@depaneuria/types`.
Le fichier `demo-data.ts` fournit les objets constants (ex: `DEMO_ORDER`, `DEMO_DELIVERY`) assurant que chaque application affiche exactement les mêmes informations lors de la démo de base.
