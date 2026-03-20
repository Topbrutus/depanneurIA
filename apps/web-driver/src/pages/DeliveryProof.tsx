import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ButtonPrimary, spacing, radii, colors } from '@depaneuria/ui';
import { useDriverContext } from '../lib/DriverContext';

export function DeliveryProof() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deliveries, updateDeliveryStatus } = useDriverContext();
  const delivery = deliveries.find((d: any) => d.id === id);
  const [method, setMethod] = useState('');

  if (!delivery) return <p>Livraison introuvable.</p>;

  const handleComplete = () => {
    updateDeliveryStatus(delivery.id, 'delivered');
    navigate('/');
  };

  return (
    <div>
      <h1 style={{ marginTop: 0, fontSize: '24px' }}>Preuve de Remise</h1>
      <p>
        Confirmez la livraison pour <strong>{delivery.customerName}</strong>.
      </p>

      <div
        style={{
          backgroundColor: colors.surface,
          padding: spacing.md,
          borderRadius: radii.md,
          border: '1px solid #e5e7eb',
          marginBottom: spacing.lg,
        }}
      >
        <h3 style={{ margin: `0 0 ${spacing.md} 0` }}>
          Montant perçu : {delivery.totalAmount.toFixed(2)} $
        </h3>

        <p style={{ fontWeight: 'bold', marginBottom: spacing.sm }}>Méthode de paiement (Mock) :</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="radio"
              name="payment"
              value="cash"
              onChange={(e) => setMethod(e.target.value)}
            />{' '}
            Argent comptant
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="radio"
              name="payment"
              value="card"
              onChange={(e) => setMethod(e.target.value)}
            />{' '}
            Terminal TPE (Carte)
          </label>
        </div>
      </div>

      <ButtonPrimary
        onClick={handleComplete}
        disabled={!method}
        style={{ width: '100%', opacity: method ? 1 : 0.5, backgroundColor: colors.success }}
      >
        Valider la livraison
      </ButtonPrimary>

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
        Annuler / Retour
      </button>
    </div>
  );
}
