import type { CSSProperties } from 'react';
import type { HotelWithRelations } from '../../features/venues/types';

interface OverviewTabProps {
  hotel: HotelWithRelations;
}

function occupancyLabel(occ?: string | null): string {
  if (!occ) return 'Not configured';
  const map: Record<string, string> = { SINGLE: 'Single', DOUBLE: 'Double', TRIPLE: 'Triple', QUAD: 'Quad' };
  return map[occ] || occ;
}

function getOccupancyForDesignation(hotel: HotelWithRelations, designationCode: string): string {
  const rule = hotel.occupancy_rules?.find((r) => r.designation_type === designationCode);
  return occupancyLabel(rule?.occupancy_type);
}

const sectionStyle: CSSProperties = {
  borderTop: '1px solid var(--border)',
  paddingTop: 'var(--space-6)',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 'var(--font-xs)',
  fontWeight: 700,
  color: 'var(--text-muted)',
};

const valueStyle: CSSProperties = {
  marginTop: 'var(--space-1)',
  fontSize: 'var(--font-size-md)',
  fontWeight: 700,
  color: 'var(--text-main)',
};

const grid2: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 'var(--space-6)',
};

function Field({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <p style={muted ? { marginTop: 'var(--space-1)', color: 'var(--text-muted)' } : valueStyle}>{value}</p>
    </div>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div style={{
      background: `color-mix(in srgb, ${accent} 10%, transparent)`,
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
    }}>
      <p style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</p>
      <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-xl)', fontWeight: 800, color: accent }}>{value}</p>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'var(--status-success)',
  INACTIVE: 'var(--status-error)',
};

export function OverviewTab({ hotel }: OverviewTabProps) {
  const designations = [
    { code: 'SO', label: 'Sales Officer' },
    { code: 'DM', label: 'District Manager' },
    { code: 'RSM', label: 'Regional Sales Manager' },
    { code: 'CH', label: 'Channel Head' },
    { code: 'IBH', label: 'Institutional Business Head' },
    { code: 'OTHERS', label: 'Others' },
  ];

  const statusColor = STATUS_COLORS[hotel.status] ?? 'var(--status-warning)';
  const halls = hotel.halls ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: 'var(--space-6)' }}>
      {/* Basic Information */}
      <div style={grid2}>
        <Field label="Hotel Name" value={hotel.hotel_name} />
        <Field label="City" value={hotel.city?.city_name || 'N/A'} />
        <Field label="Address" value={hotel.address || 'Not provided'} muted={!hotel.address} />
        <div>
          <label style={labelStyle}>Status</label>
          <p style={{ marginTop: 'var(--space-1)' }}>
            <span style={{
              display: 'inline-block',
              padding: '3px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-sm)',
              fontWeight: 700,
              background: `color-mix(in srgb, ${statusColor} 14%, transparent)`,
              color: statusColor,
            }}>
              {hotel.status}
            </span>
          </p>
        </div>
      </div>

      {/* Contact Information */}
      {(hotel.contact_phone || hotel.contact_email || hotel.website) && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-4)' }}>
            Contact Information
          </h3>
          <div style={grid2}>
            {hotel.contact_phone && <Field label="Phone" value={hotel.contact_phone} muted />}
            {hotel.contact_email && <Field label="Email" value={hotel.contact_email} muted />}
            {hotel.website && (
              <div>
                <label style={labelStyle}>Website</label>
                <p style={{ marginTop: 'var(--space-1)' }}>
                  <a href={hotel.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                    {hotel.website}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Operational Information */}
      {(hotel.total_rooms || hotel.check_in_time || hotel.check_out_time) && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-4)' }}>
            Operational Details
          </h3>
          <div style={grid2}>
            {hotel.total_rooms && <Field label="Total Rooms" value={String(hotel.total_rooms)} />}
            {hotel.check_in_time && <Field label="Check-in Time" value={hotel.check_in_time} muted />}
            {hotel.check_out_time && <Field label="Check-out Time" value={hotel.check_out_time} muted />}
          </div>
        </div>
      )}

      {/* Conference Room Summary */}
      {halls.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-2)' }}>
            Conference Rooms Summary
          </h3>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
            Meeting space configuration overview (read-only)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
            <StatBox label="Conference Rooms" value={halls.length} accent="var(--primary)" />
            <StatBox label="Largest Classroom" value={Math.max(0, ...halls.map((h) => h.classroom_capacity || 0)) || '—'} accent="var(--status-success)" />
            <StatBox label="Largest U-Shape" value={Math.max(0, ...halls.map((h) => h.u_shape_capacity || 0)) || '—'} accent="#8b5cf6" />
            <StatBox label="Largest Cluster" value={Math.max(0, ...halls.map((h) => h.cluster_capacity || 0)) || '—'} accent="var(--status-warning)" />
          </div>
          <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-light)' }}>
            ℹ️ To edit conference rooms, use the <strong>Halls</strong> tab
          </p>
        </div>
      )}

      {/* Occupancy Policy */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-2)' }}>
          Occupancy Policy
        </h3>
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
          Room occupancy assignments by designation (read-only)
        </p>
        <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          {designations.map((des, idx) => (
            <div key={des.code} style={{
              padding: 'var(--space-3) var(--space-4)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-main)' }}>
                {des.label} ({des.code})
              </span>
              <span style={{
                display: 'inline-block',
                padding: '3px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-sm)',
                fontWeight: 600,
                background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                color: 'var(--primary)',
              }}>
                {getOccupancyForDesignation(hotel, des.code)}
              </span>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-xs)', color: 'var(--text-light)' }}>
          ℹ️ To edit occupancy assignments, use the <strong>Occupancy Rules</strong> tab
        </p>
      </div>

      {/* Venue Statistics */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-4)' }}>
          Venue Statistics
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
          <StatBox label="Halls" value={halls.length} accent="var(--primary)" />
          <StatBox label="Room Types" value={hotel.accommodation_inventory?.length || 0} accent="var(--status-success)" />
          <StatBox label="Occupancy Rules" value={hotel.occupancy_rules?.length || 0} accent="#8b5cf6" />
        </div>
      </div>

      {/* Historical Intelligence */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-main)', marginBottom: 'var(--space-2)' }}>
          Historical Intelligence
        </h3>
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
          Read-only venue history derived from past Ajanta meetings and bookings.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>Total Ajanta Events</p>
            <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-main)' }}>{hotel.total_ajanta_events ?? 0}</p>
          </div>
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>Last Used Date</p>
            <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-main)' }}>
              {hotel.last_used_date ? new Date(hotel.last_used_date).toLocaleDateString('en-IN') : 'Never used'}
            </p>
          </div>
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>Last Division</p>
            <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-main)' }}>{hotel.last_division || 'Not available'}</p>
          </div>
          <div className="card" style={{ padding: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>Last Meeting Type</p>
            <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-main)' }}>{hotel.last_meeting_type || 'Not available'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
