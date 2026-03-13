# DEP-0695 à DEP-0714 — Traductions et conventions multilingues

## Périmètre

Ce document fixe les conventions de traduction et les mécanismes de sélection de
langue pour la V1 entre le français (`fr`) et l'anglais (`en`), en s'appuyant sur
les règles de base définies en DEP-0681 à DEP-0694 (langues supportées, langue
par défaut, clés de traduction). Il couvre :

- les contenus traduisibles du catalogue (produits, synonymes), des assistants
  texte et voix, et des prompts téléphoniques ;
- les fichiers de traduction `fr` et `en` (structure et exigences) ;
- les mécanismes de sélection de langue front, back, assistants texte/voix et
  téléphone ;
- la traduction des écrans principaux (client, dépanneur, livreur) et des
  messages système, erreurs, confirmations, états et données de démonstration.

Il s'agit exclusivement de **documentation** : aucun code produit, aucun fichier
hors de ce document.

---

## DEP-0695 — Convention des produits traduisibles

### Objectif

Définir comment les produits du catalogue stockent et affichent leurs
traductions selon la langue active.

### Structure d'un produit traduisible

| Champ                    | Type   | Description                                                  |
|--------------------------|--------|--------------------------------------------------------------|
| `product_id`             | UUID   | Identifiant du produit                                       |
| `tenant_id`              | UUID   | Identifiant du tenant                                        |
| `default_name`           | string | Nom dans la langue par défaut du tenant (obligatoire)        |
| `default_description`    | string | Description courte dans la langue par défaut (optionnelle)   |
| `translations`           | objet  | Clé = code langue, valeur = bloc de champs traduits          |
| `translations[lang].name`| string | Nom traduit                                                  |
| `translations[lang].description` | string | Description courte traduite                      |
| `translations[lang].long_description` | string | Description longue traduite (optionnelle) |
| `translations[lang].unit_label` | string | Libellé d'unité/conditionnement traduit (optionnel) |

### Règles d'affichage

| Situation                                              | Texte affiché                                       |
|--------------------------------------------------------|-----------------------------------------------------|
| Traduction disponible pour la langue active            | Valeur traduite (`name`, `description`, etc.)       |
| Traduction absente pour la langue active               | Valeur `default_*`                                  |
| Champ traduit vide mais langue active = langue défaut  | Valeur `default_*`                                  |
| Ajout d'une nouvelle langue                            | Requiert un bloc complet dans `translations[lang]`  |

### Règles

- Le bloc `translations.fr` est obligatoire ; `translations.en` est requis si le
  tenant active l'anglais (DEP-0688).
- Aucun texte produit ne doit rester codé en dur : toute valeur affichée passe
  par les champs ci-dessus et suit les clés de traduction DEP-0692.
- Pas de traduction automatique en V1 : les contenus sont saisis/validés par le
  tenant ou l'équipe contenu.

---

## DEP-0696 — Convention des synonymes par langue

### Objectif

Définir comment les synonymes catalogue sont stockés et consommés par langue et
par canal.

### Structure des synonymes

```
synonyms: {
  search:    { "fr": string[], "en": string[] },
  assistant: { "fr": string[], "en": string[] },   // assistant texte
  phone:     { "fr": string[], "en": string[] }    // agent vocal téléphonique
}
```

### Règles

- Volumétrie (par langue) : `search` 5–15 entrées produit (DEP-0256),
  `assistant` 5–20 (synonymes parlés), `phone` 8–25 (synonymes téléphoniques).
- Normalisation : minuscules, sans ponctuation superflue, pas de doublons entre
  langues ; une entrée = une expression complète.
- Fallback : si `synonyms[canal][lang]` est vide, le moteur utilise la langue
  par défaut du tenant.
- Cohérence : un synonyme ne doit pas pointer vers deux produits distincts dans
  une même langue.

---

## DEP-0697 — Convention des prompts de l’assistant par langue

### Objectif

Standardiser les prompts (messages système) de l'assistant texte dans chaque
langue supportée.

### Format

- Clés sous `assistant.prompt.*` (ex. `assistant.prompt.welcome`,
  `assistant.prompt.ask_clarification`) conformément à DEP-0692.
- Valeur `fr` obligatoire ; valeur `en` requise si l'anglais est activé.
- Les prompts sont rédigés dans le ton défini par DEP-0361–DEP-0380 (assistant
  texte) et adaptés culturellement.

### Règles

- Le modèle d'IA reçoit le prompt déjà dans la langue active ; aucune traduction
  runtime côté LLM.
- Si la langue change en cours de session, les prochains prompts système
  utilisent la nouvelle langue sans réécrire l'historique.

---

## DEP-0698 — Convention des phrases téléphoniques par langue

### Objectif

Définir la gestion multilingue des phrases canoniques de l'agent vocal
téléphonique.

### Format

- Clés sous `voice.call.*` alignées avec les scripts DEP-0441–DEP-0456
  (ex. `voice.call.greeting`, `voice.call.collect_name`).
- En V1, seul le bloc `fr` est requis (le téléphone vocal en anglais est V2+,
  DEP-0681). Les traductions `en` peuvent être préparées mais ne sont pas
  exposées.

### Règles

- Les prompts téléphoniques sont écrits pour synthèse vocale (phrases courtes,
  claires, sans jargon) et validés par tenant.
- Locales TTS/ASR associées : `fr` → `fr-CA` (ou `fr-FR` fallback), `en` →
  `en-US` (V2+).
- Un appel se déroule intégralement dans la langue configurée pour le tenant
  (DEP-0687) ; aucun mélange de langues dans un même appel.

---

## DEP-0699 — Fichier de traduction français

### Objectif

Définir le fichier de référence `fr` qui porte toutes les clés de traduction de
la plateforme.

### Exigences

| Élément                 | Règle                                                                |
|-------------------------|----------------------------------------------------------------------|
| Format                  | JSON plat ou YAML équivalent, clés `domaine.contexte.element`       |
| Couverture              | 100% des clés utilisées en front, back, assistants, téléphonie       |
| Validation              | Lint de clés : aucun doublon, aucune clé orpheline                   |
| Fallback                | Sert de source de vérité pour toute autre langue                     |
| Métadonnées suggérées   | `language: "fr"`, `updated_at`, `maintainer`                         |

### Règles

- Toute nouvelle clé est ajoutée en `fr` d'abord, puis propagée aux autres
  langues.
- Les valeurs doivent respecter les conventions de style (ponctuation, casse)
  des écrans cibles.

---

## DEP-0700 — Fichier de traduction anglais

### Objectif

Définir le fichier `en` aligné sur la base `fr`.

### Exigences

| Élément               | Règle                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| Format                | Identique au fichier `fr`                                             |
| Couverture minimale   | Clés visibles pour tout tenant qui active l'anglais                   |
| Fallback              | Si une clé manque, le front/back affiche la valeur `fr`               |
| Validation            | Script de vérification de clés manquantes comparé au fichier `fr`     |

### Règles

- Traduction humaine, pas de machine translation brute.
- Les unités et valeurs chiffrées respectent les usages anglais (`.` décimal,
  symbole de devise placé avant si affiché).

---

## DEP-0701 — Mécanisme de sélection de langue dans le front

### Objectif

Définir comment le front (client, dépanneur, livreur) choisit et applique la
langue d'affichage.

### Logique

1. Au chargement, le front lit la préférence compte (si connecté) puis le
   stockage local (`preferred_language`, DEP-0690), sinon la langue par défaut
   du tenant (DEP-0688).
2. Il vérifie que la langue est activée pour le tenant ; sinon, fallback vers la
   langue par défaut du tenant.
3. L'i18n provider est initialisé avec cette langue et le bundle correspondant
   (`fr` ou `en`).
4. Un sélecteur permet de changer la langue sans rechargement (DEP-0684/0685/0686).
5. Le choix est persisté (compte ou stockage local) et propagé aux appels API
   via un en-tête `X-Language` ou équivalent.

### Règles

- Le changement de langue ne doit pas vider le panier ni la conversation
  assistée en cours (états conservés).
- Seules les langues activées par le tenant sont proposées.

---

## DEP-0702 — Mécanisme de sélection de langue dans le back

### Objectif

Définir comment les services back déterminent la langue des réponses.

### Logique

| Priorité | Source                                | Usage                                    |
|----------|---------------------------------------|------------------------------------------|
| 1        | En-tête explicite (`X-Language`)      | Force la langue si activée pour le tenant |
| 2        | Langue préférée du compte             | Récupérée depuis le profil (DEP-0689)    |
| 3        | Langue mémorisée navigateur           | Transmise par le front (DEP-0690)        |
| 4        | Langue par défaut du tenant           | DEP-0688                                 |
| 5        | Langue par défaut plateforme (`fr`)   | DEP-0682                                 |

### Règles

- Les réponses incluent `Content-Language` et les langues disponibles
  (`Available-Languages`) pour le tenant.
- Les erreurs, confirmations et messages système utilisent les fichiers de
  traduction correspondants (DEP-0699/0700).
- Les logs back restent en `fr` (traçabilité), indépendamment de la langue de
  réponse.

---

## DEP-0703 — Mécanisme de sélection de langue pour l’assistant texte

### Objectif

Assurer que l'assistant texte interagit dans la langue choisie par l'utilisateur
ou imposée par le tenant.

### Logique

| Étape | Comportement                                                                |
|-------|-----------------------------------------------------------------------------|
| 1     | La session d'assistant récupère la langue active du front (DEP-0701).      |
| 2     | Les prompts système (DEP-0697) et les réponses de l'IA sont générés dans cette langue. |
| 3     | Chaque message est stocké avec son code langue (`message.lang`).            |
| 4     | Si l'utilisateur change de langue, les nouveaux messages suivent la nouvelle langue sans traduire l'historique. |

### Règles

- Le modèle d'IA reçoit une instruction explicite de répondre dans la langue
  active ; aucune auto-détection.
- Les synonymes assistant (DEP-0696) sont filtrés par langue active puis par
  fallback tenant.

---

## DEP-0704 — Mécanisme de sélection de langue pour l’assistant voix web

### Objectif

Définir comment la langue est appliquée pour la reconnaissance et la synthèse
vocale sur le web.

### Logique

| Étape | Comportement                                                           |
|-------|------------------------------------------------------------------------|
| 1     | La langue active du front (DEP-0701) configure STT/TTS (`fr` → `fr-CA`, `en` → `en-US`). |
| 2     | Les prompts vocaux utilisent les clés `assistant.voice.*` traduites.   |
| 3     | Les transcriptions sont stockées avec `lang` pour reprise et audit.    |
| 4     | Changement de langue : bascule immédiate des moteurs STT/TTS, sans réinitialiser le panier ni la conversation. |

### Règles

- Si la langue active n'est pas supportée par le navigateur, fallback `fr`.
- Les consentements audio et mentions légales sont lus dans la langue active.

---

## DEP-0705 — Mécanisme de sélection de langue pour le téléphone

### Objectif

Rappeler la sélection de langue côté téléphonie en V1.

### Logique et règles

- La langue de l'appel est fixée par la configuration du tenant (DEP-0687) ;
  aucun menu de choix en V1.
- Les prompts proviennent du bloc `voice.call.*` dans la langue du tenant
  (DEP-0698).
- Les transcriptions et résumés d'appel sont marqués avec `lang` pour suivi.
- Si une traduction manque, le prompt `fr` est utilisé (fallback).

---

## DEP-0706 — Traduire les écrans client principaux

### Objectif

Garantir que les écrans clients clés sont intégralement traduits.

### Portée (exemples de clés)

| Écran / section                 | Clés principales à couvrir                               |
|---------------------------------|-----------------------------------------------------------|
| Accueil / catalogue             | Titres, filtres, catégories, boutons panier               |
| Carte / fiche produit           | Nom, description, état stock, prix, CTA                   |
| Panier et récapitulatif         | Lignes panier, totaux, frais, messages d'indisponibilité  |
| Checkout / confirmation         | Adresse, créneaux, moyens de paiement, confirmation order |
| Suivi de commande               | États, estimations, notifications                         |
| Compte / profil / adresses      | Libellés formulaires, validations, boutons                |
| Aide / assistant                | Textes d'empty state, invitations à parler/écrire         |

### Règles

- Tous les libellés passent par des clés de traduction ; aucun texte en dur.
- Les formats (date, monnaie) suivent la locale active.

---

## DEP-0707 — Traduire les écrans dépanneur principaux

### Portée (exemples)

| Écran / module                  | Clés à traduire                                           |
|---------------------------------|-----------------------------------------------------------|
| Réception commandes             | Colonnes, états, filtres, actions (accepter, appeler)     |
| Détails commande                | Sections client, panier, paiements, notes                 |
| Admin catalogue                 | Liste produits, édition, catégories, validations, toasts  |
| Paramètres tenant               | Langues actives, horaires, zones, alertes                 |

### Règles

- Les messages système et validations utilisent les fichiers `fr`/`en`.
- Les données métier (noms produits saisis par tenant) suivent la convention
  DEP-0695 pour l'affichage.

---

## DEP-0708 — Traduire les écrans livreur principaux

### Portée (exemples)

| Écran / module                  | Clés à traduire                                           |
|---------------------------------|-----------------------------------------------------------|
| Liste des livraisons            | États, distances, temps estimés, filtres                  |
| Fiche livraison                 | Adresse, notes client, téléphone, paiement attendu        |
| Actions livraison               | Accepter, refuser, partir, arrivé, marquer livré          |
| Notifications push              | Nouvelles missions, changements d'état                    |

### Règles

- Les instructions de navigation sont affichées dans la langue du livreur
  (DEP-0686), sinon fallback tenant.

---

## DEP-0709 — Traduire les messages système principaux

### Objectif

Définir les messages système transverses et leurs traductions.

### Portée

- Maintenance planifiée, indisponibilité temporaire.
- Session expirée, reconnexion requise.
- Mode hors ligne / perte de connexion.
- Mise à jour disponible / rechargement requis.

### Règles

- Clés sous `system.*` avec valeurs `fr` et `en` (fallback `fr`).
- Les messages doivent rester courts et actionnables.

---

## DEP-0710 — Traduire les messages d’erreur principaux

### Portée

- Erreurs 4xx/5xx génériques : `error.generic`, `error.404`, `error.500`.
- Erreurs de validation : email, téléphone, adresse, champ obligatoire.
- Erreurs paiement : moyen refusé, session expirée.
- Erreurs catalogue : produit indisponible, quantité invalide.

### Règles

- Clés sous `error.*`, valeurs `fr` obligatoires, `en` requises si langue
  activée.
- Les messages ne doivent pas révéler de détails techniques côté client.

---

## DEP-0711 — Traduire les confirmations de commande principales

### Portée

- Confirmation de prise de commande (écran + email/SMS si applicable).
- Confirmation de modification (adresse, créneau, contenu).
- Confirmation d'annulation par le client ou le dépanneur.

### Règles

- Clés sous `order.confirmation.*` avec variantes par canal (ui/email/sms).
- Les totaux et devises respectent la locale active ; les statuts utilisent les
  traductions DEP-0712.

---

## DEP-0712 — Traduire les états de livraison principaux

### Portée

| Identifiant (référence DEP-0481–0494) | Libellé `fr`                 | Libellé `en`            |
|---------------------------------------|------------------------------|-------------------------|
| `en_preparation`                      | « En préparation »           | "In preparation"        |
| `prete`                               | « Prête à partir »           | "Ready to go"           |
| `livree`                              | « Livrée »                   | "Delivered"             |
| `annulee`                             | « Annulée »                  | "Cancelled"             |
| `probleme`                            | « En problème »              | "Issue reported"        |

### Règles

- Clés sous `order.status.*` ; ces libellés sont utilisés sur web, mobile,
  notifications et reçus.
- Pas de reformulation par canal : mêmes libellés partout pour cohérence.

---

## DEP-0713 — Traduire les catégories de démonstration

### Portée

Traduire les 8 catégories de DEP-0271.

| Slug             | Nom `fr`             | Nom `en`            |
|------------------|----------------------|---------------------|
| `freins`         | Freins               | Brakes              |
| `filtres`        | Filtres              | Filters             |
| `eclairage`      | Éclairage            | Lighting            |
| `huiles-fluides` | Huiles et fluides    | Oils & fluids       |
| `batteries`      | Batteries            | Batteries           |
| `pneus`          | Pneus                | Tires               |
| `essuyage`       | Essuyage             | Wipers              |
| `demarrage`      | Démarrage            | Starting            |

### Règles

- Ces traductions alimentent les bundles `fr`/`en` et les seeds de démo.
- Les icônes restent identiques ; seules les étiquettes changent.

---

## DEP-0714 — Traduire les produits de démonstration

### Portée

Traduire les 12 produits de DEP-0272 (nom court) et leurs descriptions courtes
si présentes.

| ID   | Nom `fr`                         | Nom `en`                              |
|------|----------------------------------|---------------------------------------|
| P-01 | Plaquettes frein avant           | Front brake pads                      |
| P-02 | Disque frein ventilé 280 mm      | Ventilated brake disc 280 mm          |
| P-03 | Filtre à huile                   | Oil filter                            |
| P-04 | Filtre à air                     | Air filter                            |
| P-05 | Ampoule H7 55W                   | H7 55W bulb                           |
| P-06 | Kit xénon H1                     | H1 xenon kit                          |
| P-07 | Huile moteur 5W-30 5L            | Engine oil 5W-30 5L                   |
| P-08 | Liquide de refroidissement       | Coolant                               |
| P-09 | Batterie 60Ah 540A               | 60Ah 540A battery                     |
| P-10 | Pneu été 205/55 R16              | Summer tire 205/55 R16                |
| P-11 | Balai essuie-glace 600 mm        | 600 mm wiper blade                    |
| P-12 | Démarreur reconditionné          | Reconditioned starter                 |

### Règles

- Les traductions respectent la convention DEP-0695 (bloc `translations`).
- Les synonymes de démo sont traduits par langue selon DEP-0696.
- Si une description courte est ajoutée, elle est traduite `fr`/`en` et suit les
  longueurs définies en DEP-0256 (50–80 caractères).

---

## Synthèse

| DEP   | Titre                                                   | Statut  |
|-------|---------------------------------------------------------|---------|
| 0695  | Convention des produits traduisibles                    | Défini  |
| 0696  | Convention des synonymes par langue                     | Défini  |
| 0697  | Convention des prompts de l’assistant par langue        | Défini  |
| 0698  | Convention des phrases téléphoniques par langue         | Défini  |
| 0699  | Fichier de traduction français                          | Défini  |
| 0700  | Fichier de traduction anglais                           | Défini  |
| 0701  | Mécanisme de sélection de langue dans le front          | Défini  |
| 0702  | Mécanisme de sélection de langue dans le back           | Défini  |
| 0703  | Mécanisme de sélection de langue pour l’assistant texte | Défini  |
| 0704  | Mécanisme de sélection de langue pour l’assistant voix web | Défini |
| 0705  | Mécanisme de sélection de langue pour le téléphone      | Défini  |
| 0706  | Traduire les écrans client principaux                   | Défini  |
| 0707  | Traduire les écrans dépanneur principaux                | Défini  |
| 0708  | Traduire les écrans livreur principaux                  | Défini  |
| 0709  | Traduire les messages système principaux                | Défini  |
| 0710  | Traduire les messages d’erreur principaux               | Défini  |
| 0711  | Traduire les confirmations de commande principales      | Défini  |
| 0712  | Traduire les états de livraison principaux              | Défini  |
| 0713  | Traduire les catégories de démonstration                | Défini  |
| 0714  | Traduire les produits de démonstration                  | Défini  |
