// Venue Bulk Import Service
// Handles multi-sheet Excel parsing, validation, import preview, and actual import

import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';
import { generateMasterTemplate } from './templateService';
import type {
  ImportValidationError,
  ImportPreviewData,
  ImportResult,
  VenueImportHistory,
  DataQualityMetrics,
  ExcelRow,
  MultiSheetValidationResult,
  BulkImportResult,
} from './types';

// ============================================================================
// VALIDATION RULES
// ============================================================================

const HALL_TYPES = ['BALLROOM', 'CONFERENCE', 'BANQUET', 'BOARDROOM', 'THEATRE', 'OTHER'];
const VENUE_STATUSES = ['ACTIVE', 'INACTIVE', 'PENDING_APPROVAL'];
const OCCUPANCY_TYPES = ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD'];
const ROOM_TYPES = ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD'];

// Sheet name mappings (flexible for different Excel formats)
const SHEET_PATTERNS = {
  hotel: ['hotel master', 'hotels', 'hotel', 'master'],
  hall: ['hall master', 'halls', 'hall'],
  accommodation: ['accommodation', 'accommodation inventory', 'inventory', 'rooms'],
  occupancy: ['occupancy', 'occupancy matrix', 'occupancy rules'],
  photos: ['photos', 'hotel photos', 'images', 'images & photos'],
};

// ============================================================================
// TEMPLATE GENERATION
// ============================================================================

export function generateExcelTemplate(): Blob {
  return generateMasterTemplate();
}

// ============================================================================
// LEGACY COMPATIBILITY FUNCTIONS
// ============================================================================

/**
 * Backward-compatible import preview generator
 * Works with simple row arrays for older UI flows
 */
export async function generateImportPreview(rows: ExcelRow[]): Promise<ImportPreviewData> {
  const allErrors: ImportValidationError[] = [];
  let validCount = 0;
  let hotelToCreate = 0;
  let hotelToUpdate = 0;
  let hallToCreate = 0;
  let hallToUpdate = 0;

  // Fetch existing hotels
  const { data: existingHotels } = await supabase
    .from('hotels')
    .select('id, hotel_name, city_id');

  const hotelMap = new Map<string, string>();
  if (existingHotels) {
    existingHotels.forEach((h: any) => {
      hotelMap.set(`${h.hotel_name}|${h.city_id}`, h.id);
    });
  }

  // Separate and validate rows
  const hotelRows = rows.filter((r) => r.star_rating !== undefined && r.city_name !== undefined);
  const hallRows = rows.filter((r) => r.theatre_capacity !== undefined && r.hall_name !== undefined);

  hotelRows.forEach((row, idx) => {
    const errors = validateHotelRow(row, idx + 2);
    if (errors.length === 0) {
      validCount++;
      const key = `${row.hotel_name}|${row.city_name}`;
      if (hotelMap.has(key)) {
        hotelToUpdate++;
      } else {
        hotelToCreate++;
      }
    } else {
      allErrors.push(...errors);
    }
  });

  hallRows.forEach((row, idx) => {
    const errors = validateHallRow(row, hotelRows.length + idx + 2);
    if (errors.length === 0) {
      validCount++;
      hallToCreate++;
    } else {
      allErrors.push(...errors);
    }
  });

  return {
    validRows: validCount,
    invalidRows: allErrors.filter((e) => e.severity === 'ERROR').length,
    errors: allErrors,
    hotelsSummary: {
      toCreate: hotelToCreate,
      toUpdate: hotelToUpdate,
    },
    hallsSummary: {
      toCreate: hallToCreate,
      toUpdate: hallToUpdate,
    },
  };
}

// ============================================================================
// SHEET DETECTION & CLASSIFICATION
// ============================================================================

function normalizeSheetName(name: string): string {
  return name.toLowerCase().trim();
}

function detectSheetType(sheetName: string): string | null {
  const normalized = normalizeSheetName(sheetName);
  
  for (const [type, patterns] of Object.entries(SHEET_PATTERNS)) {
    for (const pattern of patterns) {
      if (normalized.includes(pattern) || pattern.includes(normalized)) {
        return type;
      }
    }
  }
  
  return null;
}

function detectRowType(row: ExcelRow, sheetType: string): string | null {
  if (sheetType === 'hotel') return 'HOTEL';
  if (sheetType === 'hall') return 'HALL';
  if (sheetType === 'accommodation') return 'ACCOMMODATION';
  if (sheetType === 'occupancy') return 'OCCUPANCY';
  if (sheetType === 'photos') return 'PHOTO';
  
  // Fallback: detect by presence of distinctive columns
  if (row.hotel_name && row.theatre_capacity) return 'HALL';
  if (row.hotel_name && row.room_type) return 'ACCOMMODATION';
  if (row.hotel_name && row.designation) return 'OCCUPANCY';
  if (row.hotel_name && row.photo_url) return 'PHOTO';
  if (row.hotel_name && row.city_name) return 'HOTEL';
  
  return null;
}

// ============================================================================
// ZONE & CITY RESOLUTION
// ============================================================================

const zoneCache = new Map<string, string>(); // zone_name -> zone_id
const cityCache = new Map<string, string>(); // city_name -> city_id

export async function resolveZone(zoneName: string): Promise<string | null> {
  if (!zoneName || !zoneName.trim()) return null;
  
  const normalized = zoneName.trim();
  
  if (zoneCache.has(normalized)) {
    return zoneCache.get(normalized)!;
  }
  
  const { data: zone } = await supabase
    .from('zones')
    .select('id')
    .ilike('zone_name', normalized)
    .single();
  
  if (zone) {
    zoneCache.set(normalized, zone.id);
    return zone.id;
  }
  
  return null;
}

export async function ensureCityExists(cityName: string, zoneName?: string): Promise<string> {
  if (!cityName || !cityName.trim()) {
    throw new Error('City name is required');
  }

  const normalizedCityName = cityName.trim();

  if (cityCache.has(normalizedCityName)) {
    return cityCache.get(normalizedCityName)!;
  }

  // Check if city exists in database
  const { data: existingCity, error: fetchError } = await supabase
    .from('cities')
    .select('id')
    .ilike('city_name', normalizedCityName)
    .single();

  if (existingCity) {
    cityCache.set(normalizedCityName, existingCity.id);
    return existingCity.id;
  }

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error(`Failed to fetch city: ${fetchError.message}`);
  }

  // City doesn't exist, create it with zone if provided
  let zoneId: string | null = null;
  if (zoneName) {
    zoneId = await resolveZone(zoneName);
  }

  const { data: newCity, error: createError } = await supabase
    .from('cities')
    .insert([{ city_name: normalizedCityName, ...(zoneId && { zone_id: zoneId }) }])
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create city: ${createError.message}`);
  }

  if (newCity) {
    cityCache.set(normalizedCityName, newCity.id);
    return newCity.id;
  }

  throw new Error('Failed to create or retrieve city');
}


// ============================================================================
// FILE PARSING
// ============================================================================

interface ParsedSheets {
  [sheetType: string]: ExcelRow[];
}

/**
 * Parse Excel file into multi-sheet structure
 */
export async function parseExcelFileMultiSheet(file: File): Promise<ParsedSheets> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Failed to read file'));
          return;
        }

        // Parse workbook
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheets: ParsedSheets = {};

        // Process each sheet
        workbook.SheetNames.forEach((sheetName) => {
          const sheetType = detectSheetType(sheetName);
          if (!sheetType) {
            console.warn(`Sheet "${sheetName}" not recognized, skipping`);
            return;
          }

          const sheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json<ExcelRow>(sheet, {
            header: 1,
            defval: '',
          });

          // Convert array format to object format
          if (sheetData.length > 1) {
            const headers = (sheetData[0] as any[]).map((h) =>
              String(h).toLowerCase().replace(/\s+/g, '_').trim()
            );

            const rows: ExcelRow[] = [];
            for (let i = 1; i < sheetData.length; i++) {
              const row = (sheetData[i] as any[]) || [];
              const rowObj: ExcelRow = {};

              headers.forEach((header, idx) => {
                if (header && row[idx] !== undefined && row[idx] !== '') {
                  rowObj[header as keyof ExcelRow] = String(row[idx]).trim();
                }
              });

              // Only add rows with data
              if (Object.values(rowObj).some((v) => v && v !== '')) {
                rows.push(rowObj);
              }
            }

            if (!sheets[sheetType]) {
              sheets[sheetType] = [];
            }
            sheets[sheetType].push(...rows);
          }
        });

        resolve(sheets);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Backward-compatible parse function - returns flat array of all rows
 * This maintains compatibility with existing UI code
 */
export async function parseExcelFile(file: File): Promise<ExcelRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Failed to read file'));
          return;
        }

        // Parse workbook
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const allRows: ExcelRow[] = [];

        // Process each sheet
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json<ExcelRow>(sheet, {
            header: 1,
            defval: '',
          });

          // Convert array format to object format
          if (sheetData.length > 1) {
            const headers = (sheetData[0] as any[]).map((h) =>
              String(h).toLowerCase().replace(/\s+/g, '_').trim()
            );

            for (let i = 1; i < sheetData.length; i++) {
              const row = (sheetData[i] as any[]) || [];
              const rowObj: ExcelRow = {};

              headers.forEach((header, idx) => {
                if (header && row[idx] !== undefined && row[idx] !== '') {
                  rowObj[header as keyof ExcelRow] = String(row[idx]).trim();
                }
              });

              // Only add rows with data
              if (Object.values(rowObj).some((v) => v && v !== '')) {
                allRows.push(rowObj);
              }
            }
          }
        });

        resolve(allRows);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

// ============================================================================
// HOTEL LOOKUP
// ============================================================================

const hotelCache = new Map<string, string>(); // hotel_name|city_id -> hotel_id

export async function resolveHotelId(
  hotelName: string,
  cityId: string
): Promise<string | null> {
  if (!hotelName || !cityId) return null;

  const key = `${hotelName}|${cityId}`;

  if (hotelCache.has(key)) {
    return hotelCache.get(key)!;
  }

  const { data: hotel } = await supabase
    .from('hotels')
    .select('id')
    .eq('hotel_name', hotelName)
    .eq('city_id', cityId)
    .single();

  if (hotel) {
    hotelCache.set(key, hotel.id);
    return hotel.id;
  }

  return null;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

function validateHotelRow(row: ExcelRow, rowNumber: number): ImportValidationError[] {
  const errors: ImportValidationError[] = [];

  // Required fields
  if (!row.hotel_name || typeof row.hotel_name !== 'string' || row.hotel_name.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'hotel_name',
      error: 'Hotel name is required',
      value: row.hotel_name,
      severity: 'ERROR',
    });
  }

  if (!row.city_name || typeof row.city_name !== 'string' || row.city_name.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'city_name',
      error: 'City is required',
      value: row.city_name,
      severity: 'ERROR',
    });
  }

  // Star rating validation
  const starRating = parseInt(row.star_rating);
  if (isNaN(starRating) || ![3, 4, 5].includes(starRating)) {
    errors.push({
      row: rowNumber,
      field: 'star_rating',
      error: 'Star rating must be 3, 4, or 5',
      value: row.star_rating,
      severity: 'ERROR',
    });
  }

  // Total rooms validation
  const totalRooms = parseInt(row.total_rooms);
  if (isNaN(totalRooms) || totalRooms < 0) {
    errors.push({
      row: rowNumber,
      field: 'total_rooms',
      error: 'Total rooms must be a non-negative number',
      value: row.total_rooms,
      severity: 'ERROR',
    });
  }

  // Email validation
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    errors.push({
      row: rowNumber,
      field: 'email',
      error: 'Invalid email format',
      value: row.email,
      severity: 'ERROR',
    });
  }

  // Mobile validation
  if (row.mobile && !/^\d{10}$/.test(row.mobile)) {
    errors.push({
      row: rowNumber,
      field: 'mobile',
      error: 'Mobile must be 10 digits',
      value: row.mobile,
      severity: 'ERROR',
    });
  }

  // Status validation
  if (row.status && !VENUE_STATUSES.includes(row.status)) {
    errors.push({
      row: rowNumber,
      field: 'status',
      error: `Status must be one of: ${VENUE_STATUSES.join(', ')}`,
      value: row.status,
      severity: 'WARNING',
    });
  }

  return errors;
}

function validateHallRow(row: ExcelRow, rowNumber: number): ImportValidationError[] {
  const errors: ImportValidationError[] = [];

  // Required fields
  if (!row.hotel_name || typeof row.hotel_name !== 'string' || row.hotel_name.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'hotel_name',
      error: 'Hotel name is required',
      value: row.hotel_name,
      severity: 'ERROR',
    });
  }

  if (!row.hall_name || typeof row.hall_name !== 'string' || row.hall_name.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'hall_name',
      error: 'Hall name is required',
      value: row.hall_name,
      severity: 'ERROR',
    });
  }

  if (!row.hall_type || !HALL_TYPES.includes(row.hall_type)) {
    errors.push({
      row: rowNumber,
      field: 'hall_type',
      error: `Hall type must be one of: ${HALL_TYPES.join(', ')}`,
      value: row.hall_type,
      severity: 'ERROR',
    });
  }

  // Theatre capacity validation
  const theatreCapacity = parseInt(row.theatre_capacity);
  if (isNaN(theatreCapacity) || theatreCapacity < 0) {
    errors.push({
      row: rowNumber,
      field: 'theatre_capacity',
      error: 'Theatre capacity must be a non-negative number',
      value: row.theatre_capacity,
      severity: 'ERROR',
    });
  }

  return errors;
}

function validateAccommodationRow(row: ExcelRow, rowNumber: number): ImportValidationError[] {
  const errors: ImportValidationError[] = [];

  // Required fields
  if (!row.hotel_name || typeof row.hotel_name !== 'string' || row.hotel_name.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'hotel_name',
      error: 'Hotel name is required',
      value: row.hotel_name,
      severity: 'ERROR',
    });
  }

  if (!row.room_type || !ROOM_TYPES.includes(row.room_type)) {
    errors.push({
      row: rowNumber,
      field: 'room_type',
      error: `Room type must be one of: ${ROOM_TYPES.join(', ')}`,
      value: row.room_type,
      severity: 'ERROR',
    });
  }

  // Room count validation
  const roomCount = parseInt(row.room_count);
  if (isNaN(roomCount) || roomCount < 0) {
    errors.push({
      row: rowNumber,
      field: 'room_count',
      error: 'Room count must be a non-negative number',
      value: row.room_count,
      severity: 'ERROR',
    });
  }

  return errors;
}

function validateOccupancyRow(row: ExcelRow, rowNumber: number): ImportValidationError[] {
  const errors: ImportValidationError[] = [];

  // Required fields
  if (!row.hotel_name || typeof row.hotel_name !== 'string' || row.hotel_name.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'hotel_name',
      error: 'Hotel name is required',
      value: row.hotel_name,
      severity: 'ERROR',
    });
  }

  if (!row.designation || typeof row.designation !== 'string' || row.designation.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'designation',
      error: 'Designation is required',
      value: row.designation,
      severity: 'ERROR',
    });
  }

  if (!row.min_occupancy || !OCCUPANCY_TYPES.includes(row.min_occupancy)) {
    errors.push({
      row: rowNumber,
      field: 'min_occupancy',
      error: `Min occupancy must be one of: ${OCCUPANCY_TYPES.join(', ')}`,
      value: row.min_occupancy,
      severity: 'ERROR',
    });
  }

  return errors;
}

function validatePhotoRow(row: ExcelRow, rowNumber: number): ImportValidationError[] {
  const errors: ImportValidationError[] = [];

  // Required fields
  if (!row.hotel_name || typeof row.hotel_name !== 'string' || row.hotel_name.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'hotel_name',
      error: 'Hotel name is required',
      value: row.hotel_name,
      severity: 'ERROR',
    });
  }

  if (!row.photo_url || typeof row.photo_url !== 'string' || row.photo_url.trim() === '') {
    errors.push({
      row: rowNumber,
      field: 'photo_url',
      error: 'Photo URL is required',
      value: row.photo_url,
      severity: 'ERROR',
    });
  }

  // URL validation
  if (row.photo_url) {
    try {
      new URL(row.photo_url);
    } catch {
      errors.push({
        row: rowNumber,
        field: 'photo_url',
        error: 'Photo URL is not a valid URL',
        value: row.photo_url,
        severity: 'ERROR',
      });
    }
  }

  return errors;
}

// ============================================================================
// ERROR REPORT GENERATION
// ============================================================================

export async function generateErrorReport(errors: ImportValidationError[]): Promise<Blob> {
  // Sort errors by row and severity
  const sorted = errors.sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.severity === 'ERROR' ? -1 : 1;
  });

  // Generate CSV content
  const headers = ['Row', 'Field', 'Severity', 'Error', 'Value'];
  const rows = sorted.map(e => [
    e.row.toString(),
    e.field,
    e.severity,
    e.error,
    e.value?.toString() || '',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return new Blob([csv], { type: 'text/csv;charset=utf-8' });
}

export function downloadErrorReport(errors: ImportValidationError[], fileName: string = 'import-errors.csv') {
  generateErrorReport(errors).then(blob => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  });
}

// ============================================================================
// IMPORT EXECUTION (MULTI-SHEET)
// ============================================================================

export async function executeImport(
  data: ExcelRow[] | ParsedSheets,
  userId: string
): Promise<BulkImportResult | ImportResult> {
  // Check if data is flat array (legacy) or structured sheets (new)
  const isLegacyFormat = Array.isArray(data);
  
  if (isLegacyFormat) {
    // Legacy: convert flat array to structured format
    return await executeLegacyImport(data as ExcelRow[], userId);
  } else {
    // New multi-sheet format
    return await executeMultiSheetImport(data as ParsedSheets, userId);
  }
}

/**
 * Legacy import for flat row arrays
 */
async function executeLegacyImport(rows: ExcelRow[], userId: string): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    hotelCount: 0,
    hallCount: 0,
    hotelCreated: 0,
    hotelUpdated: 0,
    hallCreated: 0,
    hallUpdated: 0,
    rowsProcessed: 0,
    rowsSkipped: 0,
    errors: [],
  };

  try {
    const importSessionId = crypto.randomUUID();
    const processedHotels = new Map<string, string>();

    // Process hotels
    const hotelRows = rows.filter((r) => r.star_rating !== undefined && r.city_name !== undefined);

    for (const row of hotelRows) {
      result.rowsProcessed++;
      const rowNumber = result.rowsProcessed + 1;
      const errors = validateHotelRow(row, rowNumber);

      if (errors.length > 0) {
        result.rowsSkipped++;
        result.errors.push(...errors);
        continue;
      }

      try {
        let cityId: string;
        try {
          cityId = await ensureCityExists(row.city_name!);
        } catch (err: any) {
          result.errors.push({
            row: rowNumber,
            field: 'city_name',
            error: `City resolution failed: ${err.message}`,
            value: row.city_name,
            severity: 'ERROR',
          });
          result.rowsSkipped++;
          continue;
        }

        const existingHotelId = await resolveHotelId(row.hotel_name!, cityId);
        const isUpdate = !!existingHotelId;

        const { data: hotelData, error } = await supabase
          .from('hotels')
          .upsert(
            {
              ...(existingHotelId && { id: existingHotelId }),
              hotel_name: row.hotel_name,
              city_id: cityId,
              status: row.status || 'ACTIVE',
              address: row.address || '',
              contact_phone: row.mobile || '',
              contact_email: row.email || '',
              total_rooms: parseInt(row.total_rooms || '0'),
              residential_capacity: parseInt(row.residential_capacity || '0'),
            },
            { onConflict: 'hotel_name,city_id' }
          )
          .select()
          .single();

        if (error) {
          result.errors.push({
            row: rowNumber,
            field: 'hotel_name',
            error: `Database error: ${error.message}`,
            value: row.hotel_name,
            severity: 'ERROR',
          });
          result.rowsSkipped++;
        } else if (hotelData) {
          const key = `${row.hotel_name}|${row.city_name}`;
          processedHotels.set(key, hotelData.id);

          if (isUpdate) {
            result.hotelUpdated++;
          } else {
            result.hotelCreated++;
          }
          result.hotelCount++;
        }
      } catch (err: any) {
        result.errors.push({
          row: rowNumber,
          field: 'hotel_name',
          error: err.message,
          value: row.hotel_name,
          severity: 'ERROR',
        });
        result.rowsSkipped++;
      }
    }

    // Process halls
    const hallRows = rows.filter((r) => r.theatre_capacity !== undefined && r.hall_name !== undefined);

    for (const row of hallRows) {
      result.rowsProcessed++;
      const rowNumber = result.rowsProcessed + 1;
      const errors = validateHallRow(row, rowNumber);

      if (errors.length > 0) {
        result.rowsSkipped++;
        result.errors.push(...errors);
        continue;
      }

      try {
        if (!row.hotel_name || !row.city_name) {
          result.errors.push({
            row: rowNumber,
            field: 'hotel_name',
            error: 'Hotel name and city are required for halls',
            severity: 'ERROR',
          });
          result.rowsSkipped++;
          continue;
        }

        let cityId: string;
        try {
          cityId = await ensureCityExists(row.city_name);
        } catch (err: any) {
          result.errors.push({
            row: rowNumber,
            field: 'city_name',
            error: `City resolution failed: ${err.message}`,
            value: row.city_name,
            severity: 'ERROR',
          });
          result.rowsSkipped++;
          continue;
        }

        const hotelKey = `${row.hotel_name}|${row.city_name}`;
        let hotelId = processedHotels.get(hotelKey) || await resolveHotelId(row.hotel_name, cityId);

        if (!hotelId) {
          result.errors.push({
            row: rowNumber,
            field: 'hotel_name',
            error: `Hotel not found: ${row.hotel_name} in city ${row.city_name}`,
            value: row.hotel_name,
            severity: 'ERROR',
          });
          result.rowsSkipped++;
          continue;
        }

        const { data: existingHall } = await supabase
          .from('halls')
          .select('id')
          .eq('hotel_id', hotelId)
          .eq('hall_name', row.hall_name)
          .single();

        const isUpdate = !!existingHall;

        const { error } = await supabase
          .from('halls')
          .upsert(
            {
              ...(isUpdate && { id: existingHall.id }),
              hotel_id: hotelId,
              hall_name: row.hall_name,
              hall_type: row.hall_type || 'OTHER',
              theatre_capacity: parseInt(row.theatre_capacity || '0'),
              classroom_capacity: parseInt(row.classroom_capacity || '0'),
              u_shape_capacity: parseInt(row.u_shape_capacity || '0'),
              cluster_capacity: parseInt(row.cluster_capacity || '0'),
              boardroom_capacity: parseInt(row.boardroom_capacity || '0'),
              reception_capacity: parseInt(row.reception_capacity || '0'),
              status: 'ACTIVE',
            },
            { onConflict: 'hotel_id,hall_name' }
          );

        if (error) {
          result.errors.push({
            row: rowNumber,
            field: 'hall_name',
            error: `Database error: ${error.message}`,
            value: row.hall_name,
            severity: 'ERROR',
          });
          result.rowsSkipped++;
        } else {
          if (isUpdate) {
            result.hallUpdated++;
          } else {
            result.hallCreated++;
          }
          result.hallCount++;
        }
      } catch (err: any) {
        result.errors.push({
          row: rowNumber,
          field: 'hall_name',
          error: err.message,
          value: row.hall_name,
          severity: 'ERROR',
        });
        result.rowsSkipped++;
      }
    }

    // Record import history
    const { error: historyError } = await supabase.from('venue_import_history').insert({
      import_session_id: importSessionId,
      file_name: `import_${new Date().toISOString()}`,
      uploaded_by: userId,
      rows_processed: result.rowsProcessed,
      hotels_created: result.hotelCreated,
      hotels_updated: result.hotelUpdated,
      halls_created: result.hallCreated,
      halls_updated: result.hallUpdated,
      rows_skipped: result.rowsSkipped,
      status: result.errors.filter((e) => e.severity === 'ERROR').length === 0 ? 'SUCCESS' : 'PARTIAL',
    });

    if (historyError) {
      console.error('Failed to record import history:', historyError);
    }

    result.success = result.errors.filter((e) => e.severity === 'ERROR').length === 0;
    result.importSessionId = importSessionId;

    return result;
  } catch (error: any) {
    result.errors.push({
      row: 0,
      field: 'import',
      error: error.message || 'Unknown import error',
      severity: 'ERROR',
    });
    return result;
  }
}

/**
 * Multi-sheet import for structured workbook format
 */
async function executeMultiSheetImport(
  sheets: ParsedSheets,
  userId: string
): Promise<BulkImportResult> {
  const result: BulkImportResult = {
    success: false,
    hotelCount: 0,
    hallCount: 0,
    hotelCreated: 0,
    hotelUpdated: 0,
    hallCreated: 0,
    hallUpdated: 0,
    inventoryCreated: 0,
    occupancyCreated: 0,
    photosCreated: 0,
    rowsProcessed: 0,
    rowsSkipped: 0,
    errors: [],
  };

  try {
    const importSessionId = crypto.randomUUID();
    const processedHotels = new Map<string, string>(); // hotel_name|city_name -> hotel_id

    // 1. PROCESS HOTELS FIRST
    const hotelRows = sheets.hotel || [];
    for (const row of hotelRows) {
      result.rowsProcessed++;
      const rowNumber = result.rowsProcessed + 1;
      const errors = validateHotelRow(row, rowNumber);

      if (errors.length > 0) {
        result.rowsSkipped++;
        result.errors.push(...errors);
        continue;
      }

      try {
        // Resolve city
        let cityId: string;
        try {
          cityId = await ensureCityExists(row.city_name!, row.zone_name);
        } catch (err: any) {
          result.errors.push({
            row: rowNumber,
            field: 'city_name',
            error: `City resolution failed: ${err.message}`,
            value: row.city_name,
            severity: 'ERROR',
          });
          result.rowsSkipped++;
          continue;
        }

        // Check if hotel already exists
        const existingHotelId = await resolveHotelId(row.hotel_name!, cityId);
        const isUpdate = !!existingHotelId;

        // Upsert hotel
        const { data, error } = await supabase
          .from('hotels')
          .upsert(
            {
              ...(existingHotelId && { id: existingHotelId }),
              hotel_name: row.hotel_name,
              city_id: cityId,
              status: row.status || 'ACTIVE',
              address: row.address || '',
              contact_phone: row.mobile || '',
              contact_email: row.email || '',
              total_rooms: parseInt(row.total_rooms || '0'),
              residential_capacity: parseInt(row.residential_capacity || '0'),
            },
            { onConflict: 'hotel_name,city_id' }
          )
          .select()
          .single();

        if (error) {
          result.errors.push({
            row: rowNumber,
            field: 'hotel_name',
            error: `Database error: ${error.message}`,
            value: row.hotel_name,
            severity: 'ERROR',
          });
          result.rowsSkipped++;
        } else if (data) {
          const key = `${row.hotel_name}|${row.city_name}`;
          processedHotels.set(key, data.id);

          if (isUpdate) {
            result.hotelUpdated++;
          } else {
            result.hotelCreated++;
          }
          result.hotelCount++;
        }
      } catch (err: any) {
        result.errors.push({
          row: rowNumber,
          field: 'hotel_name',
          error: err.message,
          value: row.hotel_name,
          severity: 'ERROR',
        });
        result.rowsSkipped++;
      }
    }

    // 2. PROCESS HALLS
    const hallRows = sheets.hall || [];
    for (const row of hallRows) {
      result.rowsProcessed++;
      const rowNumber = result.rowsProcessed + 1;
      const errors = validateHallRow(row, rowNumber);

      if (errors.length > 0) {
        result.rowsSkipped++;
        result.errors.push(...errors);
        continue;
      }

      try {
        if (!row.hotel_name || !row.city_name) {
          result.errors.push({
            row: rowNumber,
            field: 'hotel_name',
            error: 'Hotel name and city are required for halls',
            severity: 'ERROR',
          });
          result.rowsSkipped++;
          continue;
        }

        // Get city ID
        let cityId: string;
        try {
          cityId = await ensureCityExists(row.city_name);
        } catch (err: any) {
          result.errors.push({
            row: rowNumber,
            field: 'city_name',
            error: `City resolution failed: ${err.message}`,
            value: row.city_name,
            severity: 'ERROR',
          });
          result.rowsSkipped++;
          continue;
        }

        // Get hotel ID
        const hotelKey = `${row.hotel_name}|${row.city_name}`;
        let hotelId = processedHotels.get(hotelKey);

        if (!hotelId) {
          hotelId = await resolveHotelId(row.hotel_name, cityId);
        }

        if (!hotelId) {
          result.errors.push({
            row: rowNumber,
            field: 'hotel_name',
            error: `Hotel not found: ${row.hotel_name} in city ${row.city_name}`,
            value: row.hotel_name,
            severity: 'ERROR',
          });
          result.rowsSkipped++;
          continue;
        }

        // Check if hall already exists
        const { data: existingHall } = await supabase
          .from('halls')
          .select('id')
          .eq('hotel_id', hotelId)
          .eq('hall_name', row.hall_name)
          .single();

        const isUpdate = !!existingHall;

        // Upsert hall
        const { error } = await supabase
          .from('halls')
          .upsert(
            {
              ...(isUpdate && { id: existingHall.id }),
              hotel_id: hotelId,
              hall_name: row.hall_name,
              hall_type: row.hall_type || 'OTHER',
              theatre_capacity: parseInt(row.theatre_capacity || '0'),
              classroom_capacity: parseInt(row.classroom_capacity || '0'),
              u_shape_capacity: parseInt(row.u_shape_capacity || '0'),
              cluster_capacity: parseInt(row.cluster_capacity || '0'),
              boardroom_capacity: parseInt(row.boardroom_capacity || '0'),
              reception_capacity: parseInt(row.reception_capacity || '0'),
              status: 'ACTIVE',
            },
            { onConflict: 'hotel_id,hall_name' }
          );

        if (error) {
          result.errors.push({
            row: rowNumber,
            field: 'hall_name',
            error: `Database error: ${error.message}`,
            value: row.hall_name,
            severity: 'ERROR',
          });
          result.rowsSkipped++;
        } else {
          if (isUpdate) {
            result.hallUpdated++;
          } else {
            result.hallCreated++;
          }
          result.hallCount++;
        }
      } catch (err: any) {
        result.errors.push({
          row: rowNumber,
          field: 'hall_name',
          error: err.message,
          value: row.hall_name,
          severity: 'ERROR',
        });
        result.rowsSkipped++;
      }
    }

    // 3. PROCESS ACCOMMODATION
    const accommodationRows = sheets.accommodation || [];
    for (const row of accommodationRows) {
      result.rowsProcessed++;
      const rowNumber = result.rowsProcessed + 1;
      const errors = validateAccommodationRow(row, rowNumber);

      if (errors.length > 0) {
        result.rowsSkipped++;
        result.errors.push(...errors);
        continue;
      }

      try {
        if (!row.hotel_name || !row.city_name) {
          result.errors.push({
            row: rowNumber,
            field: 'hotel_name',
            error: 'Hotel name and city are required',
            severity: 'ERROR',
          });
          result.rowsSkipped++;
          continue;
        }

        const cityId = await ensureCityExists(row.city_name);
        const hotelKey = `${row.hotel_name}|${row.city_name}`;
        let hotelId = processedHotels.get(hotelKey) || await resolveHotelId(row.hotel_name, cityId);

        if (!hotelId) {
          result.errors.push({
            row: rowNumber,
            field: 'hotel_name',
            error: `Hotel not found: ${row.hotel_name}`,
            value: row.hotel_name,
            severity: 'ERROR',
          });
          result.rowsSkipped++;
          continue;
        }

        const { error } = await supabase
          .from('accommodation_inventory')
          .insert({
            hotel_id: hotelId,
            room_type: row.room_type,
            room_count: parseInt(row.room_count || '0'),
          });

        if (error) {
          result.errors.push({
            row: rowNumber,
            field: 'room_count',
            error: `Database error: ${error.message}`,
            value: row.room_count,
            severity: 'ERROR',
          });
          result.rowsSkipped++;
        } else {
          result.inventoryCreated++;
        }
      } catch (err: any) {
        result.errors.push({
          row: rowNumber,
          field: 'accommodation',
          error: err.message,
          severity: 'ERROR',
        });
        result.rowsSkipped++;
      }
    }

    // 4. PROCESS OCCUPANCY
    const occupancyRows = sheets.occupancy || [];
    for (const row of occupancyRows) {
      result.rowsProcessed++;
      const rowNumber = result.rowsProcessed + 1;
      const errors = validateOccupancyRow(row, rowNumber);

      if (errors.length > 0) {
        result.rowsSkipped++;
        result.errors.push(...errors);
        continue;
      }

      try {
        if (!row.hotel_name || !row.city_name) {
          result.errors.push({
            row: rowNumber,
            field: 'hotel_name',
            error: 'Hotel name and city are required',
            severity: 'ERROR',
          });
          result.rowsSkipped++;
          continue;
        }

        const cityId = await ensureCityExists(row.city_name);
        const hotelKey = `${row.hotel_name}|${row.city_name}`;
        let hotelId = processedHotels.get(hotelKey) || await resolveHotelId(row.hotel_name, cityId);

        if (!hotelId) {
          result.errors.push({
            row: rowNumber,
            field: 'hotel_name',
            error: `Hotel not found: ${row.hotel_name}`,
            value: row.hotel_name,
            severity: 'ERROR',
          });
          result.rowsSkipped++;
          continue;
        }

        const { error } = await supabase
          .from('occupancy_rules')
          .insert({
            hotel_id: hotelId,
            rule_type: row.designation,
            min_occupancy: OCCUPANCY_TYPES.indexOf(row.min_occupancy) + 1,
            is_active: true,
          });

        if (error) {
          result.errors.push({
            row: rowNumber,
            field: 'min_occupancy',
            error: `Database error: ${error.message}`,
            value: row.min_occupancy,
            severity: 'ERROR',
          });
          result.rowsSkipped++;
        } else {
          result.occupancyCreated++;
        }
      } catch (err: any) {
        result.errors.push({
          row: rowNumber,
          field: 'occupancy',
          error: err.message,
          severity: 'ERROR',
        });
        result.rowsSkipped++;
      }
    }

    // 5. PROCESS PHOTOS
    const photoRows = sheets.photos || [];
    for (const row of photoRows) {
      result.rowsProcessed++;
      const rowNumber = result.rowsProcessed + 1;
      const errors = validatePhotoRow(row, rowNumber);

      if (errors.length > 0) {
        result.rowsSkipped++;
        result.errors.push(...errors);
        continue;
      }

      try {
        if (!row.hotel_name || !row.city_name) {
          result.errors.push({
            row: rowNumber,
            field: 'hotel_name',
            error: 'Hotel name and city are required',
            severity: 'ERROR',
          });
          result.rowsSkipped++;
          continue;
        }

        const cityId = await ensureCityExists(row.city_name);
        const hotelKey = `${row.hotel_name}|${row.city_name}`;
        let hotelId = processedHotels.get(hotelKey) || await resolveHotelId(row.hotel_name, cityId);

        if (!hotelId) {
          result.errors.push({
            row: rowNumber,
            field: 'hotel_name',
            error: `Hotel not found: ${row.hotel_name}`,
            value: row.hotel_name,
            severity: 'ERROR',
          });
          result.rowsSkipped++;
          continue;
        }

        const { error } = await supabase
          .from('venue_photos')
          .insert({
            hotel_id: hotelId,
            photo_url: row.photo_url,
            photo_title: row.photo_title || '',
            display_order: parseInt(row.display_order || '0'),
          });

        if (error) {
          result.errors.push({
            row: rowNumber,
            field: 'photo_url',
            error: `Database error: ${error.message}`,
            value: row.photo_url,
            severity: 'ERROR',
          });
          result.rowsSkipped++;
        } else {
          result.photosCreated++;
        }
      } catch (err: any) {
        result.errors.push({
          row: rowNumber,
          field: 'photo',
          error: err.message,
          severity: 'ERROR',
        });
        result.rowsSkipped++;
      }
    }

    // Record import history
    const errorReportBlob = result.errors.length > 0 ? await generateErrorReport(result.errors) : null;
    
    const { error: historyError } = await supabase.from('venue_import_history').insert({
      import_session_id: importSessionId,
      file_name: `import_${new Date().toISOString()}`,
      uploaded_by: userId,
      rows_processed: result.rowsProcessed,
      hotels_created: result.hotelCreated,
      hotels_updated: result.hotelUpdated,
      halls_created: result.hallCreated,
      halls_updated: result.hallUpdated,
      rows_skipped: result.rowsSkipped,
      status: result.errors.filter((e) => e.severity === 'ERROR').length === 0 ? 'SUCCESS' : 'PARTIAL',
    });

    if (historyError) {
      console.error('Failed to record import history:', historyError);
    }

    result.success = result.errors.filter((e) => e.severity === 'ERROR').length === 0;
    result.importSessionId = importSessionId;

    return result;
  } catch (error: any) {
    result.errors.push({
      row: 0,
      field: 'import',
      error: error.message || 'Unknown import error',
      severity: 'ERROR',
    });
    return result;
  }
}

// ============================================================================
// IMPORT HISTORY
// ============================================================================

export async function getImportHistory(limit = 20, offset = 0): Promise<VenueImportHistory[]> {
  const { data, error } = await supabase
    .from('venue_import_history')
    .select('*')
    .order('uploaded_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

export async function getImportDetails(importSessionId: string): Promise<VenueImportHistory | null> {
  const { data, error } = await supabase
    .from('venue_import_history')
    .select('*')
    .eq('import_session_id', importSessionId)
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// DATA QUALITY & READINESS
// ============================================================================

export async function calculateDataQuality(): Promise<DataQualityMetrics> {
  const { data: hotels } = await supabase
    .from('hotels')
    .select(`
      id,
      halls (id),
      accommodation_inventory (id),
      occupancy_rules (id),
      venue_photos (id)
    `);

  if (!hotels) {
    return {
      totalHotels: 0,
      hotelsMissingHalls: 0,
      hotelsMissingInventory: 0,
      hotelsMissingOccupancy: 0,
      hotelsMissingPhotos: 0,
      hotelsNotVenueReady: 0,
      readinessDistribution: {
        notReady: 0,
        partial: 0,
        ready: 0,
        optimized: 0,
      },
    };
  }

  let hotelsMissingHalls = 0;
  let hotelsMissingInventory = 0;
  let hotelsMissingOccupancy = 0;
  let hotelsMissingPhotos = 0;

  const readinessDistribution = {
    notReady: 0,
    partial: 0,
    ready: 0,
    optimized: 0,
  };

  hotels.forEach((hotel: any) => {
    const hasHalls = (hotel.halls || []).length > 0;
    const hasInventory = (hotel.accommodation_inventory || []).length > 0;
    const hasOccupancy = (hotel.occupancy_rules || []).length > 0;
    const hasPhotos = (hotel.venue_photos || []).length > 0;

    if (!hasHalls) hotelsMissingHalls++;
    if (!hasInventory) hotelsMissingInventory++;
    if (!hasOccupancy) hotelsMissingOccupancy++;
    if (!hasPhotos) hotelsMissingPhotos++;

    const missingCount = [!hasHalls, !hasInventory, !hasOccupancy, !hasPhotos].filter(m => m).length;

    if (missingCount === 4) {
      readinessDistribution.notReady++;
    } else if (missingCount >= 2) {
      readinessDistribution.partial++;
    } else if (missingCount === 1) {
      readinessDistribution.ready++;
    } else {
      readinessDistribution.optimized++;
    }
  });

  const hotelsNotVenueReady = Math.max(
    hotelsMissingHalls,
    hotelsMissingInventory,
    hotelsMissingOccupancy
  );

  return {
    totalHotels: hotels.length,
    hotelsMissingHalls,
    hotelsMissingInventory,
    hotelsMissingOccupancy,
    hotelsMissingPhotos,
    hotelsNotVenueReady,
    readinessDistribution,
  };
}

export async function refreshDataQualityAfterImport(hotelIds: string[]): Promise<void> {
  // This function would typically trigger recalculation of data quality metrics
  // For now, it's a placeholder for future enhancements
  console.log(`Refreshing data quality for ${hotelIds.length} hotels`);
}
