import React from 'react';
import { colors, spacing, radii } from '../design-tokens';

export function ButtonPrimary({ children, onClick, style, ...props }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: colors.primary,
        color: '#fff',
        padding: `${spacing.sm} ${spacing.md}`,
        border: 'none',
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
