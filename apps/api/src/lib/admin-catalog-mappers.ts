import type { Product as PrismaProduct, Category as PrismaCategory } from '@prisma/client';
import { mapCategory, mapCategoryWithProducts, mapProduct } from './mappers';

export function toProduct(product: PrismaProduct, tenantId?: string) {
  return mapProduct(product, tenantId);
}

export function toCategory(category: PrismaCategory, tenantId?: string) {
  return mapCategory(category, tenantId);
}

export function toCategoryWithProducts(
  category: PrismaCategory & { products: PrismaProduct[] },
  tenantId?: string
) {
  return mapCategoryWithProducts(category, tenantId);
}
