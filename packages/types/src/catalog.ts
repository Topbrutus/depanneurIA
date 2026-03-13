/** Statut produit — DEP-0260 */
export type ProductStatus = 'draft' | 'active';
export type ProductAvailability = 'en_stock' | 'rupture' | 'sur_commande';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  unit: string;
  imageUrl: string | null;
  status: ProductStatus;
  availability: ProductAvailability;
  stock: number;
  minStock: number;
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

export interface ProductFilters {
  categoryId?: string;
  availability?: ProductAvailability;
  status?: ProductStatus;
  popular?: boolean;
  search?: string;
}

export interface CreateProductPayload {
  name: string;
  slug?: string;
  description?: string | null;
  price: number;
  unit: string;
  imageUrl?: string | null;
  categoryId: string;
  displayOrder?: number;
  status?: ProductStatus;
  availability?: ProductAvailability;
  popular?: boolean;
  stock?: number;
  minStock?: number;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;
