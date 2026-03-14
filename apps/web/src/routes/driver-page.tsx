import { useState, useEffect, useCallback } from 'react';
import type { OrderStatus } from '@depaneuria/types';
import type { OrderWithDetails } from '../lib/driver-api';
import { fetchDeliveryOrders, updateOrderStatus } from '../lib/driver-api';
import { DeliveryQueue } from '../components/driver/delivery-queue';
import { TenantFilter } from '../components/driver/tenant-filter';
import { useTenant } from '../lib/use-tenant';
import { useI18n } from '../lib/i18n-context';
import '../styles/driver.css';

type StatusFilter =
  | 'open'
  | 'ready_for_delivery'
  | 'assigned_to_driver'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_failed';

const OPEN_STATUSES: OrderStatus[] = [
  'ready_for_delivery',
  'assigned_to_driver',
  'out_for_delivery',
];

export function DriverPage() {
  const { translations: t } = useI18n();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open');
  const { currentTenantId } = useTenant();

  const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
    { value: 'open', label: t.driver.filterOpen },
    { value: 'ready_for_delivery', label: t.driver.filterReady },
    { value: 'assigned_to_driver', label: t.driver.filterAssigned },
    { value: 'out_for_delivery', label: t.driver.filterOutForDelivery },
    { value: 'delivered', label: t.driver.filterDelivered },
    { value: 'delivery_failed', label: t.driver.filterFailed },
  ];

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
        err instanceof Error ? err.message : t.driver.loadError
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentTenantId, t.driver.loadError]);

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
          : t.driver.updateError
      );
    }
  };

  return (
    <div className="driver-page">
      <header className="driver-header">
        <h1>{t.driver.pageTitle}</h1>
        <TenantFilter />
      </header>

      <div className="status-filters">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            className={`filter-btn ${statusFilter === filter.value ? 'active' : ''}`}
            onClick={() => setStatusFilter(filter.value)}
          >
            {filter.label}
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
