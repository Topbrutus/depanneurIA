import type { Category } from '@depaneuria/types';

interface CategoryListProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string | null) => void;
}

export function CategoryList({
  categories,
  selectedCategoryId,
  onSelect,
}: CategoryListProps) {
  return (
    <div className="admin-panel">
      <h3>Catégories</h3>
      <p className="muted">Filtrez la liste des produits par catégorie.</p>
      <div className="divider" />
      <ul className="category-list">
        <li
          className={`category-item ${selectedCategoryId === null ? 'active' : ''}`}
          onClick={() => onSelect(null)}
        >
          Toutes
        </li>
        {categories.map((category) => (
          <li
            key={category.id}
            className={`category-item ${selectedCategoryId === category.id ? 'active' : ''}`}
            onClick={() => onSelect(category.id)}
          >
            {category.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
