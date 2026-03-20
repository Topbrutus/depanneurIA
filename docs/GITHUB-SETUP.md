# GITHUB-SETUP — Configuration manuelle GitHub

Ce document liste les étapes **manuelles** à effectuer dans l'interface GitHub
après le premier push. Elles ne sont pas automatisables par API sans token
admin spécifique.

---

## 1. Branche `develop`

**Où** : GitHub → dépôt → Code → branche selector → « New branch »

```
Nom     : develop
Source  : main
```

> Ou via terminal : `git push origin main:develop`

---

## 2. Protection de `main`

**Où** : Settings → Branches → Add branch protection rule

| Paramètre                                  | Valeur                                           |
| ------------------------------------------ | ------------------------------------------------ |
| Branch name pattern                        | `main`                                           |
| Require a pull request before merging      | ✅                                               |
| Required approvals                         | 1                                                |
| Require status checks to pass              | ✅                                               |
| Required status checks                     | `CI / Install · Lint · Typecheck · Test · Build` |
| Required status checks                     | `Smoke / Smoke — structure & scripts`            |
| Require branches to be up to date          | ✅                                               |
| Do not allow bypassing the above settings  | ✅                                               |
| Restrict who can push to matching branches | ✅ (admins uniquement)                           |

---

## 3. Protection de `develop`

**Même chemin** : Settings → Branches → Add rule

| Paramètre                             | Valeur                                           |
| ------------------------------------- | ------------------------------------------------ |
| Branch name pattern                   | `develop`                                        |
| Require a pull request before merging | ✅                                               |
| Required approvals                    | 1                                                |
| Require status checks to pass         | ✅                                               |
| Required status checks                | `CI / Install · Lint · Typecheck · Test · Build` |

---

## 4. Labels personnalisés

**Où** : Issues → Labels → New label

Créer les labels suivants (supprimer les labels GitHub par défaut inutiles) :

| Nom               | Couleur   | Description                             |
| ----------------- | --------- | --------------------------------------- |
| `type:feat`       | `#0075ca` | Nouvelle fonctionnalité                 |
| `type:fix`        | `#e4e669` | Correction de bug                       |
| `type:docs`       | `#cfd3d7` | Documentation seulement                 |
| `type:ci`         | `#f9d0c4` | CI/CD                                   |
| `type:refactor`   | `#bfd4f2` | Refactoring sans changement fonctionnel |
| `type:test`       | `#d4c5f9` | Tests                                   |
| `scope:web`       | `#0e8a16` | App web client                          |
| `scope:api`       | `#1d76db` | API backend                             |
| `scope:mobile`    | `#e99695` | Interface livreur/mobile                |
| `scope:infra`     | `#b60205` | Infrastructure / CI                     |
| `scope:docs`      | `#5319e7` | Documentation                           |
| `priority:high`   | `#b60205` | Priorité haute                          |
| `priority:medium` | `#fbca04` | Priorité moyenne                        |
| `priority:low`    | `#0075ca` | Priorité basse                          |
| `status:blocked`  | `#d93f0b` | Bloqué                                  |
| `status:ready`    | `#0e8a16` | Prêt à implémenter                      |

---

## 5. Project Board `DépannVite`

**Où** : Projects (onglet) → New project → Board

Colonnes à créer :

| Colonne       | Description                     |
| ------------- | ------------------------------- |
| `📋 Backlog`  | Tickets non planifiés           |
| `🎯 À faire`  | Planifié pour ce sprint         |
| `🚧 En cours` | En cours de développement       |
| `👁 Review`   | PR ouverte en attente de review |
| `✅ Terminé`  | Fusionné dans develop ou main   |

Automation à activer :

- PR ouverte → colonne `👁 Review`
- PR mergée → colonne `✅ Terminé`
- Issue fermée → colonne `✅ Terminé`

---

## 6. CODEOWNERS

Le fichier `CODEOWNERS` existe déjà à la racine. Vérifier que les usernames
correspondent aux membres actuels de l'équipe.

---

## Checklist de validation

- [ ] Branche `develop` créée
- [ ] Protection `main` activée avec checks CI obligatoires
- [ ] Protection `develop` activée
- [ ] Labels personnalisés créés
- [ ] Project board `DépannVite` créé avec 5 colonnes
- [ ] Automations project board activées
- [ ] CODEOWNERS vérifié
