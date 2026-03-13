import { useContext } from 'react';
import type { Tenant } from '@depaneuria/types';
import { DEFAULT_TENANT_ID } from '@depaneuria/types';
import { createContext } from 'react';

interface TenantContextValue {
  tenants: Tenant[];
  currentTenantId: string;
  setCurrentTenantId: (id: string) => void;
  loading: boolean;
}

export const TenantContext = createContext<TenantContextValue>({
  tenants: [],
  currentTenantId: DEFAULT_TENANT_ID,
  setCurrentTenantId: () => undefined,
  loading: true,
});

export function useTenant() {
  return useContext(TenantContext);
}
