import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderStatusBadge, ButtonPrimary, spacing, radii } from '@depaneuria/ui';
import { useStoreContext } from '../lib/StoreContext';

export function ActiveOrders() {
  const { orders } = useStoreContext();
  const navigate = useNavigate();

  const activeOrders = orders.filter((o: any) =>
    ['preparing', 'ready_for_delivery', 'assigned_to_driver'].includes(o.status)
  );

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Commandes en Cours</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        {activeOrders.map((o: any) => (
          <div
            key={o.id}
            style={{
              backgroundColor: '#fff',
              padding: spacing.md,
              borderRadius: radii.md,
              border: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong>{o.id}</strong> • {o.customerName}
              <div style={{ marginTop: spacing.xs }}>
                <OrderStatusBadge status={o.status} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: spacing.sm }}>
              <ButtonPrimary onClick={() => navigate(`/order/${o.id}`)}>Détails</ButtonPrimary>
              {o.status === 'preparing' && (
                <ButtonPrimary onClick={() => navigate(`/order/${o.id}/prepare`)}>
                  Continuer Préparation
                </ButtonPrimary>
              )}
              {(o.status === 'ready_for_delivery' || o.status === 'preparing') && (
                <ButtonPrimary
                  onClick={() => navigate(`/order/${o.id}/assign`)}
                  style={{ backgroundColor: '#10B981' }}
                >
                  Assigner Livreur
                </ButtonPrimary>
              )}
            </div>
          </div>
        ))}
        {activeOrders.length === 0 && <p>Aucune commande active.</p>}
      </div>
    </div>
  );
}
