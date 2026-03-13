# DEP-0171 à DEP-0180 — Pages secondaires

## Périmètre

Définir les pages secondaires de l'application V1 : gestion d'adresses,
historique et suivi de commandes, produits populaires, contact, pages légales,
accessibilité et aide vocale.

---

## DEP-0171 — Page d'adresses client

| Attribut     | Valeur                                       |
|--------------|----------------------------------------------|
| Route        | `/profil/adresses`                           |
| Accès        | Authentifié (client)                          |
| Profils      | Client                                        |

### Objectif

Permettre au client de gérer ses adresses de livraison enregistrées.

### Contenu principal

- **Liste des adresses** : chaque adresse affiche le libellé (ex. « Maison »,
  « Bureau »), l'adresse complète et un indicateur « par défaut ».
- **Bouton « Ajouter une adresse »** : formulaire en ligne ou en modal avec
  les champs : libellé, adresse, ville, code postal, consignes d'accès.
- **Actions par adresse** : modifier, supprimer, définir comme adresse par
  défaut.
- **Limite V1** : maximum 5 adresses enregistrées par client.

### Comportement mobile

- Liste en cartes empilées, actions accessibles par glissement ou menu
  contextuel.

---

## DEP-0172 — Page d'historique des commandes

| Attribut     | Valeur                                       |
|--------------|----------------------------------------------|
| Route        | `/commandes`                                 |
| Accès        | Authentifié (client)                          |
| Profils      | Client                                        |

### Objectif

Afficher la liste de toutes les commandes passées par le client, avec
leur statut.

### Contenu principal

- **Liste des commandes** : triée par date décroissante, chaque entrée affiche
  la date, le nombre d'articles, le statut actuel (Reçue, Confirmée,
  En préparation, En route/Prête, Remise, Refusée, Annulée) et le montant
  estimé ou final.
- **Filtre par statut** : tous, en cours, terminées, annulées/refusées.
- **Lien vers le détail** : clic sur une commande → `/commandes/:id`.
- **Pagination** : chargement progressif ou pagination classique (20 commandes
  par page).

### Comportement mobile

- Liste en cartes compactes, filtre en bandeau horizontal défilable.

---

## DEP-0173 — Page de dernière commande

| Attribut     | Valeur                                       |
|--------------|----------------------------------------------|
| Route        | `/commandes/derniere`                        |
| Accès        | Authentifié (client)                          |
| Profils      | Client                                        |

### Objectif

Offrir un accès rapide à la dernière commande du client, qu'elle soit en cours
ou terminée.

### Contenu principal

- **Redirection intelligente** : si une commande est en cours, affiche
  directement son suivi. Sinon, affiche la dernière commande terminée.
- **Récapitulatif** : date, articles et quantités, adresse de livraison,
  mode de remise, statut actuel, montant.
- **Timeline des états** : progression visuelle des étapes de la commande
  (Reçue → Confirmée → En préparation → En route/Prête → Remise).
- **Actions rapides** : « Recommander les mêmes articles » (pré-remplit le
  panier), « Contacter le dépanneur ».

### Comportement mobile

- Timeline verticale compacte.
- Boutons d'action en bas de l'écran (sticky).

---

## DEP-0174 — Page des produits populaires

| Attribut     | Valeur                                       |
|--------------|----------------------------------------------|
| Route        | `/produits-populaires`                       |
| Accès        | Public                                        |
| Profils      | Client                                        |

### Objectif

Présenter les produits les plus commandés pour faciliter la découverte et
accélérer la commande.

### Contenu principal

- **Grille de produits** : produits triés par popularité (nombre de commandes),
  avec image miniature, nom, catégorie, prix si affiché ou mention
  « prix à confirmer », bouton « Ajouter ».
- **Filtre par catégorie** : épicerie, boissons, hygiène, etc.
- **Lien vers la boutique complète** : « Voir tout le catalogue » → `/boutique`.
- **Mise à jour** : liste recalculée périodiquement (ex. quotidiennement).

### Comportement mobile

- Grille en 2 colonnes.
- Filtre en bandeau défilable.

---

## DEP-0175 — Page de suivi de commande

| Attribut     | Valeur                                       |
|--------------|----------------------------------------------|
| Route        | `/commandes/:id`                             |
| Accès        | Authentifié (client)                          |
| Profils      | Client                                        |

### Objectif

Permettre au client de suivre l'état d'une commande spécifique en temps réel.

### Contenu principal

- **En-tête** : numéro de commande, date, statut actuel mis en évidence.
- **Timeline des états V1** : Reçue → Confirmée → En préparation →
  En route/Prête → Remise (ou Refusée/Annulée). Chaque étape affiche l'heure
  de passage si disponible.
- **Détail de la commande** : liste des articles et quantités, adresse de
  livraison, mode de remise, consignes, montant estimé ou final, mention
  « paiement à la livraison ».
- **Messages du dépanneur** : zone d'affichage des messages liés à la commande
  (indisponibilité, remplacement proposé, heure estimée de remise).
- **Actions** : « Contacter le dépanneur » (bouton d'appel ou de message),
  « Modifier la commande » (si statut le permet : Reçue uniquement).

### Comportement mobile

- Timeline verticale compacte en haut.
- Détail en accordéon.
- Boutons d'action sticky en bas.

---

## DEP-0176 — Page de contact du dépanneur

| Attribut     | Valeur                                       |
|--------------|----------------------------------------------|
| Route        | `/contact`                                   |
| Accès        | Public                                        |
| Profils      | Client                                        |

### Objectif

Fournir au client les moyens de contacter le dépanneur directement.

### Contenu principal

- **Informations de contact** : nom de la boutique, numéro de téléphone
  (cliquable pour appel direct sur mobile), adresse physique, horaires
  d'ouverture.
- **Formulaire de contact simple** : nom, téléphone ou courriel, message.
  Soumission enregistrée pour consultation par le dépanneur.
- **Carte ou indication de localisation** : adresse affichée clairement
  (intégration carte optionnelle en V1).
- **Lien vers l'aide vocale** : « Besoin d'aide ? Appelez-nous » →
  `/aide-vocale`.

### Comportement mobile

- Bouton d'appel proéminent en haut.
- Formulaire simple en dessous.

---

## DEP-0177 — Page de conditions d'utilisation

| Attribut     | Valeur                                       |
|--------------|----------------------------------------------|
| Route        | `/conditions-utilisation`                    |
| Accès        | Public                                        |
| Profils      | Tous                                          |

### Objectif

Présenter les conditions générales d'utilisation du service DépannVite.

### Contenu principal

- **Texte structuré** avec sections numérotées :
  1. Objet du service
  2. Inscription et compte utilisateur
  3. Passation de commande
  4. Paiement à la livraison
  5. Responsabilités
  6. Propriété intellectuelle
  7. Protection des données (renvoi vers `/confidentialite`)
  8. Modification des conditions
  9. Droit applicable et juridiction
- **Date de dernière mise à jour** affichée en haut.
- **Version imprimable** : bouton ou lien pour impression / PDF.

### Comportement mobile

- Texte long défilable avec table des matières cliquable en haut.

---

## DEP-0178 — Page de confidentialité

| Attribut     | Valeur                                       |
|--------------|----------------------------------------------|
| Route        | `/confidentialite`                           |
| Accès        | Public                                        |
| Profils      | Tous                                          |

### Objectif

Informer les utilisateurs sur la collecte, l'utilisation et la protection de
leurs données personnelles.

### Contenu principal

- **Texte structuré** avec sections :
  1. Données collectées (nom, téléphone, adresse, historique de commandes)
  2. Finalités du traitement (exécution de commande, suivi, amélioration)
  3. Partage des données (dépanneur, livreur — strictement nécessaire)
  4. Durée de conservation
  5. Droits de l'utilisateur (accès, rectification, suppression)
  6. Sécurité des données
  7. Cookies et technologies similaires
  8. Contact du responsable des données
- **Date de dernière mise à jour** affichée en haut.
- **Lien vers les conditions** : renvoi vers `/conditions-utilisation`.

### Comportement mobile

- Même approche que les conditions : texte défilable avec table des matières.

---

## DEP-0179 — Page d'accessibilité

| Attribut     | Valeur                                       |
|--------------|----------------------------------------------|
| Route        | `/accessibilite`                             |
| Accès        | Public                                        |
| Profils      | Tous                                          |

### Objectif

Décrire les engagements d'accessibilité de DépannVite et les moyens mis en
œuvre pour les utilisateurs à besoins spécifiques.

### Contenu principal

- **Déclaration d'accessibilité** : engagement à rendre le service accessible
  à tous, conformément aux standards WCAG 2.1 niveau AA visés en V1.
- **Fonctionnalités d'accessibilité** :
  - Navigation au clavier complète.
  - Compatibilité lecteurs d'écran (attributs ARIA).
  - Contraste suffisant des textes et éléments interactifs.
  - Tailles de cible tactile adaptées (minimum 44×44 px).
  - Alternative vocale pour la commande (→ `/aide-vocale`).
- **Limites connues** : liste des éléments non encore conformes (mise à jour
  régulière).
- **Contact** : formulaire ou lien pour signaler un problème d'accessibilité.

### Comportement mobile

- Texte structuré et défilable.
- Liens directs vers les alternatives (aide vocale, contact).

---

## DEP-0180 — Page d'aide vocale

| Attribut     | Valeur                                       |
|--------------|----------------------------------------------|
| Route        | `/aide-vocale`                               |
| Accès        | Public                                        |
| Profils      | Client                                        |

### Objectif

Présenter le service de commande par téléphone et guider le client vers
l'appel à l'assistant vocal.

### Contenu principal

- **Explication du service** : description du parcours téléphonique en langage
  simple (l'assistant vous guide, vous dictez vos articles, il confirme et
  envoie la commande).
- **Numéro de téléphone** : affiché en grand, cliquable pour appel direct
  sur mobile.
- **Étapes du parcours vocal** :
  1. Appeler le numéro.
  2. L'assistant se présente et confirme le dépanneur.
  3. Dicter les articles un par un.
  4. Donner les coordonnées (nom, téléphone, adresse).
  5. Choisir enlèvement ou livraison.
  6. L'assistant récapitule et confirme.
  7. Recevoir un SMS de confirmation avec le suivi.
- **FAQ vocale** : réponses aux questions fréquentes (« Et si je me trompe ? »,
  « Combien ça coûte ? », « Puis-je annuler ? »).
- **Lien vers le mode assisté écran** : « Préférez commander à l'écran ? »
  → `/mode-assiste`.

### Comportement mobile

- Numéro de téléphone en bouton d'appel proéminent.
- Étapes en liste numérotée simple.
- FAQ en accordéon.

---

## Résumé des pages secondaires (V1)

| Route                     | Page                          | Accès           |
|---------------------------|-------------------------------|-----------------|
| `/profil/adresses`        | Adresses client               | Authentifié     |
| `/commandes`              | Historique des commandes      | Authentifié     |
| `/commandes/derniere`     | Dernière commande             | Authentifié     |
| `/produits-populaires`    | Produits populaires           | Public          |
| `/commandes/:id`          | Suivi de commande             | Authentifié     |
| `/contact`                | Contact du dépanneur          | Public          |
| `/conditions-utilisation` | Conditions d'utilisation      | Public          |
| `/confidentialite`        | Confidentialité               | Public          |
| `/accessibilite`          | Accessibilité                 | Public          |
| `/aide-vocale`            | Aide vocale                   | Public          |
