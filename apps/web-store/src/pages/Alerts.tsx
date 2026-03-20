import React from 'react';
import { colors, radii, spacing } from '@depaneuria/ui';

export function Alerts() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Alertes</h1>
      <p style={{ color: colors.secondary }}>Préférences de notifications (SMS, Email, Sonore).</p>
      <div
        style={{
          backgroundColor: '#fff',
          padding: spacing.xl,
          borderRadius: radii.md,
          border: '1px solid #eee',
          marginTop: spacing.lg,
        }}
      >
        <p>
          Cette page est un <strong>placeholder V1</strong> navigable pour l'interface
          d'administration.
        </p>
        <p style={{ color: colors.secondary, fontSize: '14px' }}>
          Les fonctionnalités réelles seront implémentées dans une phase ultérieure.
        </p>
      </div>
    </div>
  );
}
