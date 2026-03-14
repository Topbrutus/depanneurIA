import { useCallback, useEffect, useState } from 'react';
import type { OrderStatus } from '@depaneuria/types';
import { fetchOrders, updateOrderStatus, type OrderWithDetails } from '../lib/store-api';
import { OrderQueue } from '../components/store/order-queue';
import { TenantFilter } from '../components/store/tenant-filter';
import { useTenant } from '../lib/use-tenant';
import { useI18n } from '../lib/i18n-context';
import '../styles/store.css';

type StatusFilter = OrderStatus | 'all';

export default function StoreOpsPage() {
  const { translations: t } = useI18n();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { currentTenantId } = useTenant();

  const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: t.store.filterAll },
    { value: 'submitted', label: t.store.filterSubmitted },
    { value: 'accepted', label: t.store.filterAccepted },
    { value: 'preparing', label: t.store.filterPreparing },
    { value: 'ready_for_delivery', label: t.store.filterReady },
  ];

  const loadOrders = useCallback(async (filter: StatusFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOrders(filter === 'all' ? undefined : filter, currentTenantId);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.store.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [currentTenantId, t.store.loadError]);

  useEffect(() => {
    loadOrders(statusFilter);
  }, [loadOrders, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, currentTenantId);
      // Recharger les commandes après la mise à jour
      await loadOrders(statusFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.store.updateError);
    }
  };

  return (
    <div className="store-ops-page">
      <div className="store-ops-header">
        <h1>{t.store.pageTitle}</h1>
        <p>{t.store.pageDescription}</p>
        <TenantFilter />
      </div>

      <div className="status-filters">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={`filter-btn ${statusFilter === option.value ? 'active' : ''}`}
            onClick={() => setStatusFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <OrderQueue
        orders={orders}
        isLoading={isLoading}
        error={error}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
