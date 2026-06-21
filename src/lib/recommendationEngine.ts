import { supabase } from "@/lib/supabase";
import { VmsEvent } from "@/types/event";
import { Hotel, Hall } from "@/types/master";

export interface RecommendationResult {
  hotel: Hotel;
  hall: Hall;
  score: number;
}

export async function recommendVenues(event: VmsEvent): Promise<RecommendationResult[]> {
  if (!event.city_id || !event.start_date || !event.end_date || !event.expected_pax) {
    return [];
  }

  // 1. Get Approved Hotels in the specific city
  const { data: hotels, error: hotelErr } = await supabase
    .from('hotels')
    .select('*, category:hotel_categories(name)')
    .eq('city_id', event.city_id)
    .eq('status', 'Approved');

  if (hotelErr || !hotels || hotels.length === 0) return [];
  const hotelIds = hotels.map(h => h.id);

  // 2. Get Halls that fit the capacity
  const { data: halls, error: hallErr } = await supabase
    .from('halls')
    .select('*')
    .in('hotel_id', hotelIds)
    .gte('capacity', event.expected_pax);

  if (hallErr || !halls || halls.length === 0) return [];

  // 3. Check Venue Calendar Availability
  // Rule: Requested Start <= Existing End AND Requested End >= Existing Start
  const { data: conflicts, error: calErr } = await supabase
    .from('venue_calendar')
    .select('hall_id')
    .lte('start_date', event.end_date)
    .gte('end_date', event.start_date)
    .neq('status', 'Cancelled');

  const conflictedHallIds = new Set((conflicts || []).map(c => c.hall_id));

  // 4. Accommodation Capacity (Future integration point with hotel_accommodation_inventory)
  // For now, assume if residential_flag is true, we want hotels with some proxy score.
  
  // 5. Build Recommendations
  const recommendations: RecommendationResult[] = [];
  
  for (const hall of halls) {
    if (conflictedHallIds.has(hall.id)) continue; // Skip unavailable

    const hotel = hotels.find(h => h.id === hall.hotel_id);
    if (!hotel) continue;

    // Simple Scoring: Perfect capacity match is better, but any match is acceptable.
    // In future: Add commercials weighting here.
    const capacityScore = 100 - Math.min(((hall.capacity - event.expected_pax) / event.expected_pax) * 100, 100);
    
    recommendations.push({
      hotel: hotel as unknown as Hotel,
      hall: hall as unknown as Hall,
      score: capacityScore
    });
  }

  // Sort by highest score
  return recommendations.sort((a, b) => b.score - a.score);
}
