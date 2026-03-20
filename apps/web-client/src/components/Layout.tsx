import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { colors, spacing, CartMiniature } from '@depaneuria/ui';
import { useAppContext } from '../lib/AppContext';

export function Layout() {
  const { cartItemCount, cartTotal, isAuth } = useAppContext();
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: colors.background,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <header
        style={{
          backgroundColor: colors.surface,
          padding: `${spacing.md} ${spacing.lg}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            color: colors.primary,
            fontWeight: 'bold',
            fontSize: '24px',
          }}
        >
          depaneurIA
        </Link>
        <div style={{ display: 'flex', gap: spacing.md, alignItems: 'center' }}>
          <Link to="/shop" style={{ textDecoration: 'none', color: colors.secondary }}>
            Boutique
          </Link>
          <Link to="/assistant" style={{ textDecoration: 'none', color: colors.secondary }}>
            Assistant
          </Link>
          {isAuth ? (
            <Link to="/profile" style={{ textDecoration: 'none', color: colors.secondary }}>
              Profil
            </Link>
          ) : (
            <Link to="/auth" style={{ textDecoration: 'none', color: colors.secondary }}>
              Connexion
            </Link>
          )}
          <CartMiniature
            itemCount={cartItemCount}
            total={cartTotal}
            onClick={() => navigate('/cart')}
          />
        </div>
      </header>

      <main
        style={{
          flexGrow: 1,
          padding: spacing.lg,
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Outlet />
      </main>

      <footer
        style={{
          backgroundColor: colors.surface,
          padding: spacing.lg,
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center',
          color: colors.secondary,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: spacing.md,
            marginBottom: spacing.sm,
          }}
        >
          <Link to="/contact" style={{ color: colors.primary, textDecoration: 'none' }}>
            Contact
          </Link>
          <Link to="/terms" style={{ color: colors.primary, textDecoration: 'none' }}>
            Conditions
          </Link>
          <Link to="/privacy" style={{ color: colors.primary, textDecoration: 'none' }}>
            Confidentialité
          </Link>
          <Link to="/accessibility" style={{ color: colors.primary, textDecoration: 'none' }}>
            Accessibilité
          </Link>
        </div>
        <p style={{ margin: 0, fontSize: '14px' }}>© 2026 depaneurIA. Prototype V1.</p>
      </footer>
    </div>
  );
}
