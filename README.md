# depaneurIA

Base initiale du projet **depaneurIA**.

Ce dépôt sert de **source unique de vérité** pour travailler à trois :

- **toi** : validation, décisions, priorités ;
- **Copilot** : exécution ciblée, issue par issue ;
- **ChatGPT** : découpage logique, cohérence d’ensemble, contrôle de l’avancement.

## Nom de travail interne

> **depaneurIA**

C'est le nom de travail interne officiel du projet. Il est utilisé dans le dépôt, la documentation et les conventions.

## Promesse client

> Commander vite, clairement et simplement, avec paiement à la livraison.

## Promesse dépanneur

> Recevoir, traiter et livrer des commandes simplement, sans compliquer les opérations du dépanneur.

## Fichiers à lire en premier

- `docs/1000-checklist.md` — la checklist complète des 1000 tâches
- `docs/STATE.md` — l’état vivant du projet
- `docs/TASK-BLOCKS.md` — le découpage en blocs de 10 tâches pour GitHub Issues
- `.github/copilot-instructions.md` — les règles d’exécution pour Copilot

## Règle de base

On avance **dans l’ordre**.
On évite de sauter à une tâche lointaine tant que le bloc actif n’est pas stabilisé.

## Workflow recommandé

1. Lire `docs/STATE.md`
2. Ouvrir ou mettre à jour l’issue du bloc actif
3. Travailler uniquement sur ce bloc
4. Ouvrir une pull request liée à l’issue
5. Mettre à jour `docs/STATE.md`
6. Cocher les lignes terminées dans `docs/1000-checklist.md`

## Structure initiale

```text
docs/
apps/
packages/
infra/
scripts/
assets/
decisions/
diagrams/
prompts/
.github/
```

## Statut actuel

Le dépôt existe, mais la base projet est encore au tout début.
Le premier bloc pratique recommandé est le bloc GitHub de fondation autour de la zone `0084+`.

## Licence

Le fichier `LICENSE` fourni ici est un **placeholder propriétaire**.
Il peut être remplacé plus tard par la licence finale choisie.
