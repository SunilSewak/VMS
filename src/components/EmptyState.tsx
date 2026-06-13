import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'No records found',
  description = 'There is currently no data matches or entries for this category.',
  icon = <Inbox size={48} style={{ color: 'var(--text-light)' }} />,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-12) var(--space-6)',
      textAlign: 'center',
      backgroundColor: 'var(--surface)',
      border: '1px dashed var(--border)',
      borderRadius: 'var(--radius-lg)',
      width: '100%',
      fontFamily: 'var(--font-family)',
      margin: 'var(--space-4) 0'
    }}>
      <div style={{
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--background)',
        marginBottom: 'var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: 'var(--font-lg)',
        fontWeight: '600',
        color: 'var(--text-main)',
        marginBottom: 'var(--space-2)'
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: 'var(--font-sm)',
        color: 'var(--text-muted)',
        maxWidth: '360px',
        lineHeight: '1.5',
        marginBottom: onAction && actionLabel ? 'var(--space-6)' : '0'
      }}>
        {description}
      </p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          type="button"
          style={{
            padding: 'var(--space-3) var(--space-5)',
            backgroundColor: 'var(--primary)',
            color: 'var(--text-on-primary)',
            fontSize: 'var(--font-sm)',
            fontWeight: '600',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'background-color var(--transition-fast), transform var(--transition-fast)',
            border: 'none',
            cursor: 'pointer',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-hover, var(--primary))';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
