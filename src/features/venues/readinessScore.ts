// Venue Readiness Score Calculator
// Comprehensive validation and completeness scoring for hotels

import type { HotelWithRelations } from './types';

export interface ReadinessScoreResult {
  overallScore: number; // 0-100
  status: 'NOT_READY' | 'PARTIAL' | 'READY' | 'OPTIMIZED';
  completeness: number; // 0-100
  checks: ReadinessCheck[];
  missingItems: string[];
  recommendations: string[];
  photoReadiness: boolean;
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
      isComplete: !!(hotel.sales_contact_mobile || hotel.sales_contact_email),
      weight: 5,
    },
    {
      name: 'Hotel Category',
      isComplete: !!hotel.hotel_category,
      weight: 5,
    },
    {
      name: 'City Assignment',
      isComplete: !!hotel.city_id,
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
  if (!hotel.sales_contact_mobile && !hotel.sales_contact_email) recommendations.push('Add sales contact information (phone or email)');
  if (!hotel.hotel_category) recommendations.push('Set hotel category');

  // ============================================================================
  // HALLS CONFIGURATION (25% weight) - PHASE 5: Hall Master SIMPLIFIED
  // ============================================================================

  const hallsCount = hotel.halls?.length || 0;
  const hallsWithSeatingCapacity = hotel.halls?.filter((h) => {
    const hasCapacity =
      (h.classroom_capacity || 0) > 0 ||
      (h.u_shape_capacity || 0) > 0 ||
      (h.cluster_capacity || 0) > 0;
    return hasCapacity;
  }).length || 0;

  const hallChecks = [
    {
      name: 'Conference Rooms Exist',
      isComplete: hallsCount >= 1,
      weight: 15,
      actual: hallsCount,
      required: 1,
    },
    {
      name: 'Seating Capacity Defined',
      isComplete: hallsWithSeatingCapacity === hallsCount && hallsCount > 0,
      weight: 10,
      actual: hallsWithSeatingCapacity,
      required: hallsCount,
    },
  ];

  hallChecks.forEach((check) => {
    checks.push({
      category: 'Hall Master',
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
    recommendations.push('Add at least one conference room to enable meeting space bookings');
  } else {
    if (hallsWithSeatingCapacity !== hallsCount) {
      recommendations.push(`Set seating capacity for ${hallsCount - hallsWithSeatingCapacity} conference room(s)`);
    }
  }

  // ============================================================================
  // ACCOMMODATION INVENTORY (25% weight)
  // ============================================================================

  const inventoryCount = hotel.accommodation_inventory?.length || 0;
  const inventoryWithAllocation = hotel.accommodation_inventory?.filter((a) => {
    const allocated = (a.single_rooms || 0) + (a.double_rooms || 0) + (a.triple_rooms || 0) + (a.quad_rooms || 0);
    return allocated === a.total_rooms;
  }).length || 0;
  const inventoryActive = hotel.accommodation_inventory?.filter((a) => a.status === 'ACTIVE').length || 0;

  const inventoryChecks = [
    {
      name: 'Accommodation Inventory Configured',
      isComplete: inventoryCount >= 1,
      weight: 8,
      actual: inventoryCount,
      required: 1,
    },
    {
      name: 'Room Allocation Complete',
      isComplete: inventoryWithAllocation === inventoryCount && inventoryCount > 0,
      weight: 10,
      actual: inventoryWithAllocation,
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
    recommendations.push('Add accommodation inventory to enable venue suitability assessment');
  } else {
    if (inventoryWithAllocation !== inventoryCount) {
      recommendations.push(`Complete room allocation for ${inventoryCount - inventoryWithAllocation} inventory record(s)`);
    }
    if (inventoryActive !== inventoryCount) {
      recommendations.push(`Activate ${inventoryCount - inventoryActive} inventory record(s)`);
    }
  }

  // ============================================================================
  // PHOTOS AND VISUAL CONTENT (10% weight)
  // ============================================================================

  const photoCount = hotel.photos?.length || 0;
  const photosAvailable = photoCount > 0;
  const photoReady = photoCount >= 5;

  const photoChecks = [
    {
      name: 'Photos uploaded',
      isComplete: photosAvailable,
      weight: 5,
      actual: photoCount,
      required: 1,
    },
    {
      name: 'Photo readiness (5+ photos)',
      isComplete: photoReady,
      weight: 5,
      actual: photoCount,
      required: 5,
    },
  ];

  photoChecks.forEach((check) => {
    checks.push({
      category: 'Photos',
      name: check.name,
      isComplete: check.isComplete,
      weight: check.weight,
      score: check.isComplete ? check.weight : 0,
    });
    if (!check.isComplete) {
      missingItems.push(`Photos: ${check.name} (${check.actual}/${check.required})`);
    }
  });

  if (!photosAvailable) {
    recommendations.push('Upload venue photos to build trust and improve visibility.');
  } else if (!photoReady) {
    recommendations.push('Add more photos so the venue reaches photo readiness with at least 5 images.');
  }

  // ============================================================================
  // OCCUPANCY RULES (15% weight)
  // ============================================================================

  const rulesCount = hotel.occupancy_rules?.length || 0;
  const rulesActive = hotel.occupancy_rules?.filter((r) => !!r.occupancy_type).length || 0;

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
    photoReadiness: photoCount >= 5,
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
