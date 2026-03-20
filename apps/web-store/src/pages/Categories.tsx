import React from 'react';
import { spacing, radii, colors, ButtonSecondary } from '@depaneuria/ui';
import { useStoreContext } from '../lib/StoreContext';

export function Categories() {
  const { categories, toggleCategory } = useStoreContext();

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Gestion des Catégories</h1>
      <p style={{ color: colors.secondary }}>Activez ou désactivez les rayons de votre boutique.</p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.sm,
          marginTop: spacing.lg,
          maxWidth: '600px',
        }}
      >
        {categories.map((c: any) => (
          <div
            key={c.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#fff',
              padding: spacing.md,
              borderRadius: radii.md,
              border: '1px solid #eee',
              opacity: c.active ? 1 : 0.6,
            }}
          >
            <strong style={{ fontSize: '18px' }}>{c.name}</strong>
            <ButtonSecondary
              onClick={() => toggleCategory(c.id)}
              style={{
                borderColor: c.active ? colors.error : colors.success,
                color: c.active ? colors.error : colors.success,
              }}
            >
              {c.active ? 'Désactiver' : 'Activer'}
            </ButtonSecondary>
          </div>
        ))}
      </div>
    </div>
  );
}
