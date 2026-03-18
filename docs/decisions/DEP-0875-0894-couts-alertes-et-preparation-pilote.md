# DEP-0875 à DEP-0894 — Coûts, alertes, observabilité et préparation pilote

## Périmètre

Ce document couvre deux sous-blocs contigus :

1. **DEP-0875–DEP-0880** : Les **tableaux de bord de coûts** (cloud, téléphonie,
   assistant), les **alertes critiques** techniques et métier, et le gel de
   l'observabilité minimum requise avant le démarrage du pilote.

2. **DEP-0881–DEP-0894** : La **préparation du pilote** — choix du premier
   dépanneur, définition des objectifs, durée, critères de succès et d'arrêt,
   puis préparation opérationnelle : tenant, domaine, branding, catégories,
   produits, photos, synonymes, zone de livraison et horaires.

Ces décisions s'appuient sur l'architecture multi-tenant (DEP-0680), les
logiques de calcul (DEP-0575–DEP-0580), les machines d'état (DEP-0581–DEP-0584),
et les stratégies de sécurité (DEP-0775–DEP-0794).

Il s'agit exclusivement de **documentation** : aucun code produit, aucun
setup pilote réel, aucune implémentation.

---

## DEP-0875 — Tableau de bord coûts cloud

### Objectif

Définir le contenu et le comportement du tableau de bord permettant au super
administrateur de suivre les coûts d'infrastructure cloud de la plateforme.

### Métriques affichées

| Métrique                             | Granularité       | Unité       |
|--------------------------------------|-------------------|-------------|
| Coût total du mois en cours          | Quotidien         | $ CAD       |
| Coût par service (base, stockage, réseau, compute) | Quotidien | $ CAD  |
| Coût par tenant (si ventilation disponible) | Mensuel   | $ CAD       |
| Projection fin de mois               | En temps réel     | $ CAD       |
| Coût moyen par commande traitée      | Mensuel           | $ CAD       |
| Évolution mensuelle vs mois précédent | Mensuel          | %           |

### Seuils d'alerte

| Seuil                                | Action déclenchée                                            |
|--------------------------------------|--------------------------------------------------------------|
| Coût journalier > 150 % de la moyenne des 7 derniers jours | Alerte `warn` au super admin |
| Projection fin de mois > budget mensuel défini | Alerte `error` au super admin         |
| Coût d'un service individuel × 3 en 24h | Alerte `error` immédiate                               |

### Règles

- Le tableau de bord est accessible uniquement au super admin.
- Les données de coût proviennent de l'API du fournisseur cloud (lecture seule).
- Aucun coût tenant individuel n'est visible par le dépanneur concerné en V1.
- Le budget mensuel de référence est configurable par le super admin.

---

## DEP-0876 — Tableau de bord coûts téléphonie

### Objectif

Définir le contenu du tableau de bord de suivi des coûts liés au canal
téléphonique vocal (minutes d'appel, numéros loués, SMS si applicable).

### Métriques affichées

| Métrique                             | Granularité       | Unité       |
|--------------------------------------|-------------------|-------------|
| Minutes d'appel consommées           | Quotidien         | Minutes     |
| Coût des minutes d'appel             | Quotidien         | $ CAD       |
| Nombre de numéros loués              | Mensuel           | Unités      |
| Coût des numéros loués               | Mensuel           | $ CAD       |
| Coût total téléphonie                | Mensuel           | $ CAD       |
| Coût moyen par appel                 | Mensuel           | $ CAD       |
| Coût moyen par commande via téléphone | Mensuel          | $ CAD       |
| Appels entrants vs appels convertis en commande | Mensuel | %          |

### Seuils d'alerte

| Seuil                                | Action déclenchée                                            |
|--------------------------------------|--------------------------------------------------------------|
| Minutes consommées > 200 % vs J-7    | Alerte `warn` — pic de trafic anormal                       |
| Coût journalier téléphonie > seuil configuré | Alerte `error` au super admin                      |
| Taux de conversion appel→commande < 10 % sur 3 jours | Alerte `warn` — qualité à vérifier        |

### Règles

- Le tableau est accessible uniquement au super admin en V1.
- Les données proviennent de l'API du fournisseur de téléphonie (lecture seule).
- La ventilation par tenant est disponible si le fournisseur le permet.

---

## DEP-0877 — Tableau de bord coûts assistant

### Objectif

Définir le contenu du tableau de bord de suivi des coûts liés à l'assistant
texte et vocal (jetons de traitement, appels API LLM si applicable).

### Métriques affichées

| Métrique                             | Granularité       | Unité       |
|--------------------------------------|-------------------|-------------|
| Nombre de messages traités           | Quotidien         | Messages    |
| Nombre de jetons consommés           | Quotidien         | Jetons      |
| Coût total assistant                 | Quotidien / mensuel | $ CAD     |
| Coût moyen par message               | Mensuel           | $ CAD       |
| Coût moyen par commande assistée     | Mensuel           | $ CAD       |
| Taux de messages sans résultat (refus, hors catalogue) | Mensuel | %  |
| Évolution mensuelle                  | Mensuel           | %           |

### Seuils d'alerte

| Seuil                                | Action déclenchée                                            |
|--------------------------------------|--------------------------------------------------------------|
| Coût journalier × 3 vs J-7           | Alerte `warn` — pic anormal                                 |
| Taux de messages hors catalogue > 30 % | Alerte `warn` — qualité du catalogue à vérifier          |
| Coût mensuel projeté > budget         | Alerte `error` au super admin                               |

### Règles

- Le tableau est accessible uniquement au super admin en V1.
- Si l'assistant utilise un LLM externe, les données de coût proviennent de
  l'API de ce fournisseur (lecture seule).
- La ventilation par tenant permet d'identifier les tenants les plus
  consommateurs.

---

## DEP-0878 — Alertes techniques critiques

### Objectif

Définir la liste des événements techniques déclenchant une alerte immédiate
destinée à l'équipe technique ou au super admin.

### Alertes techniques définies

| Événement                                    | Niveau  | Destinataire       | Canal        |
|----------------------------------------------|---------|--------------------|--------------|
| Base de données inaccessible                 | FATAL   | Équipe technique   | PagerDuty / email |
| Temps de réponse API > 5 secondes en moyenne | ERROR   | Équipe technique   | Email        |
| Taux d'erreur API > 5 % sur 5 minutes        | ERROR   | Équipe technique   | Email        |
| Espace disque < 20 %                         | WARN    | Super admin        | Email        |
| Espace disque < 10 %                         | ERROR   | Équipe technique   | Email urgent |
| Certificat TLS expirant dans < 7 jours       | WARN    | Super admin        | Email        |
| Certificat TLS expiré                        | FATAL   | Équipe technique   | Email urgent |
| Service de téléphonie inaccessible           | ERROR   | Équipe technique   | Email        |
| File de messages bloquée > 5 minutes         | ERROR   | Équipe technique   | Email        |
| Échec de sauvegarde quotidienne              | ERROR   | Super admin        | Email        |
| Redémarrage inattendu d'un service           | WARN    | Équipe technique   | Email        |

### Règles

- Toute alerte FATAL déclenche une notification immédiate, sans délai.
- Les alertes WARN sont regroupées et envoyées toutes les heures si non
  acquittées.
- Une alerte acquittée par le destinataire est marquée comme traitée dans le
  journal.
- Les alertes ne sont jamais envoyées aux dépanneurs ou clients.

---

## DEP-0879 — Alertes métier critiques

### Objectif

Définir les événements liés à l'activité métier déclenchant une alerte
destinée au super admin ou au dépanneur concerné.

### Alertes métier définies

| Événement                                         | Niveau | Destinataire    | Canal   |
|---------------------------------------------------|--------|-----------------|---------|
| Commande sans réponse dépanneur depuis > 10 min   | WARN   | Super admin     | Email   |
| Commande bloquée en état `en_preparation` > 60 min | WARN  | Dépanneur       | Push    |
| Livreur sans mouvement depuis > 30 min (livraison active) | WARN | Dépanneur  | Push    |
| Taux d'annulation commandes > 20 % sur 1 journée  | WARN   | Super admin     | Email   |
| Aucune commande reçue depuis > 24h (tenant actif) | INFO   | Super admin     | Email   |
| Tenant sans connexion dépanneur depuis > 7 jours  | WARN   | Super admin     | Email   |
| Catalogue vide détecté sur tenant actif           | WARN   | Super admin     | Email   |
| Panier abandonné avec > 5 articles                | INFO   | Système (relance douce DEP-0580) | Interne |
| Taux de refus produit assistant > 40 %            | WARN   | Super admin     | Email   |

### Règles

- Les alertes métier ne contiennent jamais de données personnelles
  non masquées (DEP-0778).
- Un dépanneur ne reçoit que les alertes concernant son propre tenant.
- Les seuils des alertes métier sont revus après le pilote.
- Le super admin peut désactiver temporairement une alerte spécifique.

---

## DEP-0880 — Geler l'observabilité minimum avant pilote

### Objectif

Fixer la liste minimale des capacités d'observabilité qui doivent être
opérationnelles **avant** le démarrage du pilote avec un premier dépanneur.

### Observabilité minimum requise (bloquante pour le pilote)

| Capacité                              | Référence  | Obligatoire avant pilote |
|---------------------------------------|------------|--------------------------|
| Journalisation sécurisée active       | DEP-0777   | ✅ Oui                   |
| Alertes techniques critiques actives  | DEP-0878   | ✅ Oui                   |
| Alertes métier critiques actives      | DEP-0879   | ✅ Oui                   |
| Tableau de bord coûts cloud           | DEP-0875   | ✅ Oui                   |
| Tableau de bord coûts téléphonie      | DEP-0876   | ✅ Oui                   |
| Tableau de bord coûts assistant       | DEP-0877   | ✅ Oui                   |
| Audit des changements d'état          | DEP-0789   | ✅ Oui                   |
| Audit des livraisons                  | DEP-0790   | ✅ Oui                   |
| Sauvegarde quotidienne opérationnelle | DEP-0785   | ✅ Oui                   |

### Observabilité souhaitable (non bloquante en V1)

| Capacité                              | Référence  | Obligatoire avant pilote |
|---------------------------------------|------------|--------------------------|
| Tableau de bord qualité reconnaissance | DEP-0872  | ❌ Non — V1 post-pilote  |
| Alertes coûts par tenant              | DEP-0875–0877 | ❌ Non — V2+          |
| Monitoring temps réel des machines d'état | DEP-0581 | ❌ Non — V2+         |

### Règle de gel

Le pilote ne démarre pas si l'une des capacités marquées ✅ n'est pas
opérationnelle. Ce gel est décidé ici et ne peut être levé que par une
décision DEP explicite.

---

## DEP-0881 — Choisir un premier dépanneur pilote

### Objectif

Définir les critères de sélection du premier dépanneur qui utilisera la
plateforme en conditions réelles lors du pilote.

### Critères de sélection

| Critère                              | Détail                                                        |
|--------------------------------------|---------------------------------------------------------------|
| Relation de confiance                | Dépanneur connu de l'équipe, prêt à donner du feedback honnête |
| Taille manageable                    | Catalogue de 50 à 300 produits — ni trop petit ni trop grand |
| Zone géographique connue             | Zone où l'équipe peut intervenir physiquement si besoin      |
| Disponibilité du dépanneur           | Prêt à consacrer du temps pendant la durée du pilote         |
| Pas d'enjeu critique                 | Pas le seul revenu du dépanneur — échec acceptable           |
| Ouverture à la technologie           | À l'aise avec un téléphone intelligent et une interface web  |
| Livreur disponible                   | Au moins 1 livreur prêt à utiliser l'interface mobile        |

### Règles

- Un seul dépanneur pilote en V1 — pas de pilote multi-tenants simultanés.
- L'accord du dépanneur est formalisé avant tout setup (DEP-0886).
- L'identité du dépanneur pilote n'est pas consignée dans ce document —
  elle est gérée hors dépôt.

---

## DEP-0882 — Définir les objectifs du pilote

### Objectif

Fixer les objectifs mesurables que le pilote doit permettre de valider.

### Objectifs du pilote

| Catégorie        | Objectif                                                                  |
|------------------|---------------------------------------------------------------------------|
| Fonctionnel      | Valider que le cycle complet commande → livraison → paiement fonctionne  |
| Assistant texte  | Valider que l'assistant comprend les demandes courantes sans erreur grave |
| Assistant vocal  | Valider qu'une commande peut être passée entièrement par téléphone        |
| Opérationnel     | Valider que le dépanneur peut gérer ses commandes sans support technique  |
| Livreur          | Valider que le livreur comprend et utilise l'interface sans formation     |
| Sécurité         | Valider qu'aucune donnée ne fuit entre sessions ou entre rôles           |
| Coût             | Mesurer le coût réel par commande (cloud + téléphonie + assistant)       |
| Satisfaction     | Recueillir un retour qualitatif du dépanneur, du livreur et d'un client  |

### Ce que le pilote ne valide PAS

- La scalabilité (1 seul tenant, volume limité).
- La performance sous charge (hors périmètre V1).
- La facturation automatique (hors périmètre V1).

---

## DEP-0883 — Définir la durée du pilote

### Décision

La durée du pilote V1 est fixée à **4 semaines calendaires** à partir de
la date de démarrage effective.

### Découpage

| Semaine | Focus                                                                     |
|---------|---------------------------------------------------------------------------|
| S1      | Mise en route, premiers tests réels, correction des bugs bloquants       |
| S2      | Montée en régime, premières commandes réelles de clients                 |
| S3      | Fonctionnement en autonomie — support minimal de l'équipe                |
| S4      | Collecte de données, mesure des critères de succès, décision de suite    |

### Règles

- La durée peut être prolongée de 2 semaines maximum si les critères de
  succès (DEP-0884) ne sont pas encore atteints.
- La durée ne peut pas être raccourcie en dessous de 2 semaines sauf
  déclenchement d'un critère d'arrêt (DEP-0885).
- Un rapport de pilote est produit à la fin de la semaine 4.

---

## DEP-0884 — Définir les critères de succès du pilote

### Objectif

Fixer les seuils mesurables indiquant que le pilote est un succès et que
la plateforme est prête pour un déploiement élargi.

### Critères de succès

| Critère                                         | Seuil de succès                          |
|-------------------------------------------------|------------------------------------------|
| Commandes traitées sans intervention technique  | ≥ 80 % des commandes                    |
| Taux de commandes complétées avec succès        | ≥ 70 % (livrées + payées)               |
| Temps moyen de réponse assistant texte          | < 3 secondes                            |
| Taux de compréhension de l'assistant texte      | ≥ 85 % des demandes correctement interprétées |
| Commandes passées via téléphone vocal           | Au moins 10 commandes réussies          |
| Dépanneur autonome (sans support technique)     | À partir de la semaine 2                |
| Aucune fuite de données détectée                | 0 incident                              |
| Coût par commande cloud + téléphonie + assistant | < 1,00 $ CAD                           |
| Retour qualitatif dépanneur                     | Score ≥ 7/10 sur satisfaction globale   |

### Règle

Si au moins 7 critères sur 9 sont atteints à la fin de la semaine 4, le
pilote est déclaré réussi et le déploiement élargi peut être planifié.

---

## DEP-0885 — Définir les critères d'arrêt du pilote

### Objectif

Fixer les conditions qui entraînent l'arrêt immédiat ou anticipé du pilote,
indépendamment de la durée prévue.

### Critères d'arrêt immédiat (bloquants)

| Condition                                            | Action                                              |
|------------------------------------------------------|-----------------------------------------------------|
| Fuite de données personnelles confirmée              | Arrêt immédiat + notification RGPD si applicable   |
| Panne totale de la plateforme > 4 heures             | Arrêt du pilote + post-mortem obligatoire          |
| Demande explicite du dépanneur pilote d'arrêter      | Arrêt immédiat sans condition                      |
| Incident de sécurité avéré (intrusion, accès non autorisé) | Arrêt immédiat + investigation              |
| Coût par commande > 5 $ CAD constaté sur 3 jours     | Arrêt + révision de l'architecture de coûts       |

### Critères d'arrêt décisionnel (à évaluer en fin de semaine 2)

| Condition                                            | Action                                              |
|------------------------------------------------------|-----------------------------------------------------|
| Taux de commandes complétées < 30 % après 2 semaines | Arrêt ou refonte majeure avant reprise             |
| Dépanneur incapable d'utiliser l'interface seul      | Arrêt + refonte UX obligatoire                     |
| Plus de 3 bugs bloquants non résolus en semaine 2    | Arrêt + sprint de correction avant reprise         |

### Règle

Un arrêt de pilote n'est pas un échec définitif — c'est un signal de
correction. La reprise est possible après traitement des causes identifiées.

---

## DEP-0886 — Préparer le tenant pilote dans la plateforme

### Objectif

Définir les étapes de préparation du tenant dédié au dépanneur pilote dans
la plateforme, en utilisant le script d'initialisation (DEP-0676).

### Étapes de préparation du tenant pilote

| Étape | Action                                                                    |
|-------|---------------------------------------------------------------------------|
| 1     | Exécuter le script d'initialisation (DEP-0676) pour créer le tenant      |
| 2     | Affecter un `tenant_id` dédié et un sous-domaine pilote (DEP-0887)       |
| 3     | Créer le compte dépanneur principal avec email et mot de passe temporaire|
| 4     | Configurer la langue par défaut : `fr` (DEP-0683)                        |
| 5     | Configurer le paiement : cash à la livraison uniquement (V1)             |
| 6     | Préparer les catégories (DEP-0889)                                        |
| 7     | Préparer les produits (DEP-0890)                                          |
| 8     | Préparer les photos (DEP-0891)                                            |
| 9     | Préparer les synonymes (DEP-0892)                                         |
| 10    | Configurer la zone de livraison (DEP-0893)                               |
| 11    | Configurer les horaires (DEP-0894)                                        |
| 12    | Vérifier l'isolation tenant (DEP-0678, DEP-0679)                         |
| 13    | Effectuer un test de commande de bout en bout avant remise au dépanneur  |

### Règles

- Le tenant pilote est créé en environnement de **production** — pas de
  bac à sable séparé en V1.
- Toutes les données saisies sont réelles et fournies par le dépanneur pilote.
- Le super admin supervise la préparation complète.

---

## DEP-0887 — Préparer le domaine ou sous-domaine du pilote

### Objectif

Définir la structure d'adresse web utilisée par le dépanneur pilote et ses
clients pour accéder à la boutique.

### Structure retenue en V1

```
[nom-depanneur].depaneuría.com
```

ou si les caractères accentués posent problème :

```
[nom-depanneur].depaneuria.com
```

### Exemples

| Cas                     | URL boutique                          |
|-------------------------|---------------------------------------|
| Dépanneur "Chez Paul"   | `chez-paul.depaneuria.com`            |
| Dépanneur "Express 24"  | `express24.depaneuria.com`            |

### Règles

- Le sous-domaine est en minuscules, sans accent, sans espace.
- Les tirets sont autorisés, les underscores non.
- Le sous-domaine est configuré par le super admin lors de la création du tenant.
- Un domaine personnalisé (ex. `boutique.chezpaul.com`) est une option V2+.
- Le certificat TLS du sous-domaine est provisionné automatiquement (DEP-0780).

---

## DEP-0888 — Préparer le branding du pilote

### Objectif

Définir les éléments de personnalisation visuelle minimaux requis pour que
la boutique pilote reflète l'identité du dépanneur.

### Éléments de branding à préparer

| Élément                  | Format recommandé    | Obligatoire | Notes                        |
|--------------------------|----------------------|-------------|------------------------------|
| Logo du dépanneur        | PNG ou SVG, fond transparent | Recommandé | Affiché dans l'en-tête      |
| Couleur principale       | Code hexadécimal     | Oui         | Boutons, accents             |
| Couleur secondaire       | Code hexadécimal     | Non         | Fond, séparateurs            |
| Nom du dépanneur         | Texte court (< 40 car.) | Oui      | Affiché dans le titre        |
| Slogan ou sous-titre     | Texte court (< 80 car.) | Non      | Affiché sous le nom          |
| Photo de couverture      | JPG/PNG, 1200×400 min | Non        | Bannière de la boutique      |

### Règles

- En l'absence de logo, le nom du dépanneur s'affiche en texte stylisé.
- En l'absence de couleur personnalisée, le thème neutre par défaut s'applique.
- Les images doivent être fournies par le dépanneur — aucune image générée
  ou empruntée sans autorisation.
- Le branding est configurable depuis l'interface admin du dépanneur.

---

## DEP-0889 — Préparer les catégories du pilote

### Objectif

Définir la structure de catégories de produits à mettre en place pour le
dépanneur pilote, servant de base à la navigation et aux filtres (DEP-0322).

### Approche

Les catégories sont définies par le dépanneur pilote selon ses produits réels.
L'équipe peut suggérer une structure de départ basée sur les types de produits
typiques d'un dépanneur québécois.

### Structure de départ suggérée

| Catégorie principale    | Sous-catégories suggérées                              |
|-------------------------|--------------------------------------------------------|
| Boissons                | Eau, Jus, Boissons gazeuses, Boissons énergisantes, Bière, Vin |
| Collations              | Chips, Craquelins, Barres, Bonbons, Chocolat          |
| Produits laitiers       | Lait, Fromage, Yogourt, Crème glacée                  |
| Épicerie de base        | Pain, Œufs, Condiments, Conserves                     |
| Tabac et accessoires    | Cigarettes, Cigares, Allumettes, Briquets              |
| Hygiène et santé        | Médicaments sans ordonnance, Soins, Hygiène           |
| Journaux et magazines   | Journaux, Magazines                                   |
| Articles de maison      | Piles, Ampoules, Articles ménagers courants           |

### Règles

- Le dépanneur valide ou modifie la structure suggérée selon son inventaire réel.
- Les sous-catégories sont optionnelles en V1 (DEP-0323).
- Les noms de catégories sont en français (DEP-0683).
- Le nombre de catégories n'est pas limité techniquement, mais 5 à 10
  catégories principales sont recommandées pour la clarté.

---

## DEP-0890 — Préparer les produits du pilote

### Objectif

Définir les règles et le processus de saisie des produits du dépanneur pilote
dans le catalogue.

### Informations requises par produit

| Champ                    | Obligatoire | Format                         |
|--------------------------|-------------|--------------------------------|
| Nom du produit           | Oui         | Texte court, clair, précis     |
| Catégorie                | Oui         | Parmi les catégories DEP-0889  |
| Prix de vente            | Oui         | Montant en $ CAD               |
| Disponibilité initiale   | Oui         | Disponible par défaut          |
| Photo                    | Recommandé  | Voir DEP-0891                  |
| Description courte       | Non         | Texte libre, < 150 caractères  |
| Synonymes                | Non         | Voir DEP-0892                  |

### Processus de saisie

| Étape | Action                                                                    |
|-------|---------------------------------------------------------------------------|
| 1     | Le dépanneur fournit la liste de ses produits (format libre : papier, tableur, vocal) |
| 2     | L'équipe ou le dépanneur saisit les produits via l'interface admin       |
| 3     | Les produits sont vérifiés : nom clair, prix correct, catégorie affectée |
| 4     | Les photos sont ajoutées (DEP-0891)                                       |
| 5     | Les synonymes sont ajoutés (DEP-0892)                                     |
| 6     | Un test de commande valide que chaque produit est commandable             |

### Règles

- Le nombre minimal de produits recommandé pour un pilote utile est **50**.
- Chaque produit doit avoir un nom compréhensible par l'assistant texte et
  vocal — les abréviations internes doivent être développées.
- Les produits sans prix ne sont pas mis en ligne.

---

## DEP-0891 — Préparer les photos du pilote

### Objectif

Définir les standards et le processus d'ajout des photos de produits pour
le dépanneur pilote.

### Standards photo

| Critère                  | Recommandation                                              |
|--------------------------|-------------------------------------------------------------|
| Format                   | JPG ou PNG                                                  |
| Dimensions minimales     | 400 × 400 pixels (carré recommandé)                       |
| Fond                     | Blanc ou neutre préféré — fond de magasin toléré           |
| Qualité                  | Nette, bien éclairée — pas de photo floue                 |
| Contenu                  | Produit seul, clairement identifiable                      |
| Droits                   | Photo prise par le dépanneur ou image libre de droits      |

### Sources acceptables

| Source                   | Conditions                                                  |
|--------------------------|-------------------------------------------------------------|
| Photo prise par le dépanneur | Toujours acceptable                                    |
| Photo du fabricant       | Acceptable si libre d'utilisation commerciale              |
| Photo de banque d'images | Acceptable si licence commerciale                          |
| Photo copiée d'un concurrent | Interdite                                              |

### Règles

- Une photo de substitution générique (icône de catégorie) est affichée si
  aucune photo n'est fournie.
- Les photos sont stockées dans le répertoire de stockage objet du tenant
  (isolation garantie, DEP-0779).
- Le dépanneur peut mettre à jour les photos à tout moment depuis l'interface
  admin.

---

## DEP-0892 — Préparer les synonymes du pilote

### Objectif

Définir les synonymes et variantes de noms de produits à configurer pour
le dépanneur pilote, afin d'améliorer la compréhension de l'assistant.

### Rôle des synonymes

Les synonymes permettent à l'assistant texte et vocal de reconnaître une
demande client même si elle ne correspond pas exactement au nom du produit
en catalogue.

### Exemples de synonymes à configurer

| Nom officiel en catalogue     | Synonymes à associer                               |
|-------------------------------|-----------------------------------------------------|
| Pepsi 2L                      | pepsi, cola, boisson cola, pepsi grand format      |
| Lait 2 % 1L Natrel            | lait, lait deux pour cent, lait blanc              |
| Chips BBQ Lay's               | chips barbecue, lay's bbq, croustilles barbecue    |
| Eau Montellier 500 mL         | eau, eau gazeuse, petite eau                       |
| Bière Molson Ex 6 canettes    | six-pack molson, molson, bière canadienne          |

### Processus

| Étape | Action                                                                    |
|-------|---------------------------------------------------------------------------|
| 1     | Pour chaque produit, lister les façons dont un client pourrait le demander oralement |
| 2     | Saisir les synonymes dans le champ dédié du produit                      |
| 3     | Tester avec l'assistant texte et vocal que les synonymes sont reconnus   |
| 4     | Ajuster après les premiers jours du pilote selon les incompréhensions    |

### Règles

- Les synonymes sont en français (DEP-0683) en V1.
- Un synonyme ne peut pas pointer vers plusieurs produits différents —
  en cas d'ambiguïté, l'assistant demande une précision (DEP-0385–DEP-0387).
- Les synonymes sont modifiables à tout moment depuis l'interface admin.

---

## DEP-0893 — Préparer la zone de livraison du pilote

### Objectif

Définir le périmètre géographique dans lequel le dépanneur pilote accepte
les livraisons, et les règles associées.

### Informations à configurer

| Champ                         | Description                                                   |
|-------------------------------|---------------------------------------------------------------|
| Zone de livraison             | Rayon en km autour du dépanneur, ou liste de rues / quartiers |
| Adresse du dépanneur          | Point de départ de toutes les livraisons                      |
| Frais de livraison            | Montant fixe en $ CAD (V1 — pas de frais variables)          |
| Commande minimum              | Montant minimum pour déclencher une livraison (optionnel)    |
| Délai estimé                  | Délai indicatif affiché au client (ex. 30–45 min)            |

### Approche V1

- La zone est définie par un **rayon kilométrique** autour de l'adresse du
  dépanneur — c'est la méthode la plus simple à configurer.
- Une zone par liste de rues ou code postal est une option V2+.

### Règles

- Si l'adresse de livraison est hors zone, le client est informé avant de
  finaliser sa commande.
- La zone de livraison est configurable par le dépanneur depuis son interface
  admin.
- Les frais de livraison sont affichés clairement au client avant validation
  du panier.
- La zone pilote recommandée est un rayon de **3 à 5 km** — ajustable selon
  les capacités du livreur.

---

## DEP-0894 — Préparer les horaires du pilote

### Objectif

Définir les heures d'ouverture et de disponibilité de la boutique du
dépanneur pilote, affichées aux clients et utilisées pour bloquer les
commandes hors horaires.

### Informations à configurer

| Champ                         | Description                                                   |
|-------------------------------|---------------------------------------------------------------|
| Jours d'ouverture             | Liste des jours (lundi à dimanche)                           |
| Heure d'ouverture             | Heure de début des commandes acceptées                       |
| Heure de fermeture            | Heure de fin des commandes acceptées                         |
| Horaires spéciaux             | Jours fériés, fermetures exceptionnelles (optionnel en V1)  |
| Message hors horaires         | Texte affiché au client quand la boutique est fermée         |

### Exemple de configuration pilote suggérée

| Jour             | Ouverture | Fermeture |
|------------------|-----------|-----------|
| Lundi – Vendredi | 08h00     | 22h00     |
| Samedi           | 09h00     | 22h00     |
| Dimanche         | 10h00     | 21h00     |

### Comportement hors horaires

- La boutique affiche un message de fermeture (configurable).
- L'assistant texte indique que les commandes ne sont pas disponibles et
  précise l'heure de réouverture.
- L'assistant vocal annonce la fermeture et l'heure de rappel.
- Aucune commande ne peut être soumise hors des horaires configurés.

### Règles

- Les horaires sont configurables par le dépanneur depuis son interface admin.
- Le fuseau horaire par défaut est **America/Toronto** (EST/EDT) pour le
  Québec.
- Les horaires peuvent être modifiés à tout moment et prennent effet
  immédiatement.

---

## Synthèse

| DEP   | Titre                                              | Statut  |
|-------|----------------------------------------------------|---------|
| 0875  | Tableau de bord coûts cloud                        | Défini  |
| 0876  | Tableau de bord coûts téléphonie                   | Défini  |
| 0877  | Tableau de bord coûts assistant                    | Défini  |
| 0878  | Alertes techniques critiques                       | Défini  |
| 0879  | Alertes métier critiques                           | Défini  |
| 0880  | Gel observabilité minimum avant pilote             | Défini  |
| 0881  | Choix du premier dépanneur pilote                  | Défini  |
| 0882  | Objectifs du pilote                                | Défini  |
| 0883  | Durée du pilote                                    | Défini  |
| 0884  | Critères de succès du pilote                       | Défini  |
| 0885  | Critères d'arrêt du pilote                         | Défini  |
| 0886  | Préparation du tenant pilote                       | Défini  |
| 0887  | Domaine ou sous-domaine du pilote                  | Défini  |
| 0888  | Branding du pilote                                 | Défini  |
| 0889  | Catégories du pilote                               | Défini  |
| 0890  | Produits du pilote                                 | Défini  |
| 0891  | Photos du pilote                                   | Défini  |
| 0892  | Synonymes du pilote                                | Défini  |
| 0893  | Zone de livraison du pilote                        | Défini  |
| 0894  | Horaires du pilote                                 | Défini  |
