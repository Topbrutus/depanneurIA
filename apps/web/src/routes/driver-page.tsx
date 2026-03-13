import { useState, useEffect } from 'react';
import type { OrderStatus } from '@depaneuria/types';
import type { OrderWithDetails } from '../lib/driver-api';
import { fetchDeliveryOrders, updateOrderStatus } from '../lib/driver-api';
import { DeliveryQueue } from '../components/driver/delivery-queue';
import { TenantFilter } from '../components/driver/tenant-filter';
import { useTenant } from '../lib/use-tenant';
import '../styles/driver.css';

type StatusFilter = 'all' | 'ready_for_delivery' | 'assigned_to_driver' | 'out_for_delivery';

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Toutes' },
  { value: 'ready_for_delivery', label: 'Prêtes' },
  { value: 'assigned_to_driver', label: 'Assignées' },
  { value: 'out_for_delivery', label: 'En route' },
];

export function DriverPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { currentTenantId } = useTenant();

  const loadOrders = async (filter: StatusFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      let data: OrderWithDetails[];
      if (filter === 'all') {
        // Charger toutes les commandes pertinentes pour le livreur
        const [ready, assigned, outForDelivery] = await Promise.all([
          fetchDeliveryOrders('ready_for_delivery'),
          fetchDeliveryOrders('assigned_to_driver'),
          fetchDeliveryOrders('out_for_delivery'),
        ]);
        data = [...ready, ...assigned, ...outForDelivery].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        data = await fetchDeliveryOrders(filter as OrderStatus);
      }
      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors du chargement'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(statusFilter);
  }, [statusFilter, currentTenantId]);

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Recharger les commandes après mise à jour
      await loadOrders(statusFilter);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la mise à jour du statut'
      );
    }
  };

  return (
    <div className="driver-page">
      <header className="driver-header">
        <h1>Interface Livreur</h1>
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
