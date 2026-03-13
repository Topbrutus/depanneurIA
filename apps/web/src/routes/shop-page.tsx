/**
 * ShopPage - Page boutique manuelle
 * Basé sur DEP-0321 à DEP-0333
 */

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { DEMO_CATALOG } from '@/lib/demo-catalog';
import { ProductGrid } from '@/components/shop/product-grid';
import { CartPanel } from '@/components/shop/cart-panel';
import { LastOrderCard } from '@/components/shop/last-order-card';
import { TopProductsCard } from '@/components/shop/top-products-card';

export function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInStock, setShowInStock] = useState(true);
  const [showPopular, setShowPopular] = useState(false);

  const categories = DEMO_CATALOG.categories;
  const allProducts = DEMO_CATALOG.products;

  // Produits filtrés
  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    // Filtre par catégorie
    if (selectedCategory) {
      products = products.filter((p) => p.categoryId === selectedCategory);
    }

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      products = products.filter(
        (p) =>
          p.label.toLowerCase().includes(term) ||
          p.brand?.toLowerCase().includes(term) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(term)) ||
          p.synonyms?.some((syn) => syn.toLowerCase().includes(term))
      );
    }

    // Filtre par disponibilité
    if (showInStock) {
      products = products.filter((p) => {
        const variant = p.variants.find((v) => v.isDefault) || p.variants[0];
        return variant.availability !== 'rupture';
      });
    }

    // Filtre par popularité
    if (showPopular) {
      products = products.filter((p) => p.isPopular);
    }

    return products;
  }, [selectedCategory, searchTerm, showInStock, showPopular, allProducts]);

  // Produits populaires pour la section Top 10
  const topProducts = useMemo(() => {
    return allProducts.filter((p) => p.isPopular).slice(0, 10);
  }, [allProducts]);

  // Produits de dernière commande (simulés - 3 produits aléatoires pour la démo)
  const lastOrderProducts = useMemo(() => {
    return allProducts.slice(0, 3);
  }, [allProducts]);

  return (
    <div className="shop-layout">
      <header className="shop-header">
        <div className="shop-logo">DépannVite</div>
      </header>

      {/* Navigation catégories (desktop uniquement) */}
      <aside className="shop-categories" aria-label="Catégories">
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
          Catégories
        </h2>

        <div
          className={`shop-category-item ${!selectedCategory ? 'active' : ''}`}
          onClick={() => setSelectedCategory(null)}
          role="button"
          tabIndex={0}
        >
          Tout
        </div>

        {categories.map((category) => (
          <div
            key={category.id}
            className={`shop-category-item ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
            role="button"
            tabIndex={0}
          >
            {category.label}
          </div>
        ))}
      </aside>

      {/* Zone centrale */}
      <main className="shop-main">
        {/* Barre de recherche */}
        <div className="shop-search-bar">
          <Search className="shop-search-icon" size={20} />
          <input
            type="search"
            className="shop-search-input"
            placeholder="Rechercher un produit…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Rechercher un produit"
          />
        </div>

        {/* Filtres */}
        <div className="shop-filters-bar">
          <button
            className={`shop-filter-button ${showInStock ? 'active' : ''}`}
            onClick={() => setShowInStock(!showInStock)}
          >
            En stock uniquement
          </button>

          <button
            className={`shop-filter-button ${showPopular ? 'active' : ''}`}
            onClick={() => setShowPopular(!showPopular)}
          >
            Populaires
          </button>
        </div>

        {/* Section Dernière commande */}
        {!searchTerm && !selectedCategory && (
          <LastOrderCard products={lastOrderProducts} />
        )}

        {/* Section Top 10 */}
        {!searchTerm && !selectedCategory && <TopProductsCard products={topProducts} />}

        {/* Grille de produits */}
        <ProductGrid products={filteredProducts} />
      </main>

      {/* Panier desktop */}
      <CartPanel isMobile={false} />

      {/* Panier mobile (bouton flottant) */}
      <CartPanel isMobile={true} />
    </div>
  );
}
