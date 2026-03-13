import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '@depaneuria/types';
import { useAuth } from '../../lib/auth-context';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Composant pour protéger les routes selon les rôles
 * Si requireAuth=true, redirige vers /login si pas connecté
 * Si allowedRoles défini, vérifie que le rôle est autorisé
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  requireAuth = true,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const session = useAuth((state) => state.session);
  const checkSession = useAuth((state) => state.checkSession);
  const isLoading = useAuth((state) => state.isLoading);

  useEffect(() => {
    // Vérifier la session au montage
    if (!session) {
      checkSession();
    }
  }, [session, checkSession]);

  // Attendre le chargement de la session
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <p>Chargement...</p>
      </div>
    );
  }

  // Vérifier si auth requise
  if (requireAuth && !session) {
    return <Navigate to={redirectTo} replace />;
  }

  // Vérifier les rôles autorisés
  if (allowedRoles && allowedRoles.length > 0 && session) {
    if (!allowedRoles.includes(session.role)) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            gap: '1rem',
          }}
        >
          <h1>Accès refusé</h1>
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <p>
            Rôle actuel: <strong>{session.role}</strong>
          </p>
          <a href="/" style={{ color: '#2563EB' }}>
            Retour à l'accueil
          </a>
        </div>
      );
    }
  }

  return <>{children}</>;
}
