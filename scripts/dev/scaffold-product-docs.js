/* eslint-disable */
const fs = require('fs');
const path = require('path');

const root = '/home/gaby/depaneurIA';

function read(file) {
  try {
    return fs.readFileSync(path.join(root, file), 'utf8');
  } catch (e) {
    return null;
  }
}

function write(file, content) {
  const fullPath = path.join(root, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
}

// 1. Site Maps
write('docs/product/site-map-client.md', `
# Site Map Client V1

**Objectif** : Permettre au client de commander rapidement via une interface manuelle ou assistée.
**Utilisateurs visés** : Clients finaux du dépanneur.

## Pages Principales (V1)
- **Accueil Public** (\`/\`) : Choix du mode de commande (Manuel ou Assisté).
- **Boutique Manuelle** (\`/shop\`) : Catalogue classique, navigation par catégories.
- **Mode Assisté** (\`/assistant\`) : Interface conversationnelle (texte/voix).
- **Panier & Checkout** (\`/cart\`) : Révision de la commande, saisie adresse/contact, validation.
- **Suivi de Commande** (\`/order/:id\`) : État en temps réel de la commande.

## Pages Secondaires (V1)
- **Produits Populaires** (\`/shop/popular\`) : Top 10 des produits les plus vendus.
- **Dernière Commande** (\`/shop/last-order\`) : Recommander rapidement (nécessite d'être identifié).
- **Connexion / Inscription** (\`/auth\`) : Identification simplifiée (téléphone).
- **Profil Client** (\`/profile\`) : Informations de base.
- **Adresses** (\`/profile/addresses\`) : Carnet d'adresses de livraison.
- **Historique Commandes** (\`/profile/orders\`) : Liste des commandes passées.
- **Contact Dépanneur** (\`/contact\`) : Coordonnées et horaires du dépanneur actif.

## Pages Système (V1)
- **Conditions d'utilisation** (\`/terms\`)
- **Confidentialité** (\`/privacy\`)
- **Accessibilité** (\`/accessibility\`)
- **Aide Vocale** (\`/help/voice\`)

## Futures pages (Hors V1)
- Paiement en ligne sécurisé
- Programme de fidélité
- Parrainage
`);

write('docs/product/site-map-store.md', `
# Site Map Store (Dépanneur) V1

**Objectif** : Recevoir, préparer et expédier les commandes simplement.
**Utilisateurs visés** : Gérants et employés de dépanneur.

## Pages Principales (V1)
- **Tableau de Réception** (\`/\`) : Vue en temps réel des nouvelles commandes.
- **Commandes en Cours** (\`/orders/active\`) : Commandes en préparation ou en attente livreur.
- **Détail Commande** (\`/order/:id\`) : Articles à préparer, validation de stock, assignation.
- **Catalogue Admin** (\`/catalog\`) : Gestion de l'inventaire.

## Pages Secondaires (V1)
- **Produits** (\`/catalog/products\`) : Ajouter, modifier, masquer des produits.
- **Catégories** (\`/catalog/categories\`) : Organisation du catalogue.
- **Historique Commandes** (\`/orders/history\`) : Commandes terminées ou annulées.
- **Paramètres de base** (\`/settings\`) : Nom, adresse, téléphone.
- **Horaires** (\`/settings/hours\`) : Heures d'ouverture pour la réception.
- **Zone de livraison** (\`/settings/delivery-zones\`) : Zones desservies.

## Futures pages (Hors V1)
- Gestion avancée des stocks (inventaire précis)
- Tableaux de bord financiers (Analytics)
- Gestion des promotions
`);

write('docs/product/site-map-driver.md', `
# Site Map Driver (Livreur) V1

**Objectif** : Gérer les courses assignées, confirmer les remises et encaissements.
**Utilisateurs visés** : Livreurs (internes ou externes).

## Pages Principales (V1)
- **Livraisons Assignées** (\`/\`) : Liste des courses à effectuer.
- **Livraison en Cours** (\`/delivery/:id\`) : Navigation, infos client, montant à encaisser.

## Pages Secondaires (V1)
- **Livraisons Disponibles** (\`/deliveries/available\`) : Pool de courses si modèle ouvert.
- **Historique Livraisons** (\`/history\`) : Courses terminées de la journée.
- **État Remise** (\`/delivery/:id/complete\`) : Confirmation de remise et encaissement.
- **Contact Client** (\`/delivery/:id/contact\`) : Lien rapide pour appeler le client.

## Futures pages (Hors V1)
- Carte interactive avec optimisation de tournée
- Historique de facturation livreur
`);

write('docs/product/site-map-super-admin.md', `
# Site Map Super Admin V1

**Objectif** : Gérer la plateforme multi-tenant, superviser la santé globale du système.
**Utilisateurs visés** : Opérateurs de la plateforme (nous).

## Pages Principales (V1)
- **Dashboard Santé** (\`/\`) : États système, incidents actifs.
- **Tenants (Dépanneurs)** (\`/tenants\`) : Liste, création, désactivation de boutiques.
- **Supervision Commandes** (\`/monitoring/orders\`) : Vue globale des commandes en souffrance.

## Pages Secondaires (V1)
- **Supervision Appels** (\`/monitoring/calls\`) : Logs et états de la passerelle téléphonique.
- **Configuration Globale** (\`/settings\`) : Variables système globales non-sensibles.
- **Catalogue des Clients** (\`/customers\`) : Base de données clients transversale (lecture seule).

## Futures pages (Hors V1)
- Facturation des tenants (Stripe Connect)
- Déploiement automatisé de nouveaux tenants
`);

// 2. Client Pages V1
write('docs/product/client-pages-v1.md', `
# Pages Clés Client (V1)

Définition précise des écrans du client final.

## 1. Page d'Accueil Publique
- **But** : Accueillir et orienter vers le mode de commande.
- **Cible** : Tout visiteur.
- **Contenu** : Promesse claire, gros boutons "Commande Rapide (Assisté)" et "Catalogue Complet".
- **Actions** : Choisir un mode.
- **Statut** : V1.

## 2. Page Boutique Manuelle
- **But** : Naviguer de manière autonome dans les produits.
- **Contenu** : Grille de produits, filtre par catégories.
- **Actions** : Ajouter au panier, ouvrir le produit.
- **État vide** : "Aucun produit dans cette catégorie".
- **Statut** : V1.

## 3. Page Mode Assisté
- **But** : Guider la commande par conversation (texte/voix).
- **Contenu** : Zone de chat (messages assistant/client), suggestions dynamiques, bouton micro.
- **Actions** : Parler, taper, cliquer sur une suggestion.
- **Erreurs** : "Je n'ai pas compris", "Ce produit n'est pas disponible".
- **Statut** : V1.

## 4. Page Panier & Checkout (Fusionnés en V1)
- **But** : Valider la commande et saisir les infos de livraison.
- **Contenu** : Liste des articles, total estimé, formulaire (nom, tél, adresse, notes), choix enlèvement/livraison. Rappel paiement à la livraison.
- **Actions** : Envoyer la commande.
- **Erreurs** : Champs manquants, adresse hors zone.
- **Statut** : V1.

## 5. Page Suivi de Commande
- **But** : Rassurer le client sur l'état de sa demande.
- **Contenu** : Timeline (Reçue -> Confirmée/Préparation -> En route/Prête -> Livrée/Remise).
- **Actions** : Contacter le dépanneur (appel rapide).
- **Statut** : V1.

## 6. Pages Utilitaires (V1)
- **Connexion/Inscription** : Formulaire simple (Téléphone + OTP ou Mot de passe simple en V1).
- **Profil & Adresses** : Gestion des informations de contact.
- **Dernière Commande / Populaires** : Raccourcis pour remplir le panier vite.
- **Système** : Conditions, Confidentialité, Accessibilité, Aide Vocale (texte statique clair).
`);

// 3. Layout Rules
write('docs/product/layout-rules-v1.md', `
# Règles de Layout V1

Le responsive est essentiel. L'interface s'adapte à deux contextes principaux.

## Disposition Ordinateur (Desktop - > 1024px)
Disposition en 3 colonnes ou 2 colonnes larges.
\`\`\`text
+-------------------+-----------------------------------+-------------------+
|                   |                                   |                   |
|  NAVIGATION GAUCHE|         CONTENU PRINCIPAL         |   PANIER DROITE   |
|  (Catégories,     |         (Grille Produits          |   (Toujours       |
|   Menu profil)    |          ou Chat Assisté)         |    visible)       |
|                   |                                   |                   |
+-------------------+-----------------------------------+-------------------+
\`\`\`
- **Panier** : Toujours visible à droite. Ne cache pas le contenu.
- **Chat Assisté** : Remplace le contenu principal s'il est activé. Les suggestions apparaissent sous les messages.

## Disposition Téléphone (Mobile - < 768px)
Disposition empilée. Priorité à la grille ou au chat.
\`\`\`text
+-----------------------------------+
| HEADER (Logo + Menu burger)       |
+-----------------------------------+
|                                   |
|         CONTENU PRINCIPAL         |
|         (Grille ou Chat)          |
|                                   |
+-----------------------------------+
| BOTTOM BAR (Panier flottant/Micro)|
+-----------------------------------+
\`\`\`
- **Panier** : Remplacé par une Bottom Bar flottante indiquant le total et le nombre d'articles. Ouvre un modal pleine page au clic.
- **Chat / Micro** : Le bouton micro remplace ou côtoie le panier dans la Bottom Bar en mode assisté.
- **Suggestions** : En mode chat mobile, elles s'affichent en boutons chips juste au-dessus de la zone de saisie texte/micro.

## Règles de Priorité Visuelle
1. L'action principale (Ajouter, Valider, Parler) doit toujours être au-dessus de la ligne de flottaison.
2. Le panier mobile ne doit jamais masquer le bouton de paiement.
3. Les erreurs (ex: hors zone) s'affichent en bannières collées en haut de l'écran (toast/alert).
`);

// 4. Client Interactions V1
write('docs/flows/client-interactions-v1.md', `
# Comportements Clés Client V1

## 1. Grille Produits
- **Au clic sur "Ajouter"** : Animation légère (feedback visuel), incrément du compteur du panier flottant ou mise à jour immédiate du panneau latéral. Aucun rechargement de page.

## 2. Assistant Vocal / Texte
- **Client dit une catégorie ("Je veux des chips")** : L'assistant affiche les chips les plus populaires en chips/suggestions cliquables et demande de préciser.
- **Client dit une marque ("Un Pepsi")** : L'assistant ajoute le format standard (ex: 2L ou canette selon historique) et confirme : "J'ai ajouté un Pepsi 2L, c'est bon ?".
- **Client ambigu ("À boire")** : L'assistant propose des sous-catégories (Eau, Jus, Soda, Bière).
- **Client perdu ("Je ne sais pas")** : L'assistant propose le "Top 3 des ventes du moment".

## 3. Comportement du Panier
- **Clic (Mobile)** : Ouvre en pleine page (modal glissant du bas).
- **Après validation** : Redirection vers \`/order/:id\` avec animation de succès. Panier vidé.
- **Pendant préparation/livraison** : Panier verrouillé pour cette commande (lecture seule sur l'écran de suivi).
- **Si commande échoue (Refus)** : Le panier initial est restauré pour permettre au client de modifier (ex: retirer l'article manquant) et renvoyer.
`);

// 5. Design System V1
write('docs/product/design-system-v1.md', `
# Système Visuel V1 (Design System)

## Couleurs (Tokens)
- **Primary** : Bleu vif ou Vert pro (Couleur de marque, pour les actions principales, ex: \`#2563EB\`).
- **Secondary** : Gris foncé (Texte principal, ex: \`#1F2937\`).
- **Background** : Blanc cassé (ex: \`#F9FAFB\`) pour le fond, Blanc pur (\`#FFFFFF\`) pour les cartes.
- **États** :
  - Succès : Vert (\`#10B981\`)
  - Alerte/Warning : Jaune/Orange (\`#F59E0B\`)
  - Erreur/Refus : Rouge (\`#EF4444\`)
  - Attente/Info : Bleu clair (\`#3B82F6\`)

## Typographie
- **Font principale** : Inter ou Roboto (sans-serif, très lisible).
- **Titres (H1/H2)** : Gras (Font-weight: 700), espacement serré.
- **Corps (Body)** : Regular (Font-weight: 400), taille minimale 16px sur mobile pour la lisibilité.

## Échelles et Tailles
- **Boutons** : Hauteur minimum de 44px sur mobile (Touch target standard Apple/Google).
- **Cartes Produits** : Design épuré, image carrée en haut, titre sur 2 lignes max, prix clair, gros bouton d'ajout.

## Style Visuel (Look & Feel)
- **Ombres (Shadows)** : Légères pour décoller les cartes du fond (ex: \`box-shadow: 0 4px 6px rgba(0,0,0,0.05)\`).
- **Bordures (Radii)** : Coins légèrement arrondis (\`8px\` à \`12px\`) pour un look moderne et amical.
- **Assistant** : Bulles de chat distinctes (Gris clair pour l'assistant, Couleur Primary pour le client).

## Animations Minimales
- **Ajout au panier** : Léger "pop" (scale 1.05 puis 1.0) sur le bouton et le badge du panier.
- **Ouverture suggestions** : Slide-up (glissement depuis le bas) ou Fade-in rapide (150ms).
- **Transition d'états (Suivi)** : Remplissage progressif d'une barre de progression.
`);

// 6. Component Catalog V1
write('docs/product/component-catalog-v1.md', `
# Catalogue de Composants V1

Liste des composants UI réutilisables à implémenter dans \`packages/ui\`.

## Boutons
- **ButtonPrimary** : Fond couleur Primary, texte blanc. Rôle : Action principale (Commander, Valider).
- **ButtonSecondary** : Fond transparent, bordure grise, texte gris. Rôle : Action d'annulation, retour.
- **VoiceButton** : Forme circulaire, icône Micro. États : Repos, Écoute (pulsation), Traitement (spinner).

## Entrées (Inputs)
- **SearchInput** : Champ texte avec icône loupe. Clearable (croix pour vider).
- **AddressInput** : Champ auto-complété pour adresse de livraison.

## Affichage Données
- **ProductCard** : Affiche image, nom, prix, et bouton ajout/quantité.
- **CartItem** : Ligne compacte affichant nom, quantité (ajustable), prix total de la ligne.
- **SuggestionTile** : Bouton ovale (chip) affichant un choix proposé par l'assistant.
- **OrderStatusBadge** : Petit badge coloré (Vert=Confirmé, Orange=Préparation).

## Layout & Retours
- **ConfirmModal** : Boîte de dialogue centrée (Titre, Message, 2 boutons).
- **ToastNotification** : Message éphémère en bas ou haut de l'écran (Succès/Erreur).

## Validation avant implémentation
*L'équipe de développement doit s'assurer que chaque composant développé dans \`@depaneuria/ui\` correspond exactement à ces définitions, sans ajouter de variantes non listées pour la V1 afin de garantir un TTM (Time To Market) rapide.*
`);

// 7. Route Manifests (Apps)
write('apps/web-client/src/app/route-manifest.ts', `
export const clientRoutes = [
  { path: '/', name: 'home', label: 'Accueil', status: 'v1' },
  { path: '/shop', name: 'shop', label: 'Boutique Manuelle', status: 'v1' },
  { path: '/assistant', name: 'assistant', label: 'Mode Assisté', status: 'v1' },
  { path: '/cart', name: 'cart', label: 'Panier & Checkout', status: 'v1' },
  { path: '/order/:id', name: 'order-tracking', label: 'Suivi Commande', status: 'v1' },
  { path: '/profile', name: 'profile', label: 'Profil', status: 'v1' },
  { path: '/auth', name: 'auth', label: 'Connexion', status: 'v1' },
  { path: '/pay', name: 'payment', label: 'Paiement en ligne', status: 'later' }
];
`);

write('apps/web-store/src/app/route-manifest.ts', `
export const storeRoutes = [
  { path: '/', name: 'dashboard', label: 'Tableau de Réception', status: 'v1' },
  { path: '/orders/active', name: 'active-orders', label: 'Commandes en Cours', status: 'v1' },
  { path: '/order/:id', name: 'order-detail', label: 'Détail Commande', status: 'v1' },
  { path: '/catalog', name: 'catalog', label: 'Catalogue Admin', status: 'v1' },
  { path: '/settings', name: 'settings', label: 'Paramètres', status: 'v1' },
  { path: '/analytics', name: 'analytics', label: 'Statistiques', status: 'later' }
];
`);

write('apps/web-driver/src/app/route-manifest.ts', `
export const driverRoutes = [
  { path: '/', name: 'assigned', label: 'Livraisons Assignées', status: 'v1' },
  { path: '/delivery/:id', name: 'delivery-detail', label: 'Livraison en Cours', status: 'v1' },
  { path: '/history', name: 'history', label: 'Historique', status: 'v1' },
  { path: '/map', name: 'map-view', label: 'Carte Interactive', status: 'later' }
];
`);

// 8. UI Package Manifests
write('packages/ui/src/design-tokens.ts', `
// Design Tokens Conceptuels (V1)
export const colors = {
  primary: '#2563EB',
  secondary: '#1F2937',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

export const radii = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px', // for pills/avatars
};
`);

write('packages/ui/src/component-manifest.ts', `
// Liste des composants prévus dans la V1 (Contrat)
export const ComponentManifest = [
  'ButtonPrimary',
  'ButtonSecondary',
  'VoiceButton',
  'SearchInput',
  'AddressInput',
  'ProductCard',
  'CartItem',
  'SuggestionTile',
  'OrderStatusBadge',
  'ConfirmModal',
  'ToastNotification'
];
`);

// 9. Update READMEs to link to product docs
function appendToReadme(filePath, text) {
  let content = read(filePath);
  if (content) {
    if (!content.includes(text.trim().split('\n')[0])) {
      write(filePath, content + '\n' + text);
    }
  }
}

appendToReadme('README.md', `
## Documentation Produit & UX
Consultez la documentation détaillée de la V1 dans le dossier \`docs/product/\` :
- [Site Maps](docs/product/site-map-client.md)
- [Pages Clés](docs/product/client-pages-v1.md)
- [Règles de Layout](docs/product/layout-rules-v1.md)
- [Design System](docs/product/design-system-v1.md)
- [Composants V1](docs/product/component-catalog-v1.md)
- [Comportements](docs/flows/client-interactions-v1.md)
`);

appendToReadme('docs/product/README.md', `
## Documents Détaillés V1
- [Site Map Client](site-map-client.md)
- [Site Map Dépanneur (Store)](site-map-store.md)
- [Site Map Livreur (Driver)](site-map-driver.md)
- [Site Map Super Admin](site-map-super-admin.md)
- [Pages Clés Client](client-pages-v1.md)
- [Règles de Layout (Responsive)](layout-rules-v1.md)
- [Design System Visuel](design-system-v1.md)
- [Catalogue de Composants](component-catalog-v1.md)
`);

appendToReadme('docs/flows/README.md', `
## Interactions Détaillées
- [Comportements Clés Client V1](client-interactions-v1.md)
`);

appendToReadme('docs/architecture/README.md', `
## Définitions UX/UI
L'architecture frontend est guidée par les spécifications définies dans :
- \`docs/product/layout-rules-v1.md\`
- \`docs/product/design-system-v1.md\`
`);
