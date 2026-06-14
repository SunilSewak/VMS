import { useState } from 'react';
import { Download, Check, AlertCircle, FileUp, History } from 'lucide-react';
import { parseExcelFile, generateExcelTemplate, generateImportPreview, executeImport } from '../features/venues/importService';
import type { ImportPreviewData, ImportResult, ExcelRow } from '../features/venues/types';
import { useAuth } from '../contexts/AuthContext';

export function VenueBulkUpload() {
  const { user } = useAuth();
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreviewData | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // FILE HANDLING
  // ============================================================================

  function handleDownloadTemplate() {
    const blob = generateExcelTemplate();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Venue_Master_Template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.name.endsWith('.xlsx')) {
      setFile(droppedFile);
    }
  }

  // ============================================================================
  // PREVIEW GENERATION
  // ============================================================================

  async function handleGeneratePreview() {
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const rows = await parseExcelFile(file);

      if (rows.length === 0) {
        setError('No data found in Excel file. Please check your file format.');
        setLoading(false);
        return;
      }

      const preview = await generateImportPreview(rows);
      setPreviewData(preview);
      setStep('preview');
    } catch (err: any) {
      console.error('Error generating preview:', err);
      setError(err.message || 'Failed to parse Excel file. Please ensure it is in .xlsx format.');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // IMPORT EXECUTION
  // ============================================================================

  async function handleExecuteImport() {
    if (!file || !previewData) {
      setError('Missing file or preview data');
      return;
    }

    const hasErrors = previewData.errors.filter((e) => e.severity === 'ERROR').length > 0;
    if (hasErrors) {
      setError('Fix validation errors before importing');
      return;
    }

    setLoading(true);
    setStep('importing');
    setError(null);

    try {
      const rows = await parseExcelFile(file);
      
      if (!user?.id) {
        setError('User information not available');
        setStep('preview');
        setLoading(false);
        return;
      }

      const result = await executeImport(rows, user.id);
      setImportResult(result);
      setStep('complete');
    } catch (err: any) {
      console.error('Error executing import:', err);
      setError(err.message || 'Import failed. Please try again.');
      setStep('preview');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // SHARED STYLES
  // ============================================================================

  const errorBoxStyle = {
    background: 'color-mix(in srgb, var(--danger) 8%, transparent)',
    border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-4)',
    marginBottom: 'var(--space-5)',
  };

  // ============================================================================
  // RENDER: UPLOAD STEP
  // ============================================================================

  if (step === 'upload') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Venue Bulk Upload</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-2)' }}>Upload Excel file to import hotels and halls</p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <History size={18} />
            History
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div style={errorBoxStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <AlertCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--danger)', margin: 0 }}>Error</p>
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--danger)', marginTop: 'var(--space-1)', margin: 'var(--space-1) 0 0' }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-5)' }}>
          {/* Main Upload Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* Step 1: Download Template */}
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-3)' }}>Step 1: Download Template</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-4)' }}>
                Download the Excel template and fill in your venue data. The template includes guidance for each column.
              </p>
              <button
                onClick={handleDownloadTemplate}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                <Download size={18} />
                Download Template
              </button>
            </div>

            {/* Step 2: Upload File */}
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-3)' }}>Step 2: Upload File</h2>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-12)',
                  textAlign: 'center',
                  transition: 'border-color 0.2s, background 0.2s',
                  background: isDragging ? 'color-mix(in srgb, var(--primary) 5%, transparent)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {file ? (
                    <>
                      <Check size={48} style={{ color: '#10b981', marginBottom: 'var(--space-3)' }} />
                      <p style={{ fontSize: 'var(--font-lg)', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{file.name}</p>
                      <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', margin: 'var(--space-1) 0 0' }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <FileUp size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)', opacity: 0.5 }} />
                      <p style={{ fontSize: 'var(--font-lg)', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 var(--space-1)' }}>
                        Drag and drop your Excel file here
                      </p>
                      <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', margin: 0 }}>or click to select</p>
                    </>
                  )}
                </div>

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="file-input"
                />
              </div>

              <label htmlFor="file-input" style={{ display: 'block', marginTop: 'var(--space-3)' }}>
                <button className="btn btn-secondary" style={{ width: '100%' }}>
                  Select File
                </button>
              </label>
            </div>

            {/* Step 3: Review & Import */}
            {file && (
              <div className="card" style={{ padding: 'var(--space-5)' }}>
                <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-3)' }}>Step 3: Review & Import</h2>
                <button
                  onClick={handleGeneratePreview}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', background: loading ? 'var(--text-muted)' : '#10b981' }}
                >
                  {loading ? 'Analyzing...' : 'Analyze & Preview'}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar: Guidelines */}
          <div className="card" style={{ padding: 'var(--space-5)', height: 'fit-content' }}>
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-4)' }}>Guidelines</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                'Download template first',
                'Fill hotel and hall data',
                'Excel format only (.xlsx)',
                'Max file size: 25 MB',
                'All required fields must be filled',
                'Review validation before importing',
              ].map((text, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>•</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            {/* Info Box */}
            <div style={{
              marginTop: 'var(--space-5)', padding: 'var(--space-4)',
              background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
            }}>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--primary)', fontWeight: 600, margin: 0 }}>
                ℹ️ Duplicate hotels (same name + city) will be updated, not created.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: PREVIEW STEP
  // ============================================================================

  if (step === 'preview' && previewData) {
    const hasErrors = previewData.errors.filter((e) => e.severity === 'ERROR').length > 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Import Preview</h1>
            <button
              onClick={() => { setStep('upload'); setError(null); }}
              className="btn btn-secondary"
            >
              Back
            </button>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>Review the validation results before confirming the import</p>
        </div>

        {/* Error Display */}
        {error && (
          <div style={errorBoxStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <AlertCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--danger)', margin: 0 }}>Error</p>
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--danger)', margin: 'var(--space-1) 0 0' }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
          {[
            { label: 'Valid Rows', value: previewData.validRows, color: '#10b981' },
            { label: 'Invalid Rows', value: previewData.invalidRows, color: '#ef4444' },
            { label: 'Hotels', value: previewData.hotelsSummary.toCreate + previewData.hotelsSummary.toUpdate, color: '#3b82f6', sub: `${previewData.hotelsSummary.toCreate} new, ${previewData.hotelsSummary.toUpdate} update` },
            { label: 'Halls', value: previewData.hallsSummary.toCreate + previewData.hallsSummary.toUpdate, color: '#8b5cf6', sub: `${previewData.hallsSummary.toCreate} new, ${previewData.hallsSummary.toUpdate} update` },
          ].map((card) => (
            <div key={card.label} className="card" style={{ padding: 'var(--space-4)' }}>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', margin: 0 }}>{card.label}</p>
              <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: card.color, margin: 'var(--space-1) 0 0' }}>{card.value}</p>
              {card.sub && <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: 'var(--space-1) 0 0' }}>{card.sub}</p>}
            </div>
          ))}
        </div>

        {/* Validation Messages */}
        {hasErrors && (
          <div style={{
            background: 'color-mix(in srgb, var(--danger) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
              <AlertCircle size={24} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--danger)', marginBottom: 'var(--space-2)' }}>Validation Errors</h3>
                <p style={{ color: 'var(--danger)', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-3)' }}>
                  Fix the following errors before importing:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: '16rem', overflowY: 'auto' }}>
                  {previewData.errors
                    .filter((e) => e.severity === 'ERROR')
                    .slice(0, 10)
                    .map((error, idx) => (
                      <div key={idx} style={{ fontSize: 'var(--font-sm)', color: 'var(--danger)', fontFamily: 'monospace', background: 'var(--surface)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                        Row {error.row}: {error.field} - {error.error}
                      </div>
                    ))}
                  {previewData.errors.filter((e) => e.severity === 'ERROR').length > 10 && (
                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--danger)', fontStyle: 'italic' }}>
                      And {previewData.errors.filter((e) => e.severity === 'ERROR').length - 10} more errors...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {previewData.errors.filter((e) => e.severity === 'WARNING').length > 0 && (
          <div style={{
            background: '#f59e0b10', border: '1px solid #f59e0b30',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
          }}>
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: '#92400e', marginBottom: 'var(--space-2)' }}>Warnings</h3>
            <p style={{ color: '#a16207', fontSize: 'var(--font-sm)', marginBottom: 'var(--space-3)' }}>
              These warnings won't block the import but should be reviewed:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '12rem', overflowY: 'auto' }}>
              {previewData.errors
                .filter((e) => e.severity === 'WARNING')
                .slice(0, 5)
                .map((error, idx) => (
                  <p key={idx} style={{ fontSize: 'var(--font-sm)', color: '#a16207', margin: 0 }}>
                    Row {error.row}: {error.field} - {error.error}
                  </p>
                ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <button
            onClick={() => { setStep('upload'); setError(null); }}
            className="btn btn-secondary"
            style={{ padding: '0.85rem 1.5rem' }}
          >
            Cancel
          </button>
          <button
            onClick={handleExecuteImport}
            disabled={loading || hasErrors}
            className="btn btn-primary"
            style={{
              padding: '0.85rem 1.5rem',
              background: (loading || hasErrors) ? 'var(--text-muted)' : '#10b981',
              cursor: (loading || hasErrors) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Importing...' : 'Confirm Import'}
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: IMPORTING STEP
  // ============================================================================

  if (step === 'importing') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-16)' }}>
        <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center', maxWidth: '28rem' }}>
          <div style={{ width: '4rem', height: '4rem', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto var(--space-5)' }} />
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-2)' }}>Importing Data</h2>
          <p style={{ color: 'var(--text-muted)' }}>Processing your venue data. Please wait...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: COMPLETE STEP
  // ============================================================================

  if (step === 'complete' && importResult) {
    const statusColor = importResult.success ? '#10b981' : '#ef4444';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: '40rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
            {importResult.success ? (
              <Check size={64} style={{ color: statusColor }} />
            ) : (
              <AlertCircle size={64} style={{ color: statusColor }} />
            )}
          </div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: statusColor }}>
            {importResult.success ? 'Import Successful!' : 'Import Failed'}
          </h1>
        </div>

        {/* Summary */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
            {[
              { label: 'Hotels Created', value: importResult.hotelCreated },
              { label: 'Hotels Updated', value: importResult.hotelUpdated },
              { label: 'Halls Created', value: importResult.hallCreated },
              { label: 'Halls Updated', value: importResult.hallUpdated },
            ].map((item) => (
              <div key={item.label}>
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', margin: 0 }}>{item.label}</p>
                <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>

          {importResult.rowsSkipped > 0 && (
            <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)', marginTop: 'var(--space-4)' }}>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', margin: 0 }}>Rows Skipped (errors)</p>
              <p style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: '#ef4444', margin: 0 }}>{importResult.rowsSkipped}</p>
            </div>
          )}

          {importResult.importSessionId && (
            <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)', marginTop: 'var(--space-4)' }}>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: 0 }}>Session ID: {importResult.importSessionId}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <button
            onClick={() => {
              setStep('upload');
              setFile(null);
              setPreviewData(null);
              setImportResult(null);
            }}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            Import Another File
          </button>
          <button
            onClick={() => (window.location.href = '/administration/masters/venues')}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            View Venues
          </button>
        </div>
      </div>
    );
  }

  return null;
}
