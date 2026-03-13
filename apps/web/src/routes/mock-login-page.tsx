import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_ROLES, type UserRole } from '@depaneuria/types';
import { useAuth } from '../lib/auth-context';
import { RoleBadge } from '../components/common/role-badge';

/**
 * Page de login mock pour V1
 * Permet de choisir un rôle et se connecter en mode démo
 */
export default function MockLoginPage() {
  const navigate = useNavigate();
  const login = useAuth((state) => state.login);
  const error = useAuth((state) => state.error);
  const clearError = useAuth((state) => state.clearError);
  const isLoading = useAuth((state) => state.isLoading);

  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();

    if (!username.trim()) {
      return;
    }

    try {
      await login({
        username: username.trim(),
        role: selectedRole,
      });

      // Rediriger selon le rôle
      switch (selectedRole) {
        case 'admin':
          navigate('/admin/catalog');
          break;
        case 'store_operator':
          navigate('/store-ops');
          break;
        case 'driver':
          navigate('/driver');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      // Error is handled by the store
      console.error('Login error:', err);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Connexion Mock V1</p>
          <h1>Accès démo</h1>
          <p className="muted">
            Mode démonstration - choisissez un nom et un rôle pour accéder à l'interface.
          </p>
        </div>
      </div>

      <div className="card form-card">
        <form onSubmit={handleSubmit} className="stack">
          <div className="field">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrez votre nom"
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="role">Rôle</label>
            <select
              id="role"
              name="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              required
            >
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role === 'customer' && 'Client'}
                  {role === 'store_operator' && 'Opérateur magasin'}
                  {role === 'driver' && 'Livreur'}
                  {role === 'admin' && 'Administrateur'}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
              Aperçu du rôle sélectionné :
            </p>
            <RoleBadge role={selectedRole} />
          </div>

          {error && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#FEE2E2',
                color: '#991B1B',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="card-footer">
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', textAlign: 'center' }}>
            Mode démo uniquement - pas d'authentification réelle
          </p>
        </div>
      </div>
    </div>
  );
}
