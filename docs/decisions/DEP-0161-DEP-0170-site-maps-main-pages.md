# DEP-0161 à DEP-0170 — Cartes du site et pages principales

## Périmètre

Définir les parcours utilisateur complets (cartes du site) pour chaque profil V1
(client, dépanneur, livreur, super administrateur) et spécifier les pages
principales de l'application.

---

## DEP-0161 — Carte complète du site côté client

Le client accède au site pour passer commande, suivre ses commandes et gérer son
profil. Toutes les routes suivent la convention kebab-case définie dans DEP-0153.

```
/                              ← Accueil public
├── /boutique                  ← Boutique manuelle (catalogue, ajout au panier)
├── /mode-assiste              ← Mode assisté (parcours guidé avec assistant)
├── /connexion                 ← Page de connexion
├── /inscription               ← Page d'inscription
├── /profil                    ← Profil client
│   ├── /profil/adresses       ← Gestion des adresses
│   └── /profil/modifier       ← Modifier les informations du profil
├── /commandes                 ← Historique des commandes
│   ├── /commandes/derniere    ← Dernière commande (accès rapide)
│   └── /commandes/:id         ← Suivi d'une commande spécifique
├── /produits-populaires       ← Produits populaires
├── /contact                   ← Contact du dépanneur
├── /conditions-utilisation    ← Conditions d'utilisation
├── /confidentialite           ← Politique de confidentialité
├── /accessibilite             ← Page d'accessibilité
└── /aide-vocale               ← Page d'aide vocale
```

### Parcours principal du client (V1)

1. Arrivée sur `/` → choix entre boutique manuelle, mode assisté ou appel.
2. Sélection des articles et quantités.
3. Saisie des coordonnées (nom, téléphone, adresse, consignes).
4. Choix du mode de remise (enlèvement ou livraison).
5. Vérification du récapitulatif et envoi.
6. Confirmation « commande reçue » et suivi sur `/commandes/:id`.

---

## DEP-0162 — Carte complète du site côté dépanneur

Le dépanneur gère son catalogue, reçoit les commandes, confirme la disponibilité
et prépare les remises.

```
/tableau-de-bord                       ← Dashboard principal du dépanneur
├── /tableau-de-bord/commandes         ← Liste des commandes reçues
│   └── /tableau-de-bord/commandes/:id ← Détail et gestion d'une commande
├── /tableau-de-bord/produits          ← Gestion du catalogue produits
│   ├── /tableau-de-bord/produits/ajouter   ← Ajouter un produit
│   └── /tableau-de-bord/produits/:id       ← Modifier un produit
├── /tableau-de-bord/livraisons        ← Suivi des livraisons en cours
├── /tableau-de-bord/zones             ← Zones de livraison
├── /tableau-de-bord/profil            ← Profil de la boutique
└── /tableau-de-bord/parametres        ← Paramètres du compte dépanneur
```

### Parcours principal du dépanneur (V1)

1. Connexion → arrivée sur `/tableau-de-bord`.
2. Réception d'une nouvelle commande dans la liste.
3. Consultation du détail, vérification de la disponibilité.
4. Confirmation ou signalement d'indisponibilité (remplacement/retrait).
5. Préparation de la commande.
6. Remise au client (enlèvement) ou au livreur (livraison).
7. Confirmation de remise et d'encaissement si paiement à la livraison.

---

## DEP-0163 — Carte complète du site côté livreur

Le livreur consulte les commandes assignées, prend en charge la livraison et
confirme la remise.

```
/livraison                            ← Dashboard principal du livreur
├── /livraison/commandes              ← Commandes assignées
│   └── /livraison/commandes/:id      ← Détail d'une commande à livrer
├── /livraison/en-cours               ← Livraison en cours (fiche active)
├── /livraison/historique             ← Historique des livraisons effectuées
├── /livraison/profil                 ← Profil du livreur
└── /livraison/parametres             ← Paramètres du compte livreur
```

### Parcours principal du livreur (V1)

1. Connexion → arrivée sur `/livraison`.
2. Consultation des commandes assignées.
3. Prise en charge d'une commande (fiche : adresse, consignes, montant).
4. Navigation vers le client.
5. Remise de la commande et encaissement si prévu.
6. Confirmation de livraison dans l'application.

---

## DEP-0164 — Carte complète du portail super administrateur

Le super administrateur paramètre la plateforme, supervise les dépanneurs et
livreurs, et gère les accès.

```
/admin                                ← Dashboard principal admin
├── /admin/depanneurs                 ← Liste des dépanneurs
│   └── /admin/depanneurs/:id         ← Détail et gestion d'un dépanneur
├── /admin/livreurs                   ← Liste des livreurs
│   └── /admin/livreurs/:id           ← Détail et gestion d'un livreur
├── /admin/commandes                  ← Vue globale des commandes
│   └── /admin/commandes/:id          ← Détail d'une commande
├── /admin/utilisateurs               ← Gestion des utilisateurs (clients)
│   └── /admin/utilisateurs/:id       ← Détail d'un utilisateur
├── /admin/zones                      ← Gestion des zones de livraison
├── /admin/parametres                 ← Paramètres globaux de la plateforme
└── /admin/journaux                   ← Journaux d'activité (audit simple)
```

### Parcours principal du super administrateur (V1)

1. Connexion → arrivée sur `/admin`.
2. Supervision des commandes en cours et des indicateurs clés.
3. Gestion des comptes dépanneurs et livreurs (activation, désactivation).
4. Vérification des zones de livraison.
5. Consultation des journaux d'activité en cas de problème.

---

## DEP-0165 — Page d'accueil publique

| Attribut | Valeur                                      |
| -------- | ------------------------------------------- |
| Route    | `/`                                         |
| Accès    | Public (aucune authentification requise)    |
| Profils  | Tous (client, dépanneur, livreur, visiteur) |

### Objectif

Présenter la promesse V1 de DépannVite et offrir un accès immédiat aux deux
modes de commande principaux (en ligne ou par téléphone).

### Contenu principal

- **En-tête** : logo DépannVite, navigation principale (Boutique, Mode assisté,
  Connexion), sélecteur de langue (fr-CA / en-CA).
- **Héro** : slogan « Commander simplement. Livrer clairement. », deux boutons
  d'action principaux (« Commander en ligne » → `/mode-assiste`,
  « Appeler pour commander » → numéro ou page d'aide vocale).
- **Section promesse** : explication en 3 étapes (choisir, envoyer, recevoir)
  avec icônes.
- **Section boutique** : aperçu des produits populaires avec lien vers
  `/boutique` et `/produits-populaires`.
- **Pied de page** : liens vers `/conditions-utilisation`, `/confidentialite`,
  `/accessibilite`, `/contact`.

### Comportement mobile

- Héro empilé verticalement, boutons pleine largeur.
- Navigation dans un menu hamburger.
- Section promesse en colonne unique.

---

## DEP-0166 — Page boutique manuelle

| Attribut | Valeur                                 |
| -------- | -------------------------------------- |
| Route    | `/boutique`                            |
| Accès    | Public (panier accessible sans compte) |
| Profils  | Client                                 |

### Objectif

Permettre au client de parcourir le catalogue du dépanneur et d'ajouter
manuellement des articles à son panier sans assistance.

### Contenu principal

- **Barre de recherche** : recherche par nom de produit.
- **Filtres** : catégories de produits (épicerie, boissons, hygiène, etc.).
- **Grille de produits** : nom, image miniature (thumb), prix si affiché ou
  mention « prix à confirmer », bouton « Ajouter ».
- **Panier latéral** (desktop) ou **panier en bas** (mobile) : liste des
  articles ajoutés, quantités modifiables, bouton « Passer la commande ».
- **Lien vers le mode assisté** : pour les clients qui préfèrent un parcours
  guidé.

### Comportement mobile

- Grille en 2 colonnes (thumb + nom + bouton).
- Panier accessible via un badge flottant en bas de l'écran.
- Filtres dans un tiroir latéral.

---

## DEP-0167 — Page mode assisté

| Attribut | Valeur          |
| -------- | --------------- |
| Route    | `/mode-assiste` |
| Accès    | Public          |
| Profils  | Client          |

### Objectif

Guider le client pas à pas dans la création de sa commande avec l'assistant
intégré à l'écran.

### Contenu principal

- **Zone de chat assistant** : conversation textuelle guidée, l'assistant pose
  les questions une par une (articles, quantités, coordonnées, mode de remise).
- **Panneau récapitulatif** : mis à jour en temps réel à chaque ajout (articles,
  quantités, adresse, mode de remise, paiement à la livraison, montant estimé
  ou « à confirmer »).
- **Étapes visibles** : indicateur de progression (1. Articles, 2. Coordonnées, 3. Mode de remise, 4. Vérification et envoi).
- **Suggestions rapides** : boutons de suggestion contextuelle (articles
  populaires, adresses récentes si connecté).
- **Bouton de bascule** : « Passer en mode manuel » → `/boutique`.

### Comportement mobile

- Chat en plein écran avec panneau récapitulatif accessible par un bouton
  flottant.
- Étapes en bandeau compact en haut.
- Clavier adapté au contexte (numérique pour téléphone, texte pour adresse).

---

## DEP-0168 — Page de connexion

| Attribut | Valeur                                   |
| -------- | ---------------------------------------- |
| Route    | `/connexion`                             |
| Accès    | Public                                   |
| Profils  | Tous (client, dépanneur, livreur, admin) |

### Objectif

Permettre à un utilisateur existant de se connecter à son compte.

### Contenu principal

- **Formulaire de connexion** : champ téléphone ou courriel, champ mot de passe,
  bouton « Se connecter ».
- **Lien « Mot de passe oublié »** : déclenche un flux de récupération
  (envoi d'un code par SMS ou courriel).
- **Lien vers l'inscription** : « Pas encore de compte ? Créer un compte »
  → `/inscription`.
- **Redirection après connexion** : selon le rôle de l'utilisateur
  (client → `/`, dépanneur → `/tableau-de-bord`, livreur → `/livraison`,
  admin → `/admin`).

### Comportement mobile

- Formulaire centré, pleine largeur.
- Clavier approprié selon le champ actif.

---

## DEP-0169 — Page d'inscription

| Attribut | Valeur                                                |
| -------- | ----------------------------------------------------- |
| Route    | `/inscription`                                        |
| Accès    | Public                                                |
| Profils  | Client (V1 — inscription dépanneur/livreur via admin) |

### Objectif

Permettre à un nouveau client de créer un compte minimal pour commander.

### Contenu principal

- **Formulaire d'inscription** : nom, téléphone (obligatoire, vérifié par code
  SMS), courriel (optionnel), mot de passe, adresse par défaut (optionnel).
- **Vérification téléphone** : saisie d'un code envoyé par SMS avant
  finalisation.
- **Lien vers la connexion** : « Déjà un compte ? Se connecter »
  → `/connexion`.
- **Mention légale** : lien vers `/conditions-utilisation` et
  `/confidentialite`.
- **Redirection après inscription** : vers `/` ou vers le parcours en cours
  si le client était en mode assisté.

### Comportement mobile

- Formulaire à champ unique par écran (style wizard) pour une saisie rapide.
- Clavier numérique pour le téléphone, texte pour le nom.

---

## DEP-0170 — Page de profil client

| Attribut | Valeur               |
| -------- | -------------------- |
| Route    | `/profil`            |
| Accès    | Authentifié (client) |
| Profils  | Client               |

### Objectif

Permettre au client de consulter et modifier ses informations personnelles.

### Contenu principal

- **Informations affichées** : nom, téléphone, courriel, adresse par défaut.
- **Bouton « Modifier »** : ouvre le formulaire d'édition (→ `/profil/modifier`).
- **Liens rapides** : « Mes adresses » → `/profil/adresses`,
  « Mes commandes » → `/commandes`.
- **Bouton « Se déconnecter »** : déconnexion et retour à `/`.

### Comportement mobile

- Affichage en liste verticale, chaque section cliquable pour édition.
- Boutons pleine largeur.

---

## Résumé des routes principales (V1)

| Route           | Page              | Accès       |
| --------------- | ----------------- | ----------- |
| `/`             | Accueil public    | Public      |
| `/boutique`     | Boutique manuelle | Public      |
| `/mode-assiste` | Mode assisté      | Public      |
| `/connexion`    | Connexion         | Public      |
| `/inscription`  | Inscription       | Public      |
| `/profil`       | Profil client     | Authentifié |
