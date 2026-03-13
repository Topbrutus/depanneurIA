export type { ApiResponse, ApiErrorResponse, PaginatedResponse, HealthResponse } from './api.js';
export type {
  Product,
  ProductStatus,
  Category,
  CategoryWithProducts,
} from './catalog.js';
export type {
  Customer,
  CreateCustomerInput,
  Address,
  CreateAddressInput,
} from './customer.js';
export type { OrderStatus, OrderItem, Order, CreateOrderInput } from './order.js';
export { ORDER_STATUSES } from './order.js';
