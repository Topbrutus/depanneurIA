import type { Order, OrderStatus } from '@depaneuria/types';

const API_BASE = '/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

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
  };
}

/**
 * Récupérer toutes les commandes avec filtre optionnel par statut
 */
export async function fetchOrders(status?: OrderStatus): Promise<OrderWithDetails[]> {
  const url = status ? `${API_BASE}/orders?status=${status}` : `${API_BASE}/orders`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des commandes: ${response.statusText}`);
  }

  const json: ApiResponse<OrderWithDetails[]> = await response.json();
  return json.data;
}

/**
 * Récupérer une commande spécifique par ID
 */
export async function fetchOrder(orderId: string): Promise<OrderWithDetails> {
  const response = await fetch(`${API_BASE}/orders/${orderId}`);

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération de la commande: ${response.statusText}`);
  }

  const json: ApiResponse<OrderWithDetails> = await response.json();
  return json.data;
}

/**
 * Mettre à jour le statut d'une commande
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderWithDetails> {
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Erreur lors de la mise à jour du statut: ${response.statusText}`);
  }

  const json: ApiResponse<OrderWithDetails> = await response.json();
  return json.data;
}
