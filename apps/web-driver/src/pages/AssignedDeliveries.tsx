import React from 'react';
import { useDriverContext } from '../lib/DriverContext';
import { DeliveryCard } from '../components/DeliveryCard';
import { colors } from '@depaneuria/ui';

export function AssignedDeliveries() {
  const { deliveries } = useDriverContext();
  const assigned = deliveries.filter((d: any) =>
    ['assigned', 'picked_up', 'in_transit'].includes(d.status)
  );

  return (
    <div>
      <h1 style={{ marginTop: 0, fontSize: '24px' }}>Mes Courses</h1>
      <p style={{ color: colors.secondary, fontSize: '14px' }}>
        Livraisons qui vous sont actuellement assignées.
      </p>

      {assigned.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: colors.secondary }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😴</div>
          <p>Vous n'avez aucune course en cours.</p>
        </div>
      ) : (
        assigned.map((d: any) => <DeliveryCard key={d.id} delivery={d} />)
      )}
    </div>
  );
}
