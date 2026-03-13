import type { UserRole } from '@depaneuria/types';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'small' | 'medium' | 'large';
}

const ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Client',
  store_operator: 'Opérateur',
  driver: 'Livreur',
  admin: 'Admin',
};

const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  customer: { bg: '#E0F2FE', text: '#0369A1' },
  store_operator: { bg: '#FEF3C7', text: '#92400E' },
  driver: { bg: '#D1FAE5', text: '#065F46' },
  admin: { bg: '#FECACA', text: '#991B1B' },
};

const SIZES = {
  small: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
  medium: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
  large: { padding: '0.5rem 1rem', fontSize: '1rem' },
};

/**
 * Badge pour afficher le rôle utilisateur
 */
export function RoleBadge({ role, size = 'medium' }: RoleBadgeProps) {
  const colors = ROLE_COLORS[role];
  const sizeStyles = SIZES[size];

  return (
    <span
      style={{
        display: 'inline-block',
        padding: sizeStyles.padding,
        fontSize: sizeStyles.fontSize,
        fontWeight: 500,
        borderRadius: '0.375rem',
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
