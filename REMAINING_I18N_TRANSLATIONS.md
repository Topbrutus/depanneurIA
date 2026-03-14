# Remaining I18N Translations

This document lists all remaining component translations needed. All i18n types and translations (fr.ts, en.ts) have been updated.

## Completed Components

### Assistant Components
- ✅ assistant-panel.tsx
- ✅ assistant-input.tsx
- ✅ voice-button.tsx
- ✅ voice-status.tsx

### Store Components
- ✅ store-ops-page.tsx
- ✅ order-queue.tsx
- ✅ order-card.tsx
- ✅ order-actions.tsx
- ✅ order-status-badge.tsx
- ✅ tenant-filter.tsx (store)

## Remaining Translations

### Driver Page - /apps/web/src/routes/driver-page.tsx

Add at top:
```typescript
import { useI18n } from '../lib/i18n-context';
```

Inside component, add:
```typescript
const { translations: t } = useI18n();
```

Replace:
- Line 18-25: Replace STATUS_FILTERS array with:
```typescript
const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'open', label: t.driver.filterOpen },
  { value: 'ready_for_delivery', label: t.driver.filterReady },
  { value: 'assigned_to_driver', label: t.driver.filterAssigned },
  { value: 'out_for_delivery', label: t.driver.filterOutForDelivery },
  { value: 'delivered', label: t.driver.filterDelivered },
  { value: 'delivery_failed', label: t.driver.filterFailed },
];
```

- Line 61: `'Erreur lors du chargement'` → `t.driver.loadError`
- Line 84: `'Erreur lors de la mise à jour du statut'` → `t.driver.updateError`
- Line 93: `<h1>Interface Livreur</h1>` → `<h1>{t.driver.pageTitle}</h1>`

### Driver Components

#### /apps/web/src/components/driver/delivery-queue.tsx
Add imports and useI18n, replace:
- Line 22: `'Chargement des livraisons...'` → `{t.driver.loadingDeliveries}`
- Line 34: `'Aucune livraison disponible pour le moment.'` → `{t.driver.noDeliveriesMessage}`

#### /apps/web/src/components/driver/delivery-card.tsx
Add imports and useI18n, replace:
- Line 73: `'Commande #'` → `{t.driver.orderId}`
- Line 81: `'Tél: '` → `{t.driver.phone}: `
- Line 85: `<h4>Adresse de livraison:</h4>` → `<h4>{t.driver.deliveryAddress}:</h4>`
- Line 93: `'Consignes: '` → `{t.driver.deliveryInstructions}: `
- Line 102: `<h4>Articles ({order.items.length}):</h4>` → `<h4>{t.driver.items} ({order.items.length}):</h4>`
- Line 115: `<strong>Total: ` → `<strong>{t.driver.total}: `
- Line 120: `<h4>Notes:</h4>` → `<h4>{t.driver.notes}:</h4>`
- Line 127: `<h4>Suivi livraison</h4>` → `<h4>{t.driver.deliveryTracking}</h4>`
- Line 129: `'Dernière mise à jour : '` → `{t.driver.lastUpdate}: `
- Line 134: `'Historique indisponible.'` → `{t.driver.historyNotAvailable}`

#### /apps/web/src/components/driver/delivery-actions.tsx
Add imports and useI18n, replace:
- Line 39: `'Prendre en charge'` → `{t.driver.takeCharge}`
- Line 53: `'Démarrer la livraison'` → `{t.driver.startDeliveryButton}`
- Line 67: `'Marquer livrée'` → `{t.driver.markDelivered}`
- Line 74: `'Signaler un problème'` → `{t.driver.reportProblem}`

#### /apps/web/src/components/driver/delivery-status-badge.tsx
Add imports and useI18n. Replace the STATUS_LABELS import line with creating it inside component using t.store translations (they're the same as driver uses store status labels).

#### /apps/web/src/components/driver/status-labels.ts
Replace with:
```typescript
import type { OrderStatus } from '@depaneuria/types';
import type { Translations } from '@depaneuria/types';

export const getStatusLabels = (t: Translations): Record<OrderStatus, string> => ({
  draft: t.store.statusDraft,
  submitted: t.store.statusSubmitted,
  accepted: t.store.statusAccepted,
  rejected: t.store.statusRejected,
  preparing: t.store.statusPreparing,
  ready_for_delivery: t.store.statusReady,
  assigned_to_driver: t.store.statusAssigned,
  out_for_delivery: t.store.statusOutForDelivery,
  delivered: t.store.statusDelivered,
  delivery_failed: t.store.statusDeliveryFailed,
  cancelled: t.store.statusCancelled,
});
```

Then update delivery-card.tsx to use getStatusLabels(t) instead of STATUS_LABELS.

#### /apps/web/src/components/driver/tenant-filter.tsx
Same pattern as store tenant-filter, replace:
- Line 10: `'Dépanneur :'` → `{t.driver.tenantLabel}`

### Admin Catalog Page - /apps/web/src/routes/admin-catalog-page.tsx

Add import and useI18n. Replace all hardcoded strings:
- Line 181: `'DEP-0601 à DEP-0640'` → `{t.admin.eyebrow}`
- Line 182: `'Admin catalogue'` → `{t.admin.pageTitle}`
- Line 183-186: page description → `{t.admin.pageDescription}`
- Line 191: `'produits'` → `{t.admin.productsCount}`
- Line 66: `'Impossible de charger le catalogue.'` → `t.admin.loadError`
- Line 81: `'Erreur lors du rafraîchissement.'` → `t.admin.loadError`
- Line 97: `'Erreur lors de la sauvegarde.'` → `t.admin.saveError`
- Line 109: `'Impossible de changer le statut.'` → `t.admin.statusChangeError`
- Line 121: `'Impossible de changer la disponibilité.'` → `t.admin.availabilityChangeError`
- Line 130: `'Impossible de mettre à jour la popularité.'` → `t.admin.popularityChangeError`
- Line 135: `'Nouveau prix'` → `t.admin.newPricePrompt`
- Line 139: `'Prix invalide'` → `t.admin.invalidPrice`
- Line 146: `'Impossible de mettre à jour le prix.'` → `t.admin.priceChangeError`
- Line 151-155: Stock prompts → use t.admin translations
- Line 161-165: Stock validation → use t.admin translations
- Line 173: `'Impossible de mettre à jour le stock.'` → `t.admin.stockChangeError`
- Line 208: `'Chargement du catalogue…'` → `{t.common.loading}`

### Admin Components

#### /apps/web/src/components/admin/catalog-toolbar.tsx
Add imports and useI18n, replace:
- Line 29: placeholder → `{t.admin.searchPlaceholder}`
- Line 40: `'Toutes les disponibilités'` → `{t.admin.allAvailability}`
- Line 41-43: Availability options → use t.admin translations
- Line 50: `'Tous les statuts'` → `{t.admin.allStatus}`
- Line 51-52: Status options → `{t.admin.statusActive}`, `{t.admin.statusDraft}`
- Line 62: `'Populaires'` → `{t.admin.popular}`
- Line 66: `'Rafraîchir'` → `{t.admin.refresh}`

#### /apps/web/src/components/admin/category-list.tsx
Add imports and useI18n, replace:
- Line 16: `<h3>Catégories</h3>` → `<h3>{t.admin.categoriesTitle}</h3>`
- Line 17: description → `{t.admin.categoriesDescription}`
- Line 24: `'Toutes'` → `{t.admin.allCategories}`

#### /apps/web/src/components/admin/product-list.tsx
Add imports and useI18n, replace:
- Line 26: `'Aucun produit ne correspond aux filtres.'` → `{t.admin.noProductsMatch}`
- Line 33-37: Table headers → use t.admin translations

#### /apps/web/src/components/admin/product-form.tsx
Add imports and useI18n, replace all hardcoded strings with t.admin translations:
- Line 92: Form title
- Line 93-95: Form description
- Line 101-252: All labels, placeholders, options, buttons

#### /apps/web/src/components/admin/product-row.tsx
Add imports and useI18n, replace:
- Line 44: `'Actif'` / `'Brouillon'` → use t.admin
- Line 46: `'Populaire'` → `{t.admin.popular}`
- Line 58-77: All buttons → use t.admin translations

#### /apps/web/src/components/admin/tenant-selector.tsx
Replace:
- Line 10: `'Dépanneur :'` → `{t.admin.tenantLabel}`

#### /apps/web/src/components/admin/stock-badge.tsx
Add imports and useI18n, replace:
- Line 11: `'Rupture'` → `{t.admin.stockBadgeOutOfStock}`
- Line 15: `'Sur commande'` → `{t.admin.stockBadgeOnOrder}`
- Line 19: `'Stock bas'` → `{t.admin.stockBadgeLow}`
- Line 22: `'En stock'` → `{t.admin.stockBadgeInStock}`

## Pattern for All Components

1. Add import: `import { useI18n } from '../../lib/i18n-context';` (adjust path as needed)
2. Add at start of component: `const { translations: t } = useI18n();`
3. Replace hardcoded French strings with `t.domain.key` references
4. Use appropriate domain: `t.assistant`, `t.store`, `t.driver`, or `t.admin`

## Testing

After all translations:
1. Test language switching works
2. Verify all text displays correctly in both French and English
3. Check no hardcoded strings remain in UI
