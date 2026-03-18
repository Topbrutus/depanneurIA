# DEP-0281 à DEP-0294 — Identité client et adresses

## Périmètre

Ce document fixe les règles d'identité client : inscription, vérifications
initiales, connexion, reconnexion, récupération d'accès et gestion des
adresses. Il est **strictement documentaire** : aucun code produit n'est
introduit ici.

---

## DEP-0281 — Parcours d'inscription client à la première ouverture/réouverture

### Objectif

Permettre à un nouveau client de créer un compte en moins d'une minute avec les
seuls éléments nécessaires à la livraison.

### Étapes

1. Détection du contexte : nouveau navigateur/app ou session expirée.
2. Formulaire minimal pré-affiché : nom, téléphone, adresse principale.
3. Vérification du téléphone (DEP-0284) avant validation du compte.
4. Vérification d'adresse (DEP-0285) pour s'assurer de la zone desservie.
5. Création du profil client avec adresse par défaut initiale.
6. Session ouverte et panier associé au compte (si panier anonyme existait,
   rattachement immédiat).

### Règles

- Aucun champ optionnel n'est bloquant.
- Temps de saisie optimisé : saisie adresse avec auto-complétion, formatage
  téléphone assisté.
- Si la vérification échoue, le compte n'est pas créé et un message clair
  propose de réessayer ou de contacter le support.

---

## DEP-0282 — Champs obligatoires : nom, téléphone, adresse

- **Nom** : 2 à 80 caractères, lettres, espaces, apostrophes et tirets.
- **Téléphone** : numéro mobile joignable, saisi en national ou international,
  normalisé en E.164 avant stockage.
- **Adresse principale** : numéro/voie, complément éventuel, code postal, ville,
  pays, plus un point de repère facultatif. Chaque élément est requis sauf le
  repère.
- L'acceptation des conditions d'utilisation et de la politique de
  confidentialité est affichée et doit être explicitement validée.

---

## DEP-0283 — Champs optionnels

- E-mail de contact (pour reçu de commande ou notifications secondaires).
- Société ou nom d'interphone si pertinent.
- Code porte/digicode stocké de façon chiffrée côté serveur.
- Plage horaire préférée pour la livraison (simple texte court ou plage
  prédéfinie).
- Consentements complémentaires (notifications push, appels sortants) stockés à
  part des données d'identité.

---

## DEP-0284 — Logique de vérification du numéro de téléphone

- Normaliser le numéro au format E.164 dès la saisie (suppression espaces et
  symboles).
- Vérification par **code à usage unique (OTP)** envoyé par SMS :
  - 6 chiffres, valide 5 minutes.
  - 3 tentatives maximum avant temporisation (5 minutes).
  - Chaque nouvelle demande invalide le code précédent.
- Un numéro ne peut être validé que s'il n'est pas déjà lié à un compte actif.
  Si trouvé, proposer la reconnexion (DEP-0287) plutôt qu'une nouvelle
  inscription.
- Après validation, marquer le téléphone comme "vérifié" et horodater.

---

## DEP-0285 — Logique de vérification d'adresse

- Auto-complétion (type Voie + Code postal + Ville + Pays) puis validation par
  service de géocodage ou référentiel interne.
- Vérifier que l'adresse est **livrable** :
  - Elle appartient à une zone desservie (matching avec zones déjà définies).
  - Le code postal et la ville correspondent au pays saisi.
- Stocker la version structurée + une ligne d'affichage complète et un
  geohash/coordonnées si disponibles.
- En cas d'échec de vérification :
  - Proposer la saisie manuelle des champs manquants.
  - Afficher une erreur dédiée "adresse hors zone" ou "adresse incomplète".
  - Ne pas créer d'adresse par défaut tant que la validation n'est pas passée.

---

## DEP-0286 — Logique de connexion simple du client

- Moyen de connexion principal : téléphone vérifié + OTP court (6 chiffres,
  durée 5 minutes, 3 tentatives).
- Un seul code actif à la fois par numéro.
- Après succès :
  - Création d'un jeton de session (httpOnly) et d'un refresh sécurisé.
  - Rattachement du panier anonyme éventuel.
  - Redirection vers la boutique ou la dernière page visitée.

---

## DEP-0287 — Logique de reconnexion du client

- Si un jeton de session valide existe : reconnexion silencieuse, sans OTP.
- Si le refresh est valide mais la session expirée : régénération silencieuse,
  sinon redemande OTP.
- En cas de changement de device ou navigation privée : demander OTP sur le
  téléphone vérifié.
- Pré-remplir le numéro quand il est déjà connu pour réduire la friction.

---

## DEP-0288 — Logique de réinitialisation d'accès

- Déclenchée si le client ne reçoit plus les OTP ou a perdu l'accès à son
  appareil.
- Étapes :
  1. Demander le numéro de téléphone revendiqué.
  2. Envoyer un OTP classique (DEP-0284).
  3. Si le numéro est injoignable, orienter vers le support avec vérification
     manuelle (contrôle d'identité léger : nom + dernière adresse connue).
- Toute réinitialisation invalide les sessions actives et force une nouvelle
  connexion.

---

## DEP-0289 — Logique de gestion de plusieurs adresses client

- Un client peut enregistrer plusieurs adresses, chacune avec :
  - Libellé court (maison, travail, autre).
  - Adresse structurée complète (mêmes champs que DEP-0282).
  - Statut : active ou archivée.
- Chaque nouvelle adresse suit la vérification DEP-0285 avant d'être utilisable.
- Archiver une adresse la retire des choix de livraison mais conserve
  l'historique des commandes passées.

---

## DEP-0290 — Logique d'adresse par défaut

- L'adresse par défaut est définie automatiquement à la première inscription.
- Règles de sélection :
  - Si une seule adresse active : elle est par défaut.
  - Si plusieurs : choix explicite par le client, persisté dans le profil.
  - Lors d'une nouvelle commande, la dernière adresse utilisée peut être
    proposée en premier mais ne remplace pas la valeur par défaut sans action
    explicite.
- La suppression ou l'archivage de l'adresse par défaut force le choix d'une
  nouvelle adresse active.

---

## DEP-0291 — Logique de notes de livraison client

- Notes courtes (≤ 200 caractères) associées **par adresse** pour rester
  contextuelles.
- Exemples : "code porte B42", "passer par le portail sud".
- Les notes sont optionnelles, modifiables et visibles au moment du choix
  d'adresse et dans le récapitulatif de commande.
- Stockage en clair côté client interdit (pas de localStorage pour les codes) ;
  elles doivent être chiffrées au repos côté serveur.

---

## DEP-0292 — Logique de suppression de compte client

- Suppression déclenchée depuis le profil avec confirmation forte (OTP sur le
  téléphone vérifié).
- Effets :
  - Comptes et sessions invalidés immédiatement.
  - Données d'adresse et notes effacées ou anonymisées selon obligations
    légales.
  - Historique de commandes conservé sous forme anonymisée (pas de
    ré-identification possible).
- L'action est irréversible côté interface ; aucune restauration automatique.

---

## DEP-0293 — Logique de mise à jour du téléphone client

- Étapes :
  1. Authentifier le client (session active ou OTP sur numéro actuel).
  2. Saisir le nouveau numéro, le normaliser (E.164) et envoyer un OTP dessus.
  3. Valider l'OTP pour activer le nouveau numéro et invalider l'ancien.
- Toute mise à jour invalide les sessions ouvertes et force une reconnexion.
- Un numéro déjà utilisé par un autre compte ne peut pas être attribué.

---

## DEP-0294 — Logique de mise à jour de l'adresse client

- Toute modification d'adresse existante repasse par la vérification DEP-0285.
- Historiser les anciennes versions pour l'audit des commandes passées sans
  les utiliser pour de nouvelles livraisons.
- Si l'adresse modifiée était par défaut et devient invalide, exiger le choix
  d'une adresse valide avant validation de la commande suivante.
- La mise à jour d'une adresse par défaut ne doit pas supprimer les notes
  associées ; elles restent liées à l'adresse modifiée sauf suppression
  explicite.
