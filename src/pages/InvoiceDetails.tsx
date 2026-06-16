import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getInvoiceById, startVerification, verifyInvoice, approveInvoice, rejectInvoice, getInvoiceComments, addInvoiceComment, resolveInvoiceComment, getInvoiceHistory, addInvoiceHistory } from '../features/invoices/invoiceService';
import { getInvoiceDocuments, uploadInvoiceDocument, deleteInvoiceDocument } from '../features/invoices/invoiceDocumentService';
import { validateInvoicePackage, getValidationSummary } from '../features/invoices/invoiceValidationService';
import { runCommercialAudit, getPersistedVariances } from '../services/commercialAuditService';
import { getBookingById } from '../features/bookings/bookingService';
import type { Invoice, InvoiceValidationCheck, InvoiceDocument, InvoiceVarianceRecord, InvoiceReviewComment, InvoiceHistoryEvent } from '../features/invoices/types';
import type { Booking } from '../features/bookings/types';
import { ROUTES } from '../routes/routeRegistry';
import { ROLES } from '../auth/permissions';
import { EmptyState } from '../components/EmptyState';

import { InvoiceSummaryCards } from './invoice-details/InvoiceSummaryCards';
import { InvoiceActionPanel } from './invoice-details/InvoiceActionPanel';
import { InvoiceReviewNotesTab } from './invoice-details/InvoiceReviewNotesTab';
import { InvoiceApprovalHistoryTab } from './invoice-details/InvoiceApprovalHistoryTab';
import { InvoiceValidationTab } from './invoice-details/InvoiceValidationTab';
import { InvoiceDocumentsTab } from './invoice-details/InvoiceDocumentsTab';
import { InvoiceVarianceTab } from './invoice-details/InvoiceVarianceTab';

const statusBadge = (status: string, summary?: any) => {
  let displayStatus = status;
  if (status === 'UNDER_VERIFICATION') displayStatus = 'VALIDATING';
  if (status === 'VERIFIED' && summary?.failedChecks > 0) displayStatus = 'REVIEW_REQUIRED';

  const color =
    displayStatus === 'APPROVED'
      ? 'var(--success)'
      : displayStatus === 'REJECTED'
      ? 'var(--danger)'
      : displayStatus === 'VERIFIED'
      ? 'var(--success)'
      : displayStatus === 'REVIEW_REQUIRED'
      ? 'var(--warning)'
      : 'var(--primary)';

  return (
    <span style={{ display: 'inline-flex', padding: '0.5rem 1rem', borderRadius: '999px', backgroundColor: color + '10', color, fontWeight: 600, fontSize: '0.9rem' }}>
      {displayStatus}
    </span>
  );
};

export function InvoiceDetails() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const params = useParams();
  const { id } = params;
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [validationChecks, setValidationChecks] = useState<InvoiceValidationCheck[]>([]);
  const [validationSummary, setValidationSummary] = useState<any>(null);
  const [commercialVariances, setCommercialVariances] = useState<InvoiceVarianceRecord[]>([]);
  const [comments, setComments] = useState<InvoiceReviewComment[]>([]);
  const [history, setHistory] = useState<InvoiceHistoryEvent[]>([]);
  const [documents, setDocuments] = useState<InvoiceDocument[]>([]);
  
  const [runningAudit, setRunningAudit] = useState(false);
  const [hasRunAudit, setHasRunAudit] = useState(false);
  const [activeTab, setActiveTab] = useState<'variance' | 'validation' | 'documents' | 'notes' | 'history'>('variance');
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
    if (!id || id === 'undefined') {
      setError(`Invoice ID is missing.`);
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
          } catch {}

          const validationResult = await validateInvoicePackage(invoiceData);
          setValidationChecks(validationResult.checks);
          setValidationSummary(getValidationSummary(validationResult));

          try {
            const variances = await getPersistedVariances(invoiceData.id);
            setCommercialVariances(variances);
            if (variances.length > 0) setHasRunAudit(true);
          } catch {}

          try {
            const fetchedComments = await getInvoiceComments(invoiceData.id);
            setComments(fetchedComments);
          } catch {}

          try {
            const fetchedHistory = await getInvoiceHistory(invoiceData.id);
            setHistory(fetchedHistory);
          } catch {}
        }
      } catch (loadError) {
        setError('Failed to load invoice details.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    if (!invoice) return;
    let mounted = true;
    const loadDocs = async () => {
      setLoadingDocuments(true);
      try {
        const docs = await getInvoiceDocuments(invoice.id);
        if (mounted) setDocuments(docs);
      } catch {} finally {
        if (mounted) setLoadingDocuments(false);
      }
    };
    loadDocs();
    return () => { mounted = false; };
  }, [invoice]);

  if (loading) return <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading invoice details...</div>;
  if (error || !invoice) return <EmptyState title="Invoice not found" description={error ?? 'Please go back.'} icon={<AlertCircle size={48} />} />;

  const hasApproveGateIssue = validationSummary?.requiresReview === true;

  const refreshHistory = async () => {
    try {
      setHistory(await getInvoiceHistory(invoice.id));
    } catch {}
  };

  const handleAction = async (action: () => Promise<Invoice>, actionName: string, remarks: string | null = null) => {
    if (!user) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await action();
      setInvoice(updated);
      try { await addInvoiceHistory(invoice.id, actionName, remarks, user); await refreshHistory(); } catch {}
    } catch (err: any) {
      setActionError(err.message || `Unable to ${actionName}.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartVerification = () => handleAction(() => startVerification(invoice.id, user!), 'Started Verification');
  const handleVerify = () => handleAction(() => verifyInvoice(invoice.id, user!), 'Verified Invoice');
  const handleApprove = () => handleAction(() => approveInvoice(invoice.id, user!), 'Approved Invoice');
  const handleReject = () => {
    const reason = window.prompt('Enter rejection reason');
    if (!reason?.trim()) return;
    handleAction(() => rejectInvoice(invoice.id, reason.trim(), user!), 'Rejected Invoice', reason.trim());
  };
  const handleClarify = () => {
    const reason = window.prompt('What needs clarification?');
    if (!reason?.trim()) return;
    handleAction(() => Promise.resolve({ ...invoice, status: 'UNDER_VERIFICATION' }), 'Requested Clarification', reason.trim());
  };
  
  const handleProceedToPayment = () => {
    alert('Payment workflow initiated. Redirecting to payment creation...');
  };

  const handleRunAudit = async () => {
    setRunningAudit(true);
    try {
      await runCommercialAudit(invoice.id);
      setCommercialVariances(await getPersistedVariances(invoice.id));
      setHasRunAudit(true);
      try { await addInvoiceHistory(invoice.id, 'Ran Commercial Audit', null, user!); await refreshHistory(); } catch {}
    } catch (err: any) {
      setActionError(err.message || 'Audit failed');
    } finally {
      setRunningAudit(false);
    }
  };

  const handleAddComment = async (commentText: string) => {
    if (!user) return;
    const newComm = await addInvoiceComment(invoice.id, commentText, user);
    setComments(prev => [...prev, newComm]);
    try { await addInvoiceHistory(invoice.id, 'Added Comment', commentText, user); await refreshHistory(); } catch {}
  };

  const handleResolveComment = async (commentId: string) => {
    if (!user) return;
    await resolveInvoiceComment(commentId, user);
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, resolved: true } : c));
    try { await addInvoiceHistory(invoice.id, 'Resolved Comment', null, user); await refreshHistory(); } catch {}
  };

  const handleUploadDoc = async (file: File, type: any) => {
    if (!user) return;
    setUploading(true);
    setUploadError(null);
    try {
      await uploadInvoiceDocument(invoice.id, file, type, user);
      setDocuments(await getInvoiceDocuments(invoice.id));
      try { await addInvoiceHistory(invoice.id, `Uploaded Document (${type})`, file.name, user); await refreshHistory(); } catch {}
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!window.confirm('Delete document?')) return;
    await deleteInvoiceDocument(docId);
    setDocuments(await getInvoiceDocuments(invoice.id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
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
            Status: {statusBadge(invoice.status, validationSummary)}
          </p>
        </div>
      </div>

      {hasApproveGateIssue ? (
        <div style={{ display: 'flex', gap: '1rem', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--warning)' }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '0.25rem' }} />
          <div>
            <div style={{ fontWeight: 700 }}>1 Critical Variance Detected — Approval Blocked</div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Approval is blocked until variances are accepted or review comments are resolved.</div>
          </div>
        </div>
      ) : null}

      {actionError ? (
        <div style={{ display: 'flex', gap: '1rem', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)' }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '0.25rem' }} />
          <div>{actionError}</div>
        </div>
      ) : null}

      {/* Main Grid: Left content, Right sticky panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-5)', alignItems: 'start' }}>
        
        {/* Left Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          
          <InvoiceSummaryCards invoice={invoice} booking={booking} validationSummary={validationSummary} />

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            {[
              { id: 'variance', label: 'Variance Analysis' },
              { id: 'validation', label: 'Validation Details' },
              { id: 'documents', label: 'Documents' },
              { id: 'notes', label: 'Review Notes' },
              { id: 'history', label: 'Approval History' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : 'var(--text)',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div>
            {activeTab === 'variance' && <InvoiceVarianceTab commercialVariances={commercialVariances} hasRunAudit={hasRunAudit} runningAudit={runningAudit} onRunAudit={handleRunAudit} canManageWorkflow={canManageWorkflow} />}
            {activeTab === 'validation' && <InvoiceValidationTab validationChecks={validationChecks} validationSummary={validationSummary} />}
            {activeTab === 'documents' && <InvoiceDocumentsTab documents={documents} user={user} uploading={uploading} loadingDocuments={loadingDocuments} uploadError={uploadError} onUpload={handleUploadDoc} onDelete={handleDeleteDoc} canDeleteDocuments={canDeleteDocuments} />}
            {activeTab === 'notes' && <InvoiceReviewNotesTab comments={comments} user={user} onAddComment={handleAddComment} onResolveComment={handleResolveComment} />}
            {activeTab === 'history' && <InvoiceApprovalHistoryTab history={history} />}
          </div>

        </div>

        {/* Right Sticky Action Panel */}
        <InvoiceActionPanel 
          invoice={invoice} 
          user={user} 
          actionLoading={actionLoading} 
          hasApproveGateIssue={hasApproveGateIssue} 
          onStartVerification={handleStartVerification}
          onVerify={handleVerify}
          onApprove={handleApprove}
          onReject={handleReject}
          onClarify={handleClarify}
          onProceedToPayment={handleProceedToPayment}
        />
        
      </div>
    </div>
  );
}
