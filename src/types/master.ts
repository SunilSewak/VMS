export interface City {
  id: string;
  name: string;
  zone_id?: string;
  created_at?: string;
}

export interface HotelCategory {
  id: string;
  name: string;
}

export interface Hotel {
  id: string;
  hotel_name: string;
  city_id: string;
  category_id: string;
  status: 'Approved' | 'Under Evaluation' | 'Inactive' | 'Blacklisted';
  created_at?: string;
  
  // relational
  city?: City;
  category?: HotelCategory;
}

export interface Hall {
  id: string;
  hotel_id: string;
  hall_name: string;
  capacity: number;
  sq_ft?: number;
  dimensions?: string;
  floor?: string;
  boardroom_flag?: boolean;
  terrace_flag?: boolean;
  pillar_information?: string;
  created_at?: string;
}

export interface DefaultOccupancyRule {
  id: string;
  hierarchy_level: string; // e.g., 'SO', 'DM'
  occupancy_type: 'Single' | 'Double' | 'Triple' | 'Suite';
  created_at?: string;
}

export interface HotelOccupancyRule {
  id: string;
  hotel_id: string;
  hierarchy_level: string;
  occupancy_type: 'Single' | 'Double' | 'Triple' | 'Suite';
  created_at?: string;
}

export interface HotelAccommodationInventory {
  id: string;
  hotel_id: string;
  single_rooms: number;
  double_rooms: number;
  triple_rooms: number;
  suites: number;
  created_at?: string;
}
