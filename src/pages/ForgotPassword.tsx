import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../routes/routeRegistry';

export function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to send recovery email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)', padding: '2rem' }}>
      <div style={{ maxWidth: '420px', width: '100%', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em', marginBottom: 'var(--space-1)', textAlign: 'center' }}>AVEMS</h1>
        <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 600, color: 'var(--text-main)', margin: 'var(--space-4) 0' }}>Reset your password</h3>

        {sent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ padding: 'var(--space-3)', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: 'var(--font-sm)' }}>
              If an account exists for <strong>{email}</strong>, a password recovery link has been sent. Check your inbox and follow the link to set a new password.
            </div>
            <Link to={ROUTES.login} style={{ color: 'var(--primary)', fontSize: 'var(--font-sm)', textAlign: 'center' }}>Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
              Enter your account email and we'll send you a link to reset your password.
            </p>
            {error && (
              <div style={{ padding: 'var(--space-3)', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: 'var(--radius-md)', color: '#c33', fontSize: 'var(--font-sm)' }}>{error}</div>
            )}
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-main)', marginBottom: 'var(--space-2)' }}>Email</label>
              <input
                id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                placeholder="you@ajantapharma.com"
                style={{ width: '100%', padding: 'var(--space-3)', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-sm)', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>
            <button type="submit" disabled={submitting} style={{ padding: 'var(--space-3)', backgroundColor: submitting ? 'var(--text-muted)' : 'var(--primary)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: 'var(--font-sm)', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'Sending…' : 'Send recovery link'}
            </button>
            <Link to={ROUTES.login} style={{ color: 'var(--primary)', fontSize: 'var(--font-sm)', textAlign: 'center' }}>Back to sign in</Link>
          </form>
        )}
      </div>
    </div>
  );
}
