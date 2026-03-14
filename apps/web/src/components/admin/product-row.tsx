import type { Product, ProductAvailability } from '@depaneuria/types';
import { StockBadge } from './stock-badge';
import { useI18n } from '../../lib/i18n-context';

interface ProductRowProps {
  product: Product;
  categoryLabel?: string;
  onEdit: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
  onAvailabilityChange: (product: Product, availability: ProductAvailability) => void;
  onTogglePopular: (product: Product) => void;
  onPriceChange: (product: Product) => void;
  onStockChange: (product: Product) => void;
}

export function ProductRow({
  product,
  categoryLabel,
  onEdit,
  onToggleStatus,
  onAvailabilityChange,
  onTogglePopular,
  onPriceChange,
  onStockChange,
}: ProductRowProps) {
  const { t } = useI18n();
  const nextAvailability =
    product.availability === 'rupture' ? 'en_stock' : 'rupture';

  return (
    <tr>
      <td>
        <div className="product-meta">
          <strong>{product.name}</strong>
          <span className="muted">
            {categoryLabel ? `${categoryLabel} • ` : ''}
            {product.unit}
          </span>
          <span className="muted">{product.slug}</span>
        </div>
      </td>
      <td>{product.price.toFixed(2)} $</td>
      <td>
        <div className="product-actions-inline">
          <span className={`status-pill ${product.status === 'active' ? 'active' : 'draft'}`}>
            {product.status === 'active' ? t('product.status.active') : t('product.status.draft')}
          </span>
          {product.popular && <span className="badge muted">{t('product.popular')}</span>}
        </div>
      </td>
      <td>
        <StockBadge
          availability={product.availability}
          stock={product.stock}
          minStock={product.minStock}
        />
      </td>
      <td>
        <div className="product-row-actions">
          <button className="admin-btn ghost" onClick={() => onToggleStatus(product)}>
            {product.status === 'active' ? t('admin.action.deactivate') : t('admin.action.activate')}
          </button>
          <button
            className="admin-btn ghost"
            onClick={() => onAvailabilityChange(product, nextAvailability)}
          >
            {product.availability === 'rupture' ? t('admin.action.restock') : t('admin.action.markOut')}
          </button>
          <button className="admin-btn ghost" onClick={() => onTogglePopular(product)}>
            {product.popular ? t('admin.action.removeTop') : t('admin.action.markTop')}
          </button>
          <button className="admin-btn ghost" onClick={() => onPriceChange(product)}>
            {t('admin.action.editPrice')}
          </button>
          <button className="admin-btn ghost" onClick={() => onStockChange(product)}>
            {t('admin.action.editStock')}
          </button>
          <button className="admin-btn secondary" onClick={() => onEdit(product)}>
            {t('admin.action.edit')}
          </button>
        </div>
      </td>
    </tr>
  );
}
