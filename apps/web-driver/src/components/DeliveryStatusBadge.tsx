import React from 'react';
import { colors, radii, spacing } from '@depaneuria/ui';

export function DeliveryStatusBadge({ status }: any) {
  let bgColor = colors.info;
  let label = status;

  switch (status) {
    case 'available':
      bgColor = colors.warning;
      label = 'Nouvelle / Dispo';
      break;
    case 'assigned':
      bgColor = colors.info;
      label = 'À ramasser';
      break;
    case 'picked_up':
      bgColor = colors.primary;
      label = 'Colis récupéré';
      break;
    case 'in_transit':
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
