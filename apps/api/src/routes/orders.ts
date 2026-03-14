import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { mapOrder } from '../lib/mappers';
import { requireString, requireArray, requirePositiveInt, optionalString } from '../lib/validators';
import { NotFoundError, ValidationError } from '../lib/errors';
import { applyTransition, buildInitialHistory, ensureStatus, normalizeStatusHistory } from '../lib/order-state-machine';
import type { OrderStatus } from '@depaneuria/types';
import { DEFAULT_TENANT_ID } from '@depaneuria/types';
import { isOrderForTenant, isProductForTenant, setOrderTenant } from '../lib/tenant-store';

const router = Router();

/** GET /api/v1/orders — Liste des commandes avec filtre optionnel par statut */
router.get('/', async (req, res, next) => {
  try {
    const statusFilter = req.query['status'] as string | undefined;
    const parsedStatus = statusFilter ? ensureStatus(statusFilter) : undefined;

    const orders = await prisma.order.findMany({
      where: parsedStatus ? { status: parsedStatus } : undefined,
      include: {
        items: {
          include: { product: { select: { name: true } } },
        },
        customer: { select: { firstName: true, lastName: true, phone: true } },
        address: {
          select: { street: true, city: true, postalCode: true, notes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const scopedOrders = orders.filter((order) => isOrderForTenant(order.id, DEFAULT_TENANT_ID));

    res.json({
      success: true,
      data: scopedOrders.map(mapOrder),
      meta: { tenantId: DEFAULT_TENANT_ID },
    });
  } catch (err) {
    next(err);
  }
});

/** POST /api/v1/orders — Créer une commande */
router.post('/', async (req, res, next) => {
  try {
    const customerId = requireString(req.body.customerId, 'customerId');
    const addressId = requireString(req.body.addressId, 'addressId');
    const notes = optionalString(req.body.notes);
    const rawItems = requireArray(req.body.items, 'items');

    // Validate customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundError('Client');
    }

    // Validate address exists and belongs to customer
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });
    if (!address || address.customerId !== customerId) {
      throw new NotFoundError('Adresse');
    }

    // Parse and validate items
    const items: { productId: string; quantity: number }[] = [];
    for (const rawItem of rawItems) {
      const item = rawItem as Record<string, unknown>;
      const productId = requireString(item['productId'], 'items[].productId');
      const quantity = requirePositiveInt(item['quantity'], 'items[].quantity');
      items.push({ productId, quantity });
    }

    // Fetch products and compute total
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'active' },
    });

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missing = productIds.filter((id) => !foundIds.has(id));
      throw new ValidationError(
        `Produits introuvables ou inactifs: ${missing.join(', ')}`
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let totalAmount = 0;
    const orderItemsData = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new ValidationError(`Produit ${item.productId} introuvable`);
      }
      if (!isProductForTenant(product.slug, DEFAULT_TENANT_ID)) {
        throw new ValidationError(`Produit ${product.slug} indisponible pour ce dépanneur`);
      }
      const unitPrice = product.price;
      totalAmount += unitPrice * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
      };
    });

    totalAmount = Math.round(totalAmount * 100) / 100;

    const createdAt = new Date().toISOString();
    const baseHistory = buildInitialHistory('draft', createdAt);
    const initialTransition = applyTransition(
      { status: 'draft', statusHistory: baseHistory },
      'submitted',
      { at: createdAt }
    );

    const order = await prisma.order.create({
      data: {
        customerId,
        addressId,
        status: initialTransition.nextStatus,
        statusHistory: initialTransition.statusHistory,
        totalAmount,
        notes,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: { product: { select: { name: true } } },
        },
      },
    });
    setOrderTenant(order.id, DEFAULT_TENANT_ID);

    res.status(201).json({
      success: true,
      data: mapOrder(order),
      meta: { tenantId: DEFAULT_TENANT_ID },
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/v1/orders/:id — Obtenir une commande */
router.get('/:id', async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params['id'] },
      include: {
        items: {
          include: { product: { select: { name: true } } },
        },
      },
    });

    if (!order || !isOrderForTenant(order.id, DEFAULT_TENANT_ID)) {
      throw new NotFoundError('Commande');
    }

    res.json({
      success: true,
      data: mapOrder(order),
      meta: { tenantId: DEFAULT_TENANT_ID },
    });
  } catch (err) {
    next(err);
  }
});

/** PATCH /api/v1/orders/:id — Mettre à jour le statut d'une commande */
router.patch('/:id', async (req, res, next) => {
  try {
    const orderId = req.params['id'];
    const status = ensureStatus(requireString(req.body.status, 'status'));

    // Vérifier que la commande existe
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existing || !isOrderForTenant(orderId, DEFAULT_TENANT_ID)) {
      throw new NotFoundError('Commande');
    }

    const transition = applyTransition(
      {
        id: existing.id,
        status: ensureStatus(existing.status as string) as OrderStatus,
        statusHistory: normalizeStatusHistory(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (existing as any).statusHistory
        ),
      },
      status,
      { at: new Date().toISOString(), orderId }
    );

    // Mettre à jour le statut
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: transition.nextStatus, statusHistory: transition.statusHistory },
      include: {
        items: {
          include: { product: { select: { name: true } } },
        },
      },
    });

    res.json({
      success: true,
      data: mapOrder(updated),
      meta: { tenantId: DEFAULT_TENANT_ID },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
