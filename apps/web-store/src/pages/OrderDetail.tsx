import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrderStatusBadge, ButtonPrimary, spacing, radii, colors } from '@depaneuria/ui';
import { useStoreContext } from '../lib/StoreContext';

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders } = useStoreContext();
  const order = orders.find((o: any) => o.id === id);

  if (!order) return <p>Commande introuvable.</p>;

  return (
    <div>
      <h1>Détail Commande {order.id}</h1>
      <div style={{ display: 'flex', gap: spacing.xl }}>
        <div
          style={{
            flex: 2,
            backgroundColor: '#fff',
            padding: spacing.lg,
            borderRadius: radii.md,
            border: '1px solid #eee',
          }}
        >
          <h3>Articles</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {order.items.map((i: any, idx: number) => (
              <li
                key={idx}
                style={{
                  padding: spacing.sm,
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{i.productName}</span>
                <strong>{i.quantity}x</strong>
              </li>
            ))}
          </ul>
          <h3 style={{ textAlign: 'right', marginTop: spacing.md }}>
            Total : {order.totalAmount.toFixed(2)} $
          </h3>
        </div>

        <div
          style={{
            flex: 1,
            backgroundColor: '#fff',
            padding: spacing.lg,
            borderRadius: radii.md,
            border: '1px solid #eee',
            height: 'fit-content',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Informations</h3>
          <p>
            <strong>Client:</strong> {order.customerName}
          </p>
          <p>
            <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Statut:</strong> <OrderStatusBadge status={order.status} />
          </p>

          <div
            style={{
              marginTop: spacing.xl,
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.sm,
            }}
          >
            {['draft', 'submitted'].includes(order.status) && (
              <ButtonPrimary onClick={() => navigate('/')}>Aller à la réception</ButtonPrimary>
            )}
            {order.status === 'preparing' && (
              <ButtonPrimary onClick={() => navigate(`/order/${order.id}/prepare`)}>
                Pointer les articles
              </ButtonPrimary>
            )}
            {(order.status === 'ready_for_delivery' || order.status === 'preparing') && (
              <ButtonPrimary
                onClick={() => navigate(`/order/${order.id}/assign`)}
                style={{ backgroundColor: colors.success }}
              >
                Assigner Livreur
              </ButtonPrimary>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
