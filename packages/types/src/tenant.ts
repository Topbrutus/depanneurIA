/** Types multi-tenant — DEP-0681 */

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Identifiant du tenant par défaut pour compatibilité rétro */
export const DEFAULT_TENANT_ID = 'default';
