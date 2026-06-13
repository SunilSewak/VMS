// Zone Service
// Purpose: CRUD operations for Zone Master

import { supabase } from '../../lib/supabase';
import type { Zone, ZoneCreateInput, ZoneUpdateInput, ZoneQueryFilters } from './types';

const ZONE_SELECT = `
  id,
  zone_code,
  zone_name,
  status,
  created_at,
  created_by,
  updated_at,
  updated_by
`;

/**
 * Fetch all zones with optional filters
 */
export async function getZones(filters?: ZoneQueryFilters): Promise<Zone[]> {
  try {
    let query = supabase
      .from('zones')
      .select(ZONE_SELECT)
      .order('zone_code', { ascending: true });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(`zone_code.ilike.${searchTerm},zone_name.ilike.${searchTerm}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching zones:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getZones:', error);
    throw error;
  }
}

/**
 * Get active zones only (for dropdowns)
 */
export async function getActiveZones(): Promise<Zone[]> {
  return getZones({ status: 'ACTIVE' });
}

/**
 * Get a single zone by ID
 */
export async function getZoneById(id: string): Promise<Zone> {
  try {
    const { data, error } = await supabase
      .from('zones')
      .select(ZONE_SELECT)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching zone:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Zone not found');
    }

    return data;
  } catch (error) {
    console.error('Error in getZoneById:', error);
    throw error;
  }
}

/**
 * Create a new zone
 */
export async function createZone(input: ZoneCreateInput): Promise<Zone> {
  try {
    // Validation
    if (!input.zone_code || !input.zone_code.trim()) {
      throw new Error('Zone code is required');
    }

    if (!input.zone_name || !input.zone_name.trim()) {
      throw new Error('Zone name is required');
    }

    // Ensure zone code is uppercase
    const zoneCode = input.zone_code.trim().toUpperCase();

    const { data, error } = await supabase
      .from('zones')
      .insert({
        zone_code: zoneCode,
        zone_name: input.zone_name.trim(),
        status: input.status || 'ACTIVE',
      })
      .select(ZONE_SELECT)
      .single();

    if (error) {
      console.error('Error creating zone:', error);
      
      // Handle unique constraint violations
      if (error.code === '23505') {
        if (error.message.includes('zone_code')) {
          throw new Error(`Zone code "${zoneCode}" already exists`);
        }
        if (error.message.includes('zone_name')) {
          throw new Error(`Zone name "${input.zone_name}" already exists`);
        }
        throw new Error('Zone code or name already exists');
      }
      
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Failed to create zone');
    }

    return data;
  } catch (error) {
    console.error('Error in createZone:', error);
    throw error;
  }
}

/**
 * Update an existing zone
 */
export async function updateZone(id: string, input: ZoneUpdateInput): Promise<Zone> {
  try {
    const updateData: Partial<Zone> = {};

    if (input.zone_code !== undefined) {
      if (!input.zone_code.trim()) {
        throw new Error('Zone code cannot be empty');
      }
      updateData.zone_code = input.zone_code.trim().toUpperCase();
    }

    if (input.zone_name !== undefined) {
      if (!input.zone_name.trim()) {
        throw new Error('Zone name cannot be empty');
      }
      updateData.zone_name = input.zone_name.trim();
    }

    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    const { data, error } = await supabase
      .from('zones')
      .update(updateData)
      .eq('id', id)
      .select(ZONE_SELECT)
      .single();

    if (error) {
      console.error('Error updating zone:', error);
      
      // Handle unique constraint violations
      if (error.code === '23505') {
        if (error.message.includes('zone_code')) {
          throw new Error(`Zone code "${updateData.zone_code}" already exists`);
        }
        if (error.message.includes('zone_name')) {
          throw new Error(`Zone name "${updateData.zone_name}" already exists`);
        }
        throw new Error('Zone code or name already exists');
      }
      
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Zone not found');
    }

    return data;
  } catch (error) {
    console.error('Error in updateZone:', error);
    throw error;
  }
}

/**
 * Delete a zone
 * Note: Trigger prevents deletion if cities are assigned
 */
export async function deleteZone(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('zones')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting zone:', error);
      
      // Handle trigger error for zones with cities
      if (error.message.includes('cities are assigned')) {
        throw new Error('Cannot delete zone with assigned cities. Deactivate the zone instead.');
      }
      
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error in deleteZone:', error);
    throw error;
  }
}

/**
 * Toggle zone status (Active/Inactive)
 */
export async function toggleZoneStatus(id: string): Promise<Zone> {
  try {
    const zone = await getZoneById(id);
    const newStatus: 'ACTIVE' | 'INACTIVE' = zone.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    return await updateZone(id, { status: newStatus });
  } catch (error) {
    console.error('Error toggling zone status:', error);
    throw error;
  }
}

/**
 * Get zone statistics
 */
export async function getZoneStatistics() {
  try {
    const { data, error } = await supabase
      .from('zones')
      .select(`
        id,
        zone_code,
        zone_name,
        status,
        cities:cities(count)
      `);

    if (error) {
      console.error('Error fetching zone statistics:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getZoneStatistics:', error);
    throw error;
  }
}
