/**
 * OrderSummary component
 * Basé sur DEP-0347
 */

import React from 'react';
import type { CartItem } from '@depaneuria/types';
import { useI18n } from '@/lib/i18n-context';

interface OrderSummaryProps {
  items: CartItem[];
  deliveryAddress?: {
    street: string;
    city: string;
    postalCode: string;
  };
  customerPhone?: string;
}

export function OrderSummary({ items, deliveryAddress, customerPhone }: OrderSummaryProps) {
  const { t } = useI18n();
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const deliveryFee = 4.0; // Frais de livraison fixes pour la V1
  const total = subtotal + deliveryFee;

  return (
    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>{t('order.summary.title')}</h2>

      <section style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>{t('order.summary.products')}</h3>
        {items.map((item) => (
          <div
            key={item.variantId}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              paddingBottom: '12px',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <div>
              <div style={{ fontWeight: '600' }}>{item.productLabel}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {item.variantLabel} × {item.quantity}
              </div>
            </div>
            <div style={{ fontWeight: '600' }}>
              {(item.unitPrice * item.quantity).toFixed(2)} {item.currency}
            </div>
          </div>
        ))}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <span>{t('order.summary.productsTotal')}</span>
          <span style={{ fontWeight: '600' }}>{subtotal.toFixed(2)} EUR</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <span>{t('order.summary.delivery')}</span>
          <span style={{ fontWeight: '600' }}>{deliveryFee.toFixed(2)} EUR</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '2px solid #e5e7eb',
            fontSize: '20px',
            fontWeight: 'bold',
          }}
        >
          <span>{t('order.summary.total')}</span>
          <span style={{ color: '#2563eb' }}>{total.toFixed(2)} EUR</span>
        </div>
      </section>

      {deliveryAddress && (
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            {t('order.summary.deliveryAddress')}
          </h3>
          <div style={{ fontSize: '14px', color: '#374151' }}>
            <div>{deliveryAddress.street}</div>
            <div>
              {deliveryAddress.postalCode} {deliveryAddress.city}
            </div>
          </div>
        </section>
      )}

      {customerPhone && (
        <section>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            {t('order.summary.contactPhone')}
          </h3>
          <div style={{ fontSize: '14px', color: '#374151' }}>{customerPhone}</div>
        </section>
      )}
    </div>
  );
}
