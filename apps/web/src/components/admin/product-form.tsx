import { useEffect, useState } from 'react';
import type {
  Category,
  CreateProductPayload,
  Product,
  ProductAvailability,
  ProductStatus,
} from '@depaneuria/types';
import { useI18n } from '../../lib/i18n-context';

interface ProductFormProps {
  categories: Category[];
  initialProduct?: Product | null;
  onSubmit: (payload: CreateProductPayload, productId?: string) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const availabilityOptions: ProductAvailability[] = ['en_stock', 'rupture', 'sur_commande'];
const statusOptions: ProductStatus[] = ['active', 'draft'];

export function ProductForm({
  categories,
  initialProduct,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProductFormProps) {
  const { translations: t } = useI18n();
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<string>('0');
  const [unit, setUnit] = useState('unité');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<ProductStatus>('active');
  const [availability, setAvailability] = useState<ProductAvailability>('en_stock');
  const [displayOrder, setDisplayOrder] = useState<string>('0');
  const [popular, setPopular] = useState(false);
  const [stock, setStock] = useState<string>('0');
  const [minStock, setMinStock] = useState<string>('0');

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setCategoryId(initialProduct.categoryId);
      setPrice(String(initialProduct.price));
      setUnit(initialProduct.unit);
      setDescription(initialProduct.description ?? '');
      setImageUrl(initialProduct.imageUrl ?? '');
      setStatus(initialProduct.status);
      setAvailability(initialProduct.availability);
      setDisplayOrder(String(initialProduct.displayOrder));
      setPopular(initialProduct.popular);
      setStock(String(initialProduct.stock));
      setMinStock(String(initialProduct.minStock));
    } else {
      setName('');
      setCategoryId(categories[0]?.id ?? '');
      setPrice('0');
      setUnit('unité');
      setDescription('');
      setImageUrl('');
      setStatus('active');
      setAvailability('en_stock');
      setDisplayOrder('0');
      setPopular(false);
      setStock('0');
      setMinStock('0');
    }
  }, [initialProduct, categories]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: CreateProductPayload = {
      name: name.trim(),
      categoryId,
      price: Number(price),
      unit: unit.trim(),
      description: description.trim() || null,
      imageUrl: imageUrl.trim() || null,
      status,
      availability,
      displayOrder: Number(displayOrder),
      popular,
      stock: Number(stock),
      minStock: Number(minStock),
    };
    await onSubmit(payload, initialProduct?.id);
  };

  return (
    <form className="admin-panel" onSubmit={handleSubmit}>
      <h3>{initialProduct ? t.admin.editProductTitle : t.admin.newProduct}</h3>
      <p className="muted">
        {t.admin.formDescription}
      </p>

      <div className="divider" />

      <div className="form-grid">
        <div className="form-field full">
          <label htmlFor="name">{t.admin.nameLabel}</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="category">{t.admin.categoryLabel}</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="price">{t.admin.priceLabel}</label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="unit">{t.admin.unitLabel}</label>
          <input
            id="unit"
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="status">{t.admin.statusLabel}</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'active' ? t.admin.active : t.admin.draft}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="availability">{t.admin.availabilityLabel}</label>
          <select
            id="availability"
            value={availability}
            onChange={(e) => setAvailability(e.target.value as ProductAvailability)}
          >
            {availabilityOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'en_stock'
                  ? t.admin.inStock
                  : option === 'rupture'
                  ? t.admin.outOfStock
                  : t.admin.onOrder}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="stock">{t.admin.stockLabel}</label>
          <input
            id="stock"
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="minStock">{t.admin.minStockLabel}</label>
          <input
            id="minStock"
            type="number"
            min="0"
            step="1"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="displayOrder">{t.admin.displayOrder}</label>
          <input
            id="displayOrder"
            type="number"
            min="0"
            step="1"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="popular">{t.admin.popularLabel}</label>
          <select
            id="popular"
            value={popular ? 'true' : 'false'}
            onChange={(e) => setPopular(e.target.value === 'true')}
          >
            <option value="false">{t.admin.no}</option>
            <option value="true">{t.admin.yes}</option>
          </select>
        </div>

        <div className="form-field full">
          <label htmlFor="description">{t.admin.descriptionLabel}</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.admin.descriptionPlaceholder}
          />
        </div>

        <div className="form-field full">
          <label htmlFor="imageUrl">{t.admin.imageLabel}</label>
          <input
            id="imageUrl"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder={t.admin.imagePlaceholder}
          />
        </div>
      </div>

      <div className="form-actions">
        {initialProduct && (
          <button type="button" className="admin-btn ghost" onClick={onCancel} disabled={isSubmitting}>
            {t.admin.cancelButton}
          </button>
        )}
        <button type="submit" className="admin-btn" disabled={isSubmitting}>
          {initialProduct ? t.admin.saveButton : t.admin.createButton}
        </button>
      </div>
    </form>
  );
}
