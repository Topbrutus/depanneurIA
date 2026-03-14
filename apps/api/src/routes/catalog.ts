import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { DEFAULT_TENANT_ID } from '@depaneuria/types';
import { mapCategoriesWithProductsForTenant, mapProductsForTenant } from '../lib/tenant-mappers';

const router = Router();

/** GET /api/v1/catalog — Liste des catégories avec leurs produits actifs */
router.get('/', async (_req, res, next) => {
  try {
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
      data: mapCategoriesWithProductsForTenant(categories, DEFAULT_TENANT_ID),
      meta: { tenantId: DEFAULT_TENANT_ID },
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/v1/catalog/top — Produits populaires */
router.get('/top', async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        popular: true,
        availability: { not: 'rupture' },
      },
      orderBy: { displayOrder: 'asc' },
    });

    res.json({
      success: true,
      data: mapProductsForTenant(products, DEFAULT_TENANT_ID),
      meta: { tenantId: DEFAULT_TENANT_ID },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
