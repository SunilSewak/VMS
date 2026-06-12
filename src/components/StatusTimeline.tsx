/**
 * Status Timeline Component
 * 
 * Step 7: Visual request progress tracking
 * Displays current status and progress through the request lifecycle
 */

import React from 'react';
import { Check } from 'lucide-react';
import {
  STATUS_TIMELINE,
  isStageCompleted,
  isStageCurrent,
  isStagePending,
  getStatusProgress,
  type SalesHeadStatus,
} from '../features/meetings/statusArchitecture';

interface StatusTimelineProps {
  currentStatus: SalesHeadStatus;
  compact?: boolean;
}

export function StatusTimeline({ currentStatus, compact = false }: StatusTimelineProps) {
  const progress = getStatusProgress(currentStatus);

  if (compact) {
    return <CompactTimeline currentStatus={currentStatus} progress={progress} />;
  }

  return <FullTimeline currentStatus={currentStatus} progress={progress} />;
}

// =====================================================================
// FULL TIMELINE (Desktop)
// =====================================================================

function FullTimeline({
  currentStatus,
  progress,
}: {
  currentStatus: SalesHeadStatus;
  progress: number;
}) {
  return (
    <div style={{ width: '100%', padding: 'var(--space-4) 0' }}>
      {/* Progress Bar */}
      <div
        style={{
          height: '4px',
          background: 'var(--border)',
          borderRadius: '2px',
          position: 'relative',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 80%, #000))',
            borderRadius: '2px',
            width: `${progress}%`,
            transition: 'width 0.5s ease',
          }}
        />
      </div>

      {/* Timeline Stages */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          position: 'relative',
        }}
      >
        {STATUS_TIMELINE.map((stage, index) => {
          const isCompleted = isStageCompleted(stage.status, currentStatus);
          const isCurrent = isStageCurrent(stage.status, currentStatus);
          const isPending = isStagePending(stage.status, currentStatus);

          return (
            <div
              key={stage.status}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {/* Stage Node */}
              <div
                style={{
                  width: isCurrent ? '48px' : '40px',
                  height: isCurrent ? '48px' : '40px',
                  borderRadius: '50%',
                  background: isCompleted || isCurrent
                    ? 'var(--primary)'
                    : 'var(--surface)',
                  border: `3px solid ${
                    isCompleted || isCurrent ? 'var(--primary)' : 'var(--border)'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCompleted || isCurrent ? 'white' : 'var(--text-muted)',
                  fontSize: isCurrent ? 'var(--font-lg)' : 'var(--font-md)',
                  fontWeight: isCurrent ? 700 : 600,
                  transition: 'all 0.3s ease',
                  boxShadow: isCurrent ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {isCompleted ? (
                  <Check size={isCurrent ? 24 : 20} strokeWidth={3} />
                ) : (
                  stage.order
                )}
              </div>

              {/* Stage Label */}
              <div
                style={{
                  marginTop: 'var(--space-2)',
                  textAlign: 'center',
                  fontSize: isCurrent ? 'var(--font-sm)' : 'var(--font-xs)',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--primary)' : isPending ? 'var(--text-muted)' : 'var(--text)',
                  maxWidth: '100px',
                  lineHeight: 1.3,
                }}
              >
                {stage.label}
              </div>

              {/* Current Status Indicator */}
              {isCurrent && (
                <div
                  style={{
                    marginTop: 'var(--space-1)',
                    padding: '2px 8px',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-xs)',
                    fontWeight: 600,
                  }}
                >
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

// =====================================================================
// COMPACT TIMELINE (Mobile/Card View)
// =====================================================================

function CompactTimeline({
  currentStatus,
  progress,
}: {
  currentStatus: SalesHeadStatus;
  progress: number;
}) {
  const currentStage = STATUS_TIMELINE.find(s => s.status === currentStatus);
  const completedStages = STATUS_TIMELINE.filter(s =>
    isStageCompleted(s.status, currentStatus)
  ).length;

  return (
    <div style={{ width: '100%' }}>
      {/* Progress Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-2)',
        }}
      >
        <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px' }}>
          <div
            style={{
              height: '100%',
              background: 'var(--primary)',
              borderRadius: '3px',
              width: `${progress}%`,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
        <div style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--primary)' }}>
          {progress}%
        </div>
      </div>

      {/* Current Stage Display */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 'var(--font-xs)',
        }}
      >
        <span style={{ color: 'var(--text-muted)' }}>
          Stage {currentStage?.order || 0} of {STATUS_TIMELINE.length}
        </span>
        <span style={{ fontWeight: 600, color: 'var(--text)' }}>
          {currentStage?.shortLabel || 'Unknown'}
        </span>
      </div>
    </div>
  );
}

// =====================================================================
// STATUS BADGE
// =====================================================================

interface StatusBadgeProps {
  status: SalesHeadStatus;
  showIcon?: boolean;
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const config = STATUS_TIMELINE.find(s => s.status === status);
  
  if (!config) return null;

  const badgeStyles: Record<string, React.CSSProperties> = {
    info: {
      background: '#EFF6FF',
      color: '#1E40AF',
      border: '1px solid #BFDBFE',
    },
    warning: {
      background: '#FFFBEB',
      color: '#B45309',
      border: '1px solid #FDE68A',
    },
    success: {
      background: '#ECFDF5',
      color: '#065F46',
      border: '1px solid #A7F3D0',
    },
    danger: {
      background: '#FEF2F2',
      color: '#991B1B',
      border: '1px solid #FECACA',
    },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        padding: '4px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-xs)',
        fontWeight: 600,
        ...badgeStyles.info,
      }}
    >
      {showIcon && <span>{config.order}</span>}
      {config.shortLabel}
    </span>
  );
}

// =====================================================================
// MINI PROGRESS INDICATOR
// =====================================================================

interface MiniProgressProps {
  currentStatus: SalesHeadStatus;
}

export function MiniProgress({ currentStatus }: MiniProgressProps) {
  const progress = getStatusProgress(currentStatus);
  const currentStage = STATUS_TIMELINE.find(s => s.status === currentStatus);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}
    >
      {STATUS_TIMELINE.map((stage) => {
        const isCompleted = isStageCompleted(stage.status, currentStatus);
        const isCurrent = isStageCurrent(stage.status, currentStatus);

        return (
          <div
            key={stage.status}
            style={{
              flex: 1,
              height: '4px',
              background: isCompleted || isCurrent ? 'var(--primary)' : 'var(--border)',
              borderRadius: '2px',
              transition: 'background 0.3s ease',
            }}
          />
        );
      })}
    </div>
  );
}

