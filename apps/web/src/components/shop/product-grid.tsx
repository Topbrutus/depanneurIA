/**
 * ProductGrid component
 * Basé sur DEP-0321
 */

import React from 'react';
import type { Product } from '@depaneuria/types';
import { ProductCard } from './product-card';

interface ProductGridProps {
  products: Product[];
  onProductClick?: (product: Product) => void;
}

export function ProductGrid({ products, onProductClick }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="cart-empty">
        <p>Aucun produit disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductClick?.(product)}
        />
      ))}
    </div>
  );
}
