export const mockCategories = [
  { id: 'boissons', name: 'Boissons' },
  { id: 'snacks', name: 'Snacks Salés' },
  { id: 'epicerie', name: 'Épicerie' },
];

export const mockProducts = [
  { id: 'coke-2l', name: 'Coca-Cola 2L', price: 3.49, categoryId: 'boissons', emoji: '🥤' },
  { id: 'pepsi-can', name: 'Pepsi Canette', price: 1.25, categoryId: 'boissons', emoji: '🥫' },
  { id: 'doritos-nacho', name: 'Doritos Nacho', price: 4.99, categoryId: 'snacks', emoji: '🌮' },
  { id: 'lays-classique', name: 'Lays Classique', price: 4.49, categoryId: 'snacks', emoji: '🥔' },
  { id: 'lait-1l', name: 'Lait 2% 1L', price: 2.99, categoryId: 'epicerie', emoji: '🥛' },
  {
    id: 'pain-blanc',
    name: 'Pain Blanc tranché',
    price: 3.29,
    categoryId: 'epicerie',
    emoji: '🍞',
  },
];

export const mockLastOrder = {
  id: 'ORD-1234',
  date: '2026-03-15T14:30:00Z',
  total: 9.73,
  status: 'delivered',
  items: [
    { productId: 'coke-2l', quantity: 1, name: 'Coca-Cola 2L', price: 3.49 },
    { productId: 'doritos-nacho', quantity: 1, name: 'Doritos Nacho', price: 4.99 },
  ],
};

export const mockOrders = [
  mockLastOrder,
  {
    id: 'ORD-1230',
    date: '2026-03-10T10:15:00Z',
    total: 3.29,
    status: 'delivered',
    items: [{ productId: 'pain-blanc', quantity: 1, name: 'Pain Blanc tranché', price: 3.29 }],
  },
];

export const mockAddresses = [
  {
    id: 'addr-1',
    label: 'Domicile',
    street: '123 rue Principale, App 4B',
    city: 'Montréal',
    zip: 'H2X 1Y6',
  },
  {
    id: 'addr-2',
    label: 'Travail',
    street: '456 boul. René-Lévesque',
    city: 'Montréal',
    zip: 'H2Z 1A4',
  },
];

export const mockTopProducts = [mockProducts[0], mockProducts[2], mockProducts[4]];
