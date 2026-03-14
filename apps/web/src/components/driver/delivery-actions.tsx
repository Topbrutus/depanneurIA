import { useState } from 'react';
import type { OrderStatus } from '@depaneuria/types';
import { useI18n } from '../../lib/i18n-context';

interface DeliveryActionsProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
}

export function DeliveryActions({
  orderId,
  currentStatus,
  onStatusChange,
}: DeliveryActionsProps) {
  const { translations: t } = useI18n();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAction = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(orderId, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  // Logique des actions disponibles selon le statut
  // ready_for_delivery -> assigned_to_driver (prendre en charge)
  // assigned_to_driver -> out_for_delivery (départ)
  // out_for_delivery -> delivered ou delivery_failed (échec)

  if (currentStatus === 'ready_for_delivery') {
    return (
      <div className="delivery-actions">
        <button
          className="delivery-action-btn accept"
          onClick={() => handleAction('assigned_to_driver')}
          disabled={isUpdating}
        >
          {t.driver.takeCharge}
        </button>
      </div>
    );
  }

  if (currentStatus === 'assigned_to_driver') {
    return (
      <div className="delivery-actions">
        <button
          className="delivery-action-btn start"
          onClick={() => handleAction('out_for_delivery')}
          disabled={isUpdating}
        >
          {t.driver.startDeliveryButton}
        </button>
      </div>
    );
  }

  if (currentStatus === 'out_for_delivery') {
    return (
      <div className="delivery-actions">
        <button
          className="delivery-action-btn delivered"
          onClick={() => handleAction('delivered')}
          disabled={isUpdating}
        >
          {t.driver.markDelivered}
        </button>
        <button
          className="delivery-action-btn problem"
          onClick={() => handleAction('delivery_failed')}
          disabled={isUpdating}
        >
          {t.driver.reportProblem}
        </button>
      </div>
    );
  }

  // Pas d'action pour les autres statuts
  return null;
}
