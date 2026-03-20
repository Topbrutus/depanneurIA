import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ButtonPrimary, spacing, radii } from '@depaneuria/ui';
import { useStoreContext } from '../lib/StoreContext';

export function OrderPrepare() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useStoreContext();
  const order = orders.find((o: any) => o.id === id);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  if (!order) return <p>Commande introuvable.</p>;

  const allChecked =
    order.items.length > 0 && order.items.every((i: any) => checkedItems[i.productId]);

  const handleFinish = () => {
    updateOrderStatus(order.id, 'ready_for_delivery');
    navigate('/orders/active');
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1>Préparation {order.id}</h1>
      <p>Cochez les articles au fur et à mesure que vous les mettez dans le sac.</p>

      <div
        style={{
          backgroundColor: '#fff',
          padding: spacing.lg,
          borderRadius: radii.md,
          border: '1px solid #eee',
          marginBottom: spacing.lg,
        }}
      >
        {order.items.map((i: any, idx: number) => {
          const isChecked = !!checkedItems[i.productId];
          return (
            <div
              key={idx}
              onClick={() => setCheckedItems((prev) => ({ ...prev, [i.productId]: !isChecked }))}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: spacing.md,
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                backgroundColor: isChecked ? '#f0fdf4' : 'transparent',
                opacity: isChecked ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  readOnly
                  style={{ transform: 'scale(1.5)' }}
                />
                <span
                  style={{ fontSize: '18px', textDecoration: isChecked ? 'line-through' : 'none' }}
                >
                  {i.productName}
                </span>
              </div>
              <strong style={{ fontSize: '18px' }}>{i.quantity}x</strong>
            </div>
          );
        })}
      </div>

      <ButtonPrimary
        onClick={handleFinish}
        disabled={!allChecked}
        style={{ width: '100%', opacity: allChecked ? 1 : 0.5 }}
      >
        Marquer comme Prêt
      </ButtonPrimary>
    </div>
  );
}
