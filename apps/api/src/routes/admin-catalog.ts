import { Router } from 'express';
import type {
  CreateProductPayload,
  ProductFilters,
  ProductStatus,
  UpdateProductPayload,
} from '@depaneuria/types';
import {
  createProduct,
  listCategories,
  listProducts,
  updateAvailability,
  updatePopularity,
  updateProduct,
  updateStock,
} from '../lib/admin-catalog-store';
import {
  ensureAvailability,
  ensureBoolean,
  ensureNonNegativeInt,
  ensureStatus,
} from '../lib/admin-catalog-validators';

const router = Router();

function parseFilters(query: Record<string, unknown>): ProductFilters {
  const filters: ProductFilters = {};

  if (typeof query['categoryId'] === 'string') {
    filters.categoryId = query['categoryId'];
  }

  if (typeof query['availability'] === 'string') {
    filters.availability = ensureAvailability(query['availability']);
  }

  if (typeof query['status'] === 'string') {
    filters.status = ensureStatus(query['status']) as ProductStatus;
  }

  if (typeof query['popular'] === 'string') {
    filters.popular = query['popular'].toLowerCase() === 'true';
  }

  if (typeof query['search'] === 'string' && query['search'].trim().length > 0) {
    filters.search = query['search'].trim();
  }

  return filters;
}

/** GET /admin/catalog/categories — Liste des catégories */
router.get('/categories', async (_req, res, next) => {
  try {
    const categories = await listCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

/** GET /admin/catalog/products — Liste des produits avec filtres */
router.get('/products', async (req, res, next) => {
  try {
    const filters = parseFilters(req.query);
    const products = await listProducts(filters);
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
});

/** POST /admin/catalog/products — Créer un produit */
router.post('/products', async (req, res, next) => {
  try {
    const payload = req.body as CreateProductPayload;
    const product = await createProduct(payload);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

/** PATCH /admin/catalog/products/:id — Mettre à jour un produit */
router.patch('/products/:id', async (req, res, next) => {
  try {
    const payload = req.body as UpdateProductPayload;
    const product = await updateProduct(req.params['id'], payload);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

/** PATCH /admin/catalog/products/:id/availability — Mettre à jour la disponibilité */
router.patch('/products/:id/availability', async (req, res, next) => {
  try {
    const availability = ensureAvailability(req.body?.availability);
    const product = await updateAvailability(req.params['id'], availability);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

/** PATCH /admin/catalog/products/:id/stock — Mettre à jour stock/minimum */
router.patch('/products/:id/stock', async (req, res, next) => {
  try {
    const stock = ensureNonNegativeInt(req.body?.stock, 'stock');
    const minStock =
      req.body?.minStock !== undefined
        ? ensureNonNegativeInt(req.body?.minStock, 'minStock')
        : undefined;
    const product = await updateStock(req.params['id'], stock, minStock);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

/** PATCH /admin/catalog/products/:id/popularity — Marquer populaire/top */
router.patch('/products/:id/popularity', async (req, res, next) => {
  try {
    const popular = ensureBoolean(req.body?.popular, 'popular');
    const product = await updatePopularity(req.params['id'], popular);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

export default router;
