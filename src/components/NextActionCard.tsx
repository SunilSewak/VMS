/**
 * Next Action Card Component
 * 
 * Displays the next required action based on current workflow stage.
 * Helps admin immediately understand what needs to happen next.
 * 
 * Read-only visibility - no action buttons yet.
 * 
 * Step 2: Overview Tab Enhancement
 */

import { AlertCircle, CheckCircle } from 'lucide-react';
import type { WorkflowStage } from './WorkflowStatusTracker';

interface NextActionCardProps {
  currentStage: WorkflowStage;
  bookingStatus?: string;
}

interface NextAction {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low' | 'completed';
}

export function NextActionCard({ currentStage, bookingStatus }: NextActionCardProps) {
  const nextAction = getNextAction(currentStage, bookingStatus);

  return (
    <div style={{
      padding: 'var(--space-5)',
      background: getPriorityBackground(nextAction.priority),
      border: `2px solid ${getPriorityBorder(nextAction.priority)}`,
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
        {nextAction.priority === 'completed' ? (
          <CheckCircle size={24} style={{ color: '#10B981', flexShrink: 0 }} />
        ) : (
          <AlertCircle size={24} style={{ color: getPriorityColor(nextAction.priority), flexShrink: 0 }} />
        )}
        <h4 style={{
          fontSize: 'var(--font-lg)',
          fontWeight: 700,
          margin: 0,
          color: getPriorityColor(nextAction.priority),
        }}>
          {nextAction.title}
        </h4>
      </div>

      {/* Description */}
      <p style={{
        fontSize: 'var(--font-md)',
        color: 'var(--text)',
        margin: 0,
        lineHeight: 1.6,
      }}>
        {nextAction.description}
      </p>

      {/* Priority Badge */}
      {nextAction.priority !== 'completed' && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          padding: '4px 12px',
          background: getPriorityColor(nextAction.priority),
          color: 'white',
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--font-xs)',
          fontWeight: 700,
          alignSelf: 'flex-start',
          textTransform: 'uppercase',
        }}>
          {nextAction.priority} Priority
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// NEXT ACTION MAPPING
// ═════════════════════════════════════════════════════════════════════

function getNextAction(stage: WorkflowStage, _bookingStatus?: string): NextAction {
  switch (stage) {
    case 'REQUEST_SUBMITTED':
      return {
        title: 'Next Action: Review Venue Options',
        description: 'Review the venue requirements and shortlist suitable venues that match the meeting criteria. Evaluate capacity, location, and amenities.',
        priority: 'high',
      };

    case 'VENUE_SHORTLISTED':
      return {
        title: 'Next Action: Collect Quotations',
        description: 'Request and collect detailed quotations from shortlisted venues. Ensure all quotations include venue rental, accommodation, F&B, and other relevant costs.',
        priority: 'high',
      };

    case 'QUOTATION_RECEIVED':
      return {
        title: 'Next Action: Review & Approve Commercial',
        description: 'Compare quotations, negotiate pricing if needed, and approve the commercial terms. Calculate total costs and savings achieved.',
        priority: 'medium',
      };

    case 'COMMERCIAL_APPROVED':
      return {
        title: 'Next Action: Confirm Booking',
        description: 'Proceed with booking confirmation. Collect advance payment if required and finalize the booking contract with the selected venue.',
        priority: 'medium',
      };

    case 'BOOKED':
      return {
        title: 'Next Action: Await Invoice Submission',
        description: 'Wait for the venue to submit the final invoice after the event. Invoice should be submitted within the agreed timeline.',
        priority: 'low',
      };

    case 'INVOICE_VERIFIED':
      return {
        title: 'Next Action: Process Payment',
        description: 'Invoice has been verified against guaranteed pax and quotation. Proceed with payment processing as per payment terms.',
        priority: 'medium',
      };

    case 'PAYMENT_COMPLETED':
      return {
        title: 'Workflow Complete',
        description: 'All stages completed successfully. Payment has been processed and the booking lifecycle is complete. This request can be archived.',
        priority: 'completed',
      };

    default:
      return {
        title: 'Next Action: Review Status',
        description: 'Review the current workflow status and determine the appropriate next steps based on the booking stage.',
        priority: 'medium',
      };
  }
}

// ═════════════════════════════════════════════════════════════════════
// PRIORITY STYLING
// ═════════════════════════════════════════════════════════════════════

function getPriorityColor(priority: NextAction['priority']): string {
  switch (priority) {
    case 'high':
      return '#EF4444'; // Red
    case 'medium':
      return '#F59E0B'; // Orange
    case 'low':
      return '#3B82F6'; // Blue
    case 'completed':
      return '#10B981'; // Green
    default:
      return '#6B7280'; // Gray
  }
}

function getPriorityBackground(priority: NextAction['priority']): string {
  switch (priority) {
    case 'high':
      return '#FEF2F2'; // Light red
    case 'medium':
      return '#FFFBEB'; // Light orange
    case 'low':
      return '#EFF6FF'; // Light blue
    case 'completed':
      return '#ECFDF5'; // Light green
    default:
      return '#F9FAFB'; // Light gray
  }
}

function getPriorityBorder(priority: NextAction['priority']): string {
  switch (priority) {
    case 'high':
      return '#FECACA'; // Red border
    case 'medium':
      return '#FDE68A'; // Orange border
    case 'low':
      return '#BFDBFE'; // Blue border
    case 'completed':
      return '#A7F3D0'; // Green border
    default:
      return '#E5E7EB'; // Gray border
  }
}
