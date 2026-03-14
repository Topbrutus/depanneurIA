import type {
  Category as PrismaCategory,
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  Product as PrismaProduct,
} from '@prisma/client';
import type { TenantCategoryWithProducts, TenantOrder, TenantProduct } from '@depaneuria/types';
import { mapCategoryWithProducts, mapOrder, mapProduct } from './mappers';
import { isOrderForTenant, isProductForTenant, orderTenant, productTenant } from './tenant-store';

export function mapProductsForTenant(
  products: PrismaProduct[],
  tenantId: string
): TenantProduct[] {
  return products
    .filter((product) => isProductForTenant(product.slug, tenantId))
    .map((product) => mapProduct(product, tenantId) as TenantProduct);
}

export function mapCategoriesWithProductsForTenant(
  categories: (PrismaCategory & { products: PrismaProduct[] })[],
  tenantId: string
): TenantCategoryWithProducts[] {
  return categories
    .map((category) => {
      const scopedProducts = category.products.filter((product) =>
        isProductForTenant(product.slug, tenantId)
      );
      if (scopedProducts.length === 0) return null;

      return mapCategoryWithProducts(
        { ...category, products: scopedProducts },
        tenantId
      ) as TenantCategoryWithProducts;
    })
    .filter((category): category is TenantCategoryWithProducts => Boolean(category));
}

export function mapOrdersForTenant(
  orders: (PrismaOrder & {
    items: (PrismaOrderItem & { product: { name: string } })[];
    customer?: { firstName: string; lastName: string; phone: string | null } | null;
    address?:
      | {
          street: string;
          city: string;
          postalCode: string;
          notes?: string | null;
        }
      | null;
  })[],
  tenantId: string
): TenantOrder[] {
  return orders
    .filter((order) => isOrderForTenant(order.id, tenantId))
    .map((order) => mapOrder(order) as TenantOrder);
}

export function resolveProductTenant(slug: string): string {
  return productTenant(slug);
}

export function resolveOrderTenant(orderId: string): string {
  return orderTenant(orderId);
}
