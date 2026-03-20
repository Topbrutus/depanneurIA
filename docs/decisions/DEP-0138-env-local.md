# DEP-0138 — Stratégie des fichiers .env locaux

## Principe

En environnement local (poste du développeur), les variables d'environnement sont
fournies via des fichiers `.env.local`. Ces fichiers ne sont jamais versionnés.

## Règles

1. **`.env.local` n'est jamais commité** — il est listé dans `.gitignore` à la racine
   et dans chaque application.
2. **`.env.example` est toujours tenu à jour** — tout ajout d'une variable requise
   doit s'accompagner d'une mise à jour du `.env.example` correspondant.
3. **Valeurs de `.env.example`** — uniquement des valeurs factices ou des descriptions,
   jamais des secrets réels.
4. **Pas de valeurs par défaut pour les secrets** — une variable de type secret
   sans valeur provoque un échec explicite au démarrage.

## Ordre de priorité de chargement (Next.js / Node.js standard)

```
.env.local          ← priorité la plus haute (local uniquement, non commité)
.env.[NODE_ENV]     ← surcharge par environnement
.env                ← valeurs de base (peut être commité si non sensible)
```

## Procédure d'onboarding d'un nouveau développeur

```bash
# 1. Copier le fichier d'exemple
cp .env.example .env.local

# 2. Renseigner les valeurs réelles (reçues via canal sécurisé : 1Password, Vault, etc.)
# Éditer .env.local avec les valeurs d'un environnement de développement partagé

# 3. Démarrer le projet
pnpm dev
```

## Fichiers concernés

| Fichier                 | Versionné | Rôle                                     |
| ----------------------- | --------- | ---------------------------------------- |
| `.env.example`          | Oui       | Template documenté pour les développeurs |
| `.env.local`            | Non       | Valeurs locales réelles (développeur)    |
| `apps/web/.env.example` | Oui       | Template pour les variables du front-end |
| `apps/api/.env.example` | Oui       | Template pour les variables de l'API     |

## Références croisées

- DEP-0136 — stratégie générale des variables d'environnement
- DEP-0137 — stratégie des secrets
- DEP-0139 — stratégie des fichiers `.env` cloud
