import type { OrderStatus } from '@depaneuria/types';
import type { OrderWithDetails } from '../../lib/driver-api';
import { DeliveryStatusBadge } from './delivery-status-badge';
import { getStatusLabels } from './status-labels';
import { DeliveryActions } from './delivery-actions';
import { useI18n } from '../../lib/i18n-context';

interface DeliveryCardProps {
  order: OrderWithDetails;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

const DRIVER_STATUSES: OrderStatus[] = [
  'ready_for_delivery',
  'assigned_to_driver',
  'out_for_delivery',
  'delivered',
  'delivery_failed',
];

function buildStatusTimeline(order: OrderWithDetails) {
  const statusHistory = order.statusHistory ?? {};
  const entries: Array<{ status: OrderStatus; at: string }> = DRIVER_STATUSES.flatMap(
    (status) => {
      const at = statusHistory[status];
      return at ? [{ status, at }] : [];
    }
  );

  const currentTimestamp =
    order.statusChangedAt ??
    statusHistory[order.status] ??
    order.updatedAt ??
    order.createdAt;

  if (currentTimestamp && !entries.some((entry) => entry.status === order.status)) {
    entries.push({ status: order.status, at: currentTimestamp });
  }

  return entries.sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );
}

export function DeliveryCard({ order, onStatusChange }: DeliveryCardProps) {
  const { translations: t } = useI18n();
  const STATUS_LABELS = getStatusLabels(t);

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

  const historyEntries = buildStatusTimeline(order);
  const lastUpdate =
    historyEntries[historyEntries.length - 1]?.at ??
    order.statusChangedAt ??
    order.updatedAt ??
    order.createdAt;

  return (
    <div className="delivery-card">
      <div className="delivery-card-header">
        <div className="delivery-card-id">{t.driver.orderId}{order.id.slice(0, 8)}</div>
        <div className="delivery-card-time">{formatDate(order.createdAt)}</div>
      </div>

      <div className="delivery-card-customer">
        <h3>
          {order.customer?.firstName} {order.customer?.lastName}
        </h3>
        {order.customer?.phone && <p>{t.driver.phone}: {order.customer.phone}</p>}
      </div>

      <div className="delivery-card-address">
        <h4>{t.driver.deliveryAddress}:</h4>
        {order.address && (
          <>
            <p>{order.address.street}</p>
            <p>
              {order.address.postalCode} {order.address.city}
            </p>
            {order.address.deliveryInstructions && (
              <p className="delivery-instructions">
                {t.driver.deliveryInstructions}: {order.address.deliveryInstructions}
              </p>
            )}
          </>
        )}
      </div>

      <div className="delivery-card-items">
        <h4>{t.driver.items} ({order.items.length}):</h4>
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
        <strong>{t.driver.total}: {formatCurrency(order.totalAmount)}</strong>
      </div>

      {order.notes && (
        <div className="delivery-card-notes">
          <h4>{t.driver.notes}:</h4>
          <p>{order.notes}</p>
        </div>
      )}

      <div className="delivery-card-history">
        <div className="history-header">
          <h4>{t.driver.deliveryTracking}</h4>
          <span className="history-last-update">
            {t.driver.lastUpdate} : {formatDate(lastUpdate)}
          </span>
        </div>
        <div className="history-steps">
          {historyEntries.length === 0 ? (
            <span className="history-empty">{t.driver.historyNotAvailable}</span>
          ) : (
            historyEntries.map((entry) => (
              <div
                key={`${entry.status}-${entry.at}`}
                className="history-step"
              >
                <span className="history-step-label">
                  {STATUS_LABELS[entry.status]}
                </span>
                <span className="history-step-time">
                  {formatDate(entry.at)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

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
