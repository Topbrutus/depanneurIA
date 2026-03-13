import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Tenant } from '@depaneuria/types';
import { DEFAULT_TENANT_ID } from '@depaneuria/types';
import { fetchTenants } from './tenant-api';
import { TenantContext } from './use-tenant';

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenantId, setCurrentTenantId] = useState<string>(DEFAULT_TENANT_ID);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants()
      .then((data) => {
        setTenants(data);
        if (data.length > 0 && !data.find((t) => t.id === DEFAULT_TENANT_ID)) {
          setCurrentTenantId(data[0].id);
        }
      })
      .catch(() => {
        /* tenant list unavailable — keep default */
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <TenantContext.Provider value={{ tenants, currentTenantId, setCurrentTenantId, loading }}>
      {children}
    </TenantContext.Provider>
  );
}
