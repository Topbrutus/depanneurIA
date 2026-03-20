# DEP-0835 à DEP-0854 — QA manuelle et métriques fondation

## Périmètre

Ce document couvre deux sous-blocs contigus :

1. **DEP-0835–DEP-0840** : Les **tests de charge et checklists de QA manuelle** —
   tests de charge des appels simultanés, checklists de QA manuelle, mobile,
   accessibilité, téléphonie, et gel de la discipline qualité avant le pilote.

2. **DEP-0841–DEP-0854** : La **définition des métriques principales** et des
   **journaux d'événements** — métriques produit, business, techniques, de
   satisfaction, par canal (assistant texte, voix web, téléphone), par rôle
   (livreur, dépanneur), multi-tenant, et journaux d'événements pour client,
   dépanneur, livreur et assistant.

Ces décisions s'appuient sur les tests unitaires et d'intégration définis en
DEP-0811–DEP-0833, sur les stratégies de monitoring définies en DEP-0735–DEP-0736,
sur les stratégies de journalisation sécurisée en DEP-0777–DEP-0778, et sur
l'architecture multi-tenant gelée en DEP-0680.

Il s'agit exclusivement de **documentation** : aucun code d'observabilité réel,
aucune implémentation.

---

## DEP-0835 — Tests de charge des appels simultanés si utile

### Objectif

Définir les scénarios de tests de charge permettant de valider la capacité du
système à gérer plusieurs appels téléphoniques simultanés et plusieurs sessions
d'assistant simultanées sans dégradation significative.

### Contexte

Les tests de charge sont **optionnels en V1** et ne sont requis que si le
pilote initial prévoit plus de 3 appels simultanés ou plus de 10 sessions
d'assistant actives en parallèle. Si le volume prévu est inférieur, ces tests
peuvent être reportés en V2+.

### Scénarios de charge V1 (si utile)

| Scénario                                 | Objectif du test                                           |
| ---------------------------------------- | ---------------------------------------------------------- |
| 5 appels téléphoniques simultanés        | Vérifier que les 5 appels sont pris en charge sans timeout |
| 10 sessions d'assistant texte actives    | Vérifier que les réponses arrivent en moins de 3 secondes  |
| 20 clients consultant le catalogue       | Vérifier que le temps de chargement reste < 2 secondes     |
| 5 dépanneurs accédant au tableau de bord | Vérifier l'affichage sans erreur ni délai > 3 secondes     |

### Métriques attendues

| Métrique                              | Seuil acceptable V1 |
| ------------------------------------- | ------------------- |
| Temps de réponse de l'assistant texte | < 3 secondes (p95)  |
| Temps de réponse téléphonie           | < 2 secondes (p95)  |
| Taux de succès des appels             | > 95 %              |
| Taux de succès des sessions assistant | > 98 %              |
| CPU moyen Cloud Run                   | < 70 %              |
| Mémoire moyenne Cloud Run             | < 75 %              |

### Outils recommandés

| Outil                   | Utilisation                                                 |
| ----------------------- | ----------------------------------------------------------- |
| k6 ou Artillery         | Tests de charge HTTP (API, front)                           |
| Twilio Load Test        | Simulation d'appels téléphoniques multiples (si disponible) |
| Google Cloud Monitoring | Mesure des métriques système pendant le test                |

### Règles

- Les tests de charge **ne sont obligatoires que si le volume prévu le justifie**.
- Les tests de charge sont exécutés en environnement de staging **uniquement**,
  jamais en production.
- Les résultats sont documentés dans un rapport de test avant le lancement du
  pilote.
- Si les seuils ne sont pas atteints, les causes sont identifiées et un plan
  d'optimisation est défini.

---

## DEP-0836 — Checklist de QA manuelle

### Objectif

Définir une checklist complète permettant de valider manuellement les parcours
principaux de la plateforme avant chaque déploiement en production.

### Parcours client

| #   | Action à tester                                  | Résultat attendu                                            |
| --- | ------------------------------------------------ | ----------------------------------------------------------- |
| 1   | Ouvrir la boutique sans compte                   | Affichage du catalogue, panier vide visible                 |
| 2   | Ajouter un produit au panier en mode manuel      | Produit ajouté, compteur panier mis à jour                  |
| 3   | Retirer un produit du panier                     | Produit retiré, compteur mis à jour                         |
| 4   | Valider le panier                                | Écran de connexion/inscription affiché                      |
| 5   | Créer un compte avec téléphone et OTP            | Compte créé, redirection vers adresse de livraison          |
| 6   | Saisir une adresse valide dans la zone desservie | Adresse acceptée, affichage du récapitulatif                |
| 7   | Confirmer la commande                            | Commande créée, statut « En attente » visible               |
| 8   | Consulter le suivi de commande                   | Statut actuel affiché avec barre de progression             |
| 9   | Ouvrir l'assistant texte                         | Panel assistant ouvert, message de bienvenue affiché        |
| 10  | Poser une question sur un produit à l'assistant  | Réponse pertinente avec suggestions de produits             |
| 11  | Commander via l'assistant texte                  | Produits ajoutés au panier, confirmation affichée           |
| 12  | Basculer vers le mode voix web                   | Bouton micro activable, reconnaissance vocale active        |
| 13  | Commander via la voix web                        | Commande vocale comprise, produits ajoutés                  |
| 14  | Consulter l'historique des commandes             | Liste des commandes passées affichée correctement           |
| 15  | Recommander la dernière commande                 | Panier pré-rempli avec les produits de la dernière commande |

### Parcours dépanneur

| #   | Action à tester                                | Résultat attendu                                          |
| --- | ---------------------------------------------- | --------------------------------------------------------- |
| 1   | Se connecter en tant que dépanneur             | Accès au tableau de bord réception                        |
| 2   | Voir une nouvelle commande arriver             | Alerte sonore, commande visible dans « En attente »       |
| 3   | Accepter une commande                          | Statut passe à « En préparation »                         |
| 4   | Marquer une commande comme prête               | Statut passe à « Prête à livrer »                         |
| 5   | Assigner une commande à un livreur             | Statut passe à « Assignée », notification livreur envoyée |
| 6   | Signaler un article manquant                   | Journal d'activité mis à jour, note visible               |
| 7   | Proposer un remplacement                       | Notification client envoyée, attente confirmation         |
| 8   | Annuler une commande                           | Statut passe à « Annulée », client notifié                |
| 9   | Consulter le journal d'activité d'une commande | Timeline complète avec horodatages et acteurs             |
| 10  | Filtrer les commandes par statut               | Seules les commandes du statut sélectionné affichées      |

### Parcours livreur

| #   | Action à tester                       | Résultat attendu                                      |
| --- | ------------------------------------- | ----------------------------------------------------- |
| 1   | Se connecter en tant que livreur      | Accès à la liste des livraisons disponibles           |
| 2   | Accepter une livraison                | Livraison passe dans « Assignées », statut mis à jour |
| 3   | Marquer « Parti pour livraison »      | Statut passe à « En livraison »                       |
| 4   | Marquer « Arrivé chez le client »     | Statut passe à « Arrivé », client peut être notifié   |
| 5   | Marquer « Livrée »                    | Statut passe à « Livrée », livraison terminée         |
| 6   | Signaler un problème de livraison     | Statut passe à « Problème », dépanneur notifié        |
| 7   | Consulter les détails d'une livraison | Adresse, téléphone, notes et contenu affichés         |
| 8   | Appeler le client depuis la fiche     | Numéro cliquable, appel téléphonique déclenché        |

### Parcours super admin

| #   | Action à tester                                | Résultat attendu                                       |
| --- | ---------------------------------------------- | ------------------------------------------------------ |
| 1   | Se connecter en tant que super admin           | Accès au tableau de bord super admin                   |
| 2   | Créer un nouveau tenant                        | Tenant créé avec identifiant unique                    |
| 3   | Activer/désactiver un tenant                   | Statut du tenant mis à jour, accès bloqué si désactivé |
| 4   | Consulter les commandes d'un tenant spécifique | Seules les commandes de ce tenant affichées            |
| 5   | Créer un utilisateur dépanneur pour un tenant  | Utilisateur créé avec accès limité à son tenant        |
| 6   | Créer un utilisateur livreur pour un tenant    | Utilisateur créé avec accès limité à son tenant        |
| 7   | Consulter les métriques globales               | Métriques multi-tenant affichées correctement          |

### Règles

- La checklist doit être parcourue **au complet** avant chaque déploiement en
  production.
- Chaque action doit être cochée manuellement par un testeur.
- En cas d'échec sur une action, un ticket doit être créé et l'action retestée
  après correction.
- La checklist peut être complétée au fil des sprints si de nouveaux parcours
  sont ajoutés.

---

## DEP-0837 — Checklist de QA mobile

### Objectif

Définir une checklist spécifique aux appareils mobiles (smartphones, tablettes)
afin de valider les comportements responsive et tactiles de la plateforme.

### Appareils cibles

| Type d'appareil    | Résolution minimale testée | Navigateur                    |
| ------------------ | -------------------------- | ----------------------------- |
| Smartphone Android | 360×640 px                 | Chrome Mobile, Firefox Mobile |
| Smartphone iOS     | 375×667 px (iPhone SE)     | Safari Mobile                 |
| Tablette Android   | 768×1024 px                | Chrome Mobile                 |
| Tablette iOS       | 768×1024 px (iPad)         | Safari Mobile                 |

### Checklist mobile

| #   | Action à tester                                      | Résultat attendu                                               |
| --- | ---------------------------------------------------- | -------------------------------------------------------------- |
| 1   | Ouvrir la boutique sur smartphone                    | Affichage responsive, grille produits sur 1 colonne            |
| 2   | Ajouter un produit au panier par tap                 | Produit ajouté, animation de feedback visible                  |
| 3   | Ouvrir le panier flottant                            | Panel panier s'ouvre en overlay plein écran                    |
| 4   | Fermer le panier avec swipe vers le bas              | Panel se ferme, retour au catalogue                            |
| 5   | Ouvrir l'assistant texte en mode mobile              | Panel assistant s'ouvre en plein écran                         |
| 6   | Taper un message dans l'assistant                    | Clavier virtuel s'ouvre sans masquer le champ de saisie        |
| 7   | Activer le mode voix web sur mobile                  | Bouton micro visible, reconnaissance activée                   |
| 8   | Parcourir le suivi de commande en mode portrait      | Barre de progression et étapes lisibles                        |
| 9   | Tourner l'appareil en mode paysage                   | Layout s'adapte, contenu reste lisible                         |
| 10  | Zoomer sur une image produit avec pinch              | Zoom fonctionnel, image haute résolution chargée               |
| 11  | Tester les formulaires (inscription, adresse)        | Champs bien espacés, clavier adapté (numérique pour téléphone) |
| 12  | Tester la navigation avec le pouce (zone accessible) | Boutons principaux accessibles en bas de l'écran               |
| 13  | Tester la performance de chargement en 3G            | Temps de chargement < 5 secondes                               |
| 14  | Tester la déconnexion réseau                         | Message d'erreur clair, tentative de reconnexion auto          |
| 15  | Consulter le tableau de bord dépanneur sur tablette  | Layout desktop affiché, tableau lisible                        |

### Règles

- La checklist mobile est testée sur **au moins 2 appareils physiques réels**
  (1 Android, 1 iOS).
- Les émulateurs Chrome DevTools peuvent être utilisés pour les tests préliminaires,
  mais ne remplacent pas les tests sur appareil réel.
- Les performances en 3G sont testées en throttling réseau (Chrome DevTools
  ou Firefox Responsive Design Mode).
- Toute anomalie visuelle ou comportementale doit être documentée avec une
  capture d'écran.

---

## DEP-0838 — Checklist de QA accessibilité

### Objectif

Définir une checklist permettant de vérifier la conformité de la plateforme
aux standards d'accessibilité WCAG 2.1 niveau AA (DEP-0057, DEP-0173).

### Checklist accessibilité

| #   | Critère à tester                                     | Résultat attendu                                               |
| --- | ---------------------------------------------------- | -------------------------------------------------------------- |
| 1   | Contraste des couleurs (texte / fond)                | Ratio ≥ 4.5:1 pour texte normal, ≥ 3:1 pour texte large        |
| 2   | Navigation au clavier seul (Tab, Enter, Échap)       | Tous les éléments interactifs accessibles et activables        |
| 3   | Focus visible sur tous les éléments interactifs      | Bordure de focus visible et contrastée                         |
| 4   | Lecteur d'écran : annonce des titres de page         | Titre de page correctement annoncé (NVDA, VoiceOver)           |
| 5   | Lecteur d'écran : annonce des labels de formulaire   | Chaque champ a un label associé et annoncé                     |
| 6   | Lecteur d'écran : annonce des boutons                | Rôle et texte de bouton correctement annoncés                  |
| 7   | Lecteur d'écran : annonce des erreurs de validation  | Message d'erreur annoncé et lié au champ concerné              |
| 8   | Attributs ARIA correctement utilisés                 | `aria-label`, `aria-labelledby`, `role` présents si nécessaire |
| 9   | Images décoratives marquées comme `alt=""`           | Lecteur d'écran ignore les images décoratives                  |
| 10  | Images informatives ont un `alt` descriptif          | Texte alternatif pertinent et concis                           |
| 11  | Vidéos et contenus audio ont des transcriptions      | Hors périmètre V1 (pas de vidéo)                               |
| 12  | Zoom à 200 % sans perte de contenu                   | Mise en page responsive, pas de contenu tronqué                |
| 13  | Pas de clignotement > 3 fois par seconde             | Aucune animation dangereuse pour épilepsie                     |
| 14  | Liens et boutons ont des textes explicites           | Pas de « Cliquez ici » ou « En savoir plus » seul              |
| 15  | Assistant vocal web accessible au clavier            | Activation micro par Entrée, arrêt par Échap                   |
| 16  | Messages d'erreur compréhensibles sans couleur seule | Texte + icône pour indiquer l'erreur                           |
| 17  | Temps de session suffisant ou extensible             | Avertissement avant expiration (DEP-0767)                      |
| 18  | Navigation cohérente sur toutes les pages            | Menu et fil d'Ariane identiques sur toutes les pages           |

### Outils recommandés

| Outil                    | Utilisation                                         |
| ------------------------ | --------------------------------------------------- |
| axe DevTools (extension) | Détection automatique des problèmes d'accessibilité |
| WAVE (extension)         | Analyse visuelle des erreurs d'accessibilité        |
| NVDA (Windows)           | Test au lecteur d'écran                             |
| VoiceOver (macOS/iOS)    | Test au lecteur d'écran                             |
| Contrast Checker         | Vérification du ratio de contraste des couleurs     |

### Règles

- La checklist accessibilité doit être parcourue **avant chaque déploiement majeur**.
- Un testeur avec un lecteur d'écran doit valider au moins les parcours principaux
  (connexion, ajout au panier, commande, suivi).
- Les anomalies de niveau AA sont **bloquantes** pour le déploiement en production.
- Les anomalies de niveau AAA sont documentées pour amélioration future (V2+).

---

## DEP-0839 — Checklist de QA téléphonie

### Objectif

Définir une checklist spécifique au canal téléphonique vocal (IVR / assistant
vocal) afin de valider les flux d'appel et la qualité de reconnaissance vocale.

### Checklist téléphonie

| #   | Scénario à tester                                                        | Résultat attendu                                           |
| --- | ------------------------------------------------------------------------ | ---------------------------------------------------------- |
| 1   | Appeler le numéro du tenant depuis un téléphone fixe                     | Appel pris en charge, message de bienvenue joué            |
| 2   | Appeler le numéro du tenant depuis un mobile                             | Appel pris en charge, message de bienvenue joué            |
| 3   | Écouter le message de bienvenue complet                                  | Message clair, sans coupure, voix naturelle                |
| 4   | Prononcer un nom de produit simple (ex. « freins »)                      | Produit reconnu, confirmation vocale correcte              |
| 5   | Prononcer un nom de produit complexe (ex. « plaquettes de frein avant ») | Produit reconnu ou demande de clarification                |
| 6   | Prononcer un synonyme (ex. « pneus » au lieu de « roues »)               | Synonyme reconnu, produit correct suggéré                  |
| 7   | Interrompre l'assistant pendant qu'il parle                              | Assistant s'arrête et écoute la nouvelle instruction       |
| 8   | Ne rien dire pendant 10 secondes                                         | Assistant demande si l'utilisateur est toujours là         |
| 9   | Ne rien dire pendant 30 secondes                                         | Appel terminé avec message de courtoisie                   |
| 10  | Dire « non » à une proposition de produit                                | Assistant propose une alternative ou demande clarification |
| 11  | Confirmer une commande par « oui »                                       | Commande créée, confirmation vocale envoyée                |
| 12  | Annuler une commande par « annuler » ou « arrêter »                      | Commande annulée, confirmation vocale envoyée              |
| 13  | Donner un numéro de téléphone à 10 chiffres                              | Numéro reconnu correctement, confirmation demandée         |
| 14  | Donner une adresse complète                                              | Adresse reconnue, validation de zone de livraison          |
| 15  | Appeler hors des heures d'ouverture                                      | Message d'indisponibilité joué, horaires annoncés          |
| 16  | Appeler depuis un numéro bloqué (test limitation)                        | Message d'indisponibilité temporaire (DEP-0776)            |
| 17  | Tester une coupure réseau pendant l'appel                                | Appel coupé, journalisation de l'incident (DEP-0777)       |
| 18  | Rappeler après coupure                                                   | Reprise possible, panier conservé si compte existant       |

### Environnements de test

| Environnement | Numéro de téléphone        | Utilisation                       |
| ------------- | -------------------------- | --------------------------------- |
| Développement | Numéro Twilio de test      | Tests automatisés                 |
| Staging       | Numéro Twilio de staging   | QA manuelle avant production      |
| Production    | Numéro définitif du tenant | Tests post-déploiement uniquement |

### Règles

- La checklist téléphonie est testée sur **au moins 3 appareils différents**
  (fixe, mobile iOS, mobile Android).
- Les tests sont réalisés dans des conditions de bruit ambiant variables
  (silencieux, bruit léger, bruit modéré).
- Les transcriptions des appels de test sont conservées pendant 7 jours pour
  analyse en cas d'anomalie.
- Tout échec de reconnaissance vocale sur un produit du catalogue doit déclencher
  l'ajout d'un synonyme (DEP-0270).

---

## DEP-0840 — Geler la discipline qualité avant pilote

### Objectif

Définir l'ensemble des pratiques de qualité qui doivent être en place et
stabilisées **avant le lancement du premier pilote client**.

### Pratiques obligatoires avant pilote

| Pratique                                   | Responsable        | Statut attendu               |
| ------------------------------------------ | ------------------ | ---------------------------- |
| Checklist de QA manuelle (DEP-0836)        | QA / Product Owner | Complétée et validée         |
| Checklist de QA mobile (DEP-0837)          | QA / Product Owner | Complétée et validée         |
| Checklist de QA accessibilité (DEP-0838)   | QA / Product Owner | Complétée et validée         |
| Checklist de QA téléphonie (DEP-0839)      | QA / Product Owner | Complétée et validée         |
| Tests unitaires principaux (DEP-0811–0819) | Développeurs       | > 80 % de couverture         |
| Tests d'intégration (DEP-0820–0824)        | Développeurs       | Parcours principaux couverts |
| Tests de bout en bout (DEP-0825–0830)      | Développeurs / QA  | Parcours principaux couverts |
| Tests de charge (DEP-0835) si utile        | DevOps / QA        | Seuils validés ou N/A        |
| Pipeline CI/CD (DEP-0801–0810)             | DevOps             | Actif et stable              |
| Monitoring (DEP-0736)                      | DevOps             | Alertes configurées          |
| Logging (DEP-0735)                         | DevOps             | Logs centralisés             |
| Plan de rollback                           | DevOps             | Documenté et testé           |
| Documentation utilisateur (aide en ligne)  | Product Owner      | Publiée                      |

### Critères de gel de la qualité

| Critère                             | Seuil acceptable                |
| ----------------------------------- | ------------------------------- |
| Taux de réussite de la checklist QA | 100 % (toutes actions validées) |
| Couverture des tests automatisés    | > 80 % du code critique         |
| Temps de build CI/CD                | < 10 minutes                    |
| Temps de déploiement en staging     | < 5 minutes                     |
| Taux de succès des déploiements     | > 95 % (19 sur 20 réussis)      |
| Nombre de bugs critiques ouverts    | 0                               |
| Nombre de bugs majeurs ouverts      | < 3                             |

### Processus de gel

1. **Audit de qualité complet** : parcourir toutes les checklists DEP-0836–0839.
2. **Revue de couverture de tests** : vérifier que les tests automatisés couvrent
   les parcours critiques.
3. **Validation des métriques** : confirmer que tous les critères de gel sont
   atteints.
4. **Approbation formelle** : réunion de validation avec Product Owner, QA Lead
   et Tech Lead.
5. **Gel documenté** : publication d'un rapport de gel de qualité dans la
   documentation.

### Règles

- Le gel de qualité est **obligatoire avant le déploiement en production du
  premier tenant pilote**.
- Si un critère de gel n'est pas atteint, le lancement du pilote est reporté
  jusqu'à correction.
- Le gel de qualité est **reconduit à chaque version majeure** (v1.1, v1.2, etc.).
- Les évolutions mineures (hotfixes, patches) ne nécessitent pas de nouveau gel
  complet, mais doivent passer les tests de non-régression.

---

## DEP-0841 — Métriques produit principales

### Objectif

Définir les métriques permettant de mesurer l'usage, l'engagement et la performance
de la plateforme du point de vue produit.

### Métriques d'usage

| Métrique                                  | Définition                                                    | Fréquence de mesure |
| ----------------------------------------- | ------------------------------------------------------------- | ------------------- |
| Nombre de visiteurs uniques par jour      | Nombre de sessions distinctes sur le site client              | Quotidienne         |
| Nombre de commandes par jour              | Nombre de commandes créées (tous statuts confondus)           | Quotidienne         |
| Taux de conversion panier → commande      | (Commandes confirmées / Paniers créés) × 100                  | Quotidienne         |
| Nombre de produits par commande (moyenne) | Somme des produits de toutes commandes / Nombre de commandes  | Hebdomadaire        |
| Taux de reprise dernière commande         | (Commandes issues de « Recommander » / Total commandes) × 100 | Hebdomadaire        |
| Taux d'utilisation du top 10              | (Commandes contenant ≥1 produit du top 10 / Total) × 100      | Hebdomadaire        |

### Métriques d'engagement

| Métrique                         | Définition                                             | Fréquence de mesure |
| -------------------------------- | ------------------------------------------------------ | ------------------- |
| Durée moyenne de session         | Temps passé sur le site par session                    | Quotidienne         |
| Nombre de pages vues par session | Moyenne du nombre de pages consultées par visite       | Quotidienne         |
| Taux de rebond                   | (Sessions à 1 page / Total sessions) × 100             | Quotidienne         |
| Taux de retour (clients fidèles) | (Clients ayant commandé ≥2 fois / Total clients) × 100 | Hebdomadaire        |
| Fréquence de commande moyenne    | Nombre de commandes par client actif                   | Hebdomadaire        |

### Métriques de performance

| Métrique                          | Définition                                               | Fréquence de mesure |
| --------------------------------- | -------------------------------------------------------- | ------------------- |
| Temps de chargement moyen (p95)   | Temps de chargement de la page d'accueil (percentile 95) | Quotidienne         |
| Temps de réponse API (p95)        | Temps de réponse de l'API backend (percentile 95)        | Quotidienne         |
| Taux d'erreurs HTTP 5xx           | (Erreurs 5xx / Total requêtes HTTP) × 100                | En temps réel       |
| Disponibilité du service (uptime) | (Temps de disponibilité / Temps total) × 100             | Mensuelle           |

### Règles

- Les métriques produit sont **visualisées dans un tableau de bord dédié**
  accessible au Product Owner et au super admin.
- Les métriques sont collectées **sans identifier nominalement les utilisateurs**
  (conformité RGPD).
- Les seuils d'alerte sont définis par le Product Owner en fonction des objectifs
  du pilote.

---

## DEP-0842 — Métriques business principales

### Objectif

Définir les métriques permettant de mesurer la valeur économique et l'impact
business de la plateforme.

### Métriques de chiffre d'affaires (si applicable V2+)

En V1, **le paiement se fait à la livraison** et aucun prix public n'est
obligatoire (DEP-0015). Les métriques de CA sont donc **reportées en V2+**.

| Métrique                           | Définition                                   | Fréquence de mesure |
| ---------------------------------- | -------------------------------------------- | ------------------- |
| Nombre de commandes livrées        | Nombre de commandes avec statut « Livrée »   | Quotidienne         |
| Nombre de commandes annulées       | Nombre de commandes avec statut « Annulée »  | Quotidienne         |
| Taux d'annulation                  | (Commandes annulées / Total commandes) × 100 | Quotidienne         |
| Nombre de commandes problématiques | Nombre de commandes avec statut « Problème » | Quotidienne         |
| Taux de problèmes                  | (Commandes problème / Total commandes) × 100 | Quotidienne         |

### Métriques opérationnelles

| Métrique                                 | Définition                                         | Fréquence de mesure |
| ---------------------------------------- | -------------------------------------------------- | ------------------- |
| Temps moyen de préparation               | Temps entre « En attente » et « Prête à livrer »   | Quotidienne         |
| Temps moyen de livraison                 | Temps entre « Assignée » et « Livrée »             | Quotidienne         |
| Temps total moyen (commande → livraison) | Temps entre création et livraison                  | Quotidienne         |
| Nombre de livraisons par livreur/jour    | Moyenne du nombre de livraisons par livreur actif  | Quotidienne         |
| Nombre de commandes par dépanneur/jour   | Moyenne du nombre de commandes par dépanneur actif | Quotidienne         |

### Métriques de satisfaction indirecte

| Métrique                     | Définition                                             | Fréquence de mesure |
| ---------------------------- | ------------------------------------------------------ | ------------------- |
| Taux de reprise de commande  | (Clients ayant commandé ≥2 fois / Total clients) × 100 | Hebdomadaire        |
| Taux de rétention à 30 jours | (Clients actifs J+30 / Total clients J) × 100          | Mensuelle           |

### Règles

- Les métriques business sont **partagées avec le tenant pilote** pour ajuster
  les processus opérationnels.
- Les métriques de temps (préparation, livraison) sont **croisées avec les
  indicateurs d'urgence** (DEP-0516) pour détecter les goulots.
- Les anomalies (ex. taux d'annulation > 10 %) déclenchent une alerte au super
  admin.

---

## DEP-0843 — Métriques techniques principales

### Objectif

Définir les métriques permettant de surveiller la santé technique de la
plateforme et de détecter les incidents.

### Métriques d'infrastructure

| Métrique                                | Définition                                        | Fréquence de mesure |
| --------------------------------------- | ------------------------------------------------- | ------------------- |
| Utilisation CPU moyenne (Cloud Run)     | Moyenne du CPU consommé par les instances         | Temps réel          |
| Utilisation mémoire moyenne (Cloud Run) | Moyenne de la mémoire consommée par les instances | Temps réel          |
| Nombre d'instances actives              | Nombre d'instances Cloud Run en cours d'exécution | Temps réel          |
| Temps de démarrage à froid (cold start) | Temps de démarrage d'une nouvelle instance        | Quotidienne         |
| Nombre de requêtes HTTP/min             | Nombre de requêtes HTTP reçues par l'API          | Temps réel          |

### Métriques de base de données

| Métrique                            | Définition                                          | Fréquence de mesure |
| ----------------------------------- | --------------------------------------------------- | ------------------- |
| Nombre de connexions actives        | Nombre de connexions PostgreSQL ouvertes            | Temps réel          |
| Temps de réponse des requêtes (p95) | Percentile 95 du temps d'exécution des requêtes SQL | Temps réel          |
| Taille de la base de données        | Espace disque utilisé par la base PostgreSQL        | Quotidienne         |
| Nombre de transactions/min          | Nombre de transactions SQL par minute               | Temps réel          |

### Métriques de logs et erreurs

| Métrique                           | Définition                                              | Fréquence de mesure |
| ---------------------------------- | ------------------------------------------------------- | ------------------- |
| Nombre d'erreurs 4xx/min           | Nombre d'erreurs client (400, 401, 403, 404) par minute | Temps réel          |
| Nombre d'erreurs 5xx/min           | Nombre d'erreurs serveur (500, 502, 503) par minute     | Temps réel          |
| Nombre de logs de niveau ERROR/min | Nombre de logs de niveau ERROR émis par l'application   | Temps réel          |
| Nombre de logs de niveau FATAL/min | Nombre de logs de niveau FATAL émis par l'application   | Temps réel          |

### Métriques de coûts cloud (optionnel V1)

| Métrique                              | Définition                                 | Fréquence de mesure |
| ------------------------------------- | ------------------------------------------ | ------------------- |
| Coût quotidien Cloud Run              | Coût facturé par Google Cloud Run par jour | Quotidienne         |
| Coût quotidien Cloud SQL (PostgreSQL) | Coût facturé par Cloud SQL par jour        | Quotidienne         |
| Coût quotidien Cloud Logging          | Coût facturé par Cloud Logging par jour    | Quotidienne         |
| Coût quotidien Cloud Storage          | Coût facturé par Cloud Storage par jour    | Quotidienne         |
| Coût quotidien total                  | Somme de tous les coûts cloud par jour     | Quotidienne         |

### Règles

- Les métriques techniques sont **visualisées dans Google Cloud Monitoring**.
- Des alertes automatiques sont configurées pour :
  - CPU > 80 % pendant 5 minutes
  - Mémoire > 85 % pendant 5 minutes
  - Erreurs 5xx > 10 par minute
  - Temps de réponse API (p95) > 5 secondes
- Les alertes sont envoyées par email au Tech Lead et au DevOps responsable.

---

## DEP-0844 — Métriques de satisfaction principales

### Objectif

Définir les métriques permettant de mesurer la satisfaction des utilisateurs
(clients, dépanneurs, livreurs) avec la plateforme.

### Métriques de satisfaction client

| Métrique                         | Définition                                              | Fréquence de mesure |
| -------------------------------- | ------------------------------------------------------- | ------------------- |
| Taux de commandes abouties       | (Commandes livrées / Total commandes créées) × 100      | Hebdomadaire        |
| Taux de commandes problématiques | (Commandes avec statut « Problème » / Total) × 100      | Hebdomadaire        |
| Temps moyen de livraison perçu   | Temps entre création commande et livraison (vue client) | Hebdomadaire        |
| Nombre de réclamations clients   | Nombre de messages de réclamation reçus                 | Hebdomadaire        |

### Métriques de satisfaction dépanneur

| Métrique                                | Définition                                              | Fréquence de mesure |
| --------------------------------------- | ------------------------------------------------------- | ------------------- |
| Nombre de commandes refusées            | Nombre de commandes refusées par le dépanneur           | Quotidienne         |
| Taux de refus                           | (Commandes refusées / Total commandes) × 100            | Hebdomadaire        |
| Temps moyen passé sur une commande      | Temps entre acceptation et marquage « Prête »           | Hebdomadaire        |
| Nombre de demandes de support dépanneur | Nombre de tickets de support ouverts par les dépanneurs | Hebdomadaire        |

### Métriques de satisfaction livreur

| Métrique                                 | Définition                                               | Fréquence de mesure |
| ---------------------------------------- | -------------------------------------------------------- | ------------------- |
| Nombre de livraisons refusées            | Nombre de livraisons refusées par le livreur             | Quotidienne         |
| Taux de refus de livraison               | (Livraisons refusées / Total livraisons proposées) × 100 | Hebdomadaire        |
| Temps moyen par livraison                | Temps entre « Parti » et « Livrée »                      | Hebdomadaire        |
| Nombre de problèmes signalés par livreur | Nombre de livraisons marquées « Problème »               | Hebdomadaire        |

### Collecte de satisfaction (V2+)

En V1, **aucun système de notation ou de feedback explicite** n'est prévu. La
satisfaction est **mesurée indirectement** via les métriques ci-dessus.

En V2+, des enquêtes de satisfaction pourront être ajoutées :

- NPS (Net Promoter Score) client
- Feedback post-livraison (étoiles)
- Enquête trimestrielle dépanneur/livreur

### Règles

- Les métriques de satisfaction sont **partagées avec le tenant pilote** pour
  améliorer les processus.
- Les anomalies (ex. taux de refus dépanneur > 20 %) déclenchent une alerte et
  une investigation.
- Les réclamations clients sont **traitées sous 48 heures** et documentées.

---

## DEP-0845 — Métriques d'assistant texte principales

### Objectif

Définir les métriques permettant de mesurer la performance et l'efficacité de
l'assistant texte (DEP-0361–DEP-0400).

### Métriques d'usage de l'assistant texte

| Métrique                          | Définition                                            | Fréquence de mesure |
| --------------------------------- | ----------------------------------------------------- | ------------------- |
| Nombre de sessions assistant/jour | Nombre de sessions d'assistant texte ouvertes         | Quotidienne         |
| Nombre de messages par session    | Moyenne du nombre de messages échangés par session    | Quotidienne         |
| Durée moyenne de session          | Temps passé dans l'assistant par session              | Quotidienne         |
| Taux d'utilisation de l'assistant | (Sessions avec assistant / Total sessions site) × 100 | Hebdomadaire        |

### Métriques de performance de l'assistant texte

| Métrique                              | Définition                                                      | Fréquence de mesure |
| ------------------------------------- | --------------------------------------------------------------- | ------------------- |
| Temps de réponse de l'assistant (p95) | Percentile 95 du temps entre message client et réponse          | Temps réel          |
| Taux de reconnaissance produit        | (Produits correctement reconnus / Total requêtes produit) × 100 | Hebdomadaire        |
| Taux de clarification                 | (Messages de clarification / Total messages assistant) × 100    | Hebdomadaire        |
| Taux de commande via assistant        | (Commandes créées via assistant / Total commandes) × 100        | Hebdomadaire        |

### Métriques de qualité de l'assistant texte

| Métrique                                 | Définition                                              | Fréquence de mesure |
| ---------------------------------------- | ------------------------------------------------------- | ------------------- |
| Taux de réponses « Je ne comprends pas » | (Réponses d'incompréhension / Total réponses) × 100     | Hebdomadaire        |
| Taux de reformulation client             | (Messages reformulés par client / Total messages) × 100 | Hebdomadaire        |
| Taux d'abandon de session                | (Sessions fermées sans commande / Total sessions) × 100 | Hebdomadaire        |

### Règles

- Les métriques d'assistant texte sont **suivies en temps réel** pour détecter
  les dégradations de qualité.
- Un temps de réponse > 5 secondes (p95) déclenche une alerte au Tech Lead.
- Un taux de reconnaissance produit < 80 % déclenche une revue des synonymes
  et des prompts.

---

## DEP-0846 — Métriques d'assistant vocal web principales

### Objectif

Définir les métriques permettant de mesurer la performance et l'efficacité de
l'assistant vocal web (DEP-0401–DEP-0440).

### Métriques d'usage de l'assistant vocal web

| Métrique                              | Définition                                           | Fréquence de mesure |
| ------------------------------------- | ---------------------------------------------------- | ------------------- |
| Nombre de sessions vocal web/jour     | Nombre de sessions d'assistant vocal web activées    | Quotidienne         |
| Durée moyenne de session vocale       | Temps passé en mode voix web par session             | Quotidienne         |
| Nombre de messages vocaux par session | Moyenne du nombre de messages vocaux par session     | Quotidienne         |
| Taux d'utilisation du mode voix       | (Sessions avec voix web / Total sessions site) × 100 | Hebdomadaire        |

### Métriques de performance de l'assistant vocal web

| Métrique                       | Définition                                                | Fréquence de mesure |
| ------------------------------ | --------------------------------------------------------- | ------------------- |
| Temps de réponse vocal (p95)   | Percentile 95 du temps entre message vocal et réponse     | Temps réel          |
| Taux de reconnaissance vocale  | (Messages vocaux compris / Total messages vocaux) × 100   | Hebdomadaire        |
| Taux d'erreur de transcription | (Transcriptions incorrectes / Total transcriptions) × 100 | Hebdomadaire        |
| Taux de commande via voix web  | (Commandes créées via voix web / Total commandes) × 100   | Hebdomadaire        |

### Métriques de qualité de l'assistant vocal web

| Métrique                         | Définition                                             | Fréquence de mesure |
| -------------------------------- | ------------------------------------------------------ | ------------------- |
| Taux de répétition demandée      | (Messages « Pouvez-vous répéter ? » / Total) × 100     | Hebdomadaire        |
| Taux de basculement texte/voix   | (Sessions basculant de voix à texte / Total) × 100     | Hebdomadaire        |
| Taux d'abandon de session vocale | (Sessions vocales fermées sans commande / Total) × 100 | Hebdomadaire        |

### Règles

- Les métriques vocal web sont **suivies en parallèle des métriques texte** pour
  comparer les canaux.
- Un taux de reconnaissance vocale < 85 % déclenche une revue des modèles de
  reconnaissance et des prompts.
- Un taux de basculement voix → texte > 30 % indique une mauvaise expérience
  vocale.

---

## DEP-0847 — Métriques téléphoniques principales

### Objectif

Définir les métriques permettant de mesurer la performance et l'efficacité du
canal téléphonique vocal (IVR / assistant vocal, DEP-0441–DEP-0480).

### Métriques d'usage téléphonie

| Métrique                               | Définition                                        | Fréquence de mesure |
| -------------------------------------- | ------------------------------------------------- | ------------------- |
| Nombre d'appels entrants/jour          | Nombre d'appels reçus par le numéro du tenant     | Quotidienne         |
| Durée moyenne d'appel                  | Temps moyen passé en conversation téléphonique    | Quotidienne         |
| Nombre de commandes via téléphone/jour | Nombre de commandes créées par appel téléphonique | Quotidienne         |
| Taux de commande via téléphone         | (Commandes téléphone / Total commandes) × 100     | Hebdomadaire        |

### Métriques de performance téléphonie

| Métrique                                | Définition                                            | Fréquence de mesure |
| --------------------------------------- | ----------------------------------------------------- | ------------------- |
| Taux de prise en charge d'appel         | (Appels pris en charge / Total appels entrants) × 100 | Quotidienne         |
| Temps d'attente moyen                   | Temps avant prise en charge de l'appel                | Quotidienne         |
| Taux de reconnaissance vocale téléphone | (Messages vocaux compris / Total messages) × 100      | Hebdomadaire        |
| Taux de complétion de commande          | (Commandes confirmées / Appels avec intention) × 100  | Hebdomadaire        |

### Métriques de qualité téléphonie

| Métrique                       | Définition                                                  | Fréquence de mesure |
| ------------------------------ | ----------------------------------------------------------- | ------------------- |
| Taux d'appels abandonnés       | (Appels coupés avant complétion / Total appels) × 100       | Quotidienne         |
| Taux d'appels hors heures      | (Appels hors heures d'ouverture / Total appels) × 100       | Hebdomadaire        |
| Taux de blocage par limitation | (Appels bloqués par limite / Total appels) × 100 (DEP-0776) | Hebdomadaire        |
| Taux de problèmes techniques   | (Appels avec timeout/erreur / Total appels) × 100           | Hebdomadaire        |

### Métriques de coûts téléphonie (optionnel V1)

| Métrique                   | Définition                                       | Fréquence de mesure |
| -------------------------- | ------------------------------------------------ | ------------------- |
| Coût par appel (Twilio)    | Coût moyen facturé par Twilio par appel          | Hebdomadaire        |
| Coût par minute (Twilio)   | Coût moyen facturé par Twilio par minute d'appel | Hebdomadaire        |
| Coût total téléphonie/jour | Coût total Twilio + OpenAI Realtime par jour     | Quotidienne         |

### Règles

- Les métriques téléphonie sont **suivies dans un tableau de bord dédié** accessible
  au super admin.
- Un taux de prise en charge < 90 % déclenche une alerte au DevOps.
- Un taux de reconnaissance < 80 % déclenche une revue des prompts et synonymes
  téléphoniques (DEP-0270).
- Les transcriptions d'appels problématiques sont conservées 7 jours pour analyse.

---

## DEP-0848 — Métriques livreur principales

### Objectif

Définir les métriques permettant de mesurer l'activité et la performance des
livreurs sur la plateforme.

### Métriques d'activité livreur

| Métrique                              | Définition                                          | Fréquence de mesure |
| ------------------------------------- | --------------------------------------------------- | ------------------- |
| Nombre de livreurs actifs/jour        | Nombre de livreurs ayant accepté ≥1 livraison       | Quotidienne         |
| Nombre de livraisons par livreur/jour | Moyenne du nombre de livraisons par livreur actif   | Quotidienne         |
| Taux d'acceptation de livraison       | (Livraisons acceptées / Livraisons proposées) × 100 | Hebdomadaire        |
| Taux de refus de livraison            | (Livraisons refusées / Livraisons proposées) × 100  | Hebdomadaire        |

### Métriques de performance livreur

| Métrique                       | Définition                                                 | Fréquence de mesure |
| ------------------------------ | ---------------------------------------------------------- | ------------------- |
| Temps moyen de livraison       | Temps entre « Parti » et « Livrée » (moyenne)              | Quotidienne         |
| Taux de livraisons réussies    | (Livraisons « Livrée » / Total livraisons assignées) × 100 | Hebdomadaire        |
| Taux de problèmes de livraison | (Livraisons « Problème » / Total livraisons) × 100         | Hebdomadaire        |
| Nombre de livraisons par heure | Nombre moyen de livraisons complétées par heure            | Hebdomadaire        |

### Métriques de satisfaction livreur (indirecte)

| Métrique                             | Définition                                      | Fréquence de mesure |
| ------------------------------------ | ----------------------------------------------- | ------------------- |
| Taux de rétention livreur à 30 jours | (Livreurs actifs J+30 / Total livreurs J) × 100 | Mensuelle           |
| Nombre de livreurs ayant quitté      | Nombre de livreurs inactifs depuis >30 jours    | Mensuelle           |

### Règles

- Les métriques livreur sont **partagées avec le tenant pilote** pour ajuster
  les processus de livraison.
- Un taux de refus > 30 % déclenche une investigation sur la charge de travail
  ou la qualité des propositions.
- Un taux de problèmes > 10 % déclenche une revue des processus de livraison.

---

## DEP-0849 — Métriques dépanneur principales

### Objectif

Définir les métriques permettant de mesurer l'activité et la performance des
dépanneurs sur la plateforme.

### Métriques d'activité dépanneur

| Métrique                               | Définition                                         | Fréquence de mesure |
| -------------------------------------- | -------------------------------------------------- | ------------------- |
| Nombre de dépanneurs actifs/jour       | Nombre de dépanneurs ayant traité ≥1 commande      | Quotidienne         |
| Nombre de commandes par dépanneur/jour | Moyenne du nombre de commandes par dépanneur actif | Quotidienne         |
| Taux d'acceptation de commande         | (Commandes acceptées / Commandes reçues) × 100     | Hebdomadaire        |
| Taux de refus de commande              | (Commandes refusées / Commandes reçues) × 100      | Hebdomadaire        |

### Métriques de performance dépanneur

| Métrique                             | Définition                                             | Fréquence de mesure |
| ------------------------------------ | ------------------------------------------------------ | ------------------- |
| Temps moyen de préparation           | Temps entre « En attente » et « Prête à livrer »       | Quotidienne         |
| Taux de commandes annulées           | (Commandes annulées / Total commandes acceptées) × 100 | Hebdomadaire        |
| Taux de remplacements proposés       | (Remplacements proposés / Total commandes) × 100       | Hebdomadaire        |
| Nombre d'articles manquants signalés | Nombre d'articles marqués manquants                    | Hebdomadaire        |

### Métriques de qualité dépanneur

| Métrique                                 | Définition                                              | Fréquence de mesure |
| ---------------------------------------- | ------------------------------------------------------- | ------------------- |
| Taux de commandes urgentes               | (Commandes dépassant le seuil / Total) × 100 (DEP-0516) | Quotidienne         |
| Temps de réponse aux nouvelles commandes | Temps entre réception et acceptation/refus              | Quotidienne         |

### Règles

- Les métriques dépanneur sont **partagées avec le tenant pilote** pour optimiser
  les processus de préparation.
- Un temps de préparation > 20 minutes (moyenne) déclenche une investigation.
- Un taux de refus > 20 % déclenche une revue de la charge de travail.

---

## DEP-0850 — Métriques multi-tenant principales

### Objectif

Définir les métriques permettant de mesurer l'activité et la performance par
tenant dans l'architecture multi-tenant (DEP-0641–DEP-0680).

### Métriques d'activité par tenant

| Métrique                               | Définition                                    | Fréquence de mesure |
| -------------------------------------- | --------------------------------------------- | ------------------- |
| Nombre de commandes par tenant/jour    | Nombre de commandes créées par tenant         | Quotidienne         |
| Nombre de clients actifs par tenant    | Nombre de clients ayant commandé ≥1 fois      | Hebdomadaire        |
| Taux de conversion par tenant          | (Commandes / Visiteurs) × 100 par tenant      | Hebdomadaire        |
| Nombre de dépanneurs actifs par tenant | Nombre de dépanneurs ayant traité ≥1 commande | Hebdomadaire        |
| Nombre de livreurs actifs par tenant   | Nombre de livreurs ayant livré ≥1 commande    | Hebdomadaire        |

### Métriques de performance par tenant

| Métrique                               | Définition                                        | Fréquence de mesure |
| -------------------------------------- | ------------------------------------------------- | ------------------- |
| Temps moyen de livraison par tenant    | Temps entre création et livraison par tenant      | Hebdomadaire        |
| Taux de livraisons réussies par tenant | (Livraisons « Livrée » / Total) × 100 par tenant  | Hebdomadaire        |
| Taux de problèmes par tenant           | (Commandes « Problème » / Total) × 100 par tenant | Hebdomadaire        |

### Métriques de coûts par tenant (optionnel V1)

| Métrique                        | Définition                            | Fréquence de mesure |
| ------------------------------- | ------------------------------------- | ------------------- |
| Coût cloud par tenant/jour      | Coût cloud estimé par tenant par jour | Hebdomadaire        |
| Coût téléphonie par tenant/jour | Coût Twilio par tenant par jour       | Hebdomadaire        |
| Coût assistant par tenant/jour  | Coût OpenAI par tenant par jour       | Hebdomadaire        |

### Règles

- Les métriques multi-tenant sont **visualisées dans un tableau de bord super
  admin** avec filtrage par tenant.
- Les anomalies (ex. tenant avec 0 commande pendant 7 jours) déclenchent une
  alerte au super admin.
- Les coûts par tenant sont **estimés** en V1, la facturation précise par tenant
  est en V2+.

---

## DEP-0851 — Journal d'événements du client

### Objectif

Définir le journal d'événements permettant de tracer toutes les actions
significatives effectuées par un client sur la plateforme.

### Événements client à journaliser

| Événement                          | Données enregistrées                                                  | Niveau de log |
| ---------------------------------- | --------------------------------------------------------------------- | ------------- |
| Inscription client                 | ID client, téléphone masqué, horodatage, IP source                    | `info`        |
| Connexion réussie                  | ID client, horodatage, IP source, user-agent                          | `info`        |
| Échec de connexion (OTP incorrect) | Téléphone masqué, horodatage, IP source, tentative n°                 | `warn`        |
| Ajout de produit au panier         | ID client, ID produit, quantité, horodatage                           | `info`        |
| Retrait de produit du panier       | ID client, ID produit, quantité, horodatage                           | `info`        |
| Validation du panier               | ID client, nombre de produits, horodatage                             | `info`        |
| Création de commande               | ID client, ID commande, horodatage, mode (manuel/assistant/téléphone) | `info`        |
| Annulation de commande             | ID client, ID commande, horodatage, raison                            | `info`        |
| Consultation du suivi de commande  | ID client, ID commande, horodatage                                    | `info`        |
| Message envoyé à l'assistant texte | ID client, longueur message, horodatage                               | `info`        |
| Message vocal web envoyé           | ID client, durée audio, horodatage                                    | `info`        |
| Appel téléphonique passé           | Téléphone masqué, durée appel, horodatage, ID tenant                  | `info`        |
| Changement de langue               | ID client, langue précédente, langue nouvelle, horodatage             | `info`        |
| Ajout d'adresse de livraison       | ID client, zone de livraison, horodatage                              | `info`        |
| Modification d'adresse             | ID client, ID adresse, horodatage                                     | `info`        |
| Suppression de compte              | ID client, horodatage, IP source                                      | `warn`        |
| Dépassement limite assistant texte | ID client, horodatage, IP source                                      | `warn`        |
| Dépassement limite téléphonie      | Téléphone masqué, horodatage, IP source                               | `warn`        |

### Format du journal

Chaque événement est enregistré au format JSON structuré :

```json
{
  "timestamp": "2026-03-13T14:23:45.123Z",
  "event": "client.order.created",
  "client_id": "clt_abc123",
  "order_id": "ord_xyz789",
  "tenant_id": "tnt_demo1",
  "mode": "assistant_text",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "level": "info"
}
```

### Règles

- Les événements client sont **centralisés dans Cloud Logging** (DEP-0735).
- Les données personnelles (nom, adresse, téléphone) sont **masquées** (DEP-0778).
- Le journal client est **consultable par le super admin** pour investigation.
- La rétention est de **90 jours** (DEP-0777).
- Les événements sont **filtrables par client, par tenant, par période**.

---

## DEP-0852 — Journal d'événements du dépanneur

### Objectif

Définir le journal d'événements permettant de tracer toutes les actions
significatives effectuées par un dépanneur sur la plateforme.

### Événements dépanneur à journaliser

| Événement                             | Données enregistrées                                                                | Niveau de log |
| ------------------------------------- | ----------------------------------------------------------------------------------- | ------------- |
| Connexion dépanneur                   | ID dépanneur, tenant, horodatage, IP source                                         | `info`        |
| Déconnexion dépanneur                 | ID dépanneur, tenant, horodatage, durée session                                     | `info`        |
| Acceptation de commande               | ID dépanneur, ID commande, horodatage                                               | `info`        |
| Refus de commande                     | ID dépanneur, ID commande, horodatage, raison                                       | `info`        |
| Marquage commande « En préparation »  | ID dépanneur, ID commande, horodatage                                               | `info`        |
| Marquage commande « Prête à livrer »  | ID dépanneur, ID commande, horodatage                                               | `info`        |
| Assignation à un livreur              | ID dépanneur, ID commande, ID livreur, horodatage                                   | `info`        |
| Annulation de commande                | ID dépanneur, ID commande, horodatage, raison                                       | `info`        |
| Signalement article manquant          | ID dépanneur, ID commande, ID produit, horodatage                                   | `warn`        |
| Proposition de remplacement           | ID dépanneur, ID commande, ID produit original, ID produit remplacement, horodatage | `info`        |
| Modification de commande avant départ | ID dépanneur, ID commande, horodatage, détails modification                         | `info`        |
| Appel client depuis fiche commande    | ID dépanneur, ID commande, horodatage                                               | `info`        |
| Consultation du journal d'activité    | ID dépanneur, ID commande, horodatage                                               | `info`        |
| Filtrage des commandes                | ID dépanneur, filtre appliqué, horodatage                                           | `info`        |

### Format du journal

Chaque événement est enregistré au format JSON structuré :

```json
{
  "timestamp": "2026-03-13T14:23:45.123Z",
  "event": "depanneur.order.accepted",
  "depanneur_id": "dep_abc123",
  "order_id": "ord_xyz789",
  "tenant_id": "tnt_demo1",
  "ip_address": "192.168.1.1",
  "level": "info"
}
```

### Règles

- Les événements dépanneur sont **centralisés dans Cloud Logging** (DEP-0735).
- Le journal dépanneur est **consultable par le super admin et le dépanneur
  lui-même** (limité à ses propres actions).
- Les actions critiques (annulation, modification) sont **auditées** (DEP-0788).
- La rétention est de **90 jours** (DEP-0777).

---

## DEP-0853 — Journal d'événements du livreur

### Objectif

Définir le journal d'événements permettant de tracer toutes les actions
significatives effectuées par un livreur sur la plateforme.

### Événements livreur à journaliser

| Événement                             | Données enregistrées                                | Niveau de log |
| ------------------------------------- | --------------------------------------------------- | ------------- |
| Connexion livreur                     | ID livreur, tenant, horodatage, IP source           | `info`        |
| Déconnexion livreur                   | ID livreur, tenant, horodatage, durée session       | `info`        |
| Acceptation de livraison              | ID livreur, ID livraison, horodatage                | `info`        |
| Refus de livraison                    | ID livreur, ID livraison, horodatage, raison        | `info`        |
| Marquage « Parti pour livraison »     | ID livreur, ID livraison, horodatage                | `info`        |
| Marquage « Arrivé chez le client »    | ID livreur, ID livraison, horodatage                | `info`        |
| Marquage « Livrée »                   | ID livreur, ID livraison, horodatage                | `info`        |
| Signalement de problème de livraison  | ID livreur, ID livraison, horodatage, type problème | `warn`        |
| Appel client depuis fiche livraison   | ID livreur, ID livraison, horodatage                | `info`        |
| Consultation des détails de livraison | ID livreur, ID livraison, horodatage                | `info`        |
| Filtrage des livraisons               | ID livreur, filtre appliqué, horodatage             | `info`        |

### Format du journal

Chaque événement est enregistré au format JSON structuré :

```json
{
  "timestamp": "2026-03-13T14:23:45.123Z",
  "event": "livreur.delivery.accepted",
  "livreur_id": "lvr_abc123",
  "delivery_id": "dlv_xyz789",
  "tenant_id": "tnt_demo1",
  "ip_address": "192.168.1.1",
  "level": "info"
}
```

### Règles

- Les événements livreur sont **centralisés dans Cloud Logging** (DEP-0735).
- Le journal livreur est **consultable par le super admin et le livreur lui-même**
  (limité à ses propres actions).
- Les problèmes de livraison signalés sont **auditées** (DEP-0790).
- La rétention est de **90 jours** (DEP-0777).

---

## DEP-0854 — Journal d'événements de l'assistant

### Objectif

Définir le journal d'événements permettant de tracer toutes les interactions
avec les assistants (texte, voix web, téléphonie) pour analyse et amélioration.

### Événements assistant à journaliser

| Événement                                  | Données enregistrées                                          | Niveau de log |
| ------------------------------------------ | ------------------------------------------------------------- | ------------- |
| Ouverture session assistant texte          | ID client, tenant, horodatage                                 | `info`        |
| Fermeture session assistant texte          | ID client, tenant, horodatage, durée session, nombre messages | `info`        |
| Message client reçu (texte)                | ID client, longueur message, horodatage                       | `info`        |
| Réponse assistant envoyée (texte)          | ID client, longueur réponse, temps de traitement, horodatage  | `info`        |
| Produit reconnu par assistant              | ID client, ID produit, score de confiance, horodatage         | `info`        |
| Produit non reconnu                        | ID client, message client (anonymisé), horodatage             | `warn`        |
| Demande de clarification                   | ID client, raison clarification, horodatage                   | `info`        |
| Commande créée via assistant texte         | ID client, ID commande, nombre produits, horodatage           | `info`        |
| Activation mode voix web                   | ID client, tenant, horodatage                                 | `info`        |
| Désactivation mode voix web                | ID client, tenant, horodatage, durée session vocale           | `info`        |
| Message vocal reçu (voix web)              | ID client, durée audio, horodatage                            | `info`        |
| Transcription vocale réussie               | ID client, longueur transcription, horodatage                 | `info`        |
| Erreur de transcription vocale             | ID client, horodatage, code erreur                            | `error`       |
| Appel téléphonique entrant                 | Téléphone masqué, tenant, horodatage                          | `info`        |
| Appel téléphonique terminé                 | Téléphone masqué, tenant, durée appel, horodatage             | `info`        |
| Produit reconnu par téléphone              | Téléphone masqué, ID produit, score confiance, horodatage     | `info`        |
| Produit non reconnu par téléphone          | Téléphone masqué, message (anonymisé), horodatage             | `warn`        |
| Commande créée via téléphone               | Téléphone masqué, ID commande, nombre produits, horodatage    | `info`        |
| Timeout d'inactivité (assistant/téléphone) | ID session, durée inactivité, horodatage                      | `warn`        |
| Erreur API assistant (OpenAI)              | ID session, code erreur, message erreur, horodatage           | `error`       |

### Format du journal

Chaque événement est enregistré au format JSON structuré :

```json
{
  "timestamp": "2026-03-13T14:23:45.123Z",
  "event": "assistant.text.message.received",
  "client_id": "clt_abc123",
  "session_id": "ses_xyz789",
  "tenant_id": "tnt_demo1",
  "message_length": 42,
  "level": "info"
}
```

### Règles

- Les événements assistant sont **centralisés dans Cloud Logging** (DEP-0735).
- Les **transcriptions complètes ne sont JAMAIS journalisées** (DEP-0783).
- Seules les métadonnées (longueur, durée, score de confiance) sont enregistrées.
- Les messages non reconnus sont **anonymisés** avant journalisation.
- Le journal assistant est **consultable par le super admin** pour amélioration
  des prompts et synonymes.
- La rétention est de **90 jours** (DEP-0777).
- Les erreurs API (timeout, quota dépassé) déclenchent une alerte au Tech Lead.

---

## Résumé des blocs couverts

| Bloc     | Contenu documenté                                                     |
| -------- | --------------------------------------------------------------------- |
| DEP-0835 | Tests de charge des appels simultanés (optionnel si volume justifie)  |
| DEP-0836 | Checklist de QA manuelle (parcours client, dépanneur, livreur, admin) |
| DEP-0837 | Checklist de QA mobile (responsive, tactile, performance 3G)          |
| DEP-0838 | Checklist de QA accessibilité (WCAG 2.1 AA, lecteurs d'écran)         |
| DEP-0839 | Checklist de QA téléphonie (flux d'appel, reconnaissance vocale)      |
| DEP-0840 | Gel de la discipline qualité avant pilote (critères et processus)     |
| DEP-0841 | Métriques produit principales (usage, engagement, performance)        |
| DEP-0842 | Métriques business principales (commandes, annulations, temps)        |
| DEP-0843 | Métriques techniques principales (infra, DB, logs, coûts)             |
| DEP-0844 | Métriques de satisfaction principales (client, dépanneur, livreur)    |
| DEP-0845 | Métriques d'assistant texte principales (usage, performance, qualité) |
| DEP-0846 | Métriques d'assistant vocal web principales (usage, reconnaissance)   |
| DEP-0847 | Métriques téléphoniques principales (appels, coûts, qualité)          |
| DEP-0848 | Métriques livreur principales (activité, performance, satisfaction)   |
| DEP-0849 | Métriques dépanneur principales (activité, performance, qualité)      |
| DEP-0850 | Métriques multi-tenant principales (activité, coûts par tenant)       |
| DEP-0851 | Journal d'événements du client (inscription, commande, assistant)     |
| DEP-0852 | Journal d'événements du dépanneur (commandes, préparation, actions)   |
| DEP-0853 | Journal d'événements du livreur (livraisons, problèmes, actions)      |
| DEP-0854 | Journal d'événements de l'assistant (texte, voix, téléphone)          |

---

## Validation du périmètre

✅ Documentation complète de DEP-0835 à DEP-0854
✅ Aucun code d'observabilité réel (documentation uniquement)
✅ Aucun autre fichier modifié
✅ Respect des conventions de documentation du projet
✅ Références aux décisions précédentes (DEP-0735–0794)
