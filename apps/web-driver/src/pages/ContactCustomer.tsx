import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ButtonPrimary, ButtonSecondary, spacing, colors } from '@depaneuria/ui';
import { useDriverContext } from '../lib/DriverContext';

export function ContactCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deliveries } = useDriverContext();
  const delivery = deliveries.find((d: any) => d.id === id);

  if (!delivery) return <p>Livraison introuvable.</p>;

  return (
    <div style={{ textAlign: 'center', paddingTop: '40px' }}>
      <div style={{ fontSize: '64px', marginBottom: spacing.md }}>📱</div>
      <h1 style={{ marginTop: 0, fontSize: '24px' }}>Contacter {delivery.customerName}</h1>
      <p style={{ fontSize: '18px', color: colors.secondary, marginBottom: spacing.xl }}>
        {delivery.phone}
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.md,
          maxWidth: '300px',
          margin: '0 auto',
        }}
      >
        <a href={`tel:${delivery.phone}`} style={{ textDecoration: 'none' }}>
          <ButtonPrimary style={{ width: '100%' }}>Appeler</ButtonPrimary>
        </a>
        <a href={`sms:${delivery.phone}`} style={{ textDecoration: 'none' }}>
          <ButtonSecondary style={{ width: '100%' }}>Envoyer un SMS</ButtonSecondary>
        </a>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'block',
            width: '100%',
            padding: spacing.md,
            background: 'none',
            border: 'none',
            color: colors.secondary,
            marginTop: spacing.md,
            cursor: 'pointer',
          }}
        >
          Retour
        </button>
      </div>
    </div>
  );
}
