import React from 'react';
import { colors, spacing, radii } from '../design-tokens';

export function ButtonSecondary({ children, onClick, style, ...props }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: 'transparent',
        color: colors.secondary,
        border: `1px solid ${colors.secondary}`,
        padding: `${spacing.sm} ${spacing.md}`,
        borderRadius: radii.md,
        fontWeight: 'bold',
        cursor: 'pointer',
        minHeight: '44px',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
