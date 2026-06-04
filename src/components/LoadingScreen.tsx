import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading system assets...' }: LoadingScreenProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--background)',
      fontFamily: 'var(--font-family)',
      animation: 'fadeIn var(--transition-normal) forwards'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-8)',
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)'
      }}>
        <Loader2 
          className="animate-spin" 
          size={40} 
          style={{ color: 'var(--primary)' }}
        />
        <p style={{
          color: 'var(--text-muted)',
          fontSize: 'var(--font-sm)',
          fontWeight: '500',
          letterSpacing: '0.025em'
        }}>
          {message}
        </p>
      </div>
    </div>
  );
}
