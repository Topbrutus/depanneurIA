import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { colors, spacing, radii } from '@depaneuria/ui';
import { useStoreContext } from '../lib/StoreContext';

export function StoreLayout() {
  const { orders } = useStoreContext();
  const newOrdersCount = orders.filter(
    (o: any) => o.status === 'submitted' || o.status === 'draft'
  ).length;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: colors.background,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Sidebar Navigation */}
      <nav
        style={{
          width: '250px',
          backgroundColor: colors.surface,
          borderRight: '1px solid #e5e7eb',
          padding: spacing.lg,
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.md,
        }}
      >
        <h2 style={{ color: colors.primary, marginTop: 0, marginBottom: spacing.xl }}>
          Store Admin
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          <strong
            style={{
              fontSize: '12px',
              color: colors.secondary,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Réception
          </strong>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              color: '#000',
              padding: spacing.sm,
              borderRadius: radii.sm,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            Nouveautés
            {newOrdersCount > 0 && (
              <span
                style={{
                  backgroundColor: colors.error,
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: radii.full,
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                {newOrdersCount}
              </span>
            )}
          </Link>
          <Link
            to="/orders/active"
            style={{
              textDecoration: 'none',
              color: '#000',
              padding: spacing.sm,
              borderRadius: radii.sm,
            }}
          >
            Commandes en cours
          </Link>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.sm,
            marginTop: spacing.md,
          }}
        >
          <strong
            style={{
              fontSize: '12px',
              color: colors.secondary,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Catalogue
          </strong>
          <Link
            to="/catalog"
            style={{
              textDecoration: 'none',
              color: '#000',
              padding: spacing.sm,
              borderRadius: radii.sm,
            }}
          >
            Vue d'ensemble
          </Link>
          <Link
            to="/catalog/products"
            style={{
              textDecoration: 'none',
              color: '#000',
              padding: spacing.sm,
              borderRadius: radii.sm,
            }}
          >
            Produits
          </Link>
          <Link
            to="/catalog/categories"
            style={{
              textDecoration: 'none',
              color: '#000',
              padding: spacing.sm,
              borderRadius: radii.sm,
            }}
          >
            Catégories
          </Link>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.sm,
            marginTop: spacing.md,
          }}
        >
          <strong
            style={{
              fontSize: '12px',
              color: colors.secondary,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Paramètres
          </strong>
          <Link
            to="/settings"
            style={{
              textDecoration: 'none',
              color: '#000',
              padding: spacing.sm,
              borderRadius: radii.sm,
            }}
          >
            Général
          </Link>
          <Link
            to="/settings/hours"
            style={{
              textDecoration: 'none',
              color: '#000',
              padding: spacing.sm,
              borderRadius: radii.sm,
            }}
          >
            Horaires
          </Link>
          <Link
            to="/settings/delivery-zones"
            style={{
              textDecoration: 'none',
              color: '#000',
              padding: spacing.sm,
              borderRadius: radii.sm,
            }}
          >
            Zones de livraison
          </Link>
          <Link
            to="/settings/alerts"
            style={{
              textDecoration: 'none',
              color: '#000',
              padding: spacing.sm,
              borderRadius: radii.sm,
            }}
          >
            Alertes
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main
        style={{ flexGrow: 1, padding: spacing.xl, boxSizing: 'border-box', overflowY: 'auto' }}
      >
        <Outlet />
      </main>
    </div>
  );
}
