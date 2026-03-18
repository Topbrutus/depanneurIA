# DEP-0161 à DEP-0164 — Cartes du site par rôle

## Périmètre

Définir la carte complète du site pour chacun des quatre rôles principaux :
client, dépanneur, livreur et super administrateur. Chaque carte liste les
pages accessibles, leur route et leur objectif. Aucune implémentation UI n'est
faite ici ; il s'agit uniquement de la documentation de référence.

---

## DEP-0161 — Carte du site côté client

Le client est l'utilisateur final qui passe commande auprès d'un dépanneur.

| Route                          | Page                        | Accès         |
|--------------------------------|-----------------------------|---------------|
| `/`                            | Accueil publique            | public        |
| `/boutique`                    | Boutique manuelle           | public        |
| `/mode-assiste`                | Mode assisté (chat/vocal)   | public        |
| `/connexion`                   | Connexion                   | public        |
| `/inscription`                 | Inscription                 | public        |
| `/profil`                      | Profil client               | authentifié   |
| `/profil/adresses`             | Adresses enregistrées       | authentifié   |
| `/commandes`                   | Historique des commandes    | authentifié   |
| `/commandes/derniere`          | Dernière commande           | authentifié   |
| `/commandes/:id/suivi`         | Suivi de commande en cours  | authentifié   |
| `/produits-populaires`         | Produits populaires         | public        |
| `/contact`                     | Contact du dépanneur        | public        |
| `/conditions-utilisation`      | Conditions d'utilisation    | public        |
| `/confidentialite`             | Politique de confidentialité| public        |
| `/accessibilite`               | Déclaration d'accessibilité | public        |
| `/aide-vocale`                 | Aide vocale                 | public        |

### Parcours type — client

1. Arrivée sur `/` → découverte de l'offre.
2. Navigation vers `/boutique` (recherche manuelle) ou `/mode-assiste` (guidé).
3. Ajout au panier → `/connexion` si non authentifié → `/inscription` si nouveau.
4. Validation de la commande → `/commandes/:id/suivi` (temps réel).
5. Après livraison → `/commandes` pour consulter l'historique.

---

## DEP-0162 — Carte du site côté dépanneur

Le dépanneur est le commerçant qui prépare et expédie les commandes.

| Route                                  | Page                        | Accès         |
|----------------------------------------|-----------------------------|---------------|
| `/depanneur/connexion`                 | Connexion dépanneur         | public        |
| `/depanneur/tableau-de-bord`           | Tableau de bord             | authentifié   |
| `/depanneur/commandes`                 | Liste des commandes         | authentifié   |
| `/depanneur/commandes/:id`             | Détail d'une commande       | authentifié   |
| `/depanneur/produits`                  | Gestion des produits        | authentifié   |
| `/depanneur/produits/:id`              | Détail / édition produit    | authentifié   |
| `/depanneur/inventaire`                | Inventaire et disponibilité | authentifié   |
| `/depanneur/profil`                    | Profil du commerce          | authentifié   |
| `/depanneur/horaires`                  | Horaires d'ouverture        | authentifié   |
| `/depanneur/statistiques`              | Statistiques de vente       | authentifié   |

### Parcours type — dépanneur

1. Connexion via `/depanneur/connexion`.
2. Consultation du tableau de bord → nouvelles commandes en attente.
3. Ouverture d'une commande → préparation → marquage « prête ».
4. Gestion quotidienne des produits et de l'inventaire.

---

## DEP-0163 — Carte du site côté livreur

Le livreur récupère les commandes préparées et les livre au client.

| Route                                | Page                        | Accès         |
|--------------------------------------|-----------------------------|---------------|
| `/livreur/connexion`                 | Connexion livreur           | public        |
| `/livreur/tableau-de-bord`           | Tableau de bord             | authentifié   |
| `/livreur/livraisons`                | Liste des livraisons        | authentifié   |
| `/livreur/livraisons/:id`            | Détail d'une livraison      | authentifié   |
| `/livreur/livraisons/:id/itineraire` | Itinéraire de livraison     | authentifié   |
| `/livreur/historique`                | Historique des livraisons   | authentifié   |
| `/livreur/profil`                    | Profil livreur              | authentifié   |
| `/livreur/disponibilite`             | Gestion de disponibilité    | authentifié   |

### Parcours type — livreur

1. Connexion via `/livreur/connexion`.
2. Consultation du tableau de bord → livraisons assignées.
3. Acceptation d'une livraison → consultation de l'itinéraire.
4. Récupération au dépanneur → livraison au client → confirmation.

---

## DEP-0164 — Carte du portail super administrateur

Le super administrateur supervise l'ensemble de la plateforme.

| Route                                  | Page                          | Accès         |
|----------------------------------------|-------------------------------|---------------|
| `/admin/connexion`                     | Connexion administrateur      | public        |
| `/admin/tableau-de-bord`               | Tableau de bord global        | authentifié   |
| `/admin/depanneurs`                    | Liste des dépanneurs          | authentifié   |
| `/admin/depanneurs/:id`                | Détail d'un dépanneur         | authentifié   |
| `/admin/livreurs`                      | Liste des livreurs            | authentifié   |
| `/admin/livreurs/:id`                  | Détail d'un livreur           | authentifié   |
| `/admin/clients`                       | Liste des clients             | authentifié   |
| `/admin/clients/:id`                   | Détail d'un client            | authentifié   |
| `/admin/commandes`                     | Toutes les commandes          | authentifié   |
| `/admin/commandes/:id`                 | Détail d'une commande         | authentifié   |
| `/admin/produits`                      | Catalogue produits global     | authentifié   |
| `/admin/zones-livraison`               | Gestion des zones             | authentifié   |
| `/admin/statistiques`                  | Statistiques plateforme       | authentifié   |
| `/admin/parametres`                    | Paramètres généraux           | authentifié   |

### Parcours type — super administrateur

1. Connexion via `/admin/connexion`.
2. Vue d'ensemble sur le tableau de bord (commandes, livreurs, dépanneurs actifs).
3. Gestion des comptes (dépanneurs, livreurs, clients).
4. Supervision des commandes et des zones de livraison.
5. Consultation des statistiques et ajustement des paramètres.

---

## Résumé

| Rôle              | Nombre de pages | Préfixe de route  |
|-------------------|-----------------|-------------------|
| Client            | 16              | `/`               |
| Dépanneur         | 10              | `/depanneur/`     |
| Livreur           | 8               | `/livreur/`       |
| Super admin       | 14              | `/admin/`         |
| **Total unique**  | **48**          |                   |

Les routes respectent la convention kebab-case définie dans DEP-0153.
