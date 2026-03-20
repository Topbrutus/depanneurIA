import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, radii, spacing, ButtonPrimary } from '@depaneuria/ui';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';

export function DeliveryCard({ delivery, showAccept = false, onAccept }: any) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: radii.md,
        border: '1px solid #e5e7eb',
        marginBottom: spacing.md,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.sm }}>
        <strong style={{ fontSize: '16px' }}>{delivery.id}</strong>
        <DeliveryStatusBadge status={delivery.status} />
      </div>

      <div style={{ marginBottom: spacing.sm, fontSize: '14px' }}>
        <p style={{ margin: `0 0 ${spacing.xs} 0` }}>
          📍 {delivery.distance} • {delivery.estimatedTime}
        </p>
        <p style={{ margin: 0, fontWeight: 'bold' }}>
          💵 {delivery.totalAmount.toFixed(2)} ${' '}
          {delivery.status !== 'delivered' && '(À encaisser)'}
        </p>
      </div>

      <div style={{ color: colors.secondary, fontSize: '14px', marginBottom: spacing.md }}>
        {delivery.address}
      </div>

      {showAccept ? (
        <ButtonPrimary onClick={() => onAccept(delivery.id)} style={{ width: '100%' }}>
          Accepter la course
        </ButtonPrimary>
      ) : (
        <ButtonPrimary
          onClick={() => navigate(`/delivery/${delivery.id}`)}
          style={{ width: '100%', backgroundColor: colors.info }}
        >
          Gérer la livraison
        </ButtonPrimary>
      )}
    </div>
  );
}
