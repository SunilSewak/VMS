/**
 * Operational KPI Cards Component
 * 
 * Displays key operational metrics for admin workflow:
 * - Venue Status
 * - Quotations Count
 * - Negotiation Savings
 * - Invoice Status
 * 
 * Step 2: Overview Tab Enhancement
 */

import React from 'react';
import { MapPin, FileText, TrendingDown, Receipt } from 'lucide-react';

// ═════════════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════════════

export type VenueStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'FINALIZED';
export type InvoiceStatus = 'NOT_RECEIVED' | 'RECEIVED' | 'VERIFIED' | 'APPROVED';

interface OperationalKpiCardsProps {
  venueStatus: VenueStatus;
  quotationsReceived: number;
  negotiationSavings: number | null;
  invoiceStatus: InvoiceStatus;
}

// ═════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════

export function OperationalKpiCards({
  venueStatus,
  quotationsReceived,
  negotiationSavings,
  invoiceStatus,
}: OperationalKpiCardsProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 'var(--space-4)',
    }}>
      {/* Venue Status */}
      <KpiCard
        icon={<MapPin size={20} />}
        title="Venue Status"
        value={formatVenueStatus(venueStatus)}
        color={getVenueStatusColor(venueStatus)}
      />

      {/* Quotations Received */}
      <KpiCard
        icon={<FileText size={20} />}
        title="Quotations"
        value={`${quotationsReceived} Received`}
        color={quotationsReceived > 0 ? '#10B981' : '#6B7280'}
      />

      {/* Negotiation Savings */}
      <KpiCard
        icon={<TrendingDown size={20} />}
        title="Negotiation Savings"
        value={negotiationSavings !== null ? `₹${negotiationSavings.toLocaleString('en-IN')}` : 'Not Available'}
        color={negotiationSavings !== null && negotiationSavings > 0 ? '#10B981' : '#6B7280'}
      />

      {/* Invoice Status */}
      <KpiCard
        icon={<Receipt size={20} />}
        title="Invoice Status"
        value={formatInvoiceStatus(invoiceStatus)}
        color={getInvoiceStatusColor(invoiceStatus)}
      />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// KPI CARD SUB-COMPONENT
// ═════════════════════════════════════════════════════════════════════

interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}

function KpiCard({ icon, title, value, color }: KpiCardProps) {
  return (
    <div style={{
      padding: 'var(--space-4)',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}>
        <div style={{ 
          color: color,
          display: 'flex',
          alignItems: 'center',
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: 'var(--font-xs)',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {title}
        </span>
      </div>

      {/* Value */}
      <div style={{
        fontSize: 'var(--font-xl)',
        fontWeight: 700,
        color: color,
        lineHeight: 1.2,
      }}>
        {value}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// FORMATTERS
// ═════════════════════════════════════════════════════════════════════

function formatVenueStatus(status: VenueStatus): string {
  switch (status) {
    case 'NOT_STARTED':
      return 'Not Started';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'FINALIZED':
      return 'Finalized';
    default:
      return 'Unknown';
  }
}

function formatInvoiceStatus(status: InvoiceStatus): string {
  switch (status) {
    case 'NOT_RECEIVED':
      return 'Not Received';
    case 'RECEIVED':
      return 'Received';
    case 'VERIFIED':
      return 'Verified';
    case 'APPROVED':
      return 'Approved';
    default:
      return 'Unknown';
  }
}

function getVenueStatusColor(status: VenueStatus): string {
  switch (status) {
    case 'NOT_STARTED':
      return '#6B7280'; // Gray
    case 'IN_PROGRESS':
      return '#F59E0B'; // Orange
    case 'FINALIZED':
      return '#10B981'; // Green
    default:
      return '#6B7280';
  }
}

function getInvoiceStatusColor(status: InvoiceStatus): string {
  switch (status) {
    case 'NOT_RECEIVED':
      return '#6B7280'; // Gray
    case 'RECEIVED':
      return '#F59E0B'; // Orange
    case 'VERIFIED':
      return '#3B82F6'; // Blue
    case 'APPROVED':
      return '#10B981'; // Green
    default:
      return '#6B7280';
  }
}

// ═════════════════════════════════════════════════════════════════════
// UTILITY: Derive KPI values from booking data
// ═════════════════════════════════════════════════════════════════════

export function deriveKpisFromBooking(booking: any): {
  venueStatus: VenueStatus;
  quotationsReceived: number;
  negotiationSavings: number | null;
  invoiceStatus: InvoiceStatus;
} {
  // Venue Status
  let venueStatus: VenueStatus = 'NOT_STARTED';
  if (booking.status === 'CONFIRMED' || booking.status === 'BOOKED') {
    venueStatus = 'FINALIZED';
  } else if (booking.status === 'VENUES_SHORTLISTED' || booking.status === 'SHORTLISTED' || booking.status === 'VENUE_FINALIZED') {
    venueStatus = 'IN_PROGRESS';
  }

  // Quotations (placeholder - would come from quotations table)
  const quotationsReceived = 0; // TODO: Query quotations table

  // Negotiation Savings (placeholder - would be calculated)
  const negotiationSavings = null; // TODO: Calculate from quotations/commercials

  // Invoice Status
  let invoiceStatus: InvoiceStatus = 'NOT_RECEIVED';
  if (booking.invoice_status) {
    switch (booking.invoice_status.toUpperCase()) {
      case 'PENDING':
      case 'NOT_RECEIVED':
        invoiceStatus = 'NOT_RECEIVED';
        break;
      case 'RECEIVED':
      case 'UPLOADED':
        invoiceStatus = 'RECEIVED';
        break;
      case 'VERIFIED':
        invoiceStatus = 'VERIFIED';
        break;
      case 'APPROVED':
      case 'PAID':
        invoiceStatus = 'APPROVED';
        break;
    }
  }

  return {
    venueStatus,
    quotationsReceived,
    negotiationSavings,
    invoiceStatus,
  };
}
