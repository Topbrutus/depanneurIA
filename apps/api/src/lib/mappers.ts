import type {
  Product as PrismaProduct,
  Category as PrismaCategory,
  Customer as PrismaCustomer,
  Address as PrismaAddress,
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
} from '@prisma/client';

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
  }
) {
  return {
    id: o.id,
    customerId: o.customerId,
    addressId: o.addressId,
    status: o.status,
    totalAmount: o.totalAmount,
    notes: o.notes,
    items: o.items.map(mapOrderItem),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}
