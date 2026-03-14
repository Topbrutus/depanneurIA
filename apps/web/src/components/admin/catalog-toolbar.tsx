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
  const { t } = useI18n();
  return (
    <div className="catalog-toolbar">
      <input
        type="search"
        placeholder={t('admin.search.placeholder')}
        value={search}
        onChange={(e) => onChange({ search: e.target.value })}
      />

      <select
        value={availability}
        onChange={(e) =>
          onChange({ availability: e.target.value as ProductAvailability | 'all' })
        }
      >
        <option value="all">{t('admin.filter.availability.all')}</option>
        <option value="en_stock">{t('product.availability.en_stock')}</option>
        <option value="sur_commande">{t('product.availability.sur_commande')}</option>
        <option value="rupture">{t('product.availability.rupture')}</option>
      </select>

      <select
        value={status}
        onChange={(e) => onChange({ status: e.target.value as ProductStatus | 'all' })}
      >
        <option value="all">{t('admin.filter.status.all')}</option>
        <option value="active">{t('product.status.active')}</option>
        <option value="draft">{t('product.status.draft')}</option>
      </select>

      <div className="toolbar-actions">
        <label className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={popularOnly}
            onChange={(e) => onChange({ popularOnly: e.target.checked })}
          />
          {t('admin.filter.popular')}
        </label>

        <button className="admin-btn secondary" type="button" onClick={onRefresh}>
          {t('common.refresh')}
        </button>
      </div>
    </div>
  );
}
