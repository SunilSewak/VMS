/**
 * Sales Head Home Page - Request-Centric Workspace
 * 
 * Purpose:
 * - Primary landing page for Sales Head role
 * - Action-driven, not analytics-driven
 * - Focus on meeting requests and pending actions
 * 
 * Sections:
 * 1. Header Actions (New Request, Explore Venues, View Bookings)
 * 2. My Active Requests
 * 3. Action Required
 * 4. Upcoming Meetings
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Calendar, MapPin, Users, 
  AlertCircle, Clock, CheckCircle2, FileText,
  ArrowRight, Eye, RefreshCw, Building2
} from 'lucide-react';
import { useMeetingRequests } from '../features/meetings/hooks';
import { MeetingRequest } from '../features/meetings/types';
import { MEETING_STATUSES } from '../features/meetings/constants';
import { ROUTES } from '../routes/routeRegistry';

export function SalesHeadHome() {
  const navigate = useNavigate();
  const { requests, loading, error, refresh } = useMeetingRequests();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Filter active requests (not completed/closed)
  const activeRequests = requests.filter(
    req => !['COMPLETED', 'CLOSED'].includes(req.status)
  ).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  // Filter action-required requests
  const actionRequired = requests.filter(req => 
    ['DRAFT', 'VENUE_UNAVAILABLE'].includes(req.status) ||
    (req.status === 'VENUES_SHORTLISTED' && !req.submitted_at)
  );

  // Filter upcoming meetings (booked requests with future dates)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingMeetings = requests.filter(req => 
    req.status === 'BOOKED' && new Date(req.start_date) >= today
  ).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  // Get primary action for a request
  const getPrimaryAction = (req: MeetingRequest) => {
    switch (req.status) {
      case 'DRAFT':
        return { label: 'Continue Request', icon: <FileText size={14} />, onClick: () => navigate(`/meeting-requests/${req.id}/edit`) };
      case 'VENUES_SHORTLISTED':
      case 'SHORTLISTED':
        return { label: 'Review Shortlist', icon: <Eye size={14} />, onClick: () => navigate(`/meeting-requests/${req.id}`) };
      case 'SUBMITTED_TO_ADMIN':
      case 'SUBMITTED':
      case 'AVAILABILITY_CHECK':
        return { label: 'Track Status', icon: <Clock size={14} />, onClick: () => navigate(`/meeting-requests/${req.id}`) };
      case 'VENUE_UNAVAILABLE':
        return { label: 'Explore Venues', icon: <Search size={14} />, onClick: () => navigate(`${ROUTES.venueExplorer}?requestId=${req.id}`) };
      case 'BOOKED':
        return { label: 'View Booking', icon: <CheckCircle2 size={14} />, onClick: () => navigate(`/meeting-requests/${req.id}`) };
      default:
        return { label: 'View Details', icon: <Eye size={14} />, onClick: () => navigate(`/meeting-requests/${req.id}`) };
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
            Home
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Welcome back. Here's what needs your attention today.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh"
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-3)',
            color: 'var(--text-muted)',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--font-sm)',
          }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Error Banner ─────────────────────────────────────────────── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
          borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: 'var(--font-sm)',
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ── SECTION 1: HEADER ACTIONS ────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-3)',
      }}>
        <button
          className="btn btn-primary"
          onClick={() => navigate(ROUTES.meetingRequestNew)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 'var(--space-2)', padding: 'var(--space-4)',
            fontSize: 'var(--font-md)', fontWeight: 700,
          }}
        >
          <Plus size={18} />
          New Request
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate(ROUTES.venueExplorer)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 'var(--space-2)', padding: 'var(--space-4)',
            fontSize: 'var(--font-md)', fontWeight: 600,
          }}
        >
          <Search size={18} />
          Explore Venues
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => navigate(ROUTES.bookings)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 'var(--space-2)', padding: 'var(--space-4)',
            fontSize: 'var(--font-md)', fontWeight: 600,
          }}
        >
          <Building2 size={18} />
          View My Bookings
        </button>
      </div>

      {/* ── Loading State ────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="spin" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
          <p>Loading your workspace…</p>
        </div>
      ) : (
        <>
          {/* ── SECTION 2: MY ACTIVE REQUESTS ────────────────────────── */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>
                My Active Requests
              </h4>
              <button
                onClick={() => navigate(ROUTES.meetingRequests)}
                style={{
                  background: 'none', border: 'none', color: 'var(--primary)',
                  fontSize: 'var(--font-sm)', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                View All <ArrowRight size={14} />
              </button>
            </div>

            {activeRequests.length === 0 ? (
              <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FileText size={32} style={{ margin: '0 auto var(--space-2)', color: 'var(--text-light)' }} />
                <p style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>No active requests</p>
                <p style={{ fontSize: 'var(--font-sm)' }}>Click "New Request" to create your first meeting request.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 'var(--space-4)',
              }}>
                {activeRequests.slice(0, 6).map(req => {
                  const statusConfig = MEETING_STATUSES[req.status] ?? { label: req.status, badgeType: 'info' as const };
                  const action = getPrimaryAction(req);
                  const city = req.cities?.city_name ?? req.target_city_name ?? '—';

                  return (
                    <div
                      key={req.id}
                      className="card"
                      style={{
                        padding: 'var(--space-4)',
                        borderLeft: `4px solid var(--primary)`,
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s, transform 0.2s',
                      }}
                      onClick={() => navigate(`/meeting-requests/${req.id}`)}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.11)';
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                        (e.currentTarget as HTMLDivElement).style.transform = '';
                      }}
                    >
                      {/* Title + Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                        <h5 style={{ fontSize: 'var(--font-md)', fontWeight: 700, lineHeight: 1.3 }}>
                          {req.meeting_name}
                        </h5>
                        <span className={`badge badge-${statusConfig.badgeType}`} style={{ fontSize: '0.68rem', flexShrink: 0 }}>
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* Metadata */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                          <MapPin size={14} />
                          <span>{city}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                          <Calendar size={14} />
                          <span>{formatDate(req.start_date)} – {formatDate(req.end_date)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                          <Users size={14} />
                          <span>{req.expected_pax} participants</span>
                        </div>
                      </div>

                      {/* Primary Action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick();
                        }}
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: 'var(--space-2)', padding: 'var(--space-2)',
                          fontSize: 'var(--font-sm)',
                        }}
                      >
                        {action.icon}
                        {action.label}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── SECTION 3: ACTION REQUIRED ───────────────────────────── */}
          <section>
            <h4 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
              Action Required
            </h4>

            {actionRequired.length === 0 ? (
              <div className="card" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', background: '#f0fdf4', border: '1px solid #86efac' }}>
                <CheckCircle2 size={24} style={{ color: '#16a34a', flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 600, color: '#15803d', marginBottom: '4px' }}>No actions pending</p>
                  <p style={{ fontSize: 'var(--font-sm)', color: '#166534' }}>All your requests are up to date.</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {actionRequired.map(req => {
                  const action = getPrimaryAction(req);
                  let actionMessage = '';
                  
                  if (req.status === 'DRAFT') {
                    actionMessage = 'Complete and submit this request';
                  } else if (req.status === 'VENUES_SHORTLISTED' && !req.submitted_at) {
                    actionMessage = 'Review shortlist and submit to admin';
                  } else if (req.status === 'VENUE_UNAVAILABLE') {
                    actionMessage = 'Selected venue unavailable - choose alternative';
                  }

                  return (
                    <div
                      key={req.id}
                      className="card"
                      style={{
                        padding: 'var(--space-4)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        gap: 'var(--space-3)', flexWrap: 'wrap',
                        borderLeft: '4px solid var(--status-warning)',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                          <AlertCircle size={16} style={{ color: 'var(--status-warning)' }} />
                          <h5 style={{ fontSize: 'var(--font-md)', fontWeight: 700 }}>{req.meeting_name}</h5>
                        </div>
                        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          {actionMessage}
                        </p>
                        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-light)' }}>
                          {req.cities?.city_name ?? req.target_city_name} • {formatDate(req.start_date)}
                        </p>
                      </div>
                      <button
                        onClick={() => action.onClick()}
                        className="btn btn-primary"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                          padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-sm)',
                        }}
                      >
                        {action.icon}
                        {action.label}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── SECTION 4: UPCOMING MEETINGS ─────────────────────────── */}
          <section>
            <h4 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
              Upcoming Meetings
            </h4>

            {upcomingMeetings.length === 0 ? (
              <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Calendar size={32} style={{ margin: '0 auto var(--space-2)', color: 'var(--text-light)' }} />
                <p style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>No upcoming meetings</p>
                <p style={{ fontSize: 'var(--font-sm)' }}>Confirmed bookings will appear here.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 'var(--space-4)',
              }}>
                {upcomingMeetings.map(req => {
                  const city = req.cities?.city_name ?? req.target_city_name ?? '—';
                  const daysUntil = Math.ceil((new Date(req.start_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <div
                      key={req.id}
                      className="card"
                      style={{
                        padding: 'var(--space-4)',
                        borderLeft: '4px solid var(--status-success)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                        <h5 style={{ fontSize: 'var(--font-md)', fontWeight: 700 }}>{req.meeting_name}</h5>
                        <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                          {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                          <Building2 size={14} />
                          <span>Venue Confirmed</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                          <MapPin size={14} />
                          <span>{city}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                          <Calendar size={14} />
                          <span>{formatDate(req.start_date)} – {formatDate(req.end_date)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                          <Users size={14} />
                          <span>{req.expected_pax} participants</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/meeting-requests/${req.id}`)}
                        className="btn btn-secondary"
                        style={{
                          width: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: 'var(--space-2)', padding: 'var(--space-2)',
                          fontSize: 'var(--font-sm)',
                        }}
                      >
                        <Eye size={14} />
                        View Booking
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
