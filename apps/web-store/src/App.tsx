import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './lib/StoreContext';
import { StoreLayout } from './components/StoreLayout';

import { Dashboard } from './pages/Dashboard';
import { ActiveOrders } from './pages/ActiveOrders';
import { OrderDetail } from './pages/OrderDetail';
import { OrderPrepare } from './pages/OrderPrepare';
import { OrderAssign } from './pages/OrderAssign';

import { Catalog } from './pages/Catalog';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';

import { Settings } from './pages/Settings';
import { Hours } from './pages/Hours';
import { DeliveryZones } from './pages/DeliveryZones';
import { Alerts } from './pages/Alerts';

export function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StoreLayout />}>
            {/* Orders */}
            <Route index element={<Dashboard />} />
            <Route path="orders/active" element={<ActiveOrders />} />
            <Route path="order/:id" element={<OrderDetail />} />
            <Route path="order/:id/prepare" element={<OrderPrepare />} />
            <Route path="order/:id/assign" element={<OrderAssign />} />

            {/* Catalog */}
            <Route path="catalog" element={<Catalog />} />
            <Route path="catalog/products" element={<Products />} />
            <Route path="catalog/categories" element={<Categories />} />

            {/* Settings */}
            <Route path="settings" element={<Settings />} />
            <Route path="settings/hours" element={<Hours />} />
            <Route path="settings/delivery-zones" element={<DeliveryZones />} />
            <Route path="settings/alerts" element={<Alerts />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
