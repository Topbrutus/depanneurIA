import React from 'react';
import { Link } from 'react-router-dom';
import { spacing } from '@depaneuria/ui';
import { useAppContext } from '../lib/AppContext';

export function Profile() {
  const { isAuth, setIsAuth } = useAppContext();

  if (!isAuth) {
    return (
      <p>
        Veuillez vous <Link to="/auth">connecter</Link>.
      </p>
    );
  }

  return (
    <div>
      <h1>Mon Profil</h1>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.sm,
        }}
      >
        <li>
          <Link to="/profile/addresses">Mes adresses de livraison</Link>
        </li>
        <li>
          <Link to="/profile/orders">Historique des commandes</Link>
        </li>
      </ul>
      <button
        onClick={() => setIsAuth(false)}
        style={{ marginTop: spacing.lg, padding: spacing.sm, cursor: 'pointer' }}
      >
        Se déconnecter
      </button>
    </div>
  );
}
