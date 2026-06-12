/**
 * Ownership & Audit Panel Component
 * 
 * Displays ownership and audit trail information:
 * - Request Owner (Sales Head)
 * - Processing Owner (Assigned Admin)
 * - Audit Trail (Created/Updated timestamps)
 * 
 * Follows AVEMS audit architecture standards.
 * 
 * Step 2: Overview Tab Enhancement
 */

import { User, Shield, Clock } from 'lucide-react';

interface OwnershipAuditPanelProps {
  requestOwner?: {
    name: string;
    division: string;
  };
  processingOwner?: {
    name: string;
  };
  audit: {
    createdBy?: string;
    createdAt?: string;
    updatedBy?: string;
    updatedAt?: string;
  };
}

export function OwnershipAuditPanel({
  requestOwner,
  processingOwner,
  audit,
}: OwnershipAuditPanelProps) {
  return (
    <div style={{
      padding: 'var(--space-4)',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
    }}>
      {/* Header */}
      <h4 style={{
        fontSize: 'var(--font-md)',
        fontWeight: 700,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}>
        <Shield size={18} style={{ color: 'var(--primary)' }} />
        Ownership & Audit
      </h4>

      {/* Request Owner */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-2)',
        }}>
          <User size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{
            fontSize: 'var(--font-xs)',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}>
            Request Owner
          </span>
        </div>
        {requestOwner ? (
          <div>
            <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>
              {requestOwner.name}
            </div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
              {requestOwner.division}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
            —
          </div>
        )}
      </div>

      {/* Processing Owner */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-2)',
        }}>
          <Shield size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{
            fontSize: 'var(--font-xs)',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}>
            Processing Owner
          </span>
        </div>
        {processingOwner ? (
          <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>
            {processingOwner.name}
          </div>
        ) : (
          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
            Not Assigned
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* Audit Trail */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-3)',
        }}>
          <Clock size={16} style={{ color: 'var(--text-muted)' }} />
          <span style={{
            fontSize: 'var(--font-xs)',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}>
            Audit Trail
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Created */}
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Created
            </div>
            <div style={{ fontSize: 'var(--font-sm)' }}>
              {formatAuditTimestamp(audit.createdAt)}
              {audit.createdBy && (
                <span style={{ color: 'var(--text-muted)' }}> • {audit.createdBy}</span>
              )}
            </div>
          </div>

          {/* Last Updated */}
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Last Updated
            </div>
            <div style={{ fontSize: 'var(--font-sm)' }}>
              {formatAuditTimestamp(audit.updatedAt)}
              {audit.updatedBy && (
                <span style={{ color: 'var(--text-muted)' }}> • {audit.updatedBy}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// UTILITIES
// ═════════════════════════════════════════════════════════════════════

function formatAuditTimestamp(timestamp?: string): string {
  if (!timestamp) return '—';
  
  try {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
}
