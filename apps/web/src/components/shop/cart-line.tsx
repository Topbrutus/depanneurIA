/**
 * CartLine component
 * Basé sur DEP-0336 et DEP-0337
 */

import React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import type { CartItem } from '@depaneuria/types';
import { useCartStore } from '@/lib/cart-store';
import { useI18n } from '@/lib/i18n-context';

interface CartLineProps {
  item: CartItem;
}

export function CartLine({ item }: CartLineProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const { t } = useI18n();

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.variantId, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    updateQuantity(item.variantId, item.quantity + 1);
  };

  const handleRemove = () => {
    removeItem(item.variantId);
  };

  const totalPrice = item.unitPrice * item.quantity;

  return (
    <div className="cart-item">
      <img
        src={item.imageUrl || '/demo/placeholder.webp'}
        alt={item.productLabel}
        className="cart-item-image"
      />

      <div className="cart-item-details">
        <div className="cart-item-name">{item.productLabel}</div>
        <div className="cart-item-variant">{item.variantLabel}</div>

        <div className="cart-item-quantity">
          <button
            className="cart-quantity-button"
            onClick={handleDecrement}
            disabled={item.quantity <= 1}
            aria-label={t('cart.aria.decrease')}
          >
            <Minus size={16} />
          </button>

          <span className="cart-quantity-value">{item.quantity}</span>

          <button
            className="cart-quantity-button"
            onClick={handleIncrement}
            aria-label={t('cart.aria.increase')}
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="cart-item-price">
          {totalPrice.toFixed(2)} {item.currency}
        </div>
      </div>

      <button
        className="cart-item-remove"
        onClick={handleRemove}
        aria-label={t('cart.aria.remove', { product: item.productLabel })}
      >
        <X size={20} />
      </button>
    </div>
  );
}
