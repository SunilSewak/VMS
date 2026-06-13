import { useState, useEffect, useCallback, useRef } from 'react';
import type { HotelWithRelations, City, HotelCategoryOption, VenueCardViewModel, VenueSearchFilters, VenueShortlist } from './types';
import {
  searchVenues,
  getVenueById,
  fetchCities,
  fetchCategories,
  addToShortlist,
  removeFromShortlist,
  fetchShortlistedIds,
  fetchMyShortlists,
  fetchShortlistsForRequest,
} from './api';

// Hook: Fetch cities and categories for filter dropdowns
export function useVenueFilters() {
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<HotelCategoryOption[]>([]);
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
export function useVenues(filters: VenueSearchFilters, skip = false) {
  const [venues, setVenues] = useState<VenueCardViewModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (skip) return;

    let active = true;
    setLoading(true);
    setError(null);
    searchVenues(filters)
      .then((data) => {
        if (active) {
          setVenues(data);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [filters, skip]);

  const load = useCallback(() => {
    if (skip) return;
    setLoading(true);
    setError(null);
    searchVenues(filters)
      .then(setVenues)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters, skip]);

  return { venues, loading, error, reload: load };
}

// Hook: Fetch a single venue's full details
export function useVenueDetails(id: string | null) {
  const [venue, setVenue] = useState<HotelWithRelations | null>(null);
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
// Enforces max 3 venues per request limit
export function useShortlist(requestId: string | null, userId: string | null) {
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);

  const MAX_SHORTLIST = 3;

  useEffect(() => {
    if (!requestId) {
      setShortlistedIds([]);
      return;
    }
    
    // Only fetch on initial mount, not on every requestId change
    if (!initialized.current) {
      initialized.current = true;
      setLoading(true);
      fetchShortlistedIds(requestId)
        .then(setShortlistedIds)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [requestId]);

  const toggleShortlist = useCallback(async (hotelId: string) => {
    if (!requestId || !userId) return;
    
    console.log('Toggle Shortlist - Hotel ID:', hotelId);
    console.log('Toggle Shortlist - Shortlisted IDs Before:', shortlistedIds);
    
    const isCurrentlyShortlisted = shortlistedIds.includes(hotelId);
    
    // Check limit when adding
    if (!isCurrentlyShortlisted && shortlistedIds.length >= MAX_SHORTLIST) {
      throw new Error(`Maximum ${MAX_SHORTLIST} venues can be shortlisted per request`);
    }
    
    // Optimistic update
    setShortlistedIds((prev) => {
      const result = isCurrentlyShortlisted 
        ? prev.filter((id) => id !== hotelId) 
        : [...prev, hotelId];
      console.log('Toggle Shortlist - Shortlisted IDs After Optimistic Update:', result);
      return result;
    });
    
    try {
      if (isCurrentlyShortlisted) {
        await removeFromShortlist(requestId, hotelId);
        console.log('Toggle Shortlist - Removed from DB');
      } else {
        await addToShortlist(requestId, hotelId, userId);
        console.log('Toggle Shortlist - Added to DB');
      }
      console.log('Toggle Shortlist - DB Operation Success');
    } catch (e) {
      console.error('Shortlist toggle DB operation failed:', e);
      // Rollback on failure
      setShortlistedIds((prev) =>
        isCurrentlyShortlisted ? [...prev, hotelId] : prev.filter((id) => id !== hotelId)
      );
      throw e; // Re-throw to let UI handle
    }
    setLoading(false);
    console.log('Toggle Shortlist - Final Shortlisted IDs:', shortlistedIds);
  }, [requestId, userId, shortlistedIds]);

  return { 
    shortlistedIds, 
    toggleShortlist, 
    loading,
    shortlistCount: shortlistedIds.length,
    canAddMore: shortlistedIds.length < MAX_SHORTLIST,
    maxReached: shortlistedIds.length >= MAX_SHORTLIST,
    maxShortlist: MAX_SHORTLIST,
  };
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

// Hook: Fetch all shortlists for a specific meeting request
export function useRequestShortlists(requestId: string | null) {
  const [shortlists, setShortlists] = useState<VenueShortlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      setShortlists([]);
      return;
    }
    setLoading(true);
    fetchShortlistsForRequest(requestId)
      .then(setShortlists)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [requestId]);

  return { shortlists, loading, error };
}
