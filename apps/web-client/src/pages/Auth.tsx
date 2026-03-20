import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ButtonPrimary } from '@depaneuria/ui';
import { useAppContext } from '../lib/AppContext';

export function Auth() {
  const { setIsAuth } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = (e: any) => {
    e.preventDefault();
    setIsAuth(true);
    navigate('/');
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '40px' }}>
      <h1>Connexion</h1>
      <form
        onSubmit={handleLogin}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <input
          type="text"
          placeholder="Numéro de téléphone"
          required
          style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <ButtonPrimary type="submit">Recevoir le code SMS (Mock)</ButtonPrimary>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Pas de compte ? <a href="/register">S'inscrire</a>
      </p>
    </div>
  );
}
