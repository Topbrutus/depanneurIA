# DEP-0171 à DEP-0180 — Pages secondaires

## Périmètre

Définir le contenu, l'objectif et la structure de chaque page secondaire du
site côté client. Aucune implémentation UI n'est faite ici ; il s'agit
uniquement de la documentation de référence.

---

## DEP-0171 — Page d'adresses client

- **Route** : `/profil/adresses`
- **Composant** : `AddressesPage`
- **Accès** : authentifié

### Objectif

Permettre au client de gérer ses adresses de livraison enregistrées.

### Contenu attendu

| Section                    | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| Liste des adresses         | Adresses existantes avec étiquette (maison, bureau…) |
| Adresse par défaut         | Indicateur visuel de l'adresse principale            |
| Ajout d'adresse            | Formulaire : adresse, ville, code postal, province   |
| Modification / suppression | Actions sur chaque adresse existante                 |

### Comportement

- Le client peut définir une adresse par défaut.
- L'ajout d'une adresse valide la zone de livraison côté serveur.
- La suppression est confirmée par une boîte de dialogue.

---

## DEP-0172 — Page d'historique des commandes

- **Route** : `/commandes`
- **Composant** : `OrderHistoryPage`
- **Accès** : authentifié

### Objectif

Lister toutes les commandes passées par le client, triées par date
décroissante.

### Contenu attendu

| Section             | Description                                            |
| ------------------- | ------------------------------------------------------ |
| Liste des commandes | Date, numéro, statut, montant total                    |
| Filtre par statut   | En cours, livrée, annulée                              |
| Lien détail         | Clic sur une commande → page de suivi ou récapitulatif |
| Pagination          | Navigation par page si plus de 10 commandes            |

### Comportement

- Les commandes en cours apparaissent en premier.
- Un clic sur une commande active redirige vers `/commandes/:id/suivi`.
- Un clic sur une commande livrée affiche le récapitulatif.

---

## DEP-0173 — Page de dernière commande

- **Route** : `/commandes/derniere`
- **Composant** : `LastOrderPage`
- **Accès** : authentifié

### Objectif

Accéder rapidement à la dernière commande du client, qu'elle soit en cours ou
terminée. Raccourci depuis la page d'accueil.

### Contenu attendu

| Section               | Description                                |
| --------------------- | ------------------------------------------ |
| Résumé de la commande | Numéro, date, statut actuel                |
| Liste des articles    | Produits commandés avec quantités et prix  |
| Statut de livraison   | Barre de progression si en cours           |
| Action rapide         | « Recommander » pour dupliquer la commande |

### Comportement

- Si aucune commande n'existe, affiche un message d'invitation à commander.
- Le bouton « Recommander » pré-remplit le panier avec les mêmes produits.
- Redirige vers `/commandes/:id/suivi` si la commande est en cours.

---

## DEP-0174 — Page des produits populaires

- **Route** : `/produits-populaires`
- **Composant** : `PopularProductsPage`
- **Accès** : public

### Objectif

Mettre en avant les produits les plus commandés pour faciliter la découverte
et accélérer la prise de commande.

### Contenu attendu

| Section            | Description                                         |
| ------------------ | --------------------------------------------------- |
| Grille de produits | Produits triés par popularité (nombre de commandes) |
| Carte produit      | Image, nom, prix, bouton « ajouter au panier »      |
| Période            | Basé sur les 30 derniers jours                      |

### Comportement

- Les produits sont issus du dépanneur le plus proche ou du dépanneur par défaut.
- L'ajout au panier fonctionne comme sur `/boutique`.
- La page est accessible depuis la page d'accueil et le menu de navigation.

---

## DEP-0175 — Page de suivi de commande

- **Route** : `/commandes/:id/suivi`
- **Composant** : `OrderTrackingPage`
- **Accès** : authentifié

### Objectif

Afficher en temps réel l'état d'avancement d'une commande en cours :
préparation, prise en charge, en route, livrée.

### Contenu attendu

| Section               | Description                                             |
| --------------------- | ------------------------------------------------------- |
| Barre de progression  | Étapes : confirmée → en préparation → en route → livrée |
| Détail de la commande | Articles, quantités, montant                            |
| Informations livreur  | Prénom du livreur, estimation d'arrivée                 |
| Mise à jour en direct | Rafraîchissement automatique du statut                  |

### Comportement

- Les mises à jour utilisent une connexion en temps réel (WebSocket ou polling).
- Le client reçoit une notification à chaque changement de statut.
- Une fois la commande livrée, la page affiche un récapitulatif final.

---

## DEP-0176 — Page de contact du dépanneur

- **Route** : `/contact`
- **Composant** : `ContactPage`
- **Accès** : public

### Objectif

Permettre au visiteur ou au client de contacter le dépanneur pour toute
question ou problème.

### Contenu attendu

| Section               | Description                                               |
| --------------------- | --------------------------------------------------------- |
| Coordonnées           | Adresse, téléphone, courriel du dépanneur                 |
| Horaires              | Heures d'ouverture                                        |
| Formulaire de contact | Nom, courriel, sujet, message                             |
| Carte                 | Localisation du dépanneur (intégration carte optionnelle) |

### Comportement

- Le formulaire envoie un courriel ou crée un ticket côté serveur.
- Confirmation visuelle après envoi.
- Validation côté client des champs obligatoires.

---

## DEP-0177 — Page de conditions d'utilisation

- **Route** : `/conditions-utilisation`
- **Composant** : `TermsPage`
- **Accès** : public

### Objectif

Présenter les conditions générales d'utilisation du service depaneurIA.

### Contenu attendu

| Section             | Description                                                                    |
| ------------------- | ------------------------------------------------------------------------------ |
| Titre et date       | Date de dernière mise à jour des conditions                                    |
| Sections numérotées | Objet, inscription, commande, paiement, livraison, responsabilité, résiliation |
| Langue              | Disponible en `fr-CA` et `en-CA`                                               |

### Comportement

- Page statique avec ancres de navigation par section.
- Lien accessible depuis le pied de page et la page d'inscription.

---

## DEP-0178 — Page de confidentialité

- **Route** : `/confidentialite`
- **Composant** : `PrivacyPage`
- **Accès** : public

### Objectif

Informer l'utilisateur sur la collecte, l'utilisation et la protection de ses
données personnelles, conformément à la Loi 25 (Québec) et à la législation
applicable.

### Contenu attendu

| Section                 | Description                                        |
| ----------------------- | -------------------------------------------------- |
| Titre et date           | Date de dernière mise à jour                       |
| Données collectées      | Quelles données, pourquoi, base légale             |
| Conservation            | Durée de conservation des données                  |
| Partage                 | Tiers éventuels (livreurs, passerelle de paiement) |
| Droits de l'utilisateur | Accès, rectification, suppression, portabilité     |
| Contact DPO             | Courriel du responsable des données                |

### Comportement

- Page statique avec ancres de navigation par section.
- Lien accessible depuis le pied de page et la page d'inscription.

---

## DEP-0179 — Page d'accessibilité

- **Route** : `/accessibilite`
- **Composant** : `AccessibilityPage`
- **Accès** : public

### Objectif

Déclarer l'engagement du service envers l'accessibilité numérique et décrire
les mesures prises pour rendre le site utilisable par tous.

### Contenu attendu

| Section                  | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| Déclaration d'engagement | Objectif d'accessibilité WCAG 2.1 niveau AA          |
| Fonctionnalités          | Navigation au clavier, lecteur d'écran, contrastes   |
| Mode assisté             | Mention du mode assisté vocal (lien `/mode-assiste`) |
| Limites connues          | Éléments non encore accessibles                      |
| Contact                  | Courriel pour signaler un problème d'accessibilité   |

### Comportement

- Page statique avec ancres de navigation par section.
- Lien accessible depuis le pied de page.

---

## DEP-0180 — Page d'aide vocale

- **Route** : `/aide-vocale`
- **Composant** : `VoiceHelpPage`
- **Accès** : public

### Objectif

Expliquer le fonctionnement de l'aide vocale et guider l'utilisateur dans son
utilisation. Destiné aux personnes âgées ou malvoyantes.

### Contenu attendu

| Section                   | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| Présentation              | À quoi sert l'aide vocale, pour qui                  |
| Comment ça marche         | Étapes simples : activer le micro, parler, confirmer |
| Exemples de commandes     | « Je voudrais du lait », « Ajoute du pain »          |
| Compatibilité             | Navigateurs et appareils supportés                   |
| Lien vers le mode assisté | Bouton vers `/mode-assiste`                          |

### Comportement

- Page statique avec illustrations ou icônes.
- Lien accessible depuis le pied de page et la page du mode assisté.
- Texte rédigé en langage simple et phrases courtes.

---

## Résumé des pages secondaires

| DEP      | Page                     | Route                     | Accès       |
| -------- | ------------------------ | ------------------------- | ----------- |
| DEP-0171 | Adresses client          | `/profil/adresses`        | authentifié |
| DEP-0172 | Historique des commandes | `/commandes`              | authentifié |
| DEP-0173 | Dernière commande        | `/commandes/derniere`     | authentifié |
| DEP-0174 | Produits populaires      | `/produits-populaires`    | public      |
| DEP-0175 | Suivi de commande        | `/commandes/:id/suivi`    | authentifié |
| DEP-0176 | Contact du dépanneur     | `/contact`                | public      |
| DEP-0177 | Conditions d'utilisation | `/conditions-utilisation` | public      |
| DEP-0178 | Confidentialité          | `/confidentialite`        | public      |
| DEP-0179 | Accessibilité            | `/accessibilite`          | public      |
| DEP-0180 | Aide vocale              | `/aide-vocale`            | public      |
