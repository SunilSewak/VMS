import { useState } from 'react';
import { CheckCircle2, FileText, Download, X } from 'lucide-react';
import type { InvoiceDocument, InvoiceDocumentType } from '../../features/invoices/types';
import type { UserProfile } from '../../types';
import { downloadInvoiceDocument } from '../../features/invoices/invoiceDocumentService';

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const CHECKLIST_REQUIRED = ['PRIMARY_INVOICE', 'GST_INVOICE', 'ROOMING_REPORT'];

export function InvoiceDocumentsTab({
  documents,
  user,
  uploading,
  loadingDocuments,
  uploadError,
  onUpload,
  onDelete,
  canDeleteDocuments
}: {
  documents: InvoiceDocument[];
  user: UserProfile | null;
  uploading: boolean;
  loadingDocuments: boolean;
  uploadError: string | null;
  onUpload: (file: File, type: InvoiceDocumentType) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  canDeleteDocuments: boolean;
}) {
  const [selectedDocumentType, setSelectedDocumentType] = useState<InvoiceDocumentType>('PRIMARY_INVOICE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const handleUpload = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile, selectedDocumentType);
    setSelectedFile(null);
  };

  const handlePreview = async (document: InvoiceDocument) => {
    try {
      const url = await downloadInvoiceDocument(document);
      setPreviewUrl(url);
    } catch (e) {
      alert('Unable to load preview.');
    }
  };

  const handleDownload = async (document: InvoiceDocument) => {
    try {
      const url = await downloadInvoiceDocument(document);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      link.click();
    } catch (e) {
      alert('Unable to download.');
    }
  };

  const hasType = (type: string) => documents.some(d => d.document_type === type);

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', position: 'relative' }}>
      <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <CheckCircle2 size={18} /> Supporting Documents
      </h2>

      {/* Document Checklist */}
      <div style={{ background: 'var(--background)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-5)' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>Document Checklist</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {CHECKLIST_REQUIRED.map(type => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              {hasType(type) ? <CheckCircle2 size={16} color="var(--success)" /> : <X size={16} color="var(--danger)" />}
              <span style={{ color: hasType(type) ? 'var(--text-main)' : 'var(--danger)', fontWeight: 500 }}>{type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

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

        {uploadError && <div style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{uploadError}</div>}

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
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Uploaded Documents</h3>
        {loadingDocuments ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading documents…</div>
        ) : documents.length === 0 ? (
          <div style={{ color: 'var(--text-muted)' }}>No supporting documents uploaded yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {documents.map((document) => (
              <div key={document.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--background)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                  <FileText size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{document.file_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{document.document_type.replace('_', ' ')} • {formatDate(document.uploaded_at)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button onClick={() => handlePreview(document)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.25rem' }}>Preview</button>
                  <button onClick={() => handleDownload(document)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.25rem' }}><Download size={16}/></button>
                  {canDeleteDocuments && (
                    <button onClick={() => onDelete(document.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}><X size={16}/></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Drawer for PDF Preview */}
      {previewUrl && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '50vw', minWidth: '600px', background: '#fff', zIndex: 1000, boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Document Preview</h3>
            <button onClick={() => setPreviewUrl(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
          </div>
          <iframe src={previewUrl} style={{ flex: 1, border: 'none', width: '100%', height: '100%' }} />
        </div>
      )}
      {previewUrl && (
        <div onClick={() => setPreviewUrl(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} />
      )}
    </div>
  );
}
