import type { OrderWithDetails } from '../../lib/store-api';
import { OrderCard } from './order-card';
import type { OrderStatus } from '@depaneuria/types';

interface OrderQueueProps {
  orders: OrderWithDetails[];
  isLoading: boolean;
  error: string | null;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

export function OrderQueue({ orders, isLoading, error, onStatusChange }: OrderQueueProps) {
  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="order-queue-empty">
        <p>Aucune commande pour le moment</p>
      </div>
    );
  }

  return (
    <div className="order-queue">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onStatusChange={onStatusChange} />
      ))}
    </div>
  );
}
