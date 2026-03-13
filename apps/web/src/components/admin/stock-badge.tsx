import type { ProductAvailability } from '@depaneuria/types';

interface StockBadgeProps {
  availability: ProductAvailability;
  stock: number;
  minStock: number;
}

export function StockBadge({ availability, stock, minStock }: StockBadgeProps) {
  if (availability === 'rupture') {
    return <span className="badge danger">Rupture</span>;
  }

  if (availability === 'sur_commande') {
    return <span className="badge warning">Sur commande</span>;
  }

  if (stock <= minStock) {
    return <span className="badge warning">Stock bas ({stock})</span>;
  }

  return <span className="badge success">En stock ({stock})</span>;
}
