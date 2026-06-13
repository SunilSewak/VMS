/**
 * Zone Configuration for AVEMS
 * 
 * Maps Indian cities to their respective geographical zones.
 * Used for zone-based venue filtering in request-driven venue discovery.
 */

export enum ZONES {
  NORTH = 'North',
  SOUTH = 'South',
  EAST = 'East',
  WEST = 'West',
}

export const ZONE_OPTIONS = [
  { value: ZONES.NORTH, label: 'North Zone' },
  { value: ZONES.SOUTH, label: 'South Zone' },
  { value: ZONES.EAST, label: 'East Zone' },
  { value: ZONES.WEST, label: 'West Zone' },
];

// Maps city names to zones (case-insensitive matching)
export const CITY_ZONE_MAP: Record<string, ZONES> = {
  // North Zone
  'delhi': ZONES.NORTH,
  'new delhi': ZONES.NORTH,
  'gurgaon': ZONES.NORTH,
  'noida': ZONES.NORTH,
  'jaipur': ZONES.NORTH,
  'chandigarh': ZONES.NORTH,
  'lucknow': ZONES.NORTH,
  'agra': ZONES.NORTH,
  'amritsar': ZONES.NORTH,
  
  // South Zone
  'bengaluru': ZONES.SOUTH,
  'bangalore': ZONES.SOUTH,
  'chennai': ZONES.SOUTH,
  'hyderabad': ZONES.SOUTH,
  'kochi': ZONES.SOUTH,
  'coimbatore': ZONES.SOUTH,
  'mysore': ZONES.SOUTH,
  'visakhapatnam': ZONES.SOUTH,
  'vijayawada': ZONES.SOUTH,
  'trivandrum': ZONES.SOUTH,
  
  // East Zone
  'kolkata': ZONES.EAST,
  'bhubaneswar': ZONES.EAST,
  'guwahati': ZONES.EAST,
  'patna': ZONES.EAST,
  'ranchi': ZONES.EAST,
  
  // West Zone
  'mumbai': ZONES.WEST,
  'thane': ZONES.WEST,
  'mira road': ZONES.WEST,
  'navi mumbai': ZONES.WEST,
  'pune': ZONES.WEST,
  'ahmedabad': ZONES.WEST,
  'surat': ZONES.WEST,
  'nagpur': ZONES.WEST,
  'goa': ZONES.WEST,
  'indore': ZONES.WEST,
  'vadodara': ZONES.WEST,
};

/**
 * Get zone for a city name (case-insensitive)
 */
export function getZoneForCity(cityName: string): ZONES | null {
  if (!cityName) return null;
  const key = cityName.toLowerCase().trim();
  return CITY_ZONE_MAP[key] ?? null;
}

/**
 * Get all cities belonging to a zone
 */
export function getCitiesForZone(zone: ZONES): string[] {
  return Object.entries(CITY_ZONE_MAP)
    .filter(([_, z]) => z === zone)
    .map(([city]) => city);
}

/**
 * Check if a city belongs to a specific zone
 */
export function isCityInZone(cityName: string, zone: ZONES): boolean {
  return getZoneForCity(cityName) === zone;
}
