import type { OrderStatus } from '@depaneuria/types';
import type { OrderWithDetails } from '../../lib/driver-api';
import { DeliveryCard } from './delivery-card';
import { useI18n } from '../../lib/i18n-context';

interface DeliveryQueueProps {
  orders: OrderWithDetails[];
  isLoading: boolean;
  error: string | null;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

export function DeliveryQueue({
  orders,
  isLoading,
  error,
  onStatusChange,
}: DeliveryQueueProps) {
  const { t } = useI18n();
  if (isLoading) {
    return (
      <div className="delivery-queue-loading">
        <div className="spinner"></div>
        <p>{t('driver.loading')}</p>
      </div>
    );
  }

  if (error) {
    return <div className="delivery-queue-error">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="delivery-queue-empty">
        <p>{t('driver.empty')}</p>
      </div>
    );
  }

  return (
    <div className="delivery-queue">
      {orders.map((order) => (
        <DeliveryCard
          key={order.id}
          order={order}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
