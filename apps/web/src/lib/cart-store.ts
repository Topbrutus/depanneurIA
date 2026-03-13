/**
 * Cart Store using Zustand
 * Basé sur DEP-0334 à DEP-0347
 * Persistance avec localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@depaneuria/types';

interface CartStore {
  items: CartItem[];

  // Actions
  addItem: (item: Omit<CartItem, 'addedAt'>) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;

  // Computed
  getItemCount: () => number;
  getTotal: () => number;
  getItem: (variantId: string) => CartItem | undefined;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.variantId === item.variantId
          );

          if (existingItem) {
            // Incrémenter la quantité si le produit existe déjà
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }

          // Ajouter un nouveau produit
          return {
            items: [
              ...state.items,
              {
                ...item,
                addedAt: new Date().toISOString(),
              },
            ],
          };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity < 1) {
          get().removeItem(variantId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.variantId === variantId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        );
      },

      getItem: (variantId) => {
        return get().items.find((item) => item.variantId === variantId);
      },
    }),
    {
      name: 'depaneurIA_cart', // Clé localStorage (DEP-0342)
    }
  )
);
