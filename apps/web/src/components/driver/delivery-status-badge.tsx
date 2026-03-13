import type { OrderStatus } from '@depaneuria/types';
import { STATUS_LABELS } from './status-labels';

interface DeliveryStatusBadgeProps {
  status: OrderStatus;
}

export function DeliveryStatusBadge({ status }: DeliveryStatusBadgeProps) {
  return (
    <span className={`status-badge status-badge-${status}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
