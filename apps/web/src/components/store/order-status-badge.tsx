import type { OrderStatus } from '@depaneuria/types';
import { useI18n } from '../../lib/i18n-context';

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
  const { translations: t } = useI18n();

  const STATUS_LABELS: Record<OrderStatus, string> = {
    draft: t.store.statusDraft,
    submitted: t.store.statusSubmitted,
    accepted: t.store.statusAccepted,
    rejected: t.store.statusRejected,
    preparing: t.store.statusPreparing,
    ready_for_delivery: t.store.statusReady,
    assigned_to_driver: t.store.statusAssigned,
    out_for_delivery: t.store.statusOutForDelivery,
    delivered: t.store.statusDelivered,
    delivery_failed: t.store.statusDeliveryFailed,
    cancelled: t.store.statusCancelled,
  };

  return (
    <span className={`status-badge ${STATUS_CLASSNAMES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
