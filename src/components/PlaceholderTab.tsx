/**
 * Placeholder Tab Component
 * 
 * Generic placeholder for tabs not yet implemented
 */

import { Construction } from 'lucide-react';

interface PlaceholderTabProps {
  title: string;
  description: string;
}

export function PlaceholderTab({ title, description }: PlaceholderTabProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-8)',
      minHeight: '400px',
    }}>
      <div style={{
        padding: 'var(--space-4)',
        background: 'var(--primary-light)',
        borderRadius: '50%',
        marginBottom: 'var(--space-4)',
      }}>
        <Construction size={32} style={{ color: 'var(--primary)' }} />
      </div>
      
      <h3 style={{
        fontSize: 'var(--font-lg)',
        fontWeight: 600,
        marginBottom: 'var(--space-2)',
        textAlign: 'center',
      }}>
        {title}
      </h3>
      
      <p style={{
        fontSize: 'var(--font-sm)',
        color: 'var(--text-muted)',
        textAlign: 'center',
        maxWidth: '500px',
        margin: 0,
        lineHeight: 1.6,
      }}>
        {description}
      </p>

      <div className="card" style={{
        marginTop: 'var(--space-5)',
        padding: 'var(--space-4)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        maxWidth: '600px',
      }}>
        <div style={{
          fontSize: 'var(--font-xs)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 'var(--space-2)',
          fontWeight: 600,
        }}>
          Coming Soon
        </div>
        <div style={{
          fontSize: 'var(--font-sm)',
          color: 'var(--text)',
          lineHeight: 1.5,
        }}>
          This workspace module will be implemented in a future step. The tab structure has been created to establish the complete workflow architecture.
        </div>
      </div>
    </div>
  );
}
