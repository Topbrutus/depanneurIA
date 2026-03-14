/**
 * OrderTrackingPage - Page suivi de commande
 * Basé sur DEP-0349
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle } from 'lucide-react';
import type { OrderStatus } from '@depaneuria/types';
import { useI18n } from '@/lib/i18n-context';
import type { TranslationKey } from '@/lib/i18n';

export function OrderTrackingPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('submitted');

  // Simuler la progression de la commande
  useEffect(() => {
    const statuses: OrderStatus[] = [
      'submitted',
      'preparing',
      'ready_for_delivery',
      'out_for_delivery',
      'delivered',
    ];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % statuses.length;
      setOrderStatus(statuses[currentIndex]);
    }, 5000); // Changer l'état toutes les 5 secondes pour la démo

    return () => clearInterval(interval);
  }, []);

  const orderNumber = 'CMD-2026-0001';
  const createdAt = '14:32';

  const steps: { status: OrderStatus; color: string }[] = [
    { status: 'submitted', color: '#f59e0b' },
    { status: 'preparing', color: '#2563eb' },
    { status: 'ready_for_delivery', color: '#10b981' },
    { status: 'out_for_delivery', color: '#4f46e5' },
    { status: 'delivered', color: '#10b981' },
  ];

  const currentStepIndex = steps.findIndex((step) => step.status === orderStatus);

  const getIcon = (index: number) => {
    if (index < 3) return <Package size={24} />;
    if (index === 3) return <Truck size={24} />;
    return <CheckCircle size={24} />;
  };

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
          {t('tracking.back')}
        </button>

        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            {t('tracking.title')}
          </h1>

          <div
            style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '24px',
              fontFamily: 'monospace',
            }}
          >
            {t('tracking.meta', { orderNumber, time: createdAt })}
          </div>

          {/* Barre de progression */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {/* Ligne de progression */}
              <div
                style={{
                  position: 'absolute',
                  top: '32px',
                  left: '0',
                  right: '0',
                  height: '4px',
                  backgroundColor: '#e5e7eb',
                  zIndex: 0,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#2563eb',
                    width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                    transition: 'width 300ms ease-in-out',
                  }}
                />
              </div>

              {/* Étapes */}
              {steps.map((step, index) => {
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;

                return (
                  <div
                    key={step.status}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: isActive || isCompleted ? step.color : '#e5e7eb',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px',
                        transition: 'all 300ms ease-in-out',
                      }}
                    >
                      {getIcon(index)}
                    </div>

                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: isActive ? '600' : '400',
                        color: isActive || isCompleted ? step.color : '#6b7280',
                        textAlign: 'center',
                      }}
                    >
                      {t(`status.${step.status}` as TranslationKey)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Détails de la commande */}
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              {t('tracking.products.title')}
            </h3>

            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              <div style={{ marginBottom: '8px' }}>• Plaquettes de frein avant × 1</div>
              <div style={{ marginBottom: '8px' }}>• Filtre à huile × 1</div>
              <div style={{ marginBottom: '8px' }}>• Ampoule H7 12V 55W × 2</div>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: '32px',
              padding: '16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            {t('tracking.cta')}
          </button>
        </div>
      </div>
    </div>
  );
}
