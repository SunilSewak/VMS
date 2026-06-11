/**
 * BookingCard — Operational booking card for execution workflow.
 *
 * Layout
 *  ┌──────────────────────────────────────────┐
 *  │  Meeting Name         [Status Badge]     │
 *  │  BKG-2026-4855                           │
 *  ├──────────────────────────────────────────┤
 *  │  Hotel Name                              │
 *  │  Hall Name                               │
 *  │  City                                    │
 *  ├──────────────────────────────────────────┤
 *  │  17 Jun – 19 Jun  │  50 Pax  │  25 Rooms│
 *  ├──────────────────────────────────────────┤
 *  │  ✓ Rooming Complete                      │
 *  │  ⚠ Invoice Pending                       │
 *  │  ⚠ Payment Pending                       │
 *  ├──────────────────────────────────────────┤
 *  │  [View Booking]                          │
 *  └──────────────────────────────────────────┘
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, AlertCircle, Clock, MapPin, Calendar, 
  Users, DoorOpen, Eye 
} from 'lucide-react';
import type { Booking } from '../features/bookings/types';
import { ROUTES } from '../routes/routeRegistry';

function getStatusColor(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return '#6366f1';
    case 'ACTIVE':
      return '#10b981';
    case 'INVOICE_PENDING':
    case 'PAYMENT_PENDING':
      return '#f59e0b';
    case 'COMPLETED':
      return '#059669';
    case 'CANCELLED':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

function getOperationalStatusIcon(status?: string | null): React.ReactNode {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle2 size={14} style={{ color: '#10b981' }} />;
    case 'IN_PROGRESS':
      return <Clock size={14} style={{ color: '#3b82f6' }} />;
    case 'PENDING':
      return <AlertCircle size={14} style={{ color: '#f59e0b' }} />;
    default:
      return <AlertCircle size={14} style={{ color: '#9ca3af' }} />;
  }
}

function getOperationalStatusLabel(status?: string | null): string {
  switch (status) {
    case 'COMPLETED':
      return 'Complete';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'PENDING':
      return 'Pending';
    default:
      return 'Not Started';
  }
}

function getInvoiceStatusLabel(status?: string | null): string {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'RECEIVED':
      return 'Received';
    case 'UNDER_VERIFICATION':
      return 'Verifying';
    case 'VERIFIED':
      return 'Verified';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    default:
      return 'Pending';
  }
}

function getPaymentStatusLabel(status?: string | null): string {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'PARTIAL':
      return 'Partial';
    case 'COMPLETED':
      return 'Paid';
    default:
      return 'Pending';
  }
}

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const navigate = useNavigate();

  const statusColor = getStatusColor(booking.status);
  const accentColor = statusColor;

  const checkInDate = new Date(booking.check_in_date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
  const checkOutDate = new Date(booking.check_out_date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

  const hotelName = booking.hotels?.hotel_name ?? booking.hotel_id;
  const hallName = booking.halls?.hall_name ?? booking.hall_id ?? 'Hall';
  const cityName = booking.hotels?.city_name ?? 'City';
  const meetingName = booking.meeting_requests?.meeting_name ?? 'Meeting';

  const roomingStatus = booking.rooming_status || 'PENDING';
  const invoiceStatus = booking.invoice_status || 'PENDING';
  const paymentStatus = booking.payment_status || 'PENDING';

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: '14px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06), 0 0 0 1px var(--border)',
        borderLeft: `4px solid ${accentColor}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 8px 24px rgba(0,0,0,0.11), 0 0 0 1px var(--border)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 1px 8px rgba(0,0,0,0.06), 0 0 0 1px var(--border)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
      onClick={() => navigate(ROUTES.bookingWorkspace.replace(':id', booking.id))}
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <div style={{ padding: '1.1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '0.6rem',
            marginBottom: '0.35rem',
          }}
        >
          <h4
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            {meetingName}
          </h4>
          <span
            style={{
              flexShrink: 0,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              background: `${statusColor}22`,
              color: statusColor,
            }}
          >
            {booking.status}
          </span>
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            marginBottom: '0.5rem',
          }}
        >
          {booking.booking_reference}
        </div>
      </div>

      {/* ── Venue Section ────────────────────────────────────────── */}
      <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          {hotelName}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          {hallName}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <MapPin size={11} /> {cityName}
        </div>
      </div>

      {/* ── Reservation Details ──────────────────────────────────── */}
      <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.72rem',
              color: 'var(--text-main)',
              fontWeight: 500,
            }}
          >
            <Calendar size={11} style={{ color: 'var(--text-muted)' }} />
            <span>
              {checkInDate} – {checkOutDate}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.72rem',
              color: 'var(--text-main)',
              fontWeight: 500,
            }}
          >
            <Users size={11} style={{ color: 'var(--text-muted)' }} />
            <span>{booking.expected_pax} pax</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.72rem',
              color: 'var(--text-main)',
              fontWeight: 500,
            }}
          >
            <DoorOpen size={11} style={{ color: 'var(--text-muted)' }} />
            <span>{booking.rooms_booked} rooms</span>
          </div>
        </div>
      </div>

      {/* ── Operational Status ────────────────────────────────────── */}
      <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {/* Rooming Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            {getOperationalStatusIcon(roomingStatus)}
            <span style={{ color: 'var(--text-main)' }}>
              Rooming{' '}
              <span style={{ color: 'var(--text-muted)' }}>
                {getOperationalStatusLabel(roomingStatus)}
              </span>
            </span>
          </div>

          {/* Invoice Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            {getOperationalStatusIcon(
              invoiceStatus === 'VERIFIED' || invoiceStatus === 'APPROVED' ? 'COMPLETED' : invoiceStatus === 'PENDING' ? 'PENDING' : 'IN_PROGRESS'
            )}
            <span style={{ color: 'var(--text-main)' }}>
              Invoice{' '}
              <span style={{ color: 'var(--text-muted)' }}>
                {getInvoiceStatusLabel(invoiceStatus)}
              </span>
            </span>
          </div>

          {/* Payment Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            {getOperationalStatusIcon(
              paymentStatus === 'COMPLETED' ? 'COMPLETED' : paymentStatus === 'PENDING' ? 'PENDING' : 'IN_PROGRESS'
            )}
            <span style={{ color: 'var(--text-main)' }}>
              Payment{' '}
              <span style={{ color: 'var(--text-muted)' }}>
                {getPaymentStatusLabel(paymentStatus)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 1.2rem', background: 'var(--background)', display: 'grid', gridTemplateColumns: invoiceStatus === 'PENDING' ? '1fr' : paymentStatus !== 'COMPLETED' ? '1fr' : '1fr', gap: '0.5rem' }}>
        {invoiceStatus === 'PENDING' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.bookingWorkspace.replace(':id', booking.id) + '?tab=invoice');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.8rem',
              background: '#f59e0b',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '1';
            }}
          >
            Upload Invoice
          </button>
        )}
        {paymentStatus !== 'COMPLETED' && invoiceStatus !== 'PENDING' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.bookingWorkspace.replace(':id', booking.id) + '?tab=payment');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.8rem',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '1';
            }}
          >
            Record Payment
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(ROUTES.bookingWorkspace.replace(':id', booking.id));
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.8rem',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.opacity = '1';
          }}
        >
          <Eye size={13} />
          Manage Booking
        </button>
      </div>
    </div>
  );
}
