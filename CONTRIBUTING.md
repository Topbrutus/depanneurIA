# Contribution

## Principe

Le dépôt est piloté par une checklist ordonnée de 1000 lignes.
On évite les changements flous, larges ou non reliés à un bloc précis.

## Avant de commencer

1. Lire `docs/STATE.md`
2. Identifier le bloc actif dans `docs/TASK-BLOCKS.md`
3. Vérifier si une issue existe déjà
4. Lier le travail à une issue

## Règles de travail

- Une seule intention claire par pull request
- Travailler bloc par bloc
- Écrire ce qui a été fait et ce qui reste
- Mettre à jour `docs/STATE.md` si l’état du projet change
- Cocher les tâches terminées dans `docs/1000-checklist.md`

## Nommage recommandé

### Branches
- `feat/dep-0084-readme-initial`
- `chore/dep-0098-template-bug`
- `docs/dep-0101-pr-template`

### Commits
- `docs: add initial README`
- `chore: add GitHub issue templates`
- `ci: add repo guard workflow`

## Pull requests

Chaque PR devrait contenir :

- le ou les IDs de checklist concernés ;
- le but du changement ;
- la définition de terminé ;
- les points restant à faire ;
- les impacts éventuels sur `STATE.md`.

## Ce qu’on évite

- sauter plusieurs blocs sans raison ;
- mélanger code produit + infra + docs dans une même PR si ce n’est pas nécessaire ;
- fermer une issue sans avoir mis à jour la checklist et l’état.
