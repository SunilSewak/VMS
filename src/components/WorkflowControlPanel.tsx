/**
 * Workflow Control Panel Component
 * 
 * Main control panel for admin workflow navigation and visibility.
 * Replaces disconnected action buttons with structured workflow guidance.
 * 
 * Features:
 * - Vertical workflow progress tracker
 * - Current stage display with objective
 * - Next action guidance
 * - Quick navigation to relevant tab
 * - Progress summary
 * 
 * NO WORKFLOW EXECUTION - Navigation only.
 * 
 * Step 3: Workflow Control Panel
 */

import { WorkflowProgressTracker } from './WorkflowProgressTracker';
import { CurrentStageCard } from './CurrentStageCard';
import { WorkflowNextActionCard } from './WorkflowNextActionCard';
import { WorkflowNavigationCard } from './WorkflowNavigationCard';
import { ProgressSummaryCard } from './ProgressSummaryCard';
import type { WorkflowStageId } from '../features/workflows/workflowStages';

interface WorkflowControlPanelProps {
  currentStage: WorkflowStageId;
  onNavigate: (tabId: string) => void;
}

export function WorkflowControlPanel({ currentStage, onNavigate }: WorkflowControlPanelProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      padding: 'var(--space-4)',
      background: 'var(--background)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      minWidth: '320px',
      maxWidth: '380px',
      height: 'fit-content',
      position: 'sticky',
      top: 'var(--space-4)',
    }}>
      {/* Panel Header */}
      <div style={{
        paddingBottom: 'var(--space-3)',
        borderBottom: '2px solid var(--border)',
      }}>
        <h3 style={{
          fontSize: 'var(--font-lg)',
          fontWeight: 700,
          margin: 0,
          color: 'var(--text)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Workflow Control
        </h3>
      </div>

      {/* Section 1: Workflow Progress */}
      <div>
        <div style={{
          fontSize: 'var(--font-xs)',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 'var(--space-3)',
        }}>
          Workflow Progress
        </div>
        <WorkflowProgressTracker currentStage={currentStage} />
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* Section 2: Current Stage */}
      <CurrentStageCard currentStage={currentStage} />

      {/* Section 3: Next Action */}
      <WorkflowNextActionCard currentStage={currentStage} />

      {/* Section 4: Quick Navigation */}
      <WorkflowNavigationCard currentStage={currentStage} onNavigate={onNavigate} />

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)' }} />

      {/* Section 5: Progress Summary */}
      <ProgressSummaryCard currentStage={currentStage} />
    </div>
  );
}
