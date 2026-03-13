import { create } from 'zustand';
import type { UserSession, UserRole, MockLoginRequest } from '@depaneuria/types';
import { saveSession, getStoredSession, getSessionId, clearSession } from './auth-storage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface AuthStore {
  session: UserSession | null;
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;

  login: (request: MockLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthStore>((set, get) => ({
  session: null,
  sessionId: null,
  isLoading: false,
  error: null,

  login: async (request: MockLoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/mock-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Login failed');
      }

      const sessionId = response.headers.get('X-Session-Id');
      if (!sessionId || !data.session) {
        throw new Error('Invalid session response');
      }

      // Sauvegarder en localStorage
      saveSession(sessionId, {
        sessionId,
        username: data.session.username,
        role: data.session.role,
        tenantId: data.session.tenantId,
        createdAt: data.session.createdAt,
      });

      set({ session: data.session, sessionId, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    const sessionId = get().sessionId;
    if (!sessionId) {
      clearSession();
      set({ session: null, sessionId: null });
      return;
    }

    try {
      await fetch(`${API_BASE}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
      set({ session: null, sessionId: null });
    }
  },

  checkSession: async () => {
    const storedSessionId = getSessionId();
    const storedSession = getStoredSession();

    if (!storedSessionId || !storedSession) {
      set({ session: null, sessionId: null });
      return;
    }

    set({ isLoading: true });

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/session`, {
        headers: {
          Authorization: `Bearer ${storedSessionId}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success && data.session) {
        set({
          session: data.session,
          sessionId: storedSessionId,
          isLoading: false,
        });
      } else {
        // Session invalide, nettoyer
        clearSession();
        set({ session: null, sessionId: null, isLoading: false });
      }
    } catch (error) {
      console.error('Check session error:', error);
      clearSession();
      set({ session: null, sessionId: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

/**
 * Hook pour vérifier si l'utilisateur a un rôle donné
 */
export function useHasRole(role: UserRole): boolean {
  const session = useAuth((state) => state.session);
  return session?.role === role;
}

/**
 * Hook pour vérifier si l'utilisateur a un des rôles donnés
 */
export function useHasAnyRole(...roles: UserRole[]): boolean {
  const session = useAuth((state) => state.session);
  return session ? roles.includes(session.role) : false;
}
