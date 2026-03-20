# DEP-0655 à DEP-0674 — Logiques de gestion des tenants et pages super admin

## Périmètre

Ce document définit les **logiques de création, de clonage, de personnalisation
et de cycle de vie des tenants** dans depaneurIA (nouveau tenant, clonage demo,
domaine, sous-domaine, quotas, désactivation, archivage, suppression, export,
import, journaux), ainsi que les **trois pages super admin** permettant de
gérer les tenants depuis l'interface d'administration centrale.

Principe directeur : **chaque tenant est une île.** Ses données, son catalogue,
son thème, sa configuration téléphonique et ses journaux sont strictement
isolés. Aucune donnée d'un tenant ne peut fuiter vers un autre, ni être
accessible sans permission explicite du super admin.

Il s'agit exclusivement de **documentation** : aucun code produit, aucune
implémentation. Les spécifications décrites ici serviront de référence pour
les futures implémentations back-end et d'administration.

---

## DEP-0655 — Logique de création d'un nouveau tenant

### Objectif

Définir la séquence complète et les données nécessaires pour provisionner
un nouveau tenant (dépanneur client) dans le système depaneurIA.

### Séquence de création

| Étape | Action système                                                  | Résultat                                |
| ----- | --------------------------------------------------------------- | --------------------------------------- |
| 1     | Super admin soumet le formulaire de création (DEP-0673)         | Données de base validées                |
| 2     | Génération d'un `tenant_id` unique (UUID v4)                    | Identifiant permanent et immuable       |
| 3     | Création de l'enregistrement dans la table `tenants` (DEP-0671) | Tenant en état `provisioning`           |
| 4     | Isolation des données : création du namespace ou schéma dédié   | Séparation physique ou logique garantie |
| 5     | Création du compte super utilisateur du tenant                  | Accès propriétaire prêt                 |
| 6     | Application de la configuration par défaut ou clonée            | Catalogue, thème, livraison, téléphonie |
| 7     | Attribution du sous-domaine ou domaine (DEP-0661, DEP-0662)     | URL du tenant active                    |
| 8     | Application des quotas initiaux (DEP-0664)                      | Limites définies dès la création        |
| 9     | Passage en état `actif`                                         | Tenant opérationnel                     |
| 10    | Journalisation de la création avec horodatage et auteur         | Traçabilité complète                    |

### Données minimales requises à la création

| Champ                   | Type     | Obligatoire | Description                               |
| ----------------------- | -------- | ----------- | ----------------------------------------- |
| `name`                  | `string` | Oui         | Nom commercial du dépanneur               |
| `owner_email`           | `string` | Oui         | Email du propriétaire (super user tenant) |
| `owner_phone`           | `string` | Oui         | Téléphone du propriétaire                 |
| `subdomain` ou `domain` | `string` | Oui         | Adresse d'accès au tenant                 |
| `plan`                  | `string` | Oui         | Plan tarifaire (`starter`, `pro`, etc.)   |
| `clone_from`            | `uuid`   | Non         | Si clonage depuis un tenant demo          |

### Règles

- Le `tenant_id` est généré par le système — jamais fourni par l'humain.
- Deux tenants ne peuvent pas partager le même sous-domaine ou domaine.
- La création est atomique : si une étape échoue, tout est annulé (rollback).
- La création est journalisée dans les journaux super admin (DEP-0670).

---

## DEP-0656 — Logique de clonage d'un tenant de démonstration

### Objectif

Définir comment un nouveau tenant peut être initialisé en copiant l'ensemble
de la configuration d'un **tenant de démonstration** préconfiguré.

### Définition — Tenant de démonstration

Un tenant de démonstration est un tenant spécial (`is_demo: true`) maintenu
par le super admin, qui contient une configuration complète et réaliste :
catalogue, thème, zones de livraison, configuration téléphonique, phrases
système et données de test.

### Séquence de clonage

1. Super admin sélectionne « Cloner depuis demo » lors de la création (DEP-0673)
   ou depuis la page de clonage (DEP-0674).
2. Le système copie les éléments clonables (DEP-0657 à DEP-0660) du tenant
   source vers le nouveau tenant.
3. Les identifiants sont régénérés (`tenant_id`, `store_id`, etc.).
4. Les données propriétaires (commandes, clients, transactions) ne sont
   **jamais copiées**.
5. Le nouveau tenant passe en état `actif` avec la configuration clonée.

### Éléments copiés vs non copiés

| Élément                    | Copié ? | Référence           |
| -------------------------- | ------- | ------------------- |
| Catalogue de démonstration | ✅ Oui  | DEP-0657            |
| Thème visuel               | ✅ Oui  | DEP-0658            |
| Configuration livraison    | ✅ Oui  | DEP-0659            |
| Configuration téléphonique | ✅ Oui  | DEP-0660            |
| Phrases système            | ✅ Oui  | DEP-0361–0376       |
| Commandes passées          | ❌ Non  | Données privées     |
| Clients inscrits           | ❌ Non  | Données privées     |
| Transactions               | ❌ Non  | Données financières |
| Journaux                   | ❌ Non  | DEP-0670            |

### Règles

- Un tenant de démonstration ne peut être cloné que par un super admin.
- Le clonage n'affecte jamais le tenant source.
- Après clonage, le nouveau tenant est indépendant : ses modifications
  n'impactent pas le tenant demo.

---

## DEP-0657 — Logique de clonage d'un catalogue de démonstration

### Objectif

Définir comment le catalogue d'un tenant de démonstration est copié vers
un nouveau tenant pour lui fournir un point de départ réaliste.

### Éléments du catalogue copiés

| Élément          | Copié ? | Remarque                                        |
| ---------------- | ------- | ----------------------------------------------- |
| Catégories       | ✅ Oui  | Structure et noms                               |
| Produits         | ✅ Oui  | Nom, description, catégorie, unité, format      |
| Prix             | ✅ Oui  | Prix de démonstration — à ajuster par le client |
| Images produits  | ✅ Oui  | Images génériques de démonstration              |
| Stocks           | ❌ Non  | Chaque tenant gère ses propres stocks           |
| Codes promotions | ❌ Non  | Non clonables                                   |

### Séquence

1. Lecture du catalogue source (tenant demo).
2. Génération de nouveaux identifiants (`product_id`, `category_id`) pour
   le tenant cible.
3. Insertion en base dans le namespace du tenant cible.
4. Le catalogue est marqué `is_demo_clone: true` pour traçabilité.

### Règles

- Les prix clonés sont des prix de démonstration — le tenant doit les
  réviser avant d'ouvrir au public.
- Les images génériques peuvent être remplacées par le tenant à tout moment.
- Le catalogue cloné ne contient aucune donnée financière réelle.

---

## DEP-0658 — Logique de clonage d'un thème visuel de démonstration

### Objectif

Définir comment la configuration visuelle (couleurs, typographie, logo par
défaut, espacement) d'un tenant demo est copiée vers un nouveau tenant.

### Éléments du thème copiés

| Élément             | Copié ? | Remarque                                  |
| ------------------- | ------- | ----------------------------------------- |
| Palette de couleurs | ✅ Oui  | Variables CSS ou tokens — à personnaliser |
| Typographie         | ✅ Oui  | Familles de polices et tailles de base    |
| Logo placeholder    | ✅ Oui  | Logo générique de démonstration           |
| Espacement / layout | ✅ Oui  | Grille et marges de base                  |
| Favicon             | ✅ Oui  | Favicon générique                         |
| Images de fond      | ❌ Non  | Chaque tenant fournit ses propres images  |

### Règles

- Le thème cloné est une **copie indépendante** : le modifier n'affecte
  pas le tenant demo ni les autres tenants clonés depuis la même source.
- Le logo générique doit être remplacé avant la mise en production.
- Les tokens de couleur sont nommés de façon sémantique (ex. :
  `color-primary`, `color-accent`) pour faciliter la personnalisation.

---

## DEP-0659 — Logique de clonage d'une configuration de livraison

### Objectif

Définir comment la configuration de livraison (zones, tarifs, horaires,
délais) d'un tenant demo est copiée vers un nouveau tenant.

### Éléments de configuration copiés

| Élément               | Copié ? | Remarque                                    |
| --------------------- | ------- | ------------------------------------------- |
| Zones de livraison    | ✅ Oui  | Périmètres géographiques de démonstration   |
| Tarifs de livraison   | ✅ Oui  | Tarifs à ajuster selon la réalité du client |
| Horaires de livraison | ✅ Oui  | Plages horaires de démonstration            |
| Délais estimés        | ✅ Oui  | Délais de démonstration                     |
| Paramètres livreur    | ✅ Oui  | Nombre max de livraisons simultanées, etc.  |
| Livreurs assignés     | ❌ Non  | Chaque tenant gère ses propres livreurs     |

### Règles

- Les zones de livraison clonées utilisent des coordonnées de démonstration :
  le tenant doit les ajuster à sa géographie réelle avant l'ouverture.
- La configuration clonée est indépendante dès la création.

---

## DEP-0660 — Logique de clonage d'une configuration téléphonique

### Objectif

Définir comment la configuration téléphonique (fournisseur, paramètres TTS,
phrases vocales, délais, logique de reconnaissance) d'un tenant demo est
copiée vers un nouveau tenant.

### Éléments copiés

| Élément                       | Copié ? | Remarque                               |
| ----------------------------- | ------- | -------------------------------------- |
| Paramètres TTS (voix, langue) | ✅ Oui  | Voix fr-FR par défaut                  |
| Phrases vocales canoniques    | ✅ Oui  | Basées sur DEP-0451–0459               |
| Délais de timeout appel       | ✅ Oui  | Valeurs de démonstration à ajuster     |
| Logique de répétition         | ✅ Oui  | Paramètres DEP-0460–0463               |
| Numéro de téléphone virtuel   | ❌ Non  | Chaque tenant reçoit son propre numéro |
| Credentials fournisseur       | ❌ Non  | Jamais partagés entre tenants          |
| Historique d'appels           | ❌ Non  | Données privées                        |

### Règles

- Le numéro de téléphone virtuel est attribué par le système lors de la
  création du tenant (DEP-0655) — jamais cloné.
- Les credentials téléphoniques sont provisionnés de façon isolée pour
  chaque tenant.

---

## DEP-0661 — Logique de domaine personnalisé par client

### Objectif

Définir comment un tenant peut utiliser son propre nom de domaine
(ex. : `commande.mondepanneur.fr`) au lieu du sous-domaine par défaut.

### Mécanisme

1. Le super admin ou le tenant saisit le domaine personnalisé souhaité.
2. Le système vérifie que le domaine n'est pas déjà utilisé par un autre
   tenant.
3. Le tenant configure un enregistrement DNS `CNAME` pointant vers
   l'infrastructure depaneurIA (instruction fournie par le système).
4. Le système vérifie la propagation DNS (polling ou webhook).
5. Une fois le DNS validé, le domaine est activé pour le tenant.
6. Un certificat TLS est provisionné automatiquement (Let's Encrypt ou
   équivalent).

### États du domaine personnalisé

| État          | Description                                   |
| ------------- | --------------------------------------------- |
| `pending_dns` | En attente de configuration DNS par le tenant |
| `verifying`   | Vérification de la propagation DNS en cours   |
| `active`      | Domaine actif et certificat TLS valide        |
| `error`       | Échec de vérification — action requise        |
| `revoked`     | Domaine retiré (désactivation ou changement)  |

### Règles

- Un tenant ne peut avoir qu'**un seul domaine personnalisé actif** en V1.
- Le sous-domaine par défaut (DEP-0662) reste actif en parallèle jusqu'à
  ce que le domaine personnalisé soit validé.
- La révocation du domaine personnalisé réactive le sous-domaine par défaut
  comme URL principale.
- Le domaine personnalisé est lié au `tenant_id` — il ne peut pas être
  transféré à un autre tenant.

---

## DEP-0662 — Logique de sous-domaine par client

### Objectif

Définir le système de sous-domaines automatiques attribués à chaque tenant
lors de sa création.

### Format

```
{slug-tenant}.depanneuría.app
```

> Exemple : `chez-mario.depaneuría.app`

### Règles de génération du slug

1. Le slug est dérivé du nom du tenant (minuscules, tirets, sans accents).
2. Si le slug est déjà pris, un suffixe numérique est ajouté
   (ex. : `chez-mario-2`).
3. Le slug est validé par le super admin lors de la création (DEP-0673).
4. Une fois attribué, le slug ne peut plus être modifié (immuabilité de
   l'URL de base).

### Règles

- Le sous-domaine est actif **dès la création du tenant**, sans étape
  de configuration supplémentaire.
- Le certificat TLS du sous-domaine est géré par le système depaneurIA
  (wildcard ou individuel).
- Le sous-domaine reste actif même si un domaine personnalisé est configuré
  (DEP-0661) — il peut servir de fallback ou de lien d'administration.
- Un tenant désactivé (DEP-0665) voit son sous-domaine retourner une page
  d'indisponibilité, pas une erreur 404.

---

## DEP-0663 — Logique de marque blanche (si utile plus tard)

### Objectif

Définir la logique de marque blanche permettant à un tenant premium de
masquer toute référence à depaneurIA dans son interface et de présenter
le service sous sa propre identité.

### Statut V1

> **La marque blanche est hors scope V1.** Cette logique est documentée
> pour anticiper la fonctionnalité future. Elle ne sera pas implémentée
> avant qu'un besoin client confirmé soit documenté.

### Éléments concernés par la marque blanche (futur)

| Élément                              | Action marque blanche                            |
| ------------------------------------ | ------------------------------------------------ |
| Logo depaneurIA dans l'en-tête       | Remplacé par le logo du tenant                   |
| Mentions « Propulsé par depaneurIA » | Masquées ou remplacées                           |
| URL (sous-domaine depaneuría)        | Remplacée par le domaine personnalisé (DEP-0661) |
| Emails système                       | Envoyés depuis le domaine du tenant              |
| Numéro de téléphone virtuel          | Numéro propre au tenant (déjà prévu)             |

### Règles (pour implémentation future)

- La marque blanche est un module activable par plan tarifaire.
- Elle ne change pas la logique métier — uniquement la présentation.
- Les mentions légales obligatoires ne peuvent pas être masquées.

---

## DEP-0664 — Logique de quotas par client

### Objectif

Définir les limites opérationnelles appliquées à chaque tenant en fonction
de son plan tarifaire, pour prévenir les abus et garantir la qualité de
service pour tous.

### Quotas V1

| Quota                         | Plan Starter | Plan Pro | Illimité |
| ----------------------------- | :----------: | :------: | :------: |
| Produits dans le catalogue    |     100      |   500    |    —     |
| Commandes par mois            |     200      |  2 000   |    —     |
| Livreurs actifs simultanément |      2       |    10    |    —     |
| Numéros de téléphone virtuels |      1       |    3     |    —     |
| Appels téléphoniques par mois |     100      |  1 000   |    —     |
| Stockage fichiers (images)    |    500 Mo    |   5 Go   |    —     |
| Utilisateurs admin            |      1       |    5     |    —     |

### Comportement en cas de dépassement

| Quota dépassé        | Comportement                                               |
| -------------------- | ---------------------------------------------------------- |
| Produits             | Ajout bloqué — message d'erreur dans l'admin               |
| Commandes            | Nouvelles commandes bloquées — notification super admin    |
| Appels téléphoniques | Appels supplémentaires rejetés — message d'indisponibilité |
| Stockage             | Upload bloqué — message d'erreur dans l'admin              |

### Règles

- Les quotas sont vérifiés côté serveur à chaque action concernée.
- Un super admin peut modifier les quotas d'un tenant individuellement
  sans changer son plan.
- Un tenant approchant 80 % d'un quota reçoit une notification préventive.
- Les quotas sont non rétroactifs : les données existantes ne sont pas
  supprimées si un plan est rétrogradé.

---

## DEP-0665 — Logique de désactivation d'un client

### Objectif

Définir ce qui se passe lorsqu'un tenant est désactivé (temporairement ou
en attente de paiement), sans suppression de ses données.

### Déclencheurs de désactivation

- Non-paiement de l'abonnement après délai de grâce.
- Demande explicite du super admin (ex. : violation des conditions).
- Demande du tenant lui-même (pause temporaire).

### Comportement

| Élément                     | Comportement après désactivation             |
| --------------------------- | -------------------------------------------- |
| Boutique publique du tenant | Page d'indisponibilité affichée (pas de 404) |
| Interface admin du tenant   | Accessible en lecture seule uniquement       |
| Téléphonie du tenant        | Appels entrants rejetés avec message vocal   |
| Nouvelles commandes         | Bloquées                                     |
| Commandes en cours          | Complétées si déjà en route — bloquées sinon |
| Données du tenant           | Conservées intégralement                     |
| Sous-domaine / domaine      | Redirige vers la page d'indisponibilité      |

### États de désactivation

| Code           | Libellé                    | Réactivation possible ?      |
| -------------- | -------------------------- | ---------------------------- |
| `suspended`    | Suspendu (non-paiement)    | ✅ Oui — paiement régularisé |
| `paused`       | En pause (demande tenant)  | ✅ Oui — demande tenant      |
| `admin_locked` | Verrouillé par super admin | ✅ Oui — décision admin      |

### Règles

- La désactivation est réversible — les données sont intactes.
- Une notification est envoyée au propriétaire du tenant avec le motif.
- La désactivation est journalisée (DEP-0670).

---

## DEP-0666 — Logique d'archivage d'un client

### Objectif

Définir la transition d'un tenant vers un état archivé — inactif de façon
prolongée mais conservé pour raisons légales, historiques ou de réactivation
potentielle.

### Différence avec la désactivation

| Critère                          | Désactivation    | Archivage                                    |
| -------------------------------- | ---------------- | -------------------------------------------- |
| Durée prévue                     | Temporaire       | Longue durée ou indéfinie                    |
| Réactivation                     | Facile et rapide | Possible mais avec effort                    |
| Accès admin tenant               | Lecture seule    | Lecture seule (accès super admin uniquement) |
| Visibilité dans la liste tenants | Visible          | Masqué par défaut (filtrable)                |

### Séquence d'archivage

1. Super admin déclenche l'archivage depuis la fiche tenant.
2. Confirmation requise (action irréversible sans intervention super admin).
3. Le tenant passe en état `archived`.
4. Toutes les surfaces publiques (boutique, téléphonie) sont désactivées.
5. Les données sont conservées dans le namespace dédié du tenant.
6. L'archivage est journalisé avec motif et horodatage.

### Règles

- Un tenant archivé peut être réactivé par un super admin.
- Les données archivées ne sont pas accessibles aux utilisateurs du tenant.
- L'archivage est distinct de la suppression (DEP-0667) : aucune donnée
  n'est effacée.

---

## DEP-0667 — Logique de suppression d'un client

### Objectif

Définir la suppression définitive d'un tenant et de toutes ses données
associées.

### Conditions préalables obligatoires

Avant toute suppression, les conditions suivantes doivent être remplies :

1. Le tenant est en état `archived` depuis au moins **30 jours**.
2. Aucune commande n'est en cours ou en litige.
3. L'export complet des données a été réalisé et confirmé (DEP-0668).
4. Le propriétaire du tenant a été notifié au moins **14 jours** à l'avance.
5. Un second super admin a confirmé la suppression (double validation).

### Séquence de suppression

1. Vérification des conditions préalables (bloquante).
2. Export final automatique des données (sauvegarde de sécurité).
3. Suppression des données dans cet ordre :
   - Commandes et transactions
   - Données clients
   - Catalogue
   - Configuration (thème, livraison, téléphonie)
   - Journaux du tenant
   - Enregistrement dans la table `tenants`
   - Namespace / schéma dédié
4. Libération du sous-domaine et du domaine personnalisé.
5. Journalisation de la suppression dans les journaux super admin
   (conservés après suppression du tenant).

### Règles

- La suppression est **irréversible**.
- Elle doit être réalisée par un super admin avec double confirmation.
- Les journaux super admin de la suppression sont conservés indéfiniment.
- En V1, la suppression est une opération manuelle — aucune suppression
  automatique.

---

## DEP-0668 — Logique d'export complet des données d'un client

### Objectif

Définir comment l'ensemble des données d'un tenant peut être exporté,
pour portabilité, archivage légal ou avant suppression.

### Données exportées

| Catégorie          | Format export | Inclus                                           |
| ------------------ | ------------- | ------------------------------------------------ |
| Profil tenant      | JSON          | Nom, plan, dates, configuration                  |
| Catalogue          | JSON + CSV    | Catégories, produits, prix, images (URLs)        |
| Commandes          | JSON + CSV    | Toutes les commandes avec statuts et horodatages |
| Clients            | JSON + CSV    | Profils clients (données RGPD)                   |
| Transactions       | JSON + CSV    | Paiements enregistrés                            |
| Journaux du tenant | JSON          | Journaux d'activité (DEP-0670)                   |
| Configuration      | JSON          | Thème, livraison, téléphonie                     |

### Séquence d'export

1. Super admin (ou propriétaire du tenant) déclenche l'export depuis la
   fiche tenant.
2. Le système génère une archive compressée (`.zip`) contenant tous les
   fichiers.
3. L'archive est disponible en téléchargement sécurisé pendant **72 heures**.
4. Un lien de téléchargement est envoyé par email au demandeur.
5. L'export est journalisé (DEP-0670).

### Règles

- L'export est disponible en tout état du tenant (actif, suspendu, archivé).
- Les images sont exportées comme liste d'URLs — les fichiers binaires ne
  sont pas inclus dans l'archive en V1.
- L'export respecte le droit à la portabilité des données (RGPD).
- Un seul export simultané par tenant est autorisé.

---

## DEP-0669 — Logique d'import initial des données d'un client

### Objectif

Définir comment des données existantes (catalogue, clients, commandes) peuvent
être importées dans un nouveau tenant lors de son provisionnement initial.

### Cas d'usage principal

Un dépanneur existant migre vers depaneurIA depuis un autre système et
souhaite conserver son catalogue et son historique partiel.

### Données importables en V1

| Catégorie             | Importable ? | Format accepté | Remarque                           |
| --------------------- | :----------: | -------------- | ---------------------------------- |
| Catalogue             |    ✅ Oui    | CSV, JSON      | Catégories et produits             |
| Prix                  |    ✅ Oui    | CSV, JSON      | Vérifiés avant import              |
| Images                | ❌ Non (V1)  | —              | À uploader manuellement            |
| Clients               |    ✅ Oui    | CSV            | Avec consentement RGPD obligatoire |
| Commandes historiques | ❌ Non (V1)  | —              | Hors scope V1                      |
| Configuration         |    ❌ Non    | —              | Via clonage demo (DEP-0656–0660)   |

### Séquence d'import

1. Super admin téléverse le fichier d'import depuis la page de création
   ou la fiche tenant.
2. Le système valide le format et la structure du fichier.
3. En cas d'erreur de validation, un rapport est retourné avec les lignes
   en erreur.
4. Si valide, l'import est exécuté en arrière-plan.
5. Un rapport de succès (nombre d'enregistrements importés) est disponible
   à la fin.
6. L'import est journalisé (DEP-0670).

### Règles

- L'import ne peut être effectué que sur un tenant en état `provisioning`
  ou `actif` sans données (premier import).
- Un doublon de produit (même référence) écrase l'existant par défaut
  (comportement configurable).
- L'import de clients requiert une confirmation explicite du super admin
  sur le consentement RGPD.

---

## DEP-0670 — Logique de séparation stricte des journaux

### Objectif

Définir comment les journaux d'activité sont segmentés et isolés entre les
tenants et le niveau super admin.

### Niveaux de journaux

| Niveau                 | Contenu                                                    | Accès                  |
| ---------------------- | ---------------------------------------------------------- | ---------------------- |
| Journaux super admin   | Créations, modifications, suppressions de tenants, exports | Super admin uniquement |
| Journaux tenant        | Actions admin du tenant (catalogue, commandes, config)     | Tenant + super admin   |
| Journaux applicatifs   | Erreurs techniques, appels API, performances               | Super admin uniquement |
| Journaux téléphoniques | Événements d'appels (DEP-0475), sans contenu vocal         | Tenant + super admin   |

### Règles de séparation

- Les journaux d'un tenant ne contiennent **jamais** de données d'un autre
  tenant.
- Un utilisateur d'un tenant ne peut jamais accéder aux journaux d'un
  autre tenant, même en cas d'erreur de configuration.
- Les journaux super admin sont stockés dans un espace séparé des espaces
  tenant.
- Les journaux applicatifs (erreurs serveur) ne contiennent jamais de
  données métier sensibles (noms clients, montants).

### Rétention des journaux (V1)

| Type                   | Durée de rétention |
| ---------------------- | ------------------ |
| Journaux super admin   | Indéfinie          |
| Journaux tenant        | 12 mois glissants  |
| Journaux applicatifs   | 90 jours           |
| Journaux téléphoniques | 6 mois             |

### Règles d'accès

- L'accès aux journaux est authentifié et tracé.
- Toute consultation de journaux super admin est elle-même journalisée.

---

## DEP-0671 — Table ou collection des tenants

### Objectif

Définir la structure de la table principale `tenants` qui centralise les
métadonnées de tous les tenants du système.

### Structure de la table `tenants`

| Champ                  | Type       | Obligatoire | Description                                    |
| ---------------------- | ---------- | ----------- | ---------------------------------------------- |
| `tenant_id`            | `uuid`     | Oui         | Identifiant unique immuable                    |
| `name`                 | `string`   | Oui         | Nom commercial du dépanneur                    |
| `slug`                 | `string`   | Oui         | Slug du sous-domaine (unique, immuable)        |
| `custom_domain`        | `string`   | Non         | Domaine personnalisé (si configuré — DEP-0661) |
| `custom_domain_status` | `string`   | Non         | État du domaine personnalisé (DEP-0661)        |
| `owner_email`          | `string`   | Oui         | Email du propriétaire                          |
| `owner_phone`          | `string`   | Oui         | Téléphone du propriétaire                      |
| `plan`                 | `string`   | Oui         | Plan tarifaire (`starter`, `pro`, etc.)        |
| `status`               | `string`   | Oui         | État du tenant (voir ci-dessous)               |
| `is_demo`              | `bool`     | Oui         | `true` si c'est un tenant de démonstration     |
| `cloned_from`          | `uuid`     | Non         | `tenant_id` source si cloné                    |
| `quotas`               | `jsonb`    | Oui         | Quotas appliqués (DEP-0664)                    |
| `created_at`           | `datetime` | Oui         | Horodatage de création                         |
| `created_by`           | `uuid`     | Oui         | ID du super admin créateur                     |
| `updated_at`           | `datetime` | Oui         | Dernière modification                          |
| `archived_at`          | `datetime` | Non         | Horodatage d'archivage (DEP-0666)              |
| `deleted_at`           | `datetime` | Non         | Horodatage de suppression logique (DEP-0667)   |

### États (`status`) du tenant

| Valeur         | Description                     |
| -------------- | ------------------------------- |
| `provisioning` | En cours de création            |
| `active`       | Opérationnel                    |
| `suspended`    | Suspendu (non-paiement)         |
| `paused`       | En pause (demande tenant)       |
| `admin_locked` | Verrouillé par super admin      |
| `archived`     | Archivé (DEP-0666)              |
| `deleted`      | Supprimé logiquement (DEP-0667) |

### Règles

- La table `tenants` est accessible uniquement par le rôle `super_admin`.
- Aucun tenant ne peut lire les enregistrements des autres tenants.
- La suppression est logique (`deleted_at` non null) — aucune ligne n'est
  physiquement effacée avant purge manuelle.

---

## DEP-0672 — Page super admin : liste des tenants

### Objectif

Définir l'interface de la page listant tous les tenants du système,
accessible uniquement aux super admins.

### Contenu de la liste

Chaque ligne du tableau affiche :

| Colonne           | Contenu                                    |
| ----------------- | ------------------------------------------ |
| Nom               | Nom commercial du tenant                   |
| Slug / domaine    | Sous-domaine ou domaine personnalisé actif |
| Plan              | Plan tarifaire actuel                      |
| État              | Badge coloré (actif, suspendu, archivé…)   |
| Créé le           | Date de création                           |
| Dernière activité | Date de dernière action dans le tenant     |
| Actions           | Voir, Modifier, Désactiver, Archiver       |

### Filtres disponibles

- Par état (`actif`, `suspendu`, `archivé`, `tous`)
- Par plan tarifaire
- Par date de création (plage)
- Recherche texte (nom, slug, email)

### Comportements

- Les tenants archivés sont masqués par défaut (filtre « actifs » actif).
- Les tenants supprimés ne sont jamais affichés.
- Un clic sur une ligne ouvre la fiche détaillée du tenant.
- Le bouton « Nouveau tenant » ouvre la page de création (DEP-0673).

### Règles

- La page n'est accessible qu'aux super admins authentifiés.
- La liste est paginée (50 tenants par page en V1).
- L'accès à cette page est journalisé (DEP-0670).

---

## DEP-0673 — Page super admin : création de tenant

### Objectif

Définir le formulaire et le flux de création d'un nouveau tenant depuis
l'interface super admin.

### Sections du formulaire

**Section 1 — Informations de base**

- Nom commercial du dépanneur (obligatoire)
- Email du propriétaire (obligatoire, validé format email)
- Téléphone du propriétaire (obligatoire)
- Plan tarifaire (liste déroulante — obligatoire)

**Section 2 — Adresse d'accès**

- Slug du sous-domaine (obligatoire, validé unicité en temps réel)
- Domaine personnalisé (optionnel)

**Section 3 — Initialisation**

- Mode d'initialisation :
  - ○ Créer vide (catalogue et config à renseigner manuellement)
  - ○ Cloner depuis un tenant de démonstration → liste des demos dispo
  - ○ Importer des données (DEP-0669)

**Section 4 — Quotas**

- Affichage des quotas du plan sélectionné
- Option de quota personnalisé (super admin seulement)

### Comportement du formulaire

- Validation en temps réel du slug (unicité + format).
- Aperçu de l'URL résultante : `{slug}.depaneuría.app`.
- Le bouton « Créer » est désactivé tant que les champs obligatoires
  ne sont pas valides.
- Après création réussie, redirection vers la fiche du nouveau tenant.

### Règles

- La page n'est accessible qu'aux super admins.
- La création est journalisée avec l'identité du super admin (DEP-0670).

---

## DEP-0674 — Page super admin : clonage de tenant

### Objectif

Définir la page et le flux permettant de cloner un tenant existant
(généralement un tenant de démonstration) vers un nouveau tenant ou
vers un tenant déjà créé.

### Accès à la page

- Depuis la page de création (DEP-0673), en choisissant « Cloner depuis demo ».
- Depuis la fiche d'un tenant existant, via le bouton « Cloner vers… ».

### Sections de la page de clonage

**Section 1 — Source**

- Sélection du tenant source à cloner (liste des tenants `is_demo: true`
  ou sélection libre pour super admin)
- Aperçu des éléments disponibles dans la source

**Section 2 — Destination**

- Sélection du tenant de destination (nouveau tenant ou existant vide)

**Section 3 — Éléments à cloner**
Sélection individuelle des éléments à copier :

- ☑ Catalogue (DEP-0657)
- ☑ Thème visuel (DEP-0658)
- ☑ Configuration livraison (DEP-0659)
- ☑ Configuration téléphonique (DEP-0660)
- ☑ Phrases système

**Section 4 — Confirmation**

- Résumé des éléments sélectionnés et de la destination
- Bouton « Lancer le clonage »

### Comportement

- Le clonage s'exécute en arrière-plan pour les gros volumes.
- Une barre de progression ou un indicateur d'état est affiché.
- En cas d'erreur partielle, un rapport indique les éléments non copiés.
- Le clonage est journalisé avec source, destination, éléments et auteur
  (DEP-0670).

### Règles

- Un clonage ne modifie jamais le tenant source.
- Le clonage vers un tenant ayant déjà des données dans la catégorie
  concernée requiert une confirmation explicite (risque d'écrasement).
- La page n'est accessible qu'aux super admins.
