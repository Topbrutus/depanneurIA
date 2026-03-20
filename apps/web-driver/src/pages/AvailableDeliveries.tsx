import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverContext } from '../lib/DriverContext';
import { DeliveryCard } from '../components/DeliveryCard';
import { colors } from '@depaneuria/ui';

export function AvailableDeliveries() {
  const { deliveries, acceptDelivery } = useDriverContext();
  const navigate = useNavigate();
  const available = deliveries.filter((d: any) => d.status === 'available');

  const handleAccept = (id: string) => {
    acceptDelivery(id);
    navigate(`/delivery/${id}`);
  };

  return (
    <div>
      <h1 style={{ marginTop: 0, fontSize: '24px' }}>Courses Disponibles</h1>
      <p style={{ color: colors.secondary, fontSize: '14px' }}>
        Nouvelles courses dans votre secteur.
      </p>

      {available.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: colors.secondary }}>
          <p>Aucune course disponible pour le moment.</p>
        </div>
      ) : (
        available.map((d: any) => (
          <DeliveryCard key={d.id} delivery={d} showAccept={true} onAccept={handleAccept} />
        ))
      )}
    </div>
  );
}
