/**
 * Enhanced Request Card Component
 * 
 * Step 7: Redesigned request card with status tracking
 * Business-friendly display for Sales Heads
 */

import React from 'react';
import { Calendar, MapPin, Users, ArrowRight, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  mapToSalesHeadStatus,
  getStatusConfig,
  type SalesHeadStatus,
} from '../features/meetings/statusArchitecture';
import { MiniProgress } from './StatusTimeline';
import { calculateTotalPlannedPax } from '../features/rooms/roomCalculator';
import type { MeetingRequest } from '../features/meetings/types';
import { ROUTES } from '../routes/routeRegistry';

interface RequestCardProps {
  request: MeetingRequest;
  shortlistedVenues?: number;
  selectedVenue?: { hotel_name: string };
}

export function RequestCard({
  request,
  shortlistedVenues = 0,
  selectedVenue,
}: RequestCardProps) {
  const navigate = useNavigate();
  
  // Calculate Sales Head status
  const salesHeadStatus = mapToSalesHeadStatus(request.status, shortlistedVenues > 0);
  const statusConfig = getStatusConfig(salesHeadStatus);
  
  // Calculate total pax
  const totalPlannedPax = request.participant_so ||
    request.participant_dm ||
    request.participant_rsm ||
    request.participant_ch ||
    request.participant_ibh ||
    request.participant_others
    ? calculateTotalPlannedPax({
        so: request.participant_so || 0,
        dm: request.participant_dm || 0,
        rsm: request.participant_rsm || 0,
        ch: request.participant_ch || 0,
        ibh: request.participant_ibh || 0,
        others: request.participant_others || 0,
      })
    : request.expected_pax || 0;

  // Format dates
  const startDate = request.start_date
    ? new Date(request.start_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';
  const endDate = request.end_date
    ? new Date(request.end_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const handleClick = () => {
    navigate(ROUTES.meetingRequestView.replace(':id', request.id));
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    switch (salesHeadStatus) {
      case 'DRAFT':
      case 'VENUE_EXPLORATION':
        navigate(ROUTES.meetingRequestForm.replace(':id', request.id));
        break;
      case 'VENUE_SHORTLISTED':
        navigate(ROUTES.meetingRequestView.replace(':id', request.id));
        break;
      default:
        navigate(ROUTES.meetingRequestView.replace(':id', request.id));
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: 'var(--font-lg)',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: 'var(--space-1)',
              lineHeight: 1.3,
            }}
          >
            {request.meeting_name || 'Untitled Request'}
          </h3>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
            {request.request_number}
          </div>
        </div>
        
        {/* Status Badge */}
        <div
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-xs)',
            fontWeight: 600,
            background: `color-mix(in srgb, ${statusConfig.color} 15%, transparent)`,
            color: statusConfig.color,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            whiteSpace: 'nowrap',
          }}
        >
          <span>{statusConfig.icon}</span>
          <span>{statusConfig.displayName}</span>
        </div>
      </div>

      {/* Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-3)',
          padding: 'var(--space-3)',
          background: 'var(--background)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Location</div>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text)' }}>
              {request.cities?.city_name || request.target_city_name || '—'}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Calendar size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Meeting Dates</div>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text)' }}>
              {startDate} – {endDate}
            </div>
          </div>
        </div>

        {/* Participants */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Users size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Participants</div>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text)' }}>
              {totalPlannedPax} pax ({request.guaranteed_pax || 0} guaranteed)
            </div>
          </div>
        </div>

        {/* Selected Venue (if available) */}
        {selectedVenue && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Building2 size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Selected Venue</div>
              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text)' }}>
                {selectedVenue.hotel_name}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div>
        <MiniProgress currentStatus={salesHeadStatus} />
      </div>

      {/* Footer Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-2)' }}>
        {/* Status Explanation */}
        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', flex: 1 }}>
          {statusConfig.actionRequired ? (
            <span style={{ color: '#F59E0B', fontWeight: 600 }}>⚠ Action required</span>
          ) : (
            <span>In progress...</span>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleActionClick}
          className="btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--font-sm)',
          }}
        >
          <span>{statusConfig.actionLabel}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// COMPACT REQUEST CARD (List View)
// =====================================================================

export function CompactRequestCard({ request, shortlistedVenues = 0 }: RequestCardProps) {
  const navigate = useNavigate();
  const salesHeadStatus = mapToSalesHeadStatus(request.status, shortlistedVenues > 0);
  const statusConfig = getStatusConfig(salesHeadStatus);

  const totalPlannedPax = request.participant_so ||
    request.participant_dm ||
    request.participant_rsm ||
    request.participant_ch ||
    request.participant_ibh ||
    request.participant_others
    ? calculateTotalPlannedPax({
        so: request.participant_so || 0,
        dm: request.participant_dm || 0,
        rsm: request.participant_rsm || 0,
        ch: request.participant_ch || 0,
        ibh: request.participant_ibh || 0,
        others: request.participant_others || 0,
      })
    : request.expected_pax || 0;

  return (
    <div
      onClick={() => navigate(ROUTES.meetingRequestView.replace(':id', request.id))}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-3)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--background)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--surface)';
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 'var(--font-md)', fontWeight: 600, marginBottom: '4px' }}>
          {request.meeting_name || 'Untitled Request'}
        </div>
        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
          {request.cities?.city_name || '—'} • {totalPlannedPax} pax
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span
          style={{
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-xs)',
            fontWeight: 600,
            background: `color-mix(in srgb, ${statusConfig.color} 15%, transparent)`,
            color: statusConfig.color,
          }}
        >
          {statusConfig.icon} {statusConfig.displayName}
        </span>
        <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
      </div>
    </div>
  );
}

