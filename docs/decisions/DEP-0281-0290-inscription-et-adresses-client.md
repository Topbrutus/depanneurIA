# DEP-0281 à DEP-0290 — Inscription et adresses client

## Périmètre

Spécifications documentaires pour l'inscription, la vérification des contacts
(téléphone, adresse), la connexion/reconnexion et la gestion des adresses par
défaut. Aucun code produit, aucune dépendance ajoutée.

Référence parente : Bloc DEP-0281 à DEP-0320 (inscription, connexion et gestion
client).

---

## DEP-0281 — Parcours d'inscription client à la première réouverture

### Objectif

Créer un compte en moins d'une minute lors de la première ouverture ou
réouverture du site/application, en basculant automatiquement sur un parcours
assisté si aucune session valide n'existe.

### Parcours

1. **Déclencheur** : session absente/expirée ou navigation privée détectée.
2. **Pré-remplissage** (si disponible localement) : nom, téléphone, adresse
   principale.
3. **Saisie guidée** : champs obligatoires (DEP-0282) affichés en premier, les
   champs optionnels (DEP-0283) repliés par défaut.
4. **Vérifications** :
   - Téléphone selon DEP-0284 (OTP avant validation).
   - Adresse selon DEP-0285 (livrabilité et cohérence).
5. **Création compte** : profil client + adresse par défaut initiale + session
   ouverte.
6. **Rattachement** : panier anonyme existant rattaché dès la création de
   session.
7. **Sortie** : redirection vers la boutique ou le dernier écran consulté.

### Règles

- Aucun champ optionnel n'est bloquant pour valider le compte.
- Assistance à la saisie : auto-complétion d'adresse, formatage automatique du
  téléphone, erreurs en ligne.
- Si une vérification échoue, le compte n'est pas créé ; proposer un nouveau
  code ou l'orientation support avec message clair.

---

## DEP-0282 — Champs obligatoires à l'inscription : nom, téléphone, adresse

- **Nom** : 2 à 80 caractères ; lettres, espaces, apostrophes, tirets ; premier
  caractère non numérique.
- **Téléphone** : numéro mobile joignable (national ou international) ; saisi
  libre, normalisé E.164 avant stockage ; si déjà utilisé par un compte actif,
  basculer vers DEP-0287 (reconnexion).
- **Adresse principale** : numéro et voie, code postal, ville, pays ; complément
  et point de repère facultatifs mais suggérés ; affichage d'une ligne
  complète lisible.
- **Consentement** : validation explicite des CGU et de la politique de
  confidentialité avant création du compte.

---

## DEP-0283 — Champs optionnels à l'inscription

- E-mail de contact (reçus, notifications secondaires).
- Société / nom d'interphone.
- Code porte ou digicode (stocké chiffré côté serveur).
- Notes de livraison courtes (ex. « sonner côté cour »).
- Plage horaire préférée ou texte libre sur la disponibilité.
- Consentements complémentaires : notifications push, appels sortants.

Règle commune : ces champs ne bloquent jamais l'inscription ; ils sont
éditables ensuite dans le profil ou l'écran d'adresses.

---

## DEP-0284 — Logique de vérification du numéro de téléphone

- **Normalisation** : suppression espaces/symboles → format E.164 dès la saisie.
- **OTP SMS** : 6 chiffres, valable 5 minutes, 3 tentatives ; une seule demande
  active par numéro (nouvelle demande invalide la précédente).
- **Anti-abus** : temporisation 5 minutes après 3 échecs ; plafond de demandes
  par heure ; captcha léger si activité suspecte.
- **Collision** : si le numéro est déjà vérifié pour un compte actif, proposer
  DEP-0286/0287 plutôt qu'une nouvelle inscription.
- **Résultat** : après succès, marquer "téléphone vérifié" + horodatage ; ouvrir
  la voie à la création de session et du compte.

---

## DEP-0285 — Logique de vérification d'adresse

- **Saisie assistée** : auto-complétion Voie + Code postal + Ville + Pays.
- **Validation** : géocodage ou référentiel interne ; stockage de la version
  structurée + ligne d'affichage + coordonnées/geohash si disponibles.
- **Critères de livrabilité** :
  - Adresse dans une zone desservie.
  - Cohérence code postal/ville/pays.
  - Alerte si doublon exact déjà archivé (proposer réactivation).
- **Échec** : proposer saisie manuelle, afficher une erreur dédiée (« adresse
  hors zone » ou « adresse incomplète ») ; pas d'adresse par défaut tant que la
  validation n'est pas passée.

---

## DEP-0286 — Logique de connexion simple du client

- **Facteur principal** : téléphone vérifié + OTP court (6 chiffres, 5 minutes,
  3 tentatives).
- **Unicité** : un seul code actif par numéro.
- **Après succès** : création d'un jeton de session httpOnly + refresh sécurisé,
  rattachement du panier anonyme éventuel, redirection vers la boutique ou le
  dernier écran consulté.

---

## DEP-0287 — Logique de reconnexion du client

- **Session valide** : reconnexion silencieuse (pas d'OTP).
- **Refresh valide** mais session expirée : régénération silencieuse ; sinon
  redemande OTP.
- **Contexte à risque** (nouvel appareil, navigation privée) : OTP obligatoire
  sur le téléphone vérifié.
- **UX** : pré-remplir le numéro connu pour réduire la friction.

---

## DEP-0288 — Logique de réinitialisation d'accès

- **Déclencheurs** : OTP non reçu, appareil perdu, numéro risqué ou signalé.
- **Étapes** :
  1. Demander le numéro revendiqué.
  2. Envoyer un OTP (règles DEP-0284).
  3. Si injoignable : aiguiller vers le support avec contrôle léger (nom +
     dernière adresse connue).
- **Effet** : invalidation des sessions actives et obligation de nouvelle
  connexion après succès.

---

## DEP-0289 — Logique de gestion de plusieurs adresses client

- **Structure** : chaque adresse a un libellé court (maison, travail, autre),
  une adresse structurée (DEP-0282) et un statut actif/archivé.
- **Vérification** : toute nouvelle adresse passe par DEP-0285 avant usage.
- **Archivage** : retire des choix de livraison mais conserve l'historique des
  commandes.
- **Doublons** : alerter en cas de duplication exacte et proposer réutilisation
  ou réactivation.

---

## DEP-0290 — Logique d'adresse par défaut

- **Initialisation** : définie automatiquement à la première inscription (seule
  adresse active).
- **Sélection** :
  - Une seule adresse active → elle devient par défaut.
  - Plusieurs adresses → choix explicite du client, stocké dans le profil.
  - À la commande, proposer d'abord la dernière adresse utilisée sans écraser
    la valeur par défaut sans action explicite.
- **Changement forcé** : suppression ou archivage de l'adresse par défaut
  déclenche la demande de choisir une autre adresse active avant toute nouvelle
  commande.
