import type { Product, RoleConfig } from './types'

// Pour ajouter vos photos : mettez le chemin dans image: '/images/produit.jpg'
// Placez vos photos dans : apps/web-store/public/images/
export const PRODUCTS: Product[] = [
  { id: 1,  name: "Lay's Ketchup",          category: 'Chips',      price: 2.29, emoji: '🥔', stock: 24, image: '' },
  { id: 2,  name: "Lay's Nature",           category: 'Chips',      price: 2.29, emoji: '🥔', stock: 18, image: '' },
  { id: 3,  name: "Lay's BBQ",              category: 'Chips',      price: 2.29, emoji: '🥔', stock: 15, image: '' },
  { id: 4,  name: 'Ruffles Sel & Vinaigre', category: 'Chips',      price: 2.49, emoji: '🥔', stock: 12, image: '' },
  { id: 5,  name: 'Yum Yum Ketchup',        category: 'Chips',      price: 2.29, emoji: '🥔', stock: 20, image: '' },
  { id: 6,  name: 'Doritos Nacho',          category: 'Chips',      price: 2.49, emoji: '🌽', stock: 16, image: '' },
  { id: 7,  name: 'Cheetos Croqué',         category: 'Chips',      price: 2.49, emoji: '🧡', stock: 14, image: '' },
  { id: 8,  name: 'Pringles Original',      category: 'Chips',      price: 3.49, emoji: '🥔', stock: 10, image: '' },
  { id: 9,  name: 'Pepsi 355ml',            category: 'Boissons',   price: 1.49, emoji: '🥤', stock: 48, image: '' },
  { id: 10, name: 'Coca-Cola 355ml',        category: 'Boissons',   price: 1.49, emoji: '🥤', stock: 42, image: '' },
  { id: 11, name: '7UP 355ml',              category: 'Boissons',   price: 1.49, emoji: '🥤', stock: 30, image: '' },
  { id: 12, name: "Jus d'orange Oasis",     category: 'Boissons',   price: 2.49, emoji: '🍊', stock: 20, image: '' },
  { id: 13, name: 'Red Bull 250ml',         category: 'Boissons',   price: 3.49, emoji: '🔴', stock: 18, image: '' },
  { id: 14, name: 'Eau Naya 500ml',         category: 'Boissons',   price: 1.99, emoji: '💧', stock: 60, image: '' },
  { id: 15, name: 'Kit Kat',                category: 'Chocolat',   price: 1.99, emoji: '🍫', stock: 22, image: '' },
  { id: 16, name: 'Oh Henry!',              category: 'Chocolat',   price: 1.99, emoji: '🍫', stock: 18, image: '' },
  { id: 17, name: 'Coffee Crisp',           category: 'Chocolat',   price: 1.99, emoji: '🍫', stock: 15, image: '' },
  { id: 18, name: 'Aero',                   category: 'Chocolat',   price: 2.29, emoji: '🍫', stock: 20, image: '' },
  { id: 19, name: 'Caramilk',               category: 'Chocolat',   price: 2.29, emoji: '🍫', stock: 16, image: '' },
  { id: 20, name: 'Lait 2% Natrel 1L',      category: 'Populaires', price: 3.99, emoji: '🥛', stock: 12, image: '' },
  { id: 21, name: 'Pain Bon Matin',         category: 'Populaires', price: 3.49, emoji: '🍞', stock: 8,  image: '' },
  { id: 22, name: 'Arachides grillées',     category: 'Populaires', price: 1.59, emoji: '🥜', stock: 25, image: '' },
  { id: 23, name: 'Crème glacée Häagen',    category: 'Populaires', price: 6.99, emoji: '🍦', stock: 10, image: '' },
]

export const CATEGORIES = ['Produits', 'Populaires', 'Chips', 'Boissons', 'Chocolat']

export const ROLES: RoleConfig[] = [
  { id: 'client',   label: 'Client',   icon: '🛍️', color: '#2d7a3a', description: 'Faites vos courses',     actionLabel: 'Commander'  },
  { id: 'cashier',  label: 'Caissier', icon: '🏪', color: '#1565c0', description: 'Préparez les commandes',  actionLabel: 'Encaisser'  },
  { id: 'delivery', label: 'Livreur',  icon: '🚲', color: '#e65100', description: 'Gérez les livraisons',    actionLabel: 'Préparer'   },
  { id: 'admin',    label: 'Admin',    icon: '⚙️', color: '#6a1b9a', description: 'Administration complète', actionLabel: 'Traiter'    },
]

export const AI_SUGGESTIONS = [
  'Je veux des chips au ketchup',
  'Suggère une boisson',
  'Quoi pour ce soir ?',
  'Articles populaires',
]
