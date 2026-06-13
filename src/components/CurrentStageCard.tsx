/**
 * Current Stage Card Component
 * 
 * Displays the current workflow stage and its objective.
 * 
 * Step 3: Workflow Control Panel
 */

import { Target } from 'lucide-react';
import { getStageInfo, type WorkflowStageId } from '../features/workflows/workflowStages';

interface CurrentStageCardProps {
  currentStage: WorkflowStageId;
}

export function CurrentStageCard({ currentStage }: CurrentStageCardProps) {
  const stageInfo = getStageInfo(currentStage);

  return (
    <div style={{
      padding: 'var(--space-4)',
      background: 'var(--surface)',
      border: '2px solid var(--primary)',
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
        <Target size={16} style={{ color: 'var(--primary)' }} />
        <span style={{
          fontSize: 'var(--font-xs)',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Current Stage
        </span>
      </div>

      {/* Stage Title */}
      <div style={{
        fontSize: 'var(--font-md)',
        fontWeight: 700,
        color: 'var(--primary)',
        lineHeight: 1.3,
      }}>
        {stageInfo?.label ?? 'Unknown Stage'}
      </div>

      {/* Objective Label */}
      <div style={{
        fontSize: 'var(--font-xs)',
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        Objective
      </div>

      {/* Objective Description */}
      <div style={{
        fontSize: 'var(--font-sm)',
        color: 'var(--text)',
        lineHeight: 1.5,
      }}>
        {stageInfo?.description ?? ''}
      </div>
    </div>
  );
}
