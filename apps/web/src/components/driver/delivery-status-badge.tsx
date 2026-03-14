import type { OrderStatus } from '@depaneuria/types';
import { getStatusLabels } from './status-labels';
import { useI18n } from '../../lib/i18n-context';

interface DeliveryStatusBadgeProps {
  status: OrderStatus;
}

export function DeliveryStatusBadge({ status }: DeliveryStatusBadgeProps) {
  const { translations: t } = useI18n();
  const STATUS_LABELS = getStatusLabels(t);

  return (
    <span className={`status-badge status-badge-${status}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
