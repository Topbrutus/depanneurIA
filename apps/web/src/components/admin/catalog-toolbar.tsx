import type { ProductAvailability, ProductStatus } from '@depaneuria/types';
import { useI18n } from '../../lib/i18n-context';

interface CatalogToolbarProps {
  search: string;
  availability: ProductAvailability | 'all';
  status: ProductStatus | 'all';
  popularOnly: boolean;
  onChange: (next: {
    search?: string;
    availability?: ProductAvailability | 'all';
    status?: ProductStatus | 'all';
    popularOnly?: boolean;
  }) => void;
  onRefresh: () => void;
}

export function CatalogToolbar({
  search,
  availability,
  status,
  popularOnly,
  onChange,
  onRefresh,
}: CatalogToolbarProps) {
  const { translations: t } = useI18n();

  return (
    <div className="catalog-toolbar">
      <input
        type="search"
        placeholder={t.admin.searchPlaceholder}
        value={search}
        onChange={(e) => onChange({ search: e.target.value })}
      />

      <select
        value={availability}
        onChange={(e) =>
          onChange({ availability: e.target.value as ProductAvailability | 'all' })
        }
      >
        <option value="all">{t.admin.allAvailability}</option>
        <option value="en_stock">{t.admin.inStock}</option>
        <option value="sur_commande">{t.admin.onOrder}</option>
        <option value="rupture">{t.admin.outOfStock}</option>
      </select>

      <select
        value={status}
        onChange={(e) => onChange({ status: e.target.value as ProductStatus | 'all' })}
      >
        <option value="all">{t.admin.allStatus}</option>
        <option value="active">{t.admin.statusActive}</option>
        <option value="draft">{t.admin.statusDraft}</option>
      </select>

      <div className="toolbar-actions">
        <label className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={popularOnly}
            onChange={(e) => onChange({ popularOnly: e.target.checked })}
          />
          {t.admin.popular}
        </label>

        <button className="admin-btn secondary" type="button" onClick={onRefresh}>
          {t.admin.refresh}
        </button>
      </div>
    </div>
  );
}
