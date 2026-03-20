import {
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  DEMO_CUSTOMER,
  DEMO_ADDRESS,
  DEMO_ORDER,
} from '@depaneuria/types';

export const mockCategories = DEMO_CATEGORIES;
export const mockProducts = DEMO_PRODUCTS;

export const mockLastOrder = {
  ...DEMO_ORDER,
  status: 'delivered',
};

export const mockOrders = [
  mockLastOrder,
  {
    id: 'ORD-1230',
    date: '2026-03-10T10:15:00Z',
    total: 3.29,
    status: 'delivered',
    items: [
      { productId: 'pain-blanc', quantity: 1, productName: 'Pain Blanc tranché', unitPrice: 3.29 },
    ],
  },
];

export const mockAddresses = [
  DEMO_ADDRESS,
  {
    id: 'addr-2',
    customerId: DEMO_CUSTOMER.id,
    label: 'Travail',
    street: '456 boul. René-Lévesque',
    city: 'Montréal',
    postalCode: 'H2Z 1A4',
    country: 'Canada',
    isDefault: false,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockTopProducts = [mockProducts[0], mockProducts[1], mockProducts[2]];
