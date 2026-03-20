import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_ORDER, Order } from '@depaneuria/types';

const AppContext = createContext<any>(null);

export function AppProvider({ children }: any) {
  const [cart, setCart] = useState<any[]>([]);
  const [isAuth, setIsAuth] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // Sync currentOrder status roughly to simulate flow
  useEffect(() => {
    if (!currentOrder) return;
    if (currentOrder.status === 'draft') return;

    const interval = setInterval(() => {
      setCurrentOrder((prev: any) => {
        if (!prev) return prev;
        const statusFlow: any[] = [
          'submitted',
          'preparing',
          'ready_for_delivery',
          'assigned_to_driver',
          'out_for_delivery',
          'delivered',
        ];
        const currentIndex = statusFlow.indexOf(prev.status);
        if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
          return { ...prev, status: statusFlow[currentIndex + 1] };
        }
        return prev;
      });
    }, 10000); // status changes every 10 seconds for demo

    return () => clearInterval(interval);
  }, [currentOrder]);

  const addToCart = (product: any) => {
    setCart((c) => {
      const existing = c.find((item) => item.id === product.id);
      if (existing) {
        return c.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...c, { ...product, qty: 1 }];
    });
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const placeOrder = () => {
    setCurrentOrder({
      ...DEMO_ORDER,
      id: 'ORD-DEMO-' + Math.floor(Math.random() * 1000),
      status: 'submitted',
      totalAmount: cartTotal,
      items: cart.map((c) => ({
        id: 'item-' + Math.floor(Math.random() * 1000),
        orderId: 'ORD-DEMO',
        productId: c.id,
        productName: c.name,
        quantity: c.qty,
        unitPrice: c.price,
        createdAt: new Date().toISOString(),
      })),
    });
    clearCart();
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        clearCart,
        cartTotal,
        cartItemCount,
        isAuth,
        setIsAuth,
        currentOrder,
        placeOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
