// Import service types

export interface ParsedRow {
  hotelName: string;
  city: string;
  starRating: string;
  totalRooms: string;
  residentialCapacity: string;
  contactPerson: string;
  mobile: string;
  email: string;
  venueStatus: string;
  hallName: string;
  hallType: string;
  theatreCapacity: string;
  classroomCapacity: string;
  uShapeCapacity: string;
  clusterCapacity: string;
  boardroomCapacity: string;
  receptionCapacity: string;
}

export interface ValidationIssue {
  rowNumber: number;
  field: string;
  error: string;
  value: string;
}

export interface DryRunResult {
  hotelsToCreate: number;
  hotelsToUpdate: number;
  hallsToCreate: number;
  hallsToUpdate: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface ImportResult {
  importSessionId: string;
  status: 'SUCCESS' | 'FAILED';
  hotelsCreated: number;
  hotelsUpdated: number;
  hallsCreated: number;
  hallsUpdated: number;
  rowsSkipped: number;
  errors: ValidationIssue[];
}

export interface ImportHistoryItem {
  id: string;
  import_session_id: string;
  file_name: string;
  uploaded_by: string;
  uploaded_at: string;
  rows_processed: number;
  hotels_created: number;
  hotels_updated: number;
  halls_created: number;
  halls_updated: number;
  rows_skipped: number;
  status: 'UPLOADED' | 'VALIDATED' | 'IMPORTING' | 'SUCCESS' | 'FAILED';
  error_report_path?: string;
}

export const ALLOWED_STAR_RATINGS = [3, 4, 5];
export const ALLOWED_HALL_TYPES = [
  'Ballroom',
  'Conference Room',
  'Board Room',
  'Banquet Hall',
  'Lawn',
  'Rooftop',
  'Meeting Room'
];
export const ALLOWED_VENUE_STATUSES = [
  'ACTIVE',
  'INACTIVE',
  'UNDER_REVIEW',
  'BLACKLISTED'
];