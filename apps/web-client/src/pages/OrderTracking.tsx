import React from 'react';
import { useParams } from 'react-router-dom';
import { OrderStatusBadge, spacing, radii } from '@depaneuria/ui';
import { useAppContext } from '../lib/AppContext';

export function OrderTracking() {
  const { id } = useParams();
  const { currentOrder } = useAppContext();

  // For demo, if current order doesn't exist, just show placeholder
  const order = currentOrder || { id, status: 'preparing' };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingTop: '40px' }}>
      <h1>Commande {order.id}</h1>
      <div style={{ marginBottom: spacing.lg }}>
        <OrderStatusBadge status={order.status} />
      </div>
      <div
        style={{
          backgroundColor: '#fff',
          padding: spacing.lg,
          borderRadius: radii.md,
          border: '1px solid #e5e7eb',
          textAlign: 'left',
        }}
      >
        <h3>État en temps réel</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li
            style={{
              padding: spacing.sm,
              borderBottom: '1px solid #eee',
              fontWeight: order.status === 'submitted' ? 'bold' : 'normal',
              color: [
                'submitted',
                'preparing',
                'ready_for_delivery',
                'assigned_to_driver',
                'out_for_delivery',
                'delivered',
              ].includes(order.status)
                ? '#000'
                : '#aaa',
            }}
          >
            ✅ Commande reçue
          </li>
          <li
            style={{
              padding: spacing.sm,
              borderBottom: '1px solid #eee',
              fontWeight: order.status === 'preparing' ? 'bold' : 'normal',
              color: [
                'preparing',
                'ready_for_delivery',
                'assigned_to_driver',
                'out_for_delivery',
                'delivered',
              ].includes(order.status)
                ? '#000'
                : '#aaa',
            }}
          >
            ⏳ En préparation
          </li>
          <li
            style={{
              padding: spacing.sm,
              borderBottom: '1px solid #eee',
              fontWeight: order.status === 'out_for_delivery' ? 'bold' : 'normal',
              color: ['out_for_delivery', 'delivered'].includes(order.status) ? '#000' : '#aaa',
            }}
          >
            ⚪ En route
          </li>
          <li
            style={{
              padding: spacing.sm,
              fontWeight: order.status === 'delivered' ? 'bold' : 'normal',
              color: ['delivered'].includes(order.status) ? '#000' : '#aaa',
            }}
          >
            ⚪ Livrée
          </li>
        </ul>
      </div>
      <p style={{ marginTop: spacing.xl, color: '#666' }}>Payable à la livraison.</p>
    </div>
  );
}
