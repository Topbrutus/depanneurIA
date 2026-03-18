/**
 * Rôles utilisateur de base V1
 * Simple role-based access control sans OAuth externe
 */

export const USER_ROLES = ['customer', 'store_operator', 'driver', 'admin'] as const;

export type UserRole = (typeof USER_ROLES)[number];

/**
 * Permissions associées aux rôles
 */
export interface RolePermissions {
  canAccessStore: boolean;
  canAccessDriver: boolean;
  canAccessAdmin: boolean;
  canManageCatalog: boolean;
  canManageOrders: boolean;
  canManageTenants: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  customer: {
    canAccessStore: false,
    canAccessDriver: false,
    canAccessAdmin: false,
    canManageCatalog: false,
    canManageOrders: false,
    canManageTenants: false,
  },
  store_operator: {
    canAccessStore: true,
    canAccessDriver: false,
    canAccessAdmin: false,
    canManageCatalog: false,
    canManageOrders: true,
    canManageTenants: false,
  },
  driver: {
    canAccessStore: false,
    canAccessDriver: true,
    canAccessAdmin: false,
    canManageCatalog: false,
    canManageOrders: false,
    canManageTenants: false,
  },
  admin: {
    canAccessStore: true,
    canAccessDriver: true,
    canAccessAdmin: true,
    canManageCatalog: true,
    canManageOrders: true,
    canManageTenants: true,
  },
};
