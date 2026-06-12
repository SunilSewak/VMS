/**
 * Request Workflow Panel
 * 
 * Right-side sticky panel showing workflow progress and current action
 */

import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import type { MeetingRequest } from '../features/meetings/types';
import { 
  getWorkflowStage, 
  getWorkflowProgress, 
  getCurrentActionMessage, 
  getCompletedStages,
  WORKFLOW_STAGES,
  type WorkflowStage
} from '../features/workflows/workflowStages';

interface RequestWorkflowPanelProps {
  request: MeetingRequest;
}

export function RequestWorkflowPanel({ request }: RequestWorkflowPanelProps) {
  const currentStage = getWorkflowStage(request.status);
  const completedStages = getCompletedStages(currentStage);
  const progress = getWorkflowProgress(currentStage);
  const actionMessage = getCurrentActionMessage(currentStage);

  const getStageStatus = (stage: WorkflowStage): 'completed' | 'active' | 'pending' => {
    if (completedStages.includes(stage)) return 'completed';
    if (stage === currentStage) return 'active';
    return 'pending';
  };

  return (
    <div style={{
      position: 'sticky',
      top: 'var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
    }}>
      {/* Workflow Progress */}
      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <h4 style={{ fontSize: 'var(--font-md)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
          Workflow Progress
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {WORKFLOW_STAGES.map((stage, index) => {
            const status = getStageStatus(stage.id);
            
            return (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                {/* Icon */}
                <div style={{ flexShrink: 0, paddingTop: '2px' }}>
                  {status === 'completed' && (
                    <CheckCircle size={18} style={{ color: 'var(--status-success)' }} />
                  )}
                  {status === 'active' && (
                    <Circle size={18} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
                  )}
                  {status === 'pending' && (
                    <Circle size={18} style={{ color: 'var(--border)' }} />
                  )}
                </div>

                {/* Label */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 'var(--font-sm)',
                    fontWeight: status === 'active' ? 600 : 400,
                    color: status === 'pending' ? 'var(--text-muted)' : 'var(--text)',
                    marginBottom: '2px',
                  }}>
                    {stage.label}
                  </div>
                  {status === 'active' && (
                    <div style={{
                      fontSize: 'var(--font-xs)',
                      color: 'var(--text-muted)',
                    }}>
                      In Progress
                    </div>
                  )}
                </div>

                {/* Connector line */}
                {index < WORKFLOW_STAGES.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: '8px',
                    top: '24px',
                    width: '2px',
                    height: '24px',
                    background: status === 'completed' 
                      ? 'var(--status-success)' 
                      : 'var(--border)',
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Action Card */}
      <div className="card" style={{
        padding: 'var(--space-4)',
        background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--surface) 100%)',
        border: '1px solid var(--primary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <AlertCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
          <h4 style={{ fontSize: 'var(--font-md)', fontWeight: 600, margin: 0, color: 'var(--primary)' }}>
            Current Action
          </h4>
        </div>
        <p style={{
          fontSize: 'var(--font-sm)',
          color: 'var(--text)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {actionMessage}
        </p>
      </div>

      {/* Progress Summary */}
      <div className="card" style={{ padding: 'var(--space-4)' }}>
        <h4 style={{ fontSize: 'var(--font-md)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
          Progress Summary
        </h4>
        
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <div style={{
            height: '8px',
            background: 'var(--border)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--primary)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'var(--font-xs)',
          color: 'var(--text-muted)',
        }}>
          <span>{progress}% Complete</span>
          <span>{WORKFLOW_STAGES.find(s => s.id === currentStage)?.order || 1} of {WORKFLOW_STAGES.length} stages</span>
        </div>
      </div>
    </div>
  );
}
