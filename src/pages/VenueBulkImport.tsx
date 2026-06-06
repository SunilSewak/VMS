import { useState, useRef } from 'react';
import {
  Upload, Download, FileArchive, History, X, AlertCircle, CheckCircle2, Search, FileText
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ImportHistoryItem {
  id: string;
  import_session_id: string;
  file_name: string;
  uploaded_by: string;
  uploaded_at: string;
  rows_processed: number;
  hotels_created: number;
  hotels_updated: number;
  halls_created: number;
  halls_updated: number;
  rows_skipped: number;
  status: 'UPLOADED' | 'VALIDATED' | 'IMPORTING' | 'SUCCESS' | 'FAILED';
  error_report_path?: string;
}

interface ValidationError {
  rowNumber: number;
  field: string;
  error: string;
  value: string;
}

interface ValidationWarning {
  rowNumber: number;
  field: string;
  warning: string;
  value: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_HISTORY: ImportHistoryItem[] = [
  {
    id: '1',
    import_session_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    file_name: 'venues_mumbai_2024.xlsx',
    uploaded_by: 'admin@ajantapharma.com',
    uploaded_at: '2024-01-15T10:30:00Z',
    rows_processed: 47,
    hotels_created: 12,
    hotels_updated: 3,
    halls_created: 47,
    halls_updated: 0,
    rows_skipped: 2,
    status: 'SUCCESS'
  },
  {
    id: '2',
    import_session_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    file_name: 'venues_delhi.xlsx',
    uploaded_by: 'admin@ajantapharma.com',
    uploaded_at: '2024-01-10T14:20:00Z',
    rows_processed: 28,
    hotels_created: 8,
    hotels_updated: 1,
    halls_created: 28,
    halls_updated: 2,
    rows_skipped: 0,
    status: 'SUCCESS'
  },
  {
    id: '3',
    import_session_id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    file_name: 'venues_pune_2024.xlsx',
    uploaded_by: 'admin@ajantapharma.com',
    uploaded_at: '2024-01-05T09:15:00Z',
    rows_processed: 156,
    hotels_created: 0,
    hotels_updated: 0,
    halls_created: 0,
    halls_updated: 0,
    rows_skipped: 156,
    status: 'FAILED'
  }
];

// ─── Main Component ───────────────────────────────────────────────────────────
export function VenueBulkImport() {
  const [activeTab, setActiveTab] = useState<'valid' | 'errors' | 'duplicates' | 'warnings'>('valid');
  const [showHistory, setShowHistory] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<{
    hotelsToCreate: number;
    hotelsToUpdate: number;
    hallsToCreate: number;
    hallsToUpdate: number;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<ValidationWarning[]>([]);
  const [importResult, setImportResult] = useState<{
    status: 'SUCCESS' | 'FAILED';
    hotelsCreated: number;
    hotelsUpdated: number;
    hallsCreated: number;
    hallsUpdated: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Drag & Drop Handlers ────────────────────────────────────────────────
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      setValidationErrors([{ rowNumber: 0, field: 'File Type', error: 'Must be Excel file (.xlsx or .xls)', value: file.name }]);
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setValidationErrors([{ rowNumber: 0, field: 'File Size', error: 'Maximum file size is 25 MB', value: `${(file.size / 1024 / 1024).toFixed(2)} MB` }]);
      return;
    }
    setFile(file);
    setValidationErrors([]);
    setValidationWarnings([]);
    setImportResult(null);
    setDryRunResult(null);
    simulateValidation();
  };

  const simulateValidation = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    setValidationErrors([
      { rowNumber: 15, field: 'Hotel Name', error: 'Missing value', value: 'blank' },
      { rowNumber: 23, field: 'Hall Type', error: 'Must be one of: Ballroom, Conference Room, Board Room, Banquet Hall, Lawn, Rooftop, Meeting Room', value: 'Grand Hall' },
      { rowNumber: 42, field: 'Email', error: 'Invalid format', value: 'invalid-email' }
    ]);
    setValidationWarnings([
      { rowNumber: 8, field: 'Mobile', warning: 'Must be 10 digits', value: '987654321' }
    ]);
    setDryRunResult({ hotelsToCreate: 12, hotelsToUpdate: 3, hallsToCreate: 45, hallsToUpdate: 2 });
  };

  const handleDownloadTemplate = () => {
    const template = [
      ['hotel_name', 'city', 'star_rating', 'total_rooms', 'residential_capacity', 'contact_person', 'mobile', 'email', 'venue_status', 'hall_name', 'hall_type', 'theatre_capacity', 'classroom_capacity', 'u_shape_capacity', 'cluster_capacity', 'boardroom_capacity', 'reception_capacity'],
      ['Sample Hotel Mumbai', 'Mumbai', '5', '100', '200', 'John Doe', '9876543210', 'contact@samplehotel.com', 'ACTIVE', 'Grand Ballroom', 'Ballroom', '200', '100', '80', '50', '30', '250']
    ];
    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'venue_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!file) return;
    setIsImporting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setImportResult({ status: 'SUCCESS', hotelsCreated: 12, hotelsUpdated: 3, hallsCreated: 45, hallsUpdated: 2 });
    setIsImporting(false);
  };

  // ─── Render Methods ────────────────────────────────────────────���──────────
  const renderHeader = () => (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '800', marginBottom: 'var(--space-2)', color: 'var(--text-main)' }}>
        Venue Bulk Import
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
        Bulk import hotel and hall data from Excel files. Supports batch creation and updates.
      </p>
    </div>
  );

  const renderActionBar = () => (
    <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
      <button
        onClick={handleDownloadTemplate}
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          background: '#fff',
          color: 'var(--text-main)',
          fontWeight: '600',
          fontSize: 'var(--font-sm)',
          cursor: 'pointer',
          transition: 'all 200ms ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-main)'; }}
      >
        <Download size={16} />
        Download Template
      </button>
      <button
        onClick={() => setShowHistory(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          background: '#fff',
          color: 'var(--text-main)',
          fontWeight: '600',
          fontSize: 'var(--font-sm)',
          cursor: 'pointer',
          transition: 'all 200ms ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-main)'; }}
      >
        <History size={16} />
        View Import History
      </button>
    </div>
  );

  const renderUploadCard = () => (
    <div
      className="card"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      style={{
        padding: 'var(--space-6)',
        background: dragActive ? '#f5f3ff' : 'var(--surface)',
        borderRadius: 'var(--radius-xl)',
        border: dragActive ? '2px dashed var(--primary)' : '2px dashed var(--border)',
        transition: 'all 300ms ease',
        cursor: 'pointer'
      }}
    >
      <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx,.xls" onChange={handleChange} />
      <div onClick={() => fileInputRef.current?.click()} style={{ textAlign: 'center', cursor: 'pointer' }}>
        <div style={{ width: '80px', height: '80px', margin: '0 auto var(--space-4)', borderRadius: '50%', background: dragActive ? '#eef2ff' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 300ms ease' }}>
          <Upload size={40} style={{ color: dragActive ? 'var(--primary)' : 'var(--text-muted)' }} />
        </div>
        <h4 style={{ fontSize: 'var(--font-base)', fontWeight: '700', marginBottom: 'var(--space-2)', color: 'var(--text-main)' }}>
          {file ? `Selected: ${file.name}` : 'Drag & Drop Excel File Here'}
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-4)' }}>
          or click to browse files
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ padding: '6px 12px', borderRadius: '999px', background: '#f3f4f6', color: 'var(--text-muted)', fontSize: 'var(--font-xs)', fontWeight: '600' }}>
            Maximum file size: 25 MB
          </span>
          <span style={{ padding: '6px 12px', borderRadius: '999px', background: '#f3f4f6', color: 'var(--text-muted)', fontSize: 'var(--font-xs)', fontWeight: '600' }}>
            Format: .xlsx, .xls
          </span>
        </div>
      </div>
    </div>
  );
  const renderDryRunResults = () => {
    if (!dryRunResult) return null;
    return (
      <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-lg)', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h4 style={{ fontSize: 'var(--font-base)', fontWeight: '700', color: 'var(--text-main)' }}>Dry Run Results</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>Preview of import operations (no database changes yet)</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
          <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: '#d1fae5', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-xl)', fontWeight: '800', color: '#059669' }}>{dryRunResult.hotelsToCreate}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: '#065f46', marginTop: 'var(--space-1)' }}>Hotels to Create</div>
          </div>
          <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: '#fef3c7', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-xl)', fontWeight: '800', color: '#d97706' }}>{dryRunResult.hotelsToUpdate}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: '#92400e', marginTop: 'var(--space-1)' }}>Hotels to Update</div>
          </div>
          <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: '#d1fae5', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-xl)', fontWeight: '800', color: '#059669' }}>{dryRunResult.hallsToCreate}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: '#065f46', marginTop: 'var(--space-1)' }}>Halls to Create</div>
          </div>
          <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: '#fef3c7', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-xl)', fontWeight: '800', color: '#d97706' }}>{dryRunResult.hallsToUpdate}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: '#92400e', marginTop: 'var(--space-1)' }}>Halls to Update</div>
          </div>
        </div>
      </div>
    );
  };

  const renderValidationGrid = () => {
    const tabs = [
      { id: 'valid' as const, label: 'Valid Records', icon: CheckCircle2 },
      { id: 'errors' as const, label: 'Errors', icon: AlertCircle },
      { id: 'duplicates' as const, label: 'Duplicates', icon: FileText },
      { id: 'warnings' as const, label: 'Warnings', icon: AlertCircle }
    ];
    return (
      <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-3)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontWeight: '600',
                  fontSize: 'var(--font-sm)',
                  cursor: 'pointer',
                  transition: 'all 200ms ease'
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {activeTab === 'errors' && validationErrors.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-sm)' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '600' }}>Row</th>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '600' }}>Field</th>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '600' }}>Error</th>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '600' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {validationErrors.map((err, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={{ padding: 'var(--space-3)', color: '#ef4444' }}>{err.rowNumber}</td>
                    <td style={{ padding: 'var(--space-3)', fontWeight: '600' }}>{err.field}</td>
                    <td style={{ padding: 'var(--space-3)', color: '#dc2626' }}>{err.error}</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-muted)' }}>{err.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === 'warnings' && validationWarnings.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-sm)' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '600' }}>Row</th>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '600' }}>Field</th>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '600' }}>Warning</th>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '600' }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {validationWarnings.map((warn, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? '#fff' : '#fef3c7' }}>
                    <td style={{ padding: 'var(--space-3)', color: '#d97706' }}>{warn.rowNumber}</td>
                    <td style={{ padding: 'var(--space-3)', fontWeight: '600' }}>{warn.field}</td>
                    <td style={{ padding: 'var(--space-3)', color: '#b45309' }}>{warn.warning}</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-muted)' }}>{warn.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === 'duplicates' && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ color: 'var(--border)', marginBottom: 'var(--space-3)' }} />
              <p style={{ fontSize: 'var(--font-sm)' }}>No duplicate records found in the current file</p>
            </div>
          )}
          {activeTab === 'valid' && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={48} style={{ color: '#059669', marginBottom: 'var(--space-3)' }} />
              <p style={{ fontSize: 'var(--font-sm)' }}>All records validated successfully</p>
            </div>
          )}
          {activeTab === 'errors' && validationErrors.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={48} style={{ color: '#059669', marginBottom: 'var(--space-3)' }} />
              <p style={{ fontSize: 'var(--font-sm)' }}>No validation errors found</p>
            </div>
          )}
          {activeTab === 'warnings' && validationWarnings.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={48} style={{ color: '#059669', marginBottom: 'var(--space-3)' }} />
              <p style={{ fontSize: 'var(--font-sm)' }}>No validation warnings found</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  const renderImportConfirmation = () => {
    if (!dryRunResult || !file) return null;
    return (
      <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)', background: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileArchive size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h4 style={{ fontSize: 'var(--font-base)', fontWeight: '700', color: 'var(--text-main)' }}>Import Confirmation</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>Ready to import <strong>{file.name}</strong></p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end' }}>
          <button
            onClick={() => { setFile(null); setDryRunResult(null); setValidationErrors([]); }}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              background: '#fff',
              color: 'var(--text-main)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 200ms ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting}
            style={{
              padding: 'var(--space-2) var(--space-5)',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: '700',
              cursor: isImporting ? 'not-allowed' : 'pointer',
              transition: 'all 200ms ease'
            }}
          >
            {isImporting ? 'Importing...' : 'Confirm Import'}
          </button>
        </div>
      </div>
    );
  };

  const renderImportResult = () => {
    if (!importResult) return null;
    return (
      <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
          {importResult.status === 'SUCCESS' ? (
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={24} style={{ color: '#059669' }} />
            </div>
          ) : (
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={24} style={{ color: '#ef4444' }} />
            </div>
          )}
          <div>
            <h4 style={{ fontSize: 'var(--font-base)', fontWeight: '700', color: 'var(--text-main)' }}>
              {importResult.status === 'SUCCESS' ? 'Import Completed Successfully' : 'Import Failed'}
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>
              {importResult.status === 'SUCCESS' ? 'Venue data has been updated' : 'Please check the errors and try again'}
            </p>
          </div>
        </div>
        {importResult.status === 'SUCCESS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', background: '#d1fae5', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-lg)', fontWeight: '800', color: '#059669' }}>{importResult.hotelsCreated}</div>
              <div style={{ fontSize: 'var(--font-xs)', color: '#065f46' }}>Hotels Created</div>
            </div>
            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', background: '#fef3c7', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-lg)', fontWeight: '800', color: '#d97706' }}>{importResult.hotelsUpdated}</div>
              <div style={{ fontSize: 'var(--font-xs)', color: '#92400e' }}>Hotels Updated</div>
            </div>
            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', background: '#d1fae5', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-lg)', fontWeight: '800', color: '#059669' }}>{importResult.hallsCreated}</div>
              <div style={{ fontSize: 'var(--font-xs)', color: '#065f46' }}>Halls Created</div>
            </div>
            <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', background: '#fef3c7', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--font-lg)', fontWeight: '800', color: '#d97706' }}>{importResult.hallsUpdated}</div>
              <div style={{ fontSize: 'var(--font-xs)', color: '#92400e' }}>Halls Updated</div>
            </div>
          </div>
        )}
        <button
          onClick={() => { setFile(null); setDryRunResult(null); setImportResult(null); setValidationErrors([]); }}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            background: 'var(--primary)',
            color: '#fff',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 200ms ease'
          }}
        >
          Start New Import
        </button>
      </div>
    );
  };

  const renderHistoryModal = () => {
    if (!showHistory) return null;
    return (
      <>
        <div onClick={() => setShowHistory(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', zIndex: 1000, backdropFilter: 'blur(4px)' }} />
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', zIndex: 1001, width: 'min(90vw, 800px)', maxHeight: '85vh', overflow: 'auto' }}>
          <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
            <div>
              <h3 style={{ fontWeight: '800', fontSize: 'var(--font-size-xl)' }}>Import History</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>Recent venue bulk import sessions</p>
            </div>
            <button onClick={() => setShowHistory(false)} style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ padding: 'var(--space-5)' }}>
            {MOCK_HISTORY.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                <History size={48} style={{ color: 'var(--border)', marginBottom: 'var(--space-3)' }} />
                <p>No import history found</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-sm)' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                  <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontWeight: '600' }}>File</th>
                    <th style={{ padding: 'var(--space-3)', textAlign: 'center', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: 'var(--space-3)', textAlign: 'right', fontWeight: '600' }}>Records</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_HISTORY.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 200ms ease' }}>
                      <td style={{ padding: 'var(--space-3)', color: 'var(--text-main)' }}>{new Date(item.uploaded_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td style={{ padding: 'var(--space-3)', fontWeight: '600', color: 'var(--text-main)' }}>{item.file_name}</td>
                      <td style={{ padding: 'var(--space-3)' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700', background: item.status === 'SUCCESS' ? '#d1fae5' : item.status === 'FAILED' ? '#fee2e2' : '#fef3c7', color: item.status === 'SUCCESS' ? '#059669' : item.status === 'FAILED' ? '#ef4444' : '#d97706' }}>{item.status}</span>
                      </td>
                      <td style={{ padding: 'var(--space-3)', textAlign: 'right', color: 'var(--text-main)' }}>{item.rows_processed} rows</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeIn 0.3s ease' }}>
      {renderHeader()}
      {renderActionBar()}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {renderUploadCard()}
        {dryRunResult && renderDryRunResults()}
        {dryRunResult && renderValidationGrid()}
        {dryRunResult && !importResult && renderImportConfirmation()}
        {importResult && renderImportResult()}
      </div>
      {renderHistoryModal()}
    </div>
  );
}
