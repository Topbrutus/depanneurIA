# DEP-0165 à DEP-0170 — Pages principales

## Périmètre

Définir le contenu, l'objectif et la structure de chaque page principale du
site côté client. Aucune implémentation UI n'est faite ici ; il s'agit
uniquement de la documentation de référence.

---

## DEP-0165 — Page d'accueil publique

- **Route** : `/`
- **Composant** : `HomePage`
- **Accès** : public (pas d'authentification requise)

### Objectif

Présenter le service depaneurIA, orienter le visiteur vers la boutique ou le
mode assisté et mettre en avant les produits populaires.

### Contenu attendu

| Section                | Description                                 |
| ---------------------- | ------------------------------------------- |
| Bannière héros         | Message d'accroche + appel à l'action (CTA) |
| Produits populaires    | Grille des produits les plus commandés      |
| Explication du service | Blocs « comment ça marche » en 3 étapes     |
| Modes de commande      | Liens vers `/boutique` et `/mode-assiste`   |
| Pied de page           | Liens légaux, contact, accessibilité        |

### Comportement

- Le visiteur non authentifié voit la page complète.
- Le visiteur authentifié voit en plus un raccourci vers sa dernière commande.

---

## DEP-0166 — Page boutique manuelle

- **Route** : `/boutique`
- **Composant** : `ShopPage`
- **Accès** : public

### Objectif

Permettre au client de parcourir les produits disponibles, de les ajouter au
panier et de passer commande de manière autonome.

### Contenu attendu

| Section            | Description                                              |
| ------------------ | -------------------------------------------------------- |
| Barre de recherche | Recherche textuelle par nom de produit                   |
| Filtres            | Catégorie, prix, disponibilité                           |
| Grille de produits | Carte produit : image, nom, prix, bouton « ajouter »     |
| Panier latéral     | Résumé du panier, quantités, total, bouton « commander » |

### Comportement

- L'ajout au panier est immédiat (pas de rechargement de page).
- Le panier persiste en mémoire locale si le client n'est pas authentifié.
- Au passage de commande, le client est redirigé vers `/connexion` s'il n'est pas authentifié.

---

## DEP-0167 — Page mode assisté

- **Route** : `/mode-assiste`
- **Composant** : `AssistedModePage`
- **Accès** : public

### Objectif

Guider le client dans sa commande via un assistant conversationnel (texte ou
voix). Destiné aux personnes âgées ou peu à l'aise avec la navigation web.

### Contenu attendu

| Section       | Description                                               |
| ------------- | --------------------------------------------------------- |
| Zone de chat  | Interface conversationnelle texte                         |
| Bouton vocal  | Activation de la commande vocale                          |
| Suggestions   | Produits suggérés par l'assistant en fonction du contexte |
| Panier résumé | Panier visible en temps réel pendant l'échange            |

### Comportement

- L'assistant pose des questions simples (« Que voulez-vous commander ? »).
- L'utilisateur peut répondre par texte ou par la voix.
- Les suggestions s'ajoutent au panier sur confirmation du client.
- Le mode assisté peut basculer vers `/boutique` à tout moment.

---

## DEP-0168 — Page de connexion

- **Route** : `/connexion`
- **Composant** : `LoginPage`
- **Accès** : public (redirige si déjà authentifié)

### Objectif

Permettre à un utilisateur existant de s'authentifier pour accéder à ses
commandes et à son profil.

### Contenu attendu

| Section              | Description                           |
| -------------------- | ------------------------------------- |
| Formulaire           | Champs courriel et mot de passe       |
| Lien d'inscription   | Renvoi vers `/inscription`            |
| Mot de passe oublié  | Lien vers le flux de réinitialisation |
| Bouton de soumission | « Se connecter »                      |

### Comportement

- Validation côté client (champs obligatoires, format courriel).
- Message d'erreur clair en cas d'identifiants invalides.
- Après connexion réussie, redirection vers la page d'origine ou `/`.
- Si l'utilisateur est déjà authentifié, redirection immédiate vers `/`.

---

## DEP-0169 — Page d'inscription

- **Route** : `/inscription`
- **Composant** : `RegisterPage`
- **Accès** : public (redirige si déjà authentifié)

### Objectif

Permettre à un nouveau client de créer son compte pour pouvoir passer
commande et suivre ses livraisons.

### Contenu attendu

| Section              | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| Formulaire           | Prénom, nom, courriel, téléphone, mot de passe, confirmation |
| Conditions           | Case à cocher : acceptation des conditions d'utilisation     |
| Lien de connexion    | Renvoi vers `/connexion`                                     |
| Bouton de soumission | « Créer mon compte »                                         |

### Comportement

- Validation côté client (champs obligatoires, format courriel, robustesse du mot de passe).
- Vérification de l'unicité du courriel côté serveur.
- Après inscription réussie, connexion automatique et redirection vers `/`.
- L'adresse de livraison est demandée lors de la première commande, pas à l'inscription.

---

## DEP-0170 — Page de profil client

- **Route** : `/profil`
- **Composant** : `ProfilePage`
- **Accès** : authentifié

### Objectif

Permettre au client de consulter et modifier ses informations personnelles.

### Contenu attendu

| Section                   | Description                                  |
| ------------------------- | -------------------------------------------- |
| Informations personnelles | Prénom, nom, courriel, téléphone             |
| Modification              | Formulaire d'édition des champs              |
| Mot de passe              | Lien ou section pour changer le mot de passe |
| Lien adresses             | Renvoi vers `/profil/adresses`               |
| Lien commandes            | Renvoi vers `/commandes`                     |
| Langue préférée           | Sélecteur `fr-CA` / `en-CA`                  |

### Comportement

- Les champs sont pré-remplis avec les données actuelles.
- Le courriel ne peut pas être modifié sans vérification (flux de confirmation).
- Le changement de mot de passe exige le mot de passe actuel.

---

## Résumé des pages principales

| DEP      | Page              | Route           | Accès       |
| -------- | ----------------- | --------------- | ----------- |
| DEP-0165 | Accueil publique  | `/`             | public      |
| DEP-0166 | Boutique manuelle | `/boutique`     | public      |
| DEP-0167 | Mode assisté      | `/mode-assiste` | public      |
| DEP-0168 | Connexion         | `/connexion`    | public      |
| DEP-0169 | Inscription       | `/inscription`  | public      |
| DEP-0170 | Profil client     | `/profil`       | authentifié |
