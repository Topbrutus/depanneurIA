import type { Tenant } from '@depaneuria/types';
import { DEFAULT_TENANT_ID } from '@depaneuria/types';

/** Tenants de démonstration — stockage mémoire */
const DEMO_TENANTS: Tenant[] = [
  {
    id: DEFAULT_TENANT_ID,
    name: 'Dépanneur Central',
    slug: 'depanneur-central',
    description: 'Le dépanneur par défaut (rétro-compatible)',
    active: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'tenant-nord',
    name: 'Dépanneur du Nord',
    slug: 'depanneur-nord',
    description: 'Succursale nord de la chaîne',
    active: true,
    createdAt: '2025-06-01T00:00:00.000Z',
    updatedAt: '2025-06-01T00:00:00.000Z',
  },
  {
    id: 'tenant-sud',
    name: 'Dépanneur du Sud',
    slug: 'depanneur-sud',
    description: 'Succursale sud pour la démonstration multi-tenant',
    active: true,
    createdAt: '2025-07-01T00:00:00.000Z',
    updatedAt: '2025-07-01T00:00:00.000Z',
  },
];

const PRODUCT_ASSIGNMENTS: Record<string, string[]> = {
  'tenant-nord': [
    'coca-cola-355ml',
    'chips-lays-nature-235g',
    'eau-naya-1l',
    'barre-oh-henry',
    'arachides-salees-350g',
  ],
  'tenant-sud': [
    'pain-blanc-tranche',
    'lait-2-pourcent-2l',
    'oeufs-gros-x12',
    'beurre-sale-454g',
    'savon-mains-500ml',
    'papier-hygienique-12-rouleaux',
  ],
};

const tenants = new Map<string, Tenant>(DEMO_TENANTS.map((t) => [t.id, t]));
const productTenants = new Map<string, string>();
const orderTenants = new Map<string, string>();

Object.entries(PRODUCT_ASSIGNMENTS).forEach(([tenantId, slugs]) => {
  slugs.forEach((slug) => productTenants.set(slug, tenantId));
});

export function listTenants(): Tenant[] {
  return [...tenants.values()].filter((t) => t.active);
}

export function getTenant(tenantId: string): Tenant | undefined {
  const t = tenants.get(tenantId);
  return t?.active ? t : undefined;
}

export function productTenant(slug: string): string {
  return productTenants.get(slug) ?? DEFAULT_TENANT_ID;
}

export function assignProductToTenant(slug: string, tenantId: string) {
  productTenants.set(slug, tenantId);
}

export function moveProductToTenant(slug: string, nextSlug: string, tenantId: string) {
  if (productTenants.get(slug) && productTenants.get(slug) !== tenantId) {
    return;
  }
  productTenants.delete(slug);
  productTenants.set(nextSlug, tenantId);
}

export function isProductForTenant(slug: string, tenantId: string): boolean {
  return productTenant(slug) === tenantId;
}

export function setOrderTenant(orderId: string, tenantId: string) {
  orderTenants.set(orderId, tenantId);
}

export function orderTenant(orderId: string): string {
  return orderTenants.get(orderId) ?? DEFAULT_TENANT_ID;
}

export function isOrderForTenant(orderId: string, tenantId: string): boolean {
  return orderTenant(orderId) === tenantId;
}
