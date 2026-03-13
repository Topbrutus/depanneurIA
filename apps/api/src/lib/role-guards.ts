import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@depaneuria/types';
import { ROLE_PERMISSIONS } from '@depaneuria/types';
import { ApiError } from './errors';

/**
 * Garde de rôle - vérifie que l'utilisateur a un des rôles autorisés
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.session) {
      throw new ApiError(401, 'Non autorisé - session requise', 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.session.role)) {
      throw new ApiError(403, 'Accès refusé - rôle insuffisant', 'FORBIDDEN');
    }

    next();
  };
}

/**
 * Garde de permission - vérifie que l'utilisateur a une permission spécifique
 */
export function requirePermission(
  checkPermission: (permissions: (typeof ROLE_PERMISSIONS)[UserRole]) => boolean
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.session) {
      throw new ApiError(401, 'Non autorisé - session requise', 'UNAUTHORIZED');
    }

    const permissions = ROLE_PERMISSIONS[req.session.role];
    if (!checkPermission(permissions)) {
      throw new ApiError(403, 'Accès refusé - permission insuffisante', 'FORBIDDEN');
    }

    next();
  };
}

/**
 * Gardes prédéfinis pour les routes communes
 */
export const requireStoreAccess = requirePermission((p) => p.canAccessStore);
export const requireDriverAccess = requirePermission((p) => p.canAccessDriver);
export const requireAdminAccess = requirePermission((p) => p.canAccessAdmin);
export const requireCatalogManagement = requirePermission((p) => p.canManageCatalog);
export const requireOrderManagement = requirePermission((p) => p.canManageOrders);
export const requireTenantManagement = requirePermission((p) => p.canManageTenants);
