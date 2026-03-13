import type { OrderStatus } from '@depaneuria/types';
import type { OrderWithDetails } from '../../lib/driver-api';
import { DeliveryCard } from './delivery-card';

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
  if (isLoading) {
    return (
      <div className="delivery-queue-loading">
        <div className="spinner"></div>
        <p>Chargement des livraisons...</p>
      </div>
    );
  }

  if (error) {
    return <div className="delivery-queue-error">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="delivery-queue-empty">
        <p>Aucune livraison disponible pour le moment.</p>
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
