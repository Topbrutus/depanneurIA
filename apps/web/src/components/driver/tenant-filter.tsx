import { useTenant } from '../../lib/use-tenant';
import { useI18n } from '../../lib/i18n-context';

export function TenantFilter() {
  const { tenants, currentTenantId, setCurrentTenantId, loading } = useTenant();
  const { t } = useI18n();

  if (loading || tenants.length <= 1) return null;

  return (
    <div className="tenant-filter">
      <label htmlFor="tenant-filter-driver">{t('tenant.label')}</label>
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
