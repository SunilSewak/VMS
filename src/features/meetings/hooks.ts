import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MeetingRequest, Division, City, MeetingType } from './types';
import * as api from './meetingService';

// Hook to load all necessary form lookup masters
export function useMeetingMasters() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMasters() {
      try {
        setLoading(true);
        const [divs, cts, types] = await Promise.all([
          api.getDivisions(),
          api.getCities(),
          api.getMeetingTypes()
        ]);
        setDivisions(divs);
        setCities(cts);
        setMeetingTypes(types);
      } catch (err: any) {
        setError(err.message || 'Failed to load masters data');
      } finally {
        setLoading(false);
      }
    }
    loadMasters();
  }, []);

  return { divisions, cities, meetingTypes, loading, error };
}

// Hook to load meeting requests list
export function useMeetingRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MeetingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.getMeetingRequests(user);
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch meeting requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [user]);

  return { requests, loading, error, refresh };
}

// Hook to load a single request
export function useMeetingRequest(id: string | undefined) {
  const [request, setRequest] = useState<MeetingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getMeetingRequestById(id);
      setRequest(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch meeting request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [id]);

  return { request, loading, error, refresh };
}
