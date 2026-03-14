import type { OrderStatus } from '@depaneuria/types';
import { useI18n } from '../../lib/i18n-context';
import type { TranslationKey } from '../../lib/i18n';

interface DeliveryStatusBadgeProps {
  status: OrderStatus;
}

export function DeliveryStatusBadge({ status }: DeliveryStatusBadgeProps) {
  const { t } = useI18n();
  return (
    <span className={`status-badge status-badge-${status}`}>
      {t(`status.${status}` as TranslationKey)}
    </span>
  );
}
