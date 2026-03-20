import React from 'react';
import { useDriverContext } from '../lib/DriverContext';
import { DeliveryCard } from '../components/DeliveryCard';
import { colors } from '@depaneuria/ui';

export function History() {
  const { deliveries } = useDriverContext();
  const history = deliveries.filter(
    (d: any) => d.status === 'delivered' || d.status === 'cancelled'
  );

  return (
    <div>
      <h1 style={{ marginTop: 0, fontSize: '24px' }}>Historique</h1>
      <p style={{ color: colors.secondary, fontSize: '14px' }}>
        Vos courses terminées aujourd'hui.
      </p>

      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: colors.secondary }}>
          <p>Aucune course terminée pour le moment.</p>
        </div>
      ) : (
        history.map((d: any) => <DeliveryCard key={d.id} delivery={d} />)
      )}
    </div>
  );
}
