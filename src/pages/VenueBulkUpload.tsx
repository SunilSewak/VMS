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
      // Parse Excel file
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
      // Parse file again for actual import
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
  // RENDER: UPLOAD STEP
  // ============================================================================

  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Venue Bulk Upload</h1>
              <p className="text-gray-600 mt-2">Upload Excel file to import hotels and halls</p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <History size={18} />
              History
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Upload Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Download Template */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Download Template</h2>
                <p className="text-gray-600 mb-4">
                  Download the Excel template and fill in your venue data. The template includes guidance for each column.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Download size={18} />
                  Download Template
                </button>
              </div>

              {/* Step 2: Upload File */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Upload File</h2>

                {/* Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    {file ? (
                      <>
                        <Check className="w-12 h-12 text-green-600 mb-4" />
                        <p className="text-lg font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <FileUp className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-1">
                          Drag and drop your Excel file here
                        </p>
                        <p className="text-sm text-gray-500">or click to select</p>
                      </>
                    )}
                  </div>

                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                </div>

                <label htmlFor="file-input" className="mt-4 block">
                  <button className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
                    Select File
                  </button>
                </label>
              </div>

              {/* Step 3: Review & Import */}
              {file && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 3: Review & Import</h2>
                  <button
                    onClick={handleGeneratePreview}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400"
                  >
                    {loading ? 'Analyzing...' : 'Analyze & Preview'}
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar: Guidelines */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 h-fit">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Guidelines</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Download template first</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Fill hotel and hall data</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Excel format only (.xlsx)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Max file size: 25 MB</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>All required fields must be filled</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Review validation before importing</span>
                </li>
              </ul>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900 font-medium">
                  ℹ️ Duplicate hotels (same name + city) will be updated, not created.
                </p>
              </div>
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Import Preview</h1>
              <button
                onClick={() => {
                  setStep('upload');
                  setError(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Back
              </button>
            </div>
            <p className="text-gray-600">Review the validation results before confirming the import</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            {/* Summary Cards */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Valid Rows</p>
              <p className="text-2xl font-bold text-green-600">{previewData.validRows}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Invalid Rows</p>
              <p className="text-2xl font-bold text-red-600">{previewData.invalidRows}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Hotels</p>
              <p className="text-2xl font-bold text-blue-600">
                {previewData.hotelsSummary.toCreate + previewData.hotelsSummary.toUpdate}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {previewData.hotelsSummary.toCreate} new, {previewData.hotelsSummary.toUpdate} update
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Halls</p>
              <p className="text-2xl font-bold text-purple-600">
                {previewData.hallsSummary.toCreate + previewData.hallsSummary.toUpdate}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {previewData.hallsSummary.toCreate} new, {previewData.hallsSummary.toUpdate} update
              </p>
            </div>
          </div>

          {/* Validation Messages */}
          {hasErrors && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Validation Errors</h3>
                  <p className="text-red-700 text-sm mb-4">
                    Fix the following errors before importing:
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {previewData.errors
                      .filter((e) => e.severity === 'ERROR')
                      .slice(0, 10)
                      .map((error, idx) => (
                        <div key={idx} className="text-sm text-red-700 font-mono bg-white p-2 rounded">
                          Row {error.row}: {error.field} - {error.error}
                        </div>
                      ))}
                    {previewData.errors.filter((e) => e.severity === 'ERROR').length > 10 && (
                      <p className="text-sm text-red-700 italic">
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
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Warnings</h3>
              <p className="text-yellow-700 text-sm mb-4">
                These warnings won't block the import but should be reviewed:
              </p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {previewData.errors
                  .filter((e) => e.severity === 'WARNING')
                  .slice(0, 5)
                  .map((error, idx) => (
                    <p key={idx} className="text-sm text-yellow-700">
                      Row {error.row}: {error.field} - {error.error}
                    </p>
                  ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setStep('upload');
                setError(null);
              }}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={loading || hasErrors}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400"
            >
              {loading ? 'Importing...' : 'Confirm Import'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: IMPORTING STEP
  // ============================================================================

  if (step === 'importing') {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Importing Data</h2>
          <p className="text-gray-600">Processing your venue data. Please wait...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: COMPLETE STEP
  // ============================================================================

  if (step === 'complete' && importResult) {
    const statusColor = importResult.success ? 'green' : 'red';

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`flex justify-center mb-6`}>
              {importResult.success ? (
                <Check className={`w-16 h-16 text-${statusColor}-600`} />
              ) : (
                <AlertCircle className={`w-16 h-16 text-${statusColor}-600`} />
              )}
            </div>
            <h1 className={`text-3xl font-bold text-${statusColor}-900`}>
              {importResult.success ? 'Import Successful!' : 'Import Failed'}
            </h1>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 mb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Hotels Created</p>
                <p className="text-2xl font-bold text-gray-900">{importResult.hotelCreated}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hotels Updated</p>
                <p className="text-2xl font-bold text-gray-900">{importResult.hotelUpdated}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Halls Created</p>
                <p className="text-2xl font-bold text-gray-900">{importResult.hallCreated}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Halls Updated</p>
                <p className="text-2xl font-bold text-gray-900">{importResult.hallUpdated}</p>
              </div>
            </div>

            {importResult.rowsSkipped > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Rows Skipped (errors)</p>
                <p className="text-lg font-semibold text-red-600">{importResult.rowsSkipped}</p>
              </div>
            )}

            {importResult.importSessionId && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">Session ID: {importResult.importSessionId}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setStep('upload');
                setFile(null);
                setPreviewData(null);
                setImportResult(null);
              }}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Import Another File
            </button>
            <button
              onClick={() => (window.location.href = '/administration/masters/venues')}
              className="flex-1 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              View Venues
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
