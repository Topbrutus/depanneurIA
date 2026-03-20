# Contribution au projet depaneurIA

Ce dépôt centralise le développement de la plateforme **depaneurIA**. Merci de respecter ces quelques règles pour assurer la cohérence et la qualité du projet.

## Principes de base

- **Petits changements :** Privilégiez des modifications atomiques et faciles à relire.
- **Ouverture d'issue :** Avant tout changement important, merci d'ouvrir une issue pour discuter de l'approche technique ou fonctionnelle.

## Qualité minimale du code

- **TypeScript strict** : Obligatoire partout. Pas de \`any\` gratuit (sauf avec justification explicite).
- **Simplicité** : Petits modules lisibles, imports propres.
- **Séparation des préoccupations** : Pas de logique métier dans les composants UI.
- **Réutilisabilité** : Utiliser les packages partagés (\`packages/\*\`) pour la logique métier, la configuration et les types.
- **Formatage** : Prettier et ESLint doivent passer avant toute PR.

## Branch naming rules

- `main` = branche stable (production)
- `dev` = branche d’intégration (développement principal)
- `feat/<topic>` = nouvelle fonctionnalité
- `fix/<topic>` = correction de bug
- `docs/<topic>` = modification de la documentation
- `chore/<topic>` = maintenance, configuration, etc.
- `infra/<topic>` = modifications d'infrastructure

Utilisez des noms de branches courts, en minuscules, avec des tirets pour séparer les mots.

### Exemples :

- `feat/web-client`
- `feat/api-core`
- `fix/readme-links`
- `docs/project-vision`
- `infra/gcp-bootstrap`

## Commit naming rules

Nous suivons les [Conventional Commits](https://www.conventionalcommits.org/) de manière simple :

**Format :** `type(scope): short description`

**Types autorisés :**

- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `chore` : Tâches de maintenance (ex. config)
- `refactor` : Modification du code sans changement fonctionnel
- `test` : Ajout ou modification de tests
- `build` : Système de build ou dépendances externes
- `ci` : Configuration de l'intégration continue

La description doit être courte, claire et rédigée en minuscules.

### Exemples :

- `feat(repo): add base folder structure`
- `fix(api): correct order status mapping`
- `docs(readme): clarify project vision`
- `chore(github): add issue templates`

## Version tag naming rules

- Format officiel : `vMAJOR.MINOR.PATCH`
- Pas d’espaces
- Toujours en minuscules pour le `v`
- Utiliser les tags seulement pour des versions stables ou jalons clairement décidés

### Exemples :

- `v0.1.0`
- `v0.2.0`
- `v1.0.0`

## Pull Requests

Toute modification doit passer par une Pull Request (PR) propre et lisible. Elle sera revue avant d'être fusionnée dans la branche principale.
