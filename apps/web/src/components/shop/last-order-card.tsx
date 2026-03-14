/**
 * LastOrderCard component
 * Basé sur DEP-0351
 */

import React from 'react';
import { ProductCard } from './product-card';
import type { Product } from '@depaneuria/types';
import { useCartStore } from '@/lib/cart-store';
import { useI18n } from '@/lib/i18n-context';

interface LastOrderCardProps {
  products: Product[];
}

export function LastOrderCard({ products }: LastOrderCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { t } = useI18n();

  if (products.length === 0) {
    return null;
  }

  const handleReorderAll = () => {
    products.forEach((product) => {
      const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0];
      const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];

      if (defaultVariant.availability !== 'rupture') {
        addItem({
          productId: product.id,
          variantId: defaultVariant.id,
          productLabel: product.label,
          variantLabel: defaultVariant.label,
          quantity: 1,
          unitPrice: defaultVariant.price,
          currency: defaultVariant.currency,
          imageUrl: primaryImage?.url,
        });
      }
    });
  };

  return (
    <div className="shop-section last-order">
      <div className="shop-section-header">
        <h2 className="shop-section-title">{t('shop.section.lastOrder')}</h2>
        <button
          className="shop-section-action"
          onClick={handleReorderAll}
          aria-label={t('shop.section.reorderAll')}
        >
          {t('shop.section.reorderAll')}
        </button>
      </div>

      <div className="shop-carousel">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
