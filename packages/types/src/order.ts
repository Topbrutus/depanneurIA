/** Statuts de commande V1 — DEP-0561 */
export const ORDER_STATUSES = [
  'panier',
  'soumise',
  'confirmee',
  'en_preparation',
  'prete',
  'acceptee',
  'en_route',
  'livree',
  'payee',
  'annulee',
  'probleme',
  'archivee',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  addressId: string;
  status: OrderStatus;
  totalAmount: number;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  customerId: string;
  addressId: string;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}
