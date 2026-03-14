import type { Order, OrderStatus } from '@depaneuria/types';
import { DEFAULT_TENANT_ID } from '@depaneuria/types';

const API_ROOT = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');
const API_BASE = `${API_ROOT}/tenants`;

export interface OrderWithDetails extends Order {
  customer?: {
    firstName: string;
    lastName: string;
    phone: string | null;
  };
  address?: {
    street: string;
    city: string;
    postalCode: string;
    deliveryInstructions?: string | null;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/** Récupère les commandes prêtes pour livraison (ready_for_delivery, assigned_to_driver, out_for_delivery) */
export async function fetchDeliveryOrders(
  status?: OrderStatus,
  tenantId: string = DEFAULT_TENANT_ID
): Promise<OrderWithDetails[]> {
  const base = `${API_BASE}/${tenantId}/orders`;
  const url = status ? `${base}?status=${status}` : base;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Erreur lors de la récupération des commandes: ${response.statusText}`
    );
  }
  const json: ApiResponse<OrderWithDetails[]> = await response.json();
  return json.data;
}

/**
 * Met à jour le statut d'une commande
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  tenantId: string = DEFAULT_TENANT_ID
): Promise<OrderWithDetails> {
  const response = await fetch(`${API_BASE}/${tenantId}/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: newStatus }),
  });

  if (!response.ok) {
    throw new Error(
      `Erreur lors de la mise à jour du statut: ${response.statusText}`
    );
  }

  const json: ApiResponse<OrderWithDetails> = await response.json();
  return json.data;
}
