import type { Category } from '@depaneuria/types';
import { useI18n } from '../../lib/i18n-context';

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
  const { t } = useI18n();
  return (
    <div className="admin-panel">
      <h3>{t('shop.categories.title')}</h3>
      <p className="muted">{t('admin.categories.helper')}</p>
      <div className="divider" />
      <ul className="category-list">
        <li
          className={`category-item ${selectedCategoryId === null ? 'active' : ''}`}
          onClick={() => onSelect(null)}
        >
          {t('store.filter.all')}
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
