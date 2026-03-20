import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DriverProvider } from './lib/DriverContext';
import { DriverLayout } from './components/DriverLayout';

import { AssignedDeliveries } from './pages/AssignedDeliveries';
import { AvailableDeliveries } from './pages/AvailableDeliveries';
import { DeliveryDetail } from './pages/DeliveryDetail';
import { DeliveryProof } from './pages/DeliveryProof';
import { ContactCustomer } from './pages/ContactCustomer';
import { History } from './pages/History';
import { MapPlaceholder } from './pages/MapPlaceholder';

export function App() {
  return (
    <DriverProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DriverLayout />}>
            <Route index element={<AssignedDeliveries />} />
            <Route path="deliveries/available" element={<AvailableDeliveries />} />
            <Route path="delivery/:id" element={<DeliveryDetail />} />
            <Route path="delivery/:id/complete" element={<DeliveryProof />} />
            <Route path="delivery/:id/contact" element={<ContactCustomer />} />
            <Route path="history" element={<History />} />
            <Route path="map" element={<MapPlaceholder />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DriverProvider>
  );
}
