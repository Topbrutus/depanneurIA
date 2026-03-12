# depaneurIA

Base initiale du projet **depaneurIA**.

Ce dépôt sert de **source unique de vérité** pour travailler à trois :

- **toi** : validation, décisions, priorités ;
- **Copilot** : exécution ciblée, issue par issue ;
- **ChatGPT** : découpage logique, cohérence d’ensemble, contrôle de l’avancement.

## Nom de travail interne

> **depaneurIA**

C'est le nom de travail interne officiel du projet. Il est utilisé dans le dépôt, la documentation et les conventions.

## Nom commercial

> **DépannVite**

C'est le nom commercial officiel du produit SaaS destiné aux dépanneurs. Il est utilisé pour présenter le produit aux futurs clients dépanneurs, dans les supports de communication et la documentation orientée utilisateur. Le nom interne `depaneurIA` reste utilisé dans le dépôt et le code.

## Promesse client

> Commander vite, clairement et simplement, avec paiement à la livraison.

## Promesse dépanneur

> Recevoir, traiter et livrer des commandes simplement, sans compliquer les opérations du dépanneur.

## Slogan

> Commander simplement. Livrer clairement.

## Profils principaux (V1)

- **Client** : passe commande en mode manuel, assisté écran ou téléphone, fournit les infos de contact et paie à la livraison, suit le statut jusqu’à la remise.
- **Dépanneur** : configure le catalogue de sa boutique, reçoit et valide les commandes, prépare les articles et remet la commande prête au client ou au livreur.
- **Livreur** : prend en charge une commande préparée, la transporte jusqu’au client, confirme la remise et l’encaissement à la livraison quand attendu.
- **Super administrateur** : paramètre et supervise les dépanneurs et livreurs, contrôle les accès et règles transverses, veille à la cohérence et à la qualité du service.
## Problème principal côté client

> Aujourd’hui, commander au dépanneur oblige le client à décrire sa demande par morceaux (appels, messages, allers-retours) sans savoir si les produits sont disponibles ni quand ils arriveront. Il perd du temps à répéter adresse et liste d’articles pour obtenir une confirmation, surtout quand il est pressé ou mal à l’aise avec les interfaces actuelles.

## Problème principal côté dépanneur

> Aujourd’hui, le dépanneur reçoit des commandes incomplètes par appels ou messages, doit rappeler pour récupérer l’adresse, vérifier la disponibilité et convenir du paiement à la livraison. Il jongle entre préparation et livraison sans interface simple, perd du temps à coordonner et risque erreurs ou ventes perdues juste pour finaliser une commande de base.

## Problème principal côté livreur

> Aujourd’hui, le livreur part avec des consignes partielles : adresse ou accès mal confirmés, paiement à récupérer flou, absence d’heure précise. Il passe des appels pour valider la remise, attend sur place ou fait des détours inutiles, ce qui rallonge la course et fait rater des livraisons pourtant prêtes.

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
