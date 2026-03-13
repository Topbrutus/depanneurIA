import type { OrderStatus } from '@depaneuria/types';

export const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Brouillon',
  submitted: 'Soumise',
  accepted: 'Acceptée',
  rejected: 'Rejetée',
  preparing: 'En préparation',
  ready_for_delivery: 'Prête',
  assigned_to_driver: 'Assignée au livreur',
  out_for_delivery: 'En livraison',
  delivered: 'Livrée',
  delivery_failed: 'Échec livraison',
  cancelled: 'Annulée',
};
