# RELEASE-CHECKLIST — depaneurIA

Checklist à suivre avant chaque merge dans `main` (release ou hotfix).

---

## Avant d'ouvrir la PR

- [ ] `bash scripts/verify-monorepo.sh` passe sans erreur
- [ ] `bash scripts/smoke-local.sh` passe sans erreur
- [ ] `pnpm lint` propre (zéro warning bloquant)
- [ ] `pnpm typecheck` propre
- [ ] `pnpm test` passe
- [ ] `pnpm build` passe
- [ ] Pas de `console.log` de debug laissé dans le code
- [ ] `.env.example` mis à jour si nouvelles variables ajoutées
- [ ] `docs/STATE.md` mis à jour si l'état du projet a changé

## PR ouverte

- [ ] Titre de PR suit le format : `type(scope): description courte`
- [ ] Description de PR renseignée (contexte, changements, test plan)
- [ ] Labels appropriés posés (`type:*`, `scope:*`, `priority:*`)
- [ ] Lié au ticket GitHub correspondant (`Closes #XX`)
- [ ] CI verte (tous les checks passent)
- [ ] Au moins 1 review approuvée
- [ ] Branche à jour avec `main` ou `develop`

## Avant le merge

- [ ] Squash & merge (préféré) ou merge commit selon la politique du bloc
- [ ] Message de commit final propre (pas de "WIP", pas de "fix: fix fix")
- [ ] Supprimer la branche après merge

## Après le merge dans `main` (release seulement)

- [ ] Créer un tag Git : `git tag v0.X.Y && git push origin v0.X.Y`
- [ ] Créer une GitHub Release avec les notes de changements
- [ ] Mettre à jour `docs/STATE.md` avec le numéro de version
- [ ] Notifier l'équipe / le dépanneur pilote si applicable

---

## Niveaux de version (semver simplifié)

| Type | Quand | Exemple |
|---|---|---|
| `patch` X.X.**Y** | Bugfix sans impact API | `0.1.1` |
| `minor` X.**Y**.0 | Nouvelle fonctionnalité rétrocompatible | `0.2.0` |
| `major` **X**.0.0 | Changement cassant ou pilote officiel | `1.0.0` |
