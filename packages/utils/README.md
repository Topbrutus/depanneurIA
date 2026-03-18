# packages/utils — Utilitaires partagés

## Rôle

Fonctions utilitaires pures partagées entre toutes les applications du monorepo.  
Pas de dépendances vers React ou Node.js — code 100 % agnostique de l'environnement d'exécution.

## Contenu prévu

- Formatage : dates, prix, numéros de téléphone
- Validation : email, numéro de téléphone, code postal
- Helpers divers : génération d'identifiants, comparaison d'objets

## Utilisé par

- `apps/web`
- `apps/api`

## Structure interne prévue

```
packages/utils/
├── src/
│   ├── format/          # Fonctions de formatage
│   ├── validate/        # Fonctions de validation
│   └── index.ts         # Point d'entrée du package
├── tsconfig.json
└── package.json
```

## DEP concerné

DEP-0135
