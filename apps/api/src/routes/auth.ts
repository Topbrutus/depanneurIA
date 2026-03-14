import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { MockLoginRequest } from '@depaneuria/types';
import { USER_ROLES } from '@depaneuria/types';
import { createSession, getSession, deleteSession } from '../lib/auth-store';
import { extractSession } from '../lib/auth-middleware';
import { mapLoginResponse, mapSessionResponse, mapLogoutResponse } from '../lib/session-mappers';
import { ApiError } from '../lib/errors';

const router = Router();

/**
 * POST /auth/mock-login
 * Login mock pour démo/local - pas d'auth externe
 */
router.post('/mock-login', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, role, tenantId } = req.body as MockLoginRequest;

    // Validation basique
    if (!username || !role) {
      throw new ApiError(400, 'Username et role requis', 'INVALID_INPUT');
    }

    if (!USER_ROLES.includes(role)) {
      throw new ApiError(400, 'Rôle invalide', 'INVALID_ROLE');
    }

    // Créer la session
    const { sessionId, session } = createSession(username, role, tenantId);

    // Envoyer le sessionId dans le header pour faciliter le client
    res.setHeader('X-Session-Id', sessionId);

    // Retourner session avec le sessionId dans le body (méthode principale)
    res.json(
      mapLoginResponse(true, session, sessionId)
    );
  } catch (err) {
    next(err);
  }
});

/**
 * GET /auth/session
 * Récupérer la session courante
 */
router.get('/session', extractSession, (req: Request, res: Response) => {
  res.json(mapSessionResponse(req.session || null));
});

/**
 * POST /auth/logout
 * Logout - invalider la session
 */
router.post('/logout', extractSession, (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const sessionId = authHeader.substring(7);
      deleteSession(sessionId);
    }

    res.json(mapLogoutResponse());
  } catch (err) {
    next(err);
  }
});

export default router;
