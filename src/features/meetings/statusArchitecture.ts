/**
 * Sales Head Request Status Architecture
 * 
 * Step 7: Sales Head Request Tracking
 * Business-friendly status model that hides internal operations
 */

import type { MeetingStatus } from './types';

// =====================================================================
// SALES HEAD STATUS MODEL
// =====================================================================

export enum SalesHeadStatus {
  DRAFT = 'DRAFT',
  VENUE_EXPLORATION = 'VENUE_EXPLORATION',
  VENUE_SHORTLISTED = 'VENUE_SHORTLISTED',
  RECOMMENDATION_SUBMITTED = 'RECOMMENDATION_SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  AVAILABILITY_CHECK = 'AVAILABILITY_CHECK',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  EVENT_COMPLETED = 'EVENT_COMPLETED',
}

// =====================================================================
// STATUS DISPLAY CONFIGURATION
// =====================================================================

export interface StatusConfig {
  displayName: string;
  explanation: string;
  actionRequired: boolean;
  actionLabel?: string;
  icon: string;
  color: string;
  badgeType: 'info' | 'warning' | 'success' | 'danger';
}

export const SALES_HEAD_STATUS_CONFIG: Record<SalesHeadStatus, StatusConfig> = {
  [SalesHeadStatus.DRAFT]: {
    displayName: 'Draft',
    explanation: 'Request is being prepared. Complete all required fields and submit when ready.',
    actionRequired: true,
    actionLabel: 'Continue Request',
    icon: '📝',
    color: '#6B7280',
    badgeType: 'info',
  },
  
  [SalesHeadStatus.VENUE_EXPLORATION]: {
    displayName: 'Venue Exploration',
    explanation: 'Search and shortlist suitable venues that match your meeting requirements.',
    actionRequired: true,
    actionLabel: 'Explore Venues',
    icon: '🔍',
    color: '#3B82F6',
    badgeType: 'info',
  },
  
  [SalesHeadStatus.VENUE_SHORTLISTED]: {
    displayName: 'Venue Shortlisted',
    explanation: 'One or more venues have been shortlisted. Review and submit your recommendation.',
    actionRequired: true,
    actionLabel: 'Review Shortlist',
    icon: '⭐',
    color: '#8B5CF6',
    badgeType: 'info',
  },
  
  [SalesHeadStatus.RECOMMENDATION_SUBMITTED]: {
    displayName: 'Recommendation Submitted',
    explanation: 'Your venue recommendation has been submitted to the Venue Team for review.',
    actionRequired: false,
    actionLabel: 'Track Status',
    icon: '📤',
    color: '#10B981',
    badgeType: 'success',
  },
  
  [SalesHeadStatus.UNDER_REVIEW]: {
    displayName: 'Under Review',
    explanation: 'Venue Team is reviewing your venue recommendations and checking suitability.',
    actionRequired: false,
    actionLabel: 'Track Status',
    icon: '👥',
    color: '#F59E0B',
    badgeType: 'warning',
  },
  
  [SalesHeadStatus.AVAILABILITY_CHECK]: {
    displayName: 'Availability Check',
    explanation: 'Venue availability is being confirmed with the selected hotel.',
    actionRequired: false,
    actionLabel: 'Track Status',
    icon: '📅',
    color: '#F59E0B',
    badgeType: 'warning',
  },
  
  [SalesHeadStatus.BOOKING_CONFIRMED]: {
    displayName: 'Booking Confirmed',
    explanation: 'Venue booking has been completed. Your meeting is confirmed.',
    actionRequired: false,
    actionLabel: 'View Booking',
    icon: '✅',
    color: '#10B981',
    badgeType: 'success',
  },
  
  [SalesHeadStatus.EVENT_COMPLETED]: {
    displayName: 'Event Completed',
    explanation: 'Meeting has been successfully completed.',
    actionRequired: false,
    actionLabel: 'View Event Summary',
    icon: '🎉',
    color: '#059669',
    badgeType: 'success',
  },
};

// =====================================================================
// STATUS MAPPING (Database → Sales Head View)
// =====================================================================

/**
 * Maps database meeting_status to Sales Head-friendly status
 */
export function mapToSalesHeadStatus(
  dbStatus: MeetingStatus,
  hasShortlistedVenues: boolean = false
): SalesHeadStatus {
  switch (dbStatus) {
    case 'DRAFT':
      return hasShortlistedVenues 
        ? SalesHeadStatus.VENUE_SHORTLISTED 
        : SalesHeadStatus.VENUE_EXPLORATION;
    
    case 'VENUES_SHORTLISTED':
    case 'SHORTLISTED':
      return SalesHeadStatus.VENUE_SHORTLISTED;
    
    case 'SUBMITTED_TO_ADMIN':
    case 'SUBMITTED':
      return SalesHeadStatus.RECOMMENDATION_SUBMITTED;
    
    case 'VENUE_FINALIZED':
      return SalesHeadStatus.UNDER_REVIEW;
    
    case 'AVAILABILITY_CHECK':
      return SalesHeadStatus.AVAILABILITY_CHECK;
    
    case 'VENUE_UNAVAILABLE':
      return SalesHeadStatus.UNDER_REVIEW; // Show as still reviewing
    
    case 'BOOKED':
      return SalesHeadStatus.BOOKING_CONFIRMED;
    
    case 'COMPLETED':
      return SalesHeadStatus.EVENT_COMPLETED;
    
    case 'CLOSED':
      return SalesHeadStatus.EVENT_COMPLETED;
    
    default:
      return SalesHeadStatus.DRAFT;
  }
}

// =====================================================================
// STATUS TIMELINE
// =====================================================================

export interface TimelineStage {
  status: SalesHeadStatus;
  label: string;
  shortLabel: string;
  order: number;
}

export const STATUS_TIMELINE: TimelineStage[] = [
  {
    status: SalesHeadStatus.DRAFT,
    label: 'Created',
    shortLabel: 'Created',
    order: 1,
  },
  {
    status: SalesHeadStatus.VENUE_EXPLORATION,
    label: 'Venue Search',
    shortLabel: 'Search',
    order: 2,
  },
  {
    status: SalesHeadStatus.RECOMMENDATION_SUBMITTED,
    label: 'Recommendation Submitted',
    shortLabel: 'Submitted',
    order: 3,
  },
  {
    status: SalesHeadStatus.UNDER_REVIEW,
    label: 'Under Review',
    shortLabel: 'Review',
    order: 4,
  },
  {
    status: SalesHeadStatus.AVAILABILITY_CHECK,
    label: 'Availability Check',
    shortLabel: 'Availability',
    order: 5,
  },
  {
    status: SalesHeadStatus.BOOKING_CONFIRMED,
    label: 'Booking Confirmed',
    shortLabel: 'Confirmed',
    order: 6,
  },
  {
    status: SalesHeadStatus.EVENT_COMPLETED,
    label: 'Completed',
    shortLabel: 'Completed',
    order: 7,
  },
];

/**
 * Get current stage progress (0-100%)
 */
export function getStatusProgress(currentStatus: SalesHeadStatus): number {
  const currentStage = STATUS_TIMELINE.find(s => s.status === currentStatus);
  if (!currentStage) return 0;
  
  const totalStages = STATUS_TIMELINE.length;
  return Math.round((currentStage.order / totalStages) * 100);
}

/**
 * Check if a timeline stage is completed
 */
export function isStageCompleted(
  stageStatus: SalesHeadStatus,
  currentStatus: SalesHeadStatus
): boolean {
  const stageOrder = STATUS_TIMELINE.find(s => s.status === stageStatus)?.order || 0;
  const currentOrder = STATUS_TIMELINE.find(s => s.status === currentStatus)?.order || 0;
  return currentOrder > stageOrder;
}

/**
 * Check if a timeline stage is current
 */
export function isStageCurrent(
  stageStatus: SalesHeadStatus,
  currentStatus: SalesHeadStatus
): boolean {
  return stageStatus === currentStatus;
}

/**
 * Check if a timeline stage is pending
 */
export function isStagePending(
  stageStatus: SalesHeadStatus,
  currentStatus: SalesHeadStatus
): boolean {
  const stageOrder = STATUS_TIMELINE.find(s => s.status === stageStatus)?.order || 0;
  const currentOrder = STATUS_TIMELINE.find(s => s.status === currentStatus)?.order || 0;
  return currentOrder < stageOrder;
}

// =====================================================================
// NOTIFICATION EVENTS
// =====================================================================

export enum NotificationEvent {
  RECOMMENDATION_SUBMITTED = 'RECOMMENDATION_SUBMITTED',
  AVAILABILITY_CONFIRMED = 'AVAILABILITY_CONFIRMED',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  ADDITIONAL_INFO_REQUESTED = 'ADDITIONAL_INFO_REQUESTED',
  EVENT_COMPLETED = 'EVENT_COMPLETED',
}

export interface NotificationConfig {
  title: string;
  message: string;
  icon: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export const NOTIFICATION_CONFIG: Record<NotificationEvent, NotificationConfig> = {
  [NotificationEvent.RECOMMENDATION_SUBMITTED]: {
    title: 'Recommendation Submitted',
    message: 'Your venue recommendation has been submitted to the Venue Team.',
    icon: '📤',
    type: 'success',
  },
  
  [NotificationEvent.AVAILABILITY_CONFIRMED]: {
    title: 'Availability Confirmed',
    message: 'Venue availability has been confirmed.',
    icon: '✓',
    type: 'success',
  },
  
  [NotificationEvent.BOOKING_CONFIRMED]: {
    title: 'Booking Confirmed',
    message: 'Venue booking has been confirmed. Your meeting is all set!',
    icon: '✅',
    type: 'success',
  },
  
  [NotificationEvent.ADDITIONAL_INFO_REQUESTED]: {
    title: 'Additional Information Required',
    message: 'Additional information is required for this request. Please check the details.',
    icon: '❗',
    type: 'warning',
  },
  
  [NotificationEvent.EVENT_COMPLETED]: {
    title: 'Event Completed',
    message: 'Meeting has been marked as completed.',
    icon: '🎉',
    type: 'info',
  },
};

// =====================================================================
// ACTION REQUIRED LOGIC
// =====================================================================

export interface ActionRequired {
  hasAction: boolean;
  actionLabel?: string;
  actionUrl?: string;
  explanation?: string;
}

/**
 * Determine if action is required for current status
 */
export function getActionRequired(
  status: SalesHeadStatus,
  requestId: string
): ActionRequired {
  const config = SALES_HEAD_STATUS_CONFIG[status];
  
  if (!config.actionRequired) {
    return {
      hasAction: false,
      explanation: 'No action required. Status updates will be provided automatically.',
    };
  }
  
  switch (status) {
    case SalesHeadStatus.DRAFT:
      return {
        hasAction: true,
        actionLabel: config.actionLabel,
        actionUrl: `/requests/${requestId}/edit`,
        explanation: 'Complete request details and submit.',
      };
    
    case SalesHeadStatus.VENUE_EXPLORATION:
      return {
        hasAction: true,
        actionLabel: config.actionLabel,
        actionUrl: `/requests/${requestId}/explore-venues`,
        explanation: 'Search and shortlist venues.',
      };
    
    case SalesHeadStatus.VENUE_SHORTLISTED:
      return {
        hasAction: true,
        actionLabel: config.actionLabel,
        actionUrl: `/requests/${requestId}/shortlist`,
        explanation: 'Review shortlisted venues and submit recommendation.',
      };
    
    default:
      return {
        hasAction: false,
      };
  }
}

// =====================================================================
// HELPER FUNCTIONS
// =====================================================================

/**
 * Get status display configuration
 */
export function getStatusConfig(status: SalesHeadStatus): StatusConfig {
  return SALES_HEAD_STATUS_CONFIG[status];
}

/**
 * Format status for display
 */
export function formatStatus(status: SalesHeadStatus): string {
  return SALES_HEAD_STATUS_CONFIG[status].displayName;
}

/**
 * Get status explanation
 */
export function getStatusExplanation(status: SalesHeadStatus): string {
  return SALES_HEAD_STATUS_CONFIG[status].explanation;
}

/**
 * Get status icon
 */
export function getStatusIcon(status: SalesHeadStatus): string {
  return SALES_HEAD_STATUS_CONFIG[status].icon;
}

/**
 * Get status color
 */
export function getStatusColor(status: SalesHeadStatus): string {
  return SALES_HEAD_STATUS_CONFIG[status].color;
}

/**
 * Check if status requires user action
 */
export function requiresUserAction(status: SalesHeadStatus): boolean {
  return SALES_HEAD_STATUS_CONFIG[status].actionRequired;
}

