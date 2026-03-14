/**
 * OrderFailurePage - Page échec envoi commande
 * Basé sur DEP-0350
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';

export function OrderFailurePage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleRetry = () => {
    // En production, cela relancerait la tentative d'envoi
    navigate('/panier');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '48px',
          textAlign: 'center',
        }}
      >
        <AlertTriangle size={64} style={{ color: '#ef4444', margin: '0 auto 24px' }} />

        <h1
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#111827',
          }}
        >
          {t('order.failure.title')}
        </h1>

        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>
          {t('order.failure.subtitle')}
        </p>

        <div
          style={{
            backgroundColor: '#fef2f2',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '32px',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#991b1b', marginBottom: '8px' }}>
            {t('order.failure.errorCode')}
          </div>
          <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
            {t('order.failure.errorMessage')}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <button
            onClick={handleRetry}
            style={{
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
            <RotateCcw size={20} />
            {t('order.failure.retry')}
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <X size={20} />
            {t('order.failure.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
