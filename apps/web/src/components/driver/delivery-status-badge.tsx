import type { OrderStatus } from '@depaneuria/types';

interface DeliveryStatusBadgeProps {
  status: OrderStatus;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  panier: 'Panier',
  soumise: 'Soumise',
  confirmee: 'Confirmée',
  en_preparation: 'En préparation',
  prete: 'Prête',
  acceptee: 'Acceptée',
  en_route: 'En route',
  livree: 'Livrée',
  payee: 'Payée',
  annulee: 'Annulée',
  probleme: 'Problème',
  archivee: 'Archivée',
};

export function DeliveryStatusBadge({ status }: DeliveryStatusBadgeProps) {
  return (
    <span className={`status-badge status-badge-${status}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
