import type { Product, ProductAvailability } from '@depaneuria/types';
import { ProductRow } from './product-row';

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
  if (products.length === 0) {
    return <p className="muted">Aucun produit ne correspond aux filtres.</p>;
  }

  return (
    <table className="product-table">
      <thead>
        <tr>
          <th>Produit</th>
          <th>Prix</th>
          <th>Statut</th>
          <th>Stock</th>
          <th>Actions</th>
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
