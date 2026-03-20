import React from 'react';
import { colors, radii, spacing } from '../design-tokens';

export function OrderStatusBadge({ status }: any) {
  let bgColor = colors.info;
  let label = status;

  switch (status) {
    case 'confirmed':
      bgColor = colors.info;
      label = 'Confirmée';
      break;
    case 'preparing':
      bgColor = colors.warning;
      label = 'En préparation';
      break;
    case 'out_for_delivery':
      bgColor = colors.primary;
      label = 'En route';
      break;
    case 'delivered':
      bgColor = colors.success;
      label = 'Livrée';
      break;
    case 'cancelled':
      bgColor = colors.error;
      label = 'Annulée';
      break;
  }

  return (
    <span
      style={{
        backgroundColor: bgColor,
        color: '#fff',
        padding: `${spacing.xs} ${spacing.sm}`,
        borderRadius: radii.sm,
        fontSize: '12px',
        fontWeight: 'bold',
      }}
    >
      {label}
    </span>
  );
}
