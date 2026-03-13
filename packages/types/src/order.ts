/**
 * Types pour les commandes
 * Basé sur DEP-0555 à DEP-0594
 */

export type OrderStatus =
  | 'panier'
  | 'soumise'
  | 'confirmée'
  | 'en_préparation'
  | 'prête'
  | 'acceptée'
  | 'en_route'
  | 'livrée'
  | 'payée'
  | 'annulée'
  | 'problème'
  | 'archivée';

export interface OrderLine {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productLabel: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  totalPrice: number;
  imageUrl?: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerPhone: string;
  deliveryAddress: DeliveryAddress;
  status: OrderStatus;
  lines: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  createdAt: string;
  acceptedAt?: string;
  departedAt?: string;
  deliveredAt?: string;
  paidAt?: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  productLabel: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  imageUrl?: string;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  updatedAt: string;
}
