import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, CircleDollarSign, CreditCard, FileText, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPaymentById, markPaymentApproved, markPaymentPaid, markPaymentVerified } from '../features/payments/paymentService';
import type { Payment } from '../features/payments/types';
import { ROUTES } from '../routes/routeRegistry';
import { ROLES } from '../auth/permissions';
import { EmptyState } from '../components/EmptyState';

function statusBadge(status: Payment['status']) {
  const color =
    status === 'PAID'
      ? 'var(--success)'
      : status === 'APPROVED'
      ? 'var(--warning)'
      : status === 'VERIFIED'
      ? 'var(--info)'
      : 'var(--primary)';

  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '0.45rem 0.85rem',
        borderRadius: '999px',
        backgroundColor: 'rgba(0,0,0,0.04)',
        color,
        fontWeight: 700,
        fontSize: '0.85rem',
      }}
    >
      {status}
    </span>
  );
}

export function PaymentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const canManage = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    const loadPayment = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getPaymentById(id);
        if (mounted) setPayment(data);
      } catch (caught) {
        if (mounted) setError((caught as Error).message ?? 'Unable to load payment details.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPayment();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAction = async (action: 'verify' | 'approve' | 'pay') => {
    if (!payment || !user) return;
    setActionError(null);
    setActionLoading(true);

    try {
      let updated: Payment;
      if (action === 'verify') {
        updated = await markPaymentVerified(payment.id, user);
      } else if (action === 'approve') {
        updated = await markPaymentApproved(payment.id, user);
      } else {
        updated = await markPaymentPaid(payment.id, user);
      }
      setPayment(updated);
    } catch (caught) {
      setActionError((caught as Error).message || 'Unable to update payment workflow.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return <div style={{ padding: '3rem 0', color: 'var(--text-muted)' }}>Loading payment details...</div>;
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load payment"
        description={error}
        icon={<CircleDollarSign size={48} style={{ color: 'var(--danger)' }} />}
      />
    );
  }

  if (!payment) {
    return null;
  }

  const invoice = payment.invoice;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.payments)}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={18} /> Back to payments
          </button>
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, margin: 'var(--space-2) 0 0' }}>Payment details</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Review payment workflow status and update the payment lifecycle for approved invoices.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem', minWidth: 220, alignItems: 'stretch' }}>
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <CreditCard size={18} />
              <strong>Status</strong>
            </div>
            {statusBadge(payment.status)}
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <FileText size={18} />
              <strong>Invoice</strong>
            </div>
            <div>{invoice?.invoice_number ?? 'Unknown invoice'}</div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              {invoice?.invoice_amount ? `₹${invoice.invoice_amount.toLocaleString('en-IN')}` : ''}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 'var(--space-4)' }}>
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <h4 style={{ marginTop: 0, marginBottom: 'var(--space-2)' }}>Payment information</h4>
            <dl style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <dt style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Reference</dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>{payment.payment_reference || 'Not provided'}</dd>
              </div>
              <div>
                <dt style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Paid on</dt>
                <dd style={{ margin: 0 }}>{new Date(payment.payment_date).toLocaleDateString('en-IN')}</dd>
              </div>
              <div>
                <dt style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Amount</dt>
                <dd style={{ margin: 0, fontWeight: 600 }}>₹{payment.payment_amount.toLocaleString('en-IN')}</dd>
              </div>
              <div>
                <dt style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mode</dt>
                <dd style={{ margin: 0 }}>{payment.payment_mode}</dd>
              </div>
              <div>
                <dt style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Remarks</dt>
                <dd style={{ margin: 0 }}>{payment.remarks || 'No remarks added'}</dd>
              </div>
            </dl>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <h4 style={{ marginTop: 0, marginBottom: 'var(--space-2)' }}>Related invoice</h4>
            <dl style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <dt style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</dt>
                <dd style={{ margin: 0 }}>{invoice?.status ?? 'Unknown'}</dd>
              </div>
              <div>
                <dt style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Approved on</dt>
                <dd style={{ margin: 0 }}>{invoice?.approved_at ? new Date(invoice.approved_at).toLocaleDateString('en-IN') : 'Not approved'}</dd>
              </div>
              <div>
                <dt style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Booking ref</dt>
                <dd style={{ margin: 0 }}>{invoice?.bookings?.booking_reference || 'Unknown'}</dd>
              </div>
              <div>
                <dt style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hotel</dt>
                <dd style={{ margin: 0 }}>{invoice?.bookings?.hotel_name || 'Unknown'}</dd>
              </div>
              <div>
                <dt style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Division</dt>
                <dd style={{ margin: 0 }}>{invoice?.bookings?.division_name || 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <h4 style={{ marginTop: 0, marginBottom: 'var(--space-2)' }}>Audit trail</h4>
            <dl style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <dt style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Created by</dt>
                <dd style={{ margin: 0 }}>{payment.created_by ?? 'System'}</dd>
              </div>
              <div>
                <dt style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Created at</dt>
                <dd style={{ margin: 0 }}>{new Date(payment.created_at).toLocaleString('en-IN')}</dd>
              </div>
              <div>
                <dt style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Last updated by</dt>
                <dd style={{ margin: 0 }}>{payment.updated_by ?? 'Not updated'}</dd>
              </div>
              <div>
                <dt style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Last updated at</dt>
                <dd style={{ margin: 0 }}>{payment.updated_at ? new Date(payment.updated_at).toLocaleString('en-IN') : 'Not updated'}</dd>
              </div>
            </dl>
          </div>

          {canManage ? (
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <h4 style={{ marginTop: 0, marginBottom: 'var(--space-2)' }}>Workflow actions</h4>
              {actionError ? (
                <div style={{ color: 'var(--danger)', marginBottom: 'var(--space-3)' }}>{actionError}</div>
              ) : null}
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {payment.status === 'RECEIVED' ? (
                  <button
                    type="button"
                    onClick={() => handleAction('verify')}
                    disabled={actionLoading}
                    style={{
                      width: '100%',
                      padding: '0.95rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--primary)',
                      background: 'var(--primary)',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <ShieldCheck size={16} /> Verify payment
                  </button>
                ) : null}
                {payment.status === 'VERIFIED' ? (
                  <button
                    type="button"
                    onClick={() => handleAction('approve')}
                    disabled={actionLoading}
                    style={{
                      width: '100%',
                      padding: '0.95rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--success)',
                      background: 'var(--success)',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <CheckCircle2 size={16} /> Approve payment
                  </button>
                ) : null}
                {payment.status === 'APPROVED' ? (
                  <button
                    type="button"
                    onClick={() => handleAction('pay')}
                    disabled={actionLoading}
                    style={{
                      width: '100%',
                      padding: '0.95rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--success)',
                      background: 'var(--success)',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <CircleDollarSign size={16} /> Mark as paid
                  </button>
                ) : null}
                {payment.status === 'PAID' ? (
                  <div style={{ color: 'var(--success)', fontWeight: 700 }}>Payment has been completed.</div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
