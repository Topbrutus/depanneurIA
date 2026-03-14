import type { Product, ProductAvailability } from '@depaneuria/types';
import { ProductRow } from './product-row';
import { useI18n } from '../../lib/i18n-context';

interface ProductListProps {
  products: Product[];
  categoryLabels: Record<string, string>;
  onEdit: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
  onAvailabilityChange: (product: Product, availability: ProductAvailability) => void;
  onTogglePopular: (product: Product) => void;
  onPriceChange: (product: Product) => void;
  onStockChange: (product: Product) => void;
}

export function ProductList({
  products,
  categoryLabels,
  onEdit,
  onToggleStatus,
  onAvailabilityChange,
  onTogglePopular,
  onPriceChange,
  onStockChange,
}: ProductListProps) {
  const { translations: t } = useI18n();

  if (products.length === 0) {
    return <p className="muted">{t.admin.noProductsMatch}</p>;
  }

  return (
    <table className="product-table">
      <thead>
        <tr>
          <th>{t.admin.productTable}</th>
          <th>{t.admin.priceTable}</th>
          <th>{t.admin.statusTable}</th>
          <th>{t.admin.stockTable}</th>
          <th>{t.admin.actionsTable}</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <ProductRow
            key={product.id}
            product={product}
            categoryLabel={categoryLabels[product.categoryId]}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onAvailabilityChange={onAvailabilityChange}
            onTogglePopular={onTogglePopular}
            onPriceChange={onPriceChange}
            onStockChange={onStockChange}
          />
        ))}
      </tbody>
    </table>
  );
}
