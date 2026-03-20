# Site Map Super Admin V1

**Objectif** : Gérer la plateforme multi-tenant, superviser la santé globale du système.
**Utilisateurs visés** : Opérateurs de la plateforme (nous).

## Pages Principales (V1)

- **Dashboard Santé** (`/`) : États système, incidents actifs.
- **Tenants (Dépanneurs)** (`/tenants`) : Liste, création, désactivation de boutiques.
- **Supervision Commandes** (`/monitoring/orders`) : Vue globale des commandes en souffrance.

## Pages Secondaires (V1)

- **Supervision Appels** (`/monitoring/calls`) : Logs et états de la passerelle téléphonique.
- **Configuration Globale** (`/settings`) : Variables système globales non-sensibles.
- **Catalogue des Clients** (`/customers`) : Base de données clients transversale (lecture seule).

## Futures pages (Hors V1)

- Facturation des tenants (Stripe Connect)
- Déploiement automatisé de nouveaux tenants
