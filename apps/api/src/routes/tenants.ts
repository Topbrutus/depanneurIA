import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { listTenants } from '../lib/tenant-store';
import { resolveTenant, tenantId } from '../lib/tenant-context';
import { mapCategoryWithProducts, mapOrder } from '../lib/mappers';
import { requireString, requireArray, requirePositiveInt, optionalString } from '../lib/validators';
import { NotFoundError, ValidationError } from '../lib/errors';
import {
  applyTransition,
  buildInitialHistory,
  ensureStatus,
  normalizeStatusHistory,
} from '../lib/order-state-machine';
import {
  listCategories as adminListCategories,
  listProducts as adminListProducts,
  updateProduct as adminUpdateProduct,
} from '../lib/admin-catalog-store';
import type { ProductFilters, ProductStatus, OrderStatus, UpdateProductPayload } from '@depaneuria/types';
import {
  ensureAvailability,
  ensureStatus as ensureProductStatus,
} from '../lib/admin-catalog-validators';

const router = Router();

/* ──────────────── GET /tenants ──────────────── */
router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: listTenants(),
  });
});

/* ────── Toutes les sous-routes nécessitent un tenant valide ────── */
router.use('/:tenantId', resolveTenant);

/* ──────────────── GET /tenants/:tenantId/catalog ──────────────── */
router.get('/:tenantId/catalog', async (_req, res, next) => {
  try {
    const _tid = tenantId(res);

    const categories = await prisma.category.findMany({
      include: {
        products: {
          where: { status: 'active', availability: { not: 'rupture' } },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    res.json({
      success: true,
      data: categories.map(mapCategoryWithProducts),
      meta: { tenantId: _tid },
    });
  } catch (err) {
    next(err);
  }
});

/* ──────────────── GET /tenants/:tenantId/orders ──────────────── */
router.get('/:tenantId/orders', async (req, res, next) => {
  try {
    const _tid = tenantId(res);
    const statusFilter = req.query['status'] as string | undefined;
    const parsedStatus = statusFilter ? ensureStatus(statusFilter) : undefined;

    const orders = await prisma.order.findMany({
      where: parsedStatus ? { status: parsedStatus } : undefined,
      include: {
        items: { include: { product: { select: { name: true } } } },
        customer: { select: { firstName: true, lastName: true, phone: true } },
        address: { select: { street: true, city: true, postalCode: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: orders.map(mapOrder),
      meta: { tenantId: _tid },
    });
  } catch (err) {
    next(err);
  }
});

/* ──────────────── POST /tenants/:tenantId/orders ──────────────── */
router.post('/:tenantId/orders', async (req, res, next) => {
  try {
    const _tid = tenantId(res);
    const customerId = requireString(req.body.customerId, 'customerId');
    const addressId = requireString(req.body.addressId, 'addressId');
    const notes = optionalString(req.body.notes);
    const rawItems = requireArray(req.body.items, 'items');

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundError('Client');

    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.customerId !== customerId) throw new NotFoundError('Adresse');

    const items: { productId: string; quantity: number }[] = [];
    for (const rawItem of rawItems) {
      const item = rawItem as Record<string, unknown>;
      items.push({
        productId: requireString(item['productId'], 'items[].productId'),
        quantity: requirePositiveInt(item['quantity'], 'items[].quantity'),
      });
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'active' },
    });

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missing = productIds.filter((id) => !foundIds.has(id));
      throw new ValidationError(`Produits introuvables ou inactifs: ${missing.join(', ')}`);
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let totalAmount = 0;
    const orderItemsData = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new ValidationError(`Produit ${item.productId} introuvable`);
      const unitPrice = product.price;
      totalAmount += unitPrice * item.quantity;
      return { productId: item.productId, quantity: item.quantity, unitPrice };
    });
    totalAmount = Math.round(totalAmount * 100) / 100;

    const createdAt = new Date().toISOString();
    const baseHistory = buildInitialHistory('draft', createdAt);
    const initialTransition = applyTransition(
      { status: 'draft', statusHistory: baseHistory },
      'submitted',
      { at: createdAt },
    );

    const order = await prisma.order.create({
      data: {
        customerId,
        addressId,
        status: initialTransition.nextStatus,
        statusHistory: initialTransition.statusHistory,
        totalAmount,
        notes,
        items: { create: orderItemsData },
      },
      include: { items: { include: { product: { select: { name: true } } } } },
    });

    res.status(201).json({
      success: true,
      data: mapOrder(order),
      meta: { tenantId: _tid },
    });
  } catch (err) {
    next(err);
  }
});

/* ──────── GET /tenants/:tenantId/admin/catalog/products ──────── */
router.get('/:tenantId/admin/catalog/products', async (req, res, next) => {
  try {
    const _tid = tenantId(res);
    const filters: ProductFilters = {};

    if (typeof req.query['categoryId'] === 'string') filters.categoryId = req.query['categoryId'];
    if (typeof req.query['availability'] === 'string')
      filters.availability = ensureAvailability(req.query['availability']);
    if (typeof req.query['status'] === 'string')
      filters.status = ensureProductStatus(req.query['status']) as ProductStatus;
    if (typeof req.query['popular'] === 'string')
      filters.popular = req.query['popular'].toLowerCase() === 'true';
    if (typeof req.query['search'] === 'string' && req.query['search'].trim().length > 0)
      filters.search = req.query['search'].trim();

    const products = await adminListProducts(filters);

    res.json({
      success: true,
      data: products,
      meta: { tenantId: _tid },
    });
  } catch (err) {
    next(err);
  }
});

/* ──── PATCH /tenants/:tenantId/admin/catalog/products/:id ──── */
router.patch('/:tenantId/admin/catalog/products/:id', async (req, res, next) => {
  try {
    const _tid = tenantId(res);
    const payload = req.body as UpdateProductPayload;
    const product = await adminUpdateProduct(req.params['id'], payload);

    res.json({
      success: true,
      data: product,
      meta: { tenantId: _tid },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
