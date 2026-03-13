import type { Order, OrderStatus } from '@depaneuria/types';

const API_BASE = '/api/v1';

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

/**
 * Récupère les commandes prêtes pour livraison
 * (statuts: prete, acceptee, en_route)
 */
export async function fetchDeliveryOrders(
  status?: OrderStatus
): Promise<OrderWithDetails[]> {
  const url = status
    ? `${API_BASE}/orders?status=${status}`
    : `${API_BASE}/orders`;
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
  newStatus: OrderStatus
): Promise<OrderWithDetails> {
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
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
