import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, PlusCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getApprovedInvoices, createPayment } from '../features/payments/paymentService';
import type { PaymentCreateInput } from '../features/payments/types';
import type { Invoice } from '../features/invoices/types';
import { ROUTES } from '../routes/routeRegistry';
import { ROLES } from '../auth/permissions';
import { EmptyState } from '../components/EmptyState';

export function PaymentCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [approvedInvoices, setApprovedInvoices] = useState<Invoice[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [formData, setFormData] = useState<PaymentCreateInput>({
    invoice_id: '',
    payment_reference: '',
    payment_date: new Date().toISOString().slice(0, 10),
    payment_amount: 0,
    payment_mode: 'RTGS',
    remarks: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const loadInvoices = async () => {
      setLoading(true);
      setError(null);
      try {
        const invoices = await getApprovedInvoices(user);
        if (mounted) setApprovedInvoices(invoices);
      } catch (caught) {
        if (mounted) setError((caught as Error).message ?? 'Unable to load approved invoices.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadInvoices();
    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!selectedInvoiceId) {
      return;
    }

    const invoice = approvedInvoices.find((item) => item.id === selectedInvoiceId);
    if (invoice) {
      setFormData((current) => ({
        ...current,
        invoice_id: invoice.id,
        payment_amount: invoice.invoice_amount,
      }));
    }
  }, [selectedInvoiceId, approvedInvoices]);

  const selectedInvoice = useMemo(
    () => approvedInvoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null,
    [approvedInvoices, selectedInvoiceId]
  );

  if (!user) {
    return null;
  }

  const canCreatePayment = user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN;
  if (!canCreatePayment) {
    return (
      <EmptyState
        title="Access denied"
        description="Only Admin and Super Admin users can create new payment records."
        icon={<ClipboardList size={48} style={{ color: 'var(--danger)' }} />}
      />
    );
  }

  const handleChange = (key: keyof PaymentCreateInput, value: string | number | null) => {
    setFormData((current) => ({ ...current, [key]: value } as PaymentCreateInput));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = { ...formData, invoice_id: selectedInvoiceId };
      const payment = await createPayment(payload, user);
      navigate(ROUTES.paymentDetails.replace(':id', payment.id));
    } catch (caught) {
      setError((caught as Error).message || 'Unable to create payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      <div>
        <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>Record payment</h3>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Create a payment record only after the invoice has been approved and attach the transaction details.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }}>
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <h4 style={{ marginTop: 0, marginBottom: 'var(--space-2)' }}>Step 1: Select approved invoice</h4>
          {loading ? (
            <div style={{ color: 'var(--text-muted)' }}>Loading approved invoices...</div>
          ) : approvedInvoices.length === 0 ? (
            <EmptyState
              title="No approved invoices"
              description="Approve an invoice before creating payment records."
              icon={<ClipboardList size={48} style={{ color: 'var(--primary)' }} />}
            />
          ) : (
            <select
              value={selectedInvoiceId}
              onChange={(event) => setSelectedInvoiceId(event.target.value)}
              style={{
                width: '100%',
                padding: '0.95rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
              }}
            >
              <option value="">Select approved invoice</option>
              {approvedInvoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number} · ₹{invoice.invoice_amount.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedInvoice ? (
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <h4 style={{ marginTop: 0, marginBottom: 'var(--space-2)' }}>Invoice summary</h4>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <strong>{selectedInvoice.invoice_number}</strong>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                Amount: ₹{selectedInvoice.invoice_amount.toLocaleString('en-IN')}
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                Status: {selectedInvoice.status}
              </div>
            </div>
          </div>
        ) : null}

        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <label style={{ display: 'grid', gap: '0.5rem' }}>
              Payment date
              <input
                type="date"
                value={formData.payment_date}
                onChange={(event) => handleChange('payment_date', event.target.value)}
                required
                style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)' }}
              />
            </label>
            <label style={{ display: 'grid', gap: '0.5rem' }}>
              Payment mode
              <select
                value={formData.payment_mode}
                onChange={(event) => handleChange('payment_mode', event.target.value)}
                style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                <option value="RTGS">RTGS</option>
                <option value="NEFT">NEFT</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="CASH">CASH</option>
                <option value="OTHER">OTHER</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <label style={{ display: 'grid', gap: '0.5rem' }}>
              Payment amount
              <input
                type="number"
                value={formData.payment_amount}
                onChange={(event) => handleChange('payment_amount', Number(event.target.value))}
                min={0}
                required
                style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)' }}
              />
            </label>
            <label style={{ display: 'grid', gap: '0.5rem' }}>
              Transaction reference
              <input
                type="text"
                value={formData.payment_reference}
                onChange={(event) => handleChange('payment_reference', event.target.value)}
                required
                style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)' }}
              />
            </label>
          </div>

          <label style={{ display: 'grid', gap: '0.5rem' }}>
            Remarks
            <textarea
              value={formData.remarks ?? ''}
              onChange={(event) => handleChange('remarks', event.target.value)}
              rows={4}
              style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)' }}
            />
          </label>
        </div>

        {error ? <div style={{ color: 'var(--danger)' }}>{error}</div> : null}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={submitting || !selectedInvoiceId}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.95rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--primary)',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <PlusCircle size={16} /> Record payment
          </button>
        </div>
      </form>
    </div>
  );
}
