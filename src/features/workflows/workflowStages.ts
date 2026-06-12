/**
 * Workflow Stage Mapping
 * 
 * Maps meeting request status to workflow stages for Admin processing.
 * Used throughout the Admin Processing Workspace for progress tracking.
 */

import type { MeetingStatus } from '../meetings/types';

export type WorkflowStage = 
  | 'request-submitted'
  | 'venue-evaluation'
  | 'booking'
  | 'invoice'
  | 'payment'
  | 'closed';

export interface WorkflowStageDefinition {
  id: WorkflowStage;
  label: string;
  description: string;
  order: number;
}

export const WORKFLOW_STAGES: WorkflowStageDefinition[] = [
  {
    id: 'request-submitted',
    label: 'Request Submitted',
    description: 'Request received and awaiting venue evaluation',
    order: 1,
  },
  {
    id: 'venue-evaluation',
    label: 'Venue Evaluation',
    description: 'Evaluating venue options and confirming availability',
    order: 2,
  },
  {
    id: 'booking',
    label: 'Booking',
    description: 'Creating booking and confirming venue reservation',
    order: 3,
  },
  {
    id: 'invoice',
    label: 'Invoice',
    description: 'Verifying and recording invoice details',
    order: 4,
  },
  {
    id: 'payment',
    label: 'Payment',
    description: 'Tracking payment status and recording transactions',
    order: 5,
  },
  {
    id: 'closed',
    label: 'Closed',
    description: 'Request processing complete',
    order: 6,
  },
];

/**
 * Maps meeting request status to workflow stage
 */
export function getWorkflowStage(status: MeetingStatus): WorkflowStage {
  switch (status) {
    case 'DRAFT':
    case 'SUBMITTED_TO_ADMIN':
    case 'SUBMITTED':
      return 'request-submitted';
    
    case 'VENUES_SHORTLISTED':
    case 'SHORTLISTED':
    case 'AVAILABILITY_CHECK':
    case 'VENUE_UNAVAILABLE':
      return 'venue-evaluation';
    
    case 'BOOKED':
      return 'invoice';
    
    case 'COMPLETED':
    case 'CLOSED':
      return 'closed';
    
    default:
      return 'request-submitted';
  }
}

/**
 * Gets the current action message based on workflow stage
 */
export function getCurrentActionMessage(stage: WorkflowStage): string {
  switch (stage) {
    case 'request-submitted':
      return 'Review request details and initiate venue evaluation.';
    case 'venue-evaluation':
      return 'Evaluate venues and record availability responses.';
    case 'booking':
      return 'Create booking and confirm venue reservation.';
    case 'invoice':
      return 'Verify invoice details and record in system.';
    case 'payment':
      return 'Track payment status and record transaction details.';
    case 'closed':
      return 'Request processing complete. No further action required.';
    default:
      return 'Process this request.';
  }
}

/**
 * Calculates workflow progress percentage
 */
export function getWorkflowProgress(stage: WorkflowStage): number {
  const currentStage = WORKFLOW_STAGES.find(s => s.id === stage);
  if (!currentStage) return 0;
  
  const totalStages = WORKFLOW_STAGES.length;
  return Math.round((currentStage.order / totalStages) * 100);
}

/**
 * Gets completed stages based on current stage
 */
export function getCompletedStages(stage: WorkflowStage): WorkflowStage[] {
  const currentStage = WORKFLOW_STAGES.find(s => s.id === stage);
  if (!currentStage) return [];
  
  return WORKFLOW_STAGES
    .filter(s => s.order < currentStage.order)
    .map(s => s.id);
}

// ─────────────────────────────────────────────────────────────────────
// Backward Compatibility Exports (for old workflow components)
// ─────────────────────────────────────────────────────────────────────

/**
 * @deprecated Use WORKFLOW_STAGES directly
 */
export function getAllStages() {
  return WORKFLOW_STAGES;
}

/**
 * @deprecated Use getCompletedStages and check if stage is in the array
 */
export function isStageCompleted(stage: WorkflowStage, currentStage: WorkflowStage): boolean {
  const completedStages = getCompletedStages(currentStage);
  return completedStages.includes(stage);
}

/**
 * @deprecated Compare stages directly
 */
export function isStageCurrent(stage: WorkflowStage, currentStage: WorkflowStage): boolean {
  return stage === currentStage;
}

/**
 * @deprecated Use getWorkflowProgress directly
 */
export function calculateProgress(stage: WorkflowStage): number {
  return getWorkflowProgress(stage);
}

/**
 * @deprecated Use getCompletedStages().length
 */
export function getCompletedStagesCount(stage: WorkflowStage): number {
  return getCompletedStages(stage).length;
}

/**
 * Type alias for backward compatibility
 * @deprecated Use WorkflowStage instead
 */
export type WorkflowStageId = WorkflowStage;

/**
 * @deprecated Use WORKFLOW_STAGES.find(s => s.id === stage)
 */
export function getStageInfo(stage: WorkflowStage): WorkflowStageDefinition | undefined {
  return WORKFLOW_STAGES.find(s => s.id === stage);
}
