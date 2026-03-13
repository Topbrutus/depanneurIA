import type { Request, Response, NextFunction } from 'express';
import { getSession } from './auth-store';
import { ApiError } from './errors';

/**
 * Middleware pour extraire la session depuis le header Authorization
 * Format attendu: "Bearer {sessionId}"
 */
export function extractSession(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.session = null;
    next();
    return;
  }

  const sessionId = authHeader.substring(7); // Remove "Bearer "
  const session = getSession(sessionId);

  req.session = session;
  next();
}

/**
 * Middleware pour exiger une session valide
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session) {
    throw new ApiError(401, 'Non autorisé - session invalide ou manquante', 'UNAUTHORIZED');
  }
  next();
}

// Extend Express Request type to include session
declare global {
  namespace Express {
    interface Request {
      session?: import('@depaneuria/types').UserSession | null;
    }
  }
}
