/**
 * BookingCard — Operational booking card for execution workflow.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, AlertCircle, Clock, MapPin, Calendar, 
  Users, DoorOpen, Eye, ArrowRight
} from 'lucide-react';
import type { Booking } from '../features/bookings/types';
import { ROUTES } from '../routes/routeRegistry';

function getStatusColor(status: string): string {
  switch (status) {
    case 'REQUESTED':
      return '#8b5cf6';
    case 'UNDER_REVIEW':
      return '#3b82f6';
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

export interface BookingAction {
  label: string;
  status: "pending" | "completed";
  route: string;
  entityId: string;
  actionText?: string;
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

  const invoiceExists = !!booking.invoices?.length;
  const invoiceId = booking.invoices?.[0]?.id;
  const paymentExists = !!booking.payments?.length;
  const paymentId = booking.payments?.[0]?.id;

  const actions: BookingAction[] = [
    {
      label: 'Rooming',
      status: roomingStatus === 'COMPLETED' ? 'completed' : 'pending',
      route: ROUTES.roomingDetails.replace(':id', booking.id),
      entityId: booking.id,
      actionText: 'Complete Rooming'
    },
    {
      label: 'Invoice',
      status: invoiceStatus === 'VERIFIED' || invoiceStatus === 'APPROVED' ? 'completed' : 'pending',
      route: invoiceExists && invoiceId ? ROUTES.invoiceDetails.replace(':id', invoiceId) : `${ROUTES.invoiceUpload}?bookingId=${booking.id}`,
      entityId: invoiceId || booking.id,
      actionText: invoiceExists ? 'Verify Invoice' : 'Upload Invoice'
    },
    {
      label: 'Payment',
      status: paymentStatus === 'COMPLETED' ? 'completed' : 'pending',
      route: paymentExists && paymentId ? ROUTES.paymentDetails.replace(':id', paymentId) : (invoiceExists && invoiceId ? ROUTES.invoiceDetails.replace(':id', invoiceId) : `${ROUTES.invoiceUpload}?bookingId=${booking.id}`),
      entityId: paymentId || invoiceId || booking.id,
      actionText: 'Process Payment'
    }
  ];

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
      onClick={() => navigate(ROUTES.bookingDetails.replace(':id', booking.id))}
    >
      {/* Header */}
      <div style={{ padding: '1.1rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3, margin: 0 }}>
            {meetingName}
          </h4>
          <span style={{ flexShrink: 0, padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap', background: `${statusColor}22`, color: statusColor }}>
            {booking.status}
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>
          {booking.booking_reference}
        </div>
      </div>

      {/* Venue Section */}
      <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          {hotelName}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          {hallName}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <MapPin size={11} /> {cityName}
        </div>
      </div>

      {/* Reservation Details */}
      <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-main)', fontWeight: 500 }}>
            <Calendar size={11} style={{ color: 'var(--text-muted)' }} />
            <span>{checkInDate} – {checkOutDate}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-main)', fontWeight: 500 }}>
            <Users size={11} style={{ color: 'var(--text-muted)' }} />
            <span>{booking.expected_pax} pax</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-main)', fontWeight: 500 }}>
            <DoorOpen size={11} style={{ color: 'var(--text-muted)' }} />
            <span>{booking.rooms_booked} rooms</span>
          </div>
        </div>
      </div>

      {/* Action Workflow */}
      <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {actions.map((action, idx) => {
            const isCompleted = action.status === 'completed';
            return (
              <div
                key={idx}
                onClick={(e) => { e.stopPropagation(); navigate(action.route); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: isCompleted ? '0.2rem 0' : '0.5rem 0.8rem',
                  background: isCompleted ? 'transparent' : 'var(--warning)11',
                  border: isCompleted ? 'none' : '1px solid var(--warning)33',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: isCompleted ? 'var(--text-main)' : 'var(--warning)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  transition: 'background 0.15s, transform 0.1s'
                }}
                onMouseEnter={!isCompleted ? (e) => { e.currentTarget.style.transform = 'translateX(2px)'; e.currentTarget.style.background = 'var(--warning)22'; } : undefined}
                onMouseLeave={!isCompleted ? (e) => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.background = 'var(--warning)11'; } : undefined}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isCompleted ? <CheckCircle2 size={14} color="var(--success)" /> : <AlertCircle size={14} />}
                  <span>{isCompleted ? `${action.label} Complete` : action.actionText || `${action.label} Pending`}</span>
                </div>
                {!isCompleted && <ArrowRight size={14} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '0.75rem 1.2rem', background: 'var(--background)' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(ROUTES.bookingDetails.replace(':id', booking.id));
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
            width: '100%'
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
        >
          <Eye size={13} />
          Manage Booking
        </button>
      </div>
    </div>
  );
}
