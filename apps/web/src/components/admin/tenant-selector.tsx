import { useTenant } from '../../lib/use-tenant';

export function TenantSelector() {
  const { tenants, currentTenantId, setCurrentTenantId, loading } = useTenant();

  if (loading || tenants.length <= 1) return null;

  return (
    <div className="tenant-selector">
      <label htmlFor="tenant-select">Dépanneur :</label>
      <select
        id="tenant-select"
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
