/**
 * MeetingRequestCard — Unified request card for all roles.
 *
 * Layout
 *  ┌──────────────────────────────────────────┐
 *  │  Meeting Name (bold)       [Status Badge] │
 *  │  # REQ-001  •  📍 Mumbai                 │
 *  │  [📅 15–18 Oct]  [👤 150 pax]             │
 *  │  ──────────────────────────────────────── │
 *  │  ●──●──◉──○──○──○                        │
 *  │  Req Venue Avail Book Inv Pay             │
 *  │  ──────────────────────────────────────── │
 *  │  [View]          [PRIMARY ACTION ▶]       │
 *  └──────────────────────────────────────────┘
 *
 * Role affects ONLY the primary CTA — not card structure.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Users, Hash,
  Search, Send, Clock, CheckCircle2,
  Eye, Loader2, ClipboardCheck, CalendarCheck,
} from 'lucide-react';
import type { MeetingRequest } from '../features/meetings/types';
import { MEETING_STATUSES } from '../features/meetings/constants';
import { ROUTES } from '../routes/routeRegistry';
import type { AppRole } from '../auth/permissions';
import { ROLES } from '../auth/permissions';

// ─── Workflow stages ────────────────────────────────────────────────────────
const WORKFLOW_STAGES = [
  { key: 'request',      label: 'Request'      },
  { key: 'venue',        label: 'Venue'        },
  { key: 'availability', label: 'Availability' },
  { key: 'booking',      label: 'Booking'      },
  { key: 'invoice',      label: 'Invoice'      },
  { key: 'payment',      label: 'Payment'      },
] as const;

/** Maps any DB status string to a 0-based stage index. */
function getWorkflowStage(status: string): number {
  switch (status) {
    case 'DRAFT':
      return 0;
    case 'VENUES_SHORTLISTED':
    case 'SHORTLISTED':
      return 1;
    case 'SUBMITTED_TO_ADMIN':
    case 'SUBMITTED':
    case 'VENUE_FINALIZED':
    case 'AVAILABILITY_CHECK':
      return 2;
    case 'VENUE_UNAVAILABLE':
      return 1;
    case 'BOOKED':
      return 3;
    case 'INVOICE_RECEIVED':
    case 'VERIFIED':
    case 'APPROVED':
      return 4;
    case 'PAID':
    case 'COMPLETED':
    case 'CLOSED':
      return 5;
    default:
      return 0;
  }
}

// ─── Status accent colours ──────────────────────────────────────────────────
function getAccentColor(status: string): string {
  switch (status) {
    case 'DRAFT':                                 return '#6366f1';
    case 'VENUES_SHORTLISTED': case 'SHORTLISTED':return '#8b5cf6';
    case 'SUBMITTED_TO_ADMIN': case 'SUBMITTED':
    case 'AVAILABILITY_CHECK': case 'VENUE_FINALIZED': return '#f59e0b';
    case 'VENUE_UNAVAILABLE':                    return '#ef4444';
    case 'BOOKED':                                return '#10b981';
    case 'INVOICE_RECEIVED': case 'VERIFIED':
    case 'APPROVED':                              return '#3b82f6';
    case 'PAID': case 'COMPLETED':                return '#059669';
    case 'CLOSED':                                return '#9ca3af';
    default:                                      return '#6366f1';
  }
}

// ─── Badge styles ───────────────────────────────────────────────────────────
const BADGE_STYLES: Record<string, React.CSSProperties> = {
  info:    { background: 'rgba(99,102,241,0.1)',  color: '#6366f1', border: '1px solid rgba(99,102,241,0.25)'  },
  warning: { background: 'rgba(245,158,11,0.1)',  color: '#d97706', border: '1px solid rgba(245,158,11,0.25)'  },
  success: { background: 'rgba(16,185,129,0.1)',  color: '#059669', border: '1px solid rgba(16,185,129,0.25)'  },
  danger:  { background: 'rgba(239,68,68,0.1)',   color: '#dc2626', border: '1px solid rgba(239,68,68,0.25)'   },
};

// ─── Role-aware CTA config ──────────────────────────────────────────────────
interface ActionConfig {
  label: string;
  icon: React.ReactNode;
  variant: 'primary' | 'success' | 'muted';
  onClick: (req: MeetingRequest, navigate: ReturnType<typeof useNavigate>, onSubmit: (id: string) => void) => void;
}

function getActionConfig(status: string, role: AppRole): ActionConfig {
  const isAdmin = role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;

  if (isAdmin) {
    switch (status) {
      case 'SUBMITTED_TO_ADMIN':
      case 'SUBMITTED':
        return { label: 'Review & Process', icon: <ClipboardCheck size={14} />, variant: 'primary',
          onClick: (req, nav) => nav(`/meeting-requests/${req.id}`) };
      case 'AVAILABILITY_CHECK':
        return { label: 'Confirm Availability', icon: <CalendarCheck size={14} />, variant: 'primary',
          onClick: (req, nav) => nav(`/meeting-requests/${req.id}`) };
      case 'BOOKED':
        return { label: 'Manage Booking', icon: <CheckCircle2 size={14} />, variant: 'success',
          onClick: (req, nav) => nav(`/meeting-requests/${req.id}`) };
      default:
        return { label: 'View Request', icon: <Eye size={14} />, variant: 'muted',
          onClick: (req, nav) => nav(`/meeting-requests/${req.id}`) };
    }
  }

  // Sales Head & others
  switch (status) {
    case 'DRAFT':
      return { label: 'Find Venues', icon: <Search size={14} />, variant: 'primary',
        onClick: (req, nav) => nav(`${ROUTES.venueExplorer}?requestId=${req.id}`) };
    case 'VENUES_SHORTLISTED':
    case 'SHORTLISTED':
      return { label: 'Submit to Admin', icon: <Send size={14} />, variant: 'primary',
        onClick: (req, _nav, onSubmit) => onSubmit(req.id) };
    case 'SUBMITTED_TO_ADMIN':
    case 'SUBMITTED':
    case 'AVAILABILITY_CHECK':
    case 'VENUE_FINALIZED':
      return { label: 'Track Status', icon: <Clock size={14} />, variant: 'muted',
        onClick: (req, nav) => nav(`/meeting-requests/${req.id}`) };
    case 'VENUE_UNAVAILABLE':
      return { label: 'Choose New Venue', icon: <Search size={14} />, variant: 'primary',
        onClick: (req, nav) => nav(`${ROUTES.venueExplorer}?requestId=${req.id}`) };
    case 'BOOKED':
      return { label: 'View Booking', icon: <CheckCircle2 size={14} />, variant: 'success',
        onClick: (req, nav) => nav(`/meeting-requests/${req.id}`) };
    default:
      return { label: 'View Details', icon: <Eye size={14} />, variant: 'muted',
        onClick: (req, nav) => nav(`/meeting-requests/${req.id}`) };
  }
}

// ─── Compact Workflow Stepper ───────────────────────────────────────────────
function WorkflowStepper({ currentStage }: { currentStage: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
      {WORKFLOW_STAGES.map((stage, idx) => {
        const isCompleted = idx < currentStage;
        const isCurrent   = idx === currentStage;

        return (
          <React.Fragment key={stage.key}>
            {/* Dot + label */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <div
                style={{
                  width:        isCurrent ? 10 : 8,
                  height:       isCurrent ? 10 : 8,
                  borderRadius: '50%',
                  background:   isCompleted ? 'var(--primary)' : 'transparent',
                  border:       isCompleted
                    ? 'none'
                    : isCurrent
                    ? '2px solid var(--primary)'
                    : '2px solid var(--border)',
                  boxShadow: isCurrent ? '0 0 0 3px rgba(99,102,241,0.18)' : 'none',
                  transition:   'all 0.2s',
                }}
              />
              <span
                style={{
                  fontSize:  '8.5px',
                  fontWeight: isCurrent ? 700 : 500,
                  color:     isCompleted || isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  lineHeight: 1,
                }}
              >
                {stage.label}
              </span>
            </div>

            {/* Connector line (skip after last dot) */}
            {idx < WORKFLOW_STAGES.length - 1 && (
              <div
                style={{
                  flex:           1,
                  height:         '1px',
                  marginTop:      '4px', // align with dot centre
                  background:     isCompleted ? 'var(--primary)' : 'var(--border)',
                  transition:     'background 0.2s',
                  minWidth:       '6px',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Card component ─────────────────────────────────────────────────────────
export interface MeetingRequestCardProps {
  request:    MeetingRequest;
  userRole:   AppRole;
  isMutating: boolean;
  onSubmit:   (id: string) => void;
}

export function MeetingRequestCard({
  request,
  userRole,
  isMutating,
  onSubmit,
}: MeetingRequestCardProps) {
  const navigate = useNavigate();

  const statusConfig  = MEETING_STATUSES[request.status] ?? { label: request.status, badgeType: 'info' as const };
  const actionConfig  = getActionConfig(request.status, userRole);
  const accentColor   = getAccentColor(request.status);
  const badgeStyle    = BADGE_STYLES[statusConfig.badgeType] ?? BADGE_STYLES.info;
  const currentStage  = getWorkflowStage(request.status);

  const startDate = new Date(request.start_date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const endDate = new Date(request.end_date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const city = request.cities?.city_name ?? request.target_city_name ?? null;

  // CTA button colours
  const ctaStyle: React.CSSProperties =
    actionConfig.variant === 'primary' ? {
      background: 'var(--primary)', color: '#fff', border: 'none',
    } : actionConfig.variant === 'success' ? {
      background: '#059669', color: '#fff', border: 'none',
    } : {
      background: 'var(--surface)', color: 'var(--text-muted)',
      border: '1px solid var(--border)',
    };

  return (
    <div
      style={{
        background:   'var(--surface)',
        borderRadius: '14px',
        boxShadow:    '0 1px 8px rgba(0,0,0,0.06), 0 0 0 1px var(--border)',
        borderLeft:   `4px solid ${accentColor}`,
        display:      'flex',
        flexDirection:'column',
        overflow:     'hidden',
        transition:   'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.11), 0 0 0 1px var(--border)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 8px rgba(0,0,0,0.06), 0 0 0 1px var(--border)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div
        style={{ padding: '1.1rem 1.2rem 0.9rem', flex: 1, cursor: 'pointer' }}
        onClick={() => navigate(`/meeting-requests/${request.id}`)}
      >
        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3, margin: 0 }}>
            {request.meeting_name}
          </h4>
          <span style={{
            ...badgeStyle,
            flexShrink: 0,
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
          }}>
            {statusConfig.label}
          </span>
        </div>

        {/* Subtitle: number + city */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.22rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <Hash size={11} /> {request.request_number}
          </span>
          {city && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.22rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <MapPin size={11} /> {city}
            </span>
          )}
        </div>

        {/* Detail chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            background: 'var(--background)', border: '1px solid var(--border)',
            borderRadius: '7px', padding: '0.28rem 0.6rem',
            fontSize: '0.72rem', color: 'var(--text-main)', fontWeight: 500,
          }}>
            <Calendar size={10} style={{ color: 'var(--text-muted)' }} />
            {startDate} – {endDate}
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            background: 'var(--background)', border: '1px solid var(--border)',
            borderRadius: '7px', padding: '0.28rem 0.6rem',
            fontSize: '0.72rem', color: 'var(--text-main)', fontWeight: 500,
          }}>
            <Users size={10} style={{ color: 'var(--text-muted)' }} />
            {request.expected_pax} pax
          </span>
        </div>

        {/* Compact workflow stepper */}
        <WorkflowStepper currentStage={currentStage} />
      </div>

      {/* ── Footer CTA ────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 1.2rem', background: 'var(--background)' }}>
        <button
          disabled={isMutating}
          onClick={e => {
            e.stopPropagation();
            actionConfig.onClick(request, navigate, onSubmit);
          }}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            padding: '0.6rem 1rem', borderRadius: '8px',
            fontWeight: 700, fontSize: '0.8rem',
            cursor: isMutating ? 'not-allowed' : 'pointer',
            opacity: isMutating ? 0.6 : 1,
            transition: 'opacity 0.15s',
            ...ctaStyle,
          }}
        >
          {isMutating ? <Loader2 size={13} className="spin" /> : actionConfig.icon}
          {isMutating ? 'Submitting…' : actionConfig.label}
        </button>
      </div>
    </div>
  );
}
