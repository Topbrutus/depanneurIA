import React from 'react';
import {
  ButtonPrimary,
  ButtonSecondary,
  OrderStatusBadge,
  spacing,
  radii,
  colors,
} from '@depaneuria/ui';
import { useStoreContext } from '../lib/StoreContext';

export function Dashboard() {
  const { orders, updateOrderStatus } = useStoreContext();

  const newOrders = orders.filter((o: any) => o.status === 'received');

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Tableau de Réception</h1>
      <p style={{ color: colors.secondary }}>Nouvelles commandes en attente d'acceptation.</p>

      {newOrders.length === 0 ? (
        <div
          style={{
            backgroundColor: '#fff',
            padding: spacing.xl,
            borderRadius: radii.md,
            textAlign: 'center',
            border: '1px solid #eee',
          }}
        >
          <h3>Aucune nouvelle commande</h3>
          <p>En attente de nouveaux clients...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {newOrders.map((o: any) => (
            <div
              key={o.id}
              style={{
                backgroundColor: '#fff',
                border: `2px solid ${colors.primary}`,
                padding: spacing.lg,
                borderRadius: radii.md,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: spacing.md,
                }}
              >
                <div>
                  <h2 style={{ margin: `0 0 ${spacing.xs} 0` }}>
                    {o.id} - {o.customerName}
                  </h2>
                  <p style={{ margin: 0, color: colors.secondary }}>
                    {new Date(o.date).toLocaleTimeString()} • {o.total.toFixed(2)} $
                  </p>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>

              <div style={{ marginBottom: spacing.lg }}>
                <strong>Articles :</strong>
                <ul style={{ margin: `${spacing.xs} 0 0 0`, paddingLeft: '20px' }}>
                  {o.items.map((i: any, idx: number) => (
                    <li key={idx}>
                      {i.emoji} {i.quantity}x {i.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', gap: spacing.sm }}>
                <ButtonPrimary
                  onClick={() => updateOrderStatus(o.id, 'preparing')}
                  style={{ flex: 1 }}
                >
                  Accepter & Préparer
                </ButtonPrimary>
                <ButtonSecondary
                  onClick={() => updateOrderStatus(o.id, 'cancelled')}
                  style={{ flex: 1, borderColor: colors.error, color: colors.error }}
                >
                  Refuser
                </ButtonSecondary>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
