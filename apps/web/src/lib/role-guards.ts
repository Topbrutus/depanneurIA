import type { UserRole } from '@depaneuria/types';
import { ROLE_PERMISSIONS } from '@depaneuria/types';

/**
 * Vérifie si un rôle a accès à la page store
 */
export function canAccessStore(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role].canAccessStore;
}

/**
 * Vérifie si un rôle a accès à la page driver
 */
export function canAccessDriver(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role].canAccessDriver;
}

/**
 * Vérifie si un rôle a accès à la page admin
 */
export function canAccessAdmin(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role].canAccessAdmin;
}

/**
 * Vérifie si un rôle peut gérer le catalogue
 */
export function canManageCatalog(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role].canManageCatalog;
}

/**
 * Vérifie si un rôle peut gérer les commandes
 */
export function canManageOrders(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role].canManageOrders;
}

/**
 * Vérifie si un rôle peut gérer les tenants
 */
export function canManageTenants(role: UserRole): boolean {
  return ROLE_PERMISSIONS[role].canManageTenants;
}
