import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { mapCategoryWithProducts, mapProduct } from '../lib/mappers';

const router = Router();

/** GET /api/v1/catalog — Liste des catégories avec leurs produits actifs */
router.get('/', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: {
          where: { status: 'active' },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    res.json({
      success: true,
      data: categories.map(mapCategoryWithProducts),
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/v1/catalog/top — Produits populaires */
router.get('/top', async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'active', popular: true },
      orderBy: { displayOrder: 'asc' },
    });

    res.json({
      success: true,
      data: products.map(mapProduct),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
