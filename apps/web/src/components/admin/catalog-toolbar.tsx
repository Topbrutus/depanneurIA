import type { ProductAvailability, ProductStatus } from '@depaneuria/types';

interface CatalogToolbarProps {
  search: string;
  availability: ProductAvailability | 'all';
  status: ProductStatus | 'all';
  popularOnly: boolean;
  onChange: (next: {
    search?: string;
    availability?: ProductAvailability | 'all';
    status?: ProductStatus | 'all';
    popularOnly?: boolean;
  }) => void;
  onRefresh: () => void;
}

export function CatalogToolbar({
  search,
  availability,
  status,
  popularOnly,
  onChange,
  onRefresh,
}: CatalogToolbarProps) {
  return (
    <div className="catalog-toolbar">
      <input
        type="search"
        placeholder="Rechercher par nom, description, slug…"
        value={search}
        onChange={(e) => onChange({ search: e.target.value })}
      />

      <select
        value={availability}
        onChange={(e) =>
          onChange({ availability: e.target.value as ProductAvailability | 'all' })
        }
      >
        <option value="all">Toutes les disponibilités</option>
        <option value="en_stock">En stock</option>
        <option value="sur_commande">Sur commande</option>
        <option value="rupture">Rupture</option>
      </select>

      <select
        value={status}
        onChange={(e) => onChange({ status: e.target.value as ProductStatus | 'all' })}
      >
        <option value="all">Tous les statuts</option>
        <option value="active">Actif</option>
        <option value="draft">Brouillon</option>
      </select>

      <div className="toolbar-actions">
        <label className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={popularOnly}
            onChange={(e) => onChange({ popularOnly: e.target.checked })}
          />
          Populaires
        </label>

        <button className="admin-btn secondary" type="button" onClick={onRefresh}>
          Rafraîchir
        </button>
      </div>
    </div>
  );
}
