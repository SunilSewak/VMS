/**
 * MeetingService — Service Abstraction Router
 *
 * Uses repository pattern to route to either Supabase or Demo implementation.
 */

import { isDemoModeActive } from '../../lib/demoMode';
import * as supabaseApi from './api';
import { demoRepository, DemoMeetingRequest } from '../../demo/demoRepository';
import type { MeetingRequest, Division, City, MeetingType, MeetingStatus } from './types';
import type { UserProfile } from '../../types';
import type { AppRole } from '../../auth/permissions';

interface MeetingRepository {
  getDivisions: () => Promise<Division[]>;
  getCities: () => Promise<City[]>;
  getMeetingTypes: () => Promise<MeetingType[]>;
  getMeetingRequests: (userId: string, role: AppRole) => Promise<MeetingRequest[]>;
  getMeetingRequestById: (id: string) => Promise<MeetingRequest>;
  createMeetingRequest: (
    input: Omit<MeetingRequest, 'id' | 'request_number' | 'status' | 'created_at' | 'created_by'>,
    userId: string,
    status: MeetingStatus
  ) => Promise<MeetingRequest>;
  updateMeetingRequest: (
    id: string,
    input: Partial<Omit<MeetingRequest, 'id' | 'request_number' | 'created_at' | 'created_by'>>,
    status?: MeetingStatus
  ) => Promise<MeetingRequest>;
  deleteMeetingRequest: (id: string) => Promise<void>;
}

function convertDemoToMeetingRequest(data: DemoMeetingRequest): MeetingRequest {
  return {
    ...data,
    status: data.status as MeetingStatus,
  } as MeetingRequest;
}

const supabaseRepo: MeetingRepository = {
  getDivisions: supabaseApi.getDivisions,
  getCities: supabaseApi.getCities,
  getMeetingTypes: supabaseApi.getMeetingTypes,
  getMeetingRequests: (userId: string, role: AppRole) => supabaseApi.getMeetingRequests(userId, role),
  getMeetingRequestById: supabaseApi.getMeetingRequestById,
  createMeetingRequest: (input: any, userId: string, status: MeetingStatus) => supabaseApi.createMeetingRequest(input, userId, status),
  updateMeetingRequest: supabaseApi.updateMeetingRequest,
  deleteMeetingRequest: supabaseApi.deleteMeetingRequest,
};

const demoRepo: MeetingRepository = {
  getDivisions: () => demoRepository.getDivisions() as any,
  getCities: () => demoRepository.getCities() as any,
  getMeetingTypes: () => demoRepository.getMeetingTypes() as any,
  getMeetingRequests: (userId: string, role: string) => demoRepository.getMeetingRequests(userId, role),
  getMeetingRequestById: (id: string) => demoRepository.getMeetingRequestById(id),
  createMeetingRequest: (input: any, userId: string, status: string) => demoRepository.createMeetingRequest(input, userId, status),
  updateMeetingRequest: (id: string, data: any, status?: string) => demoRepository.updateMeetingRequest(id, data, status),
  deleteMeetingRequest: (id: string) => demoRepository.deleteMeetingRequest(id),
};

function getRepository(): MeetingRepository {
  return isDemoModeActive() ? demoRepo : supabaseRepo;
}

export const getDivisions = (): Promise<Division[]> => getRepository().getDivisions();

export const getCities = (): Promise<City[]> => getRepository().getCities();

export const getMeetingTypes = (): Promise<MeetingType[]> => getRepository().getMeetingTypes();

export const getMeetingRequests = async (user: UserProfile): Promise<MeetingRequest[]> => {
  const repo = getRepository();
  const data = await repo.getMeetingRequests(user.id, user.role);
  return Array.isArray(data) ? data.map(convertDemoToMeetingRequest) : data;
};

export const getMeetingRequestById = async (id: string): Promise<MeetingRequest> => {
  const repo = getRepository();
  const data = await repo.getMeetingRequestById(id);
  return convertDemoToMeetingRequest(data);
};

export const createMeetingRequest = async (
  input: Omit<MeetingRequest, 'id' | 'request_number' | 'status' | 'created_at' | 'created_by'>,
  user: UserProfile,
  status: MeetingStatus = 'DRAFT'
): Promise<MeetingRequest> => {
  const repo = getRepository();
  const data = await repo.createMeetingRequest(input, user.id, status);
  return convertDemoToMeetingRequest(data);
};

export const updateMeetingRequest = async (
  id: string,
  input: Partial<Omit<MeetingRequest, 'id' | 'request_number' | 'created_at' | 'created_by'>>,
  status?: MeetingStatus
): Promise<MeetingRequest> => {
  const repo = getRepository();
  const data = await repo.updateMeetingRequest(id, input, status);
  return convertDemoToMeetingRequest(data);
};

export const deleteMeetingRequest = (id: string): Promise<void> =>
  getRepository().deleteMeetingRequest(id);
