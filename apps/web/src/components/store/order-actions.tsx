import type { OrderStatus } from '@depaneuria/types';
import { useState } from 'react';

interface OrderActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

export function OrderActions({ orderId, currentStatus, onStatusChange }: OrderActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(orderId, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  // Déterminer quelles actions sont disponibles selon le statut actuel
  const canAccept = currentStatus === 'soumise';
  const canReject = currentStatus === 'soumise';
  const canPrepare = currentStatus === 'confirmee';
  const canReady = currentStatus === 'en_preparation';

  return (
    <div className="order-actions">
      {canAccept && (
        <button
          className="order-action-btn accept"
          onClick={() => handleStatusChange('confirmee')}
          disabled={isUpdating}
        >
          Accepter
        </button>
      )}
      {canReject && (
        <button
          className="order-action-btn reject"
          onClick={() => handleStatusChange('annulee')}
          disabled={isUpdating}
        >
          Refuser
        </button>
      )}
      {canPrepare && (
        <button
          className="order-action-btn prepare"
          onClick={() => handleStatusChange('en_preparation')}
          disabled={isUpdating}
        >
          Passer en préparation
        </button>
      )}
      {canReady && (
        <button
          className="order-action-btn ready"
          onClick={() => handleStatusChange('prete')}
          disabled={isUpdating}
        >
          Marquer prête
        </button>
      )}
    </div>
  );
}
