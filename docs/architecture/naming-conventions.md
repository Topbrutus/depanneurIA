# Naming Conventions

This document defines the official naming conventions for the `depaneurIA` monorepo. Consistency is key to a maintainable codebase.

## A. File Naming Rules

- **TypeScript Utilities & Libs**: Use `kebab-case.ts` (e.g., `date-formatter.ts`, `auth-guard.ts`).
- **React Components**: Use `PascalCase.tsx` (e.g., `Button.tsx`, `ProductCard.tsx`).
- **Tests**: Append `.test.ts` or `.test.tsx` (e.g., `date-formatter.test.ts`).
- **Types/Contracts**: Use clear and predictable names, no random capitalizations. No ambiguous names like `utils.ts` if it can be more specific.

## B. Component Naming Rules

- **React Components**: Always `PascalCase`.
- **Shared UI Components**: Should have a clear name, prefixing is not strictly required if scoped in `@depaneuria/ui`, but clarity is essential.
- **Avoid Vague Names**: Do not use `Thing`, `DataBox`, `Manager2`. Use `OrderList`, `CustomerProfile`, etc.

## C. Route Naming Rules

- **URL Segments**: Always use `kebab-case`.
- **Consistency**: Keep routes readable and predictable.
- **Examples**:
  - `/shop`
  - `/last-order`
  - `/top-products`
  - `/order-tracking`
  - `/store/orders`
  - `/driver/deliveries`

## D. Data Table Naming Rules (Conceptual)

- **Format**: `snake_case` in the plural.
- **Examples**:
  - `products`
  - `product_categories`
  - `customer_addresses`
  - `orders`
  - `order_items`
  - `tenant_settings`

## E. Order Event Naming Rules

- **Format**: `domain.action` or `domain.state_changed` in lowercase.
- **Examples**:
  - `order.created`
  - `order.confirmed`
  - `order.preparing`
  - `order.out_for_delivery`
  - `order.delivered`
  - `order.cancelled`

## F. Tenant Naming Rules

- **Tenant Slug**: `kebab-case`, stable, no accents, no special characters.
- **Examples**:
  - `depanneur-laval-centre`
  - `topbrutus-demo`
- **Separation**: Distinguish between `tenant display name` (e.g., "Dépanneur Laval Centre"), `tenant slug` (e.g., "depanneur-laval-centre"), and `tenant internal ID` (UUID or serial).

## G. Language Naming Rules

- **Format**: Use standard simple codes (IETF BCP 47).
- **Examples**:
  - `fr-CA`
  - `en-CA`
- **Note**: Distinguish between the tenant's default language and the user's active session language.

## H. Product Media Naming Rules

- **Structure**: Consistent and compressed files.
- **Format**: `tenant-slug/product-slug/view-01.webp`
- **Examples**:
  - `topbrutus-demo/coke-355ml/main-01.webp`
  - `topbrutus-demo/doritos-nacho/front-01.webp`
