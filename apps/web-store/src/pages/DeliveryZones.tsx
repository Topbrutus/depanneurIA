import React from 'react';
import { colors, radii, spacing } from '@depaneuria/ui';

export function DeliveryZones() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Zones de livraison</h1>
      <p style={{ color: colors.secondary }}>Configuration des rayons de livraison et frais.</p>
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
