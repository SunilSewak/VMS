// Validation service - validates Excel data before import

import { ParsedRow, ValidationIssue } from './types';

const ALLOWED_STAR_RATINGS = [3, 4, 5];
const ALLOWED_HALL_TYPES = [
  'Ballroom',
  'Conference Room',
  'Board Room',
  'Banquet Hall',
  'Lawn',
  'Rooftop',
  'Meeting Room'
];

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateMobile(mobile: string): boolean {
  const mobileRegex = /^[0-9]{10}$/;
  return mobileRegex.test(mobile);
}

export function validateExcelData(rows: ParsedRow[]): {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
} {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Detect duplicates within file
  const hotelMap = new Map<string, number>();
  const hallMap = new Map<string, number>();

  rows.forEach((row, idx) => {
    const rowNumber = idx + 2; // +2 for header row

    // Hotel name validation
    if (!row.hotelName || row.hotelName.trim() === '') {
      errors.push({
        rowNumber,
        field: 'Hotel Name',
        error: 'Missing value',
        value: 'blank'
      });
    }

    // City validation
    if (!row.city || row.city.trim() === '') {
      errors.push({
        rowNumber,
        field: 'City',
        error: 'Missing value',
        value: 'blank'
      });
    }

    // Hall name validation
    if (!row.hallName || row.hallName.trim() === '') {
      errors.push({
        rowNumber,
        field: 'Hall Name',
        error: 'Missing value',
        value: 'blank'
      });
    }

    // Duplicate hotel detection (same hotel + city)
    const hotelKey = `${row.hotelName?.trim() || ''}|${row.city?.trim() || ''}`;
    if (hotelMap.has(hotelKey)) {
      errors.push({
        rowNumber,
        field: 'Hotel Name',
        error: 'Duplicate Hotel + City combination',
        value: row.hotelName
      });
    } else {
      hotelMap.set(hotelKey, idx);
    }

    // Duplicate hall detection (same hotel + hall name)
    const hallKey = `${row.hotelName?.trim() || ''}|${row.hallName?.trim() || ''}`;
    if (hallMap.has(hallKey)) {
      errors.push({
        rowNumber,
        field: 'Hall Name',
        error: 'Duplicate Hall + Hotel combination',
        value: row.hallName
      });
    } else {
      hallMap.set(hallKey, idx);
    }

    // Star rating validation
    if (row.starRating) {
      const num = parseInt(row.starRating, 10);
      if (!ALLOWED_STAR_RATINGS.includes(num)) {
        errors.push({
          rowNumber,
          field: 'Star Rating',
          error: 'Must be 3, 4, or 5',
          value: row.starRating
        });
      }
    }

    // Hall type validation
    if (row.hallType) {
      if (!ALLOWED_HALL_TYPES.includes(row.hallType)) {
        errors.push({
          rowNumber,
          field: 'Hall Type',
          error: `Must be one of: ${ALLOWED_HALL_TYPES.join(', ')}`,
          value: row.hallType
        });
      }
    }

    // Email format validation
    if (row.email && !validateEmail(row.email)) {
      warnings.push({
        rowNumber,
        field: 'Email',
        error: 'Invalid format',
        value: row.email
      });
    }

    // Mobile format validation
    if (row.mobile && !validateMobile(row.mobile)) {
      errors.push({
        rowNumber,
        field: 'Mobile',
        error: 'Must be 10 digits',
        value: row.mobile
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}