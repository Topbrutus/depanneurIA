import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ButtonPrimary, ButtonSecondary, spacing } from '@depaneuria/ui';

export function Home() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', paddingTop: '40px' }}>
      <h1>Commandez votre dépannage en un clin d'œil.</h1>
      <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '40px' }}>
        Sélectionnez votre mode de commande préféré.
      </p>
      <div style={{ display: 'flex', gap: spacing.md, justifyContent: 'center' }}>
        <ButtonPrimary
          onClick={() => navigate('/assistant')}
          style={{ fontSize: '18px', padding: '16px 32px' }}
        >
          🎙️ Commande Assistée
        </ButtonPrimary>
        <ButtonSecondary
          onClick={() => navigate('/shop')}
          style={{ fontSize: '18px', padding: '16px 32px' }}
        >
          🛒 Boutique Manuelle
        </ButtonSecondary>
      </div>
    </div>
  );
}
