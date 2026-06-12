/**
 * Request Processing Workspace
 * 
 * Central Admin workspace for processing meeting requests.
 * Replaces the basic request detail view with a comprehensive tab-based workspace.
 * 
 * Architecture:
 * - Top: Request identification and stage summary
 * - Left: Tab-based content area (Overview, Venue Evaluation, Booking, Invoice, Payment)
 * - Right: Sticky workflow progress panel
 * 
 * Step 3: Workspace shell with placeholders for future modules
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, MapPin, Building2, Receipt, CreditCard, RefreshCw 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMeetingRequestById } from '../features/meetings/meetingService';
import type { MeetingRequest } from '../features/meetings/types';
import { ROUTES } from '../routes/routeRegistry';
import { ROLES } from '../auth/permissions';
import { WorkspaceHeader } from '../components/WorkspaceHeader';
import { RequestWorkflowPanel } from '../components/RequestWorkflowPanel';
import { OverviewTab } from '../components/OverviewTab';
import { PlaceholderTab } from '../components/PlaceholderTab';

type TabId = 'overview' | 'venue-evaluation' | 'booking' | 'invoice' | 'payment';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview', icon: <FileText size={16} /> },
  { id: 'venue-evaluation', label: 'Venue Evaluation', icon: <MapPin size={16} /> },
  { id: 'booking', label: 'Booking', icon: <Building2 size={16} /> },
  { id: 'invoice', label: 'Invoice', icon: <Receipt size={16} /> },
  { id: 'payment', label: 'Payment', icon: <CreditCard size={16} /> },
];

export function RequestProcessingWorkspace() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [request, setRequest] = useState<MeetingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin) {
      navigate(ROUTES.meetingRequests);
    }
  }, [user, isAdmin, navigate]);

  // Redirect if no valid ID
  useEffect(() => {
    if (!id || id === 'undefined' || id === ':id') {
      navigate(ROUTES.meetingRequests);
    }
  }, [id, navigate]);

  // Load request data
  useEffect(() => {
    if (!id || id === 'undefined' || id === ':id') return;

    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getMeetingRequestById(id);
        if (mounted) {
          setRequest(data);
        }
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : 'Failed to load request');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: 'var(--space-3)',
      }}>
        <RefreshCw size={32} className="spin" style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
          Loading request...
        </p>
      </div>
    );
  }

  // Error state
  if (error || !request) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: 'var(--space-3)',
      }}>
        <div style={{
          padding: 'var(--space-4)',
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: 'var(--radius-md)',
          maxWidth: '500px',
        }}>
          <p style={{ color: '#ef4444', fontSize: 'var(--font-sm)', margin: 0 }}>
            {error || 'Request not found'}
          </p>
        </div>
        <button
          onClick={() => navigate(ROUTES.meetingRequests)}
          className="btn btn-secondary"
        >
          Back to Queue
        </button>
      </div>
    );
  }

  // Main workspace
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <WorkspaceHeader request={request} />

      {/* Main content area */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: 'var(--space-5)',
        padding: 'var(--space-5)',
        flex: 1,
      }}>
        {/* Left: Tab content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Tab navigation */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-2)',
            borderBottom: '2px solid var(--border)',
            overflowX: 'auto',
          }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--font-sm)',
                  fontWeight: 600,
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                  marginBottom: '-2px',
                  transition: 'color 0.2s, border-color 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div>
            {activeTab === 'overview' && <OverviewTab request={request} />}
            
            {activeTab === 'venue-evaluation' && (
              <PlaceholderTab
                title="Venue Evaluation Workspace"
                description="This workspace will allow you to review venue options, contact venues for availability, record responses, and finalize venue selection."
              />
            )}
            
            {activeTab === 'booking' && (
              <PlaceholderTab
                title="Booking Workspace"
                description="This workspace will enable you to create booking records, confirm venue reservations, and manage booking details."
              />
            )}
            
            {activeTab === 'invoice' && (
              <PlaceholderTab
                title="Invoice Workspace"
                description="This workspace will help you verify invoice details, upload invoice documents, and record invoice information."
              />
            )}
            
            {activeTab === 'payment' && (
              <PlaceholderTab
                title="Payment Workspace"
                description="This workspace will enable you to track payment status, record payment transactions, and manage payment details."
              />
            )}
          </div>
        </div>

        {/* Right: Workflow panel */}
        <RequestWorkflowPanel 
          request={request}
        />
      </div>
    </div>
  );
}
