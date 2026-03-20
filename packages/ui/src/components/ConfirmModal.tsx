import React from 'react';
import { colors, spacing, radii } from '../design-tokens';
import { ButtonPrimary } from './ButtonPrimary';
import { ButtonSecondary } from './ButtonSecondary';

export function ConfirmModal({ title, message, onConfirm, onCancel, isOpen }: any) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: colors.surface,
          padding: spacing.lg,
          borderRadius: radii.lg,
          maxWidth: '400px',
          width: '90%',
        }}
      >
        <h2 style={{ margin: `0 0 ${spacing.sm} 0` }}>{title}</h2>
        <p style={{ margin: `0 0 ${spacing.lg} 0` }}>{message}</p>
        <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' }}>
          <ButtonSecondary onClick={onCancel}>Annuler</ButtonSecondary>
          <ButtonPrimary onClick={onConfirm}>Confirmer</ButtonPrimary>
        </div>
      </div>
    </div>
  );
}
