# depaneurIA

Base initiale du projet **depaneurIA**.

Ce dépôt sert de **source unique de vérité** pour travailler à trois :

- **toi** : validation, décisions, priorités ;
- **Copilot** : exécution ciblée, issue par issue ;
- **ChatGPT** : découpage logique, cohérence d’ensemble, contrôle de l’avancement.

## Mission du produit

> Permettre à un client de commander un dépanneur en mode manuel, assisté ou téléphonique.

C'est la mission centrale du projet : offrir trois modes de commande flexibles (saisie manuelle directe, assistance guidée à l'écran, ou passage de commande par téléphone) pour répondre aux besoins de tous les types de clients.

## Nom de travail interne

> **depaneurIA**

C'est le nom de travail interne officiel du projet. Il est utilisé dans le dépôt, la documentation et les conventions.

## Nom commercial

> **DépannVite**

C'est le nom commercial officiel du produit SaaS destiné aux dépanneurs. Il est utilisé pour présenter le produit aux futurs clients dépanneurs, dans les supports de communication et la documentation orientée utilisateur. Le nom interne `depaneurIA` reste utilisé dans le dépôt et le code.

## Promesse client

> Commander vite, clairement et simplement, avec paiement à la livraison.

## Promesse dépanneur

> Recevoir, traiter et livrer des commandes simplement, sans compliquer les opérations du dépanneur.

## Slogan

> Commander simplement. Livrer clairement.

## Profils principaux (V1)

- **Client** : passe commande en mode manuel, assisté écran ou téléphone, fournit les infos de contact et paie à la livraison, suit le statut jusqu’à la remise.
- **Dépanneur** : configure le catalogue de sa boutique, reçoit et valide les commandes, prépare les articles et remet la commande prête au client ou au livreur.
- **Livreur** : prend en charge une commande préparée, la transporte jusqu’au client, confirme la remise et l’encaissement à la livraison quand attendu.
- **Super administrateur** : paramètre et supervise les dépanneurs et livreurs, contrôle les accès et règles transverses, veille à la cohérence et à la qualité du service.
## Problème principal côté client

> Aujourd’hui, commander au dépanneur oblige le client à décrire sa demande par morceaux (appels, messages, allers-retours) sans savoir si les produits sont disponibles ni quand ils arriveront. Il perd du temps à répéter adresse et liste d’articles pour obtenir une confirmation, surtout quand il est pressé ou mal à l’aise avec les interfaces actuelles.

## Solution principale côté client

> En V1, DépannVite permet au client d’envoyer en une fois sa commande (liste d’articles, adresse, contact) via un parcours assisté écran ou téléphone, d’obtenir la confirmation de prise en charge et l’heure prévue, puis de suivre l’état jusqu’à la remise, paiement à la livraison compris — sans compte complexe ni paiement en ligne.

## Problème principal côté dépanneur

> Aujourd’hui, le dépanneur reçoit des commandes incomplètes par appels ou messages, doit rappeler pour récupérer l’adresse, vérifier la disponibilité et convenir du paiement à la livraison. Il jongle entre préparation et livraison sans interface simple, perd du temps à coordonner et risque erreurs ou ventes perdues juste pour finaliser une commande de base.

## Solution principale côté dépanneur

> En V1, DépannVite centralise les commandes complètes (articles, quantités, adresse, contact, paiement à la livraison) pour que le dépanneur confirme la disponibilité, prépare et remet facilement au client ou au livreur, sans appels répétés ni gestion de paiement en ligne.

## Problème principal côté livreur

> Aujourd’hui, le livreur part avec des consignes partielles : adresse ou accès mal confirmés, paiement à récupérer flou, absence d’heure précise. Il passe des appels pour valider la remise, attend sur place ou fait des détours inutiles, ce qui rallonge la course et fait rater des livraisons pourtant prêtes.

## Solution principale côté livreur

> En V1, DépannVite fournit au livreur une fiche claire (adresse validée, consignes d’accès, montant à encaisser si prévu), la commande déjà préparée et un parcours de remise simple pour confirmer livraison et paiement sans ambiguïté ni détours.

## Règles de paiement (V1)

- Paiement de base : le paiement standard se fait à la livraison, directement au dépanneur ou au livreur mandaté, sans prépaiement en ligne.
- Affichage des prix : tant que le paiement se fait à la livraison en V1, aucun affichage public obligatoire des prix n’est exigé ; le dépanneur peut communiquer les montants lors de la confirmation ou au moment de la remise.

## Cadre fonctionnel V1

### Exceptions futures possibles (non développées)

- Paiement en ligne ou options de paiement différé.
- Affichage public détaillé des prix et tarification dynamique.
- Automatisations avancées (recommandations intelligentes, substitutions automatiques, relances).
- Options premium (livraison express, abonnements, avantages fidélité étendus).
- Intégrations externes (POS/caisse, marketplaces, CRM ou outils tiers).

### Portée exacte de la V1

- Prise de commande simple : articles et quantités saisis avec adresse, contact, consignes et mention de paiement à la livraison.
- Confirmation claire et transmission de la commande au dépanneur, puis au livreur quand mandaté.
- Préparation et remise de la commande prête pour enlèvement ou livraison.
- Suivi des états clés pour le client, le dépanneur et le livreur jusqu’à la remise.
- Encaissement à la livraison (dépanneur ou livreur) et confirmation associée.

### Hors portée explicite de la V1

- Marketplace multi-dépanneurs ou catalogue partagé entre boutiques.
- Programme de fidélité avancé, promotions/coupons ou abonnements premium.
- Recommandations intelligentes poussées ou automatisation complète du choix produit.
- Paiements complexes (en ligne, fractionné, différé) et facturation détaillée.
- Analytics poussées et tableaux de bord avancés.

### Modes d’entrée de commande (V1)

- Manuel : saisie directe des articles et coordonnées par le client sans assistance.
- Assisté écran : parcours guidé avec validations et suggestions affichées à l’écran.
- Assisté téléphone : prise de commande guidée par appel avec l’agent vocal.

### Définition d’une commande réussie

- Commande reçue complète (articles, quantités, coordonnées, consignes, paiement à la livraison indiqué).
- Disponibilité confirmée par le dépanneur.
- Commande préparée et remise au client ou au livreur désigné.
- Paiement à la livraison encaissé et confirmé quand attendu.
- Confirmation de remise visible côté client et dépanneur (et livreur si concerné).

### Cas de friction V1

- **Commande refusée (état final)** : la demande est clôturée avec un statut `refusée` et un motif explicite (hors zone, suspicion de fraude, article critique absent) visible par le client et le dépanneur. Aucune préparation ni encaissement ne sont effectués ; le client reçoit un message clair de clôture et peut relancer une nouvelle commande s’il le souhaite.
- **Produit indisponible** : le dépanneur propose un remplacement simple (article de même catégorie ou prix proche) ou la suppression de l’article. Si l’article est clé pour la commande, une annulation partielle ou totale est possible. Le client valide le choix avant préparation ; le récapitulatif est mis à jour (contenu, montant estimé, heure prévue) avant de poursuivre ou de clôturer.
- **Adresse hors zone** : dès la saisie de l’adresse, l’interface signale que la zone n’est pas couverte, bloque le flux normal et propose trois choix : corriger l’adresse, passer en retrait boutique si disponible, ou refuser proprement la commande avec message.
- **Client non inscrit** : la commande est acceptée avec un dossier minimal (nom, téléphone vérifié, adresse). Un code rapide ou un appel peut confirmer le contact. Aucun compte complexe n’est requis en V1 ; les informations sont simplement mémorisées pour le suivi et réutilisées lors d’une nouvelle commande.

### Expérience idéale sur ordinateur (V1)

- Accueil clair présentant la promesse V1 et un double accès immédiat : commander en ligne (parcours assisté écran) ou appeler pour un parcours téléphone.
- Parcours guidé en étapes visibles : 1) articles et quantités, 2) coordonnées (nom, téléphone, adresse, consignes), 3) choix enlèvement ou livraison, 4) vérification et envoi.
- Récapitulatif latéral en temps réel : contenu de commande, mode de remise, paiement à la livraison, montant estimé ou « à confirmer », et heure/créneau estimatif quand fourni par le dépanneur.
- Confirmation explicite à l’envoi : état « commande reçue », rappel du paiement à la livraison, et bouton de contact dépanneur.
- Suivi simple post-envoi : timeline des états V1 (Reçue, Confirmée, En préparation, En route/Prête, Remise, Refusée/Annulée) avec messages clairs en cas d’indisponibilité ou de refus.

### Expérience idéale sur téléphone (V1)

- Accueil mobile ultra lisible : deux entrées immédiates « Commander en ligne » et « Appeler », avec rappel du paiement à la livraison.
- Parcours en 4 écrans courts : articles/quantités, coordonnées (nom, téléphone, adresse, consignes), choix enlèvement ou livraison, puis vérification et envoi.
- Saisie guidée adaptée au tactile : gros boutons, claviers dédiés (numérique pour téléphone, adresse avec suggestions simples), retour arrière clair.
- Récapitulatif compact accessible en un tap : liste d’articles, mode de remise, paiement à la livraison, montant estimé ou mention « à confirmer ».
- Confirmation finale lisible : état « commande reçue », rappel des prochaines étapes, lien direct pour contacter le dépanneur ou corriger la commande rapidement.
- Suivi mobile réduit au nécessaire : timeline des états V1 avec messages courts et CTA pour appeler en cas de blocage.

### Expérience idéale au téléphone vocal (V1)

- Appel unique : l’assistant se présente, confirme le dépanneur et indique le paiement à la livraison.
- Collecte guidée des articles un par un (nom puis quantité), avec reformulation courte et option de correction immédiate (« oui/non », répéter, enlever un article).
- Capture des coordonnées dans la foulée : nom, numéro de rappel, adresse, consignes d’accès, puis choix enlèvement ou livraison.
- Gestion des frictions de base : si adresse hors zone ou article critique absent, l’assistant propose corriger l’adresse, passer en retrait ou retirer/remplacer l’article avant de continuer.
- Récapitulatif vocal final : articles et quantités, mode de remise, paiement à la livraison, montant estimé ou mention « à confirmer », créneau indicatif si fourni par le dépanneur.
- Clôture explicite : annonce de l’état « commande reçue » et envoi d’un SMS/récap court pour assurer le suivi.

### Bénéfices vendeurs pour les dépanneurs (V1)

- Commandes reçues complètes du premier coup (articles, quantités, coordonnées, consignes, mention paiement à la livraison).
- Moins d’allers-retours téléphoniques : le client corrige ou complète pendant le parcours assisté mobile ou vocal.
- Fil d’états simple (Reçue, Confirmée, En préparation, En route/Prête, Remise, Refusée/Annulée) pour informer sans rédiger de longs messages.
- Remplacements ou retraits d’articles gérés avant préparation, ce qui réduit les pertes de temps et évite les paniers à moitié exploitables.
- Plus de commandes captées : les clients pressés ou peu à l’aise avec le web peuvent quand même commander via l’appel vocal guidé.

### Bénéfices finaux pour les consommateurs (V1)

- Commande rapide et guidée en quelques étapes sur mobile ou en appel, sans création de compte complexe ni paiement en ligne.
- Moins d’incertitude : récap clair, état « commande reçue », suivi des étapes et rappel du paiement à la livraison.
- Accessibilité accrue : gros contrôles tactiles, claviers adaptés et alternative vocale pour les personnes pressées ou à mobilité limitée.
- Reprises simples en cas de friction : adresse hors zone ou article indisponible traités immédiatement avec des choix simples.
- Rassurance côté livraison : indication du mode (enlèvement ou livraison), du montant à payer à la remise et d’un créneau indicatif quand fourni.

### Rôle de l’assistant dans le site (V1)

- Guider la saisie de commande : articles et quantités, coordonnées, consignes, choix enlèvement ou livraison, rappel du paiement à la livraison.
- Vérifier et reformuler avant envoi : récapitulatif clair, demande de confirmation, indication du statut « commande reçue » une fois envoyée.
- Aider sur les frictions V1 : signaler hors zone, proposer correction d’adresse ou passage en retrait, gérer l’indisponibilité d’un article par remplacement ou retrait.
- Transmettre au dépanneur et relayer l’état : mettre à jour la timeline V1 visible par le client et montrer les étapes en attente de confirmation du dépanneur.
- Faciliter le contact : proposer les CTA pertinents (appeler, corriger, ajouter une consigne) quand une clarification humaine est nécessaire.

## Fichiers à lire en premier

- `docs/1000-checklist.md` — la checklist complète des 1000 tâches
- `docs/STATE.md` — l’état vivant du projet
- `docs/TASK-BLOCKS.md` — le découpage en blocs de 10 tâches pour GitHub Issues
- `.github/copilot-instructions.md` — les règles d’exécution pour Copilot

## Règle de base

On avance **dans l’ordre**.
On évite de sauter à une tâche lointaine tant que le bloc actif n’est pas stabilisé.

## Workflow recommandé

1. Lire `docs/STATE.md`
2. Ouvrir ou mettre à jour l’issue du bloc actif
3. Travailler uniquement sur ce bloc
4. Ouvrir une pull request liée à l’issue
5. Mettre à jour `docs/STATE.md`
6. Cocher les lignes terminées dans `docs/1000-checklist.md`

## Structure initiale

```text
docs/
apps/
packages/
infra/
scripts/
assets/
decisions/
diagrams/
prompts/
.github/
```

## Statut actuel

Le dépôt existe, mais la base projet est encore au tout début.
Le premier bloc pratique recommandé est le bloc GitHub de fondation autour de la zone `0084+`.

## Licence

Le fichier `LICENSE` fourni ici est un **placeholder propriétaire**.
Il peut être remplacé plus tard par la licence finale choisie.
