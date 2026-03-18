# DEP-0295 à DEP-0310 — Entrée client, modes et messages

## Périmètre

Ce document définit la **logique d'entrée du client dans l'application**, les **modes d'interaction disponibles** (manuel, assisté, téléphone), les **écrans d'inscription, connexion et profil**, ainsi que les **messages de bienvenue et d'erreur** associés.

Il s'agit exclusivement de **documentation** : aucun code produit, aucune implémentation. Les spécifications décrites ici serviront de référence pour les développements futurs.

**Référence parente** : Bloc DEP-0281 à DEP-0320 (inscription, connexion et gestion client)

---

## DEP-0295 — Logique de consentement minimal aux notifications

### Objectif

Définir la logique de recueil du consentement minimal aux notifications push et SMS pour permettre au client d'être informé de l'état de ses commandes.

### Règles

1. **Moment du consentement** : demandé lors de la première inscription ou lors de la première commande passée.
2. **Consentement par défaut** : non activé (opt-in obligatoire).
3. **Types de notifications** :
   - Notifications push (application mobile)
   - SMS (numéro de téléphone inscrit)
4. **Informations affichées** :
   - « Souhaitez-vous recevoir des notifications pour suivre vos commandes ? »
   - Explication : « Vous serez informé de la préparation, l'expédition et la livraison. »
   - Choix : « Oui, activer » / « Non, pas maintenant »
5. **Modification ultérieure** : possible depuis l'écran de profil client (DEP-0303).
6. **Conséquences du refus** : le client ne recevra pas de notifications automatiques, mais pourra consulter l'état de sa commande manuellement dans l'application.

### Validation

- Le consentement est enregistré avec la date et l'heure.
- Le client peut modifier son choix à tout moment.
- Conforme aux exigences RGPD (consentement libre, éclairé, univoque).

---

## DEP-0296 — Logique de consentement minimal à l'assistant vocal

### Objectif

Définir la logique de recueil du consentement minimal à l'utilisation de l'assistant vocal (reconnaissance et synthèse vocale) pour une navigation assistée.

### Règles

1. **Moment du consentement** : demandé lors du premier accès au mode assisté ou au mode téléphone.
2. **Consentement par défaut** : non activé (opt-in obligatoire).
3. **Informations affichées** :
   - « Souhaitez-vous activer l'assistant vocal pour vous guider ? »
   - Explication : « L'assistant vous aidera à trouver et commander vos produits plus rapidement. »
   - Choix : « Oui, activer » / « Non, rester en mode manuel »
4. **Modification ultérieure** : possible depuis l'écran de profil client (DEP-0303) ou l'écran de choix de mode (DEP-0305).
5. **Conséquences du refus** : le client reste en mode manuel et peut naviguer sans assistance vocale.
6. **Permissions système** : l'application doit demander l'accès au microphone (iOS/Android) lors de la première activation.

### Validation

- Le consentement est enregistré avec la date et l'heure.
- Le client peut désactiver l'assistant vocal à tout moment.
- Conforme aux exigences RGPD et aux politiques de confidentialité des stores (App Store, Google Play).

---

## DEP-0297 — Logique de choix initial entre mode manuel et mode assisté

### Objectif

Définir la logique de présentation et de sélection du mode d'interaction préféré du client lors de sa première utilisation de l'application après inscription ou connexion.

### Règles

1. **Moment du choix** : affiché après la première connexion réussie, avant l'accès à la boutique.
2. **Modes proposés** :
   - **Mode manuel** : navigation par grille de produits, recherche et filtres classiques.
   - **Mode assisté** : assistant vocal intégré pour guider la recherche et la commande.
   - **Mode téléphone** : possibilité d'appeler directement un agent vocal pour passer commande (disponible ultérieurement).
3. **Affichage** : écran de choix dédié (DEP-0305) avec description claire de chaque mode.
4. **Choix par défaut** : aucun mode n'est présélectionné, le client doit choisir explicitement.
5. **Validation** : le client clique sur « Continuer » après avoir sélectionné un mode.
6. **Mémorisation** : le mode choisi est enregistré comme préférence (DEP-0299).

### Validation

- Le client ne peut pas accéder à la boutique sans avoir choisi un mode.
- Le choix peut être modifié à tout moment depuis l'écran de profil ou de paramètres.

---

## DEP-0298 — Logique de changement de mode pendant la navigation

### Objectif

Définir la logique permettant au client de basculer d'un mode d'interaction à un autre pendant sa session de navigation, sans perdre son panier ni ses préférences.

### Règles

1. **Accès au changement de mode** : via un bouton fixe dans la barre de navigation ou le menu principal.
2. **Modes disponibles** : manuel, assisté, téléphone (selon disponibilité).
3. **Transition immédiate** :
   - En passant du mode manuel au mode assisté : l'assistant vocal s'active et affiche un message de bienvenue (DEP-0308).
   - En passant du mode assisté au mode manuel : l'assistant vocal se désactive et un message confirme le passage en mode manuel.
   - En passant au mode téléphone : affichage du numéro à composer et du message de bienvenue (DEP-0309).
4. **Conservation du contexte** : le panier, les produits consultés et les filtres appliqués restent inchangés.
5. **Notification de changement** : un toast ou message bref confirme le changement de mode (ex. : « Mode assisté activé »).

### Validation

- Le changement de mode ne provoque pas de perte de données.
- Le mode actif est visible en permanence dans l'interface (indicateur visuel ou textuel).

---

## DEP-0299 — Logique de mémorisation du mode préféré du client

### Objectif

Définir la logique d'enregistrement et de restauration automatique du dernier mode d'interaction utilisé par le client, afin de lui offrir une expérience fluide lors de ses prochaines connexions.

### Règles

1. **Enregistrement automatique** : chaque changement de mode (DEP-0298) est enregistré dans le profil client.
2. **Restauration au démarrage** : lors de la prochaine connexion, l'application ouvre directement la boutique dans le mode préféré enregistré.
3. **Stockage** : le mode préféré est enregistré en base de données avec l'identifiant du client.
4. **Valeurs possibles** : `manuel`, `assiste`, `telephone`.
5. **Modification** : le client peut modifier son mode préféré à tout moment, soit en changeant de mode pendant la navigation (DEP-0298), soit depuis l'écran de profil (DEP-0303).

### Validation

- Le mode préféré est restauré à chaque connexion.
- Si aucun mode n'a été enregistré, l'écran de choix initial (DEP-0305) est affiché.

---

## DEP-0300 — Logique d'ouverture directe sur la boutique après connexion

### Objectif

Définir la logique de navigation automatique vers la boutique immédiatement après une connexion réussie, en mode manuel ou assisté selon la préférence mémorisée du client (DEP-0299).

### Règles

1. **Connexion réussie** : après validation des identifiants (téléphone + code ou autre méthode), le client est redirigé automatiquement.
2. **Destination** :
   - Si le client a un mode préféré enregistré (DEP-0299) : ouverture directe de la boutique dans ce mode.
   - Si le client n'a pas encore choisi de mode : affichage de l'écran de choix (DEP-0305).
3. **Exceptions** :
   - Si le profil client est incomplet (adresse manquante ou invalide) : redirection vers l'écran de profil (DEP-0303) avec message d'erreur (DEP-0310).
   - Si le client a un panier en attente : ouverture de la boutique avec le panier restauré.
4. **Pas d'écran intermédiaire** : aucun écran d'accueil ou de splash screen après connexion, priorité à la fluidité.

### Validation

- Le client accède à la boutique en moins de 2 secondes après connexion réussie.
- Le panier et les préférences sont restaurés automatiquement.

---

## DEP-0301 — Écran d'inscription client

### Objectif

Définir la structure, les champs et le comportement de l'écran d'inscription permettant à un nouveau client de créer un compte.

### Structure de l'écran

1. **Titre** : « Créer un compte »
2. **Champs obligatoires** (DEP-0282) :
   - **Prénom** : champ texte, 2 à 50 caractères.
   - **Nom** : champ texte, 2 à 50 caractères.
   - **Numéro de téléphone** : champ numérique, format international +33 ou local 06/07, validation en temps réel (DEP-0284).
   - **Adresse complète** : champ texte structuré (numéro, rue, code postal, ville), autocomplétion recommandée (DEP-0285).
3. **Champs optionnels** (DEP-0283) :
   - **Adresse de facturation** : si différente de l'adresse de livraison.
   - **Notes de livraison** : instructions spécifiques pour le livreur (ex. : « Sonner chez le voisin », « Code porte 1234 »).
4. **Consentement RGPD** :
   - Case à cocher obligatoire : « J'accepte les conditions générales d'utilisation et la politique de confidentialité. »
   - Lien vers les CGU et la politique de confidentialité.
5. **Bouton d'action** : « Créer mon compte » (bouton primaire, DEP-0228).

### Comportement

- **Validation en temps réel** : affichage des erreurs sous chaque champ dès qu'il perd le focus.
- **Erreurs possibles** :
  - Numéro de téléphone invalide (DEP-0311).
  - Adresse incomplète (DEP-0310).
  - Zone non desservie (DEP-0312).
- **Succès** : après validation réussie, redirection vers l'écran de choix de mode (DEP-0305).

### Accessibilité

- Tous les champs ont des labels clairs et des attributs `aria-label`.
- Navigation au clavier possible.
- Messages d'erreur lisibles par les lecteurs d'écran.

---

## DEP-0302 — Écran de connexion client

### Objectif

Définir la structure, les champs et le comportement de l'écran de connexion permettant à un client existant de se reconnecter à son compte.

### Structure de l'écran

1. **Titre** : « Se connecter »
2. **Champs de connexion** :
   - **Numéro de téléphone** : champ numérique, format +33 ou 06/07.
   - **Code de vérification** : champ numérique à 6 chiffres, envoyé par SMS (DEP-0284).
3. **Bouton d'action** : « Envoyer le code » puis « Se connecter » après saisie du code.
4. **Lien de récupération** : « Vous ne recevez pas le code ? » → redirection vers l'écran de récupération d'accès (DEP-0306).
5. **Lien d'inscription** : « Pas encore de compte ? Créer un compte » → redirection vers l'écran d'inscription (DEP-0301).

### Comportement

- **Première étape** : saisie du numéro de téléphone, envoi automatique du code par SMS.
- **Deuxième étape** : saisie du code à 6 chiffres, validation automatique dès que les 6 chiffres sont entrés.
- **Erreurs possibles** :
  - Numéro de téléphone non trouvé : « Aucun compte associé à ce numéro. »
  - Code incorrect : « Code invalide. Veuillez réessayer. »
  - Code expiré : « Code expiré. Demander un nouveau code ? »
- **Succès** : redirection vers la boutique (DEP-0300).

### Accessibilité

- Tous les champs ont des labels clairs et des attributs `aria-label`.
- Navigation au clavier possible.
- Messages d'erreur lisibles par les lecteurs d'écran.

---

## DEP-0303 — Écran de profil client

### Objectif

Définir la structure, les sections et les actions disponibles sur l'écran de profil permettant au client de consulter et modifier ses informations personnelles, ses préférences et ses consentements.

### Structure de l'écran

1. **Titre** : « Mon profil »
2. **Section Informations personnelles** :
   - **Prénom** : modifiable, champ texte.
   - **Nom** : modifiable, champ texte.
   - **Numéro de téléphone** : modifiable avec vérification par SMS (DEP-0293).
   - **Adresse principale** : modifiable, lien vers l'écran de gestion d'adresses (DEP-0304).
3. **Section Préférences** :
   - **Mode préféré** : sélection entre manuel, assisté, téléphone (DEP-0299).
   - **Notifications** : activation/désactivation des notifications push et SMS (DEP-0295).
   - **Assistant vocal** : activation/désactivation de l'assistant vocal (DEP-0296).
4. **Section Adresses de livraison** :
   - Liste des adresses enregistrées avec bouton « Gérer mes adresses » → redirection vers DEP-0304.
5. **Section Actions** :
   - **Déconnexion** : bouton secondaire.
   - **Supprimer mon compte** : bouton danger avec confirmation modale (DEP-0292).
6. **Bouton d'enregistrement** : « Enregistrer les modifications » (bouton primaire).

### Comportement

- **Modification des informations** : validation en temps réel des champs modifiés.
- **Enregistrement** : sauvegarde immédiate des modifications sans rechargement de page.
- **Confirmation** : toast de confirmation « Profil mis à jour avec succès ».
- **Erreurs possibles** : affichage sous chaque champ concerné (téléphone invalide, adresse incomplète, etc.).

### Accessibilité

- Tous les champs et boutons ont des labels clairs.
- Navigation au clavier possible.
- Messages de confirmation et d'erreur lisibles par les lecteurs d'écran.

---

## DEP-0304 — Écran de gestion d'adresses

### Objectif

Définir la structure et le comportement de l'écran permettant au client de gérer plusieurs adresses de livraison (ajout, modification, suppression, définition de l'adresse par défaut).

### Structure de l'écran

1. **Titre** : « Mes adresses »
2. **Liste des adresses enregistrées** :
   - Chaque adresse est affichée dans une carte avec :
     - **Nom de l'adresse** : ex. « Domicile », « Travail », « Garage » (modifiable).
     - **Adresse complète** : numéro, rue, code postal, ville.
     - **Badge « Adresse par défaut »** : si applicable (DEP-0290).
     - **Actions** : boutons « Modifier », « Supprimer », « Définir par défaut ».
3. **Bouton d'ajout** : « Ajouter une adresse » (bouton primaire) → ouvre un formulaire d'ajout.

### Formulaire d'ajout/modification d'adresse

1. **Nom de l'adresse** : champ texte, 2 à 30 caractères (ex. « Domicile »).
2. **Numéro et rue** : champ texte, autocomplétion recommandée.
3. **Code postal** : champ numérique, 5 chiffres.
4. **Ville** : champ texte, autocomplétion recommandée.
5. **Notes de livraison** : champ texte optionnel (DEP-0291).
6. **Case à cocher** : « Définir comme adresse par défaut ».
7. **Boutons** : « Enregistrer » (primaire), « Annuler » (secondaire).

### Comportement

- **Validation** : vérification de la complétude de l'adresse (DEP-0285) et de la zone de livraison desservie (DEP-0312).
- **Suppression** : confirmation modale « Êtes-vous sûr de vouloir supprimer cette adresse ? ».
- **Adresse par défaut** : une seule adresse peut être définie par défaut à la fois.
- **Erreurs possibles** :
  - Adresse incomplète (DEP-0310).
  - Zone non desservie (DEP-0312).

### Accessibilité

- Tous les champs et boutons ont des labels clairs.
- Navigation au clavier possible.
- Messages de confirmation et d'erreur lisibles par les lecteurs d'écran.

---

## DEP-0305 — Écran de choix manuel ou assisté

### Objectif

Définir la structure et le comportement de l'écran de sélection du mode d'interaction préféré du client (manuel, assisté, téléphone), affiché lors de la première utilisation ou accessible depuis les paramètres.

### Structure de l'écran

1. **Titre** : « Comment souhaitez-vous commander ? »
2. **Introduction** : « Choisissez le mode qui vous convient le mieux. Vous pourrez le changer à tout moment. »
3. **Cartes de choix** :
   - **Mode manuel** :
     - Icône : grille de produits.
     - Titre : « Mode manuel »
     - Description : « Parcourez les produits, ajoutez-les au panier et commandez quand vous êtes prêt. »
     - Bouton : « Choisir le mode manuel » (bouton secondaire).
   - **Mode assisté** :
     - Icône : microphone.
     - Titre : « Mode assisté »
     - Description : « Laissez l'assistant vocal vous guider pour trouver vos produits plus rapidement. »
     - Bouton : « Choisir le mode assisté » (bouton primaire).
   - **Mode téléphone** (si disponible) :
     - Icône : téléphone.
     - Titre : « Mode téléphone »
     - Description : « Appelez directement un agent pour passer votre commande par téléphone. »
     - Bouton : « Choisir le mode téléphone » (bouton secondaire).
4. **Lien de retour** : « Retour à mon profil » (si accès depuis les paramètres).

### Comportement

- **Sélection** : clic sur un bouton enregistre le mode choisi (DEP-0297, DEP-0299) et redirige vers la boutique (DEP-0300).
- **Message de bienvenue** : après sélection, affichage du message de bienvenue correspondant (DEP-0307, DEP-0308, DEP-0309).
- **Accessibilité** : navigation au clavier, labels clairs, descriptions lues par les lecteurs d'écran.

---

## DEP-0306 — Écran de récupération d'accès

### Objectif

Définir la structure et le comportement de l'écran permettant au client de récupérer l'accès à son compte en cas de perte ou de non-réception du code de vérification.

### Structure de l'écran

1. **Titre** : « Récupérer mon accès »
2. **Explication** : « Vous ne recevez pas le code de vérification ? Nous allons vous renvoyer un nouveau code par SMS. »
3. **Champs** :
   - **Numéro de téléphone** : champ numérique, pré-rempli si possible.
4. **Bouton d'action** : « Renvoyer le code » (bouton primaire).
5. **Lien de retour** : « Retour à la connexion » → redirection vers DEP-0302.

### Comportement

- **Renvoi du code** : génération et envoi d'un nouveau code à 6 chiffres par SMS.
- **Limitation** : maximum 3 renvois par heure pour éviter les abus.
- **Confirmation** : message « Un nouveau code a été envoyé au +33 6 XX XX XX XX. »
- **Erreurs possibles** :
  - Numéro de téléphone non trouvé : « Aucun compte associé à ce numéro. »
  - Limite de renvois atteinte : « Trop de demandes. Veuillez réessayer dans 1 heure. »

### Accessibilité

- Tous les champs et boutons ont des labels clairs.
- Navigation au clavier possible.
- Messages de confirmation et d'erreur lisibles par les lecteurs d'écran.

---

## DEP-0307 — Message de bienvenue du mode manuel

### Objectif

Définir le contenu et l'affichage du message de bienvenue affiché au client lorsqu'il accède à la boutique en mode manuel, après inscription ou changement de mode.

### Contenu du message

**Texte principal** :
« Bienvenue sur depaneurIA ! »

**Texte secondaire** :
« Parcourez nos produits, utilisez la recherche ou les filtres pour trouver ce dont vous avez besoin. Ajoutez vos articles au panier et commandez quand vous êtes prêt. »

**Affichage** :
- Toast en haut de l'écran ou modal léger (non bloquant).
- Durée : 5 secondes ou fermeture manuelle.
- Bouton : « Commencer » (bouton primaire) ou « J'ai compris » (fermeture automatique).

### Accessibilité

- Le message est lisible par les lecteurs d'écran.
- Le focus clavier est placé sur le bouton de fermeture si modal.

---

## DEP-0308 — Message de bienvenue du mode assisté

### Objectif

Définir le contenu et l'affichage du message de bienvenue affiché au client lorsqu'il active le mode assisté, ainsi que la première phrase prononcée par l'assistant vocal.

### Contenu du message

**Texte principal** :
« Bienvenue en mode assisté ! »

**Texte secondaire** :
« L'assistant vocal est activé. Dites simplement ce que vous recherchez, par exemple : "Je cherche des plaquettes de frein" ou "Ajoute un filtre à huile au panier". »

**Message vocal de l'assistant** :
« Bonjour ! Je suis votre assistant depaneurIA. Que puis-je vous aider à trouver aujourd'hui ? »

**Affichage** :
- Toast en haut de l'écran ou bulle de chat de l'assistant.
- Durée : 5 secondes ou fermeture manuelle.
- Indicateur visuel : icône de microphone animée pour montrer que l'assistant est à l'écoute.

### Accessibilité

- Le message est lisible par les lecteurs d'écran.
- Le focus clavier est placé sur le bouton de fermeture si modal.

---

## DEP-0309 — Message de bienvenue du mode téléphone

### Objectif

Définir le contenu et l'affichage du message de bienvenue affiché au client lorsqu'il choisit le mode téléphone, ainsi que les instructions pour passer commande par téléphone.

### Contenu du message

**Texte principal** :
« Bienvenue en mode téléphone ! »

**Texte secondaire** :
« Vous préférez commander par téléphone ? Appelez le **08 00 12 34 56** (numéro gratuit). Un agent vocal ou humain vous guidera pour passer votre commande. »

**Affichage** :
- Modal ou écran dédié avec le numéro de téléphone bien visible.
- Bouton d'action : « Appeler maintenant » (lance l'application téléphone avec le numéro pré-rempli).
- Bouton secondaire : « Retour à la boutique » (retour en mode manuel ou assisté).

### Instructions vocales (pour l'agent vocal téléphonique)

**Message d'accueil** :
« Bonjour et bienvenue chez depaneurIA. Je suis votre assistant téléphonique. Pour commencer, veuillez me donner votre numéro de téléphone ou dites "nouveau client" si vous n'avez pas encore de compte. »

### Accessibilité

- Le numéro de téléphone est lisible par les lecteurs d'écran.
- Le bouton d'appel est accessible au clavier.

---

## DEP-0310 — Message d'erreur pour adresse incomplète

### Objectif

Définir le contenu et l'affichage du message d'erreur affiché au client lorsqu'il tente de valider une inscription ou une commande avec une adresse incomplète ou invalide.

### Contenu du message

**Texte principal** :
« Adresse incomplète »

**Texte secondaire** :
« Veuillez vérifier que votre adresse contient le numéro, le nom de rue, le code postal et la ville. »

**Affichage** :
- Message d'erreur sous le champ adresse (texte rouge, icône d'alerte).
- Bordure rouge autour du champ adresse.
- Pas de validation du formulaire tant que l'erreur n'est pas corrigée.

### Exemples de cas d'erreur

- Numéro de rue manquant : « Le numéro de rue est obligatoire. »
- Code postal manquant ou invalide : « Le code postal doit contenir 5 chiffres. »
- Ville manquante : « La ville est obligatoire. »

### Accessibilité

- Le message d'erreur est lu par les lecteurs d'écran dès son apparition.
- Le focus clavier est replacé sur le champ en erreur.

---

## Résumé des modes d'entrée et écrans

### Modes d'interaction

1. **Mode manuel** : navigation classique par grille de produits, recherche et filtres (DEP-0307).
2. **Mode assisté** : assistant vocal intégré pour guider le client dans sa recherche et sa commande (DEP-0308).
3. **Mode téléphone** : appel téléphonique avec agent vocal ou humain (DEP-0309).

### Écrans principaux

1. **Écran d'inscription** (DEP-0301) : création de compte avec prénom, nom, téléphone, adresse.
2. **Écran de connexion** (DEP-0302) : reconnexion par téléphone et code SMS.
3. **Écran de profil** (DEP-0303) : gestion des informations personnelles, préférences et consentements.
4. **Écran de gestion d'adresses** (DEP-0304) : ajout, modification, suppression et définition de l'adresse par défaut.
5. **Écran de choix de mode** (DEP-0305) : sélection du mode d'interaction préféré (manuel, assisté, téléphone).
6. **Écran de récupération d'accès** (DEP-0306) : renvoi du code de vérification en cas de perte ou non-réception.

### Logiques de consentement et mémorisation

- **Consentement notifications** (DEP-0295) : opt-in pour notifications push et SMS.
- **Consentement assistant vocal** (DEP-0296) : opt-in pour reconnaissance et synthèse vocale.
- **Mémorisation du mode préféré** (DEP-0299) : enregistrement automatique du dernier mode utilisé.
- **Ouverture directe sur la boutique** (DEP-0300) : redirection automatique après connexion vers la boutique dans le mode préféré.

### Messages de bienvenue et d'erreur

- **Message de bienvenue mode manuel** (DEP-0307) : toast ou modal de bienvenue avec instructions de navigation.
- **Message de bienvenue mode assisté** (DEP-0308) : activation de l'assistant vocal avec message d'accueil parlé.
- **Message de bienvenue mode téléphone** (DEP-0309) : affichage du numéro à composer avec bouton d'appel direct.
- **Message d'erreur adresse incomplète** (DEP-0310) : affichage sous le champ adresse avec explications claires.

---

## Validation finale

Ce document définit l'ensemble des décisions concernant l'entrée du client, les modes d'interaction, les écrans de gestion de compte et les messages associés (DEP-0295 à DEP-0310).

Toutes les spécifications sont documentées de manière complète, cohérente et prête à être implémentée.

**Statut** : ✅ Documentation terminée.
