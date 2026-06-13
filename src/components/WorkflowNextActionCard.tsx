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
  'request-submitted': 'Begin reviewing the request and identify venue requirements.',
  'venue-evaluation': 'Review venue options and shortlist suitable venues.',
  'booking': 'Create booking for the finalized venue.',
  'invoice': 'Review and verify the submitted invoice.',
  'payment': 'Track payment status until completion.',
  'closed': 'Workflow completed. Archive or close the request.',
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
