import type { Product, RoleConfig } from './types'

export const PRODUCTS: Product[] = [
  { id: 1,  name: 'Lait 2%',         category: 'Laitier',     price: 4.99, emoji: '🥛', stock: 12 },
  { id: 2,  name: 'Pain blanc',       category: 'Boulangerie', price: 3.49, emoji: '🍞', stock: 8  },
  { id: 3,  name: 'Œufs (12)',        category: 'Laitier',     price: 5.49, emoji: '🥚', stock: 15 },
  { id: 4,  name: 'Beurre',           category: 'Laitier',     price: 6.99, emoji: '🧈', stock: 10 },
  { id: 5,  name: "Jus d'orange",     category: 'Boissons',    price: 3.99, emoji: '🍊', stock: 20 },
  { id: 6,  name: 'Coca-Cola 2L',     category: 'Boissons',    price: 3.29, emoji: '🥤', stock: 25 },
  { id: 7,  name: 'Eau Évian',        category: 'Boissons',    price: 1.99, emoji: '💧', stock: 30 },
  { id: 8,  name: 'Chips BBQ',        category: 'Collations',  price: 3.79, emoji: '🍟', stock: 18 },
  { id: 9,  name: 'Chocolat noir',    category: 'Confiseries', price: 2.99, emoji: '🍫', stock: 14 },
  { id: 10, name: 'Bonbons gummies',  category: 'Confiseries', price: 1.99, emoji: '🍬', stock: 22 },
  { id: 11, name: 'Aspirine',         category: 'Pharmacie',   price: 7.49, emoji: '💊', stock: 6  },
  { id: 12, name: 'Café moulu',       category: 'Épicerie',    price: 8.99, emoji: '☕', stock: 9  },
  { id: 13, name: 'Yaourt fraise',    category: 'Laitier',     price: 2.49, emoji: '🍓', stock: 11 },
  { id: 14, name: 'Miel pur',         category: 'Épicerie',    price: 5.99, emoji: '🍯', stock: 7  },
  { id: 15, name: 'Savon liquide',    category: 'Hygiène',     price: 3.49, emoji: '🧴', stock: 16 },
  { id: 16, name: 'Piles AA (4)',     category: 'Divers',      price: 6.99, emoji: '🔋', stock: 20 },
  { id: 17, name: 'Fromage cheddar',  category: 'Laitier',     price: 7.29, emoji: '🧀', stock: 13 },
  { id: 18, name: 'Crackers',         category: 'Collations',  price: 2.79, emoji: '🫙', stock: 19 },
]

export const CATEGORIES = [
  'Tous', 'Laitier', 'Boulangerie', 'Boissons',
  'Collations', 'Confiseries', 'Épicerie', 'Pharmacie', 'Hygiène', 'Divers',
]

export const ROLES: RoleConfig[] = [
  {
    id: 'client',
    label: 'Client',
    icon: '🛍️',
    color: '#4ade80',
    description: 'Faites vos courses',
    actionLabel: '✓ Commander',
  },
  {
    id: 'cashier',
    label: 'Caissier',
    icon: '🏪',
    color: '#60a5fa',
    description: 'Préparez les commandes',
    actionLabel: '💰 Encaisser',
  },
  {
    id: 'delivery',
    label: 'Livreur',
    icon: '🚚',
    color: '#fb923c',
    description: 'Gérez les livraisons',
    actionLabel: '📦 Préparer',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: '⚙️',
    color: '#c084fc',
    description: 'Administration complète',
    actionLabel: '⚙️ Traiter',
  },
]

export const AI_SUGGESTIONS = [
  'Ajoute du lait au panier',
  'Suggère une collation',
  'Quoi pour le déjeuner ?',
  'Articles en pharmacie',
  'Vide le panier',
]
