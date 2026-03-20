import React from 'react';
import { spacing } from '../design-tokens';
import { ProductCard } from './ProductCard';

export function Top10Card({ products, onAdd }: any) {
  return (
    <div style={{ marginBottom: spacing.lg }}>
      <h3 style={{ margin: `0 0 ${spacing.md} 0` }}>Top 10 des ventes 🔥</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: spacing.md,
        }}
      >
        {products.slice(0, 10).map((p: any) => (
          <ProductCard key={p.id} product={p} onAdd={onAdd} />
        ))}
      </div>
    </div>
  );
}
