// Venue Readiness Score Calculator
// Comprehensive validation and completeness scoring for hotels

import type { HotelWithRelations, Hall, AccommodationInventory, OccupancyRule } from './types';

export interface ReadinessScoreResult {
  overallScore: number; // 0-100
  status: 'NOT_READY' | 'PARTIAL' | 'READY' | 'OPTIMIZED';
  completeness: number; // 0-100
  checks: ReadinessCheck[];
  missingItems: string[];
  recommendations: string[];
}

export interface ReadinessCheck {
  category: string;
  name: string;
  isComplete: boolean;
  weight: number;
  score: number;
}

export function calculateVenueReadinessScore(hotel: HotelWithRelations): ReadinessScoreResult {
  const checks: ReadinessCheck[] = [];
  const missingItems: string[] = [];
  const recommendations: string[] = [];

  // ============================================================================
  // HOTEL PROFILE COMPLETENESS (25% weight)
  // ============================================================================

  const hotelChecks = [
    {
      name: 'Hotel Name',
      isComplete: !!hotel.hotel_name,
      weight: 5,
    },
    {
      name: 'Address',
      isComplete: !!hotel.address,
      weight: 5,
    },
    {
      name: 'Contact Information',
      isComplete: !!(hotel.contact_phone || hotel.contact_email),
      weight: 5,
    },
    {
      name: 'Total Rooms',
      isComplete: !!hotel.total_rooms && hotel.total_rooms > 0,
      weight: 5,
    },
    {
      name: 'Check-in/Check-out Times',
      isComplete: !!hotel.check_in_time && !!hotel.check_out_time,
      weight: 5,
    },
  ];

  hotelChecks.forEach((check) => {
    checks.push({
      category: 'Hotel Profile',
      ...check,
      score: check.isComplete ? check.weight : 0,
    });
    if (!check.isComplete) {
      missingItems.push(`Hotel: ${check.name}`);
    }
  });

  if (!hotel.address) recommendations.push('Add hotel address for better visibility');
  if (!hotel.contact_phone && !hotel.contact_email) recommendations.push('Add contact information (phone or email)');
  if (!hotel.check_in_time || !hotel.check_out_time) recommendations.push('Set check-in and check-out times');

  // ============================================================================
  // HALLS CONFIGURATION (25% weight)
  // ============================================================================

  const hallsCount = hotel.halls?.length || 0;
  const hallsHaveCapacity = hotel.halls?.filter((h) => h.capacity && h.capacity > 0).length || 0;
  const hallsHaveDimensions = hotel.halls?.filter((h) => h.length && h.width && h.area).length || 0;
  const hallsHaveIndoorOutdoor = hotel.halls?.filter((h) => h.indoor_outdoor).length || 0;

  const hallChecks = [
    {
      name: 'Halls Configured',
      isComplete: hallsCount >= 1,
      weight: 8,
      actual: hallsCount,
      required: 1,
    },
    {
      name: 'Capacity Defined',
      isComplete: hallsHaveCapacity === hallsCount && hallsCount > 0,
      weight: 8,
      actual: hallsHaveCapacity,
      required: hallsCount,
    },
    {
      name: 'Dimensions Set',
      isComplete: hallsHaveDimensions === hallsCount && hallsCount > 0,
      weight: 5,
      actual: hallsHaveDimensions,
      required: hallsCount,
    },
    {
      name: 'Indoor/Outdoor Type',
      isComplete: hallsHaveIndoorOutdoor === hallsCount && hallsCount > 0,
      weight: 4,
      actual: hallsHaveIndoorOutdoor,
      required: hallsCount,
    },
  ];

  hallChecks.forEach((check) => {
    checks.push({
      category: 'Halls Configuration',
      name: check.name,
      isComplete: check.isComplete,
      weight: check.weight,
      score: check.isComplete ? check.weight : 0,
    });
    if (!check.isComplete) {
      missingItems.push(`Halls: ${check.name} (${check.actual}/${check.required})`);
    }
  });

  if (hallsCount === 0) {
    recommendations.push('Add at least one hall to enable bookings');
  } else {
    if (hallsHaveCapacity !== hallsCount) {
      recommendations.push(`Set capacity for ${hallsCount - hallsHaveCapacity} hall(s)`);
    }
    if (hallsHaveDimensions !== hallsCount) {
      recommendations.push(`Set dimensions for ${hallsCount - hallsHaveDimensions} hall(s)`);
    }
  }

  // ============================================================================
  // ACCOMMODATION INVENTORY (25% weight)
  // ============================================================================

  const inventoryCount = hotel.accommodation_inventory?.length || 0;
  const inventoryWithRates = hotel.accommodation_inventory?.filter((a) => a.rate_per_night && a.rate_per_night > 0).length || 0;
  const inventoryActive = hotel.accommodation_inventory?.filter((a) => a.status === 'ACTIVE').length || 0;

  const inventoryChecks = [
    {
      name: 'Room Types Configured',
      isComplete: inventoryCount >= 1,
      weight: 8,
      actual: inventoryCount,
      required: 1,
    },
    {
      name: 'Rates Defined',
      isComplete: inventoryWithRates === inventoryCount && inventoryCount > 0,
      weight: 10,
      actual: inventoryWithRates,
      required: inventoryCount,
    },
    {
      name: 'Active Status',
      isComplete: inventoryActive === inventoryCount && inventoryCount > 0,
      weight: 7,
      actual: inventoryActive,
      required: inventoryCount,
    },
  ];

  inventoryChecks.forEach((check) => {
    checks.push({
      category: 'Accommodation Inventory',
      name: check.name,
      isComplete: check.isComplete,
      weight: check.weight,
      score: check.isComplete ? check.weight : 0,
    });
    if (!check.isComplete) {
      missingItems.push(`Accommodation: ${check.name} (${check.actual}/${check.required})`);
    }
  });

  if (inventoryCount === 0) {
    recommendations.push('Add room types and inventory to enable accommodation bookings');
  } else {
    if (inventoryWithRates !== inventoryCount) {
      recommendations.push(`Set rates for ${inventoryCount - inventoryWithRates} room type(s)`);
    }
    if (inventoryActive !== inventoryCount) {
      recommendations.push(`Activate ${inventoryCount - inventoryActive} room type(s)`);
    }
  }

  // ============================================================================
  // OCCUPANCY RULES (15% weight)
  // ============================================================================

  const rulesCount = hotel.occupancy_rules?.length || 0;
  const rulesActive = hotel.occupancy_rules?.filter((r) => r.is_active).length || 0;

  const rulesChecks = [
    {
      name: 'Occupancy Rules Configured',
      isComplete: rulesCount >= 1,
      weight: 10,
      actual: rulesCount,
      required: 1,
    },
    {
      name: 'Rules Active',
      isComplete: rulesActive === rulesCount && rulesCount > 0,
      weight: 5,
      actual: rulesActive,
      required: rulesCount,
    },
  ];

  rulesChecks.forEach((check) => {
    checks.push({
      category: 'Occupancy Rules',
      name: check.name,
      isComplete: check.isComplete,
      weight: check.weight,
      score: check.isComplete ? check.weight : 0,
    });
    if (!check.isComplete) {
      missingItems.push(`Occupancy: ${check.name} (${check.actual}/${check.required})`);
    }
  });

  if (rulesCount === 0) {
    recommendations.push('Add occupancy rules to manage pricing and availability');
  }

  // ============================================================================
  // CALCULATE SCORES
  // ============================================================================

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const totalScore = checks.reduce((sum, c) => sum + c.score, 0);
  const completeness = Math.round((totalScore / totalWeight) * 100);

  // Status determination
  let status: 'NOT_READY' | 'PARTIAL' | 'READY' | 'OPTIMIZED';
  if (completeness < 40) {
    status = 'NOT_READY';
  } else if (completeness < 70) {
    status = 'PARTIAL';
  } else if (completeness < 100) {
    status = 'READY';
  } else {
    status = 'OPTIMIZED';
  }

  return {
    overallScore: completeness,
    status,
    completeness,
    checks,
    missingItems,
    recommendations,
  };
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'NOT_READY':
      return '#ef4444'; // Red
    case 'PARTIAL':
      return '#f59e0b'; // Amber
    case 'READY':
      return '#10b981'; // Green
    case 'OPTIMIZED':
      return '#0891b2'; // Cyan
    default:
      return '#6b7280'; // Gray
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'NOT_READY':
      return 'Not Ready';
    case 'PARTIAL':
      return 'Partially Ready';
    case 'READY':
      return 'Ready for Bookings';
    case 'OPTIMIZED':
      return 'Optimized';
    default:
      return 'Unknown';
  }
}
