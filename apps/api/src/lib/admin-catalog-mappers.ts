import type { Product as PrismaProduct, Category as PrismaCategory } from '@prisma/client';
import { mapCategory, mapCategoryWithProducts, mapProduct } from './mappers';

export function toProduct(product: PrismaProduct) {
  return mapProduct(product);
}

export function toCategory(category: PrismaCategory) {
  return mapCategory(category);
}

export function toCategoryWithProducts(
  category: PrismaCategory & { products: PrismaProduct[] }
) {
  return mapCategoryWithProducts(category);
}
