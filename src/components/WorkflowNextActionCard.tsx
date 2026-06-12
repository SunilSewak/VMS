/**
 * Workflow Next Action Card Component
 * 
 * Displays guidance on what should happen next based on current workflow stage.
 * Read-only, no action buttons.
 * 
 * Step 3: Workflow Control Panel
 */

import { ArrowRight } from 'lucide-react';
import type { WorkflowStageId } from '../features/workflows/workflowStages';

interface WorkflowNextActionCardProps {
  currentStage: WorkflowStageId;
}

const NEXT_ACTIONS: Record<WorkflowStageId, string> = {
  REQUEST_SUBMITTED: 'Begin reviewing the request and identify venue requirements.',
  VENUE_EVALUATION: 'Review venue options and shortlist suitable venues.',
  AVAILABILITY_CONFIRMATION: 'Confirm availability from shortlisted venues.',
  VENUE_FINALIZATION: 'Finalize the selected venue and lock venue decision.',
  BOOKING_CREATION: 'Create booking for the finalized venue.',
  INVOICE_VERIFICATION: 'Review and verify the submitted invoice.',
  PAYMENT_TRACKING: 'Track payment status until completion.',
  CLOSURE: 'Workflow completed. Archive or close the request.',
};

export function WorkflowNextActionCard({ currentStage }: WorkflowNextActionCardProps) {
  const nextAction = NEXT_ACTIONS[currentStage];

  return (
    <div style={{
      padding: 'var(--space-4)',
      background: 'color-mix(in srgb, var(--primary) 5%, var(--surface))',
      border: '1px solid color-mix(in srgb, var(--primary) 20%, var(--border))',
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
        <ArrowRight size={16} style={{ color: 'var(--primary)' }} />
        <span style={{
          fontSize: 'var(--font-xs)',
          fontWeight: 600,
          color: 'var(--primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Next Action
        </span>
      </div>

      {/* Action Description */}
      <div style={{
        fontSize: 'var(--font-sm)',
        color: 'var(--text)',
        lineHeight: 1.5,
      }}>
        {nextAction}
      </div>
    </div>
  );
}
