import type { ProductAvailability } from '@depaneuria/types';
import { useI18n } from '../../lib/i18n-context';

interface StockBadgeProps {
  availability: ProductAvailability;
  stock: number;
  minStock: number;
}

export function StockBadge({ availability, stock, minStock }: StockBadgeProps) {
  const { translations: t } = useI18n();

  if (availability === 'rupture') {
    return <span className="badge danger">{t.admin.stockBadgeOutOfStock}</span>;
  }

  if (availability === 'sur_commande') {
    return <span className="badge warning">{t.admin.stockBadgeOnOrder}</span>;
  }

  if (stock <= minStock) {
    return <span className="badge warning">{t.admin.stockBadgeLow} ({stock})</span>;
  }

  return <span className="badge success">{t.admin.stockBadgeInStock} ({stock})</span>;
}
