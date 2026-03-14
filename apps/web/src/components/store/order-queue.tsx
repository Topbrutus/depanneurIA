import type { OrderWithDetails } from '../../lib/store-api';
import { OrderCard } from './order-card';
import type { OrderStatus } from '@depaneuria/types';
import { useI18n } from '../../lib/i18n-context';

interface OrderQueueProps {
  orders: OrderWithDetails[];
  isLoading: boolean;
  error: string | null;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

export function OrderQueue({ orders, isLoading, error, onStatusChange }: OrderQueueProps) {
  const { translations: t } = useI18n();

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
        <p>{t.store.noOrdersMessage}</p>
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
