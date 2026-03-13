# DEP-0281 à DEP-0290 — Inscription et adresses client

## Périmètre

Spécifications documentaires pour l'inscription, la vérification des contacts
(téléphone, adresse), la connexion/reconnexion et la gestion des adresses par
défaut. Aucun code produit, aucune dépendance ajoutée.

---

## DEP-0281 — Parcours d'inscription client à la première réouverture

### Objectif

Créer un compte en moins d'une minute lors de la première ouverture/réouverture
du site ou de l'application.

### Parcours

1. Détection : aucune session valide ou navigation privée → bascule vers le
   formulaire d'inscription.
2. Formulaire minimal pré-rempli si données locales disponibles : nom,
   téléphone, adresse principale.
3. Vérification téléphone (DEP-0284) avant validation du compte.
4. Vérification d'adresse (DEP-0285) pour confirmer la zone desservie.
5. Création du profil client + adresse par défaut initiale.
6. Rattachement du panier anonyme existant et ouverture de session.
7. Redirection vers la boutique ou le dernier écran consulté.

### Règles

- Pas de champ optionnel bloquant.
- Aide à la saisie : auto-complétion d'adresse, formatage automatique du
  téléphone.
- En cas d'échec de vérification, afficher un message clair et proposer un
  nouveau code ou le contact support sans créer de compte.

---

## DEP-0282 — Champs obligatoires à l'inscription : nom, téléphone, adresse

- **Nom** : 2 à 80 caractères ; lettres, espaces, apostrophes, tirets ; premier
  caractère non numérique.
- **Téléphone** : numéro mobile joignable, saisi en national ou international,
  normalisé en E.164 avant stockage ; rejet des numéros déjà liés à un compte
  actif (orienter vers DEP-0287).
- **Adresse principale** : numéro et voie, code postal, ville, pays ; complément
  facultatif ; point de repère facultatif mais encouragé.
- **Consentement** : case à cocher explicite pour conditions d'utilisation et
  politique de confidentialité.

---

## DEP-0283 — Champs optionnels à l'inscription

- E-mail de contact (reçus, notifications secondaires).
- Société / nom d'interphone.
- Code porte ou digicode (stocké chiffré côté serveur).
- Notes de livraison courtes (ex. « sonner côté cour »).
- Plage horaire préférée ou texte libre sur la disponibilité.
- Consentements complémentaires : notifications push, appels sortants.

---

## DEP-0284 — Logique de vérification du numéro de téléphone

- Normaliser en E.164 dès la saisie (suppression espaces/symboles).
- OTP SMS : 6 chiffres, valable 5 minutes, 3 tentatives maximum, une seule
  demande active par numéro (toute nouvelle demande invalide la précédente).
- Anti-abus : temporisation de 5 minutes après 3 échecs ; limite de demandes
  par heure.
- Un numéro déjà vérifié pour un compte actif déclenche une proposition de
  connexion (DEP-0286) ou de reconnexion (DEP-0287) au lieu d'une nouvelle
  inscription.
- Après succès : marquer le numéro comme vérifié, horodater, et autoriser la
  création/connexion de session.

---

## DEP-0285 — Logique de vérification d'adresse

- Saisie assistée : auto-complétion Voie + Code postal + Ville + Pays.
- Validation via géocodage ou référentiel interne ; stockage de la version
  structurée + ligne d'affichage + coordonnées/geohash si disponibles.
- Critères de livrabilité :
  - Appartenance à une zone desservie.
  - Cohérence code postal/ville/pays.
  - Absence de doublon exact déjà archivé (prévenir l'utilisateur).
- En cas d'échec : proposer saisie manuelle, afficher un message dédié (« adresse
  hors zone » ou « adresse incomplète ») et bloquer la création de l'adresse par
  défaut tant que la validation n'est pas passée.

---

## DEP-0286 — Logique de connexion simple du client

- Facteur principal : téléphone vérifié + OTP court (6 chiffres, 5 minutes, 3
  tentatives).
- Un seul code actif par numéro.
- Après succès : création d'un jeton de session httpOnly + refresh sécurisé,
  rattachement éventuel du panier anonyme, redirection vers la boutique ou le
  dernier écran consulté.

---

## DEP-0287 — Logique de reconnexion du client

- Session valide détectée : reconnexion silencieuse.
- Refresh valide mais session expirée : régénération silencieuse ; sinon
  redemande OTP.
- Nouveau device ou navigation privée : OTP obligatoire sur le téléphone
  vérifié.
- Pré-remplir le numéro déjà connu pour réduire la friction.

---

## DEP-0288 — Logique de réinitialisation d'accès

- Déclenchement si OTP non reçu, appareil perdu ou numéro considéré risqué.
- Étapes :
  1. Demander le numéro revendiqué.
  2. Envoyer un OTP (mêmes règles que DEP-0284).
  3. Si le numéro est injoignable, aiguiller vers le support avec contrôle
     d'identité léger (nom + dernière adresse connue).
- Toute réinitialisation invalide les sessions actives et force une nouvelle
  connexion.

---

## DEP-0289 — Logique de gestion de plusieurs adresses client

- Un client peut créer plusieurs adresses, chacune avec :
  - Libellé court (maison, travail, autre).
  - Adresse structurée complète (mêmes champs que DEP-0282) + statut actif ou
    archivé.
- Chaque nouvelle adresse suit la vérification DEP-0285 avant usage.
- Archiver une adresse la retire des choix de livraison mais conserve
  l'historique des commandes passées.
- Limiter les doublons exacts en avertissant l'utilisateur et en proposant la
  réutilisation.

---

## DEP-0290 — Logique d'adresse par défaut

- Initialisation automatique à la première inscription (seule adresse active).
- Règles de sélection :
  - S'il n'y a qu'une adresse active : elle est par défaut.
  - S'il y en a plusieurs : choix explicite par le client, persisté dans le
    profil.
  - Lors d'une nouvelle commande, proposer en premier la dernière adresse
    utilisée sans écraser la valeur par défaut sans action explicite.
- Suppression ou archivage de l'adresse par défaut : demander immédiatement de
  choisir une autre adresse active avant toute nouvelle commande.

