// Dry Run Engine - counts without database writes

import { ParsedRow, DryRunResult } from './types';

export function runDryRun(rows: ParsedRow[]): DryRunResult {
  const hotelsToCreate = new Set<string>();
  const hotelsToUpdate = new Set<string>();
  const hallsToCreate = new Set<string>();
  const hallsToUpdate = new Set<string>();

  // Track seen keys to determine if they're new or existing
  const hotelMap = new Map<string, boolean>(); // key -> true (exists)
  const hallMap = new Map<string, boolean>();

  rows.forEach((row) => {
    const hotelKey = `${row.hotelName}|${row.city}`;
    const hallKey = `${row.hotelName}|${row.hallName}`;

    // Hotel deduplication
    if (hotelMap.has(hotelKey)) {
      hotelsToUpdate.add(hotelKey);
    } else {
      hotelMap.set(hotelKey, true);
      hotelsToCreate.add(hotelKey);
    }

    // Hall deduplication
    if (hallMap.has(hallKey)) {
      hallsToUpdate.add(hallKey);
    } else {
      hallMap.set(hallKey, true);
      hallsToCreate.add(hallKey);
    }
  });

  return {
    hotelsToCreate: hotelsToCreate.size,
    hotelsToUpdate: hotelsToUpdate.size,
    hallsToCreate: hallsToCreate.size,
    hallsToUpdate: hallsToUpdate.size,
    errors: [],
    warnings: []
  };
}