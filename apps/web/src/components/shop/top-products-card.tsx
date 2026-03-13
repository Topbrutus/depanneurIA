/**
 * TopProductsCard component
 * Basé sur DEP-0352
 */

import React from 'react';
import { ProductCard } from './product-card';
import type { Product } from '@depaneuria/types';

interface TopProductsCardProps {
  products: Product[];
}

export function TopProductsCard({ products }: TopProductsCardProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="shop-section">
      <div className="shop-section-header">
        <h2 className="shop-section-title">Les plus commandés</h2>
      </div>

      <div className="shop-carousel">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
