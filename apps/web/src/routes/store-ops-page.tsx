import { useEffect, useState } from 'react';
import type { OrderStatus } from '@depaneuria/types';
import { fetchOrders, updateOrderStatus, type OrderWithDetails } from '../lib/store-api';
import { OrderQueue } from '../components/store/order-queue';
import { TenantFilter } from '../components/store/tenant-filter';
import { useTenant } from '../lib/use-tenant';
import '../styles/store.css';

type StatusFilter = OrderStatus | 'all';

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'submitted', label: 'Soumises' },
  { value: 'accepted', label: 'Acceptées' },
  { value: 'preparing', label: 'En préparation' },
  { value: 'ready_for_delivery', label: 'Prêtes' },
];

export default function StoreOpsPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { currentTenantId } = useTenant();

  const loadOrders = async (filter: StatusFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchOrders(filter === 'all' ? undefined : filter);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des commandes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(statusFilter);
  }, [statusFilter, currentTenantId]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Recharger les commandes après la mise à jour
      await loadOrders(statusFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut');
    }
  };

  return (
    <div className="store-ops-page">
      <div className="store-ops-header">
        <h1>Gestion des commandes</h1>
        <p>Acceptez, préparez et gérez les commandes entrantes</p>
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
