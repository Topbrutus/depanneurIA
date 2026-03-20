export const DELIVERY_STATUSES = [
  'available',
  'assigned',
  'picked_up',
  'in_transit',
  'delivered',
  'cancelled',
] as const;

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export const PAYMENT_METHODS = ['cash', 'card', 'online'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface DriverProfile {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
  location?: {
    lat: number;
    lng: number;
  };
  distanceStr?: string; // e.g. "2km"
}

export interface Delivery {
  id: string;
  orderId: string;
  driverId?: string;
  status: DeliveryStatus;
  customerName: string;
  customerPhone: string;
  address: string;
  distance: string;
  estimatedTime: string;
  totalAmount: number;
  notes?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}
