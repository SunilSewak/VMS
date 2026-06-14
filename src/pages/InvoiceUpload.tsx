import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, FileSignature, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getBookings } from '../features/bookings/bookingService';
import { createInvoice, checkInvoiceExists } from '../features/invoices/invoiceService';
import { uploadInvoiceDocument } from '../features/invoices/invoiceDocumentService';
import type { InvoiceCreateInput } from '../features/invoices/types';
import type { Booking } from '../features/bookings/types';
import { ROUTES } from '../routes/routeRegistry';

export function InvoiceUpload() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingIdParam = searchParams.get('bookingId') ?? undefined;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    let mounted = true;
    const loadBookings = async () => {
      try {
        const items = await getBookings(user);
        if (mounted) setBookings(items);
      } catch (error) {
        console.error('Failed to load bookings:', error);
      } finally {
        if (mounted) setBookingsLoading(false);
      }
    };

    loadBookings();
    return () => { mounted = false; };
  }, [user]);

  const [bookingId, setBookingId] = useState<string>(bookingIdParam ?? '');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [roomCharges, setRoomCharges] = useState('0');
  const [hallCharges, setHallCharges] = useState('0');
  const [foodCharges, setFoodCharges] = useState('0');
  const [otherCharges, setOtherCharges] = useState('0');
  const [cgstAmount, setCgstAmount] = useState('0');
  const [sgstAmount, setSgstAmount] = useState('0');
  const [igstAmount, setIgstAmount] = useState('0');
  const [paxBilled, setPaxBilled] = useState('0');
  const [remarks, setRemarks] = useState('');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractionNote, setExtractionNote] = useState<{ message: string, type: 'info' | 'success' | 'warning', source?: string } | null>(null);
  const [ocrProgress, setOcrProgress] = useState<{ status: string, progress: number, page?: number, totalPages?: number } | null>(null);
  const [rawOcrText, setRawOcrText] = useState<string | null>(null);
  const [ocrPages, setOcrPages] = useState<any[] | null>(null);
  const [extractedDebugFields, setExtractedDebugFields] = useState<any>(null);
  const [suggestedFields, setSuggestedFields] = useState<string[]>([]);
  const [financialSourceMode, setFinancialSourceMode] = useState<'Cover Letter' | 'Tax Invoice' | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFileSelected(file: File | null) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setInvoiceFile(file);
    setExtractionNote(null);
    setOcrProgress(null);
    setRawOcrText(null);
    setOcrPages(null);
    setExtractedDebugFields(null);
    setSuggestedFields([]);
    setFinancialSourceMode(null);

    if (!file) return;

    // Show preview immediately for supported formats
    if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    }

    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) return;

    setExtracting(true);
    try {
      const { extractInvoiceFromPdf } = await import('../features/invoices/pdfExtractionService');
      
      const result = await extractInvoiceFromPdf(file, {
        onProgress: (p) => setOcrProgress(p)
      });

      const f = result.fields;
      if (f.invoiceNumber) setInvoiceNumber(f.invoiceNumber);
      if (f.invoiceDate) setInvoiceDate(f.invoiceDate);
      if (f.roomCharges != null) setRoomCharges(f.roomCharges.toFixed(2));
      if (f.foodCharges != null) setFoodCharges(f.foodCharges.toFixed(2));
      if (f.hallCharges != null) setHallCharges(f.hallCharges.toFixed(2));
      if (f.otherCharges != null) setOtherCharges(f.otherCharges.toFixed(2));
      
      if (result.financialSourceMode === 'Cover Letter') {
        setCgstAmount('');
        setSgstAmount('');
        setIgstAmount('');
      } else {
        if (f.cgstAmount != null) setCgstAmount(f.cgstAmount.toFixed(2));
        if (f.sgstAmount != null) setSgstAmount(f.sgstAmount.toFixed(2));
        if (f.igstAmount != null) setIgstAmount(f.igstAmount.toFixed(2));
      }

      setRawOcrText(result.rawText);
      setExtractedDebugFields(f);
      if (result.ocrPages) setOcrPages(result.ocrPages);
      if (result.suggestedFields) setSuggestedFields(result.suggestedFields);
      if (result.financialSourceMode) setFinancialSourceMode(result.financialSourceMode);

      const sourceStr = result.metrics.source === 'digital-pdf' ? 'Text PDF' : result.metrics.source === 'scanned-pdf' ? 'Scanned PDF (OCR)' : 'Image (OCR)';

      if (result.extractedCount > 0) {
        if (result.validationMismatch) {
          setExtractionNote({
            type: 'warning',
            source: sourceStr,
            message: `Auto-extracted ${result.extractedCount} field(s) with validation mismatch: ${result.validationMessage} Please review and correct the values.`
          });
        } else {
          setExtractionNote({
            type: 'success',
            source: sourceStr,
            message: `Auto-extracted ${result.extractedCount} field(s) via ${sourceStr}. Validation passed. Please review the values.`
          });
        }
      } else {
        setExtractionNote({
          type: 'warning',
          source: sourceStr,
          message: `No fields could be automatically extracted. Please enter the details manually.`
        });
      }
    } catch (err: any) {
      console.error('PDF extraction failed:', err);
      setExtractionNote({
        type: 'warning',
        message: 'Could not read this document automatically. Please enter the details manually.'
      });
    } finally {
      setExtracting(false);
      setOcrProgress(null);
    }
  }

  useEffect(() => {
    if (bookingIdParam) {
      setBookingId(bookingIdParam);
    }
  }, [bookingIdParam]);

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === bookingId) ?? null,
    [bookings, bookingId]
  );

  const subtotalAmount = Math.max(
    0,
    (Number(roomCharges) || 0) +
      (Number(hallCharges) || 0) +
      (Number(foodCharges) || 0) +
      (Number(otherCharges) || 0)
  );
  const taxTotal =
    (Number(cgstAmount) || 0) + (Number(sgstAmount) || 0) + (Number(igstAmount) || 0);
  const invoiceAmount = subtotalAmount + taxTotal;

  const handleUpload = async () => {
    if (!user) return;

    setSubmitError(null);

    if (!invoiceFile) {
      setSubmitError('Vendor invoice file is required.');
      return;
    }
    if (!bookingId) {
      setSubmitError('Booking is required.');
      return;
    }
    if (!invoiceNumber.trim()) {
      setSubmitError('Invoice number is required.');
      return;
    }
    if (!invoiceDate) {
      setSubmitError('Invoice date is required.');
      return;
    }
    if (Number(paxBilled) <= 0) {
      setSubmitError('Pax billed must be greater than zero.');
      return;
    }
    if (invoiceAmount <= 0) {
      setSubmitError('Invoice amount must be greater than zero.');
      return;
    }

    const numOrNull = (v: string) => (v.trim() === '' ? null : Number(v) || 0);
    const payload: InvoiceCreateInput = {
      booking_id: bookingId,
      invoice_number: invoiceNumber.trim(),
      invoice_date: invoiceDate,
      invoice_amount: invoiceAmount,
      room_charges: Number(roomCharges) || 0,
      hall_charges: Number(hallCharges) || 0,
      food_charges: Number(foodCharges) || 0,
      tax_amount: taxTotal,
      pax_billed: Number(paxBilled),
      subtotal_amount: subtotalAmount,
      other_charges: numOrNull(otherCharges),
      cgst_amount: numOrNull(cgstAmount),
      sgst_amount: numOrNull(sgstAmount),
      igst_amount: numOrNull(igstAmount),
      remarks: remarks.trim() || null,
    };

    setSaving(true);
    setSubmitError(null);

    try {
      const exists = await checkInvoiceExists(payload.invoice_number, payload.booking_id);
      if (exists) {
        setSubmitError('Invoice already exists.');
        setSaving(false);
        return;
      }

      const invoice = await createInvoice(payload, user);

      try {
        await uploadInvoiceDocument(invoice.id, 'PRIMARY_INVOICE', invoiceFile, user);
      } catch (uploadErr: any) {
        console.error('Metadata created, but file upload failed:', uploadErr);
        throw new Error(`Invoice details saved, but failed to upload invoice file: ${uploadErr.message || uploadErr}`);
      }

      navigate(`${ROUTES.invoiceDetails.replace(':id', invoice.id)}?created=true`);
    } catch (error: any) {
      setSubmitError(error?.message ?? 'Unable to upload invoice.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeIn 0.3s ease', height: previewUrl ? 'calc(100vh - 120px)' : 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, margin: 0 }}>Upload Invoice</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: '0.5rem' }}>
            Upload vendor invoice file and enter bill details to start verification.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            to={ROUTES.invoices}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ArrowLeft size={16} /> Back to Invoices
          </Link>
        </div>
      </div>

      {bookingsLoading ? (
        <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading bookings...
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gap: 'var(--space-4)', 
          gridTemplateColumns: previewUrl ? 'minmax(400px, 1fr) 500px' : '1fr 320px',
          alignItems: 'start',
          flex: 1,
          minHeight: 0
        }}>
          {/* Left Column: Preview or Default Main Content */}
          {previewUrl ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileSignature size={16} /> Invoice Preview
                </span>
                {extracting && ocrProgress && (
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--primary)', fontWeight: 600 }}>
                    {ocrProgress.status} {ocrProgress.progress > 0 && `${Math.round(ocrProgress.progress * 100)}%`}
                  </span>
                )}
              </div>
              <div style={{ flex: 1, background: '#f0f0f0', position: 'relative' }}>
                <object
                  data={previewUrl}
                  type={invoiceFile?.type}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                >
                  <div style={{ padding: '2rem', textAlign: 'center' }}>Preview not available for this file type.</div>
                </object>
              </div>
            </div>
          ) : (
            <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                  <h2 style={{ fontSize: 'var(--font-md)', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Upload size={18} /> Vendor Invoice File
                  </h2>
                  <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
                    <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Upload File (PDF/Image) *</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(event) => handleFileSelected(event.target.files?.[0] ?? null)}
                      style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }}
                    />
                  </div>
                </div>
                
                {/* When no file is selected, the form just prompts for file primarily.
                    If they want to fill it manually without file, they can. */}
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                  <p>Upload an invoice document to begin data entry and auto-extraction.</p>
                </div>
              </div>
            </section>
          )}

          {/* Right Column: Form (or Sidebar if no file) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', height: previewUrl ? '100%' : 'auto', overflowY: previewUrl ? 'auto' : 'visible', paddingRight: previewUrl ? '0.5rem' : '0' }}>
            
            {/* Debug Panel */}
            {previewUrl && rawOcrText && (
              <div style={{ background: '#1e1e1e', color: '#00ff00', padding: '1rem', borderRadius: 'var(--radius-lg)', fontFamily: 'monospace', fontSize: '12px', overflow: 'auto', maxHeight: '400px' }}>
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#fff' }}>OCR EXTRACTION DEBUG</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
                    <strong style={{ color: '#fff' }}>Detected Pages & Rows:</strong>
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '350px' }}>
                      {ocrPages && ocrPages.length > 0 ? (
                        ocrPages.map((page, pIdx) => (
                          <div key={pIdx} style={{ marginBottom: '8px' }}>
                            <div style={{ fontWeight: 700, color: '#0ea5e9', marginBottom: '4px', textTransform: 'uppercase' }}>
                              Page {page.pageNumber}: {page.pageType}
                            </div>
                            {page.rows.map((row: any, i: number) => (
                              <div key={i} style={{ borderBottom: '1px solid #333', paddingBottom: '4px', whiteSpace: 'nowrap', overflowX: 'auto', opacity: 0.8 }}>
                                {row.text}
                              </div>
                            ))}
                          </div>
                        ))
                      ) : (
                        <pre style={{ whiteSpace: 'pre-wrap', opacity: 0.8 }}>{rawOcrText}</pre>
                      )}
                    </div>
                  </div>
                  <div>
                    <strong style={{ color: '#fff' }}>Field Extraction Debug</strong>
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div>
                        Room Charges:<br/>
                        <span style={{ color: extractedDebugFields?.roomCharges ? '#00ff00' : '#ff4444' }}>{extractedDebugFields?.roomCharges ? `FOUND: ${extractedDebugFields.roomCharges}` : 'NOT FOUND'}</span>
                      </div>
                      <div>
                        Food Charges:<br/>
                        <span style={{ color: extractedDebugFields?.foodCharges ? '#00ff00' : '#ff4444' }}>{extractedDebugFields?.foodCharges ? `FOUND: ${extractedDebugFields.foodCharges}` : 'NOT FOUND'}</span>
                      </div>
                      <div>
                        Hall Charges:<br/>
                        <span style={{ color: extractedDebugFields?.hallCharges ? '#00ff00' : '#ff4444' }}>{extractedDebugFields?.hallCharges ? `FOUND: ${extractedDebugFields.hallCharges}` : 'NOT FOUND'}</span>
                      </div>
                      <div>
                        Grand Total:<br/>
                        <span style={{ color: extractedDebugFields?.invoiceAmount ? '#00ff00' : '#ff4444' }}>{extractedDebugFields?.invoiceAmount ? `FOUND: ${extractedDebugFields.invoiceAmount}` : 'NOT FOUND'}</span>
                      </div>
                      <div>
                        GST Number:<br/>
                        <span style={{ color: extractedDebugFields?.gstNumber ? '#00ff00' : '#ff4444' }}>{extractedDebugFields?.gstNumber ? `FOUND: ${extractedDebugFields.gstNumber}` : 'NOT FOUND'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Show extraction status banner if we have a file */}
            {previewUrl && extractionNote && (
              <div style={{
                padding: '1rem', borderRadius: 'var(--radius-lg)',
                background: extractionNote.type === 'success' ? '#10b98115' : '#f59e0b15',
                border: `1px solid ${extractionNote.type === 'success' ? '#10b98140' : '#f59e0b40'}`,
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start'
              }}>
                {extractionNote.type === 'success' ? (
                  <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <AlertTriangle size={20} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                )}
                <div>
                  <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    Extraction Result {extractionNote.source && <span style={{ opacity: 0.7, fontWeight: 400 }}>({extractionNote.source})</span>}
                  </div>
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {extractionNote.message}
                  </div>
                </div>
              </div>
            )}

            {/* If we have a file, the form is here. If we don't have a file, the form is empty, just the sidebar shows. */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', display: previewUrl ? 'block' : 'none' }}>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                
                {/* File Upload re-selector (mini version) */}
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Change File</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) => handleFileSelected(event.target.files?.[0] ?? null)}
                    style={{ width: '100%', padding: '0.6rem', fontSize: 'var(--font-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  />
                </div>

                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Booking *</label>
                  <select
                    value={bookingId}
                    onChange={(event) => setBookingId(event.target.value)}
                    style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                  >
                    <option value="">Select a booking</option>
                    {bookings
                      .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
                      .map((booking) => (
                        <option key={booking.id} value={booking.id}>
                          {booking.booking_reference} — {booking.check_in_date}
                        </option>
                      ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Invoice Number *</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="INV-2024-..."
                      style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Invoice Date *</label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                    />
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Charge Breakdown</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                        Room Charges
                        {suggestedFields.includes('roomCharges') && <span style={{ marginLeft: '6px', color: '#f59e0b', fontSize: '10px', display: 'flex', alignItems: 'center' }}><AlertTriangle size={10} style={{ marginRight: '1px' }} /> Suggested</span>}
                      </label>
                      <input type="number" min="0" step="100" value={roomCharges} onChange={(e) => setRoomCharges(e.target.value)} placeholder="0"
                        style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                    </div>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                        Hall Charges
                        {suggestedFields.includes('hallCharges') && <span style={{ marginLeft: '6px', color: '#f59e0b', fontSize: '10px', display: 'flex', alignItems: 'center' }}><AlertTriangle size={10} style={{ marginRight: '1px' }} /> Suggested</span>}
                      </label>
                      <input type="number" min="0" step="100" value={hallCharges} onChange={(e) => setHallCharges(e.target.value)} placeholder="0"
                        style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                    </div>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                        Food Charges
                        {suggestedFields.includes('foodCharges') && <span style={{ marginLeft: '6px', color: '#f59e0b', fontSize: '10px', display: 'flex', alignItems: 'center' }}><AlertTriangle size={10} style={{ marginRight: '1px' }} /> Suggested</span>}
                      </label>
                      <input type="number" min="0" step="100" value={foodCharges} onChange={(e) => setFoodCharges(e.target.value)} placeholder="0"
                        style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                    </div>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                        Other Charges
                        {suggestedFields.includes('otherCharges') && <span style={{ marginLeft: '6px', color: '#f59e0b', fontSize: '10px', display: 'flex', alignItems: 'center' }}><AlertTriangle size={10} style={{ marginRight: '1px' }} /> Suggested</span>}
                      </label>
                      <input type="number" min="0" step="1" value={otherCharges} onChange={(e) => setOtherCharges(e.target.value)} placeholder="0"
                        style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                        CGST
                        {financialSourceMode === 'Cover Letter' && <span style={{ marginLeft: '6px', color: '#10b981', fontSize: '10px' }}>(Tax-Inclusive Summary)</span>}
                        {financialSourceMode !== 'Cover Letter' && suggestedFields.includes('cgstAmount') && <span style={{ marginLeft: '6px', color: '#f59e0b', fontSize: '10px', display: 'flex', alignItems: 'center' }}><AlertTriangle size={10} style={{ marginRight: '1px' }} /> Suggested</span>}
                      </label>
                      <input 
                        type={financialSourceMode === 'Cover Letter' ? "text" : "number"} 
                        min="0" step="0.01" 
                        value={financialSourceMode === 'Cover Letter' ? "Tax Source Not Used" : cgstAmount} 
                        onChange={(e) => setCgstAmount(e.target.value)} 
                        placeholder="0"
                        disabled={financialSourceMode === 'Cover Letter'}
                        style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: financialSourceMode === 'Cover Letter' ? 'var(--bg-surface)' : undefined, color: financialSourceMode === 'Cover Letter' ? 'var(--text-muted)' : undefined }} />
                    </div>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                        SGST
                        {financialSourceMode !== 'Cover Letter' && suggestedFields.includes('sgstAmount') && <span style={{ marginLeft: '6px', color: '#f59e0b', fontSize: '10px', display: 'flex', alignItems: 'center' }}><AlertTriangle size={10} style={{ marginRight: '1px' }} /> Suggested</span>}
                      </label>
                      <input 
                        type={financialSourceMode === 'Cover Letter' ? "text" : "number"} 
                        min="0" step="0.01" 
                        value={financialSourceMode === 'Cover Letter' ? "Tax Source Not Used" : sgstAmount} 
                        onChange={(e) => setSgstAmount(e.target.value)} 
                        placeholder="0"
                        disabled={financialSourceMode === 'Cover Letter'}
                        style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: financialSourceMode === 'Cover Letter' ? 'var(--bg-surface)' : undefined, color: financialSourceMode === 'Cover Letter' ? 'var(--text-muted)' : undefined }} />
                    </div>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                        IGST
                        {financialSourceMode !== 'Cover Letter' && suggestedFields.includes('igstAmount') && <span style={{ marginLeft: '6px', color: '#f59e0b', fontSize: '10px', display: 'flex', alignItems: 'center' }}><AlertTriangle size={10} style={{ marginRight: '1px' }} /> Suggested</span>}
                      </label>
                      <input 
                        type={financialSourceMode === 'Cover Letter' ? "text" : "number"} 
                        min="0" step="0.01" 
                        value={financialSourceMode === 'Cover Letter' ? "Tax Source Not Used" : igstAmount} 
                        onChange={(e) => setIgstAmount(e.target.value)} 
                        placeholder="0"
                        disabled={financialSourceMode === 'Cover Letter'}
                        style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: financialSourceMode === 'Cover Letter' ? 'var(--bg-surface)' : undefined, color: financialSourceMode === 'Cover Letter' ? 'var(--text-muted)' : undefined }} />
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--background)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', display: 'grid', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                    <div>Subtotal</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{subtotalAmount.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                    <div>Tax (CGST+SGST+IGST)</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{taxTotal.toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                    <div style={{ fontWeight: 700 }}>Grand Total</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>₹{invoiceAmount.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Operational Data</h3>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Pax Billed *</label>
                      <input
                        type="number"
                        min="1"
                        value={paxBilled}
                        onChange={(e) => setPaxBilled(e.target.value)}
                        placeholder="0"
                        style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Remarks</label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Any additional remarks or notes..."
                        style={{ width: '100%', minHeight: '60px', padding: '0.7rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontFamily: 'inherit', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontWeight: 500, fontSize: 'var(--font-sm)' }}>
                    {submitError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={handleUpload}
                    disabled={saving || extracting}
                    style={{
                      flex: 1, padding: '1rem', borderRadius: 'var(--radius-lg)', border: 'none',
                      background: 'var(--primary)', color: '#fff', fontWeight: 700,
                      cursor: (saving || extracting) ? 'not-allowed' : 'pointer',
                      opacity: (saving || extracting) ? 0.6 : 1,
                    }}
                  >
                    {saving ? 'Creating Invoice...' : 'Submit Invoice'}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar Booking Details (Shows underneath form if preview active, or beside empty upload prompt) */}
            {selectedBooking ? (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>SELECTED BOOKING DETAILS</h3>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  {selectedBooking.booking_reference}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'grid', gap: '0.5rem', gridTemplateColumns: '1fr 1fr' }}>
                  <div>Check-in: {new Date(selectedBooking.check_in_date).toLocaleDateString('en-IN')}</div>
                  <div>Check-out: {new Date(selectedBooking.check_out_date).toLocaleDateString('en-IN')}</div>
                  <div>Expected pax: {selectedBooking.expected_pax}</div>
                  <div>Rooms: {selectedBooking.rooms_booked}</div>
                  <div style={{ gridColumn: '1 / -1' }}>Halls: {selectedBooking.halls_booked}</div>
                </div>
              </div>
            ) : (
              !previewUrl && (
                <div style={{ background: 'var(--background)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <FileText size={32} style={{ margin: '0 auto var(--space-2)', opacity: 0.5 }} />
                  <div style={{ fontSize: '0.9rem' }}>Select a booking to view details</div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
