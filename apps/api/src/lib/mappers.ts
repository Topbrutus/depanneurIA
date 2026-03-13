import type {
  Product as PrismaProduct,
  Category as PrismaCategory,
  Customer as PrismaCustomer,
  Address as PrismaAddress,
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
} from '@prisma/client';
import type { OrderStatusHistory } from '@depaneuria/types';
import { ensureStatus, normalizeStatusHistory } from './order-state-machine';

export function mapProduct(p: PrismaProduct) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    unit: p.unit,
    imageUrl: p.imageUrl,
    status: p.status,
    availability: p.availability,
    stock: p.stock,
    minStock: p.minStock,
    categoryId: p.categoryId,
    displayOrder: p.displayOrder,
    popular: p.popular,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export function mapCategory(c: PrismaCategory) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: c.imageUrl,
    displayOrder: c.displayOrder,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export function mapCategoryWithProducts(
  c: PrismaCategory & { products: PrismaProduct[] }
) {
  return {
    ...mapCategory(c),
    products: c.products.map(mapProduct),
  };
}

export function mapCustomer(c: PrismaCustomer) {
  return {
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export function mapAddress(a: PrismaAddress) {
  return {
    id: a.id,
    customerId: a.customerId,
    label: a.label,
    street: a.street,
    city: a.city,
    postalCode: a.postalCode,
    country: a.country,
    isDefault: a.isDefault,
    notes: a.notes,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

export function mapOrderItem(
  item: PrismaOrderItem & { product: { name: string } }
) {
  return {
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    productName: item.product.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    createdAt: item.createdAt.toISOString(),
  };
}

export function mapOrder(
  o: PrismaOrder & {
    items: (PrismaOrderItem & { product: { name: string } })[];
    customer?: { firstName: string; lastName: string; phone: string | null } | null;
    address?: { street: string; city: string; postalCode: string } | null;
  }
) {
  const status = ensureStatus(o.status);
  const statusHistory = normalizeStatusHistory(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (o as any).statusHistory as OrderStatusHistory | undefined
  );
  const historyWithFallback =
    Object.keys(statusHistory).length > 0
      ? statusHistory
      : { [status]: o.updatedAt.toISOString() };
  const statusChangedAt =
    historyWithFallback[status] ?? o.updatedAt.toISOString();

  return {
    id: o.id,
    customerId: o.customerId,
    addressId: o.addressId,
    status,
    statusHistory: historyWithFallback,
    statusChangedAt,
    totalAmount: o.totalAmount,
    notes: o.notes,
    items: o.items.map(mapOrderItem),
    customer: o.customer || undefined,
    address: o.address || undefined,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}
