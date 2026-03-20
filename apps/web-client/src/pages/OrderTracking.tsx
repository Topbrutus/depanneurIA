import React from 'react';
import { useParams } from 'react-router-dom';
import { OrderStatusBadge, spacing, radii } from '@depaneuria/ui';

export function OrderTracking() {
  const { id } = useParams();

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingTop: '40px' }}>
      <h1>Commande {id}</h1>
      <div style={{ marginBottom: spacing.lg }}>
        <OrderStatusBadge status="preparing" />
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
          <li style={{ padding: spacing.sm, borderBottom: '1px solid #eee' }}>✅ Commande reçue</li>
          <li style={{ padding: spacing.sm, borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
            ⏳ En préparation
          </li>
          <li style={{ padding: spacing.sm, color: '#aaa' }}>⚪ En route</li>
          <li style={{ padding: spacing.sm, color: '#aaa' }}>⚪ Livrée</li>
        </ul>
      </div>
      <p style={{ marginTop: spacing.xl, color: '#666' }}>Payable à la livraison.</p>
    </div>
  );
}
