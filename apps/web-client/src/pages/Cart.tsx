import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ButtonPrimary, ButtonSecondary, spacing, colors } from '@depaneuria/ui';
import { useAppContext } from '../lib/AppContext';

export function Cart() {
  const { cart, cartTotal, placeOrder } = useAppContext();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cart.length === 0) return;
    placeOrder();
    // In a real app we'd get the ID, here we just go to the current order view
    // We'll use a timeout to let the state update
    setTimeout(() => {
      navigate('/order/current');
    }, 100);
  };

  return (
    <div>
      <h1>Votre Panier</h1>
      {cart.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: spacing.xl }}>
          <div>
            {cart.map((item: any) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: spacing.md,
                  borderBottom: '1px solid #eee',
                }}
              >
                <div style={{ display: 'flex', gap: spacing.md }}>
                  <div style={{ fontSize: '32px' }}>{item.emoji}</div>
                  <div>
                    <h3 style={{ margin: 0 }}>{item.name}</h3>
                    <p style={{ margin: 0, color: colors.secondary }}>Qté: {item.qty}</p>
                  </div>
                </div>
                <strong style={{ fontSize: '18px' }}>{(item.price * item.qty).toFixed(2)} $</strong>
              </div>
            ))}
          </div>
          <div
            style={{
              backgroundColor: '#fff',
              padding: spacing.lg,
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              height: 'fit-content',
            }}
          >
            <h2>Résumé</h2>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.sm }}
            >
              <span>Sous-total</span>
              <span>{cartTotal.toFixed(2)} $</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: spacing.md,
                fontWeight: 'bold',
                fontSize: '20px',
              }}
            >
              <span>Total</span>
              <span>{cartTotal.toFixed(2)} $</span>
            </div>
            <ButtonPrimary
              onClick={handleCheckout}
              style={{ width: '100%', marginBottom: spacing.sm }}
            >
              Confirmer la commande
            </ButtonPrimary>
            <ButtonSecondary onClick={() => navigate('/shop')} style={{ width: '100%' }}>
              Continuer les achats
            </ButtonSecondary>
          </div>
        </div>
      )}
    </div>
  );
}
