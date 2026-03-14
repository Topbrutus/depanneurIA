import type { ProductAvailability } from '@depaneuria/types';
import { useI18n } from '../../lib/i18n-context';

interface StockBadgeProps {
  availability: ProductAvailability;
  stock: number;
  minStock: number;
}

export function StockBadge({ availability, stock, minStock }: StockBadgeProps) {
  const { t } = useI18n();
  if (availability === 'rupture') {
    return <span className="badge danger">{t('product.availability.rupture')}</span>;
  }

  if (availability === 'sur_commande') {
    return <span className="badge warning">{t('product.availability.sur_commande')}</span>;
  }

  if (stock <= minStock) {
    return <span className="badge warning">{t('admin.stock.low', { count: stock })}</span>;
  }

  return <span className="badge success">{t('admin.stock.in', { count: stock })}</span>;
}
