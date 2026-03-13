import { useState } from 'react';
import type { OrderStatus } from '@depaneuria/types';

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
  // prete -> acceptee (prendre en charge)
  // acceptee -> en_route (départ)
  // en_route -> livree (livrée) ou probleme (échec)

  if (currentStatus === 'prete') {
    return (
      <div className="delivery-actions">
        <button
          className="delivery-action-btn accept"
          onClick={() => handleAction('acceptee')}
          disabled={isUpdating}
        >
          Prendre en charge
        </button>
      </div>
    );
  }

  if (currentStatus === 'acceptee') {
    return (
      <div className="delivery-actions">
        <button
          className="delivery-action-btn start"
          onClick={() => handleAction('en_route')}
          disabled={isUpdating}
        >
          Démarrer la livraison
        </button>
      </div>
    );
  }

  if (currentStatus === 'en_route') {
    return (
      <div className="delivery-actions">
        <button
          className="delivery-action-btn delivered"
          onClick={() => handleAction('livree')}
          disabled={isUpdating}
        >
          Marquer livrée
        </button>
        <button
          className="delivery-action-btn problem"
          onClick={() => handleAction('probleme')}
          disabled={isUpdating}
        >
          Signaler un problème
        </button>
      </div>
    );
  }

  // Pas d'action pour les autres statuts
  return null;
}
