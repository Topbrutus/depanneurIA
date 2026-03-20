import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './lib/AppContext';
import { Layout } from './components/Layout';

import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Assistant } from './pages/Assistant';
import { Cart } from './pages/Cart';
import { OrderTracking } from './pages/OrderTracking';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';

import { Addresses } from './pages/Addresses';
import { OrderHistory } from './pages/OrderHistory';
import { Popular } from './pages/Popular';
import { LastOrder } from './pages/LastOrder';
import { Register } from './pages/Register';
import { Contact } from './pages/Contact';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Accessibility } from './pages/Accessibility';
import { VoiceHelp } from './pages/VoiceHelp';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="shop/popular" element={<Popular />} />
            <Route path="shop/last-order" element={<LastOrder />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="cart" element={<Cart />} />
            <Route path="order/:id" element={<OrderTracking />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/addresses" element={<Addresses />} />
            <Route path="profile/orders" element={<OrderHistory />} />
            <Route path="auth" element={<Auth />} />
            <Route path="register" element={<Register />} />
            <Route path="contact" element={<Contact />} />
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="accessibility" element={<Accessibility />} />
            <Route path="help/voice" element={<VoiceHelp />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
