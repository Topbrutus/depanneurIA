import type { Order, OrderStatus } from '@depaneuria/types';
import { DEFAULT_TENANT_ID } from '@depaneuria/types';

const API_ROOT = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');
const API_BASE = `${API_ROOT}/tenants`;

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
export async function fetchOrders(
  status?: OrderStatus,
  tenantId: string = DEFAULT_TENANT_ID
): Promise<OrderWithDetails[]> {
  const base = `${API_BASE}/${tenantId}/orders`;
  const url = status ? `${base}?status=${status}` : base;
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
export async function fetchOrder(
  orderId: string,
  tenantId: string = DEFAULT_TENANT_ID
): Promise<OrderWithDetails> {
  const response = await fetch(`${API_BASE}/${tenantId}/orders/${orderId}`);

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération de la commande: ${response.statusText}`);
  }

  const json: ApiResponse<OrderWithDetails> = await response.json();
  return json.data;
}

/**
 * Mettre à jour le statut d'une commande
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  tenantId: string = DEFAULT_TENANT_ID
): Promise<OrderWithDetails> {
  const response = await fetch(`${API_BASE}/${tenantId}/orders/${orderId}`, {
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
