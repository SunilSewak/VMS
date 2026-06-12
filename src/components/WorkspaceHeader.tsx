/**
 * Workspace Header Component
 * 
 * Displays request identification and current stage at the top of Admin Processing Workspace
 */

import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/routeRegistry';
import type { MeetingRequest } from '../features/meetings/types';
import { getWorkflowStage, WORKFLOW_STAGES } from '../features/workflows/workflowStages';

interface WorkspaceHeaderProps {
  request: MeetingRequest;
}

export function WorkspaceHeader({ request }: WorkspaceHeaderProps) {
  const navigate = useNavigate();
  const currentStage = getWorkflowStage(request.status);
  const stageInfo = WORKFLOW_STAGES.find(s => s.id === currentStage);

  return (
    <div style={{
      padding: 'var(--space-4) var(--space-5)',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
    }}>
      {/* Back button */}
      <button
        onClick={() => navigate(ROUTES.meetingRequests)}
        className="btn btn-secondary"
        style={{
          marginBottom: 'var(--space-3)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
        }}
      >
        <ArrowLeft size={14} />
        <span style={{ fontSize: 'var(--font-sm)' }}>Back to Queue</span>
      </button>

      {/* Request header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, margin: 0 }}>
              {request.meeting_name}
            </h2>
            <span className="badge badge-info" style={{ fontSize: 'var(--font-xs)' }}>
              {request.request_number}
            </span>
          </div>
          
          {stageInfo && (
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', margin: 0 }}>
              Current Stage: <strong style={{ color: 'var(--primary)' }}>{stageInfo.label}</strong>
            </p>
          )}
        </div>

        {/* Quick info badges */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <div style={{
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-xs)',
          }}>
            <span style={{ color: 'var(--text-muted)' }}>City: </span>
            <strong>{request.cities?.city_name || request.target_city_name || '—'}</strong>
          </div>
          <div style={{
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-xs)',
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Pax: </span>
            <strong>{request.expected_pax} / {request.guaranteed_pax}</strong>
          </div>
          <div style={{
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-xs)',
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Dates: </span>
            <strong>
              {new Date(request.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              {' – '}
              {new Date(request.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
