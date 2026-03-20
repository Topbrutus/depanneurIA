export const mockCategories = [
  { id: 'boissons', name: 'Boissons', active: true },
  { id: 'snacks', name: 'Snacks Salés', active: true },
  { id: 'epicerie', name: 'Épicerie', active: false },
];

export const mockProducts = [
  {
    id: 'coke-2l',
    name: 'Coca-Cola 2L',
    price: 3.49,
    categoryId: 'boissons',
    stock: 12,
    emoji: '🥤',
  },
  {
    id: 'pepsi-can',
    name: 'Pepsi Canette',
    price: 1.25,
    categoryId: 'boissons',
    stock: 45,
    emoji: '🥫',
  },
  {
    id: 'doritos-nacho',
    name: 'Doritos Nacho',
    price: 4.99,
    categoryId: 'snacks',
    stock: 8,
    emoji: '🌮',
  },
  {
    id: 'lays-classique',
    name: 'Lays Classique',
    price: 4.49,
    categoryId: 'snacks',
    stock: 0,
    emoji: '🥔',
  },
  { id: 'lait-1l', name: 'Lait 2% 1L', price: 2.99, categoryId: 'epicerie', stock: 5, emoji: '🥛' },
  {
    id: 'pain-blanc',
    name: 'Pain Blanc tranché',
    price: 3.29,
    categoryId: 'epicerie',
    stock: 2,
    emoji: '🍞',
  },
];

export const mockOrders = [
  {
    id: 'ORD-NEW-001',
    date: new Date().toISOString(),
    customerName: 'Jean Dupont',
    total: 11.97,
    status: 'received', // 'received', 'preparing', 'ready', 'assigned'
    items: [
      { productId: 'coke-2l', quantity: 2, name: 'Coca-Cola 2L', price: 3.49, emoji: '🥤' },
      { productId: 'doritos-nacho', quantity: 1, name: 'Doritos Nacho', price: 4.99, emoji: '🌮' },
    ],
  },
  {
    id: 'ORD-PREP-002',
    date: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    customerName: 'Marie Tremblay',
    total: 2.99,
    status: 'preparing',
    items: [{ productId: 'lait-1l', quantity: 1, name: 'Lait 2% 1L', price: 2.99, emoji: '🥛' }],
  },
];

export const mockDrivers = [
  { id: 'drv-1', name: 'Alexandre', status: 'available', distance: '2km' },
  { id: 'drv-2', name: 'Béatrice', status: 'busy', distance: '5km' },
  { id: 'drv-3', name: 'Carlos', status: 'available', distance: '800m' },
];

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
