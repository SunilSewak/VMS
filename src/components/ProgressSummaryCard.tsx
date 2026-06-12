/**
 * Progress Summary Card Component
 * 
 * Displays workflow completion progress summary.
 * Shows both stages completed and percentage.
 * 
 * Step 3: Workflow Control Panel
 */

import { TrendingUp } from 'lucide-react';
import { 
  calculateProgress, 
  getCompletedStagesCount, 
  getAllStages,
  type WorkflowStageId 
} from '../features/workflows/workflowStages';

interface ProgressSummaryCardProps {
  currentStage: WorkflowStageId;
}

export function ProgressSummaryCard({ currentStage }: ProgressSummaryCardProps) {
  const completedCount = getCompletedStagesCount(currentStage);
  const totalStages = getAllStages().length;
  const percentage = calculateProgress(currentStage);

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
        justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}>
          <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
          <span style={{
            fontSize: 'var(--font-xs)',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Progress
          </span>
        </div>
        <span style={{
          fontSize: 'var(--font-lg)',
          fontWeight: 700,
          color: 'var(--primary)',
        }}>
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '8px',
        background: 'var(--border)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 80%, #000))',
          borderRadius: 'var(--radius-full)',
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Stage Count */}
      <div style={{
        fontSize: 'var(--font-sm)',
        color: 'var(--text)',
        textAlign: 'center',
      }}>
        <strong>{completedCount}</strong> of <strong>{totalStages}</strong> stages completed
      </div>
    </div>
  );
}
