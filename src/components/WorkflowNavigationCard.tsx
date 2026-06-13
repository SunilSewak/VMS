/**
 * Workflow Navigation Card Component
 * 
 * Provides quick navigation button to the relevant workspace tab
 * based on current workflow stage.
 * 
 * IMPORTANT: Buttons only switch tabs - no workflow execution.
 * 
 * Step 3: Workflow Control Panel
 */

import { ArrowRight, MapPin, FileText, CheckCircle, Receipt, CreditCard } from 'lucide-react';
import type { WorkflowStageId } from '../features/workflows/workflowStages';

interface WorkflowNavigationCardProps {
  currentStage: WorkflowStageId;
  onNavigate: (tabId: string) => void;
}

interface NavigationConfig {
  label: string;
  tabId: string;
  icon: React.ReactNode;
}

const NAVIGATION_CONFIG: Record<WorkflowStageId, NavigationConfig> = {
  'request-submitted': {
    label: 'Open Overview',
    tabId: 'overview',
    icon: <FileText size={16} />,
  },
  'venue-evaluation': {
    label: 'Open Venue Evaluation',
    tabId: 'venue-evaluation',
    icon: <MapPin size={16} />,
  },
  'booking': {
    label: 'Open Booking Workspace',
    tabId: 'booking',
    icon: <CheckCircle size={16} />,
  },
  'invoice': {
    label: 'Open Invoice Workspace',
    tabId: 'invoice',
    icon: <Receipt size={16} />,
  },
  'payment': {
    label: 'Open Payment Workspace',
    tabId: 'payment',
    icon: <CreditCard size={16} />,
  },
  'closed': {
    label: 'View Overview',
    tabId: 'overview',
    icon: <FileText size={16} />,
  },
};

export function WorkflowNavigationCard({ currentStage, onNavigate }: WorkflowNavigationCardProps) {
  const config = NAVIGATION_CONFIG[currentStage];

  return (
    <div style={{
      padding: 'var(--space-4)',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
    }}>
      {/* Header */}
      <div style={{
        fontSize: 'var(--font-xs)',
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        Quick Navigation
      </div>

      {/* Navigation Button */}
      <button
        onClick={() => onNavigate(config.tabId)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-2)',
          padding: 'var(--space-3)',
          background: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-sm)',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          width: '100%',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {config.icon}
          <span>{config.label}</span>
        </div>
        <ArrowRight size={16} />
      </button>

      {/* Info Text */}
      <div style={{
        fontSize: 'var(--font-xs)',
        color: 'var(--text-muted)',
        lineHeight: 1.4,
      }}>
        This button navigates to the relevant workspace tab.
      </div>
    </div>
  );
}
