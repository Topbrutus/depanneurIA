export const driverRoutes = [
  { path: '/', name: 'assigned', label: 'Livraisons Assignées', status: 'v1' },
  {
    path: '/deliveries/available',
    name: 'available-deliveries',
    label: 'Livraisons Disponibles',
    status: 'v1',
  },
  { path: '/delivery/:id', name: 'delivery-detail', label: 'Livraison en Cours', status: 'v1' },
  { path: '/delivery/:id/complete', name: 'delivery-proof', label: 'État Remise', status: 'v1' },
  {
    path: '/delivery/:id/contact',
    name: 'contact-customer',
    label: 'Contact Client',
    status: 'v1',
  },
  { path: '/history', name: 'history', label: 'Historique', status: 'v1' },
  { path: '/map', name: 'map-view', label: 'Carte Interactive', status: 'later' },
];
