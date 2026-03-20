import React, { createContext, useContext, useState } from 'react';
import { mockOrders, mockProducts, mockCategories, mockDrivers } from './mock-data';

const StoreContext = createContext<any>(null);

export function StoreProvider({ children }: any) {
  const [orders, setOrders] = useState<any[]>(mockOrders);
  const [products, setProducts] = useState<any[]>(mockProducts);
  const [categories, setCategories] = useState<any[]>(mockCategories);

  // Orders logic
  const updateOrderStatus = (id: string, status: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const assignDriver = (orderId: string, driverId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'assigned', driverId } : o))
    );
  };

  // Catalog logic
  const toggleCategory = (id: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  };

  const updateProductStock = (id: string, stock: number) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock } : p)));
  };

  return (
    <StoreContext.Provider
      value={{
        orders,
        updateOrderStatus,
        assignDriver,
        products,
        updateProductStock,
        categories,
        toggleCategory,
        drivers: mockDrivers,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStoreContext = () => useContext(StoreContext);
