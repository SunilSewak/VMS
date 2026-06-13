// Validation Service
// Comprehensive validation rules for venue bulk import

import { supabase } from '../../lib/supabase';
import type { ImportValidationError, ExcelRow } from './types';

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const VALID_HALL_TYPES = ['BALLROOM', 'CONFERENCE', 'BANQUET', 'BOARDROOM', 'THEATRE', 'OTHER'];
export const VALID_OCCUPANCY_TYPES = ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD'];
export const VALID_DESIGNATIONS = ['SO', 'DM', 'RSM', 'CH', 'IBH'];
export const VALID_STATUSES = ['ACTIVE', 'INACTIVE', 'PENDING_APPROVAL'];
export const VALID_PHOTO_TYPES = ['EXTERIOR', 'LOBBY', 'HALL', 'ROOM', 'DINING', 'OTHER'];

// ============================================================================
// CACHE FOR DATABASE LOOKUPS
// ============================================================================

const cityCache = new Map<string, string>();
const hotelCache = new Map<string, string>();

export async function clearValidationCache() {
  cityCache.clear();
  hotelCache.clear();
}

// ============================================================================
// DATABASE LOOKUP FUNCTIONS
// ============================================================================

async function getCityIdByName(cityName: string): Promise<string | null> {
  const normalizedName = cityName.trim();
  
  if (cityCache.has(normalizedName)) {
    return cityCache.get(normalizedName)!;
  }
  
  const { data } = await supabase
    .from('cities')
    .select('id')
    .ilike('city_name', normalizedName)
    .single();
  
  if (data) {
    cityCache.set(normalizedName, data.id);
    return data.id;
  }
  
  return null;
}

async function getHotelIdByNameAndCity(hotelName: string, cityId: string): Promise<string | null> {
  const key = `${hotelName}|${cityId}`;
  
  if (hotelCache.has(key)) {
    return hotelCache.get(key)!;
  }
  
  const { data } = await supabase
    .from('hotels')
    .select('id')
    .eq('hotel_name', hotelName.trim())
    .eq('city_id', cityId)
    .single();
  
  if (data) {
    hotelCache.set(key, data.id);
    return data.id;
  }
  
  return null;
}

// ============================================================================
// FIELD VALIDATORS
// ============================================================================

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}

function isValidTime(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isPositiveInteger(value: any): boolean {
  const num = parseInt(value);
  return !isNaN(num) && num >= 0;
}

function isValidPercentage(value: any): boolean {
  const num = parseInt(value);
  return !isNaN(num) && num >= 0 && num <= 100;
}

// ============================================================================
// HOTEL VALIDATION
// ============================================================================

export async function validateHotelRow(
  row: ExcelRow,
  rowNumber: number,
  seenHotels: Set<string>
): Promise<ImportValidationError[]> {
  const errors: ImportValidationError[] = [];
  
  // Required: Hotel Name
  if (!row.hotel_name || String(row.hotel_name).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'hotel_name',
      error: 'Hotel name is required and cannot be empty',
      severity: 'ERROR'
    });
  }
  
  // Required: City
  if (!row.city || String(row.city).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'city',
      error: 'City is required',
      severity: 'ERROR'
    });
  }
  
  // If both present, validate city exists
  if (row.hotel_name && row.city) {
    const cityId = await getCityIdByName(String(row.city));
    if (!cityId) {
      errors.push({
        row: rowNumber,
        field: 'city',
        error: `City "${row.city}" does not exist in system`,
        severity: 'ERROR'
      });
    }
  }
  
  // Check for duplicates in same import
  if (row.hotel_name && row.city) {
    const key = `${String(row.hotel_name).trim()}|${String(row.city).trim()}`;
    if (seenHotels.has(key)) {
      errors.push({
        row: rowNumber,
        field: 'hotel_name',
        error: `Duplicate hotel: "${row.hotel_name}" already appears in this import`,
        severity: 'ERROR'
      });
    } else {
      seenHotels.add(key);
    }
  }
  
  // Optional: Email validation
  if (row.email && String(row.email).trim() !== '') {
    if (!isValidEmail(String(row.email))) {
      errors.push({
        row: rowNumber,
        field: 'email',
        error: 'Invalid email format',
        value: row.email,
        severity: 'ERROR'
      });
    }
  }
  
  // Optional: Mobile validation
  if (row.mobile && String(row.mobile).trim() !== '') {
    const mobile = String(row.mobile).replace(/\D/g, '');
    if (!isValidPhone(mobile)) {
      errors.push({
        row: rowNumber,
        field: 'mobile',
        error: 'Mobile must be a 10-digit number',
        value: row.mobile,
        severity: 'ERROR'
      });
    }
  }
  
  // Optional: Total Rooms validation
  if (row.total_rooms && String(row.total_rooms).trim() !== '') {
    if (!isPositiveInteger(row.total_rooms)) {
      errors.push({
        row: rowNumber,
        field: 'total_rooms',
        error: 'Total rooms must be a positive number',
        value: row.total_rooms,
        severity: 'ERROR'
      });
    }
  }
  
  // Optional: Check-in/Check-out time
  if (row.check_in_time && String(row.check_in_time).trim() !== '') {
    if (!isValidTime(String(row.check_in_time))) {
      errors.push({
        row: rowNumber,
        field: 'check_in_time',
        error: 'Check-in time must be in HH:MM format (e.g., 14:00)',
        value: row.check_in_time,
        severity: 'ERROR'
      });
    }
  }
  
  if (row.check_out_time && String(row.check_out_time).trim() !== '') {
    if (!isValidTime(String(row.check_out_time))) {
      errors.push({
        row: rowNumber,
        field: 'check_out_time',
        error: 'Check-out time must be in HH:MM format (e.g., 11:00)',
        value: row.check_out_time,
        severity: 'ERROR'
      });
    }
  }
  
  // Optional: Status validation
  if (row.status && String(row.status).trim() !== '') {
    if (!VALID_STATUSES.includes(String(row.status))) {
      errors.push({
        row: rowNumber,
        field: 'status',
        error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
        value: row.status,
        severity: 'WARNING'
      });
    }
  }
  
  return errors;
}

// ============================================================================
// HALL VALIDATION
// ============================================================================

export async function validateHallRow(
  row: ExcelRow,
  rowNumber: number,
  seenHalls: Set<string>
): Promise<ImportValidationError[]> {
  const errors: ImportValidationError[] = [];
  
  // Required: Hotel Name
  if (!row.hotel_name || String(row.hotel_name).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'hotel_name',
      error: 'Hotel name is required for halls',
      severity: 'ERROR'
    });
  }
  
  // Required: City
  if (!row.city || String(row.city).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'city',
      error: 'City is required for halls',
      severity: 'ERROR'
    });
  }
  
  // Validate hotel exists
  if (row.hotel_name && row.city) {
    const cityId = await getCityIdByName(String(row.city));
    if (cityId) {
      const hotelId = await getHotelIdByNameAndCity(String(row.hotel_name), cityId);
      if (!hotelId) {
        errors.push({
          row: rowNumber,
          field: 'hotel_name',
          error: `Hotel "${row.hotel_name}" not found in city "${row.city}"`,
          severity: 'ERROR'
        });
      }
    }
  }
  
  // Required: Hall Name
  if (!row.hall_name || String(row.hall_name).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'hall_name',
      error: 'Hall name is required',
      severity: 'ERROR'
    });
  }
  
  // Check for duplicate halls in same import
  if (row.hotel_name && row.hall_name) {
    const key = `${String(row.hotel_name).trim()}|${String(row.hall_name).trim()}`;
    if (seenHalls.has(key)) {
      errors.push({
        row: rowNumber,
        field: 'hall_name',
        error: `Duplicate hall: "${row.hall_name}" already appears for this hotel`,
        severity: 'ERROR'
      });
    } else {
      seenHalls.add(key);
    }
  }
  
  // Required: Hall Type
  if (!row.hall_type || String(row.hall_type).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'hall_type',
      error: 'Hall type is required',
      severity: 'ERROR'
    });
  } else if (!VALID_HALL_TYPES.includes(String(row.hall_type).toUpperCase())) {
    errors.push({
      row: rowNumber,
      field: 'hall_type',
      error: `Hall type must be one of: ${VALID_HALL_TYPES.join(', ')}`,
      value: row.hall_type,
      severity: 'ERROR'
    });
  }
  
  // Theatre capacity validation
  if (row.theatre_capacity && String(row.theatre_capacity).trim() !== '') {
    if (!isPositiveInteger(row.theatre_capacity)) {
      errors.push({
        row: rowNumber,
        field: 'theatre_capacity',
        error: 'Theatre capacity must be a positive number',
        value: row.theatre_capacity,
        severity: 'ERROR'
      });
    }
  }
  
  // Validate other capacities are numbers
  const capacityFields = ['classroom_capacity', 'u_shape_capacity', 'cluster_capacity', 'boardroom_capacity', 'reception_capacity'];
  capacityFields.forEach(field => {
    if (row[field] && String(row[field]).trim() !== '') {
      if (!isPositiveInteger(row[field])) {
        errors.push({
          row: rowNumber,
          field,
          error: `${field} must be a positive number`,
          value: row[field],
          severity: 'WARNING'
        });
      }
    }
  });
  
  return errors;
}

// ============================================================================
// ACCOMMODATION VALIDATION
// ============================================================================

export async function validateAccommodationRow(
  row: ExcelRow,
  rowNumber: number
): Promise<ImportValidationError[]> {
  const errors: ImportValidationError[] = [];
  
  // Required: Hotel Name
  if (!row.hotel_name || String(row.hotel_name).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'hotel_name',
      error: 'Hotel name is required',
      severity: 'ERROR'
    });
  }
  
  // Required: City
  if (!row.city || String(row.city).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'city',
      error: 'City is required',
      severity: 'ERROR'
    });
  }
  
  // Validate hotel exists
  if (row.hotel_name && row.city) {
    const cityId = await getCityIdByName(String(row.city));
    if (cityId) {
      const hotelId = await getHotelIdByNameAndCity(String(row.hotel_name), cityId);
      if (!hotelId) {
        errors.push({
          row: rowNumber,
          field: 'hotel_name',
          error: `Hotel "${row.hotel_name}" not found in city "${row.city}"`,
          severity: 'ERROR'
        });
      }
    }
  }
  
  // Required: Total Rooms
  if (!row.total_rooms || String(row.total_rooms).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'total_rooms',
      error: 'Total rooms is required',
      severity: 'ERROR'
    });
  } else if (!isPositiveInteger(row.total_rooms)) {
    errors.push({
      row: rowNumber,
      field: 'total_rooms',
      error: 'Total rooms must be a positive number',
      value: row.total_rooms,
      severity: 'ERROR'
    });
  }
  
  // Validate room breakdown doesn't exceed total
  const total = parseInt(String(row.total_rooms)) || 0;
  const roomTypes = ['single_rooms', 'double_rooms', 'triple_rooms', 'quad_rooms', 'suite_rooms'];
  let roomSum = 0;
  
  roomTypes.forEach(type => {
    if (row[type] && String(row[type]).trim() !== '') {
      const count = parseInt(row[type]) || 0;
      roomSum += count;
      if (count < 0) {
        errors.push({
          row: rowNumber,
          field: type,
          error: `${type} cannot be negative`,
          severity: 'ERROR'
        });
      }
    }
  });
  
  if (roomSum > total) {
    errors.push({
      row: rowNumber,
      field: 'total_rooms',
      error: `Sum of room types (${roomSum}) exceeds total rooms (${total})`,
      severity: 'ERROR'
    });
  }
  
  // Occupancy rate validation
  if (row.occupancy_rate && String(row.occupancy_rate).trim() !== '') {
    if (!isValidPercentage(row.occupancy_rate)) {
      errors.push({
        row: rowNumber,
        field: 'occupancy_rate',
        error: 'Occupancy rate must be between 0 and 100',
        value: row.occupancy_rate,
        severity: 'ERROR'
      });
    }
  }
  
  return errors;
}

// ============================================================================
// OCCUPANCY RULES VALIDATION
// ============================================================================

export async function validateOccupancyRow(
  row: ExcelRow,
  rowNumber: number
): Promise<ImportValidationError[]> {
  const errors: ImportValidationError[] = [];
  
  // Required: Hotel Name
  if (!row.hotel_name || String(row.hotel_name).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'hotel_name',
      error: 'Hotel name is required',
      severity: 'ERROR'
    });
  }
  
  // Required: City
  if (!row.city || String(row.city).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'city',
      error: 'City is required',
      severity: 'ERROR'
    });
  }
  
  // Required: Designation
  if (!row.designation || String(row.designation).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'designation',
      error: 'Designation is required',
      severity: 'ERROR'
    });
  } else if (!VALID_DESIGNATIONS.includes(String(row.designation).toUpperCase())) {
    errors.push({
      row: rowNumber,
      field: 'designation',
      error: `Designation must be one of: ${VALID_DESIGNATIONS.join(', ')}`,
      value: row.designation,
      severity: 'ERROR'
    });
  }
  
  // Required: Occupancy Type
  if (!row.occupancy_type || String(row.occupancy_type).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'occupancy_type',
      error: 'Occupancy type is required',
      severity: 'ERROR'
    });
  } else if (!VALID_OCCUPANCY_TYPES.includes(String(row.occupancy_type).toUpperCase())) {
    errors.push({
      row: rowNumber,
      field: 'occupancy_type',
      error: `Occupancy type must be one of: ${VALID_OCCUPANCY_TYPES.join(', ')}`,
      value: row.occupancy_type,
      severity: 'ERROR'
    });
  }
  
  // Optional: Min/Max occupancy validation
  if (row.min_occupancy && String(row.min_occupancy).trim() !== '') {
    if (!isPositiveInteger(row.min_occupancy)) {
      errors.push({
        row: rowNumber,
        field: 'min_occupancy',
        error: 'Min occupancy must be a positive number',
        value: row.min_occupancy,
        severity: 'ERROR'
      });
    }
  }
  
  if (row.max_occupancy && String(row.max_occupancy).trim() !== '') {
    if (!isPositiveInteger(row.max_occupancy)) {
      errors.push({
        row: rowNumber,
        field: 'max_occupancy',
        error: 'Max occupancy must be a positive number',
        value: row.max_occupancy,
        severity: 'ERROR'
      });
    }
  }
  
  // Validate min <= max
  if (row.min_occupancy && row.max_occupancy) {
    const min = parseInt(row.min_occupancy) || 0;
    const max = parseInt(row.max_occupancy) || 0;
    if (min > max) {
      errors.push({
        row: rowNumber,
        field: 'max_occupancy',
        error: 'Max occupancy must be greater than or equal to min occupancy',
        severity: 'ERROR'
      });
    }
  }
  
  return errors;
}

// ============================================================================
// PHOTOS VALIDATION
// ============================================================================

export async function validatePhotosRow(
  row: ExcelRow,
  rowNumber: number
): Promise<ImportValidationError[]> {
  const errors: ImportValidationError[] = [];
  
  // Required: Hotel Name
  if (!row.hotel_name || String(row.hotel_name).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'hotel_name',
      error: 'Hotel name is required',
      severity: 'ERROR'
    });
  }
  
  // Required: City
  if (!row.city || String(row.city).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'city',
      error: 'City is required',
      severity: 'ERROR'
    });
  }
  
  // Required: Photo URL
  if (!row.photo_url || String(row.photo_url).trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'photo_url',
      error: 'Photo URL is required',
      severity: 'ERROR'
    });
  } else if (!isValidUrl(String(row.photo_url))) {
    errors.push({
      row: rowNumber,
      field: 'photo_url',
      error: 'Photo URL must be a valid URL',
      value: row.photo_url,
      severity: 'ERROR'
    });
  }
  
  // Optional: Photo Type validation
  if (row.photo_type && String(row.photo_type).trim() !== '') {
    if (!VALID_PHOTO_TYPES.includes(String(row.photo_type).toUpperCase())) {
      errors.push({
        row: rowNumber,
        field: 'photo_type',
        error: `Photo type must be one of: ${VALID_PHOTO_TYPES.join(', ')}`,
        value: row.photo_type,
        severity: 'WARNING'
      });
    }
  }
  
  return errors;
}
