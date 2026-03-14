import { useState, useEffect, useCallback } from 'react';
import type { OrderStatus } from '@depaneuria/types';
import type { OrderWithDetails } from '../lib/driver-api';
import { fetchDeliveryOrders, updateOrderStatus } from '../lib/driver-api';
import { DeliveryQueue } from '../components/driver/delivery-queue';
import { TenantFilter } from '../components/driver/tenant-filter';
import { useTenant } from '../lib/use-tenant';
import { useI18n } from '../lib/i18n-context';
import type { TranslationKey } from '../lib/i18n';
import '../styles/driver.css';

type StatusFilter =
  | 'open'
  | 'ready_for_delivery'
  | 'assigned_to_driver'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_failed';

const STATUS_FILTERS: StatusFilter[] = [
  'open',
  'ready_for_delivery',
  'assigned_to_driver',
  'out_for_delivery',
  'delivered',
  'delivery_failed',
];

const OPEN_STATUSES: OrderStatus[] = [
  'ready_for_delivery',
  'assigned_to_driver',
  'out_for_delivery',
];

export function DriverPage() {
  const { t } = useI18n();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open');
  const { currentTenantId } = useTenant();

  const loadOrders = useCallback(async (filter: StatusFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      let data: OrderWithDetails[];
      if (filter === 'open') {
        const lists = await Promise.all(
          OPEN_STATUSES.map((status) => fetchDeliveryOrders(status, currentTenantId))
        );
        data = lists.flat();
      } else {
        data = await fetchDeliveryOrders(filter, currentTenantId);
      }
      const sortedByRecent = [...data].sort(
        (a, b) =>
          new Date(b.statusChangedAt ?? b.updatedAt ?? b.createdAt).getTime() -
          new Date(a.statusChangedAt ?? a.updatedAt ?? a.createdAt).getTime()
      );
      setOrders(sortedByRecent);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('driver.error.load')
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentTenantId, t]);

  useEffect(() => {
    loadOrders(statusFilter);
  }, [loadOrders, statusFilter]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      setError(null);
      await updateOrderStatus(orderId, newStatus, currentTenantId);
      // Recharger les commandes après mise à jour
      await loadOrders(statusFilter);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('driver.error.update')
      );
    }
  };

  return (
    <div className="driver-page">
      <header className="driver-header">
        <h1>{t('driver.header.title')}</h1>
        <TenantFilter />
      </header>

      <div className="status-filters">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter}
            className={`filter-btn ${statusFilter === filter ? 'active' : ''}`}
            onClick={() => setStatusFilter(filter)}
          >
            {filter === 'open'
              ? t('driver.filter.open')
              : t(`status.${filter}` as TranslationKey)}
          </button>
        ))}
      </div>

      <DeliveryQueue
        orders={orders}
        isLoading={isLoading}
        error={error}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
