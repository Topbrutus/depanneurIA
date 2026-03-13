import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { mapOrder } from '../lib/mappers';
import { requireString, requireArray, requirePositiveInt, optionalString } from '../lib/validators';
import { NotFoundError, ValidationError } from '../lib/errors';

const router = Router();

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
      const unitPrice = product.price;
      totalAmount += unitPrice * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
      };
    });

    totalAmount = Math.round(totalAmount * 100) / 100;

    const order = await prisma.order.create({
      data: {
        customerId,
        addressId,
        status: 'soumise',
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

    res.status(201).json({
      success: true,
      data: mapOrder(order),
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

    if (!order) {
      throw new NotFoundError('Commande');
    }

    res.json({
      success: true,
      data: mapOrder(order),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
