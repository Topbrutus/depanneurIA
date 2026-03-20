# DEP-0955 à DEP-0974 — Expansion multi-client et évolutions post-V1

## Périmètre

Ce fichier couvre deux sous-blocs de la fin de checklist :

| Plage               | Thème                                                            |
| ------------------- | ---------------------------------------------------------------- |
| DEP-0955 à DEP-0960 | Tests de séparation multi-tenant et gel du modèle d'expansion V1 |
| DEP-0961 à DEP-0974 | Catalogue des améliorations post-V1 classées et évaluées         |

Contrainte absolue : documentation décisionnelle uniquement — aucune feature développée, aucun code produit.

---

## DEP-0955 — Tester la séparation des commandes entre tenants

### Objectif

Vérifier par des tests automatisés qu'une commande appartenant au tenant A est strictement inaccessible depuis le tenant B.

### Scénarios de test à couvrir

| Scénario                                                   | Attendu                               |
| ---------------------------------------------------------- | ------------------------------------- |
| Lire une commande du tenant A avec un token tenant B       | HTTP 403 ou 404                       |
| Lister les commandes du tenant B                           | Zéro résultat concernant le tenant A  |
| Modifier une commande du tenant A via l'API tenant B       | HTTP 403, aucune modification en base |
| Annuler une commande du tenant A en tant qu'admin tenant B | HTTP 403                              |
| Super admin lisant une commande du tenant A                | HTTP 200, accès autorisé              |

### Règles de test

- Les tests utilisent deux tenants distincts créés spécifiquement pour les tests d'isolation (pas les tenants de production).
- Chaque test vérifie la réponse HTTP ET l'absence de modification en base.
- Les tests s'exécutent en CI à chaque pull request touchant la couche service ou les middlewares d'authentification.
- Un test d'isolation qui échoue bloque le merge.

### Définition de "réussite"

La séparation est considérée validée si tous les scénarios passent en vert sur les trois environnements (dev, preprod, prod lors du déploiement initial).

---

## DEP-0956 — Tester la séparation des appels téléphoniques entre tenants

### Objectif

Vérifier qu'un appel entrant destiné au dépanneur A ne peut pas être traité, consulté ou perturbé depuis le tenant B.

### Scénarios de test à couvrir

| Scénario                                                                 | Attendu                                  |
| ------------------------------------------------------------------------ | ---------------------------------------- |
| Consulter l'historique des appels du tenant A avec un token tenant B     | HTTP 403                                 |
| Accéder aux événements téléphoniques du tenant A via l'API tenant B      | Zéro résultat ou HTTP 403                |
| Webhook entrant pour le tenant A routé vers le tenant B                  | Erreur de routage détectée, appel rejeté |
| Numéro de téléphone du tenant A visible dans le tableau de bord tenant B | Absent                                   |
| Super admin consultant les appels du tenant A                            | Accès autorisé                           |

### Règles de test

- Les tests de webhook utilisent des payloads de simulation (pas d'appels réels vers un fournisseur en CI).
- Le routage tenant est vérifié sur la signature du webhook et le `tenant_id` extrait.
- Un test qui laisse passer un événement téléphonique vers le mauvais tenant bloque le merge.

### Définition de "réussite"

Aucun événement d'un tenant ne peut être lu, modifié ou déclenché depuis un autre tenant via l'API ou le mécanisme de webhook.

---

## DEP-0957 — Tester la séparation des livreurs entre tenants

### Objectif

Vérifier qu'un livreur du tenant A ne peut pas voir ni accepter les livraisons du tenant B.

### Scénarios de test à couvrir

| Scénario                                                         | Attendu                                     |
| ---------------------------------------------------------------- | ------------------------------------------- |
| Livreur tenant A consulte la liste des livraisons du tenant B    | HTTP 403                                    |
| Livreur tenant A tente d'accepter une livraison du tenant B      | HTTP 403                                    |
| Admin tenant B voit le livreur tenant A dans son tableau de bord | Absent                                      |
| Livreur tenant A tente de modifier son `tenant_id` via l'API     | HTTP 400 ou 403, champ ignoré               |
| Super admin consulte les livreurs de tous les tenants            | Accès autorisé, données séparées par tenant |

### Règles de test

- Les tests créent des comptes livreurs de test pour deux tenants distincts.
- Les tentatives de manipulation de `tenant_id` dans les requêtes sont testées explicitement.
- Ces tests s'exécutent en CI sur chaque modification de la couche de routage des livraisons.

### Définition de "réussite"

Un livreur ne peut interagir qu'avec les ressources de son propre tenant, sans exception.

---

## DEP-0958 — Vérifier que le support multi-client est vendable sans refaire le produit à la main

### Objectif

Confirmer que l'onboarding d'un nouveau client (tenant) peut se faire en autonomie ou avec une assistance minimale, sans développement spécifique.

### Critères de validation

| Critère                                  | Mesure de réussite                                         |
| ---------------------------------------- | ---------------------------------------------------------- |
| Création du tenant                       | Effectuée par le super admin en moins de 15 minutes        |
| Clonage du catalogue de démonstration    | En 1 clic depuis l'interface super admin                   |
| Personnalisation du nom, logo, couleurs  | Sans toucher au code                                       |
| Activation du numéro téléphonique        | Configuration dans l'interface, pas en CLI                 |
| Invitation du premier admin du dépanneur | Via email, sans accès à la base de données                 |
| Première commande de test                | Possible dans les 30 minutes suivant la création du tenant |

### Règles

- Ces critères sont vérifiés manuellement lors du premier onboarding réel (pas en CI automatique).
- Le résultat de la vérification est documenté dans un rapport d'onboarding (hors de ce fichier).
- Si un critère échoue, un nouveau DEP est ouvert pour corriger le point bloquant.

### Définition de "réussite"

Un client peut être opérationnel (premier test de commande réussi) en moins de 1 heure à partir de zéro, sans intervention de développeur.

---

## DEP-0959 — Vérifier que le temps d'ouverture d'un nouveau client baisse vraiment

### Objectif

Mesurer et confirmer que chaque nouvel onboarding est plus rapide que le précédent grâce aux outils et gabarits mis en place.

### Métriques à suivre

| Métrique                                                | Valeur cible V1  | Valeur cible V2     |
| ------------------------------------------------------- | ---------------- | ------------------- |
| Temps total d'onboarding (création → première commande) | Moins de 1 heure | Moins de 30 minutes |
| Nb d'étapes manuelles requises                          | Moins de 5       | Moins de 3          |
| Nb d'interventions développeur                          | 0                | 0                   |
| Nb de tickets de support générés lors de l'onboarding   | Moins de 2       | 0                   |

### Règles

- Chaque onboarding est chronométré et ses résultats consignés dans un journal d'onboarding (fichier séparé, hors scope ici).
- Les étapes qui dépassent systématiquement les cibles sont identifiées pour amélioration en V1.1.
- La vérification est répétée après chaque amélioration significative du processus.

### Définition de "réussite"

Le 3e onboarding est au moins 30 % plus rapide que le 1er, sans assistance développeur.

---

## DEP-0960 — Gel du modèle d'expansion multi-client V1

### Objectif

Figer les décisions d'architecture multi-tenant (DEP-0955 à DEP-0959) pour éviter toute dérive avant le lancement V1.

### Éléments gelés

| Élément                    | Décision V1                                                    |
| -------------------------- | -------------------------------------------------------------- |
| Modèle d'isolation         | Isolation logique par `tenant_id` dans chaque table/collection |
| Onboarding                 | Manuel via interface super admin (pas d'auto-signup)           |
| Clonage de démo            | En 1 clic depuis le tableau super admin                        |
| Séparation téléphonie      | Un numéro entrant par tenant, routage par signature webhook    |
| Séparation livreurs        | Un livreur appartient à exactement un tenant                   |
| Tests d'isolation          | Automatisés en CI, bloquants au merge                          |
| Critère d'ouverture client | Opérationnel en moins de 1 heure                               |

### Règles

- Toute modification de l'architecture multi-tenant après ce gel doit ouvrir un nouveau DEP documenté.
- Le gel ne couvre pas les améliorations UX de l'onboarding (hors architecture).
- Les tests d'isolation restent en CI de façon permanente, même après le gel.

---

## DEP-0961 — Liste complète des améliorations post-V1

### Objectif

Recenser toutes les améliorations identifiées pendant le développement V1, pour ne rien perdre et prioriser ensuite.

### Catégories d'améliorations identifiées

| Catégorie                  | Exemples d'items                                                                  |
| -------------------------- | --------------------------------------------------------------------------------- |
| Expérience client          | Paiement en ligne, favoris, comptes famille, historique enrichi                   |
| Expérience livreur         | Application native, géolocalisation temps réel, optimisation de tournée           |
| Expérience admin dépanneur | Gestion avancée des stocks, alertes rupture, rapports PDF                         |
| Assistant                  | Reconnaissance multilingue, mémoire longue durée, suggestions proactives          |
| Téléphonie                 | DTMF avancé, transfert vers humain, enregistrement des appels (avec consentement) |
| Infrastructure             | Auto-scaling, déploiements bleus/verts, monitoring avancé                         |
| Multi-tenant               | Auto-signup client, portail en libre-service, facturation automatisée             |
| Sécurité                   | 2FA clients, audit renforcé, conformité PCI si paiement en ligne                  |
| Analytics                  | Prédiction de stock, scoring client, tableaux de bord personnalisables            |
| Promotions                 | Codes promo, réductions automatiques, programmes de fidélité                      |

### Règles

- Cette liste est maintenue dans ce fichier jusqu'à la création d'un backlog officiel post-V1.
- Chaque item est évalué en DEP-0962, 0963 et 0964 avant décision.
- Aucun item de cette liste n'est développé avant la validation du gel V1 (DEP-0960).

---

## DEP-0962 — Classer les améliorations par impact business

### Objectif

Évaluer chaque amélioration post-V1 selon son potentiel à générer de la valeur business (revenus, rétention, acquisition).

### Grille d'impact

| Impact     | Critères                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------ |
| Très élevé | Débloque une nouvelle source de revenus ou réduit l'abandon d'un facteur significatif      |
| Élevé      | Améliore la rétention client ou réduit les coûts opérationnels de façon mesurable          |
| Moyen      | Améliore l'expérience utilisateur sans impact direct et immédiat sur le chiffre d'affaires |
| Faible     | Nice-to-have, différenciateur secondaire                                                   |

### Classement provisoire

| Amélioration                  | Impact estimé | Justification                                                 |
| ----------------------------- | ------------- | ------------------------------------------------------------- |
| Paiement en ligne             | Très élevé    | Débloque un segment client sans espèces                       |
| Promotions et coupons         | Élevé         | Levier de conversion et fidélisation éprouvé                  |
| Favoris                       | Moyen         | Réduit la friction pour les commandes récurrentes             |
| Abonnements de livraison      | Élevé         | Revenus récurrents prévisibles                                |
| Recommandations intelligentes | Moyen         | Augmente le panier moyen                                      |
| Comptes famille               | Moyen         | Élargi la base d'utilisateurs actifs par foyer                |
| Application livreur native    | Élevé         | Réduit la friction opérationnelle et les erreurs de livraison |
| Auto-signup tenant            | Élevé         | Réduit le coût d'acquisition d'un dépanneur client            |

---

## DEP-0963 — Classer les améliorations par effort technique

### Objectif

Évaluer l'effort de développement de chaque amélioration post-V1 pour aider à la priorisation.

### Grille d'effort

| Effort     | Critères                                                                       |
| ---------- | ------------------------------------------------------------------------------ |
| Très élevé | Refonte d'architecture ou intégration d'un nouveau système tiers majeur        |
| Élevé      | Nouvelle surface fonctionnelle importante, plusieurs semaines de développement |
| Moyen      | Ajout de features sur des modules existants, quelques jours à 2 semaines       |
| Faible     | Configuration, UI mineure, ou extension d'une feature existante                |

### Classement provisoire

| Amélioration                  | Effort estimé | Justification                                             |
| ----------------------------- | ------------- | --------------------------------------------------------- |
| Paiement en ligne             | Très élevé    | Intégration PSP, conformité PCI, flux de remboursement    |
| Promotions et coupons         | Élevé         | Moteur de règles, impact sur le calcul du panier          |
| Recommandations intelligentes | Élevé         | Modèle ML ou intégration API tierce                       |
| Abonnements de livraison      | Élevé         | Facturation récurrente, gestion des renouvellements       |
| Favoris                       | Faible        | Extension du profil client existant                       |
| Comptes famille               | Moyen         | Gestion de permissions partagées, lien entre comptes      |
| Application livreur native    | Élevé         | Build mobile natif ou PWA avancée                         |
| Auto-signup tenant            | Moyen         | Extension de l'onboarding existant avec formulaire public |

---

## DEP-0964 — Classer les améliorations par urgence terrain

### Objectif

Évaluer quelles améliorations sont les plus demandées ou bloquantes pour les utilisateurs réels (clients, livreurs, gérants).

### Grille d'urgence

| Urgence  | Critères                                                                         |
| -------- | -------------------------------------------------------------------------------- |
| Critique | Blocage ou friction majeure signalée dès les premiers jours d'utilisation réelle |
| Haute    | Demande répétée par plusieurs utilisateurs, workaround existant mais dégradé     |
| Moyenne  | Confort ou efficacité, pas de blocage                                            |
| Faible   | Demande isolée ou différenciateur à long terme                                   |

### Classement provisoire (à affiner après lancement V1)

| Amélioration                  | Urgence estimée | Justification                                                  |
| ----------------------------- | --------------- | -------------------------------------------------------------- |
| Paiement en ligne             | Haute           | Segment de clients sans espèces non servi                      |
| Favoris                       | Haute           | Commandes récurrentes très fréquentes dans ce type de commerce |
| Application livreur native    | Haute           | UX mobile web limitée pour les livreurs en déplacement         |
| Promotions et coupons         | Moyenne         | Utile mais pas bloquant en phase de démarrage                  |
| Comptes famille               | Moyenne         | Demande anticipée des foyers                                   |
| Recommandations intelligentes | Faible          | Valeur ajoutée perceptible à volume élevé seulement            |
| Abonnements de livraison      | Faible          | Pertinent uniquement avec une base de clients fidèles établie  |

---

## DEP-0965 — Décider des améliorations V1.1

### Objectif

Définir le périmètre de la version 1.1, première itération post-lancement V1.

### Critères de sélection V1.1

- Impact élevé ou très élevé ET effort faible ou moyen
- OU urgence critique ou haute terrain
- ET aucune refonte d'architecture requise

### Améliorations retenues pour V1.1 (provisoire)

| Amélioration                       | Justification                                              |
| ---------------------------------- | ---------------------------------------------------------- |
| Favoris produits                   | Impact moyen, effort faible, urgence haute — gain rapide   |
| Améliorations UX livreur (web)     | Sans application native, optimisations sur le web existant |
| Alertes rupture de stock           | Impact élevé pour les gérants, effort moyen                |
| Rapport journalier PDF ou email    | Demande terrain fréquente, effort faible                   |
| Amélioration des messages d'erreur | Réduction des tickets support, effort très faible          |

### Règles

- La liste V1.1 est finalisée après 30 jours d'utilisation réelle de V1.
- Aucune feature V1.1 ne modifie l'architecture multi-tenant ou le modèle de données principal.
- Un DEP dédié sera ouvert pour chaque feature retenue en V1.1.

---

## DEP-0966 — Décider des améliorations V1.2

### Objectif

Définir le périmètre de la version 1.2, deuxième itération post-lancement.

### Critères de sélection V1.2

- Impact élevé ET effort moyen à élevé
- OU améliorations V1.1 qui ont nécessité plus de travail que prévu et sont reportées
- ET compatibilité avec l'architecture V1 sans refonte

### Améliorations retenues pour V1.2 (provisoire)

| Amélioration                                 | Justification                                                   |
| -------------------------------------------- | --------------------------------------------------------------- |
| Promotions et coupons simples                | Impact élevé sur la fidélisation, effort élevé mais planifiable |
| Comptes famille (base)                       | Demande terrain, effort moyen                                   |
| Auto-signup tenant (formulaire guidé)        | Réduit le coût d'acquisition, effort moyen                      |
| Tableau de bord client enrichi               | Historique, récapitulatifs, statistiques personnelles           |
| Amélioration de l'assistant (mémoire courte) | Retient le contexte sur une session longue                      |

### Règles

- La liste V1.2 est finalisée après 60 à 90 jours d'utilisation réelle de V1.
- Un DEP dédié sera ouvert pour chaque feature retenue en V1.2.

---

## DEP-0967 — Décider des améliorations V2

### Objectif

Définir le périmètre de la version 2, évolution majeure du produit.

### Critères de sélection V2

- Requiert une refonte partielle de l'architecture ou une intégration système majeure
- OU impact très élevé avec effort très élevé
- OU nécessite une validation marché préalable (MVP ou test utilisateur)

### Améliorations retenues pour V2 (provisoire)

| Amélioration                             | Justification                                                           |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| Paiement en ligne                        | Intégration PSP complexe, conformité PCI — impact maximal               |
| Abonnements de livraison                 | Facturation récurrente, modèle de revenus nouveau                       |
| Application livreur native (iOS/Android) | Effort très élevé, validé uniquement si la base livreurs est suffisante |
| Recommandations intelligentes            | Requiert un volume de données suffisant pour être pertinent             |
| Géolocalisation temps réel               | Infrastructure temps réel (WebSocket ou SSE) à valider                  |
| Marketplace multi-dépanneurs             | Refonte majeure du modèle tenant, nouvelle surface produit              |

### Règles

- V2 ne commence pas avant que V1 soit stable en production depuis 6 mois.
- Chaque item V2 fera l'objet d'une évaluation approfondie (étude de faisabilité, estimation, prototype si nécessaire).
- Un DEP de spécification complet sera ouvert pour chaque item retenu en V2.

---

## DEP-0968 — Évaluer l'ajout futur du paiement en ligne

### Objectif

Documenter les enjeux, contraintes et conditions d'activation d'un système de paiement en ligne, sans l'implanter.

### Évaluation

| Dimension         | Analyse                                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Impact business   | Très élevé : débloque les clients sans espèces et réduit la friction à la livraison                                           |
| Effort technique  | Très élevé : intégration PSP (Stripe, Moneris ou autre), gestion des remboursements, webhooks de paiement, conformité PCI DSS |
| Risques           | Conformité réglementaire (PCI), gestion des litiges, fraude, délais de rembours                                               |
| Prérequis         | Volume de commandes stable, partenariat PSP, audit de sécurité                                                                |
| Modèle de données | Ajout d'une table `payments` liée aux commandes, statuts de paiement distincts des statuts de livraison                       |
| Impact sur V1     | Aucun : le paiement à la livraison reste le seul mode en V1                                                                   |

### Conditions d'activation

- Base installée d'au moins 3 dépanneurs actifs avec volume régulier.
- Partenariat PSP signé et intégration testée en sandbox.
- Audit sécurité de la couche paiement réalisé avant mise en production.

---

## DEP-0969 — Évaluer l'ajout futur des promotions

### Objectif

Documenter les enjeux de l'ajout d'un système de promotions (réductions sur produits ou commandes), sans l'implanter.

### Évaluation

| Dimension        | Analyse                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Impact business  | Élevé : levier de conversion, fidélisation, gestion des invendus                                                           |
| Effort technique | Élevé : moteur de règles promotionnelles, impact sur le calcul du panier, interactions avec les coupons et les abonnements |
| Risques          | Complexité des règles (cumulabilité, exclusions), abus potentiels, impact sur les marges                                   |
| Prérequis        | Modèle de panier suffisamment structuré, tests de régression sur le calcul des prix                                        |
| Types envisagés  | Remise en % sur produit, remise fixe sur commande, produit gratuit à partir d'un montant                                   |
| Impact sur V1    | Aucun : aucune promotion en V1                                                                                             |

### Conditions d'activation

- Modèle de données du panier stable depuis au moins 2 mois.
- Tests couvrant tous les cas de calcul du panier avant introduction des promotions.

---

## DEP-0970 — Évaluer l'ajout futur des coupons

### Objectif

Documenter les enjeux de l'ajout de codes de réduction (coupons), sans l'implanter.

### Évaluation

| Dimension                   | Analyse                                                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| Impact business             | Élevé : outil marketing directement dans les mains du gérant                              |
| Effort technique            | Moyen : table de coupons, validation à la saisie, décompte des utilisations               |
| Risques                     | Abus (partage non contrôlé), impact sur les marges si mal paramétré                       |
| Prérequis                   | Système de promotions en place (DEP-0969) ou implémentation indépendante simple           |
| Types envisagés             | Code unique à usage unique, code générique limité en nombre, code personnalisé par client |
| Interaction avec promotions | Un coupon peut coexister avec une promotion si les règles le permettent                   |
| Impact sur V1               | Aucun coupon en V1                                                                        |

### Conditions d'activation

- Interface admin permettant au gérant de créer et désactiver des coupons sans développement.
- Validation du coupon côté serveur uniquement (jamais côté client seul).

---

## DEP-0971 — Évaluer l'ajout futur des comptes famille

### Objectif

Documenter les enjeux de la gestion d'un compte partagé entre membres d'un même foyer, sans l'implanter.

### Évaluation

| Dimension        | Analyse                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Impact business  | Moyen : élargit la base d'utilisateurs actifs par foyer, augmente la fréquence des commandes   |
| Effort technique | Moyen : lien entre comptes, permissions partagées, historique commun ou séparé selon choix     |
| Risques          | Gestion des conflits (deux membres commandent simultanément), vie privée entre membres         |
| Prérequis        | Modèle de profil client stable, système de notifications fonctionnel                           |
| Modèle envisagé  | Un compte "principal" crée le groupe famille, invite des membres par numéro de téléphone       |
| Permissions      | Tous les membres peuvent commander, seul le principal peut voir toutes les commandes du groupe |
| Impact sur V1    | Chaque numéro est un compte indépendant en V1                                                  |

### Conditions d'activation

- Validation du besoin terrain après 90 jours de V1 en production.
- Modèle de consentement documenté (un membre invité doit accepter explicitement).

---

## DEP-0972 — Évaluer l'ajout futur des favoris

### Objectif

Documenter les enjeux de la sauvegarde de produits favoris par un client, sans l'implanter.

### Évaluation

| Dimension                       | Analyse                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| Impact business                 | Moyen à élevé : réduit la friction pour les commandes récurrentes, augmente la rétention    |
| Effort technique                | Faible : table `favorites` liée à `client_id` et `product_id`, UI de gestion dans le profil |
| Risques                         | Synchronisation si un produit favori est archivé ou modifié                                 |
| Prérequis                       | Profil client stable, UI de catalogue opérationnelle                                        |
| Comportement si produit archivé | Favori conservé avec mention "non disponible", non retiré automatiquement                   |
| Interaction avec l'assistant    | L'assistant peut proposer en priorité les produits favoris si activé                        |
| Impact sur V1                   | Aucun favori en V1, mais le champ `product_id` dans le profil est prévu                     |

### Conditions d'activation

- Implémentable en V1.1 si la demande terrain est confirmée lors des premiers retours utilisateurs.
- Aucune dépendance avec les autres features post-V1.

---

## DEP-0973 — Évaluer l'ajout futur des abonnements de livraison

### Objectif

Documenter les enjeux d'un abonnement mensuel donnant droit à des livraisons gratuites ou réduites, sans l'implanter.

### Évaluation

| Dimension        | Analyse                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| Impact business  | Élevé : revenus récurrents prévisibles, fidélisation forte des clients réguliers                      |
| Effort technique | Élevé : facturation récurrente, gestion des renouvellements, intégration PSP obligatoire              |
| Risques          | Abus (abonnement pour une commande ponctuelle), annulations en masse, dépendance au paiement en ligne |
| Prérequis        | Paiement en ligne opérationnel (DEP-0968), base de clients avec historique de commandes               |
| Modèle envisagé  | Abonnement mensuel fixe, nombre de livraisons gratuites par mois ou frais de livraison réduits        |
| Impact sur V1    | Aucun abonnement en V1, frais de livraison fixes ou nuls selon le dépanneur                           |

### Conditions d'activation

- Paiement en ligne stable depuis au moins 3 mois.
- Au moins 50 clients actifs par tenant avant de proposer l'abonnement.
- Modèle de prix validé avec les gérants pilotes.

---

## DEP-0974 — Évaluer l'ajout futur de recommandations intelligentes

### Objectif

Documenter les enjeux d'un système de recommandations de produits basé sur l'historique et les tendances, sans l'implanter.

### Évaluation

| Dimension                    | Analyse                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Impact business              | Moyen à élevé (à volume élevé) : augmentation du panier moyen, découverte de nouveaux produits                            |
| Effort technique             | Élevé : modèle collaboratif ou basé sur le contenu, infrastructure ML ou API tierce, cold start pour les nouveaux clients |
| Risques                      | Recommandations non pertinentes à faible volume (effet contre-productif), biais si données insuffisantes                  |
| Prérequis                    | Minimum 500 commandes par tenant pour un modèle pertinent, infrastructure de traitement batch                             |
| Approches envisagées         | Règles simples (fréquemment achetés ensemble), collaborative filtering, API de recommandation tierce                      |
| Intégration avec l'assistant | L'assistant peut utiliser les recommandations pour suggérer des produits complémentaires                                  |
| Impact sur V1                | Aucune recommandation personnalisée en V1 ; le top 10 dynamique (DEP-0871) en est la version simplifiée                   |

### Conditions d'activation

- Volume de données suffisant par tenant (minimum 500 commandes).
- Validation que les recommandations améliorent effectivement le taux de conversion (test A/B requis avant déploiement général).
- Choix de l'approche (règles vs ML vs API tierce) documenté dans un DEP dédié.
