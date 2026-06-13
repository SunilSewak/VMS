// Venue Bulk Import Service
// Handles Excel parsing, validation, import preview, and actual import

import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';
import type {
  ImportValidationError,
  ImportPreviewData,
  ImportResult,
  VenueImportHistory,
  DataQualityMetrics,
  ExcelRow,
} from './types';

// ============================================================================
// VALIDATION RULES
// ============================================================================

const HALL_TYPES = ['BALLROOM', 'CONFERENCE', 'BANQUET', 'BOARDROOM', 'THEATRE', 'OTHER'];
const VENUE_STATUSES = ['ACTIVE', 'INACTIVE', 'PENDING_APPROVAL'];

// ============================================================================
// TEMPLATE GENERATION
// ============================================================================

export function generateExcelTemplate(): Blob {
  // Using a minimal template - in production would use XLSX library
  // For now, return a CSV that can be opened in Excel
  const template = `Hotel Name,City,Star Rating,Total Rooms,Residential Capacity,Contact Person,Mobile,Email,Status
Taj Hotel,Mumbai,5,250,200,Rajesh Sharma,9876543210,sales@taj.com,ACTIVE
Hotel Name,City,Star Rating,Total Rooms,Residential Capacity,Contact Person,Mobile,Email,Status

Hall Name,Theatre Capacity,Classroom Capacity,U Shape Capacity,Cluster Capacity,Boardroom Capacity,Reception Capacity,Hall Type
Grand Ballroom,500,250,80,200,40,700,BALLROOM
Conference Room,100,80,30,50,20,150,CONFERENCE`;

  return new Blob([template], { type: 'text/csv;charset=utf-8;' });
}

// ============================================================================
// FILE PARSING
// ============================================================================

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

        // Get all rows from all sheets
        const allRows: ExcelRow[] = [];

        // Process each sheet
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json<ExcelRow>(sheet, {
            header: 1, // Use first row as headers
            defval: '',
          });

          // Convert array format to object format with headers from first row
          if (sheetData.length > 1) {
            const headers = (sheetData[0] as any[]).map((h) =>
              String(h).toLowerCase().replace(/\s+/g, '_').trim()
            );

            for (let i = 1; i < sheetData.length; i++) {
              const row = (sheetData[i] as any[]) || [];
              const rowObj: ExcelRow = {};

              headers.forEach((header, idx) => {
                if (header && row[idx] !== undefined) {
                  rowObj[header as keyof ExcelRow] = String(row[idx]).trim();
                }
              });

              // Only add rows that have data
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
// CITY RESOLUTION
// ============================================================================

const cityCache = new Map<string, string>(); // city_name -> city_id

export async function ensureCityExists(cityName: string): Promise<string> {
  if (!cityName || !cityName.trim()) {
    throw new Error('City name is required');
  }

  const normalizedCityName = cityName.trim();

  // Check cache first
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
    // PGRST116 means no rows found, which is expected
    throw new Error(`Failed to fetch city: ${fetchError.message}`);
  }

  // City doesn't exist, create it
  const { data: newCity, error: createError } = await supabase
    .from('cities')
    .insert([{ city_name: normalizedCityName }])
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

  // Residential capacity validation (warning)
  if (row.residential_capacity) {
    const resCap = parseInt(row.residential_capacity);
    if (isNaN(resCap) || resCap < 0) {
      errors.push({
        row: rowNumber,
        field: 'residential_capacity',
        error: 'Residential capacity must be a non-negative number',
        value: row.residential_capacity,
        severity: 'WARNING',
      });
    }
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

  // Status validation (warning)
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

  // Other capacity validations (warning)
  const capacityFields = ['classroom_capacity', 'u_shape_capacity', 'cluster_capacity', 'boardroom_capacity', 'reception_capacity'];
  capacityFields.forEach(field => {
    if (row[field]) {
      const capacity = parseInt(row[field]);
      if (isNaN(capacity) || capacity < 0) {
        errors.push({
          row: rowNumber,
          field,
          error: `${field} must be a non-negative number`,
          value: row[field],
          severity: 'WARNING',
        });
      }
    }
  });

  return errors;
}

// ============================================================================
// PREVIEW GENERATION
// ============================================================================

export async function generateImportPreview(rows: ExcelRow[]): Promise<ImportPreviewData> {
  const allErrors: ImportValidationError[] = [];
  const cityMap = new Map<string, string>(); // city_name -> id
  const hotelMap = new Map<string, string>(); // hotel_name + city_name -> id

  // Fetch existing cities
  const { data: cities } = await supabase.from('cities').select('id, city_name');
  if (cities) {
    cities.forEach((city: any) => {
      cityMap.set(city.city_name, city.id);
    });
  }

  // Fetch existing hotels
  const { data: hotels } = await supabase
    .from('hotels')
    .select('id, hotel_name, city_id')
    .join('cities', 'hotels.city_id', 'cities.id', { select: 'city_name' });

  if (hotels) {
    hotels.forEach((hotel: any) => {
      const key = `${hotel.hotel_name}|${hotel.city_name}`;
      hotelMap.set(key, hotel.id);
    });
  }

  // Process rows
  let validCount = 0;
  let hotelToCreate = 0;
  let hotelToUpdate = 0;
  let hallToCreate = 0;
  let hallToUpdate = 0;

  // Separate hotel and hall rows
  const hotelRows = rows.filter((r) => r.star_rating !== undefined && r.city_name !== undefined);
  const hallRows = rows.filter((r) => r.theatre_capacity !== undefined && r.hall_name !== undefined);

  // Validate hotel rows
  hotelRows.forEach((row, idx) => {
    const errors = validateHotelRow(row, idx + 2); // Row 2 starts after header
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

  // Validate hall rows
  hallRows.forEach((row, idx) => {
    const errors = validateHallRow(row, hotelRows.length + idx + 2);
    if (errors.length === 0) {
      validCount++;
      // Note: in real implementation, would resolve hotel_id here
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
// IMPORT EXECUTION
// ============================================================================

export async function executeImport(rows: ExcelRow[], userId: string): Promise<ImportResult> {
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
    const processedHotels = new Map<string, string>(); // hotel_name|city_id -> hotel_id

    // Process hotels
    const hotelRows = rows.filter((r) => r.star_rating !== undefined && r.city_name !== undefined);

    for (const row of hotelRows) {
      const rowNumber = result.rowsProcessed + 2;
      const errors = validateHotelRow(row, rowNumber);

      if (errors.length > 0) {
        result.rowsSkipped++;
        result.errors.push(...errors);
        result.rowsProcessed++;
        continue;
      }

      try {
        // Resolve city
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
          result.rowsProcessed++;
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
              ...(existingHotelId && { id: existingHotelId }), // Include ID if updating
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
          const key = `${row.hotel_name}|${cityId}`;
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

      result.rowsProcessed++;
    }

    // Process halls
    const hallRows = rows.filter((r) => r.theatre_capacity !== undefined && r.hall_name !== undefined);

    for (const row of hallRows) {
      const rowNumber = result.rowsProcessed + 2;
      const errors = validateHallRow(row, rowNumber);

      if (errors.length > 0) {
        result.rowsSkipped++;
        result.errors.push(...errors);
        result.rowsProcessed++;
        continue;
      }

      try {
        // Resolve hotel
        if (!row.hotel_name || !row.city_name) {
          result.errors.push({
            row: rowNumber,
            field: 'hotel_name',
            error: 'Hotel name and city are required for halls',
            severity: 'ERROR',
          });
          result.rowsSkipped++;
          result.rowsProcessed++;
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
          result.rowsProcessed++;
          continue;
        }

        // Get hotel ID
        const hotelKey = `${row.hotel_name}|${cityId}`;
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
          result.rowsProcessed++;
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
              ...(isUpdate && { id: existingHall.id }), // Include ID if updating
              hotel_id: hotelId,
              hall_name: row.hall_name,
              classroom_capacity: parseInt(row.classroom_capacity || '0'),
              u_shape_capacity: parseInt(row.u_shape_capacity || '0'),
              cluster_capacity: parseInt(row.cluster_capacity || '0'),
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

      result.rowsProcessed++;
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
// DATA QUALITY DASHBOARD
// ============================================================================

export async function calculateDataQuality(): Promise<DataQualityMetrics> {
  const { data: hotels } = await supabase.from('hotels').select('id');
  const totalHotels = hotels?.length || 0;

  // This would need more sophisticated queries in production
  // For now, return mock data structure
  return {
    totalHotels,
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
