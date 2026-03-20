import React from 'react';
import { spacing, radii } from '../design-tokens';

export function SearchInput({ value, onChange, placeholder, onClear }: any) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={{ position: 'absolute', left: spacing.sm }}>🔍</span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder || 'Rechercher...'}
        style={{
          width: '100%',
          padding: `${spacing.sm} ${spacing.md} ${spacing.sm} 32px`,
          borderRadius: radii.full,
          border: '1px solid #ccc',
          minHeight: '44px',
        }}
      />
      {value && onClear && (
        <button
          onClick={onClear}
          style={{
            position: 'absolute',
            right: spacing.sm,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ✖
        </button>
      )}
    </div>
  );
}
