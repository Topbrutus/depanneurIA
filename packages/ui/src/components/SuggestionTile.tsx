import React from 'react';
import { colors, spacing, radii } from '../design-tokens';

export function SuggestionTile({ label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: colors.background,
        color: colors.primary,
        border: `1px solid ${colors.primary}`,
        borderRadius: radii.full,
        padding: `${spacing.xs} ${spacing.md}`,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}
