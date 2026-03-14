import type { OrderStatus } from '@depaneuria/types';
import { useState } from 'react';
import { useI18n } from '../../lib/i18n-context';

interface OrderActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

export function OrderActions({ orderId, currentStatus, onStatusChange }: OrderActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { t } = useI18n();

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(orderId, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  // Déterminer quelles actions sont disponibles selon le statut actuel
  const canAccept = currentStatus === 'submitted';
  const canReject = currentStatus === 'submitted';
  const canPrepare = currentStatus === 'accepted';
  const canReady = currentStatus === 'preparing';

  return (
    <div className="order-actions">
      {canAccept && (
        <button
          className="order-action-btn accept"
          onClick={() => handleStatusChange('accepted')}
          disabled={isUpdating}
        >
          {t('store.actions.accept')}
        </button>
      )}
      {canReject && (
        <button
          className="order-action-btn reject"
          onClick={() => handleStatusChange('rejected')}
          disabled={isUpdating}
        >
          {t('store.actions.reject')}
        </button>
      )}
      {canPrepare && (
        <button
          className="order-action-btn prepare"
          onClick={() => handleStatusChange('preparing')}
          disabled={isUpdating}
        >
          {t('store.actions.prepare')}
        </button>
      )}
      {canReady && (
        <button
          className="order-action-btn ready"
          onClick={() => handleStatusChange('ready_for_delivery')}
          disabled={isUpdating}
        >
          {t('store.actions.ready')}
        </button>
      )}
    </div>
  );
}
