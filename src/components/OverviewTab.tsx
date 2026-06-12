/**
 * Overview Tab Component
 * 
 * Displays read-only operational summary of the meeting request
 */

import { Calendar, Users, MapPin, Home, DoorOpen, Settings, FileText } from 'lucide-react';
import type { MeetingRequest } from '../features/meetings/types';
import { MEETING_STATUSES } from '../features/meetings/constants';

interface OverviewTabProps {
  request: MeetingRequest;
}

export function OverviewTab({ request }: OverviewTabProps) {
  const statusConfig = MEETING_STATUSES[request.status] ?? { label: request.status, badgeType: 'info' as const };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      
      {/* Event Information */}
      <section>
        <h3 style={{
          fontSize: 'var(--font-lg)',
          fontWeight: 600,
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}>
          <FileText size={18} />
          Event Information
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
        }}>
          <InfoCard icon={<FileText size={16} />} label="Meeting Name" value={request.meeting_name} />
          <InfoCard 
            icon={<Users size={16} />} 
            label="Division" 
            value={request.divisions?.division_name || '—'} 
          />
          <InfoCard 
            icon={<MapPin size={16} />} 
            label="City" 
            value={request.cities?.city_name || request.target_city_name || '—'} 
          />
          <InfoCard 
            icon={<Calendar size={16} />} 
            label="Start Date" 
            value={new Date(request.start_date).toLocaleDateString('en-IN', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })} 
          />
          <InfoCard 
            icon={<Calendar size={16} />} 
            label="End Date" 
            value={new Date(request.end_date).toLocaleDateString('en-IN', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })} 
          />
          <InfoCard 
            icon={<Users size={16} />} 
            label="Duration" 
            value={`${Math.ceil((new Date(request.end_date).getTime() - new Date(request.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} days`} 
          />
        </div>
      </section>

      {/* Attendance */}
      <section>
        <h3 style={{
          fontSize: 'var(--font-lg)',
          fontWeight: 600,
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}>
          <Users size={18} />
          Attendance
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
        }}>
          <InfoCard 
            icon={<Users size={16} />} 
            label="Expected Pax" 
            value={request.expected_pax.toString()} 
          />
          <InfoCard 
            icon={<Users size={16} />} 
            label="Guaranteed Pax" 
            value={request.guaranteed_pax.toString()} 
          />
        </div>
      </section>

      {/* Requirements */}
      <section>
        <h3 style={{
          fontSize: 'var(--font-lg)',
          fontWeight: 600,
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}>
          <Settings size={18} />
          Requirements
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
        }}>
          <InfoCard 
            icon={<Home size={16} />} 
            label="Residential" 
            value={request.residential_flag ? 'Yes' : 'No'} 
          />
          {request.residential_flag && (
            <InfoCard 
              icon={<Home size={16} />} 
              label="Rooms Required" 
              value={request.rooms_required?.toString() || '0'} 
            />
          )}
          <InfoCard 
            icon={<DoorOpen size={16} />} 
            label="Halls Required" 
            value={request.halls_required?.toString() || '0'} 
          />
          <InfoCard 
            icon={<Settings size={16} />} 
            label="Seating Style" 
            value={request.seating_style || '—'} 
          />
          <InfoCard 
            icon={<Settings size={16} />} 
            label="AV Requirements" 
            value={request.av_requirements || '—'} 
          />
          <InfoCard 
            icon={<Settings size={16} />} 
            label="Food Requirements" 
            value={request.food_requirements || '—'} 
          />
        </div>
      </section>

      {/* Status */}
      <section>
        <h3 style={{
          fontSize: 'var(--font-lg)',
          fontWeight: 600,
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
        }}>
          <Calendar size={18} />
          Status
        </h3>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Current Request Stage
              </div>
              <span className={`badge badge-${statusConfig.badgeType}`} style={{ fontSize: 'var(--font-sm)' }}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Notes */}
      {request.additional_notes && (
        <section>
          <h3 style={{
            fontSize: 'var(--font-lg)',
            fontWeight: 600,
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}>
            <FileText size={18} />
            Notes
          </h3>

          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <p style={{ margin: 0, fontSize: 'var(--font-sm)', color: 'var(--text)', lineHeight: 1.6 }}>
              {request.additional_notes}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Info Card Component
// ─────────────────────────────────────────────────────────────────────

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div className="card" style={{
      padding: 'var(--space-3)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-3)',
    }}>
      <div style={{
        padding: 'var(--space-2)',
        background: 'var(--primary-light)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 'var(--font-xs)',
          color: 'var(--text-muted)',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 'var(--font-md)',
          fontWeight: 600,
          color: 'var(--text)',
          wordBreak: 'break-word',
        }}>
          {value}
        </div>
      </div>
    </div>
  );
}
