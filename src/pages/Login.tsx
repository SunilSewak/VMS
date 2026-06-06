import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/routeRegistry';

export function Login() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await login(email, password);
      navigate(ROUTES.dashboard);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      console.error('Login error:', err);
    }
  };

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
      }}>
        <div style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
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
          Sign in to your account
        </h3>

        {error && (
          <div style={{
            padding: 'var(--space-3)',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: 'var(--radius-md)',
            color: '#c33',
            fontSize: 'var(--font-sm)',
            marginBottom: 'var(--space-4)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: '600', color: 'var(--text-main)', marginBottom: 'var(--space-2)' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@ajantapharma.com"
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-sm)',
                color: 'var(--text-main)',
                outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: '600', color: 'var(--text-main)', marginBottom: 'var(--space-2)' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-sm)',
                color: 'var(--text-main)',
                outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: 'var(--space-3)',
              backgroundColor: isLoading ? 'var(--text-muted)' : 'var(--primary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              fontSize: 'var(--font-sm)',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseOver={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--primary) 85%, black)';
            }}
            onMouseOut={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = 'var(--primary)';
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
          <details style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
            <summary style={{ cursor: 'pointer', marginBottom: 'var(--space-2)' }}>Test Accounts</summary>
            <div style={{ paddingLeft: 'var(--space-2)', lineHeight: '1.6' }}>
              <p><strong>SUPER_ADMIN:</strong> superadmin@ajantapharma.com</p>
              <p><strong>ADMIN:</strong> admin@ajantapharma.com</p>
              <p><strong>SALES_HEAD:</strong> saleshead@ajantapharma.com</p>
              <p style={{ marginTop: 'var(--space-2)', color: 'var(--text-light)' }}>
                Password: Test@123
              </p>
            </div>
          </details>
        </div>

        <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', color: 'var(--text-light)' }}>
            Ajanta Pharma Ltd. Security Policy Enforced
          </p>
        </div>
      </div>
    </div>
  );
}
