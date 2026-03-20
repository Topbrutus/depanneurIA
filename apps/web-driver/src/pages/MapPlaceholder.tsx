import React from 'react';
import { colors, radii, spacing } from '@depaneuria/ui';

export function MapPlaceholder() {
  return (
    <div>
      <h1 style={{ marginTop: 0, fontSize: '24px' }}>Carte Interactive</h1>
      <p style={{ color: colors.secondary }}>Visualisation des trajets.</p>
      <div
        style={{
          backgroundColor: '#fff',
          padding: spacing.xl,
          borderRadius: radii.md,
          border: '1px solid #eee',
          marginTop: spacing.lg,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: spacing.md }}>🗺️</div>
        <p>
          Cette page est un <strong>placeholder</strong>.
        </p>
        <p style={{ color: colors.secondary, fontSize: '14px' }}>
          L'intégration de Google Maps ou Mapbox se fera ultérieurement.
        </p>
      </div>
    </div>
  );
}
