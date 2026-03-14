import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Category, Product, ProductAvailability, ProductStatus } from '@depaneuria/types';
import {
  createProduct,
  fetchCategories,
  fetchProducts,
  updateProduct,
  updateProductAvailability,
  updateProductPopularity,
  updateProductStock,
} from '../lib/admin-catalog-api';
import { CatalogToolbar } from '../components/admin/catalog-toolbar';
import { CategoryList } from '../components/admin/category-list';
import { ProductList } from '../components/admin/product-list';
import { ProductForm } from '../components/admin/product-form';
import { TenantSelector } from '../components/admin/tenant-selector';
import { useTenant } from '../lib/use-tenant';
import { useI18n } from '../lib/i18n-context';
import '../styles/admin-catalog.css';

type AvailabilityFilter = ProductAvailability | 'all';
type StatusFilter = ProductStatus | 'all';

export default function AdminCatalogPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [popularOnly, setPopularOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { currentTenantId } = useTenant();

  const categoryLabels = useMemo(() => {
    return categories.reduce<Record<string, string>>((acc, category) => {
      acc[category.id] = category.name;
      return acc;
    }, {});
  }, [categories]);

  const filtersForApi = useMemo(
    () => ({
      categoryId: selectedCategory ?? undefined,
      availability: availabilityFilter === 'all' ? undefined : availabilityFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
      popular: popularOnly ? true : undefined,
      search: search.trim() || undefined,
    }),
    [availabilityFilter, popularOnly, search, selectedCategory, statusFilter]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, prods] = await Promise.all([
        fetchCategories(currentTenantId),
        fetchProducts(filtersForApi, currentTenantId),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.error.loadCatalog'));
    } finally {
      setLoading(false);
    }
  }, [filtersForApi, currentTenantId, t]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const refreshProducts = useCallback(async () => {
    try {
      const updated = await fetchProducts(filtersForApi, currentTenantId);
      setProducts(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.error.refresh'));
    }
  }, [filtersForApi, currentTenantId, t]);

  const handleSubmit = async (payload: Parameters<typeof createProduct>[0], productId?: string) => {
    setSubmitting(true);
    setError(null);
    try {
      if (productId) {
        await updateProduct(productId, payload, currentTenantId);
      } else {
        await createProduct(payload, currentTenantId);
      }
      setEditingProduct(null);
      await refreshProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.error.save'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      const nextStatus: ProductStatus = product.status === 'active' ? 'draft' : 'active';
      await updateProduct(product.id, { status: nextStatus }, currentTenantId);
      await refreshProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.error.status'));
    }
  };

  const handleAvailabilityChange = async (
    product: Product,
    availability: ProductAvailability
  ) => {
    try {
      await updateProductAvailability(product.id, availability, currentTenantId);
      await refreshProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.error.availability'));
    }
  };

  const handlePopularityChange = async (product: Product) => {
    try {
      await updateProductPopularity(product.id, !product.popular, currentTenantId);
      await refreshProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.error.popularity'));
    }
  };

  const handlePriceChange = async (product: Product) => {
    const input = window.prompt(t('admin.error.pricePrompt'), product.price.toFixed(2));
    if (input === null) return;
    const nextPrice = Number(input);
    if (!Number.isFinite(nextPrice) || nextPrice < 0) {
      setError(t('admin.error.priceInvalid'));
      return;
    }
    try {
      await updateProduct(product.id, { price: nextPrice }, currentTenantId);
      await refreshProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.error.priceUpdate'));
    }
  };

  const handleStockChange = async (product: Product) => {
    const stockInput = window.prompt(t('admin.error.stockPrompt'), String(product.stock));
    if (stockInput === null) return;
    const minStockInput = window.prompt(
      t('admin.error.stockMinPrompt'),
      product.minStock ? String(product.minStock) : '0'
    );
    const nextStock = Number(stockInput);
    const nextMinStock =
      minStockInput !== null && minStockInput !== '' ? Number(minStockInput) : undefined;
    if (!Number.isInteger(nextStock) || nextStock < 0) {
      setError(t('admin.error.stockInvalid'));
      return;
    }
    if (nextMinStock !== undefined && (!Number.isInteger(nextMinStock) || nextMinStock < 0)) {
      setError(t('admin.error.stockMinInvalid'));
      return;
    }

    try {
      await updateProductStock(product.id, nextStock, nextMinStock, currentTenantId);
      await refreshProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.error.stockUpdate'));
    }
  };

  return (
    <div className="admin-catalog-page">
      <div className="admin-header">
        <div>
          <p className="eyebrow">{t('admin.header.eyebrow')}</p>
          <h1>{t('admin.header.title')}</h1>
          <p className="muted">{t('admin.header.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <TenantSelector />
          <div className="status-pill active">{t('admin.header.count', { count: products.length })}</div>
        </div>
      </div>

      <CatalogToolbar
        search={search}
        availability={availabilityFilter}
        status={statusFilter}
        popularOnly={popularOnly}
        onChange={(next) => {
          if (next.search !== undefined) setSearch(next.search);
          if (next.availability !== undefined) setAvailabilityFilter(next.availability);
          if (next.status !== undefined) setStatusFilter(next.status);
          if (next.popularOnly !== undefined) setPopularOnly(next.popularOnly);
        }}
        onRefresh={() => void refreshProducts()}
      />

      {error && <div className="alert" role="alert">{error}</div>}
      {loading && <p className="muted">Chargement du catalogue…</p>}

      <div className="admin-grid">
        <CategoryList
          categories={categories}
          selectedCategoryId={selectedCategory}
          onSelect={(id) => setSelectedCategory(id)}
        />

        <div className="admin-panel">
          <h3>Produits</h3>
          <ProductList
            products={products}
            categoryLabels={categoryLabels}
            onEdit={(product) => setEditingProduct(product)}
            onToggleStatus={handleToggleStatus}
            onAvailabilityChange={handleAvailabilityChange}
            onTogglePopular={handlePopularityChange}
            onPriceChange={handlePriceChange}
            onStockChange={handleStockChange}
          />
        </div>

        <ProductForm
          categories={categories}
          initialProduct={editingProduct}
          onSubmit={handleSubmit}
          onCancel={() => setEditingProduct(null)}
          isSubmitting={submitting}
        />
      </div>
    </div>
  );
}
