import { MeetingStatus } from './types';

export const MEETING_STATUSES: Record<MeetingStatus, { label: string; badgeType: 'info' | 'warning' | 'success' | 'danger' }> = {
  DRAFT: { label: 'Draft', badgeType: 'info' },
  SUBMITTED: { label: 'Submitted', badgeType: 'warning' },
  SHORTLISTED: { label: 'Shortlisted', badgeType: 'info' },
  QUOTATION_RECEIVED: { label: 'Quote Received', badgeType: 'info' },
  VENUE_FINALIZED: { label: 'Venue Finalized', badgeType: 'success' },
  BOOKED: { label: 'Booked', badgeType: 'success' },
  COMPLETED: { label: 'Completed', badgeType: 'success' },
  CLOSED: { label: 'Closed', badgeType: 'danger' }
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
  transfer_requirements: ''
};
