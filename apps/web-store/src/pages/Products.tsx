import React from 'react';
import { spacing, radii, colors } from '@depaneuria/ui';
import { useStoreContext } from '../lib/StoreContext';

export function Products() {
  const { products, updateProductStock } = useStoreContext();

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Gestion des Produits</h1>
      <p style={{ color: colors.secondary }}>Ajustez le stock de vos produits (mock local).</p>

      <div
        style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, marginTop: spacing.lg }}
      >
        {products.map((p: any) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#fff',
              padding: spacing.md,
              borderRadius: radii.md,
              border: '1px solid #eee',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
              <span style={{ fontSize: '24px' }}>{p.emoji}</span>
              <div>
                <strong style={{ display: 'block' }}>{p.name}</strong>
                <span style={{ color: colors.secondary, fontSize: '14px' }}>
                  {p.price.toFixed(2)} $
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <span>Stock:</span>
              <input
                type="number"
                value={p.stock}
                onChange={(e) => updateProductStock(p.id, parseInt(e.target.value, 10) || 0)}
                style={{
                  width: '60px',
                  padding: spacing.xs,
                  borderRadius: radii.sm,
                  border: '1px solid #ccc',
                }}
              />
              {p.stock === 0 && (
                <span style={{ color: colors.error, fontSize: '12px', fontWeight: 'bold' }}>
                  Rupture
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
