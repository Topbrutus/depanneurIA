import type { Request, Response, NextFunction } from 'express';
import { getTenant } from './tenant-store';
import { NotFoundError } from './errors';

/**
 * Middleware Express : résout le :tenantId du chemin et l'attache à res.locals.
 * Renvoie 404 si le tenant n'existe pas.
 */
export function resolveTenant(req: Request, res: Response, next: NextFunction) {
  const tenantId = req.params['tenantId'];
  if (!tenantId) {
    next(new NotFoundError('Tenant'));
    return;
  }

  const tenant = getTenant(tenantId);
  if (!tenant) {
    next(new NotFoundError('Tenant'));
    return;
  }

  res.locals['tenant'] = tenant;
  res.locals['tenantId'] = tenant.id;
  next();
}

/** Raccourci pour lire le tenantId déjà résolu */
export function tenantId(res: Response): string {
  return res.locals['tenantId'] as string;
}
