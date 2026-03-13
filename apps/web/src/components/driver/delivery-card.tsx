import type { OrderStatus } from '@depaneuria/types';
import type { OrderWithDetails } from '../../lib/driver-api';
import { DeliveryStatusBadge } from './delivery-status-badge';
import { DeliveryActions } from './delivery-actions';

interface DeliveryCardProps {
  order: OrderWithDetails;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

export function DeliveryCard({ order, onStatusChange }: DeliveryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="delivery-card">
      <div className="delivery-card-header">
        <div className="delivery-card-id">Commande #{order.id.slice(0, 8)}</div>
        <div className="delivery-card-time">{formatDate(order.createdAt)}</div>
      </div>

      <div className="delivery-card-customer">
        <h3>
          {order.customer?.firstName} {order.customer?.lastName}
        </h3>
        {order.customer?.phone && <p>Tél: {order.customer.phone}</p>}
      </div>

      <div className="delivery-card-address">
        <h4>Adresse de livraison:</h4>
        {order.address && (
          <>
            <p>{order.address.street}</p>
            <p>
              {order.address.postalCode} {order.address.city}
            </p>
            {order.address.deliveryInstructions && (
              <p className="delivery-instructions">
                Consignes: {order.address.deliveryInstructions}
              </p>
            )}
          </>
        )}
      </div>

      <div className="delivery-card-items">
        <h4>Articles ({order.items.length}):</h4>
        <ul>
          {order.items.map((item) => (
            <li key={item.id}>
              <span className="item-name">{item.productName}</span>
              <span className="item-quantity">× {item.quantity}</span>
              <span className="item-price">{formatCurrency(item.unitPrice)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="delivery-card-total">
        <strong>Total: {formatCurrency(order.totalAmount)}</strong>
      </div>

      {order.notes && (
        <div className="delivery-card-notes">
          <h4>Notes:</h4>
          <p>{order.notes}</p>
        </div>
      )}

      <div className="delivery-card-footer">
        <DeliveryStatusBadge status={order.status} />
        <DeliveryActions
          orderId={order.id}
          currentStatus={order.status}
          onStatusChange={onStatusChange}
        />
      </div>
    </div>
  );
}
