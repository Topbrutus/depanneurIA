/**
 * TopProductsCard component
 * Basé sur DEP-0352
 */

import React from 'react';
import { ProductCard } from './product-card';
import type { Product } from '@depaneuria/types';
import { useI18n } from '@/lib/i18n-context';

interface TopProductsCardProps {
  products: Product[];
}

export function TopProductsCard({ products }: TopProductsCardProps) {
  const { t } = useI18n();
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="shop-section">
      <div className="shop-section-header">
        <h2 className="shop-section-title">{t('shop.section.topProducts')}</h2>
      </div>

      <div className="shop-carousel">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
