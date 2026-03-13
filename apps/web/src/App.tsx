import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ShopPage } from './routes/shop-page';
import { CartPage } from './routes/cart-page';
import { OrderSuccessPage } from './routes/order-success-page';
import { OrderFailurePage } from './routes/order-failure-page';
import { OrderTrackingPage } from './routes/order-tracking-page';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ShopPage />} />
        <Route path="/panier" element={<CartPage />} />
        <Route path="/commande/succes" element={<OrderSuccessPage />} />
        <Route path="/commande/echec" element={<OrderFailurePage />} />
        <Route path="/commande/suivi" element={<OrderTrackingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
