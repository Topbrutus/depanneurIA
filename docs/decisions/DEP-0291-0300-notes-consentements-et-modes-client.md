# DEP-0291 à DEP-0300 — Notes, consentements et modes client

## Périmètre

Ce document définit les **logiques de gestion avancée du profil client** (notes de livraison, suppression de compte, mises à jour), les **consentements minimaux** (notifications, assistant vocal) et les **modes d'interaction** (manuel, assisté, téléphone).

Il s'agit exclusivement de **documentation** : aucun code produit, aucune implémentation. Les spécifications décrites ici serviront de référence pour les développements futurs.

**Référence parente** : Bloc DEP-0281 à DEP-0320 (inscription, connexion et gestion client)

---

## DEP-0291 — Logique de notes de livraison client

### Objectif

Permettre au client d'enregistrer des informations contextuelles pour faciliter la livraison à chaque adresse (codes d'accès, instructions spécifiques).

### Règles

1. **Association par adresse** : chaque note est liée à une adresse spécifique, pas au profil global.
2. **Longueur maximale** : 200 caractères pour rester concis et exploitable.
3. **Exemples d'usage** :
   - « Code porte B42 »
   - « Passer par le portail sud »
   - « Sonner chez le voisin si absent »
4. **Optionnalité** : les notes sont facultatives, modifiables à tout moment.
5. **Visibilité** :
   - Affichées lors du choix d'adresse de livraison.
   - Incluses dans le récapitulatif de commande.
   - Transmises au livreur dans les détails de la livraison.

### Sécurité

- **Interdiction de stockage côté client** : pas de localStorage pour les codes sensibles.
- **Chiffrement au repos** : les notes doivent être chiffrées en base de données côté serveur.
- **Accès restreint** : seul le client propriétaire et le livreur assigné peuvent consulter les notes.

### Validation

- Les notes sont facultatives : une adresse sans note reste valide.
- Le client peut ajouter, modifier ou supprimer une note à tout moment depuis l'écran de gestion d'adresses.

---

## DEP-0292 — Logique de suppression de compte client

### Objectif

Permettre au client de supprimer définitivement son compte tout en respectant les obligations légales de conservation des données transactionnelles.

### Règles de déclenchement

1. **Accès** : depuis l'écran de profil client, bouton « Supprimer mon compte ».
2. **Confirmation forte** : authentification par OTP envoyé sur le téléphone vérifié.
3. **Avertissement explicite** : message clair sur l'irréversibilité de l'action.

### Effets de la suppression

1. **Invalidation immédiate** :
   - Toutes les sessions actives sont fermées.
   - Les jetons d'authentification sont révoqués.
2. **Effacement des données personnelles** :
   - Nom, téléphone, adresses, notes de livraison : effacés ou anonymisés.
   - Consentements : supprimés.
3. **Conservation anonymisée** :
   - Historique de commandes conservé sous forme anonymisée pour obligations comptables et fiscales.
   - Aucune ré-identification possible (pas de lien avec l'identité du client).
4. **Aucune restauration automatique** : le compte ne peut pas être récupéré côté interface.

### Obligations légales

- Conservation des données transactionnelles : 10 ans (obligations comptables françaises).
- Anonymisation complète : suppression de tous les identifiants directs et indirects.
- Droit à l'effacement (RGPD) : respecté avec exceptions légales documentées.

### Validation

- L'action est irréversible et nécessite une double confirmation.
- Un message de confirmation finale est affiché : « Votre compte a été supprimé. »

---

## DEP-0293 — Logique de mise à jour du téléphone client

### Objectif

Permettre au client de changer son numéro de téléphone tout en garantissant la sécurité du compte.

### Règles de mise à jour

1. **Authentification préalable** : le client doit être connecté (session active) ou s'authentifier par OTP sur le numéro actuel.
2. **Saisie du nouveau numéro** :
   - Normalisation automatique au format E.164.
   - Vérification que le numéro n'est pas déjà utilisé par un autre compte.
3. **Vérification du nouveau numéro** :
   - Envoi d'un code OTP à 6 chiffres sur le nouveau numéro.
   - Durée de validité : 5 minutes.
   - Nombre de tentatives : 3 maximum.
4. **Activation** :
   - Validation de l'OTP sur le nouveau numéro.
   - L'ancien numéro est immédiatement désactivé.
   - Toutes les sessions actives sont invalidées.
5. **Reconnexion obligatoire** : le client doit se reconnecter avec le nouveau numéro.

### Cas particuliers

- **Numéro déjà utilisé** : message d'erreur « Ce numéro est déjà associé à un autre compte. »
- **OTP non reçu** : possibilité de renvoyer le code (1 fois toutes les 60 secondes).
- **Échec de vérification** : après 3 tentatives, temporisation de 5 minutes avant nouvelle demande.

### Validation

- Le client ne peut pas utiliser un numéro déjà enregistré sur un autre compte actif.
- Toute mise à jour invalide les sessions et force une reconnexion.

---

## DEP-0294 — Logique de mise à jour de l'adresse client

### Objectif

Permettre au client de modifier une adresse existante tout en garantissant sa validité pour les livraisons futures.

### Règles de mise à jour

1. **Accès** : depuis l'écran de gestion d'adresses, sélection de l'adresse à modifier.
2. **Nouvelle vérification** : toute modification repasse par la validation d'adresse (DEP-0285) :
   - Auto-complétion et géocodage.
   - Vérification de la zone desservie.
   - Validation de la cohérence (code postal, ville, pays).
3. **Historisation** :
   - L'ancienne version de l'adresse est archivée pour l'audit des commandes passées.
   - Les anciennes adresses ne sont plus utilisables pour de nouvelles livraisons.
4. **Conservation des notes** :
   - Les notes de livraison associées (DEP-0291) restent liées à l'adresse modifiée.
   - Le client peut les modifier ou les supprimer indépendamment.

### Cas de l'adresse par défaut

- Si l'adresse modifiée est l'adresse par défaut (DEP-0290) et devient invalide :
  - Exiger le choix d'une nouvelle adresse valide avant validation de la commande suivante.
  - Afficher un message d'alerte : « Votre adresse par défaut doit être mise à jour. »

### Validation

- Une adresse invalide ne peut pas être enregistrée.
- Les commandes en cours utilisant l'ancienne adresse ne sont pas affectées (version archivée conservée).

---

## DEP-0295 — Logique de consentement minimal aux notifications

### Objectif

Définir la logique de recueil du consentement minimal aux notifications push et SMS pour permettre au client d'être informé de l'état de ses commandes.

### Règles de consentement

1. **Moment du consentement** : demandé lors de la première inscription ou lors de la première commande passée.
2. **Consentement par défaut** : non activé (opt-in obligatoire, conformité RGPD).
3. **Types de notifications** :
   - **Notifications push** : application mobile (iOS, Android).
   - **SMS** : envoyés sur le numéro de téléphone inscrit.

### Affichage de la demande

- **Question** : « Souhaitez-vous recevoir des notifications pour suivre vos commandes ? »
- **Explication** : « Vous serez informé de la préparation, l'expédition et la livraison. »
- **Choix** :
  - « Oui, activer » (bouton primaire).
  - « Non, pas maintenant » (bouton secondaire).

### Conséquences du choix

- **Acceptation** : le client reçoit des notifications automatiques à chaque changement d'état de commande.
- **Refus** : le client ne reçoit pas de notifications automatiques, mais peut consulter l'état de sa commande manuellement dans l'application.

### Modification ultérieure

- **Accès** : depuis l'écran de profil client.
- **Action** : toggle « Notifications activées » (oui/non).
- **Enregistrement** : chaque modification est horodatée.

### Validation RGPD

- Consentement libre, éclairé, univoque et spécifique.
- Le client peut retirer son consentement à tout moment.
- Date et heure du consentement enregistrées en base de données.

---

## DEP-0296 — Logique de consentement minimal à l'assistant vocal

### Objectif

Définir la logique de recueil du consentement minimal à l'utilisation de l'assistant vocal (reconnaissance et synthèse vocale) pour une navigation assistée.

### Règles de consentement

1. **Moment du consentement** : demandé lors du premier accès au mode assisté ou au mode téléphone.
2. **Consentement par défaut** : non activé (opt-in obligatoire).
3. **Permissions système** :
   - **Microphone** : demande d'accès système (iOS/Android) lors de la première activation.
   - **Synthèse vocale** : pas de permission requise, intégrée au système.

### Affichage de la demande

- **Question** : « Souhaitez-vous activer l'assistant vocal pour vous guider ? »
- **Explication** : « L'assistant vous aidera à trouver et commander vos produits plus rapidement. »
- **Choix** :
  - « Oui, activer » (bouton primaire).
  - « Non, rester en mode manuel » (bouton secondaire).

### Conséquences du choix

- **Acceptation** :
  - Demande de permission microphone (si pas encore accordée).
  - Activation de l'assistant vocal.
  - Passage automatique en mode assisté.
- **Refus** :
  - Le client reste en mode manuel.
  - L'assistant vocal n'est pas disponible.
  - Le client peut naviguer normalement sans assistance vocale.

### Modification ultérieure

- **Accès** : depuis l'écran de profil client ou l'écran de choix de mode.
- **Action** : toggle « Assistant vocal » (oui/non).
- **Enregistrement** : chaque modification est horodatée.

### Validation RGPD et stores

- Consentement conforme aux exigences RGPD.
- Respect des politiques de confidentialité des stores (App Store, Google Play).
- Transparence sur l'utilisation du microphone et le traitement de la voix.

---

## DEP-0297 — Logique de choix initial entre mode manuel et mode assisté

### Objectif

Définir la logique de présentation et de sélection du mode d'interaction préféré du client lors de sa première utilisation de l'application après inscription ou connexion.

### Moment du choix

- **Déclencheur** : affiché après la première connexion réussie, avant l'accès à la boutique.
- **Condition** : le client n'a pas encore de mode préféré enregistré (DEP-0299).

### Modes proposés

1. **Mode manuel** :
   - Navigation par grille de produits.
   - Recherche et filtres classiques.
   - Aucune assistance vocale.
2. **Mode assisté** :
   - Assistant vocal intégré.
   - Guidage par la voix pour rechercher et commander.
   - Nécessite le consentement à l'assistant vocal (DEP-0296).
3. **Mode téléphone** :
   - Possibilité d'appeler directement un agent vocal pour passer commande.
   - Disponible ultérieurement (phase V2).

### Affichage de l'écran de choix

- **Titre** : « Comment souhaitez-vous commander ? »
- **Description de chaque mode** :
  - Icône illustrative + nom du mode + description courte (2-3 lignes).
- **Choix par défaut** : aucun mode n'est présélectionné.
- **Action** : bouton « Continuer » activé uniquement après sélection d'un mode.

### Validation du choix

- Le client ne peut pas accéder à la boutique sans avoir choisi un mode.
- Le mode choisi est enregistré comme préférence (DEP-0299).
- Redirection automatique vers la boutique dans le mode sélectionné.

### Modification ultérieure

- Le choix peut être modifié à tout moment depuis l'écran de profil ou de paramètres.

---

## DEP-0298 — Logique de changement de mode pendant la navigation

### Objectif

Définir la logique permettant au client de basculer d'un mode d'interaction à un autre pendant sa session de navigation, sans perdre son panier ni ses préférences.

### Accès au changement de mode

- **Emplacement** : bouton fixe dans la barre de navigation ou le menu principal.
- **Libellé** : icône de mode + label court (ex. : « Mode assisté »).
- **Visibilité** : toujours accessible, sur toutes les pages de l'application.

### Modes disponibles

1. **Mode manuel** : navigation classique par grille et recherche.
2. **Mode assisté** : assistant vocal activé.
3. **Mode téléphone** : affichage du numéro à composer (selon disponibilité).

### Transition entre modes

1. **Du mode manuel vers le mode assisté** :
   - Vérification du consentement à l'assistant vocal (DEP-0296).
   - Si consentement non donné : demande de consentement.
   - Si accepté : activation de l'assistant vocal + message de bienvenue.
2. **Du mode assisté vers le mode manuel** :
   - Désactivation de l'assistant vocal.
   - Message de confirmation : « Mode manuel activé. »
3. **Vers le mode téléphone** :
   - Affichage du numéro à composer.
   - Message d'accompagnement : « Appelez ce numéro pour commander par téléphone. »

### Conservation du contexte

- **Panier** : inchangé, tous les produits ajoutés restent présents.
- **Filtres appliqués** : conservés (catégorie, tri, recherche).
- **Produits consultés** : historique de navigation préservé.

### Notification de changement

- **Type** : toast ou message bref (2-3 secondes).
- **Exemples** :
  - « Mode assisté activé »
  - « Mode manuel activé »
  - « Prêt à passer commande par téléphone »

### Indicateur visuel du mode actif

- **Emplacement** : barre de navigation ou en-tête.
- **Forme** : badge, icône ou texte indiquant le mode actuel.

### Validation

- Le changement de mode ne provoque aucune perte de données (panier, filtres, navigation).
- Le mode actif est visible en permanence dans l'interface.

---

## DEP-0299 — Logique de mémorisation du mode préféré du client

### Objectif

Définir la logique d'enregistrement et de restauration automatique du dernier mode d'interaction utilisé par le client, afin de lui offrir une expérience fluide lors de ses prochaines connexions.

### Enregistrement automatique

1. **Déclencheur** : chaque changement de mode (DEP-0298) ou choix initial (DEP-0297).
2. **Stockage** : enregistré dans le profil client en base de données.
3. **Valeurs possibles** :
   - `manuel`
   - `assiste`
   - `telephone`
4. **Horodatage** : date et heure de la dernière modification.

### Restauration au démarrage

1. **Connexion réussie** : l'application lit le mode préféré du client.
2. **Ouverture automatique** : la boutique s'ouvre directement dans ce mode.
3. **Si aucun mode enregistré** : affichage de l'écran de choix initial (DEP-0297).

### Modification du mode préféré

1. **Pendant la navigation** : changement de mode (DEP-0298) → enregistrement automatique.
2. **Depuis le profil** : sélection dans les préférences → enregistrement immédiat.

### Synchronisation multi-appareils

- Le mode préféré est synchronisé entre tous les appareils du client (web, mobile iOS, mobile Android).
- La dernière modification écrase les valeurs précédentes.

### Validation

- Le mode préféré est restauré à chaque connexion.
- Le client voit immédiatement son interface dans le mode qu'il utilise habituellement.

---

## DEP-0300 — Logique d'ouverture directe sur la boutique après connexion

### Objectif

Définir la logique de navigation automatique vers la boutique immédiatement après une connexion réussie, en mode manuel ou assisté selon la préférence mémorisée du client (DEP-0299).

### Règles de redirection

1. **Connexion réussie** : après validation des identifiants (téléphone + OTP), redirection automatique.
2. **Destination principale** : page boutique (grille de produits ou assistant selon le mode).
3. **Pas d'écran intermédiaire** : aucun splash screen, écran d'accueil ou page de transition.
4. **Délai maximal** : moins de 2 secondes entre la validation de l'OTP et l'affichage de la boutique.

### Cas nominaux

1. **Client avec mode préféré enregistré (DEP-0299)** :
   - Ouverture directe de la boutique dans ce mode.
   - Si mode assisté : activation immédiate de l'assistant vocal (avec consentement déjà donné).
2. **Client sans mode préféré** :
   - Affichage de l'écran de choix de mode (DEP-0297).
   - Après sélection : ouverture de la boutique dans le mode choisi.

### Exceptions et redirections alternatives

1. **Profil client incomplet** :
   - **Condition** : adresse manquante ou invalide.
   - **Action** : redirection vers l'écran de profil avec message d'erreur : « Veuillez compléter votre adresse de livraison. »
2. **Panier en attente** :
   - **Condition** : des produits ont été ajoutés au panier lors d'une session précédente.
   - **Action** : ouverture de la boutique avec le panier restauré.
   - **Notification** : toast « Votre panier a été restauré. »
3. **Commande en cours** :
   - **Condition** : une commande est en cours de livraison.
   - **Action** : ouverture de la boutique, avec indicateur de commande en cours visible dans la barre de navigation.

### Restauration du contexte

- **Panier** : restauré automatiquement si non vidé.
- **Dernière catégorie consultée** : mémorisée mais non restaurée automatiquement (le client commence toujours sur la page d'accueil de la boutique).
- **Filtres** : réinitialisés à chaque nouvelle connexion.

### Validation

- Le client accède à la boutique en moins de 2 secondes après connexion réussie.
- Aucun clic ou action supplémentaire n'est requis.
- Le panier et les préférences de mode sont restaurés automatiquement.

---

## Résumé du bloc DEP-0291 à DEP-0300

Ce document a défini 10 logiques complémentaires pour affiner la gestion du profil client et l'expérience d'interaction :

1. **DEP-0291** : Notes de livraison par adresse (≤200 caractères, chiffrées, optionnelles).
2. **DEP-0292** : Suppression de compte (confirmation OTP, anonymisation, irréversible).
3. **DEP-0293** : Mise à jour du téléphone (OTP sur nouveau numéro, invalidation des sessions).
4. **DEP-0294** : Mise à jour de l'adresse (vérification obligatoire, historisation, conservation des notes).
5. **DEP-0295** : Consentement aux notifications (opt-in, push + SMS, modifiable).
6. **DEP-0296** : Consentement à l'assistant vocal (opt-in, permission microphone, modifiable).
7. **DEP-0297** : Choix initial du mode d'interaction (manuel, assisté, téléphone).
8. **DEP-0298** : Changement de mode en cours de navigation (sans perte de panier ni de contexte).
9. **DEP-0299** : Mémorisation du mode préféré (enregistrement automatique, synchronisation multi-appareils).
10. **DEP-0300** : Ouverture directe sur la boutique après connexion (≤2 secondes, panier restauré, mode préféré appliqué).

Ces spécifications sont prêtes à être implémentées dans les phases de développement ultérieures.

---

**Fin du document DEP-0291 à DEP-0300**
