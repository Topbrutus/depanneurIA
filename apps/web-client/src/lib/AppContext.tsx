import React, { createContext, useContext, useState } from 'react';
// Mocks are loaded dynamically when needed

const AppContext = createContext<any>(null);

export function AppProvider({ children }: any) {
  const [cart, setCart] = useState<any[]>([]);
  const [isAuth, setIsAuth] = useState(false); // mock auth

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

  return (
    <AppContext.Provider
      value={{ cart, addToCart, clearCart, cartTotal, cartItemCount, isAuth, setIsAuth }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
