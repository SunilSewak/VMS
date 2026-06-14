import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../routes/routeRegistry';

export function ResetPassword() {
  const { completePasswordReset, isPasswordRecovery, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Allow access during a recovery session, or any authenticated session
  // (e.g. a logged-in user changing their password via this screen).
  const hasRecoveryContext = isPasswordRecovery || isAuthenticated;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await completePasswordReset(password);
      setDone(true);
      setTimeout(() => navigate(ROUTES.login), 1800);
    } catch (err: any) {
      setError(err?.message ?? 'Unable to update password. Your recovery link may have expired — request a new one.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)', padding: '2rem' }}>
      <div style={{ maxWidth: '420px', width: '100%', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em', marginBottom: 'var(--space-1)', textAlign: 'center' }}>AVEMS</h1>
        <h3 style={{ fontSize: 'var(--font-base)', fontWeight: 600, color: 'var(--text-main)', margin: 'var(--space-4) 0' }}>Set a new password</h3>

        {done ? (
          <div style={{ padding: 'var(--space-3)', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: 'var(--font-sm)' }}>
            Password updated successfully. Redirecting to sign in…
          </div>
        ) : !hasRecoveryContext ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ padding: 'var(--space-3)', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: 'var(--radius-md)', color: '#c33', fontSize: 'var(--font-sm)' }}>
              No active password-recovery session. Please open the reset link from your email again, or request a new one.
            </div>
            <button onClick={() => navigate(ROUTES.forgotPassword)} style={{ padding: 'var(--space-3)', backgroundColor: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: 'var(--font-sm)', fontWeight: 600, cursor: 'pointer' }}>
              Request a new link
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {error && (
              <div style={{ padding: 'var(--space-3)', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: 'var(--radius-md)', color: '#c33', fontSize: 'var(--font-sm)' }}>{error}</div>
            )}
            <div>
              <label htmlFor="new-password" style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-main)', marginBottom: 'var(--space-2)' }}>New Password</label>
              <input
                id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password"
                placeholder="••••••••"
                style={{ width: '100%', padding: 'var(--space-3)', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-sm)', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-main)', marginBottom: 'var(--space-2)' }}>Confirm Password</label>
              <input
                id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password"
                placeholder="••••••••"
                style={{ width: '100%', padding: 'var(--space-3)', backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-sm)', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>
            <button type="submit" disabled={submitting} style={{ padding: 'var(--space-3)', backgroundColor: submitting ? 'var(--text-muted)' : 'var(--primary)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: 'var(--font-sm)', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
