/** Statut produit — DEP-0260 */
export type ProductStatus = 'draft' | 'active';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  unit: string;
  imageUrl: string | null;
  status: ProductStatus;
  categoryId: string;
  displayOrder: number;
  popular: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithProducts extends Category {
  products: Product[];
}
