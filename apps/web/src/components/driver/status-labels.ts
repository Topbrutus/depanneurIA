import type { OrderStatus, Translations } from '@depaneuria/types';

export function getStatusLabels(t: Translations): Record<OrderStatus, string> {
  return {
    draft: t.order.statusDraft,
    submitted: t.order.statusSubmitted,
    accepted: t.order.statusAccepted,
    rejected: t.order.statusRejected,
    preparing: t.order.statusPreparing,
    ready_for_delivery: t.order.statusReady,
    assigned_to_driver: t.order.statusAssigned,
    out_for_delivery: t.order.statusOutForDelivery,
    delivered: t.order.statusDelivered,
    delivery_failed: t.order.statusFailed,
    cancelled: t.order.statusCancelled,
  };
}
