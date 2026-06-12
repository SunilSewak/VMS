/**
 * Action Required Panel Component
 * 
 * Step 7: Display actionable tasks for Sales Head
 * Shows only when user action is required
 */

import React from 'react';
import { AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import {
  getActionRequired,
  getStatusConfig,
  type SalesHeadStatus,
} from '../features/meetings/statusArchitecture';

interface ActionRequiredPanelProps {
  status: SalesHeadStatus;
  requestId: string;
  onAction?: () => void;
}

export function ActionRequiredPanel({
  status,
  requestId,
  onAction,
}: ActionRequiredPanelProps) {
  const actionInfo = getActionRequired(status, requestId);
  const statusConfig = getStatusConfig(status);

  if (!actionInfo.hasAction) {
    return (
      <div
        style={{
          padding: 'var(--space-4)',
          background: '#ECFDF5',
          border: '2px solid #A7F3D0',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}
      >
        <CheckCircle size={24} style={{ color: '#059669', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <h4
            style={{
              fontSize: 'var(--font-md)',
              fontWeight: 700,
              color: '#065F46',
              marginBottom: 'var(--space-1)',
            }}
          >
            No Action Required
          </h4>
          <p
            style={{
              fontSize: 'var(--font-sm)',
              color: '#047857',
              margin: 0,
            }}
          >
            {actionInfo.explanation ||
              'Your request is being processed. Status updates will be provided automatically.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 'var(--space-4)',
        background: '#FFF7ED',
        border: '2px solid #FDBA74',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <AlertCircle size={24} style={{ color: '#EA580C', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ flex: 1 }}>
          <h4
            style={{
              fontSize: 'var(--font-md)',
              fontWeight: 700,
              color: '#9A3412',
              marginBottom: 'var(--space-1)',
            }}
          >
            Action Required
          </h4>
          <p
            style={{
              fontSize: 'var(--font-sm)',
              color: '#C2410C',
              margin: 0,
            }}
          >
            {actionInfo.explanation || statusConfig.explanation}
          </p>
        </div>
      </div>

      {/* Action Button */}
      {actionInfo.actionLabel && (
        <button
          onClick={onAction}
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            width: '100%',
            padding: 'var(--space-3)',
            fontSize: 'var(--font-md)',
            fontWeight: 600,
          }}
        >
          <span>{statusConfig.icon}</span>
          <span>{actionInfo.actionLabel}</span>
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
}

// =====================================================================
// STATUS EXPLANATION CARD
// =====================================================================

interface StatusExplanationProps {
  status: SalesHeadStatus;
}

export function StatusExplanation({ status }: StatusExplanationProps) {
  const config = getStatusConfig(status);

  return (
    <div
      style={{
        padding: 'var(--space-4)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-2)',
        }}
      >
        <span style={{ fontSize: 'var(--font-xl)' }}>{config.icon}</span>
        <h3
          style={{
            fontSize: 'var(--font-lg)',
            fontWeight: 700,
            color: config.color,
            margin: 0,
          }}
        >
          {config.displayName}
        </h3>
      </div>
      <p
        style={{
          fontSize: 'var(--font-sm)',
          color: 'var(--text-muted)',
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        {config.explanation}
      </p>
    </div>
  );
}

// =====================================================================
// QUICK STATUS INDICATOR
// =====================================================================

interface QuickStatusProps {
  status: SalesHeadStatus;
  showExplanation?: boolean;
}

export function QuickStatus({ status, showExplanation = false }: QuickStatusProps) {
  const config = getStatusConfig(status);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        background: `color-mix(in srgb, ${config.color} 10%, transparent)`,
        border: `2px solid color-mix(in srgb, ${config.color} 30%, transparent)`,
        borderRadius: 'var(--radius-md)',
      }}
    >
      <span style={{ fontSize: 'var(--font-md)' }}>{config.icon}</span>
      <div>
        <div
          style={{
            fontSize: 'var(--font-sm)',
            fontWeight: 700,
            color: config.color,
          }}
        >
          {config.displayName}
        </div>
        {showExplanation && (
          <div
            style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--text-muted)',
              marginTop: '2px',
            }}
          >
            {config.explanation}
          </div>
        )}
      </div>
    </div>
  );
}

