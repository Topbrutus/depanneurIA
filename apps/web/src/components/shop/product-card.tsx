/**
 * ProductCard component
 * Basé sur DEP-0330 et DEP-0331
 */

import React from 'react';
import { Plus } from 'lucide-react';
import type { Product, ProductVariant } from '@depaneuria/types';
import { useCartStore } from '@/lib/cart-store';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const getItem = useCartStore((state) => state.getItem);

  // Variante par défaut
  const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0];
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];

  // Vérifier si le produit est déjà dans le panier
  const cartItem = getItem(defaultVariant.id);
  const isInCart = !!cartItem;
  const isOutOfStock = defaultVariant.availability === 'rupture';
  const isLowStock = defaultVariant.availability === 'faible_stock';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      variantId: defaultVariant.id,
      productLabel: product.label,
      variantLabel: defaultVariant.label,
      quantity: 1,
      unitPrice: defaultVariant.price,
      currency: defaultVariant.currency,
      imageUrl: primaryImage?.url,
    });
  };

  return (
    <div
      className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
      onClick={onClick}
      role="article"
      aria-label={`${product.label} - ${defaultVariant.price} ${defaultVariant.currency}`}
    >
      <img
        src={primaryImage?.url || '/demo/placeholder.webp'}
        alt={primaryImage?.alt || product.label}
        className="product-image"
      />

      <div className="product-content">
        {product.brand && <div className="product-brand">{product.brand}</div>}

        <h3 className="product-name">{product.label}</h3>

        <div className="product-variant">{defaultVariant.label}</div>

        <div className="product-price">
          {defaultVariant.price.toFixed(2)} {defaultVariant.currency}
        </div>

        <div className="product-badges">
          {product.isPopular && (
            <span className="product-badge popular">Populaire</span>
          )}
          {isLowStock && (
            <span className="product-badge low-stock">Faible stock</span>
          )}
          {isOutOfStock && (
            <span className="product-badge out-of-stock">Rupture</span>
          )}
        </div>

        <button
          className="product-add-button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          aria-label={`Ajouter ${product.label} au panier`}
        >
          <Plus size={20} style={{ display: 'inline', marginRight: '4px' }} />
          {isInCart ? `Dans le panier (×${cartItem.quantity})` : 'Ajouter'}
        </button>
      </div>
    </div>
  );
}
