import type { OrderWithDetails } from '../../lib/store-api';
import { OrderStatusBadge } from './order-status-badge';
import { OrderActions } from './order-actions';
import type { OrderStatus } from '@depaneuria/types';
import { useI18n } from '../../lib/i18n-context';

interface OrderCardProps {
  order: OrderWithDetails;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const { t, locale } = useI18n();
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(date);
  };

  const customerName = order.customer
    ? `${order.customer.firstName} ${order.customer.lastName}`
    : t('store.unknown.customer');

  const customerPhone = order.customer?.phone || '';

  const deliveryAddress = order.address
    ? `${order.address.street}, ${order.address.postalCode} ${order.address.city}`
    : t('store.unknown.address');

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div className="order-card-id">#{order.id.slice(0, 8)}</div>
        <div className="order-card-time">{formatTime(order.createdAt)}</div>
      </div>

      <div className="order-card-customer">
        <h3>{customerName}</h3>
        {customerPhone && <p>{customerPhone}</p>}
        <p>{deliveryAddress}</p>
        {order.notes && <p className="order-card-notes">{t('store.notes', { note: order.notes })}</p>}
      </div>

      <div className="order-card-items">
        <h4>{t('store.items.title', { count: order.items.length })}</h4>
        <ul className="order-items-list">
          {order.items.map((item) => (
            <li key={item.id}>
              <span>
                <span className="order-item-name">{item.productName}</span>
                <span className="order-item-qty">× {item.quantity}</span>
              </span>
              <span>{(item.unitPrice * item.quantity).toFixed(2)} $</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="order-card-total">
        <span>{t('store.total')}</span>
        <span>{order.totalAmount.toFixed(2)} $</span>
      </div>

      <div className="order-card-footer">
        <OrderStatusBadge status={order.status as OrderStatus} />
        <OrderActions
          orderId={order.id}
          currentStatus={order.status as OrderStatus}
          onStatusChange={onStatusChange}
        />
      </div>
    </div>
  );
}
