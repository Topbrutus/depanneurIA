import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ButtonPrimary, spacing, radii, colors } from '@depaneuria/ui';
import { useStoreContext } from '../lib/StoreContext';

export function OrderAssign() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, drivers, assignDriver } = useStoreContext();
  const order = orders.find((o: any) => o.id === id);

  if (!order) return <p>Commande introuvable.</p>;

  const handleAssign = (driverId: string) => {
    assignDriver(order.id, driverId);
    navigate('/orders/active');
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1>Assignation Livreur</h1>
      <p>
        Commande : <strong>{order.id}</strong> pour {order.customerName}
      </p>

      <h3>Livreurs Disponibles</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
        {drivers
          .filter((d: any) => d.status === 'available')
          .map((d: any) => (
            <div
              key={d.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fff',
                padding: spacing.md,
                borderRadius: radii.md,
                border: '1px solid #eee',
              }}
            >
              <div>
                <strong style={{ fontSize: '18px' }}>{d.name}</strong>
                <div style={{ color: colors.secondary, fontSize: '14px' }}>À {d.distance}</div>
              </div>
              <ButtonPrimary onClick={() => handleAssign(d.id)}>Assigner</ButtonPrimary>
            </div>
          ))}
      </div>

      <h3 style={{ marginTop: spacing.xl }}>Livreurs Occupés</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, opacity: 0.6 }}>
        {drivers
          .filter((d: any) => d.status !== 'available')
          .map((d: any) => (
            <div
              key={d.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fff',
                padding: spacing.md,
                borderRadius: radii.md,
                border: '1px solid #eee',
              }}
            >
              <div>
                <strong style={{ fontSize: '18px' }}>{d.name}</strong>
                <div style={{ color: colors.error, fontSize: '14px' }}>Occupé ({d.distance})</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
