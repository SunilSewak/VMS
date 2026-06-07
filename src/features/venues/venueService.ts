/**
 * VenueService — Service Abstraction Router
 *
 * Uses repository pattern to route to either Supabase or Demo implementation.
 */

import { isDemoModeActive } from '../../lib/demoMode';
import * as supabaseApi from './api';
import { demoRepository } from '../../demo/demoRepository';
import type { Hotel, VenueCardViewModel, VenueSearchFilters, VenueShortlist, HotelCategory, City } from './types';

// Supabase implementation
const supabaseVenueApi = {
  fetchCities: supabaseApi.fetchCities,
  fetchCategories: supabaseApi.fetchCategories,
  getVenueById: supabaseApi.getVenueById,
  addToShortlist: supabaseApi.addToShortlist,
  removeFromShortlist: supabaseApi.removeFromShortlist,
  fetchShortlistedIds: supabaseApi.fetchShortlistedIds,
  fetchMyShortlists: supabaseApi.fetchMyShortlists,
  searchVenues: supabaseApi.searchVenues,
};

// Demo implementation wrapper for compatibility
const demoVenueApi = {
  fetchCities: () => demoRepository.getCities(),
  fetchCategories: () => demoRepository.getHotelCategories(),
  getVenueById: (id: string) => demoRepository.getHotelById(id),
  addToShortlist: demoRepository.addToShortlist,
  removeFromShortlist: demoRepository.removeFromShortlist,
  fetchShortlistedIds: demoRepository.getShortlistedIds,
  fetchMyShortlists: demoRepository.getMyShortlists,
  searchVenues: async (filters: VenueSearchFilters) => {
    const hotels = await demoRepository.getHotels();
    // Apply client-side filters
    let results = hotels
      .filter((h) => h.status === 'ACTIVE' && !h.is_deleted)
      .map((h) => ({
        id: h.id,
        hotelId: h.id,
        hotelName: h.hotel_name,
        categoryName: h.hotel_categories?.category_name ?? '—',
        cityName: h.cities?.city_name ?? '—',
        address: h.address ?? '—',
        primaryImage: null,
        largestHallCapacity: (h.halls ?? []).length > 0 ? Math.max(...(h.halls as any[]).map((hall) => hall.capacity)) : 0,
        hallCount: (h.halls ?? []).length,
        shortlisted: false,
      }));

    // Filter by city
    if (filters.cityId && filters.cityId !== 'all') {
      results = results.filter((v) => hotels.find(h => h.id === v.id)?.city_id === filters.cityId);
    }

    // Filter by category
    if (filters.categoryCode && filters.categoryCode !== 'all') {
      const categories = await demoRepository.getHotelCategories();
      const cat = categories.find(c => c.category_code === filters.categoryCode);
      if (cat) {
        results = results.filter((v) => hotels.find(h => h.id === v.id)?.category_id === cat.id);
      }
    }

    // Text search
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      results = results.filter(
        (v) =>
          v.hotelName.toLowerCase().includes(q) ||
          v.cityName.toLowerCase().includes(q) ||
          v.address.toLowerCase().includes(q)
      );
    }

    // Capacity filters
    if (filters.capacityMin !== undefined) {
      results = results.filter((v) => v.largestHallCapacity >= (filters.capacityMin ?? 0));
    }
    if (filters.capacityMax !== undefined) {
      results = results.filter((v) => v.largestHallCapacity <= (filters.capacityMax ?? Infinity));
    }

    return results.sort((a, b) => a.hotelName.localeCompare(b.hotelName));
  },
};

function getVenueApi() {
  return isDemoModeActive() ? demoVenueApi : supabaseVenueApi;
}

export const fetchCities = (): Promise<City[]> => getVenueApi().fetchCities();

export const fetchCategories = (): Promise<HotelCategory[]> => getVenueApi().fetchCategories();

export const searchVenues = (filters: VenueSearchFilters): Promise<VenueCardViewModel[]> =>
  getVenueApi().searchVenues(filters);

export const getVenueById = (id: string): Promise<Hotel> => getVenueApi().getVenueById(id);

export const addToShortlist = (requestId: string, hotelId: string, userId: string): Promise<void> =>
  getVenueApi().addToShortlist(requestId, hotelId, userId);

export const removeFromShortlist = (requestId: string, hotelId: string): Promise<void> =>
  getVenueApi().removeFromShortlist(requestId, hotelId);

export const fetchShortlistedIds = (requestId: string): Promise<string[]> =>
  getVenueApi().fetchShortlistedIds(requestId);

export const fetchMyShortlists = (userId: string): Promise<VenueShortlist[]> =>
  getVenueApi().fetchMyShortlists(userId);
