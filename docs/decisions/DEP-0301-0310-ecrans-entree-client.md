# DEP-0301 à DEP-0310 — Écrans d'entrée client

## Périmètre

Ce document définit les **écrans d'entrée client** (inscription, connexion, profil, adresses, choix de mode, récupération d'accès) ainsi que les **messages de bienvenue et d'erreur** associés aux différents modes d'interaction (manuel, assisté, téléphone).

Il s'agit exclusivement de **documentation** : aucun code produit, aucune implémentation. Les spécifications décrites ici serviront de référence pour les développements futurs.

**Référence parente** : DEP-0295 à DEP-0310 — Entrée client, modes et messages (`DEP-0295-0310-entree-client-modes-et-messages.md`)

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

### Accessibilité

- Navigation au clavier possible.
- Labels clairs et descriptions lues par les lecteurs d'écran.

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

### Affichage

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

### Affichage

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

### Affichage

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

### Affichage

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

## Résumé

### Écrans de gestion de compte

| DEP | Écran | Titre affiché |
|-----|-------|---------------|
| DEP-0301 | Inscription client | « Créer un compte » |
| DEP-0302 | Connexion client | « Se connecter » |
| DEP-0303 | Profil client | « Mon profil » |
| DEP-0304 | Gestion d'adresses | « Mes adresses » |
| DEP-0305 | Choix de mode | « Comment souhaitez-vous commander ? » |
| DEP-0306 | Récupération d'accès | « Récupérer mon accès » |

### Messages de bienvenue et d'erreur

| DEP | Type | Texte principal |
|-----|------|----------------|
| DEP-0307 | Bienvenue mode manuel | « Bienvenue sur depaneurIA ! » |
| DEP-0308 | Bienvenue mode assisté | « Bienvenue en mode assisté ! » |
| DEP-0309 | Bienvenue mode téléphone | « Bienvenue en mode téléphone ! » |
| DEP-0310 | Erreur adresse incomplète | « Adresse incomplète » |

---

## Validation finale

Ce document définit l'ensemble des décisions concernant les écrans d'entrée client et les messages associés (DEP-0301 à DEP-0310).

Toutes les spécifications sont documentées de manière complète, cohérente et prête à être implémentée.

**Statut** : ✅ Documentation terminée.
