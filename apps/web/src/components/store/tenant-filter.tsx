import { useTenant } from '../../lib/use-tenant';
import { useI18n } from '../../lib/i18n-context';

export function TenantFilter() {
  const { translations: t } = useI18n();
  const { tenants, currentTenantId, setCurrentTenantId, loading } = useTenant();

  if (loading || tenants.length <= 1) return null;

  return (
    <div className="tenant-filter">
      <label htmlFor="tenant-filter-store">{t.store.tenantLabel}</label>
      <select
        id="tenant-filter-store"
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
