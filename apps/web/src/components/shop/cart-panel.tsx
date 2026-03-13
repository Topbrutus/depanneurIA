/**
 * CartPanel component
 * Basé sur DEP-0334 (desktop) et DEP-0335 (mobile)
 */

import React, { useState } from 'react';
import { ShoppingCart, Trash2, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/lib/cart-store';
import { CartLine } from './cart-line';

interface CartPanelProps {
  isMobile?: boolean;
}

export function CartPanel({ isMobile = false }: CartPanelProps) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const getTotal = useCartStore((state) => state.getTotal);

  const itemCount = getItemCount();
  const total = getTotal();

  const handleClearCart = () => {
    if (window.confirm('Vider le panier ? Tous les produits seront retirés.')) {
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
          aria-label={`Ouvrir le panier (${itemCount} articles)`}
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
            aria-label="Fermer le panier"
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
    <div className="cart-panel" role="complementary" aria-label="Panier">
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
  return (
    <>
      <div className="cart-header">
        <h2 className="cart-title">Mon panier</h2>
        <div className="cart-count">
          {itemCount} {itemCount > 1 ? 'articles' : 'article'}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <p>Ton panier est vide.</p>
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
              <span className="cart-total-label">Total :</span>
              <span className="cart-total-value">{total.toFixed(2)} EUR</span>
            </div>

            <button
              className="cart-clear-button"
              onClick={onClearCart}
              aria-label="Vider le panier"
            >
              <Trash2 size={16} style={{ display: 'inline', marginRight: '4px' }} />
              Vider le panier
            </button>

            <button
              className="cart-confirm-button"
              onClick={onConfirmCart}
              disabled={items.length === 0}
              aria-label="Confirmer le panier et passer commande"
            >
              Confirmer le panier
              <ArrowRight size={16} style={{ display: 'inline', marginLeft: '4px' }} />
            </button>
          </div>
        </>
      )}
    </>
  );
}
