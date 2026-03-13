/**
 * Auth storage pour session locale
 * Stocke sessionId et session info en localStorage
 */

const SESSION_KEY = 'depaneuria_session';
const SESSION_ID_KEY = 'depaneuria_session_id';

export interface StoredSession {
  sessionId: string;
  username: string;
  role: string;
  tenantId?: string;
  createdAt: string;
}

export function saveSession(sessionId: string, session: StoredSession): void {
  try {
    localStorage.setItem(SESSION_ID_KEY, sessionId);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export function getStoredSession(): StoredSession | null {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) {
      return null;
    }
    return JSON.parse(sessionData) as StoredSession;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

export function getSessionId(): string | null {
  try {
    return localStorage.getItem(SESSION_ID_KEY);
  } catch (error) {
    console.error('Failed to get session ID:', error);
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_ID_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}
