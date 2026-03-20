import React, { useState } from 'react';
import { SearchInput, ProductCard, spacing, Top10Card } from '@depaneuria/ui';
import { mockProducts, mockCategories, mockTopProducts } from '../lib/mock-data';
import { useAppContext } from '../lib/AppContext';
import { Link } from 'react-router-dom';

export function Shop() {
  const { addToCart } = useAppContext();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<string | null>(null);

  const filtered = mockProducts.filter((p) => {
    if (cat && p.categoryId !== cat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.lg,
        }}
      >
        <h1 style={{ margin: 0 }}>Boutique</h1>
        <div style={{ display: 'flex', gap: spacing.sm }}>
          <Link to="/shop/popular">Top Produits</Link>
          <Link to="/shop/last-order">Dernière commande</Link>
        </div>
      </div>

      {!search && !cat && <Top10Card products={mockTopProducts} onAdd={addToCart} />}

      <div style={{ marginBottom: spacing.md }}>
        <SearchInput
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Rechercher chips, bière..."
        />
      </div>

      <div
        style={{
          display: 'flex',
          gap: spacing.sm,
          marginBottom: spacing.lg,
          overflowX: 'auto',
          paddingBottom: spacing.xs,
        }}
      >
        <button
          onClick={() => setCat(null)}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: cat === null ? '2px solid #2563EB' : '1px solid #ccc',
            cursor: 'pointer',
          }}
        >
          Tous
        </button>
        {mockCategories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: cat === c.id ? '2px solid #2563EB' : '1px solid #ccc',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: spacing.md,
        }}
      >
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} onAdd={addToCart} />
        ))}
      </div>
      {filtered.length === 0 && <p>Aucun produit trouvé.</p>}
    </div>
  );
}
