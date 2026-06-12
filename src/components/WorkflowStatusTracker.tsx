/**
 * Workflow Status Tracker Component
 * 
 * Horizontal lifecycle tracker showing admin workflow progression.
 * Displays stages from Request Submitted through Payment Complete.
 * Visual indicator of completed, current, and pending stages.
 * 
 * Step 2: Overview Tab Enhancement
 */

import { Check } from 'lucide-react';

export type WorkflowStage = 
  | 'REQUEST_SUBMITTED'
  | 'VENUE_SHORTLISTED'
  | 'QUOTATION_RECEIVED'
  | 'COMMERCIAL_APPROVED'
  | 'BOOKED'
  | 'INVOICE_VERIFIED'
  | 'PAYMENT_COMPLETED';

interface WorkflowStageConfig {
  id: WorkflowStage;
  label: string;
  shortLabel: string;
  order: number;
}

const WORKFLOW_STAGES: WorkflowStageConfig[] = [
  { id: 'REQUEST_SUBMITTED', label: 'Request Submitted', shortLabel: 'Submitted', order: 1 },
  { id: 'VENUE_SHORTLISTED', label: 'Venue Shortlisted', shortLabel: 'Shortlisted', order: 2 },
  { id: 'QUOTATION_RECEIVED', label: 'Quotation Received', shortLabel: 'Quotation', order: 3 },
  { id: 'COMMERCIAL_APPROVED', label: 'Commercial Approved', shortLabel: 'Approved', order: 4 },
  { id: 'BOOKED', label: 'Booked', shortLabel: 'Booked', order: 5 },
  { id: 'INVOICE_VERIFIED', label: 'Invoice Verified', shortLabel: 'Verified', order: 6 },
  { id: 'PAYMENT_COMPLETED', label: 'Payment Completed', shortLabel: 'Paid', order: 7 },
];

interface WorkflowStatusTrackerProps {
  currentStage: WorkflowStage;
  compact?: boolean;
}

export function WorkflowStatusTracker({ currentStage, compact = false }: WorkflowStatusTrackerProps) {
  const currentOrder = WORKFLOW_STAGES.find(s => s.id === currentStage)?.order || 1;

  if (compact) {
    return <CompactTracker currentStage={currentStage} currentOrder={currentOrder} />;
  }

  return <FullTracker currentStage={currentStage} currentOrder={currentOrder} />;
}

// ═════════════════════════════════════════════════════════════════════
// FULL TRACKER (Desktop)
// ═════════════════════════════════════════════════════════════════════

function FullTracker({ 
  currentOrder 
}: { 
  currentStage: WorkflowStage; 
  currentOrder: number;
}) {
  return (
    <div style={{ width: '100%', padding: 'var(--space-4) 0' }}>
      {/* Progress Bar */}
      <div style={{
        position: 'relative',
        height: '4px',
        background: 'var(--border)',
        borderRadius: '2px',
        marginBottom: 'var(--space-4)',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          background: 'linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 80%, #000))',
          borderRadius: '2px',
          width: `${((currentOrder - 1) / (WORKFLOW_STAGES.length - 1)) * 100}%`,
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Stages */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        position: 'relative',
      }}>
        {WORKFLOW_STAGES.map((stage) => {
          const isCompleted = stage.order < currentOrder;
          const isCurrent = stage.order === currentOrder;
          const isPending = stage.order > currentOrder;

          return (
            <div
              key={stage.id}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {/* Stage Node */}
              <div style={{
                width: isCurrent ? '48px' : '40px',
                height: isCurrent ? '48px' : '40px',
                borderRadius: '50%',
                background: isCompleted || isCurrent ? 'var(--primary)' : 'var(--surface)',
                border: `3px solid ${isCompleted || isCurrent ? 'var(--primary)' : 'var(--border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted || isCurrent ? 'white' : 'var(--text-muted)',
                fontSize: isCurrent ? 'var(--font-lg)' : 'var(--font-md)',
                fontWeight: 700,
                transition: 'all 0.3s ease',
                boxShadow: isCurrent ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
                position: 'relative',
                zIndex: 2,
              }}>
                {isCompleted ? (
                  <Check size={isCurrent ? 24 : 20} strokeWidth={3} />
                ) : (
                  stage.order
                )}
              </div>

              {/* Stage Label */}
              <div style={{
                marginTop: 'var(--space-2)',
                textAlign: 'center',
                fontSize: isCurrent ? 'var(--font-sm)' : 'var(--font-xs)',
                fontWeight: isCurrent ? 700 : 500,
                color: isCurrent ? 'var(--primary)' : isPending ? 'var(--text-muted)' : 'var(--text)',
                maxWidth: '100px',
                lineHeight: 1.3,
              }}>
                {stage.label}
              </div>

              {/* Current Badge */}
              {isCurrent && (
                <div style={{
                  marginTop: 'var(--space-1)',
                  padding: '2px 8px',
                  background: 'var(--primary)',
                  color: 'white',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 600,
                }}>
                  Current
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// COMPACT TRACKER (Mobile)
// ═════════════════════════════════════════════════════════════════════

function CompactTracker({ 
  currentStage, 
  currentOrder 
}: { 
  currentStage: WorkflowStage; 
  currentOrder: number;
}) {
  const currentStageConfig = WORKFLOW_STAGES.find(s => s.id === currentStage);
  const progress = ((currentOrder - 1) / (WORKFLOW_STAGES.length - 1)) * 100;

  return (
    <div style={{ width: '100%' }}>
      {/* Progress Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-2)',
      }}>
        <div style={{ 
          flex: 1, 
          height: '6px', 
          background: 'var(--border)', 
          borderRadius: '3px' 
        }}>
          <div style={{
            height: '100%',
            background: 'var(--primary)',
            borderRadius: '3px',
            width: `${progress}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ 
          fontSize: 'var(--font-xs)', 
          fontWeight: 600, 
          color: 'var(--primary)' 
        }}>
          {Math.round(progress)}%
        </div>
      </div>

      {/* Current Stage Display */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 'var(--font-xs)',
      }}>
        <span style={{ color: 'var(--text-muted)' }}>
          Stage {currentOrder} of {WORKFLOW_STAGES.length}
        </span>
        <span style={{ fontWeight: 600, color: 'var(--text)' }}>
          {currentStageConfig?.shortLabel || 'Unknown'}
        </span>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// UTILITY: Map booking status to workflow stage
// ═════════════════════════════════════════════════════════════════════

export function mapBookingStatusToWorkflowStage(
  bookingStatus: string,
  hasQuotations: boolean = false,
  isCommercialApproved: boolean = false,
  hasInvoice: boolean = false,
  isInvoiceVerified: boolean = false,
  isPaymentComplete: boolean = false
): WorkflowStage {
  // Payment completed
  if (isPaymentComplete) {
    return 'PAYMENT_COMPLETED';
  }
  
  // Invoice verified
  if (isInvoiceVerified) {
    return 'INVOICE_VERIFIED';
  }
  
  // Booked (invoice not yet verified)
  if (bookingStatus === 'CONFIRMED' || bookingStatus === 'BOOKED') {
    if (hasInvoice) {
      return 'INVOICE_VERIFIED'; // Assume verified for now
    }
    return 'BOOKED';
  }
  
  // Commercial approved
  if (isCommercialApproved) {
    return 'COMMERCIAL_APPROVED';
  }
  
  // Quotations received
  if (hasQuotations) {
    return 'QUOTATION_RECEIVED';
  }
  
  // Venue shortlisted
  if (bookingStatus === 'VENUES_SHORTLISTED' || bookingStatus === 'SHORTLISTED' || bookingStatus === 'VENUE_FINALIZED') {
    return 'VENUE_SHORTLISTED';
  }
  
  // Default: Request submitted
  return 'REQUEST_SUBMITTED';
}
