# DEP-0895 à DEP-0914 — Préparation et tests pilote

## Périmètre

Ce document rassemble la préparation des comptes et ressources du pilote, la
formation des rôles terrain, et les tests fictifs du pilote. Les décisions
couvrent **uniquement** la documentation : aucun setup réel, aucune activation
de numéro ou d’utilisateur productif. Tous les éléments se font en
environnement de démonstration/staging avec données factices.

### Principes communs (pilote fictif)
- Environnement : staging/sandbox uniquement, tenant pilote isolé, catalogue démo et comptes clients factices.
- Téléphonie : appels simulés via sandbox (TTS), aucune redirection vers des appareils personnels.
- Notifications : pas d’email/SMS vers l’extérieur ; chaque message indique « session de test ».
- Données : nettoyage après chaque session de test ; aucune PII réelle.
- Journalisation : conserver les journaux staging (commandes, livraisons, téléphonie) pour débrief interne uniquement.

### Livrables communs
- Fiches d’accès staging (dépanneur/livreur) avec procédure OTP simulée.
- Scripts vocaux/textes d’accueil et de validation stockés dans la doc interne.
- Scénarios de tests (jour, soir, aléas) et checklists de validation associées.
- Captures clés (connexion, parcours complet) pour preuve de maîtrise.

---

## DEP-0895 — Préparer les utilisateurs dépanneur du pilote

### Objectif
Disposer d’identités dépanneur prêtes pour les tests pilote (staging), sans
impacter la production.

### Préparation
| Élément | Décision / Consigne |
|---|---|
| Comptes | 2 comptes dépanneur minimum (`pilot_reception_1`, `pilot_reception_2`) créés en staging uniquement. |
| Authentification | Login par email factice + OTP SMS simulé ; pas d’accès production. |
| Permissions | Rôle `depanneur` avec accès réception + admin catalogue si requis par les tests. |
| Données personnelles | Numéros masqués (`+3310000xxxx`) et adresses génériques ; aucune PII réelle. |

### Validation
- Connexion OK sur l’interface réception staging.
- Accès limité au tenant pilote factice.

### Livrables
- Fiche d’accès pour chaque compte (email factice, OTP simulé, rôle).
- Capture d’écran de la connexion réussie sur la réception staging.

---

## DEP-0896 — Préparer les utilisateurs livreur du pilote

### Objectif
Disposer d’identités livreur prêtes pour les tests pilote (staging) avec
permissions livraison uniquement.

### Préparation
| Élément | Décision / Consigne |
|---|---|
| Comptes | 2 comptes livreur (`pilot_livreur_1`, `pilot_livreur_2`) en staging. |
| Authentification | Email factice + OTP SMS simulé ; pas d’appareil perso requis. |
| Permissions | Rôle `livreur` restreint aux vues et actions livraison. |
| Données personnelles | Numéros masqués ; aucune photo ou document personnel requis en V1. |

### Validation
- Connexion OK sur interface livraison staging.
- Impossible d’accéder aux écrans admin ou client.

### Livrables
- Fiche d’accès pour chaque compte (email factice, OTP simulé, rôle).
- Capture d’écran de la liste des courses vide puis assignée en staging.

---

## DEP-0897 — Préparer le numéro téléphonique du pilote

### Objectif
Définir le numéro du pilote en environnement de test sans achat ni routage
productif.

### Préparation
| Élément | Décision / Consigne |
|---|---|
| Type | Numéro virtuel **staging** uniquement ; pas de publication publique. |
| Routage | Redirection vers sandbox téléphonie documentée (Twilio sandbox ou équivalent) avec voix TTS par défaut. |
| Affichage | Mention “Numéro de démonstration” sur tout support interne. |
| Journalisation | Logs d’appels stockés en sandbox conformément à DEP-0855 (journal téléphonique). |

### Validation
- Appel simulé atteint le flow sandbox sans composer de numéro réel.
- Aucun renvoi vers un téléphone personnel.

### Livrables
- Fiche du numéro sandbox (SID, région, message d’avertissement).
- Capture ou transcription du flow d’appel simulé.

---

## DEP-0898 — Préparer les messages d’accueil du pilote

### Objectif
Fournir les messages d’accueil utilisés pendant les tests pilote (voix et
texte) sans enregistrement public.

### Contenu
| Moment | Message (FR) | Règle |
|---|---|---|
| Accueil | « Bienvenue sur la ligne de démonstration Dépanneur IA. » | Doit citer qu’il s’agit d’un test. |
| Attente | « Merci de patienter, nous simulons la prise de commande. » | Durée max 15 s avant réponse. |
| Fermeture | « La session de test est terminée, merci. » | Pas de renvoi vers un humain. |

### Validation
- Messages disponibles en TTS FR ; option EN facultative si déjà prévue.
- Scripts stockés dans le dossier `docs/telephonie/scripts/` (staging), pas de
diffusion externe.
- Lecture test enregistrée (fichier local) pour vérification interne.

---

## DEP-0899 — Former le dépanneur à l’interface réception

### Objectif
S’assurer que le dépanneur pilote maîtrise la réception : arrivée des
commandes, changements d’état, alertes, journal.

### Parcours de formation
| Étape | Contenu | Critère de maîtrise |
|---|---|---|
| Connexion | Accès tableau réception, filtres par statut | Navigation sans aide en <5 min |
| Actions principales | Accepter, refuser, marquer prêt, assigner livreur | Réalise 3 commandes fictives sans erreur |
| Journal & alertes | Lecture journal immuable, réaction à alerte sonore | Identifie l’événement dans le journal |
| Accessibilité | Raccourcis clavier essentiels si activés | Effectue 1 parcours complet au clavier |

### Livrables
- Checklist formation signée (3 commandes test traitées).
- Capture du journal montrant les actions successives.

---

## DEP-0900 — Former le livreur à l’interface livraison

### Objectif
Former le livreur pilote aux statuts livraison et à la preuve de remise.

### Parcours de formation
| Étape | Contenu | Critère de maîtrise |
|---|---|---|
| Connexion | Liste des courses disponibles/assignées | Ouvre et lit une fiche livraison |
| Cycle statut | Accepter/refuser, partir, arrivé, livré | Enchaîne le cycle complet sur 2 commandes test |
| Notes & appels | Consulter notes client, lancer appel simulé | Appel test déclenché depuis la fiche |
| Preuve | Ajouter confirmation remise (bouton/checkbox) | Statut livré visible côté dépanneur |

### Livrables
- Capture du cycle complet de statuts sur une commande factice.
- Note de remise simulée visible côté dépanneur.

---

## DEP-0901 — Former le dépanneur à l’admin produits

### Objectif
Assurer que le dépanneur sait gérer le catalogue minimal pour le pilote.

### Parcours de formation
| Étape | Contenu | Critère de maîtrise |
|---|---|---|
| Ajout/édition | Ajouter un produit, modifier prix/disponibilité | 1 produit créé et édité en staging |
| Images | Téléverser image principale (placeholder) | Image conforme aux conventions DEP-0256 |
| Tri | Réordonner un produit dans une catégorie | Ordre reflété côté boutique staging |
| Validation | Vérifier statut brouillon/actif | Produit activé visible en test |

### Livrables
- Produit démo créé + édité en staging (capture avant/après).
- Note rappelant l’usage exclusif d’images placeholders.

---

## DEP-0902 — Former le dépanneur aux alertes

### Objectif
Maîtriser la réception et le traitement des alertes opérationnelles (commande,
stock, paiement).

### Parcours de formation
| Étape | Contenu | Critère de maîtrise |
|---|---|---|
| Types d’alertes | Nouvelle commande, article manquant, incident livraison | Identifie le type et sa priorité |
| Gestion | Ouvrir, marquer résolu, ajouter note | 3 alertes traitées sans assistance |
| Notification | Comprendre sons/badges, pas d’usage email prod | Peut différencier sonore vs visuel |

### Livrables
- Journal d’alertes montrant 3 résolutions.
- Fiche mémo des types/priorités d’alertes.

---

## DEP-0903 — Former le dépanneur à la gestion des remplacements

### Objectif
Gérer un produit manquant et proposer un remplacement au client.

### Parcours de formation
| Étape | Contenu | Critère de maîtrise |
|---|---|---|
| Détection | Marquer un article manquant dans la commande | Journal mis à jour avec motif |
| Proposition | Sélectionner un produit de remplacement | Remplacement proposé côté client/assistant |
| Validation | Accepter/refuser la réponse client simulée | Statut reflété dans la commande test |
| Communication | Message pré-écrit d’excuse/confirmation | Message envoyé via canal simulé |

### Livrables
- Capture du flux remplacement (proposition, acceptation/refus).
- Modèle de message d’excuse utilisé en simulation.

---

## DEP-0904 — Former le dépanneur au paiement à la livraison

### Objectif
Savoir marquer et suivre un paiement à la livraison en V1.

### Parcours de formation
| Étape | Contenu | Critère de maîtrise |
|---|---|---|
| Modes | Cash vs terminal (simulation) | Sélectionne le mode correct |
| Statuts | Marquer payé/non payé/problème | Statut reflété côté livreur et client |
| Journal | Ajouter note de paiement | Note visible dans la timeline |
| Exceptions | Que faire en cas de refus de paiement | Procédure expliquée, statut problème utilisé |

### Livrables
- Capture de statut « payé » et « problème paiement » sur commandes test.
- Procédure écrite pour refus de paiement (staging uniquement).

---

## DEP-0905 — Former le livreur à la confirmation de remise

### Objectif
Assurer la saisie correcte de la remise au client.

### Parcours de formation
| Étape | Contenu | Critère de maîtrise |
|---|---|---|
| Vérification | Vérifier nom/adresse avant remise | Compare avec fiche commande |
| Confirmation | Bouton « remis » ou équivalent | Statut livré mis à jour côté dépanneur |
| Notes | Ajouter note (ex : remis au concierge) | Note visible en consultation ultérieure |
| Synchronisation | Attendre synchro réseau avant fermeture | Pas de perte d’état en mode offline simulé |

### Livrables
- Capture de la confirmation remise et de la note associée.
- Temps de synchro mesuré en mode offline simulé.

---

## DEP-0906 — Former le livreur à la gestion des problèmes

### Objectif
Traiter les incidents livraison pendant le pilote.

### Parcours de formation
| Étape | Contenu | Critère de maîtrise |
|---|---|---|
| Types | Client absent, adresse mauvaise, paiement refusé | Identifie l’option correcte |
| Actions | Marquer problème, notifier dépanneur | Alerte reçue côté dépanneur |
| Escalade | Escalade vers support pilote (contact interne) | Contact simulé déclenché |
| Reprise | Replanifier ou annuler selon consigne | Statut mis à jour et journal cohérent |

### Livrables
- Journal montrant une alerte problème et sa résolution.
- Contact d’escalade interne documenté (staging).

---

## DEP-0907 — Tester un jour complet fictif de commandes pilote

### Objectif
Simuler une journée type avec commandes étalées pour valider les flux.

### Scénarios
| Créneau | Scénario | Attendu |
|---|---|---|
| Matin (3 cmd) | Commandes simples en manuel | Réception, préparation, livraison ok |
| Midi (4 cmd) | Pics simultanés, un remplacement | Files visibles, remplacement validé |
| Après-midi (3 cmd) | Annulation client simulée | Statut annulé et journal mis à jour |
| Soir (2 cmd) | Paiement à la livraison | Statut payé saisi côté dépanneur |

### Validation
- Aucun blocage interface dépanneur/livreur.
- Journal complet pour chaque commande.
- Rapport de fin de journée listant incidents et temps de traitement.

---

## DEP-0908 — Tester un soir complet fictif de commandes pilote

### Objectif
Tester les pics soirée avec contraintes horaires.

### Scénarios
| Créneau | Scénario | Attendu |
|---|---|---|
| 18h–20h | 5 commandes rapprochées | Alertes réception distinctes, pas de perte |
| 20h–22h | 3 commandes assistées voix/texte | Assistant enregistre et crée commandes |
| Fermeture | 1 commande refusée pour fermeture | Message explicite et statut annulé |

### Validation
- SLA simulation respecté (préparation <20 min).
- Aucune notification envoyée à des contacts réels.
- Rapport synthèse sur charge et latence des alertes.

---

## DEP-0909 — Tester une panne réseau pendant le pilote

### Objectif
Vérifier la résilience lors d’une coupure réseau côté dépanneur ou livreur.

### Scénarios
| Rôle | Scénario | Attendu |
|---|---|---|
| Dépanneur | Déconnexion 5 min en préparation | Statut reste en local, resynchronise au retour |
| Livreur | Perte réseau en route | App mobile affiche mode offline, pas de perte de statut |

### Validation
- Messages d’erreur clairs, aucune donnée perdue.
- Journal note l’incident réseau (staging).
- Rapport d’incident incluant durée de coupure et resynchronisation.

---

## DEP-0910 — Tester une indisponibilité d’un produit pendant le pilote

### Objectif
Valider le flux de rupture et remplacement pendant le pilote.

### Scénarios
| Étape | Scénario | Attendu |
|---|---|---|
| Détection | Produit marqué indisponible après commande | Alerte dépanneur + info client |
| Remplacement | Proposition de remplacement envoyée | Client (simulé) répond, commande mise à jour |
| Refus | Si refus, article supprimé | Total recalculé, journal mis à jour |

### Validation
- Aucun produit indispo ne reste « actif » sans décision.
- Capture montrant le journal de rupture et la décision prise.

---

## DEP-0911 — Tester une erreur d’adresse pendant le pilote

### Objectif
Gérer une adresse invalide ou hors zone durant le flux pilote.

### Scénarios
| Étape | Scénario | Attendu |
|---|---|---|
| Saisie | Adresse hors zone détectée | Message refus + proposition d’adresse alternative |
| Livraison | Adresse incomplète détectée par livreur | Alerte au dépanneur, suspension livraison |

### Validation
- Statut passe en « problème » avec note cause.
- Pas de livraison poursuivie sans correction.
- Capture de l’erreur affichée et de la note corrective.

---

## DEP-0912 — Tester une annulation pendant le pilote

### Objectif
S’assurer qu’une annulation (client ou dépanneur) est gérée proprement.

### Scénarios
| Origine | Scénario | Attendu |
|---|---|---|
| Client | Annulation avant préparation | Remboursement non applicable (paiement à la livraison), statut annulé |
| Dépanneur | Annulation pour stock vide | Message client clair, commande fermée |

### Validation
- Journal inclut motif et acteur.
- Alertes dépanneur/livreur se ferment.
- Capture du statut annulé et du message associé.

---

## DEP-0913 — Tester une commande téléphonique pendant le pilote

### Objectif
Tester le parcours voix (appel simulé) de bout en bout.

### Scénarios
| Étape | Scénario | Attendu |
|---|---|---|
| Accueil | Appel sur numéro sandbox | Message d’accueil pilote joué |
| Prise de commande | Dictée d’une liste courte | Assistant crée commande en staging |
| Confirmation | Récapitulatif lu à voix haute | Validation vocale enregistrée |

### Validation
- Transcription stockée en sandbox, pas de PII réelle.
- Commande visible côté dépanneur en <1 min.
- Audio TTS sauvegardé localement pour débrief.

---

## DEP-0914 — Tester une commande assistée texte pendant le pilote

### Objectif
Tester le parcours assisté texte (chat) complet.

### Scénarios
| Étape | Scénario | Attendu |
|---|---|---|
| Démarrage | Message de bienvenue assistant | Mention “session de test” affichée |
| Conversation | Ajout de 2 produits via suggestions | Panier mis à jour en temps réel |
| Finalisation | Confirmation adresse et créneau | Commande créée, statut « en attente » |

### Validation
- Journal assistant inclut l’intention et les produits.
- Aucun envoi de notification à de vrais clients.
- Capture de la conversation et du panier final.
