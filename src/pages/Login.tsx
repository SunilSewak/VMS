import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AppRole, ROLES } from '../auth/permissions';
import { ROUTES } from '../routes/routeRegistry';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleLogin = async (role: AppRole) => {
    await login(role);
    navigate(ROUTES.dashboard);
  };

  const loginRoles: AppRole[] = [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.SALES_HEAD,
    ROLES.FINANCE,
    ROLES.VIEWER
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background)',
      fontFamily: 'var(--font-family)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-8)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{
            fontSize: 'var(--font-2xl)',
            fontWeight: '700',
            color: 'var(--primary)',
            letterSpacing: '0.05em',
            marginBottom: 'var(--space-1)'
          }}>
            AVEMS
          </h1>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            Ajanta Venue & Event Management System
          </p>
        </div>

        <h3 style={{ fontSize: 'var(--font-base)', fontWeight: '600', color: 'var(--text-main)', marginBottom: 'var(--space-4)' }}>
          Developer Authentication Sandbox
        </h3>
        
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)', lineHeight: '1.5' }}>
          Select a role profile below to simulate authentication state in the project foundation.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {loginRoles.map((role) => (
            <button
              key={role}
              onClick={() => handleRoleLogin(role)}
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: 'var(--font-sm)',
                fontWeight: '600',
                textTransform: 'capitalize',
                transition: 'all var(--transition-fast)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--background)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-main)';
              }}
            >
              Sign in as {role.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'var(--space-8)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
          <p style={{ fontSize: '10px', color: 'var(--text-light)' }}>
            Ajanta Pharma Ltd. Security Policy Enforced
          </p>
        </div>
      </div>
    </div>
  );
}
