import type { UserSession, LoginResponse, SessionResponse, LogoutResponse } from '@depaneuria/types';

/**
 * Mapper pour réponse de login
 */
export function mapLoginResponse(
  success: boolean,
  session?: UserSession,
  error?: { message: string; code: string }
): LoginResponse {
  return {
    success,
    session,
    error,
  };
}

/**
 * Mapper pour réponse de session
 */
export function mapSessionResponse(session: UserSession | null): SessionResponse {
  return {
    success: true,
    session,
  };
}

/**
 * Mapper pour réponse de logout
 */
export function mapLogoutResponse(): LogoutResponse {
  return {
    success: true,
  };
}
