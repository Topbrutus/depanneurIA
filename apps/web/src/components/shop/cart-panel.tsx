/**
 * CartPanel component
 * Basé sur DEP-0334 (desktop) et DEP-0335 (mobile)
 */

import React, { useState } from 'react';
import { ShoppingCart, Trash2, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/lib/cart-store';
import { CartLine } from './cart-line';
import { useI18n } from '@/lib/i18n-context';

interface CartPanelProps {
  isMobile?: boolean;
}

export function CartPanel({ isMobile = false }: CartPanelProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const getTotal = useCartStore((state) => state.getTotal);

  const itemCount = getItemCount();
  const total = getTotal();

  const handleClearCart = () => {
    if (window.confirm(t('cart.clear.confirm'))) {
      clearCart();
    }
  };

  const handleConfirmCart = () => {
    if (items.length === 0) return;
    navigate('/panier');
  };

  // Bouton mobile flottant
  if (isMobile && !isMobileOpen) {
    return (
      <>
        <button
          className="cart-mobile-button"
          onClick={() => setIsMobileOpen(true)}
          aria-label={t('shop.cart.mobileOpen', { count: itemCount })}
        >
          <ShoppingCart size={24} />
          {itemCount > 0 && (
            <span className="shop-cart-badge">{itemCount}</span>
          )}
        </button>
      </>
    );
  }

  // Panneau mobile (overlay)
  if (isMobile && isMobileOpen) {
    return (
      <>
        <div
          className="cart-mobile-overlay"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
        <div className="cart-mobile-panel" role="dialog" aria-modal="true">
          <button
            onClick={() => setIsMobileOpen(false)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              padding: '8px',
            }}
            aria-label={t('shop.cart.close')}
          >
            <X size={24} />
          </button>

          <CartPanelContent
            items={items}
            itemCount={itemCount}
            total={total}
            onClearCart={handleClearCart}
            onConfirmCart={handleConfirmCart}
          />
        </div>
      </>
    );
  }

  // Panneau desktop (colonne latérale)
  return (
    <div className="cart-panel" role="complementary" aria-label={t('cart.title')}>
      <CartPanelContent
        items={items}
        itemCount={itemCount}
        total={total}
        onClearCart={handleClearCart}
        onConfirmCart={handleConfirmCart}
      />
    </div>
  );
}

interface CartPanelContentProps {
  items: ReturnType<typeof useCartStore>['items'];
  itemCount: number;
  total: number;
  onClearCart: () => void;
  onConfirmCart: () => void;
}

function CartPanelContent({
  items,
  itemCount,
  total,
  onClearCart,
  onConfirmCart,
}: CartPanelContentProps) {
  const { t } = useI18n();
  const countLabel = itemCount > 1 ? t('cart.count.plural', { count: itemCount }) : t('cart.count.single', { count: itemCount });
  return (
    <>
      <div className="cart-header">
        <h2 className="cart-title">{t('cart.title')}</h2>
        <div className="cart-count">{countLabel}</div>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <p>{t('cart.empty')}</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <CartLine key={item.variantId} item={item} />
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span className="cart-total-label">{t('cart.total.label')}</span>
              <span className="cart-total-value">{total.toFixed(2)} EUR</span>
            </div>

            <button
              className="cart-clear-button"
              onClick={onClearCart}
              aria-label={t('cart.clear')}
            >
              <Trash2 size={16} style={{ display: 'inline', marginRight: '4px' }} />
              {t('cart.clear')}
            </button>

            <button
              className="cart-confirm-button"
              onClick={onConfirmCart}
              disabled={items.length === 0}
              aria-label={t('cart.confirm.aria')}
            >
              {t('cart.confirm')}
              <ArrowRight size={16} style={{ display: 'inline', marginLeft: '4px' }} />
            </button>
          </div>
        </>
      )}
    </>
  );
}
