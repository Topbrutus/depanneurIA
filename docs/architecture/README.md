# Architecture

Vue d'ensemble du monorepo, des composants logiciels et de leurs interactions.

## Stack Officielle

- **Langage** : TypeScript
- **Interface web (Front)** : React
- **Backend principal** : Node.js
- **Monorepo** : pnpm workspaces + Turborepo

## Structure du projet

### Apps (\`apps/\`)

Applications directement exécutables et déployables :

- \`web-client\` : Frontend React pour les clients (panier, suivi).
- \`web-store\` : Frontend React pour les dépanneurs (gestion de catalogue, commandes).
- \`web-driver\` : Frontend React pour les livreurs.
- \`api\` : Backend Node.js principal.
- \`phone-gateway\` : Backend Node.js passerelle pour les interactions téléphoniques.

### Packages (\`packages/\`)

Modules partagés contenant la logique réutilisable et les types communs :

- \`types\`, \`config\`, \`ui\`, \`i18n\`, \`catalog\`, \`cart\`, \`orders\`, \`tenants\`, \`auth\`, \`assistant\`, \`notifications\`, \`telephony\`

### Principes architecturaux

- Séparation stricte entre le front et le backend.
- Les interfaces web ne contiennent que la logique de présentation ; la logique métier réutilisable est encapsulée dans les packages ou fournie par l'API.
- TypeScript strict obligatoire, pas d'utilisation abusive du type \`any\`.

## Conventions

- Pour les règles de nommage (fichiers, composants, routes, tables), consultez les [Conventions de nommage](naming-conventions.md).

## Définitions UX/UI

L'architecture frontend est guidée par les spécifications définies dans :

- `docs/product/layout-rules-v1.md`
- `docs/product/design-system-v1.md`
