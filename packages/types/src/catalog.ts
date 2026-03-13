/**
 * Types pour le catalogue de produits
 * Basé sur DEP-0241 à DEP-0280
 */

export type AvailabilityStatus = 'en_stock' | 'faible_stock' | 'rupture' | 'sur_commande';
export type ProductStatus = 'draft' | 'active' | 'archived';

export interface Category {
  id: string;
  slug: string;
  label: string;
  parentId: string | null;
  depth: number;
  displayOrder: number;
  isVisible: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  label: string;
  unit: string;
  quantity: number;
  volume?: string;
  shelfLife?: string;
  price: number;
  currency: string;
  availability: AvailabilityStatus;
  isDefault: boolean;
  sku?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string;
  size: 'thumb' | 'medium' | 'full' | 'hero';
  isPrimary: boolean;
  displayOrder: number;
}

export interface Product {
  id: string;
  categoryId: string;
  sku: string;
  slug: string;
  label: string;
  brand?: string;
  description?: string;
  status: ProductStatus;
  variants: ProductVariant[];
  images: ProductImage[];
  tags?: string[];
  synonyms?: string[];
  isPopular?: boolean;
  popularRank?: number;
  isFeatured?: boolean;
  displayOrder: number;
}

export interface PopularProduct {
  productId: string;
  rank: number;
  period: '7j' | '30j' | '90j';
  orderCount: number;
}

export interface Catalog {
  categories: Category[];
  products: Product[];
  popularProducts: PopularProduct[];
}
