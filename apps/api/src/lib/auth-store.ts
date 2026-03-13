import type { UserSession, UserRole } from '@depaneuria/types';
import { randomUUID } from 'crypto';

/**
 * Store de sessions mock en mémoire
 * V1 simple - pas de Redis, pas de DB
 */

const sessions = new Map<string, UserSession>();

export function createSession(
  username: string,
  role: UserRole,
  tenantId?: string
): { sessionId: string; session: UserSession } {
  const sessionId = randomUUID();
  const session: UserSession = {
    userId: randomUUID(),
    username,
    role,
    tenantId,
    createdAt: new Date().toISOString(),
  };

  sessions.set(sessionId, session);

  return { sessionId, session };
}

export function getSession(sessionId: string): UserSession | null {
  return sessions.get(sessionId) || null;
}

export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

export function clearAllSessions(): void {
  sessions.clear();
}

// Cleanup sessions plus vieilles que 24h (optionnel pour V1)
export function cleanupOldSessions(): void {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 heures

  for (const [sessionId, session] of sessions.entries()) {
    const sessionAge = now - new Date(session.createdAt).getTime();
    if (sessionAge > maxAge) {
      sessions.delete(sessionId);
    }
  }
}
