import { MeetingStatus } from './types';
import type { ParticipantMix } from '../rooms/types';

export const INITIAL_PARTICIPANT_MIX: ParticipantMix = {
  so: 0,
  dm: 0,
  rsm: 0,
  ch: 0,
  ibh: 0,
  others: 0,
};

export const MEETING_STATUSES: Record<MeetingStatus, { label: string; badgeType: 'info' | 'warning' | 'success' | 'danger' }> = {
  DRAFT: { label: 'Draft', badgeType: 'info' },
  VENUES_SHORTLISTED: { label: 'Venues Selected', badgeType: 'info' },
  SUBMITTED_TO_ADMIN: { label: 'Awaiting Admin Review', badgeType: 'warning' },
  AVAILABILITY_CHECK: { label: 'Availability Check', badgeType: 'warning' },
  VENUE_UNAVAILABLE: { label: 'Venue Unavailable', badgeType: 'danger' },
  BOOKED: { label: 'Venue Confirmed', badgeType: 'success' },
  COMPLETED: { label: 'Event Completed', badgeType: 'success' },
  CLOSED: { label: 'Closed', badgeType: 'danger' },
  
  // Legacy compatibility fallbacks:
  SUBMITTED: { label: 'Awaiting Admin Review', badgeType: 'warning' },
  SHORTLISTED: { label: 'Venues Selected', badgeType: 'info' },
  VENUE_FINALIZED: { label: 'Availability Check', badgeType: 'warning' }
};

export const SEATING_STYLES = [
  'Cluster',
  'Theater',
  'U-Shape',
  'Classroom',
  'Boardroom',
  'Round Table'
];

export const DEFAULT_FORM_VALUES = {
  meeting_name: '',
  division_id: '',
  meeting_type_id: '',
  city_id: '',
  zone: 'West',
  start_date: '',
  end_date: '',
  expected_pax: 50,
  guaranteed_pax: 40,
  residential_flag: false,
  rooms_required: 0,
  halls_required: 1,
  seating_style: 'Cluster',
  av_requirements: '',
  food_requirements: '',
  transfer_requirements: '',
  // Participant Mix (new architecture)
  participant_mix: INITIAL_PARTICIPANT_MIX
};
