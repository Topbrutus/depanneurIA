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
];

const tenants = new Map<string, Tenant>(DEMO_TENANTS.map((t) => [t.id, t]));

export function listTenants(): Tenant[] {
  return [...tenants.values()].filter((t) => t.active);
}

export function getTenant(tenantId: string): Tenant | undefined {
  const t = tenants.get(tenantId);
  return t?.active ? t : undefined;
}
