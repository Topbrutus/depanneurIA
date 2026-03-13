/**
 * OrderSuccessPage - Page confirmation commande envoyée
 * Basé sur DEP-0348
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Eye, ShoppingBag } from 'lucide-react';

export function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderNumber = location.state?.orderNumber || 'CMD-2026-0001';

  useEffect(() => {
    // Copier le numéro de commande dans le presse-papiers
    navigator.clipboard.writeText(orderNumber).catch(() => {
      // Ignorer les erreurs si le presse-papiers n'est pas disponible
    });
  }, [orderNumber]);

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
        <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 24px' }} />

        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#111827',
          }}
        >
          Commande envoyée
        </h1>

        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>
          Ta commande a bien été envoyée au dépanneur.
        </p>

        <div
          style={{
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
            Numéro de commande
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#2563eb',
              fontFamily: 'monospace',
            }}
          >
            {orderNumber}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#fef3c7',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '32px',
          }}
        >
          <div style={{ fontSize: '14px', color: '#92400e' }}>
            Le dépanneur prendra ta commande en charge dans les prochaines minutes.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <button
            onClick={() => navigate('/commande/suivi')}
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
            <Eye size={20} />
            Voir le suivi
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
            <ShoppingBag size={20} />
            Retour à la boutique
          </button>
        </div>
      </div>
    </div>
  );
}
