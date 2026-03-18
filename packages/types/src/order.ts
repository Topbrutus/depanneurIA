/** Statuts de commande centralisés — DEP-0561 */
export const ORDER_STATUSES = [
  'draft',
  'submitted',
  'accepted',
  'rejected',
  'preparing',
  'ready_for_delivery',
  'assigned_to_driver',
  'out_for_delivery',
  'delivered',
  'delivery_failed',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type OrderStatusHistory = Partial<Record<OrderStatus, string>>;

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
  /** Horodatage par statut, mis à jour par le moteur d'état */
  statusHistory?: OrderStatusHistory;
  /** Horodatage du statut courant (prend la valeur du statut courant dans statusHistory) */
  statusChangedAt?: string;
  totalAmount: number;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  tenantId?: string;
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

export type TenantOrder = Order & { tenantId: string };
