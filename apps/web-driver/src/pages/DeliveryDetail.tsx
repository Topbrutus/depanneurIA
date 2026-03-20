import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ButtonPrimary, ButtonSecondary, spacing, radii, colors } from '@depaneuria/ui';
import { useDriverContext } from '../lib/DriverContext';
import { DeliveryStatusBadge } from '../components/DeliveryStatusBadge';

export function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deliveries, updateDeliveryStatus } = useDriverContext();
  const delivery = deliveries.find((d: any) => d.id === id);

  if (!delivery) return <p>Livraison introuvable.</p>;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.md,
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px' }}>Course {delivery.id}</h1>
        <DeliveryStatusBadge status={delivery.status} />
      </div>

      <div
        style={{
          backgroundColor: colors.surface,
          padding: spacing.md,
          borderRadius: radii.md,
          border: '1px solid #e5e7eb',
          marginBottom: spacing.md,
        }}
      >
        <h3 style={{ margin: `0 0 ${spacing.sm} 0` }}>Détails Client</h3>
        <p style={{ margin: `0 0 ${spacing.xs} 0` }}>
          <strong>Nom:</strong> {delivery.customerName}
        </p>
        <p style={{ margin: `0 0 ${spacing.xs} 0` }}>
          <strong>Adresse:</strong> {delivery.address}
        </p>
        {delivery.notes && (
          <div
            style={{
              marginTop: spacing.sm,
              padding: spacing.sm,
              backgroundColor: '#fef3c7',
              borderRadius: radii.sm,
              fontSize: '14px',
            }}
          >
            <strong>Notes:</strong> {delivery.notes}
          </div>
        )}
      </div>

      <div
        style={{
          backgroundColor: colors.surface,
          padding: spacing.md,
          borderRadius: radii.md,
          border: '1px solid #e5e7eb',
          marginBottom: spacing.lg,
        }}
      >
        <h3 style={{ margin: `0 0 ${spacing.sm} 0` }}>Montant à encaisser</h3>
        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: colors.primary }}>
          {delivery.total.toFixed(2)} $
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        {delivery.status === 'assigned' && (
          <ButtonPrimary onClick={() => updateDeliveryStatus(delivery.id, 'picked_up')}>
            Colis récupéré au dépanneur
          </ButtonPrimary>
        )}

        {delivery.status === 'picked_up' && (
          <ButtonPrimary onClick={() => updateDeliveryStatus(delivery.id, 'in_transit')}>
            Je pars en livraison
          </ButtonPrimary>
        )}

        {delivery.status === 'in_transit' && (
          <ButtonPrimary
            onClick={() => navigate(`/delivery/${delivery.id}/complete`)}
            style={{ backgroundColor: colors.success }}
          >
            Remettre au client
          </ButtonPrimary>
        )}

        {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
          <ButtonSecondary onClick={() => navigate(`/delivery/${delivery.id}/contact`)}>
            Contacter le client
          </ButtonSecondary>
        )}

        {delivery.status === 'delivered' && (
          <ButtonSecondary onClick={() => navigate('/')}>Retour à mes courses</ButtonSecondary>
        )}
      </div>
    </div>
  );
}
