import { type Invoice } from '../../features/invoices/types';
import { ROLES } from '../../auth/permissions';
import type { UserProfile } from '../../types';

export function InvoiceActionPanel({
  invoice,
  user,
  actionLoading,
  hasApproveGateIssue,
  onStartVerification,
  onVerify,
  onApprove,
  onReject,
  onClarify,
  onProceedToPayment
}: {
  invoice: Invoice;
  user: UserProfile | null;
  actionLoading: boolean;
  hasApproveGateIssue: boolean;
  onStartVerification: () => void;
  onVerify: () => void;
  onApprove: () => void;
  onReject: () => void;
  onClarify: () => void;
  onProceedToPayment: () => void;
}) {
  const canManageWorkflow = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;

  if (!canManageWorkflow && invoice.status !== 'APPROVED') {
    return (
      <div style={{ background: 'var(--surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem' }}>ACTIONS</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You do not have permission to manage this invoice's workflow.</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--surface)',
      padding: 'var(--space-4)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      position: 'sticky',
      top: '2rem'
    }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem' }}>APPROVAL ACTIONS</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        
        {invoice.status === 'RECEIVED' ? (
          <button
            disabled={actionLoading}
            onClick={onStartVerification}
            style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--indigo-600)', color: '#fff', fontWeight: 700, cursor: actionLoading ? 'not-allowed' : 'pointer' }}
          >
            Start Verification
          </button>
        ) : null}

        {invoice.status === 'UNDER_VERIFICATION' ? (
          <>
            <button
              disabled={actionLoading}
              onClick={onVerify}
              style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--success)', color: '#fff', fontWeight: 700, cursor: actionLoading ? 'not-allowed' : 'pointer' }}
            >
              Verify Invoice
            </button>
            <button
              disabled={actionLoading}
              onClick={onReject}
              style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)', background: 'transparent', color: 'var(--danger)', fontWeight: 700, cursor: actionLoading ? 'not-allowed' : 'pointer' }}
            >
              Reject Invoice
            </button>
          </>
        ) : null}

        {invoice.status === 'VERIFIED' ? (
          <>
            <button
              disabled={actionLoading || hasApproveGateIssue}
              onClick={onApprove}
              title={hasApproveGateIssue ? 'Cannot approve: critical variances exist' : ''}
              style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', border: 'none', background: hasApproveGateIssue ? 'var(--border)' : 'var(--success)', color: hasApproveGateIssue ? 'var(--text-muted)' : '#fff', fontWeight: 700, cursor: (actionLoading || hasApproveGateIssue) ? 'not-allowed' : 'pointer' }}
            >
              Approve Invoice
            </button>
            <button
              disabled={actionLoading}
              onClick={onClarify}
              style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning)', background: 'transparent', color: 'var(--warning)', fontWeight: 700, cursor: actionLoading ? 'not-allowed' : 'pointer' }}
            >
              Request Clarification
            </button>
            <button
              disabled={actionLoading}
              onClick={onReject}
              style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)', background: 'transparent', color: 'var(--danger)', fontWeight: 700, cursor: actionLoading ? 'not-allowed' : 'pointer' }}
            >
              Reject Invoice
            </button>
          </>
        ) : null}

        {invoice.status === 'APPROVED' ? (
          <button
            onClick={onProceedToPayment}
            style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
          >
            Create Payment Record
          </button>
        ) : null}
      </div>
    </div>
  );
}
