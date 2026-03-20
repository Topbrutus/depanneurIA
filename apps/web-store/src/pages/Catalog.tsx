import React from 'react';
import { Link } from 'react-router-dom';
import { spacing, radii, colors } from '@depaneuria/ui';
import { useStoreContext } from '../lib/StoreContext';

export function Catalog() {
  const { products, categories } = useStoreContext();

  const activeProducts = products.filter((p: any) => p.stock > 0);
  const outOfStock = products.filter((p: any) => p.stock === 0);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Catalogue (Vue d'ensemble)</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: spacing.lg,
          marginTop: spacing.xl,
        }}
      >
        <div
          style={{
            backgroundColor: '#fff',
            padding: spacing.xl,
            borderRadius: radii.lg,
            border: '1px solid #eee',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '48px', margin: 0, color: colors.primary }}>
            {activeProducts.length}
          </h2>
          <p style={{ color: colors.secondary }}>Produits en stock</p>
          {outOfStock.length > 0 && (
            <p style={{ color: colors.error }}>{outOfStock.length} produits en rupture</p>
          )}
          <Link to="/catalog/products" style={{ display: 'block', marginTop: spacing.md }}>
            Gérer les produits
          </Link>
        </div>

        <div
          style={{
            backgroundColor: '#fff',
            padding: spacing.xl,
            borderRadius: radii.lg,
            border: '1px solid #eee',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '48px', margin: 0, color: colors.primary }}>
            {categories.length}
          </h2>
          <p style={{ color: colors.secondary }}>Catégories configurées</p>
          <p style={{ color: colors.info }}>
            {categories.filter((c: any) => c.active).length} actives
          </p>
          <Link to="/catalog/categories" style={{ display: 'block', marginTop: spacing.md }}>
            Gérer les catégories
          </Link>
        </div>
      </div>
    </div>
  );
}
