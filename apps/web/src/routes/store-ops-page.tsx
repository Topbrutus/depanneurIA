import { useCallback, useEffect, useState } from 'react';
import type { OrderStatus } from '@depaneuria/types';
import { fetchOrders, updateOrderStatus, type OrderWithDetails } from '../lib/store-api';
import { OrderQueue } from '../components/store/order-queue';
import { TenantFilter } from '../components/store/tenant-filter';
import { useTenant } from '../lib/use-tenant';
import { useI18n } from '../lib/i18n-context';
import type { TranslationKey } from '../lib/i18n';
import '../styles/store.css';

type StatusFilter = OrderStatus | 'all';

const FILTER_OPTIONS: StatusFilter[] = ['all', 'submitted', 'accepted', 'preparing', 'ready_for_delivery'];

export default function StoreOpsPage() {
  const { t } = useI18n();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { currentTenantId } = useTenant();

  const loadOrders = useCallback(async (filter: StatusFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOrders(filter === 'all' ? undefined : filter, currentTenantId);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('store.error.load'));
    } finally {
      setIsLoading(false);
    }
  }, [currentTenantId, t]);

  useEffect(() => {
    loadOrders(statusFilter);
  }, [loadOrders, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, currentTenantId);
      // Recharger les commandes après la mise à jour
      await loadOrders(statusFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('store.error.update'));
    }
  };

  return (
    <div className="store-ops-page">
      <div className="store-ops-header">
        <h1>{t('store.header.title')}</h1>
        <p>{t('store.header.subtitle')}</p>
        <TenantFilter />
      </div>

      <div className="status-filters">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option}
            className={`filter-btn ${statusFilter === option ? 'active' : ''}`}
            onClick={() => setStatusFilter(option)}
          >
            {option === 'all' ? t('store.filter.all') : t(`status.${option}` as TranslationKey)}
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
