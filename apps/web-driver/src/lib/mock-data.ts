import { DEMO_DELIVERY } from '@depaneuria/types';

export const mockDeliveries = [
  DEMO_DELIVERY,
  {
    id: 'DEL-002',
    orderId: 'ORD-DONE-003',
    customerName: 'Lucie B.',
    customerPhone: '+1 514 555 9999',
    address: '789 ave Mont-Royal, Montréal, QC H2J 1W4',
    distance: '1.2 km',
    estimatedTime: '5 mins',
    totalAmount: 15.5,
    status: 'delivered',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
