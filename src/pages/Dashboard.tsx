import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../auth/permissions';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/routeRegistry';
import { 
  FileText, 
  CheckSquare, 
  Calendar, 
  TrendingUp, 
  ArrowRight, 
  AlertCircle,
  FileClock,
  MessageSquare
} from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || ROLES.VIEWER;

  // 1. ADMIN / SUPER ADMIN / DEFAULT DASHBOARD VIEW
  const renderAdminDashboard = () => {
    const stats = [
      { title: 'Active Requests', value: '12', icon: <FileText size={20} />, change: '+2 today', color: '#3b82f6' },
      { title: 'Pending Approvals', value: '5', icon: <CheckSquare size={20} />, change: '3 high priority', color: '#f59e0b' },
      { title: 'Upcoming Bookings', value: '8', icon: <Calendar size={20} />, change: 'Next event: 12 June', color: '#10b981' },
      { title: 'Total Venue Expense', value: '₹4,82,000', icon: <TrendingUp size={20} />, change: 'This quarter', color: '#6366f1' }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-2xl)', fontWeight: '700', color: 'var(--text-main)', marginBottom: 'var(--space-1)' }}>
            Operations Control Panel
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Real-time status of Ajanta venue requests, approvals, and contract negotiations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="kpi-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="card" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-4)'
            }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stat.title}
                </p>
                <h4 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', margin: 'var(--space-1) 0' }}>
                  {stat.value}
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                  {stat.change}
                </span>
              </div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: `${stat.color}15`,
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Info Grid */}
        <div className="half-grid">
          {/* Recent Requests */}
          <div className="card">
            <h4 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-4)', color: 'var(--text-main)' }}>
              Recent Requests Log
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { title: 'Annual Leadership Meet 2026', meta: 'Requested by HR Team • Mumbai', status: 'PENDING REVIEW', statusType: 'warning' },
                { title: 'Q3 Regional Sales Conference', meta: 'Requested by Sales Division • Goa', status: 'APPROVED', statusType: 'success' },
                { title: 'Product Launch 2026', meta: 'Requested by Marketing • Pune', status: 'DRAFT', statusType: 'info' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--background)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: '4px solid var(--primary)'
                }}>
                  <div>
                    <h5 style={{ fontSize: 'var(--font-sm)', fontWeight: '600' }}>{item.title}</h5>
                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{item.meta}</p>
                  </div>
                  <span className={`badge badge-${item.statusType}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Statuses */}
          <div className="card">
            <h4 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-4)', color: 'var(--text-main)' }}>
              Active Vendor Negotiations
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { hotel: 'Taj Lands End, Mumbai', status: 'Quote Received', color: 'var(--status-success)' },
                { hotel: 'Grand Hyatt, Goa', status: 'Negotiation In Progress', color: 'var(--status-info)' },
                { hotel: 'JW Marriott, Pune', status: 'Awaiting Contract Sign', color: 'var(--status-warning)' }
              ].map((v, idx) => (
                <div key={idx} style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--background)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h5 style={{ fontSize: 'var(--font-sm)', fontWeight: '600' }}>{v.hotel}</h5>
                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Updated 2 hours ago</p>
                  </div>
                  <span style={{ fontSize: 'var(--font-xs)', fontWeight: '700', color: v.color }}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. SALES HEAD WORKFLOW-DRIVEN DASHBOARD
  const renderSalesHeadDashboard = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Title */}
        <div>
          <h3 style={{ fontSize: 'var(--font-2xl)', fontWeight: '700', color: 'var(--text-main)', marginBottom: 'var(--space-1)' }}>
            Sales Executive Dashboard
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Welcome back Sunil. Here are the action-driven items requiring your immediate feedback today.
          </p>
        </div>

        {/* Workflow Actions Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)' }} className="half-grid">
          {/* My Requests (Workflow Widget) */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <span className="badge badge-info" style={{ fontSize: '9px' }}>My Active Requests</span>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>3 Active</span>
              </div>
              <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>My Venue Requests</h4>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                Create and track the progress of your scheduled business conferences.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <div style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-xs)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Q3 Cycle Meeting (Goa)</span>
                  <strong style={{ color: 'var(--status-warning)' }}>Awaiting Quotes</strong>
                </div>
                <div style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-xs)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Regional Cycle Meet (Mumbai)</span>
                  <strong style={{ color: 'var(--status-success)' }}>Approved</strong>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(ROUTES.meetingRequests)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              <span>Create New Request</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>

        {/* Workflow Action Checklist Grid */}
        <div className="content-grid">
          {/* Widget 1: Pending Approvals */}
          <div className="card" style={{ borderLeft: '4px solid var(--status-danger)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <AlertCircle size={20} style={{ color: 'var(--status-danger)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>Pending Approvals</h4>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: 'var(--space-1) 0 var(--space-3)' }}>
                  You have <strong>2</strong> requests awaiting your management signoff.
                </p>
                <Link to={ROUTES.meetingRequests} style={{ fontSize: 'var(--font-xs)', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Approve Now <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* Widget 2: Venue Awaiting Quotation */}
          <div className="card" style={{ borderLeft: '4px solid var(--status-warning)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <FileClock size={20} style={{ color: 'var(--status-warning)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>Awaiting Quotation</h4>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: 'var(--space-1) 0 var(--space-3)' }}>
                  Novotel Juhu meeting is missing its proposal. Follow up with vendor contact.
                </p>
                <button 
                  onClick={() => alert('Sending automated reminder email to Novotel reservation desk...')}
                  style={{ fontSize: 'var(--font-xs)', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Ping Vendor <MessageSquare size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Widget 3: Booking Pending Confirmation */}
          <div className="card" style={{ borderLeft: '4px solid var(--status-success)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Calendar size={20} style={{ color: 'var(--status-success)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>Booking Pending</h4>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', margin: 'var(--space-1) 0 var(--space-3)' }}>
                  Goa Cycle Meet quota is approved. Confirm booking with advance payment.
                </p>
                <Link to={ROUTES.bookings} style={{ fontSize: 'var(--font-xs)', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Issue Booking <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Meetings & Recommended Venues Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)' }} className="half-grid">
          {/* Upcoming Meetings List */}
          <div className="card">
            <h4 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-4)', color: 'var(--text-main)' }}>
              Upcoming Meetings & Events
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { title: 'Annual Leadership Summit 2026', date: '12-14 June 2026', venue: 'Taj Lands End, Mumbai', pax: '150 Pax' },
                { title: 'Sales Cycle Briefing', date: '28 June 2026', venue: 'JW Marriott, Pune', pax: '80 Pax' }
              ].map((meet, idx) => (
                <div key={idx} style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--background)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h5 style={{ fontSize: 'var(--font-sm)', fontWeight: '600' }}>{meet.title}</h5>
                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{meet.date} • {meet.venue}</p>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '10px' }}>
                    {meet.pax}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Venues Quick View */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-main)', margin: 0 }}>
                Recommended Venues
              </h4>
              <Link to="/venue-explorer" style={{ fontSize: 'var(--font-xs)', color: 'var(--primary)', fontWeight: '600' }}>
                View All Explorer
              </Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { name: 'Grand Hyatt, Goa', capacity: '500 Pax', spend: '₹15L–22L', rating: '5★' },
                { name: 'The Leela Palace, Bengaluru', capacity: '450 Pax', spend: '₹18L–25L', rating: '5★' }
              ].map((venue, idx) => (
                <div key={idx} style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--background)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h5 style={{ fontSize: 'var(--font-sm)', fontWeight: '600' }}>{venue.name} ({venue.rating})</h5>
                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Capacity: {venue.capacity} • Spend: {venue.spend}</p>
                  </div>
                  <Link to="/venue-explorer" className="btn btn-secondary" style={{ padding: 'var(--space-1) var(--space-3)', fontSize: '10px' }}>
                    Explorer
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {role === ROLES.SALES_HEAD ? renderSalesHeadDashboard() : renderAdminDashboard()}
    </>
  );
}
