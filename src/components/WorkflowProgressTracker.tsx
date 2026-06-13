/**
 * Workflow Progress Tracker Component
 * 
 * Vertical workflow stage tracker for the Workflow Control Panel.
 * Shows completed, current, and pending stages.
 * 
 * Step 3: Workflow Control Panel
 */

import { Check, Circle } from 'lucide-react';
import { 
  getAllStages, 
  isStageCompleted, 
  isStageCurrent, 
  type WorkflowStageId 
} from '../features/workflows/workflowStages';

interface WorkflowProgressTrackerProps {
  currentStage: WorkflowStageId;
}

export function WorkflowProgressTracker({ currentStage }: WorkflowProgressTrackerProps) {
  const stages = getAllStages();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {stages.map((stage, index) => {
        const isCompleted = isStageCompleted(stage.id, currentStage);
        const isCurrent = isStageCurrent(stage.id, currentStage);
        const isLast = index === stages.length - 1;

        return (
          <div key={stage.id} style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
            {/* Connection Line */}
            {!isLast && (
              <div style={{
                position: 'absolute',
                left: '11px',
                top: '24px',
                width: '2px',
                height: '32px',
                background: isCompleted ? 'var(--primary)' : 'var(--border)',
                transition: 'background 0.3s ease',
              }} />
            )}

            {/* Stage Node */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              paddingBottom: isLast ? '0' : 'var(--space-3)',
              position: 'relative',
              zIndex: 1,
              width: '100%',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {/* Icon */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCompleted || isCurrent ? 'var(--primary)' : 'var(--surface)',
                  border: isCompleted || isCurrent ? 'none' : '2px solid var(--border)',
                  color: isCompleted || isCurrent ? 'white' : 'var(--text-muted)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 700,
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                  boxShadow: isCurrent ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
                }}>
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : isCurrent ? (
                    <Circle size={8} fill="currentColor" />
                  ) : (
                    <Circle size={8} />
                  )}
                </div>

                {/* Title */}
                <div style={{
                  flex: 1,
                  fontSize: isCurrent ? 'var(--font-sm)' : 'var(--font-xs)',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--primary)' : isCompleted ? 'var(--text)' : 'var(--text-muted)',
                  lineHeight: 1.3,
                  transition: 'all 0.3s ease',
                }}>
                  {stage.label}
                  {isCurrent && (
                    <span style={{
                      marginLeft: 'var(--space-2)',
                      padding: '2px 6px',
                      background: 'var(--primary)',
                      color: 'white',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}>
                      Current
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
