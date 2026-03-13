import { useTenant } from '../../lib/use-tenant';

export function TenantFilter() {
  const { tenants, currentTenantId, setCurrentTenantId, loading } = useTenant();

  if (loading || tenants.length <= 1) return null;

  return (
    <div className="tenant-filter">
      <label htmlFor="tenant-filter-driver">Dépanneur :</label>
      <select
        id="tenant-filter-driver"
        value={currentTenantId}
        onChange={(e) => setCurrentTenantId(e.target.value)}
      >
        {tenants.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
