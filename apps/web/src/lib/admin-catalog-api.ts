import type {
  Category,
  CreateProductPayload,
  Product,
  ProductFilters,
  UpdateProductPayload,
} from '@depaneuria/types';

const ADMIN_BASE = '/admin/catalog';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

function buildQuery(filters: ProductFilters = {}) {
  const params = new URLSearchParams();
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.availability) params.set('availability', filters.availability);
  if (filters.status) params.set('status', filters.status);
  if (typeof filters.popular === 'boolean') params.set('popular', String(filters.popular));
  if (filters.search) params.set('search', filters.search);
  const query = params.toString();
  return query ? `?${query}` : '';
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const message = res.statusText || 'Requête échouée';
    throw new Error(message);
  }
  const json = (await res.json()) as ApiResponse<T>;
  return json.data;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${ADMIN_BASE}/categories`);
  return handleResponse<Category[]>(res);
}

export async function fetchProducts(filters?: ProductFilters): Promise<Product[]> {
  const res = await fetch(`${ADMIN_BASE}/products${buildQuery(filters)}`);
  return handleResponse<Product[]>(res);
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const res = await fetch(`${ADMIN_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Product>(res);
}

export async function updateProduct(
  productId: string,
  payload: UpdateProductPayload
): Promise<Product> {
  const res = await fetch(`${ADMIN_BASE}/products/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Product>(res);
}

export async function updateProductAvailability(
  productId: string,
  availability: Product['availability']
): Promise<Product> {
  const res = await fetch(`${ADMIN_BASE}/products/${productId}/availability`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ availability }),
  });
  return handleResponse<Product>(res);
}

export async function updateProductStock(
  productId: string,
  stock: number,
  minStock?: number
): Promise<Product> {
  const res = await fetch(`${ADMIN_BASE}/products/${productId}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock, minStock }),
  });
  return handleResponse<Product>(res);
}

export async function updateProductPopularity(
  productId: string,
  popular: boolean
): Promise<Product> {
  const res = await fetch(`${ADMIN_BASE}/products/${productId}/popularity`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ popular }),
  });
  return handleResponse<Product>(res);
}
