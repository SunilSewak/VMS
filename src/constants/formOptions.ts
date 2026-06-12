/**
 * Form Options Constants for AVEMS Meeting Request Form
 * 
 * Standardized options for dropdowns, radio buttons, and multi-select fields.
 * Step 5: Request Form Optimization
 */

// Seating Styles
export const SEATING_STYLES = [
  'Theatre',
  'Classroom',
  'U-Shape',
  'Cluster',
  'Boardroom',
  'Round Table',
] as const;

export type SeatingStyle = typeof SEATING_STYLES[number];

// AV Requirements
export const AV_REQUIREMENTS = [
  'Projector',
  'LED Wall',
  'Sound System',
  'Wireless Microphone',
  'Podium',
  'Recording Setup',
  'Hybrid Meeting Setup',
] as const;

export type AVRequirement = typeof AV_REQUIREMENTS[number];

// Food Requirements
export const FOOD_REQUIREMENTS = [
  'Breakfast',
  'Morning Tea',
  'Lunch',
  'Evening Tea',
  'Dinner',
  'Gala Dinner',
] as const;

export type FoodRequirement = typeof FOOD_REQUIREMENTS[number];

// Transfer Requirements
export const TRANSFER_TYPES = {
  NOT_REQUIRED: 'Not Required',
  AIRPORT: 'Airport Transfer',
  RAILWAY: 'Railway Transfer',
  LOCAL: 'Local Transportation',
  MULTIPLE: 'Multiple Transfer Requirements',
} as const;

export const TRANSFER_OPTIONS = [
  { value: 'NOT_REQUIRED', label: 'Not Required' },
  { value: 'AIRPORT', label: 'Airport Transfer' },
  { value: 'RAILWAY', label: 'Railway Transfer' },
  { value: 'LOCAL', label: 'Local Transportation' },
  { value: 'MULTIPLE', label: 'Multiple Transfer Requirements' },
] as const;

export type TransferType = keyof typeof TRANSFER_TYPES;

// Preferred Localities
export const PREFERRED_LOCALITIES = [
  'Airport Area',
  'City Center',
  'Business District',
  'Highway',
  'Industrial Area',
  'Any Location',
] as const;

export type PreferredLocality = typeof PREFERRED_LOCALITIES[number];

// Residential Type
export const RESIDENTIAL_TYPES = {
  RESIDENTIAL: 'Residential',
  NON_RESIDENTIAL: 'Non-Residential',
} as const;

export type ResidentialType = keyof typeof RESIDENTIAL_TYPES;

// Constants
export const MAX_PREFERRED_HOTELS = 3;

/**
 * Format multi-select values as comma-separated string
 */
export function formatMultiSelectValue(values: string[]): string {
  return values.join(', ');
}

/**
 * Parse comma-separated string to array
 */
export function parseMultiSelectValue(value: string): string[] {
  if (!value || value.trim() === '') return [];
  return value.split(',').map(v => v.trim()).filter(v => v !== '');
}

/**
 * Generate meeting name from form values
 */
export function generateMeetingName(
  divisionName: string,
  meetingTypeName: string,
  cityName: string,
  startDate: string
): string {
  if (!divisionName || !meetingTypeName || !cityName || !startDate) {
    return '';
  }

  const date = new Date(startDate);
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();

  return `${divisionName} - ${meetingTypeName} - ${cityName} - ${month} ${year}`;
}

