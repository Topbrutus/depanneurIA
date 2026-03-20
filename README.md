# depaneurIA

Une plateforme SaaS moderne pour commander des services de dépannage en mode manuel, assisté ou téléphonique.

## Vision

Offrir une expérience de commande fluide et accessible, permettant aux clients de solliciter un dépanneur rapidement par interface web ou par simple appel vocal guidé, tout en simplifiant la gestion des commandes pour les dépanneurs.

## Stack Officielle

- **Langage principal** : TypeScript (strict)
- **Interface web (Front)** : React
- **Backend principal** : Node.js
- **Architecture** : Monorepo
- **Gestionnaire de paquets** : pnpm + Turborepo

## Versions Minimales

- **Node.js** : 22.x LTS (via \`.nvmrc\`)
- **TypeScript** : 5.8+

## Structure Monorepo

Ce projet utilise un monorepo basé sur pnpm et Turborepo.

### Apps

- `web-client` : Client web (manuel + assisté, panier, suivi)
- `web-store` : Interface dépanneur
- `web-driver` : Interface livreur
- `api` : Backend principal
- `phone-gateway` : Pont téléphonique

### Packages

- `@depaneuria/types` : Définitions TypeScript communes
- `@depaneuria/config` : Configuration centralisée
- `@depaneuria/ui` : Bibliothèque de composants graphiques
- `@depaneuria/i18n` : Support multilingue
- `@depaneuria/catalog` : Gestion des articles et catégories
- `@depaneuria/cart` : Logique métier du panier
- `@depaneuria/orders` : Gestion du cycle de vie des commandes
- `@depaneuria/tenants` : Logique multi-boutiques
- `@depaneuria/auth` : Authentification et sécurité
- `@depaneuria/assistant` : Logique d'assistance intelligente
- `@depaneuria/notifications` : Alertes, emails et SMS
- `@depaneuria/telephony` : Intégration des services vocaux

### Support Folders

- `infra/` : Déploiement Cloud Run, GitHub Actions, IAM, Env
- `docs/` : Documentation produit, architecture, API, flux, tenants, deployment, operations
- `assets/` : Ressources graphiques (branding, mockups, icônes)

## Documentation & Conventions

- [Naming Conventions](docs/architecture/naming-conventions.md)
- [Local Setup & Verification](docs/operations/local-setup-checklist.md)

## Statut

Ce dépôt est actuellement en phase **foundation / scaffold**. La structure monorepo est en place et prête pour le développement des premiers modules métiers.

## Documentation Produit & UX

Consultez la documentation détaillée de la V1 dans le dossier `docs/product/` :

- [Site Maps](docs/product/site-map-client.md)
- [Pages Clés](docs/product/client-pages-v1.md)
- [Règles de Layout](docs/product/layout-rules-v1.md)
- [Design System](docs/product/design-system-v1.md)
- [Composants V1](docs/product/component-catalog-v1.md)
- [Comportements](docs/flows/client-interactions-v1.md)
