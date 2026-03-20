# DEP-0441 à DEP-0456 — Rôle, flux d'appel et phrases téléphoniques

## Périmètre

Ce document définit le **rôle précis de l'agent vocal téléphonique** de depaneurIA, les **choix techniques de téléphonie cloud**, les **flux d'appel entrant** selon différents scénarios (ouvert, fermé, indisponible, zone non desservie, client connu/inconnu), et l'ensemble des **phrases système canoniques** utilisées lors des appels téléphoniques.

Principe directeur : **l'agent vocal téléphonique prolonge l'expérience depaneurIA sur un canal synchrone voix**, en permettant aux clients de passer commande par téléphone avec le même niveau de qualité que sur le web ou l'application mobile.

Il s'agit exclusivement de **documentation** : aucun code produit, aucune implémentation. Les spécifications décrites ici serviront de référence pour les futures intégrations téléphoniques et les développements back-end associés.

**Référence parente** : Bloc DEP-0441 à DEP-0480 (téléphonie vocale)

---

## DEP-0441 — Rôle précis de l'agent vocal téléphonique

### Objectif

Définir en termes clairs et sans ambiguïté ce qu'est l'agent vocal téléphonique de depaneurIA, ce qu'il fait et ce qu'il n'est pas.

### Définition

L'agent vocal téléphonique est un **assistant conversationnel vocal** qui répond aux appels entrants sur le numéro depaneurIA. Il guide le client dans la prise de commande par téléphone, collecte les informations nécessaires (identité, adresse, produits souhaités), puis crée une commande dans le système depaneurIA.

### Ce qu'il est

| Attribut      | Description                                                        |
| ------------- | ------------------------------------------------------------------ |
| Nature        | Agent conversationnel vocal sur ligne téléphonique                 |
| Portée        | Mode téléphone uniquement (≠ mode manuel, ≠ mode assisté web)      |
| Canal         | Voix téléphonique synchrone (appel entrant)                        |
| Langue        | Français — V1                                                      |
| Disponibilité | 24/7 (avec gestion des horaires d'ouverture du dépanneur)          |
| Mémoire       | Limitée à l'appel en cours + accès aux données client si identifié |

### Ce qu'il n'est pas

- Il n'est **pas** un catalogue autonome : il interroge le catalogue depaneurIA en temps réel.
- Il n'est **pas** un opérateur humain : c'est un agent vocal automatisé (IA conversationnelle).
- Il n'est **pas** un service de réclamation : il est limité à la prise de commande V1.
- Il n'est **pas** un service de support technique : il ne traite pas les problèmes de compte ou de livraison.

### Principe fondamental

> L'agent vocal **collecte** les informations. Le système depaneurIA **valide et traite**. Le dépanneur **prépare et livre**.

---

## DEP-0442 — Solution téléphonique cloud principale

### Objectif

Choisir la solution technique cloud pour gérer les appels téléphoniques entrants et l'intégration avec l'IA conversationnelle.

### Choix technique

| Critère                 | Solution retenue                                                   |
| ----------------------- | ------------------------------------------------------------------ |
| Fournisseur cloud       | **Twilio** (solution de référence V1)                              |
| Service principal       | Twilio Voice API + Twilio Programmable Voice                       |
| IA conversationnelle    | OpenAI Realtime API ou équivalent (connexion WebSocket temps réel) |
| Protocole d'intégration | WebSocket pour l'audio streaming bidirectionnel                    |
| Format audio entrant    | μ-law (G.711) 8 kHz mono (standard téléphonie)                     |
| Format audio sortant    | μ-law (G.711) 8 kHz mono (standard téléphonie)                     |

### Justification

- **Twilio** : plateforme mature, documentation complète, support WebSocket natif, intégration simple avec OpenAI Realtime API.
- **OpenAI Realtime API** : permet un dialogue vocal fluide en temps réel sans latence perceptible.
- **Alternative future** : si OpenAI Realtime API est insuffisant, envisager Google Dialogflow CX avec téléphonie Twilio ou solution équivalente.

### Contraintes

- Twilio facture au temps d'appel (coût à surveiller en production).
- Nécessite une connexion stable WebSocket backend ↔ Twilio ↔ OpenAI.
- Les numéros Twilio doivent être acquis selon la zone géographique cible.

---

## DEP-0443 — Fournisseur de numéro téléphonique principal

### Objectif

Choisir le fournisseur de numéros téléphoniques publics pour le service depaneurIA.

### Choix technique

| Critère                | Solution retenue                                                  |
| ---------------------- | ----------------------------------------------------------------- |
| Fournisseur            | **Twilio** (cohérent avec DEP-0442)                               |
| Type de numéro         | Numéro local (géographique) par zone de couverture                |
| Format numéro (France) | +33 X XX XX XX XX (exemple : +33 1 XX XX XX XX pour région Paris) |
| Gestion multi-tenant   | 1 numéro par dépanneur (ou 1 numéro partagé avec routage interne) |

### Règles d'attribution

1. **Phase test** : un seul numéro Twilio partagé pour tous les tests (DEP-0444).
2. **Phase production** : un numéro local par zone de couverture principale du dépanneur.
3. **Routage** : si plusieurs dépanneurs partagent un numéro, le routage se fait par :
   - Détection de l'adresse du client (collectée en DEP-0454).
   - Affectation au dépanneur couvrant cette zone (DEP-0448).

### Validation

- Le numéro doit être affiché publiquement sur le site web, l'application mobile et les supports de communication du dépanneur.
- Le numéro doit être facilement mémorisable (privilégier un numéro avec répétition de chiffres si disponible).

---

## DEP-0444 — Réservation d'un numéro de test

### Objectif

Réserver un numéro de téléphone dédié aux tests de développement et d'intégration, avant le déploiement en production.

### Action

1. **Créer un compte Twilio** (si pas déjà fait).
2. **Acheter un numéro de téléphone français** via la console Twilio :
   - Type : numéro local (géographique).
   - Capacités requises : Voice (appels entrants).
   - Exemple de recherche : numéros disponibles en région parisienne (+33 1 XX XX XX XX).
3. **Configurer le webhook Twilio** :
   - URL du webhook : `https://api.depanneur.example.com/telephony/incoming` (à ajuster selon environnement).
   - Méthode HTTP : `POST`.
4. **Tester l'appel entrant** :
   - Appeler le numéro depuis un téléphone mobile.
   - Vérifier que le webhook backend est bien déclenché.
   - Vérifier que l'agent vocal répond avec la phrase de salutation (DEP-0451).

### Numéro de test

| Environnement | Numéro                  | Statut       |
| ------------- | ----------------------- | ------------ |
| Développement | (à réserver via Twilio) | À faire      |
| Test          | (à réserver via Twilio) | À faire      |
| Production    | (à réserver selon zone) | Non commencé |

### Règles de test

- Le numéro de test ne doit **jamais** être communiqué publiquement.
- Le numéro de test ne doit **pas** créer de vraies commandes en production (environnement isolé).
- Le numéro de test doit être désactivé ou supprimé une fois les tests validés en pré-production.

---

## DEP-0445 — Flux d'appel entrant principal

### Objectif

Définir le flux nominal d'un appel entrant lorsque le dépanneur est ouvert, le système est disponible, la zone est desservie, et que tout fonctionne correctement.

### Étapes du flux

| Étape | Description                                                               | Phrase utilisée           |
| ----- | ------------------------------------------------------------------------- | ------------------------- |
| 1     | Le client compose le numéro depaneurIA                                    | —                         |
| 2     | Twilio reçoit l'appel et appelle le webhook backend                       | —                         |
| 3     | Le backend vérifie les conditions : horaires, disponibilité système, zone | —                         |
| 4     | Si tout est OK → connexion WebSocket avec OpenAI Realtime API             | —                         |
| 5     | L'agent vocal salue le client                                             | DEP-0451                  |
| 6     | Vérification si le client est connu (reconnaissance du numéro appelant)   | —                         |
| 7a    | Si client connu → accueil personnalisé (DEP-0449)                         | DEP-0449                  |
| 7b    | Si client inconnu → collecte des informations (DEP-0450)                  | DEP-0450                  |
| 8     | Collecte du nom (si inconnu)                                              | DEP-0452                  |
| 9     | Collecte du numéro (si inconnu ou non détecté)                            | DEP-0453                  |
| 10    | Collecte de l'adresse de livraison                                        | DEP-0454                  |
| 11    | Validation de la zone de livraison                                        | —                         |
| 12    | Collecte de la commande (produits souhaités)                              | DEP-0455                  |
| 13    | Clarification si produit ambigu ou non trouvé                             | DEP-0456                  |
| 14    | Confirmation du panier (lecture des produits ajoutés)                     | DEP-0457 (hors périmètre) |
| 15    | Confirmation de l'adresse de livraison                                    | DEP-0458 (hors périmètre) |
| 16    | Fin de l'appel et confirmation de la prise en charge                      | DEP-0459 (hors périmètre) |

### Diagramme de flux (simplifié)

```
Appel entrant
    ↓
Conditions OK ? (ouvert, disponible, zone desservie)
    ↓ oui
Salutation (DEP-0451)
    ↓
Client connu ? (caller ID)
    ↓ oui → Flux DEP-0449
    ↓ non → Flux DEP-0450
        ↓
    Collecte nom (DEP-0452)
    Collecte numéro (DEP-0453)
    Collecte adresse (DEP-0454)
        ↓
    Collecte commande (DEP-0455)
        ↓
    Clarification si nécessaire (DEP-0456)
        ↓
    Fin de l'appel (hors périmètre DEP-0441–0456)
```

### Règles

- Le flux principal suppose que toutes les conditions sont remplies (ouvert, disponible, zone OK).
- Si une condition échoue, le flux bascule vers les flux d'exception (DEP-0446, DEP-0447, DEP-0448).
- Le flux est interruptible : le client peut raccrocher à tout moment.

---

## DEP-0446 — Flux d'appel si le dépanneur est fermé

### Objectif

Définir le flux d'appel lorsque l'appel est reçu en dehors des horaires d'ouverture du dépanneur.

### Conditions de déclenchement

- L'heure de l'appel est en dehors des horaires d'ouverture configurés pour le dépanneur concerné.
- Les horaires sont stockés dans la base de données tenant (horaires hebdomadaires configurables).

### Flux

| Étape | Description                                               | Phrase utilisée                                                                                                                                                                        |
| ----- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Le client compose le numéro depaneurIA                    | —                                                                                                                                                                                      |
| 2     | Twilio reçoit l'appel et appelle le webhook backend       | —                                                                                                                                                                                      |
| 3     | Le backend vérifie les horaires → statut = fermé          | —                                                                                                                                                                                      |
| 4     | L'agent vocal annonce la fermeture et propose de rappeler | « Bonjour ! Nous sommes actuellement fermés. Nos horaires d'ouverture sont [horaires]. Vous pouvez rappeler à ce moment, ou passer commande sur notre site web. Merci et à bientôt ! » |
| 5     | Fin de l'appel                                            | —                                                                                                                                                                                      |

### Règles

- Le message doit indiquer clairement les horaires d'ouverture du dépanneur.
- Le message doit proposer une alternative (site web, application mobile).
- Le message doit être chaleureux et non robotique.
- Durée maximale du message : 15 secondes.

### Exemple de phrase

« Bonjour ! Nous sommes actuellement fermés. Nous ouvrons de 9h à 20h du lundi au samedi. Vous pouvez rappeler à ce moment, ou passer commande sur notre site depanneur.example.com. Merci et à bientôt ! »

---

## DEP-0447 — Flux d'appel si le système est indisponible

### Objectif

Définir le flux d'appel lorsque le backend depaneurIA ou l'API d'IA conversationnelle est temporairement indisponible.

### Conditions de déclenchement

- Le webhook backend ne répond pas (timeout, erreur 500, erreur de connexion).
- L'OpenAI Realtime API est indisponible ou retourne une erreur fatale.
- La connexion WebSocket échoue après plusieurs tentatives.

### Flux

| Étape | Description                                           | Phrase utilisée                                                                                                                                                                           |
| ----- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Le client compose le numéro depaneurIA                | —                                                                                                                                                                                         |
| 2     | Twilio reçoit l'appel et appelle le webhook backend   | —                                                                                                                                                                                         |
| 3     | Le backend ou l'IA conversationnelle est indisponible | —                                                                                                                                                                                         |
| 4     | Twilio joue un message enregistré (fallback)          | « Bonjour ! Notre service téléphonique est temporairement indisponible. Veuillez réessayer dans quelques instants, ou passez commande sur notre site web. Merci de votre compréhension. » |
| 5     | Fin de l'appel                                        | —                                                                                                                                                                                         |

### Règles

- Le message doit être un fichier audio pré-enregistré (format MP3 ou WAV), hébergé sur un CDN ou stockage Twilio.
- Le message doit être bref (max 10 secondes).
- Le message doit proposer une alternative immédiate (site web).
- Une alerte doit être envoyée à l'équipe technique en cas d'indisponibilité prolongée (> 5 minutes).

### Exemple de phrase enregistrée

« Bonjour ! Notre service téléphonique est temporairement indisponible. Veuillez réessayer dans quelques instants, ou passez commande sur notre site depanneur.example.com. Merci de votre compréhension. »

---

## DEP-0448 — Flux d'appel si la zone n'est pas desservie

### Objectif

Définir le flux d'appel lorsque l'adresse de livraison fournie par le client n'est pas couverte par le dépanneur.

### Conditions de déclenchement

- Le client a fourni une adresse complète (DEP-0454).
- Le backend a vérifié la zone de livraison (table `delivery_zones` ou équivalent).
- La zone de livraison n'est pas couverte par le dépanneur.

### Flux

| Étape | Description                                                                 | Phrase utilisée                                                                                                                                                                         |
| ----- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | L'agent vocal a collecté l'adresse de livraison (DEP-0454)                  | —                                                                                                                                                                                       |
| 2     | Le backend vérifie la zone → statut = non desservie                         | —                                                                                                                                                                                       |
| 3     | L'agent vocal informe le client que la zone n'est pas couverte              | « Je suis désolé, nous ne livrons pas encore à cette adresse. Nos zones de livraison sont [liste ou description]. Souhaitez-vous être informé lorsque nous couvrirons votre secteur ? » |
| 4a    | Si le client dit oui → collecte du numéro ou email pour notification future | « Parfait ! Laissez-moi votre numéro ou email, et nous vous contacterons dès que possible. »                                                                                            |
| 4b    | Si le client dit non → fin de l'appel                                       | « Pas de problème. Merci de votre appel et à bientôt ! »                                                                                                                                |
| 5     | Fin de l'appel                                                              | —                                                                                                                                                                                       |

### Règles

- Le message doit être empathique et proposer une solution future (notification).
- Si le client accepte d'être informé, l'information est enregistrée dans une table `zone_expansion_requests` pour suivi commercial.
- Le message doit indiquer clairement les zones actuellement couvertes (exemple : « Nous livrons actuellement dans un rayon de 5 km autour du centre-ville »).

### Exemple de phrase

« Je suis désolé, nous ne livrons pas encore à cette adresse. Actuellement, nous couvrons un rayon de 5 km autour du centre-ville. Souhaitez-vous être informé lorsque nous élargirons nos zones de livraison ? »

---

## DEP-0449 — Flux d'appel si le client est déjà connu

### Objectif

Définir le flux d'appel lorsque le système reconnaît le numéro de téléphone appelant comme appartenant à un client déjà inscrit.

### Conditions de déclenchement

- Le `caller_id` (numéro appelant) fourni par Twilio correspond à un enregistrement dans la table `clients`.
- Le client a déjà passé au moins une commande ou s'est déjà inscrit.

### Flux

| Étape | Description                                                                   | Phrase utilisée                                                                             |
| ----- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1     | Le backend vérifie le `caller_id` → client trouvé                             | —                                                                                           |
| 2     | L'agent vocal salue le client par son prénom                                  | « Bonjour [Prénom] ! Ravi de vous retrouver. Que puis-je préparer pour vous aujourd'hui ? » |
| 3     | Proposition de réutiliser la dernière adresse de livraison                    | « Souhaitez-vous qu'on livre à [dernière adresse connue] ? »                                |
| 4a    | Si le client dit oui → adresse confirmée, passer à la collecte de commande    | DEP-0455                                                                                    |
| 4b    | Si le client dit non ou propose une autre adresse → collecte nouvelle adresse | DEP-0454                                                                                    |
| 5     | Collecte de la commande                                                       | DEP-0455                                                                                    |

### Règles

- La personnalisation (prénom) est optionnelle si le client n'a pas fourni de prénom lors de l'inscription.
- L'agent vocal ne doit **jamais** lire le nom de famille complet par téléphone (protection de la vie privée).
- Si plusieurs adresses sont enregistrées, l'agent propose la dernière utilisée (champ `last_used_at` ou équivalent).
- Le client peut toujours corriger ou fournir une nouvelle adresse.

### Exemple de phrase

« Bonjour Marie ! Ravi de vous retrouver. Que puis-je préparer pour vous aujourd'hui ? Souhaitez-vous qu'on livre à votre adresse habituelle, 12 rue de la Paix ? »

---

## DEP-0450 — Flux d'appel si le client est inconnu

### Objectif

Définir le flux d'appel lorsque le système ne reconnaît pas le numéro de téléphone appelant et que le client doit s'identifier.

### Conditions de déclenchement

- Le `caller_id` (numéro appelant) fourni par Twilio ne correspond à aucun enregistrement dans la table `clients`.
- Ou le `caller_id` est masqué ou invalide.

### Flux

| Étape | Description                                                                                                             | Phrase utilisée |
| ----- | ----------------------------------------------------------------------------------------------------------------------- | --------------- |
| 1     | Le backend vérifie le `caller_id` → client non trouvé                                                                   | —               |
| 2     | L'agent vocal demande le nom du client                                                                                  | DEP-0452        |
| 3     | L'agent vocal demande le numéro de téléphone (pour confirmation)                                                        | DEP-0453        |
| 4     | L'agent vocal demande l'adresse de livraison                                                                            | DEP-0454        |
| 5     | Le backend crée un nouvel enregistrement client (ou met à jour si le numéro correspond finalement à un client existant) | —               |
| 6     | Collecte de la commande                                                                                                 | DEP-0455        |

### Règles

- L'inscription au téléphone doit être **minimale** : uniquement nom, numéro, adresse (pas de mot de passe).
- Le client recevra un SMS de confirmation après la commande avec un lien pour compléter son profil sur le web.
- Si le client refuse de donner son nom ou son adresse, l'agent vocal explique que ces informations sont nécessaires pour la livraison et propose de basculer sur le site web.

### Exemple de phrase d'introduction

« Bonjour ! Bienvenue chez depaneurIA. Pour préparer votre commande, j'ai besoin de quelques informations. Comment vous appelez-vous ? »

---

## DEP-0451 — Phrase de salutation téléphonique

### Objectif

Définir la phrase de salutation standard utilisée par l'agent vocal téléphonique au début de chaque appel.

### Phrase canonique

```
« Bonjour ! Vous êtes bien chez [Nom du dépanneur]. Je suis votre assistant vocal. Comment puis-je vous aider aujourd'hui ? »
```

### Variantes selon contexte

| Contexte                       | Phrase                                                                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Appel nominal (client inconnu) | « Bonjour ! Vous êtes bien chez [Nom du dépanneur]. Je suis votre assistant vocal. Comment puis-je vous aider aujourd'hui ? » |
| Appel nominal (client connu)   | « Bonjour [Prénom] ! Vous êtes bien chez [Nom du dépanneur]. Que puis-je préparer pour vous aujourd'hui ? »                   |
| Appel hors horaires            | « Bonjour ! Nous sommes actuellement fermés. » (suite en DEP-0446)                                                            |
| Appel système indisponible     | « Bonjour ! Notre service téléphonique est temporairement indisponible. » (suite en DEP-0447)                                 |

### Règles de ton

- **Chaleureux et accessible** : l'agent vocal doit donner l'impression d'être un humain accueillant.
- **Bref et direct** : pas de formule trop longue (max 10 secondes).
- **Personnalisé si possible** : utiliser le prénom du client si connu (DEP-0449).
- **Nom du dépanneur** : toujours mentionner le nom du dépanneur pour rassurer le client qu'il a composé le bon numéro.

### Exemple concret

« Bonjour ! Vous êtes bien chez Dépann'Express. Je suis votre assistant vocal. Comment puis-je vous aider aujourd'hui ? »

---

## DEP-0452 — Phrase de collecte du nom

### Objectif

Définir la phrase utilisée par l'agent vocal pour demander le nom du client lorsqu'il n'est pas connu.

### Phrase canonique

```
« Pour commencer, comment vous appelez-vous ? »
```

### Variantes

| Contexte                   | Phrase                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------- |
| Première demande           | « Pour commencer, comment vous appelez-vous ? »                                       |
| Répétition (non compris)   | « Pardon, je n'ai pas bien compris. Pouvez-vous répéter votre nom s'il vous plaît ? » |
| Clarification (nom ambigu) | « J'ai noté [nom compris]. C'est bien ça ? »                                          |

### Règles de collecte

- L'agent vocal doit accepter **prénom seul** ou **prénom + nom** (au choix du client).
- Si le client ne donne que le prénom → OK, on enregistre le prénom uniquement.
- Si le client donne prénom + nom → on enregistre les deux.
- L'agent vocal ne doit **jamais** forcer le client à donner son nom de famille s'il ne le souhaite pas.
- Si le client refuse de donner son nom → l'agent explique que c'est nécessaire pour la livraison et propose de basculer sur le site web.

### Traitement de la réponse

- La réponse est transcrite par l'IA conversationnelle (OpenAI Realtime API ou équivalent).
- Le backend extrait le nom du client de la transcription.
- Le nom est stocké dans le champ `first_name` (et éventuellement `last_name` si fourni).

### Exemple d'échange

**Agent** : « Pour commencer, comment vous appelez-vous ? »
**Client** : « Marie. »
**Agent** : « Parfait Marie ! »

ou

**Agent** : « Pour commencer, comment vous appelez-vous ? »
**Client** : « Pierre Dupont. »
**Agent** : « Très bien Pierre ! »

---

## DEP-0453 — Phrase de collecte du numéro

### Objectif

Définir la phrase utilisée par l'agent vocal pour demander ou confirmer le numéro de téléphone du client.

### Phrase canonique

```
« Quel est votre numéro de téléphone ? »
```

### Variantes

| Contexte                            | Phrase                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Demande initiale (caller_id masqué) | « Quel est votre numéro de téléphone ? »                                                                      |
| Confirmation (caller_id détecté)    | « Je vois que vous m'appelez du [numéro détecté]. C'est bien ce numéro que je dois noter ? »                  |
| Répétition (non compris)            | « Pardon, je n'ai pas bien compris. Pouvez-vous répéter votre numéro s'il vous plaît, chiffre par chiffre ? » |
| Clarification (numéro ambigu)       | « J'ai noté [numéro répété]. C'est bien ça ? »                                                                |

### Règles de collecte

- Si le `caller_id` est disponible et valide → l'agent vocal propose de confirmer ce numéro au lieu de le redemander.
- Si le `caller_id` est masqué ou invalide → l'agent vocal demande explicitement le numéro.
- Le numéro doit être dicté **chiffre par chiffre** ou **par paires de chiffres** pour réduire les erreurs de reconnaissance.
- Le numéro est validé côté backend selon le format français (+33 ou 0X XX XX XX XX).

### Traitement de la réponse

- La transcription du numéro est convertie en format numérique standardisé.
- Exemple de conversion :
  - « zéro six vingt-trois quarante-cinq soixante-sept quatre-vingt-neuf » → `06 23 45 67 89` → `+33623456789`
- Le backend valide le format et l'unicité du numéro (pas de doublon avec un autre client).

### Exemple d'échange

**Agent** : « Quel est votre numéro de téléphone ? »
**Client** : « Zéro six vingt-trois quarante-cinq soixante-sept quatre-vingt-neuf. »
**Agent** : « Parfait, j'ai noté le zéro six vingt-trois quarante-cinq soixante-sept quatre-vingt-neuf. »

ou

**Agent** : « Je vois que vous m'appelez du zéro six vingt-trois quarante-cinq soixante-sept quatre-vingt-neuf. C'est bien ce numéro que je dois noter ? »
**Client** : « Oui, c'est ça. »
**Agent** : « Parfait ! »

---

## DEP-0454 — Phrase de collecte de l'adresse

### Objectif

Définir la phrase utilisée par l'agent vocal pour demander l'adresse de livraison du client.

### Phrase canonique

```
« Quelle est votre adresse de livraison ? »
```

### Variantes

| Contexte                          | Phrase                                                                              |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| Demande initiale (client inconnu) | « Quelle est votre adresse de livraison ? »                                         |
| Confirmation (client connu)       | « Souhaitez-vous qu'on livre à votre adresse habituelle, [dernière adresse] ? »     |
| Répétition (non compris)          | « Pardon, je n'ai pas bien compris. Pouvez-vous répéter votre adresse lentement ? » |
| Clarification (adresse ambiguë)   | « J'ai noté [adresse répétée]. C'est bien ça ? »                                    |
| Précision (adresse incomplète)    | « D'accord, et quel est le code postal ? » ou « Quel est le numéro de rue ? »       |

### Règles de collecte

- L'adresse doit contenir au minimum : **numéro de rue**, **nom de rue**, **code postal**, **ville**.
- Si l'adresse est incomplète, l'agent vocal pose des questions de précision successives.
- Si le client donne une adresse trop vague (« Rue de la Paix »), l'agent demande la ville et le code postal.
- L'adresse est validée côté backend avec un service de géocodage (Google Maps API, OpenStreetMap Nominatim ou équivalent).
- Si l'adresse n'est pas trouvée → l'agent demande de clarifier (DEP-0456 ou équivalent).

### Traitement de la réponse

- La transcription de l'adresse est convertie en format structuré (numéro, rue, code postal, ville).
- Le backend valide la zone de livraison (DEP-0448).
- Si la zone n'est pas couverte → flux DEP-0448.
- L'adresse est stockée dans la table `addresses` (ou équivalent) et liée au client.

### Exemple d'échange

**Agent** : « Quelle est votre adresse de livraison ? »
**Client** : « Douze rue de la Paix à Paris. »
**Agent** : « D'accord, et quel est le code postal ? »
**Client** : « Soixante-quinze mille deux. »
**Agent** : « Parfait, j'ai noté 12 rue de la Paix, 75002 Paris. »

ou

**Agent** : « Souhaitez-vous qu'on livre à votre adresse habituelle, 12 rue de la Paix à Paris ? »
**Client** : « Oui, c'est ça. »
**Agent** : « Très bien ! »

---

## DEP-0455 — Phrase de collecte de la commande

### Objectif

Définir la phrase utilisée par l'agent vocal pour demander au client quels produits il souhaite commander.

### Phrase canonique

```
« Que souhaitez-vous commander aujourd'hui ? »
```

### Variantes

| Contexte                         | Phrase                                                             |
| -------------------------------- | ------------------------------------------------------------------ |
| Demande initiale                 | « Que souhaitez-vous commander aujourd'hui ? »                     |
| Ajout après premier produit      | « Autre chose ? »                                                  |
| Clarification produit non trouvé | (voir DEP-0456)                                                    |
| Confirmation panier vide         | « Vous n'avez rien commandé pour le moment. Que souhaitez-vous ? » |

### Règles de collecte

- Le client peut dicter un ou plusieurs produits en une seule phrase.
- Exemple : « Je voudrais un Pepsi et deux paquets de chips. »
- L'agent vocal extrait les produits et les quantités de la transcription.
- Si un produit est ambigu ou non trouvé → basculer vers DEP-0456.
- Si la quantité n'est pas précisée → quantité = 1 par défaut.

### Traitement de la réponse

- La transcription est analysée par l'IA conversationnelle pour extraire :
  - Les noms de produits (correspondance avec le catalogue depaneurIA).
  - Les quantités (si exprimées).
  - Les variantes (si exprimées : « Pepsi cerise », « chips saveur barbecue »).
- Le backend interroge le catalogue pour valider l'existence et la disponibilité des produits.
- Si un produit est trouvé → ajout au panier (DEP-0362 équivalent téléphonique).
- Si un produit est ambigu → clarification (DEP-0456).
- Si un produit n'existe pas → refus (DEP-0370 équivalent téléphonique).

### Exemple d'échange

**Agent** : « Que souhaitez-vous commander aujourd'hui ? »
**Client** : « Je voudrais un Pepsi et deux paquets de chips ketchup. »
**Agent** : « Très bien, j'ajoute un Pepsi et deux paquets de chips saveur ketchup. Autre chose ? »
**Client** : « Non, c'est tout. »
**Agent** : « Parfait ! » (puis passer à la confirmation du panier, hors périmètre DEP-0441–0456)

---

## DEP-0456 — Phrase de clarification de produits téléphonique

### Objectif

Définir la phrase utilisée par l'agent vocal pour clarifier un produit ambigu, mal compris ou non trouvé dans le catalogue.

### Phrase canonique (produit non trouvé)

```
« Je suis désolé, je ne trouve pas ce produit dans notre catalogue. Pouvez-vous préciser ? »
```

### Phrase canonique (produit ambigu)

```
« J'ai trouvé plusieurs produits. Souhaitez-vous [option 1] ou [option 2] ? »
```

### Variantes

| Contexte                    | Phrase                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| Produit non trouvé          | « Je suis désolé, je ne trouve pas ce produit. Pouvez-vous me donner un autre nom ou une marque ? » |
| Produit ambigu (2 options)  | « J'ai trouvé [option 1] et [option 2]. Lequel souhaitez-vous ? »                                   |
| Produit ambigu (3+ options) | « J'ai trouvé plusieurs produits : [option 1], [option 2], [option 3]. Lequel préférez-vous ? »     |
| Quantité ambiguë            | « Combien en voulez-vous ? »                                                                        |
| Variante ambiguë            | « Quel format souhaitez-vous : [format 1] ou [format 2] ? »                                         |
| Mauvaise compréhension      | « Pardon, je n'ai pas bien compris. Pouvez-vous répéter plus lentement ? »                          |

### Règles de clarification

- L'agent vocal propose **au maximum 3 options** en même temps (au-delà, trop difficile à mémoriser).
- Si plus de 3 options → l'agent vocal demande une précision supplémentaire (marque, catégorie, format).
- Le client peut répondre par le numéro de l'option (« La première », « Le deux ») ou par le nom complet.
- Si le client ne parvient pas à clarifier après 3 tentatives → l'agent propose de basculer sur le site web ou de passer à un autre produit.

### Traitement de la réponse

- La réponse du client est re-transcrite et comparée aux options proposées.
- Si correspondance unique → ajout au panier.
- Si correspondance ambiguë → nouvelle clarification.
- Si aucune correspondance → refus produit non trouvé (DEP-0370 équivalent téléphonique).

### Exemple d'échange (produit ambigu)

**Agent** : « Que souhaitez-vous commander ? »
**Client** : « Des chips. »
**Agent** : « J'ai trouvé plusieurs chips : chips Lay's saveur nature, chips Pringles original, chips Doritos nacho. Lesquelles préférez-vous ? »
**Client** : « Les Lay's. »
**Agent** : « Parfait, j'ajoute un paquet de chips Lay's saveur nature. Autre chose ? »

### Exemple d'échange (produit non trouvé)

**Agent** : « Que souhaitez-vous commander ? »
**Client** : « Un pack de bière Heineken. »
**Agent** : « Je suis désolé, nous ne vendons pas de bière pour le moment. Souhaitez-vous autre chose ? »
**Client** : « Non, merci. »
**Agent** : « Pas de problème. Merci de votre appel ! »

---

## Résumé des DEP-0441 à DEP-0456

| DEP      | Titre                                            | Type              |
| -------- | ------------------------------------------------ | ----------------- |
| DEP-0441 | Rôle précis de l'agent vocal téléphonique        | Définition        |
| DEP-0442 | Solution téléphonique cloud principale           | Choix technique   |
| DEP-0443 | Fournisseur de numéro téléphonique principal     | Choix technique   |
| DEP-0444 | Réservation d'un numéro de test                  | Action            |
| DEP-0445 | Flux d'appel entrant principal                   | Flux nominal      |
| DEP-0446 | Flux d'appel si le dépanneur est fermé           | Flux d'exception  |
| DEP-0447 | Flux d'appel si le système est indisponible      | Flux d'exception  |
| DEP-0448 | Flux d'appel si la zone n'est pas desservie      | Flux d'exception  |
| DEP-0449 | Flux d'appel si le client est déjà connu         | Flux personnalisé |
| DEP-0450 | Flux d'appel si le client est inconnu            | Flux inscription  |
| DEP-0451 | Phrase de salutation téléphonique                | Phrase système    |
| DEP-0452 | Phrase de collecte du nom                        | Phrase système    |
| DEP-0453 | Phrase de collecte du numéro                     | Phrase système    |
| DEP-0454 | Phrase de collecte de l'adresse                  | Phrase système    |
| DEP-0455 | Phrase de collecte de la commande                | Phrase système    |
| DEP-0456 | Phrase de clarification de produits téléphonique | Phrase système    |

---

## Validation finale

### Critères de validation

- [ ] Le rôle de l'agent vocal téléphonique est clairement défini (DEP-0441).
- [ ] La solution technique cloud est choisie et documentée (DEP-0442).
- [ ] Le fournisseur de numéros téléphoniques est identifié (DEP-0443).
- [ ] La procédure de réservation d'un numéro de test est décrite (DEP-0444).
- [ ] Le flux d'appel entrant principal est défini avec toutes les étapes (DEP-0445).
- [ ] Les flux d'exception (fermé, indisponible, zone non desservie) sont documentés (DEP-0446, DEP-0447, DEP-0448).
- [ ] Les flux client connu / client inconnu sont définis (DEP-0449, DEP-0450).
- [ ] Toutes les phrases système sont définies : salutation, collecte nom/numéro/adresse/commande, clarification (DEP-0451 à DEP-0456).
- [ ] Les phrases respectent un ton chaleureux, direct et accessible.
- [ ] Les phrases sont courtes (max 2 phrases ou 15 secondes).
- [ ] Les règles de collecte et de traitement des réponses sont définies pour chaque étape.

### Prochaines étapes (hors périmètre DEP-0441–0456)

- **DEP-0457 à DEP-0480** : phrases de confirmation panier/livraison, fin d'appel, logiques de répétition, désambiguïsation, création de commande, APIs backend, tests de bout en bout, gel du flux téléphonique V1.

---

## Gel de la spécification

**Date** : 2026-03-13
**Statut** : Spécification complète DEP-0441 à DEP-0456 ✅
**Auteur** : Documentation depaneurIA
**Prochaine révision** : après implémentation et tests utilisateurs (post-DEP-0480)
