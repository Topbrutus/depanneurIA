import type { UserRole } from './roles';

/**
 * Session utilisateur mock pour V1
 * Pas d'OAuth réel, pas de provider externe
 */
export interface UserSession {
  userId: string;
  username: string;
  role: UserRole;
  tenantId?: string;
  createdAt: string;
}

/**
 * Requête de login mock
 */
export interface MockLoginRequest {
  username: string;
  role: UserRole;
  tenantId?: string;
}

/**
 * Réponse de login
 */
export interface LoginResponse {
  success: boolean;
  sessionId?: string;
  session?: UserSession;
  error?: {
    message: string;
    code: string;
  };
}

/**
 * Réponse de session
 */
export interface SessionResponse {
  success: boolean;
  session?: UserSession | null;
}

/**
 * Réponse de logout
 */
export interface LogoutResponse {
  success: boolean;
}
