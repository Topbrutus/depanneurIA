import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { colors, spacing, radii } from '@depaneuria/ui';
import { useDriverContext } from '../lib/DriverContext';

export function DriverLayout() {
  const { deliveries } = useDriverContext();
  const availableCount = deliveries.filter((d: any) => d.status === 'available').length;
  const assignedCount = deliveries.filter((d: any) =>
    ['assigned', 'picked_up', 'in_transit'].includes(d.status)
  ).length;

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
      {/* Mobile-first Header */}
      <header
        style={{
          backgroundColor: colors.surface,
          padding: spacing.md,
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ color: colors.primary, margin: 0, fontSize: '20px' }}>Driver App</h2>
        <div style={{ display: 'flex', gap: spacing.sm, fontSize: '14px' }}>
          <span style={{ color: colors.success }}>🟢 En ligne</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        style={{ flexGrow: 1, padding: spacing.md, paddingBottom: '80px', boxSizing: 'border-box' }}
      >
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile friendly) */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.surface,
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-around',
          padding: spacing.sm,
          zIndex: 10,
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            color: colors.secondary,
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div style={{ fontSize: '24px' }}>📦</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Mes Courses</div>
          {assignedCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-10px',
                backgroundColor: colors.primary,
                color: '#fff',
                borderRadius: radii.full,
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: 'bold',
              }}
            >
              {assignedCount}
            </span>
          )}
        </Link>
        <Link
          to="/deliveries/available"
          style={{
            textDecoration: 'none',
            color: colors.secondary,
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div style={{ fontSize: '24px' }}>📡</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Disponibles</div>
          {availableCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-10px',
                backgroundColor: colors.warning,
                color: '#fff',
                borderRadius: radii.full,
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: 'bold',
              }}
            >
              {availableCount}
            </span>
          )}
        </Link>
        <Link
          to="/history"
          style={{ textDecoration: 'none', color: colors.secondary, textAlign: 'center' }}
        >
          <div style={{ fontSize: '24px' }}>⏱️</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Historique</div>
        </Link>
      </nav>
    </div>
  );
}
