/**
 * CartPage - Page récapitulatif panier
 * Basé sur DEP-0347
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { OrderSummary } from '@/components/shop/order-summary';
import { useI18n } from '@/lib/i18n-context';

export function CartPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Données de démo pour l'adresse et le téléphone
  const [deliveryAddress] = useState({
    street: '123 Rue de la République',
    city: 'Paris',
    postalCode: '75001',
  });
  const [customerPhone] = useState('+33 6 12 34 56 78');

  const handleConfirmOrder = () => {
    if (items.length === 0) return;

    // Simuler l'envoi de la commande
    // En production, cela ferait un appel API
    const success = Math.random() > 0.2; // 80% de succès

    if (success) {
      const orderNumber = `CMD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
      clearCart();
      navigate('/commande/succes', { state: { orderNumber } });
    } else {
      navigate('/commande/echec');
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', padding: '24px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              padding: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#2563eb',
            }}
          >
            <ArrowLeft size={20} />
            {t('cartPage.backToShop')}
          </button>

          <div
            style={{
              backgroundColor: 'white',
              padding: '48px',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>{t('cartPage.empty.title')}</h1>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>{t('cartPage.empty.subtitle')}</p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {t('cartPage.returnToShop')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '24px', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
            padding: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#2563eb',
          }}
        >
          <ArrowLeft size={20} />
          {t('cartPage.backToShop')}
        </button>

        <OrderSummary
          items={items}
          deliveryAddress={deliveryAddress}
          customerPhone={customerPhone}
        />

        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '24px',
          }}
        >
          <button
            onClick={() => navigate('/')}
            style={{
              flex: 1,
              padding: '16px',
              backgroundColor: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {t('cartPage.returnToCart')}
          </button>

          <button
            onClick={handleConfirmOrder}
            style={{
              flex: 2,
              padding: '16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {t('cartPage.confirmSend')}
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
