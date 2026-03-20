import React from 'react';
import { colors, spacing, radii } from '../design-tokens';
import { ButtonSecondary } from './ButtonSecondary';

export function LastOrderCard({ order, onReorder }: any) {
  if (!order) return null;
  return (
    <div
      style={{
        backgroundColor: colors.background,
        padding: spacing.md,
        borderRadius: radii.md,
        border: '1px solid #e5e7eb',
        marginBottom: spacing.lg,
      }}
    >
      <h3 style={{ margin: `0 0 ${spacing.sm} 0` }}>Votre dernière commande</h3>
      <p style={{ margin: `0 0 ${spacing.md} 0`, fontSize: '14px', color: colors.secondary }}>
        {order.items.length} articles • {order.total.toFixed(2)} $
      </p>
      <ButtonSecondary onClick={() => onReorder(order)}>Recommander</ButtonSecondary>
    </div>
  );
}
