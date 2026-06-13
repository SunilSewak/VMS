// Quality Service
// Calculates venue data quality metrics and readiness scores

import { supabase } from '../../lib/supabase';
import type { DataQualityIssue } from './types';
import { calculateVenueReadinessScore } from './readinessScore';

// ============================================================================
// DATA QUALITY ANALYSIS
// ============================================================================

export async function analyzeDataQuality() {
  try {
    // Fetch all hotels with relations
    const { data: hotels, error: hotelsError } = await supabase
      .from('hotels')
      .select(`
        id,
        hotel_name,
        city_id,
        cities (city_name),
        halls (id, hall_name),
        accommodation_inventory (id, hotel_id),
        occupancy_rules (id, hotel_id),
        venue_photos (id, hotel_id)
      `);

    if (hotelsError) throw hotelsError;
    if (!hotels) return null;

    const issues: DataQualityIssue[] = [];
    const hotelReadiness: Array<{
      hotel_id: string;
      hotel_name: string;
      readinessScore: number;
      status: 'READY' | 'PARTIAL' | 'NOT_READY';
      missingComponents: string[];
    }> = [];

    let readyCount = 0;
    let partialCount = 0;
    let notReadyCount = 0;

    // Analyze each hotel
    for (const hotel of hotels) {
      const missingComponents: string[] = [];

      // Check for halls
      const halls = (hotel.halls as any[]) || [];
      if (halls.length === 0) {
        missingComponents.push('Halls');
        issues.push({
          hotel_id: hotel.id,
          hotel_name: hotel.hotel_name,
          issue_type: 'MISSING_HALLS',
          severity: 'HIGH',
          message: 'No halls configured for this hotel'
        });
      }

      // Check for accommodation inventory
      const accommodation = (hotel.accommodation_inventory as any[]) || [];
      if (accommodation.length === 0) {
        missingComponents.push('Accommodation Inventory');
        issues.push({
          hotel_id: hotel.id,
          hotel_name: hotel.hotel_name,
          issue_type: 'MISSING_INVENTORY',
          severity: 'HIGH',
          message: 'No accommodation inventory configured'
        });
      }

      // Check for occupancy rules
      const occupancy = (hotel.occupancy_rules as any[]) || [];
      if (occupancy.length === 0) {
        missingComponents.push('Occupancy Rules');
        issues.push({
          hotel_id: hotel.id,
          hotel_name: hotel.hotel_name,
          issue_type: 'MISSING_OCCUPANCY',
          severity: 'HIGH',
          message: 'No occupancy rules configured'
        });
      }

      // Check for photos
      const photos = (hotel.venue_photos as any[]) || [];
      if (photos.length === 0) {
        missingComponents.push('Photos');
        issues.push({
          hotel_id: hotel.id,
          hotel_name: hotel.hotel_name,
          issue_type: 'MISSING_PHOTOS',
          severity: 'MEDIUM',
          message: 'No photos uploaded for this hotel'
        });
      }

      // Calculate readiness score
      const readinessData = {
        profile_complete: !!(hotel.hotel_name),
        halls_configured: halls.length > 0,
        accommodation_configured: accommodation.length > 0,
        occupancy_configured: occupancy.length > 0,
        photos_uploaded: photos.length > 0
      };

      const scoreResult = calculateVenueReadinessScore(hotel);
      const score = scoreResult.overallScore;
      let status: 'READY' | 'PARTIAL' | 'NOT_READY' = 'NOT_READY';

      if (score >= 70) {
        status = 'READY';
        readyCount++;
      } else if (score >= 40) {
        status = 'PARTIAL';
        partialCount++;
      } else {
        notReadyCount++;
      }

      hotelReadiness.push({
        hotel_id: hotel.id,
        hotel_name: hotel.hotel_name,
        readinessScore: score,
        status,
        missingComponents
      });
    }

    return {
      totalHotels: hotels.length,
      readyCount,
      partialCount,
      notReadyCount,
      issues,
      hotelReadiness,
      readinessDistribution: {
        ready: readyCount,
        partial: partialCount,
        notReady: notReadyCount
      }
    };
  } catch (error) {
    console.error('Error analyzing data quality:', error);
    throw error;
  }
}

// ============================================================================
// QUALITY METRICS SUMMARY
// ============================================================================

export async function getQualityMetricsSummary() {
  try {
    const analysis = await analyzeDataQuality();
    if (!analysis) return null;

    const { data: hotels } = await supabase
      .from('hotels')
      .select(`
        id,
        halls (id),
        accommodation_inventory (id),
        occupancy_rules (id),
        venue_photos (id)
      `);

    if (!hotels) return null;

    let hotelsMissingHalls = 0;
    let hotelsMissingAccommodation = 0;
    let hotelsMissingOccupancy = 0;
    let hotelsMissingPhotos = 0;
    let hotelsNotVenueReady = 0;

    for (const hotel of hotels) {
      if ((!hotel.halls || hotel.halls.length === 0)) hotelsMissingHalls++;
      if ((!hotel.accommodation_inventory || hotel.accommodation_inventory.length === 0)) hotelsMissingAccommodation++;
      if ((!hotel.occupancy_rules || hotel.occupancy_rules.length === 0)) hotelsMissingOccupancy++;
      if ((!hotel.venue_photos || hotel.venue_photos.length === 0)) hotelsMissingPhotos++;

      // Not venue ready if missing any critical component
      if (
        (!hotel.halls || hotel.halls.length === 0) ||
        (!hotel.accommodation_inventory || hotel.accommodation_inventory.length === 0) ||
        (!hotel.occupancy_rules || hotel.occupancy_rules.length === 0)
      ) {
        hotelsNotVenueReady++;
      }
    }

    return {
      totalHotels: hotels.length,
      hotelsMissingHalls,
      hotelsMissingAccommodation,
      hotelsMissingOccupancy,
      hotelsMissingPhotos,
      hotelsNotVenueReady,
      readinessDistribution: analysis.readinessDistribution
    };
  } catch (error) {
    console.error('Error getting quality metrics:', error);
    throw error;
  }
}

// ============================================================================
// SPECIFIC ISSUE QUERIES
// ============================================================================

export async function getHotelsMissingComponent(componentType: 'HALLS' | 'INVENTORY' | 'OCCUPANCY' | 'PHOTOS') {
  let query = supabase
    .from('hotels')
    .select('id, hotel_name, cities (city_name)');

  let field: 'halls' | 'accommodation_inventory' | 'occupancy_rules' | 'venue_photos';

  switch (componentType) {
    case 'HALLS':
      field = 'halls';
      break;
    case 'INVENTORY':
      field = 'accommodation_inventory';
      break;
    case 'OCCUPANCY':
      field = 'occupancy_rules';
      break;
    case 'PHOTOS':
      field = 'venue_photos';
      break;
  }

  const { data } = await supabase
    .from('hotels')
    .select(`id, hotel_name, ${field}(id)`);

  if (!data) return [];

  return data.filter((h: any) => !h[field] || h[field].length === 0);
}

// ============================================================================
// IMPORT QUALITY CHECK
// ============================================================================

export async function checkImportQuality(importSessionId: string) {
  try {
    // Get import record
    const { data: importRecord } = await supabase
      .from('venue_import_history')
      .select('*')
      .eq('import_session_id', importSessionId)
      .single();

    if (!importRecord) {
      throw new Error('Import session not found');
    }

    // Calculate quality score
    const totalRecords = importRecord.rows_processed;
    const failedRecords = importRecord.rows_skipped;
    const successRate = ((totalRecords - failedRecords) / totalRecords) * 100;

    return {
      importSessionId,
      totalRecords,
      successfulRecords: totalRecords - failedRecords,
      failedRecords,
      successRate: Math.round(successRate),
      hotelCreated: importRecord.hotels_created,
      hotelUpdated: importRecord.hotels_updated,
      hallCreated: importRecord.halls_created,
      hallUpdated: importRecord.halls_updated,
      status: importRecord.status,
      timestamp: importRecord.uploaded_at
    };
  } catch (error) {
    console.error('Error checking import quality:', error);
    throw error;
  }
}

// ============================================================================
// READINESS INSIGHTS
// ============================================================================

export async function getReadinessInsights() {
  try {
    const metrics = await getQualityMetricsSummary();
    if (!metrics) return null;

    const insights = [];

    // Insight 1: Critical gaps
    if (metrics.hotelsNotVenueReady > 0) {
      insights.push({
        type: 'CRITICAL',
        priority: 1,
        message: `${metrics.hotelsNotVenueReady} hotels are not venue-ready (missing halls, inventory, or occupancy rules)`,
        action: 'CONFIGURE_MISSING_COMPONENTS',
        affectedHotels: metrics.hotelsNotVenueReady
      });
    }

    // Insight 2: Missing halls
    if (metrics.hotelsMissingHalls > 0) {
      insights.push({
        type: 'WARNING',
        priority: 2,
        message: `${metrics.hotelsMissingHalls} hotels have no meeting halls configured`,
        action: 'ADD_HALLS',
        affectedHotels: metrics.hotelsMissingHalls
      });
    }

    // Insight 3: Missing photos
    if (metrics.hotelsMissingPhotos > metrics.totalHotels * 0.5) {
      insights.push({
        type: 'INFO',
        priority: 3,
        message: `${metrics.hotelsMissingPhotos} hotels are missing photos (${Math.round((metrics.hotelsMissingPhotos / metrics.totalHotels) * 100)}%)`,
        action: 'UPLOAD_PHOTOS',
        affectedHotels: metrics.hotelsMissingPhotos
      });
    }

    // Insight 4: Overall readiness
    const readyPercentage = Math.round((metrics.readinessDistribution.ready / metrics.totalHotels) * 100);
    insights.push({
      type: 'STATUS',
      priority: 0,
      message: `Overall venue readiness: ${readyPercentage}% (${metrics.readinessDistribution.ready}/${metrics.totalHotels} hotels ready)`,
      action: 'VIEW_DETAILS',
      affectedHotels: null
    });

    return insights;
  } catch (error) {
    console.error('Error getting readiness insights:', error);
    throw error;
  }
}

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

export async function getImportPerformanceMetrics() {
  try {
    // Get recent imports
    const { data: recentImports } = await supabase
      .from('venue_import_history')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .limit(10);

    if (!recentImports || recentImports.length === 0) {
      return null;
    }

    const successfulImports = recentImports.filter(i => i.status === 'SUCCESS');
    const totalHotelsImported = recentImports.reduce((sum, i) => sum + i.hotels_created + i.hotels_updated, 0);
    const totalHallsImported = recentImports.reduce((sum, i) => sum + i.halls_created + i.halls_updated, 0);
    const avgSuccessRate = recentImports.reduce((sum, i) => {
      const rate = ((i.rows_processed - i.rows_skipped) / i.rows_processed) * 100;
      return sum + rate;
    }, 0) / recentImports.length;

    return {
      totalImports: recentImports.length,
      successfulImports: successfulImports.length,
      failedImports: recentImports.length - successfulImports.length,
      totalHotelsImported,
      totalHallsImported,
      avgSuccessRate: Math.round(avgSuccessRate),
      lastImportDate: recentImports[0].uploaded_at,
      importsByStatus: {
        SUCCESS: successfulImports.length,
        FAILED: recentImports.filter(i => i.status === 'FAILED').length,
        PARTIAL: recentImports.filter(i => i.status === 'PARTIAL').length
      }
    };
  } catch (error) {
    console.error('Error getting import performance metrics:', error);
    throw error;
  }
}
