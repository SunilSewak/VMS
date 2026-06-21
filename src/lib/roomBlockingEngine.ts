import { supabase } from "@/lib/supabase";

export interface HierarchyCounts {
  so_count: number;
  dm_count: number;
  rsm_count: number;
  dsm_count: number;
  ch_count: number;
  ibh_count: number;
  nsm_count: number;
}

export interface CalculatedBlocks {
  single_rooms: number;
  double_rooms: number;
  triple_rooms: number;
  suites: number;
}

export async function calculateRoomBlocks(hotelId: string, counts: HierarchyCounts): Promise<CalculatedBlocks> {
  const blocks = { single_rooms: 0, double_rooms: 0, triple_rooms: 0, suites: 0 };
  
  // 1. Fetch Global Default Rules
  const { data: defaultRules } = await supabase.from('default_occupancy_rules').select('*');
  
  // 2. Fetch Hotel Specific Rules
  const { data: hotelRules } = await supabase.from('hotel_occupancy_rules').select('*').eq('hotel_id', hotelId);

  // Helper to get rule
  const getOccupancyType = (hierarchyLevel: string) => {
    const override = hotelRules?.find(r => r.hierarchy_level === hierarchyLevel);
    if (override) return override.occupancy_type;
    const def = defaultRules?.find(r => r.hierarchy_level === hierarchyLevel);
    return def ? def.occupancy_type : 'Single'; // Fallback to Single if missing
  };

  const processLevel = (count: number, type: string) => {
    if (!count) return;
    if (type === 'Suite') blocks.suites += count;
    else if (type === 'Triple') blocks.triple_rooms += Math.ceil(count / 3);
    else if (type === 'Double') blocks.double_rooms += Math.ceil(count / 2);
    else blocks.single_rooms += count; // Single
  };

  processLevel(counts.so_count, getOccupancyType('SO'));
  processLevel(counts.dm_count, getOccupancyType('DM'));
  processLevel(counts.rsm_count, getOccupancyType('RSM'));
  processLevel(counts.dsm_count, getOccupancyType('DSM'));
  processLevel(counts.ch_count, getOccupancyType('CH'));
  processLevel(counts.ibh_count, getOccupancyType('IBH'));
  processLevel(counts.nsm_count, getOccupancyType('NSM'));

  return blocks;
}
