import type {
  CreateProductPayload,
  ProductAvailability,
  ProductFilters,
  ProductStatus,
  UpdateProductPayload,
} from '@depaneuria/types';
import { prisma } from './prisma';
import { NotFoundError, ValidationError } from './errors';
import {
  ensureAvailability,
  ensureBoolean,
  ensureNonNegativeInt,
  ensurePrice,
  ensureSlug,
  ensureStatus,
  ensureString,
  optionalString,
  slugify,
} from './admin-catalog-validators';
import { toCategory, toProduct } from './admin-catalog-mappers';

async function assertCategoryExists(categoryId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    throw new NotFoundError('Catégorie');
  }
}

function buildWhere(filters: ProductFilters) {
  const where: Record<string, unknown> = {};

  if (filters.categoryId) {
    where['categoryId'] = filters.categoryId;
  }

  if (filters.availability) {
    where['availability'] = filters.availability;
  }

  if (filters.status) {
    where['status'] = filters.status;
  }

  if (typeof filters.popular === 'boolean') {
    where['popular'] = filters.popular;
  }

  if (filters.search) {
    where['OR'] = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { slug: { contains: slugify(filters.search), mode: 'insensitive' } },
    ];
  }

  return where;
}

export async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
  });
  return categories.map(toCategory);
}

export async function listProducts(filters: ProductFilters = {}) {
  const where = buildWhere(filters);
  const products = await prisma.product.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  });
  return products.map(toProduct);
}

export async function createProduct(payload: CreateProductPayload) {
  const name = ensureString(payload.name, 'name');
  const slug = ensureSlug(payload.slug, name);
  const categoryId = ensureString(payload.categoryId, 'categoryId');
  const price = ensurePrice(payload.price);
  const unit = ensureString(payload.unit, 'unit');
  const status: ProductStatus = payload.status
    ? ensureStatus(payload.status)
    : 'active';
  const availability: ProductAvailability = payload.availability
    ? ensureAvailability(payload.availability)
    : 'en_stock';
  const description = optionalString(payload.description);
  const imageUrl = optionalString(payload.imageUrl);
  const displayOrder = payload.displayOrder ?? 0;
  const popular = payload.popular ?? false;
  const stock = payload.stock !== undefined ? ensureNonNegativeInt(payload.stock, 'stock') : 0;
  const minStock =
    payload.minStock !== undefined ? ensureNonNegativeInt(payload.minStock, 'minStock') : 0;

  await assertCategoryExists(categoryId);

  try {
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId,
        description,
        price,
        unit,
        imageUrl,
        status,
        availability,
        displayOrder,
        popular,
        stock,
        minStock,
      },
    });
    return toProduct(product);
  } catch (err) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as Record<string, unknown>)['code'] === 'P2002'
    ) {
      throw new ValidationError('Ce slug existe déjà pour un autre produit');
    }
    throw err;
  }
}

export async function updateProduct(productId: string, payload: UpdateProductPayload) {
  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing) {
    throw new NotFoundError('Produit');
  }

  const data: Record<string, unknown> = {};

  if (payload.name !== undefined) {
    data['name'] = ensureString(payload.name, 'name');
  }

  if (payload.slug !== undefined) {
    data['slug'] = ensureSlug(payload.slug, payload.name ?? existing.name);
  }

  if (payload.categoryId !== undefined) {
    const categoryId = ensureString(payload.categoryId, 'categoryId');
    await assertCategoryExists(categoryId);
    data['categoryId'] = categoryId;
  }

  if (payload.description !== undefined) {
    data['description'] = optionalString(payload.description);
  }

  if (payload.imageUrl !== undefined) {
    data['imageUrl'] = optionalString(payload.imageUrl);
  }

  if (payload.price !== undefined) {
    data['price'] = ensurePrice(payload.price);
  }

  if (payload.unit !== undefined) {
    data['unit'] = ensureString(payload.unit, 'unit');
  }

  if (payload.status !== undefined) {
    data['status'] = ensureStatus(payload.status);
  }

  if (payload.availability !== undefined) {
    data['availability'] = ensureAvailability(payload.availability);
  }

  if (payload.displayOrder !== undefined) {
    data['displayOrder'] = ensureNonNegativeInt(payload.displayOrder, 'displayOrder');
  }

  if (payload.popular !== undefined) {
    data['popular'] = ensureBoolean(payload.popular, 'popular');
  }

  if (payload.stock !== undefined) {
    data['stock'] = ensureNonNegativeInt(payload.stock, 'stock');
  }

  if (payload.minStock !== undefined) {
    data['minStock'] = ensureNonNegativeInt(payload.minStock, 'minStock');
  }

  if (Object.keys(data).length === 0) {
    throw new ValidationError('Aucune mise à jour fournie');
  }

  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data,
    });
    return toProduct(product);
  } catch (err) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as Record<string, unknown>)['code'] === 'P2002'
    ) {
      throw new ValidationError('Ce slug existe déjà pour un autre produit');
    }
    throw err;
  }
}

export async function updateAvailability(
  productId: string,
  availability: ProductAvailability
) {
  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: { availability: ensureAvailability(availability) },
    });
    return toProduct(product);
  } catch (err) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as Record<string, unknown>)['code'] === 'P2025'
    ) {
      throw new NotFoundError('Produit');
    }
    throw err;
  }
}

export async function updateStock(
  productId: string,
  stock: number,
  minStock?: number
) {
  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: ensureNonNegativeInt(stock, 'stock'),
        ...(minStock !== undefined
          ? { minStock: ensureNonNegativeInt(minStock, 'minStock') }
          : {}),
      },
    });
    return toProduct(product);
  } catch (err) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as Record<string, unknown>)['code'] === 'P2025'
    ) {
      throw new NotFoundError('Produit');
    }
    throw err;
  }
}

export async function updatePopularity(productId: string, popular: boolean) {
  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: { popular: ensureBoolean(popular, 'popular') },
    });
    return toProduct(product);
  } catch (err) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as Record<string, unknown>)['code'] === 'P2025'
    ) {
      throw new NotFoundError('Produit');
    }
    throw err;
  }
}
