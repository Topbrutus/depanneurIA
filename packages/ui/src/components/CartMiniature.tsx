import React from 'react';
import { colors, spacing, radii } from '../design-tokens';

export function CartMiniature({ itemCount, total, onClick }: any) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.primary}`,
        padding: `${spacing.sm} ${spacing.md}`,
        borderRadius: radii.full,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <span>🛒</span>
      <span style={{ fontWeight: 'bold' }}>{itemCount}</span>
      <span style={{ color: colors.primary, fontWeight: 'bold' }}>{total.toFixed(2)} $</span>
    </div>
  );
}
