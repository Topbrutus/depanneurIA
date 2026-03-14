import type { OrderStatus } from '@depaneuria/types';
import { useI18n } from '../../lib/i18n-context';
import type { TranslationKey } from '../../lib/i18n';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const STATUS_CLASSNAMES: Record<OrderStatus, string> = {
  draft: 'draft',
  submitted: 'submitted',
  accepted: 'accepted',
  rejected: 'rejected',
  preparing: 'preparing',
  ready_for_delivery: 'ready_for_delivery',
  assigned_to_driver: 'assigned_to_driver',
  out_for_delivery: 'out_for_delivery',
  delivered: 'delivered',
  delivery_failed: 'delivery_failed',
  cancelled: 'cancelled',
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { t } = useI18n();
  return (
    <span className={`status-badge ${STATUS_CLASSNAMES[status]}`}>
      {t(`status.${status}` as TranslationKey)}
    </span>
  );
}
