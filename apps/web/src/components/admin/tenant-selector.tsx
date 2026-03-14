import { useTenant } from '../../lib/use-tenant';
import { useI18n } from '../../lib/i18n-context';

export function TenantSelector() {
  const { translations: t } = useI18n();
  const { tenants, currentTenantId, setCurrentTenantId, loading } = useTenant();

  if (loading || tenants.length <= 1) return null;

  return (
    <div className="tenant-selector">
      <label htmlFor="tenant-select">{t.admin.tenantLabel}</label>
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
