import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, DollarSign, Users, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getInvoiceById, startVerification, verifyInvoice, approveInvoice, rejectInvoice } from '../features/invoices/invoiceService';
import {
  getInvoiceDocuments,
  uploadInvoiceDocument,
  deleteInvoiceDocument,
  downloadInvoiceDocument,
} from '../features/invoices/invoiceDocumentService';
import { validateInvoicePackage, getValidationSummary } from '../features/invoices/invoiceValidationService';
import { runCommercialAudit, getPersistedVariances } from '../services/commercialAuditService';
import { classifyVarianceSeverity, rollUpAuditStatus, type VarianceSeverity } from '../services/invoiceAuditCalculationService';
import { getBookingById } from '../features/bookings/bookingService';
import type { Invoice, InvoiceValidationCheck, InvoiceDocument, InvoiceDocumentType, InvoiceVarianceRecord } from '../features/invoices/types';
import type { Booking } from '../features/bookings/types';
import { ROUTES } from '../routes/routeRegistry';
import { ROLES } from '../auth/permissions';
import { EmptyState } from '../components/EmptyState';

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatCurrency(amount: number | null | undefined) {
  return `₹${(amount ?? 0).toLocaleString('en-IN')}`;
}

const SEVERITY_COLOR: Record<string, string> = {
  PASS: 'var(--success)',
  INFO: 'var(--primary)',
  REVIEW_REQUIRED: 'var(--warning)',
  WARNING: 'var(--warning)',
  CRITICAL: 'var(--danger)',
};

const CATEGORY_VARIANCE_TYPES = ['ROOM_VARIANCE', 'FOOD_VARIANCE', 'NRC_VARIANCE', 'HALL_VARIANCE'];

const statusBadge = (status: string) => {
  const color =
    status === 'APPROVED'
      ? 'var(--success)'
      : status === 'REJECTED'
      ? 'var(--danger)'
      : status === 'VERIFIED'
      ? 'var(--warning)'
      : 'var(--primary)';

  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '0.5rem 1rem',
        borderRadius: '999px',
        backgroundColor: color + '10',
        color,
        fontWeight: 600,
        fontSize: '0.9rem',
      }}
    >
      {status}
    </span>
  );
};

export function InvoiceDetails() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [validationChecks, setValidationChecks] = useState<InvoiceValidationCheck[]>([]);
  const [validationSummary, setValidationSummary] = useState<any>(null);
  const [commercialVariances, setCommercialVariances] = useState<InvoiceVarianceRecord[]>([]);
  const [runningAudit, setRunningAudit] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<InvoiceDocument[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'validation' | 'documents'>('info');
  const [selectedDocumentType, setSelectedDocumentType] = useState<InvoiceDocumentType>('PRIMARY_INVOICE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const successMessage = searchParams.get('created') ? 'Invoice uploaded successfully.' : null;
  const canManageWorkflow = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;
  const canDeleteDocuments = user?.role === ROLES.SUPER_ADMIN;

  useEffect(() => {
    if (!id) {
      setError('Invoice ID is missing.');
      setLoading(false);
      return;
    }

    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const invoiceData = await getInvoiceById(id);
        if (mounted) {
          setInvoice(invoiceData);

          try {
            const bookingData = await getBookingById(invoiceData.booking_id);
            setBooking(bookingData);
          } catch {
            // Booking may not exist
          }

          const validationResult = await validateInvoicePackage(invoiceData);
          setValidationChecks(validationResult.checks);
          setValidationSummary(getValidationSummary(validationResult));

          try {
            const variances = await getPersistedVariances(invoiceData.id);
            setCommercialVariances(variances);
          } catch (vErr) {
            console.error('Failed to load persisted variances:', vErr);
          }
        }
      } catch (loadError) {
        setError('Failed to load invoice details.');
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!invoice) {
      setDocuments([]);
      return;
    }

    let mounted = true;

    const loadDocuments = async () => {
      setLoadingDocuments(true);

      try {
        const docs = await getInvoiceDocuments(invoice.id);
        if (mounted) {
          setDocuments(docs);
        }
      } catch {
        // ignore demo or fetch errors for documents
      } finally {
        if (mounted) {
          setLoadingDocuments(false);
        }
      }
    };

    loadDocuments();

    return () => {
      mounted = false;
    };
  }, [invoice]);

  if (loading) {
    return <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading invoice details...</div>;
  }

  if (error || !invoice) {
    return (
      <EmptyState
        title={error ? 'Unable to load invoice' : 'Invoice not found'}
        description={error ?? 'Please go back to the invoices list and try again.'}
        icon={<AlertCircle size={48} style={{ color: 'var(--primary)' }} />}
      />
    );
  }

  const hasApproveGateIssue = validationSummary?.requiresReview === true;

  const documentTypeOptions: { value: InvoiceDocumentType; label: string }[] = [
    { value: 'PRIMARY_INVOICE', label: 'Primary Invoice' },
    { value: 'GST_INVOICE', label: 'GST Invoice' },
    { value: 'COVER_LETTER', label: 'Cover Letter' },
    { value: 'OCCUPANCY_REPORT', label: 'Occupancy Report' },
    { value: 'ROOMING_REPORT', label: 'Rooming Report' },
    { value: 'NRC_LIST', label: 'NRC List' },
    { value: 'BANQUET_BILL', label: 'Banquet Bill' },
    { value: 'GUEST_BILL', label: 'Guest Bill' },
    { value: 'OTHER', label: 'Other' },
  ];

  const refreshDocuments = async () => {
    if (!invoice) {
      return;
    }
    setLoadingDocuments(true);
    try {
      const docs = await getInvoiceDocuments(invoice.id);
      setDocuments(docs);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleUpload = async () => {
    if (!invoice) return;
    if (!selectedFile) {
      setUploadError('Please choose a file to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      await uploadInvoiceDocument(invoice.id, selectedDocumentType, selectedFile, user!);
      setSelectedFile(null);
      setSelectedDocumentType('PRIMARY_INVOICE');
      await refreshDocuments();
    } catch (uploadError) {
      setUploadError((uploadError as Error).message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = async (document: InvoiceDocument) => {
    try {
      const url = await downloadInvoiceDocument(document);
      window.open(url, '_blank');
    } catch (previewError) {
      setActionError((previewError as Error).message || 'Unable to preview document.');
    }
  };

  const handleDownload = async (invoiceDocument: InvoiceDocument) => {
    try {
      const url = await downloadInvoiceDocument(invoiceDocument);
      const link = document.createElement('a');
      link.href = url;
      link.download = invoiceDocument.file_name;
      link.click();
    } catch (downloadError) {
      setActionError((downloadError as Error).message || 'Unable to download document.');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('Delete this document?')) {
      return;
    }

    try {
      await deleteInvoiceDocument(documentId);
      await refreshDocuments();
    } catch (deleteError) {
      setActionError((deleteError as Error).message || 'Unable to delete document.');
    }
  };

  const handleStartVerification = async () => {
    if (!invoice || !user) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await startVerification(invoice.id, user);
      setInvoice(updated);
    } catch (transitionError) {
      setActionError((transitionError as Error).message || 'Unable to start verification.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!invoice || !user) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await verifyInvoice(invoice.id, user);
      setInvoice(updated);
    } catch (transitionError) {
      setActionError((transitionError as Error).message || 'Unable to verify invoice.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!invoice || !user) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await approveInvoice(invoice.id, user);
      setInvoice(updated);
    } catch (transitionError) {
      setActionError((transitionError as Error).message || 'Unable to approve invoice.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!invoice || !user) return;
    const reason = window.prompt('Enter rejection reason');
    if (!reason?.trim()) {
      return;
    }

    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await rejectInvoice(invoice.id, reason.trim(), user);
      setInvoice(updated);
    } catch (transitionError) {
      setActionError((transitionError as Error).message || 'Unable to reject invoice.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunCommercialAudit = async () => {
    if (!invoice) return;
    setRunningAudit(true);
    setAuditError(null);
    try {
      await runCommercialAudit(invoice.id);
      const variances = await getPersistedVariances(invoice.id);
      setCommercialVariances(variances);
    } catch (err: any) {
      setAuditError(err?.message ?? 'Unable to run commercial audit.');
    } finally {
      setRunningAudit(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Success Message */}
      {successMessage ? (
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: 'var(--success)',
          }}
        >
          <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '0.25rem' }} />
          <span style={{ fontWeight: 500 }}>{successMessage}</span>
        </div>
      ) : null}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <Link to={ROUTES.invoices} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              <ArrowLeft size={20} />
            </Link>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, margin: 0 }}>Invoice {invoice.invoice_number}</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-1)' }}>
            Status: {statusBadge(invoice.status)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
          {canManageWorkflow && invoice.status === 'RECEIVED' ? (
            <button
              disabled={actionLoading}
              onClick={handleStartVerification}
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: 'var(--indigo-600)',
                color: '#fff',
                fontWeight: 700,
                cursor: actionLoading ? 'not-allowed' : 'pointer',
              }}
            >
              Start Verification
            </button>
          ) : null}

          {canManageWorkflow && invoice.status === 'UNDER_VERIFICATION' ? (
            <>
              <button
                disabled={actionLoading}
                onClick={handleVerify}
                style={{
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  background: 'var(--success)',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                }}
              >
                Verify
              </button>
              <button
                disabled={actionLoading}
                onClick={handleReject}
                style={{
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--danger)',
                  background: 'transparent',
                  color: 'var(--danger)',
                  fontWeight: 700,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                }}
              >
                Reject
              </button>
            </>
          ) : null}

          {canManageWorkflow && invoice.status === 'VERIFIED' ? (
            <button
              disabled={actionLoading || hasApproveGateIssue}
              onClick={handleApprove}
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: hasApproveGateIssue ? 'var(--border)' : 'var(--success)',
                color: hasApproveGateIssue ? 'var(--text-muted)' : '#fff',
                fontWeight: 700,
                cursor: actionLoading || hasApproveGateIssue ? 'not-allowed' : 'pointer',
              }}
            >
              Approve Invoice
            </button>
          ) : null}
        </div>
      </div>

      {/* Approval Gate */}
      {hasApproveGateIssue ? (
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: 'var(--warning)',
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '0.25rem' }} />
          <div>
            <div style={{ fontWeight: 700 }}>Review required before approval</div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Critical variances detected. Approval is blocked until review comments are resolved.</div>
          </div>
        </div>
      ) : null}

      {actionError ? (
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--danger)',
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '0.25rem' }} />
          <div>{actionError}</div>
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Health Score</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{validationSummary?.healthScore ?? '—'}%</div>
        </div>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Audit Outcome</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{validationSummary?.auditOutcome ?? '—'}</div>
        </div>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Approval Recommendation</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{validationSummary?.readyForApproval ? 'Ready For Approval' : 'Requires Review'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: 'var(--space-4)' }}>
        <button
          onClick={() => setActiveTab('info')}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-lg)',
            border: activeTab === 'info' ? '1px solid var(--primary)' : '1px solid var(--border)',
            background: activeTab === 'info' ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
            color: activeTab === 'info' ? 'var(--primary)' : 'var(--text)',
            cursor: 'pointer',
          }}
        >
          Invoice Information
        </button>
        <button
          onClick={() => setActiveTab('validation')}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-lg)',
            border: activeTab === 'validation' ? '1px solid var(--primary)' : '1px solid var(--border)',
            background: activeTab === 'validation' ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
            color: activeTab === 'validation' ? 'var(--primary)' : 'var(--text)',
            cursor: 'pointer',
          }}
        >
          Validation Results
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-lg)',
            border: activeTab === 'documents' ? '1px solid var(--primary)' : '1px solid var(--border)',
            background: activeTab === 'documents' ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
            color: activeTab === 'documents' ? 'var(--primary)' : 'var(--text)',
            cursor: 'pointer',
          }}
        >
          Supporting Documents
        </button>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: '1fr 320px' }}>
        <section style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {activeTab === 'info' ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <DollarSign size={18} /> Invoice Information
              </h2>
              <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Invoice Number</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{invoice.invoice_number}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Invoice Date</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatDate(invoice.invoice_date)}</div>
                  </div>
                </div>

                <div style={{ background: 'var(--background)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                  {(() => {
                    const cgst = invoice.cgst_amount;
                    const sgst = invoice.sgst_amount;
                    const igst = invoice.igst_amount;
                    const hasGstSplit = cgst != null || sgst != null || igst != null;
                    const taxTotal = hasGstSplit
                      ? (cgst ?? 0) + (sgst ?? 0) + (igst ?? 0)
                      : (invoice.tax_amount ?? 0);
                    const subtotal = invoice.subtotal_amount
                      ?? ((invoice.room_charges ?? 0) + (invoice.hall_charges ?? 0) + (invoice.food_charges ?? 0) + (invoice.other_charges ?? 0));
                    const grandTotal = invoice.invoice_amount ?? (subtotal + taxTotal);

                    const Row = ({ label, value, strong }: { label: string; value: number | null | undefined; strong?: boolean }) =>
                      value == null ? null : (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: strong ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: strong ? 700 : 400 }}>{label}</span>
                          <span style={{ fontWeight: strong ? 700 : 600 }}>{formatCurrency(value)}</span>
                        </div>
                      );

                    return (
                      <div style={{ display: 'grid', gap: '0.85rem', fontSize: 'var(--font-sm)' }}>
                        <Row label="Room Charges" value={invoice.room_charges} />
                        <Row label="Food Charges" value={invoice.food_charges} />
                        <Row label="Hall Charges" value={invoice.hall_charges} />
                        <Row label="Other Charges" value={invoice.other_charges} />
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', display: 'grid', gap: '0.85rem' }}>
                          <Row label="Subtotal" value={subtotal} strong />
                          <Row label="CGST" value={cgst} />
                          <Row label="SGST" value={sgst} />
                          <Row label="IGST" value={igst} />
                          {!hasGstSplit ? <Row label="Tax Amount" value={invoice.tax_amount} /> : null}
                        </div>
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700 }}>Grand Total</span>
                          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>{formatCurrency(grandTotal)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>


                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Pax Billed</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} /> {invoice.pax_billed ?? '—'}
                    </div>
                  </div>
                  {invoice.remarks ? (
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Remarks</div>
                      <div style={{ fontSize: '0.95rem' }}>{invoice.remarks}</div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'validation' ? (
            <>
              {validationSummary ? (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
                  <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Zap size={18} /> Validation Summary
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    <div style={{ background: 'var(--background)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Checks</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{validationSummary.totalChecks}</div>
                    </div>
                    <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginBottom: '0.5rem' }}>Passed</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{validationSummary.passed}</div>
                    </div>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--warning)', marginBottom: '0.5rem' }}>Warnings</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>{validationSummary.warnings}</div>
                    </div>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>Critical</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>{validationSummary.critical}</div>
                    </div>
                  </div>
                </div>
              ) : null}

              {validationChecks.length > 0 ? (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
                  <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <TrendingUp size={18} /> Validation Checks
                  </h2>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-sm)' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                          <th style={{ textAlign: 'left', padding: '1rem 0', fontWeight: 700, color: 'var(--text-muted)' }}>Check</th>
                          <th style={{ textAlign: 'right', padding: '1rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Expected</th>
                          <th style={{ textAlign: 'right', padding: '1rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Actual</th>
                          <th style={{ textAlign: 'center', padding: '1rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Severity</th>
                          <th style={{ textAlign: 'center', padding: '1rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validationChecks.map((check) => (
                          <tr key={check.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '1rem 0', fontWeight: 500 }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{check.check_type}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{check.description}</div>
                            </td>
                            <td style={{ textAlign: 'right', padding: '1rem 1rem', fontSize: '0.9rem' }}>
                              {typeof check.expected_value === 'number' ? check.expected_value.toLocaleString('en-IN') : check.expected_value}
                            </td>
                            <td style={{ textAlign: 'right', padding: '1rem 1rem', fontSize: '0.9rem', fontWeight: 600 }}>
                              {typeof check.actual_value === 'number' ? check.actual_value.toLocaleString('en-IN') : check.actual_value}
                            </td>
                            <td style={{ textAlign: 'center', padding: '1rem 1rem' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '999px',
                                  backgroundColor:
                                    check.severity === 'CRITICAL'
                                      ? 'rgba(239, 68, 68, 0.1)'
                                      : check.severity === 'WARNING'
                                      ? 'rgba(245, 158, 11, 0.1)'
                                      : 'rgba(59, 130, 246, 0.1)',
                                  color:
                                    check.severity === 'CRITICAL'
                                      ? 'var(--danger)'
                                      : check.severity === 'WARNING'
                                      ? 'var(--warning)'
                                      : 'var(--primary)',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                }}
                              >
                                {check.severity}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', padding: '1rem 1rem' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '999px',
                                  backgroundColor: check.status === 'PASS' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                  color: check.status === 'PASS' ? 'var(--success)' : 'var(--danger)',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                }}
                              >
                                {check.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {/* ── Commercial Audit V2 (persisted variances) ── */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: 'var(--space-4)' }}>
                  <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                    <TrendingUp size={18} /> Commercial Audit (V2)
                  </h2>
                  {canManageWorkflow ? (
                    <button
                      onClick={handleRunCommercialAudit}
                      disabled={runningAudit}
                      style={{
                        padding: '0.7rem 1.1rem',
                        borderRadius: 'var(--radius-lg)',
                        border: 'none',
                        background: 'var(--primary)',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: runningAudit ? 'not-allowed' : 'pointer',
                        opacity: runningAudit ? 0.6 : 1,
                      }}
                    >
                      {runningAudit ? 'Running…' : 'Run Commercial Audit'}
                    </button>
                  ) : null}
                </div>

                {auditError ? (
                  <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 'var(--space-3)' }}>
                    {auditError}
                  </div>
                ) : null}

                {commercialVariances.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
                    No commercial variances recorded yet. Run the commercial audit to compare the approved commercial baseline against this invoice.
                  </p>
                ) : (() => {
                  // Recompute severity (in-memory) from persisted expected/actual.
                  const withSeverity = commercialVariances.map((v) => ({
                    ...v,
                    severity: classifyVarianceSeverity(v.variance_type, v.expected_amount ?? 0, v.actual_amount ?? 0) as VarianceSeverity,
                  }));
                  const categories = withSeverity.filter((v) => CATEGORY_VARIANCE_TYPES.includes(v.variance_type));
                  const totalRow = withSeverity.find((v) => v.variance_type === 'TOTAL_VARIANCE');
                  const totalExpected = totalRow?.expected_amount ?? categories.reduce((s, v) => s + (v.expected_amount ?? 0), 0);
                  const totalActual = totalRow?.actual_amount ?? categories.reduce((s, v) => s + (v.actual_amount ?? 0), 0);
                  const netVariance = Math.round((totalActual - totalExpected) * 100) / 100;
                  const overallStatus = rollUpAuditStatus(categories.map((v) => v.severity));
                  const criticalCount = categories.filter((v) => v.severity === 'CRITICAL').length;
                  const warningCount = categories.filter((v) => v.severity === 'WARNING').length;
                  const reviewCount = categories.filter((v) => v.severity === 'REVIEW_REQUIRED').length;

                  return (
                    <>
                      {/* Summary card */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                        <div style={{ background: 'var(--background)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Audit Status</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: SEVERITY_COLOR[overallStatus] }}>{overallStatus}</div>
                        </div>
                        <div style={{ background: 'var(--background)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Total Expected</div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{formatCurrency(totalExpected)}</div>
                        </div>
                        <div style={{ background: 'var(--background)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Total Actual</div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{formatCurrency(totalActual)}</div>
                        </div>
                        <div style={{ background: 'var(--background)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Net Variance</div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: Math.abs(netVariance) < 0.5 ? 'var(--success)' : netVariance < 0 ? 'var(--warning)' : 'var(--danger)' }}>{formatCurrency(netVariance)}</div>
                        </div>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginBottom: '0.35rem' }}>Critical Findings</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--danger)' }}>{criticalCount}</div>
                        </div>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginBottom: '0.35rem' }}>Warning Findings</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--warning)' }}>{warningCount}</div>
                        </div>
                        <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginBottom: '0.35rem' }}>Review Required</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--warning)' }}>{reviewCount}</div>
                        </div>
                      </div>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-sm)' }}>
                          <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                              <th style={{ textAlign: 'left', padding: '0.75rem 0', fontWeight: 700, color: 'var(--text-muted)' }}>Variance Type</th>
                              <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Expected</th>
                              <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Actual</th>
                              <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Variance</th>
                              <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Severity</th>
                              <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Interpretation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {withSeverity.map((v) => {
                              const variance = v.variance_amount ?? 0;
                              return (
                                <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                  <td style={{ padding: '0.85rem 0', fontWeight: 600 }}>{v.variance_type}</td>
                                  <td style={{ textAlign: 'right', padding: '0.85rem 1rem' }}>{formatCurrency(v.expected_amount)}</td>
                                  <td style={{ textAlign: 'right', padding: '0.85rem 1rem', fontWeight: 600 }}>{formatCurrency(v.actual_amount)}</td>
                                  <td style={{ textAlign: 'right', padding: '0.85rem 1rem', fontWeight: 700, color: SEVERITY_COLOR[v.severity] }}>{formatCurrency(variance)}</td>
                                  <td style={{ textAlign: 'center', padding: '0.85rem 1rem' }}>
                                    <span style={{
                                      display: 'inline-flex', padding: '0.25rem 0.75rem', borderRadius: '999px',
                                      backgroundColor: SEVERITY_COLOR[v.severity] + '1a', color: SEVERITY_COLOR[v.severity],
                                      fontWeight: 700, fontSize: '0.72rem',
                                    }}>
                                      {v.severity}
                                    </span>
                                  </td>
                                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '320px' }}>{v.remarks ?? '—'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  );
                })()}
              </div>
            </>
          ) : null}

          {activeTab === 'documents' ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={18} /> Supporting Documents
              </h2>

              <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Document Type</label>
                  <select
                    value={selectedDocumentType}
                    onChange={(event) => setSelectedDocumentType(event.target.value as InvoiceDocumentType)}
                    style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }}
                  >
                    {documentTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>Select File</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                    style={{ width: '100%' }}
                  />
                </div>

                {uploadError ? (
                  <div style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{uploadError}</div>
                ) : null}

                <button
                  disabled={uploading || !selectedFile}
                  onClick={handleUpload}
                  style={{
                    padding: '0.85rem 1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: uploading || !selectedFile ? 'not-allowed' : 'pointer',
                  }}
                >
                  {uploading ? 'Uploading…' : 'Upload Document'}
                </button>
              </div>

              <div style={{ marginTop: 'var(--space-5)' }}>
                {loadingDocuments ? (
                  <div style={{ color: 'var(--text-muted)' }}>Loading documents…</div>
                ) : documents.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)' }}>No supporting documents uploaded yet.</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-sm)' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                          <th style={{ textAlign: 'left', padding: '1rem 0', fontWeight: 700, color: 'var(--text-muted)' }}>Type</th>
                          <th style={{ textAlign: 'left', padding: '1rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>File Name</th>
                          <th style={{ textAlign: 'left', padding: '1rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Uploaded</th>
                          <th style={{ textAlign: 'center', padding: '1rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((document) => (
                          <tr key={document.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '1rem 0', fontWeight: 600 }}>{document.document_type.replace('_', ' ')}</td>
                            <td style={{ padding: '1rem 1rem' }}>{document.file_name}</td>
                            <td style={{ padding: '1rem 1rem', color: 'var(--text-muted)' }}>{formatDate(document.uploaded_at)}</td>
                            <td style={{ padding: '1rem 1rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                              <button
                                onClick={() => handlePreview(document)}
                                style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}
                              >
                                Preview
                              </button>
                              <button
                                onClick={() => handleDownload(document)}
                                style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}
                              >
                                Download
                              </button>
                              {canDeleteDocuments ? (
                                <button
                                  onClick={() => handleDeleteDocument(document.id)}
                                  style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)', background: 'transparent', color: 'var(--danger)', cursor: 'pointer' }}
                                >
                                  Delete
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </section>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Status Card */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>CURRENT STATUS</h3>
            <div style={{ marginBottom: 'var(--space-3)' }}>{statusBadge(invoice.status)}</div>

            {invoice.verified_at ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  ✓ Verified on {formatDate(invoice.verified_at)}
                </div>
              </div>
            ) : null}

            {invoice.approved_at ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                <div>✓ Approved on {formatDate(invoice.approved_at)}</div>
              </div>
            ) : null}

            {invoice.rejection_reason ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--danger)', padding: 'var(--space-2)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-2)' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Rejection Reason</div>
                <div>{invoice.rejection_reason}</div>
              </div>
            ) : null}
          </div>

          {/* Booking Link */}
          {booking ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>LINKED BOOKING</h3>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                <Link to={ROUTES.bookingDetails.replace(':id', booking.id)} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                  {booking.booking_reference}
                </Link>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div>{formatDate(booking.check_in_date)} → {formatDate(booking.check_out_date)}</div>
                <div>{booking.expected_pax} pax</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
