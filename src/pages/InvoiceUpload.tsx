import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getBookings } from '../features/bookings/bookingService';
import { createInvoice } from '../features/invoices/invoiceService';
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
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    try {
      // 1. Create the invoice metadata record
      const invoice = await createInvoice(payload, user);

      // 2. Upload the primary invoice file
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

  const loading = bookingsLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
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

      {loading ? (
        <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading bookings...
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: '1fr 320px' }}>
          <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {/* Section A: Upload Invoice File */}
              <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: 'var(--font-md)', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Upload size={18} /> Vendor Invoice File
                </h2>
                
                <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
                  <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Upload File (PDF/Image) *</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) => setInvoiceFile(event.target.files?.[0] ?? null)}
                    style={{
                      width: '100%',
                      padding: '0.9rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      background: 'var(--background)',
                    }}
                  />
                </div>
              </div>

              {/* Section B: Invoice Details */}
              <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: 'var(--font-md)', fontWeight: 700, marginBottom: '1rem' }}>Invoice Details</h2>
                
                <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
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
              </div>

              {/* Section C: Charge Breakdown */}
              <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: 'var(--font-md)', fontWeight: 700, marginBottom: '1rem' }}>Charge Breakdown</h2>

                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Room Charges</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={roomCharges}
                      onChange={(e) => setRoomCharges(e.target.value)}
                      placeholder="0"
                      style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Hall Charges</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={hallCharges}
                      onChange={(e) => setHallCharges(e.target.value)}
                      placeholder="0"
                      style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Food Charges</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={foodCharges}
                      onChange={(e) => setFoodCharges(e.target.value)}
                      placeholder="0"
                      style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Other Charges</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={otherCharges}
                      onChange={(e) => setOtherCharges(e.target.value)}
                      placeholder="0"
                      style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>CGST</label>
                      <input type="number" min="0" step="0.01" value={cgstAmount} onChange={(e) => setCgstAmount(e.target.value)} placeholder="0"
                        style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                    </div>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>SGST</label>
                      <input type="number" min="0" step="0.01" value={sgstAmount} onChange={(e) => setSgstAmount(e.target.value)} placeholder="0"
                        style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                    </div>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>IGST</label>
                      <input type="number" min="0" step="0.01" value={igstAmount} onChange={(e) => setIgstAmount(e.target.value)} placeholder="0"
                        style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
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
              </div>

              {/* Section D: Operational Data */}
              <div style={{ paddingBottom: '1.5rem' }}>
                <h2 style={{ fontSize: 'var(--font-md)', fontWeight: 700, marginBottom: '1rem' }}>Operational Data</h2>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Pax Billed *</label>
                    <input
                      type="number"
                      min="1"
                      value={paxBilled}
                      onChange={(e) => setPaxBilled(e.target.value)}
                      placeholder="0"
                      style={{ width: '100%', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Remarks</label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Any additional remarks or notes..."
                      style={{
                        width: '100%',
                        minHeight: '100px',
                        padding: '0.9rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Error */}
              {submitError ? (
                <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontWeight: 500 }}>
                  {submitError}
                </div>
              ) : null}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={handleUpload}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? 'Uploading...' : 'Upload Invoice'}
                </button>
                <Link
                  to={ROUTES.invoices}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                >
                  Cancel
                </Link>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <div>
            {selectedBooking ? (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', position: 'sticky', top: 'var(--space-4)' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>SELECTED BOOKING</h3>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  {selectedBooking.booking_reference}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'grid', gap: '0.5rem' }}>
                  <div>Check-in: {new Date(selectedBooking.check_in_date).toLocaleDateString('en-IN')}</div>
                  <div>Check-out: {new Date(selectedBooking.check_out_date).toLocaleDateString('en-IN')}</div>
                  <div>Expected pax: {selectedBooking.expected_pax}</div>
                  <div>Rooms: {selectedBooking.rooms_booked}</div>
                  <div>Halls: {selectedBooking.halls_booked}</div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'var(--background)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FileText size={32} style={{ margin: '0 auto var(--space-2)', opacity: 0.5 }} />
                <div style={{ fontSize: '0.9rem' }}>Select a booking to view details</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
