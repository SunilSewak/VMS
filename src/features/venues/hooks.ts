import { useState, useEffect, useCallback } from 'react';
import type { VenueCardData, VenueSearchFilters, Hotel, VenueShortlist, HotelCategory, City } from './types';
import {
  searchVenues,
  getVenueById,
  fetchCities,
  fetchCategories,
  addToShortlist,
  removeFromShortlist,
  fetchShortlistedIds,
  fetchMyShortlists,
} from './api';

// Hook: Fetch cities and categories for filter dropdowns
export function useVenueFilters() {
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<HotelCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchCities(), fetchCategories()])
      .then(([c, cat]) => {
        setCities(c);
        setCategories(cat);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { cities, categories, loading, error };
}

// Hook: Search venues with filters
export function useVenues(filters: VenueSearchFilters) {
  const [venues, setVenues] = useState<VenueCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    searchVenues(filters)
      .then(setVenues)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  return { venues, loading, error, reload: load };
}

// Hook: Fetch a single venue's full details
export function useVenueDetails(id: string | null) {
  const [venue, setVenue] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getVenueById(id)
      .then(setVenue)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { venue, loading, error };
}

// Hook: Manage shortlisting for a given request
export function useShortlist(requestId: string | null, userId: string | null) {
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!requestId) return;
    fetchShortlistedIds(requestId)
      .then(setShortlistedIds)
      .catch(console.error);
  }, [requestId]);

  const toggleShortlist = useCallback(async (hotelId: string) => {
    if (!requestId || !userId) return;
    const isCurrentlyShortlisted = shortlistedIds.includes(hotelId);
    // Optimistic update
    setShortlistedIds((prev) =>
      isCurrentlyShortlisted ? prev.filter((id) => id !== hotelId) : [...prev, hotelId]
    );
    try {
      if (isCurrentlyShortlisted) {
        await removeFromShortlist(requestId, hotelId);
      } else {
        await addToShortlist(requestId, hotelId, userId);
      }
    } catch (e) {
      // Rollback on failure
      setShortlistedIds((prev) =>
        isCurrentlyShortlisted ? [...prev, hotelId] : prev.filter((id) => id !== hotelId)
      );
      console.error('Shortlist toggle failed:', e);
    }
    setLoading(false);
  }, [requestId, userId, shortlistedIds]);

  return { shortlistedIds, toggleShortlist, loading };
}

// Hook: Fetch all shortlists for the current user
export function useMyShortlists(userId: string | null) {
  const [shortlists, setShortlists] = useState<VenueShortlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchMyShortlists(userId)
      .then(setShortlists)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  return { shortlists, loading, error };
}
