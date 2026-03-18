# DEP-0311 à DEP-0320 — Erreurs, persistance et validation du parcours client

## Périmètre

Ce document définit les **messages d'erreur de validation** du parcours client
(téléphone invalide, zone non desservie, compte incomplet), les **logiques de
persistance** liées au compte (panier, préférences, dernière commande, favoris)
et les **validations de bout en bout** confirmant que le parcours d'inscription
et de retour fonctionne sans friction.

Il conclut le macro-bloc DEP-0281–0320 en **gelant le parcours client de base**
avant toute extension future.

Il s'agit exclusivement de **documentation** : aucun code produit, aucune
implémentation. Les spécifications décrites ici serviront de référence pour les
futures implémentations front-end et back-end.

---

## DEP-0311 — Message d'erreur pour téléphone invalide

### Objectif

Définir le message affiché lorsqu'un client saisit un numéro de téléphone dont
le format est invalide (inscription, mise à jour de profil).

### Message

| Élément         | Valeur                                                                             |
|-----------------|------------------------------------------------------------------------------------|
| Code erreur     | `ERR_PHONE_INVALID`                                                                |
| Message affiché | « Le numéro de téléphone saisi n'est pas valide. Vérifie le format et réessaie. » |
| Ton             | Bienveillant, direct                                                               |
| Emplacement     | Sous le champ téléphone, en rouge (#D32F2F)                                        |

### Règles de déclenchement

- Le numéro ne correspond pas au format attendu (ex. : 10 chiffres, préfixe +33 ou 0).
- Le champ est vide alors qu'il est obligatoire.
- Le numéro contient des caractères non numériques (hors `+` en première position).

### Cas attendus

| Cas                               | Résultat attendu                 |
|-----------------------------------|----------------------------------|
| Champ vide                        | ❌ Erreur — champ obligatoire    |
| Moins de 10 chiffres              | ❌ Erreur — format invalide      |
| Lettres ou caractères spéciaux    | ❌ Erreur — caractères interdits |
| Numéro valide (10 chiffres / +33) | ✅ Accepté                       |

---

## DEP-0312 — Message d'erreur pour zone non desservie

### Objectif

Définir le message affiché lorsqu'un client saisit une adresse située hors de
la zone de livraison couverte par depaneurIA.

### Message

| Élément         | Valeur                                                                                    |
|-----------------|-------------------------------------------------------------------------------------------|
| Code erreur     | `ERR_ZONE_NOT_SERVED`                                                                     |
| Message affiché | « Désolé, cette adresse se trouve en dehors de notre zone de livraison pour le moment. » |
| Ton             | Empathique, honnête                                                                       |
| Emplacement     | Sous le champ adresse, en orange (#E65100)                                                |

### Règles de déclenchement

- L'adresse saisie est géolocalisable mais se trouve hors du périmètre de
  livraison défini.
- Le code postal ne fait pas partie de la liste des codes postaux desservis.

### Cas attendus

| Cas                                 | Résultat attendu               |
|-------------------------------------|--------------------------------|
| Code postal hors zone               | ❌ Erreur — zone non desservie |
| Adresse dans une ville non couverte | ❌ Erreur — zone non desservie |
| Adresse dans la zone de livraison   | ✅ Accepté                     |

---

## DEP-0313 — Message d'erreur pour compte incomplet

### Objectif

Définir le message affiché lorsqu'un client tente d'effectuer une action
nécessitant un profil complet (passer commande, sauvegarder une adresse) alors
que des champs obligatoires sont manquants.

### Message

| Élément         | Valeur                                                                               |
|-----------------|--------------------------------------------------------------------------------------|
| Code erreur     | `ERR_ACCOUNT_INCOMPLETE`                                                             |
| Message affiché | « Ton compte est incomplet. Complète les informations manquantes pour continuer. »  |
| Ton             | Encourageant, clair                                                                  |
| Emplacement     | Bannière en haut de l'écran concerné, en orange (#E65100)                            |

### Champs vérifiés

| Champ              | Obligatoire | Référence |
|--------------------|-------------|-----------|
| Nom                | Oui         | DEP-0282  |
| Téléphone          | Oui         | DEP-0282  |
| Adresse principale | Oui         | DEP-0282  |

### Règles de déclenchement

- Au moins un champ obligatoire est vide ou invalide.
- Le message s'affiche **avant** toute tentative d'action bloquée.
- Un lien « Compléter mon profil » redirige vers l'écran de profil (DEP-0303).

### Cas attendus

| Cas                                     | Résultat attendu              |
|-----------------------------------------|-------------------------------|
| Nom manquant                            | ❌ Erreur — compte incomplet  |
| Téléphone manquant                      | ❌ Erreur — compte incomplet  |
| Adresse manquante                       | ❌ Erreur — compte incomplet  |
| Tous les champs obligatoires renseignés | ✅ Accepté                    |

---

## DEP-0314 — Logique de sauvegarde du panier lié au compte

### Objectif

Définir comment le panier du client est persisté et rattaché à son compte, afin
qu'il retrouve son panier en cours lors de sa prochaine connexion.

### Comportement attendu

1. Le panier est créé dès le premier ajout de produit.
2. Si le client est connecté, le panier est **lié à son compte** côté serveur.
3. Si le client n'est pas connecté, le panier est stocké localement (navigateur).
4. À la connexion, le panier local est **fusionné** avec le panier serveur
   existant (le cas échéant).
5. En cas de conflit (même produit, quantités différentes), la quantité la plus
   récente est conservée.

### Règles

- Le panier serveur est la **source de vérité** une fois le client connecté.
- Le panier local est supprimé après fusion réussie.
- Un panier vide ne génère aucune entrée côté serveur.
- Le panier expire après **30 jours** d'inactivité côté serveur.

### Cas attendus

| Cas                                           | Résultat attendu                 |
|-----------------------------------------------|----------------------------------|
| Client connecté ajoute un produit             | ✅ Panier sauvé côté serveur     |
| Client non connecté ajoute un produit         | ✅ Panier sauvé localement       |
| Client se connecte avec panier local existant | ✅ Fusion panier local → serveur |
| Panier inactif > 30 jours                    | ✅ Panier expiré, supprimé       |

---

## DEP-0315 — Logique de sauvegarde des préférences de recherche

### Objectif

Définir comment les préférences de recherche du client sont persistées pour
améliorer son expérience lors de ses visites suivantes.

### Préférences sauvegardées

| Préférence               | Type     | Exemple                   |
|--------------------------|----------|---------------------------|
| Dernière recherche texte | `string` | `"chips ketchup"`         |
| Dernier filtre catégorie | `string` | `"boissons"`              |
| Dernier tri utilisé      | `string` | `"prix_asc"`              |
| Mode préféré             | `string` | `"manuel"` ou `"assiste"` |

### Comportement attendu

1. Les préférences sont sauvegardées **à chaque changement** par le client.
2. Si le client est connecté, les préférences sont stockées côté serveur.
3. Si le client n'est pas connecté, les préférences sont stockées localement.
4. À la connexion, les préférences serveur **prévalent** sur les préférences
   locales (pas de fusion, écrasement).
5. Le mode préféré est défini en DEP-0299 ; ici on confirme sa persistance
   avec les autres préférences.

### Règles

- Les préférences sont facultatives : un client sans préférence utilise les
  valeurs par défaut.
- Seules les préférences listées ci-dessus sont sauvegardées en V1.
- Aucune donnée de recherche n'est partagée avec des tiers.

---

## DEP-0316 — Logique de sauvegarde de la dernière commande

### Objectif

Définir comment la dernière commande passée par le client est mémorisée pour
permettre un accès rapide (raccourci « recommander ») et un suivi simplifié.

### Données sauvegardées

| Champ             | Type       | Exemple                  |
|-------------------|------------|--------------------------|
| ID commande       | `string`   | `"CMD-20260312-001"`     |
| Date de commande  | `datetime` | `"2026-03-12T14:30:00Z"` |
| Statut            | `string`   | `"livree"`, `"en_cours"` |
| Nombre d'articles | `integer`  | `3`                      |
| Montant total TTC | `decimal`  | `96.70`                  |

### Comportement attendu

1. La dernière commande est mise à jour **à chaque nouvelle commande validée**.
2. Le client voit un résumé de sa dernière commande sur l'écran d'accueil ou
   son profil.
3. Un bouton « Recommander » permet de recharger les mêmes produits dans le
   panier (sous réserve de disponibilité).

### Règles

- Seule la **dernière** commande est affichée en résumé rapide (pas d'historique
  complet en V1).
- Si un produit de la dernière commande est en rupture, il est marqué comme
  indisponible lors du rechargement.
- La dernière commande est liée au compte et accessible après reconnexion.

---

## DEP-0317 — Logique de sauvegarde des produits favoris (si utile plus tard)

### Objectif

Définir la logique de sauvegarde des produits favoris, prête à être activée
ultérieurement si le besoin est confirmé. En V1, cette fonctionnalité est
**réservée mais non exposée** dans l'interface.

### Comportement prévu

1. Le client pourra marquer un produit comme favori (icône cœur ou étoile).
2. Les favoris seront stockés côté serveur, liés au compte client.
3. La liste des favoris sera accessible depuis le profil client.

### Données sauvegardées (par favori)

| Champ        | Type       | Exemple                  |
|--------------|------------|--------------------------|
| ID produit   | `string`   | `"P-01"`                 |
| Date d'ajout | `datetime` | `"2026-03-12T10:00:00Z"` |

### Règles

- **V1 : fonctionnalité non active dans l'interface.** Le modèle de données est
  défini mais aucun bouton favori n'est affiché.
- Pas de limite de favoris en V1 (à réévaluer si activé).
- Un produit supprimé du catalogue est automatiquement retiré des favoris.
- Aucune notification liée aux favoris en V1.

---

## DEP-0318 — Validation : le client peut s'inscrire et revenir sans friction

### Objectif

Valider que le parcours complet d'inscription, déconnexion et reconnexion
fonctionne de bout en bout sans perte de données ni friction inutile.

### Scénario de validation

| Étape | Action                                           | Résultat attendu                                     |
|-------|--------------------------------------------------|------------------------------------------------------|
| 1     | Le client ouvre le site pour la première fois    | Écran d'inscription affiché (DEP-0281, DEP-0301)     |
| 2     | Le client remplit nom, téléphone, adresse        | Formulaire accepté, compte créé (DEP-0282)           |
| 3     | Le client navigue et ajoute des produits         | Panier sauvé côté serveur (DEP-0314)                 |
| 4     | Le client ferme le site                          | Session terminée proprement                          |
| 5     | Le client revient et se reconnecte               | Reconnexion sans ressaisie complète (DEP-0287)       |
| 6     | Le panier est retrouvé                           | Panier restauré avec les produits ajoutés (DEP-0314) |
| 7     | Les préférences sont retrouvées                  | Mode et filtres restaurés (DEP-0315, DEP-0299)       |

### Critères de succès

- Aucune donnée perdue entre la première inscription et la reconnexion.
- Le client n'a pas besoin de ressaisir ses informations personnelles.
- Le panier, les préférences et la dernière commande sont restaurés.
- Le parcours complet (étapes 1 à 7) s'exécute sans erreur bloquante.

---

## DEP-0319 — Validation : les données minimales du client sont suffisantes pour livrer

### Objectif

Valider que les données collectées à l'inscription (DEP-0282) sont suffisantes
pour effectuer une livraison complète, sans nécessiter de relance ou de
complément d'information.

### Données minimales requises

| Donnée             | Source   | Nécessaire pour                       |
|--------------------|----------|---------------------------------------|
| Nom                | DEP-0282 | Identifier le destinataire            |
| Téléphone          | DEP-0282 | Contacter le client pour la livraison |
| Adresse principale | DEP-0282 | Localiser le point de livraison       |

### Vérifications

| Vérification                                          | Résultat attendu                             |
|-------------------------------------------------------|----------------------------------------------|
| Nom présent et non vide                               | ✅ Suffisant pour identifier le client       |
| Téléphone valide (format DEP-0284, DEP-0311)          | ✅ Suffisant pour contacter le client        |
| Adresse complète et dans la zone (DEP-0285, DEP-0312) | ✅ Suffisant pour livrer                     |
| Un champ obligatoire manquant                         | ❌ Livraison impossible — DEP-0313 déclenché |

### Critères de succès

- Avec les trois champs obligatoires renseignés et valides, un livreur dispose
  de toutes les informations nécessaires pour effectuer la livraison.
- Aucune information supplémentaire n'est requise pour le flux de base V1.
- Si un champ est manquant, le message DEP-0313 (compte incomplet) bloque
  la commande avant le paiement.

---

## DEP-0320 — Gel du parcours client de base avant d'ajouter plus de complexité

### Objectif

Confirmer que le parcours client de base (DEP-0281 à DEP-0319) est **complet,
cohérent et gelé**. Aucune modification ne doit être apportée à ce parcours
sans une décision explicite documentée.

### Périmètre gelé

| Bloc          | Contenu                                                   |
|---------------|-----------------------------------------------------------|
| DEP-0281–0290 | Inscription, champs, vérifications, connexion, adresses   |
| DEP-0291–0300 | Notes livraison, suppression compte, consentements, modes |
| DEP-0301–0310 | Écrans UI, messages de bienvenue, erreur adresse          |
| DEP-0311–0320 | Erreurs validation, persistance, validations finales      |

### Règles du gel

- **Aucune modification** des spécifications DEP-0281 à DEP-0320 sans nouvelle
  décision documentée (nouveau DEP dédié).
- Les implémentations futures doivent respecter ces spécifications telles quelles.
- Les ajouts de fonctionnalités (historique complet, favoris actifs, multi-langue)
  feront l'objet de nouveaux blocs DEP au-delà de DEP-0320.
- Tout écart constaté lors de l'implémentation doit être signalé et arbitré
  avant modification.

### Critères de gel validés

| Critère                                           | Statut  |
|---------------------------------------------------|---------|
| Tous les messages d'erreur sont définis           | ✅ Fait |
| Toutes les logiques de persistance sont définies  | ✅ Fait |
| La validation inscription/retour est documentée   | ✅ Fait |
| Les données minimales pour livrer sont confirmées | ✅ Fait |
| Le périmètre gelé est explicitement listé         | ✅ Fait |

---

## Résumé du bloc DEP-0311 à DEP-0320

Ce document a défini 10 décisions couvrant les erreurs de validation, la persistance des données et le gel du parcours client :

1. **DEP-0311** : Message d'erreur pour téléphone invalide (`ERR_PHONE_INVALID`).
2. **DEP-0312** : Message d'erreur pour zone non desservie (`ERR_ZONE_NOT_SERVED`).
3. **DEP-0313** : Message d'erreur pour compte incomplet (`ERR_ACCOUNT_INCOMPLETE`).
4. **DEP-0314** : Logique de sauvegarde du panier lié au compte (fusion local/serveur, expiration 30 jours).
5. **DEP-0315** : Logique de sauvegarde des préférences de recherche (écrasement par le serveur à la connexion).
6. **DEP-0316** : Logique de sauvegarde de la dernière commande (résumé rapide, bouton « Recommander »).
7. **DEP-0317** : Logique de sauvegarde des produits favoris (réservée, non active en V1).
8. **DEP-0318** : Validation que le client peut s'inscrire et revenir sans friction (scénario bout en bout).
9. **DEP-0319** : Validation que les données minimales du client sont suffisantes pour livrer (nom, téléphone, adresse).
10. **DEP-0320** : Gel du parcours client de base (DEP-0281 à DEP-0320, aucune modification sans nouveau DEP).

---

## Validation finale

Ce document définit l'ensemble des décisions concernant les erreurs de validation, la persistance des données client et le gel du parcours de base (DEP-0311 à DEP-0320).

Toutes les spécifications sont documentées de manière complète, cohérente et prête à être implémentée.

**Statut** : ✅ Documentation terminée.
