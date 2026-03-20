import React from 'react';
import { colors, spacing, radii } from '../design-tokens';
import { ButtonPrimary } from './ButtonPrimary';

export function ProductCard({ product, onAdd }: any) {
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div
        style={{
          height: '150px',
          backgroundColor: '#eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '40px',
        }}
      >
        {product.emoji || '📦'}
      </div>
      <div style={{ padding: spacing.md, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{ margin: `0 0 ${spacing.xs} 0`, fontSize: '16px' }}>{product.name}</h3>
        <p style={{ margin: `0 0 ${spacing.md} 0`, fontWeight: 'bold', color: colors.primary }}>
          {product.price.toFixed(2)} $
        </p>
        <div style={{ marginTop: 'auto' }}>
          <ButtonPrimary onClick={() => onAdd(product)} style={{ width: '100%' }}>
            Ajouter
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}
