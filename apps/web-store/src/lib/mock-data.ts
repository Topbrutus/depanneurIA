import {
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  DEMO_ORDER,
  DEMO_DRIVERS,
  DEMO_CUSTOMER,
} from '@depaneuria/types';

export const mockCategories = DEMO_CATEGORIES.map((c: any) => ({ ...c, active: true }));
export const mockProducts = DEMO_PRODUCTS;

export const mockOrders = [
  {
    ...DEMO_ORDER,
    customerName: DEMO_CUSTOMER.firstName + ' ' + DEMO_CUSTOMER.lastName,
    status: 'submitted',
  },
];

export const mockDrivers = DEMO_DRIVERS;

export const mockHours = {
  monday: { open: '08:00', close: '23:00' },
  tuesday: { open: '08:00', close: '23:00' },
  wednesday: { open: '08:00', close: '23:00' },
  thursday: { open: '08:00', close: '23:00' },
  friday: { open: '08:00', close: '00:00' },
  saturday: { open: '09:00', close: '00:00' },
  sunday: { open: '09:00', close: '22:00' },
};

export const mockDeliveryZones = [
  { id: 'z1', name: 'Centre-ville (0-3km)', fee: 2.99, active: true },
  { id: 'z2', name: 'Périphérie (3-8km)', fee: 5.99, active: true },
  { id: 'z3', name: 'Banlieue (8-15km)', fee: 9.99, active: false },
];
